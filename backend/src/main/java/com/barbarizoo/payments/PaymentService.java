package com.barbarizoo.payments;

import com.barbarizoo.common.BadRequestException;
import com.barbarizoo.common.NotFoundException;
import com.barbarizoo.config.AppProperties;
import com.barbarizoo.domain.Booking;
import com.barbarizoo.domain.BookingStatus;
import com.barbarizoo.domain.Payment;
import com.barbarizoo.domain.PaymentStatus;
import com.barbarizoo.notifications.ReminderService;
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
    private final ReminderService reminders;

    public PaymentService(PaymentRepository payments, BookingRepository bookings,
                          PaymentGateway gateway, AppProperties properties, ReminderService reminders) {
        this.payments = payments;
        this.bookings = bookings;
        this.gateway = gateway;
        this.properties = properties;
        this.reminders = reminders;
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
        if (result.succeeded()) {
            promoteBooking(payment);
        }
        return toDto(payment);
    }

    /**
     * Marks a payment succeeded from an out-of-band provider event (e.g. a Stripe
     * webhook), then promotes the booking. Idempotent.
     */
    @Transactional
    public void markSucceededByRef(String providerRef) {
        payments.findByProviderRef(providerRef).ifPresent(payment -> {
            if (payment.getStatus() != PaymentStatus.SUCCEEDED) {
                payment.setStatus(PaymentStatus.SUCCEEDED);
                promoteBooking(payment);
            }
        });
    }

    /**
     * A successful deposit promotes a held (PENDING) booking to CONFIRMED and
     * triggers its confirmation + pre-visit reminders.
     */
    private void promoteBooking(Payment payment) {
        bookings.findById(payment.getBookingId()).ifPresent(booking -> {
            if (booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.CONFIRMED);
                reminders.scheduleForBooking(booking);
            }
        });
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
