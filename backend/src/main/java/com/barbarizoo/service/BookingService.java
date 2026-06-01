package com.barbarizoo.service;

import com.barbarizoo.api.dto.Dtos.BookingDto;
import com.barbarizoo.api.dto.Dtos.CreateBookingRequest;
import com.barbarizoo.common.BadRequestException;
import com.barbarizoo.common.NotFoundException;
import com.barbarizoo.config.AppProperties;
import com.barbarizoo.domain.Booking;
import com.barbarizoo.domain.BookingStatus;
import com.barbarizoo.domain.Customer;
import com.barbarizoo.domain.ServiceEntity;
import com.barbarizoo.domain.Staff;
import com.barbarizoo.notifications.ReminderService;
import com.barbarizoo.pricing.PricingService;
import com.barbarizoo.repo.BookingRepository;
import com.barbarizoo.repo.CustomerRepository;
import com.barbarizoo.repo.ServiceRepository;
import com.barbarizoo.repo.StaffRepository;
import com.barbarizoo.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Creates and manages bookings, enforcing no double-booking per staff member. */
@Service
public class BookingService {

    private final BookingRepository bookings;
    private final ServiceRepository services;
    private final StaffRepository staff;
    private final CustomerRepository customers;
    private final PricingService pricing;
    private final ReminderService reminders;
    private final AppProperties properties;

    public BookingService(BookingRepository bookings, ServiceRepository services, StaffRepository staff,
                          CustomerRepository customers, PricingService pricing,
                          ReminderService reminders, AppProperties properties) {
        this.bookings = bookings;
        this.services = services;
        this.staff = staff;
        this.customers = customers;
        this.pricing = pricing;
        this.reminders = reminders;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public List<BookingDto> list() {
        UUID tenant = TenantContext.get();
        List<Booking> all = bookings.findByTenantIdOrderByStartsAtDesc(tenant);
        return all.stream().map(this::toDto).toList();
    }

    @Transactional
    public BookingDto create(CreateBookingRequest req) {
        UUID tenant = TenantContext.get();

        ServiceEntity service = services.findByIdAndTenantId(req.serviceId(), tenant)
                .orElseThrow(() -> new NotFoundException("Service not found"));
        Staff member = staff.findByIdAndTenantId(req.staffId(), tenant)
                .orElseThrow(() -> new NotFoundException("Staff member not found"));

        LocalDateTime start = req.startsAt();
        LocalDateTime end = start.plusMinutes(service.getDurationMin());
        if (start.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book a slot in the past");
        }
        if (start.toLocalTime().isBefore(LocalTime.of(9, 0)) || end.toLocalTime().isAfter(LocalTime.of(18, 0))) {
            throw new BadRequestException("Slot is outside opening hours (09:00-18:00)");
        }

        boolean clash = bookings
                .findByTenantIdAndStaffIdAndStatusNotAndStartsAtBetween(
                        tenant, member.getId(), BookingStatus.CANCELLED,
                        start.toLocalDate().atStartOfDay(), start.toLocalDate().atTime(LocalTime.MAX))
                .stream()
                .anyMatch(b -> start.isBefore(b.getEndsAt()) && end.isAfter(b.getStartsAt()));
        if (clash) {
            throw new BadRequestException("This slot is no longer available");
        }

        Customer customer = resolveCustomer(tenant, req);

        // With deposits required, the slot is held as PENDING until the deposit
        // is paid (then promoted to CONFIRMED); otherwise it is confirmed now.
        boolean requireDeposit = properties.getPayments().isRequireDeposit();

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setTenantId(tenant);
        booking.setCustomerId(customer.getId());
        booking.setStaffId(member.getId());
        booking.setServiceId(service.getId());
        booking.setStartsAt(start);
        booking.setEndsAt(end);
        booking.setStatus(requireDeposit ? BookingStatus.PENDING : BookingStatus.CONFIRMED);
        booking.setPriceCents(pricing.priceForSlot(service, start));
        booking.setSource("WEB");
        bookings.save(booking);

        if (!requireDeposit) {
            reminders.scheduleForBooking(booking);
        }

        return toDto(booking);
    }

    @Transactional
    public BookingDto updateStatus(UUID bookingId, BookingStatus status) {
        UUID tenant = TenantContext.get();
        Booking booking = bookings.findByIdAndTenantId(bookingId, tenant)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        booking.setStatus(status);
        return toDto(booking);
    }

    private Customer resolveCustomer(UUID tenant, CreateBookingRequest req) {
        Optional<Customer> existing = StringUtils.hasText(req.customerEmail())
                ? customers.findByTenantIdAndEmailIgnoreCase(tenant, req.customerEmail())
                : Optional.empty();
        if (existing.isPresent()) {
            return existing.get();
        }
        Customer c = new Customer();
        c.setId(UUID.randomUUID());
        c.setTenantId(tenant);
        c.setName(req.customerName());
        c.setEmail(req.customerEmail());
        c.setPhone(req.customerPhone());
        c.setMarketingConsent(req.marketingConsent());
        return customers.save(c);
    }

    private BookingDto toDto(Booking b) {
        UUID tenant = b.getTenantId();
        String serviceName = services.findByIdAndTenantId(b.getServiceId(), tenant)
                .map(ServiceEntity::getName).orElse("");
        String staffName = staff.findByIdAndTenantId(b.getStaffId(), tenant)
                .map(Staff::getDisplayName).orElse("");
        String customerName = customers.findById(b.getCustomerId())
                .map(Customer::getName).orElse("");
        return new BookingDto(
                b.getId(), b.getServiceId(), serviceName, b.getStaffId(), staffName,
                customerName, b.getStartsAt(), b.getEndsAt(), b.getStatus(),
                b.getPriceCents(), b.getSource());
    }
}
