package com.barbarizoo.notifications;

import com.barbarizoo.domain.Booking;
import com.barbarizoo.domain.Customer;
import com.barbarizoo.domain.Reminder;
import com.barbarizoo.domain.ServiceEntity;
import com.barbarizoo.domain.Staff;
import com.barbarizoo.repo.CustomerRepository;
import com.barbarizoo.repo.ReminderRepository;
import com.barbarizoo.repo.ServiceRepository;
import com.barbarizoo.repo.StaffRepository;
import com.barbarizoo.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** Schedules booking notifications and dispatches the ones that are due. */
@Service
public class ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderService.class);
    private static final DateTimeFormatter WHEN = DateTimeFormatter.ofPattern("dd.MM. HH:mm");

    private final ReminderRepository reminders;
    private final CustomerRepository customers;
    private final ServiceRepository services;
    private final StaffRepository staff;
    private final NotificationSender sender;

    public ReminderService(ReminderRepository reminders, CustomerRepository customers,
                           ServiceRepository services, StaffRepository staff, NotificationSender sender) {
        this.reminders = reminders;
        this.customers = customers;
        this.services = services;
        this.staff = staff;
        this.sender = sender;
    }

    /** Schedules a confirmation (now) plus 24h and 2h pre-visit reminders for a booking. */
    @Transactional
    public void scheduleForBooking(Booking booking) {
        Customer customer = customers.findById(booking.getCustomerId()).orElse(null);
        if (customer == null) {
            return;
        }
        String channel;
        String recipient;
        if (StringUtils.hasText(customer.getEmail())) {
            channel = "EMAIL";
            recipient = customer.getEmail();
        } else if (StringUtils.hasText(customer.getPhone())) {
            channel = "WHATSAPP";
            recipient = customer.getPhone();
        } else {
            return; // no contact details, nothing to schedule
        }

        String serviceName = services.findById(booking.getServiceId())
                .map(ServiceEntity::getName).orElse("your appointment");
        String staffName = staff.findById(booking.getStaffId())
                .map(Staff::getDisplayName).orElse("our team");
        String when = booking.getStartsAt().format(WHEN);

        List<Reminder> batch = new ArrayList<>();
        batch.add(build(booking, "CONFIRMATION", channel, recipient, LocalDateTime.now(),
                "Booking confirmed: %s with %s on %s. See you soon!".formatted(serviceName, staffName, when)));

        LocalDateTime h24 = booking.getStartsAt().minusHours(24);
        if (h24.isAfter(LocalDateTime.now())) {
            batch.add(build(booking, "REMINDER_24H", channel, recipient, h24,
                    "Reminder: %s with %s tomorrow at %s.".formatted(serviceName, staffName, when)));
        }
        LocalDateTime h2 = booking.getStartsAt().minusHours(2);
        if (h2.isAfter(LocalDateTime.now())) {
            batch.add(build(booking, "REMINDER_2H", channel, recipient, h2,
                    "See you in 2 hours: %s with %s at %s.".formatted(serviceName, staffName, when)));
        }
        reminders.saveAll(batch);
    }

    private Reminder build(Booking booking, String type, String channel, String recipient,
                           LocalDateTime sendAt, String body) {
        Reminder r = new Reminder();
        r.setId(UUID.randomUUID());
        r.setTenantId(booking.getTenantId());
        r.setBookingId(booking.getId());
        r.setType(type);
        r.setChannel(channel);
        r.setRecipient(recipient);
        r.setBody(body);
        r.setSendAt(sendAt);
        r.setStatus("SCHEDULED");
        return r;
    }

    /** Sends all reminders whose send time has passed. Returns the number sent. */
    @Transactional
    public int dispatchDue() {
        List<Reminder> due = reminders.findByStatusAndSendAtLessThanEqual("SCHEDULED", LocalDateTime.now());
        int sent = 0;
        for (Reminder r : due) {
            boolean ok = sender.send(r.getChannel(), r.getRecipient(), r.getBody());
            r.setStatus(ok ? "SENT" : "FAILED");
            r.setSentAt(LocalDateTime.now());
            if (ok) {
                sent++;
            }
        }
        if (!due.isEmpty()) {
            log.info("Dispatched {} of {} due reminders", sent, due.size());
        }
        return sent;
    }

    @Transactional(readOnly = true)
    public List<Reminder> listForTenant() {
        return reminders.findByTenantIdOrderBySendAtDesc(TenantContext.get());
    }
}
