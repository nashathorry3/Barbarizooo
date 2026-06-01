package com.barbarizoo.notifications;

import com.barbarizoo.domain.Reminder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reminders")
public class ReminderController {

    private final ReminderService reminders;

    public ReminderController(ReminderService reminders) {
        this.reminders = reminders;
    }

    public record ReminderDto(
            UUID id, UUID bookingId, String type, String channel, String recipient,
            String body, LocalDateTime sendAt, String status, LocalDateTime sentAt) {
        static ReminderDto of(Reminder r) {
            return new ReminderDto(r.getId(), r.getBookingId(), r.getType(), r.getChannel(),
                    r.getRecipient(), r.getBody(), r.getSendAt(), r.getStatus(), r.getSentAt());
        }
    }

    /** List scheduled/sent reminders — owners and managers. */
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public List<ReminderDto> list() {
        return reminders.listForTenant().stream().map(ReminderDto::of).toList();
    }

    /** Manually dispatch due reminders (also runs automatically on a schedule). */
    @PostMapping("/dispatch")
    @PreAuthorize("hasRole('OWNER')")
    public Map<String, Integer> dispatch() {
        return Map.of("sent", reminders.dispatchDue());
    }
}
