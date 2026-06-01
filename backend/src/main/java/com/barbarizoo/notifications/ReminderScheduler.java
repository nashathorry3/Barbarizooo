package com.barbarizoo.notifications;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Periodically dispatches due reminders (confirmation + 24h/2h pre-visit). */
@Component
public class ReminderScheduler {

    private final ReminderService reminderService;

    public ReminderScheduler(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @Scheduled(fixedDelayString = "PT30S", initialDelayString = "PT10S")
    public void dispatch() {
        reminderService.dispatchDue();
    }
}
