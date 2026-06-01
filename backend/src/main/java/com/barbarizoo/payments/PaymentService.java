package com.barbarizoo.payments;

import com.barbarizoo.common.BadRequestException;
import com.barbarizoo.common.NotFoundException;
import com.barbarizoo.config.AppProperties;
import com.barbarizoo.domain.Booking;
import com.barbarizoo.domain.Payment;
import com.barbarizoo.domain.PaymentStatus;
import com.barbarizoo.payments.PaymentDtos.DepositIntentResponse;
import com.barbarizoo.payments.PaymentDtos.PaymentDto;
import com.barbarizoo.repo.BookingRepository;
import com.barbarizoo.repo.PaymentRepository;
import com.barbarizoo.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Creates and confirms booking deposits via the configured payment gateway. */
@Service
public class PaymentService {

    private final PaymentRepository payments;
    private final BookingRepository bookings;
    private final PaymentGateway gateway;
    private final AppProperties properties;

    public PaymentService(PaymentRepository payments, BookingRepository bookings,
                          PaymentGateway gateway, AppProperties properties) {
        this.payments = payments;
        this.bookings = bookings;
        this.gateway = gateway;
        this.properties = properties;
    }

    /** Computes the deposit amount for a price using the configured percentage. */
    public int depositAmount(int priceCents) {
        return Math.round(priceCents * properties.getPayments().getDepositPercent() / 100f);
    }

    @Transactional
    public DepositIntentResponse createDeposit(UUID bookingId) {
        UUID tenant = TenantContext.get();
        Booking booking = bookings.findByIdAndTenantId(bookingId, tenant)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        int amount = depositAmount(booking.getPriceCents());
        if (amount <= 0) {
            throw new BadRequestException("No deposit is required for this booking");
        }

        PaymentGateway.Intent intent = gateway.createIntent(
                amount, "EUR", "Deposit for booking " + bookingId);

        Payment payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setTenantId(tenant);
        payment.setBookingId(booking.getId());
        payment.setCustomerId(booking.getCustomerId());
        payment.setProvider(gateway.name());
        payment.setType("DEPOSIT");
        payment.setAmountCents(amount);
        payment.setCurrency("EUR");
        payment.setStatus(PaymentStatus.REQUIRES_PAYMENT);
        payment.setProviderRef(intent.providerRef());
        payments.save(payment);

        return new DepositIntentResponse(
                payment.getId(), intent.providerRef(), intent.clientSecret(),
                amount, "EUR", payment.getStatus());
    }

    @Transactional
    public PaymentDto confirmDeposit(String providerRef) {
        Payment payment = payments.findByProviderRef(providerRef)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
            return toDto(payment); // idempotent
        }
        PaymentGateway.Result result = gateway.confirm(providerRef);
        payment.setStatus(result.succeeded() ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED);
        return toDto(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> list() {
        UUID tenant = TenantContext.get();
        return payments.findByTenantIdOrderByCreatedAtDesc(tenant).stream()
                .map(this::toDto)
                .toList();
    }

    private PaymentDto toDto(Payment p) {
        return new PaymentDto(
                p.getId(), p.getBookingId(), p.getProvider(), p.getType(),
                p.getAmountCents(), p.getCurrency(), p.getStatus(),
                p.getProviderRef(), p.getCreatedAt());
    }
}
