package com.barbarizoo.api.dto;

import com.barbarizoo.domain.BookingStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Request/response payloads for the booking-core API, grouped for brevity. */
public final class Dtos {

    private Dtos() {
    }

    public record ServiceDto(
            UUID id, String name, String category, int durationMin,
            int basePriceCents, int vatRate, List<UUID> staffIds) {
    }

    public record CreateServiceRequest(
            @NotBlank String name,
            @NotBlank String category,
            @Positive int durationMin,
            @Min(0) int basePriceCents,
            Integer vatRate,
            List<UUID> staffIds) {
    }

    public record StaffDto(
            UUID id, String displayName, String role, String seniorityLevel, String color) {
    }

    public record CreateStaffRequest(
            @NotBlank String displayName,
            String role,
            String seniorityLevel,
            String color) {
    }

    public record UpdateServiceStaffRequest(List<UUID> staffIds) {
    }

    /** Edit an existing service. Null fields are left unchanged. */
    public record UpdateServiceRequest(
            String name,
            String category,
            @Positive Integer durationMin,
            @Min(0) Integer basePriceCents,
            Integer vatRate) {
    }

    /** A bookable slot at the salon's fixed price. */
    public record SlotDto(LocalDateTime start, LocalDateTime end, int priceCents) {
    }

    public record AvailabilityResponse(
            LocalDate date, UUID serviceId, UUID staffId, int durationMin, List<SlotDto> slots) {
    }

    public record CreateBookingRequest(
            @NotNull UUID serviceId,
            @NotNull UUID staffId,
            @NotNull LocalDateTime startsAt,
            @NotBlank String customerName,
            @Email String customerEmail,
            String customerPhone,
            boolean marketingConsent) {
    }

    public record BookingDto(
            UUID id, UUID serviceId, String serviceName, UUID staffId, String staffName,
            String customerName, LocalDateTime startsAt, LocalDateTime endsAt,
            BookingStatus status, int priceCents, String source) {
    }

    public record UpdateBookingStatusRequest(@NotNull BookingStatus status) {
    }
}
