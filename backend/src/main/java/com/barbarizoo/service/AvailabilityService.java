package com.barbarizoo.service;

import com.barbarizoo.api.dto.Dtos.AvailabilityResponse;
import com.barbarizoo.api.dto.Dtos.SlotDto;
import com.barbarizoo.common.NotFoundException;
import com.barbarizoo.domain.Booking;
import com.barbarizoo.domain.BookingStatus;
import com.barbarizoo.domain.ServiceEntity;
import com.barbarizoo.pricing.PricingService;
import com.barbarizoo.repo.BookingRepository;
import com.barbarizoo.repo.ServiceRepository;
import com.barbarizoo.repo.StaffRepository;
import com.barbarizoo.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** Computes free booking slots for a service + staff member on a given day. */
@Service
@Transactional(readOnly = true)
public class AvailabilityService {

    // Simplified fixed opening hours (matches seed location). A later iteration
    // reads per-staff working_hours from the database.
    private static final LocalTime OPENING = LocalTime.of(9, 0);
    private static final LocalTime CLOSING = LocalTime.of(18, 0);
    private static final int SLOT_STEP_MIN = 15;

    private final ServiceRepository services;
    private final StaffRepository staff;
    private final BookingRepository bookings;
    private final PricingService pricing;

    public AvailabilityService(ServiceRepository services, StaffRepository staff,
                               BookingRepository bookings, PricingService pricing) {
        this.services = services;
        this.staff = staff;
        this.bookings = bookings;
        this.pricing = pricing;
    }

    public AvailabilityResponse availability(UUID serviceId, UUID staffId, LocalDate date) {
        UUID tenant = TenantContext.get();

        ServiceEntity service = services.findByIdAndTenantId(serviceId, tenant)
                .orElseThrow(() -> new NotFoundException("Service not found"));
        staff.findByIdAndTenantId(staffId, tenant)
                .orElseThrow(() -> new NotFoundException("Staff member not found"));

        int duration = service.getDurationMin();
        List<Booking> existing = bookings.findByTenantIdAndStaffIdAndStatusNotAndStartsAtBetween(
                tenant, staffId, BookingStatus.CANCELLED,
                date.atStartOfDay(), date.atTime(LocalTime.MAX));

        List<SlotDto> slots = new ArrayList<>();
        LocalDateTime cursor = LocalDateTime.of(date, OPENING);
        LocalDateTime lastStart = LocalDateTime.of(date, CLOSING).minusMinutes(duration);
        LocalDateTime now = LocalDateTime.now();

        while (!cursor.isAfter(lastStart)) {
            LocalDateTime slotEnd = cursor.plusMinutes(duration);
            if (cursor.isAfter(now) && isFree(cursor, slotEnd, existing)) {
                slots.add(new SlotDto(cursor, slotEnd, pricing.priceForSlot(service, cursor)));
            }
            cursor = cursor.plusMinutes(SLOT_STEP_MIN);
        }

        return new AvailabilityResponse(date, serviceId, staffId, duration, slots);
    }

    private boolean isFree(LocalDateTime start, LocalDateTime end, List<Booking> existing) {
        for (Booking b : existing) {
            // overlap if start < existingEnd AND end > existingStart
            if (start.isBefore(b.getEndsAt()) && end.isAfter(b.getStartsAt())) {
                return false;
            }
        }
        return true;
    }
}
