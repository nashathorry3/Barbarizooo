package com.barbarizoo.repo;

import com.barbarizoo.domain.Booking;
import com.barbarizoo.domain.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByTenantIdOrderByStartsAtDesc(UUID tenantId);

    Optional<Booking> findByIdAndTenantId(UUID id, UUID tenantId);

    /** Active bookings for a staff member on a given day, used to compute availability. */
    List<Booking> findByTenantIdAndStaffIdAndStatusNotAndStartsAtBetween(
            UUID tenantId, UUID staffId, BookingStatus excludedStatus,
            LocalDateTime dayStart, LocalDateTime dayEnd);
}
