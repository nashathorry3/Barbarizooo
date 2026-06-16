package com.barbarizoo.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/** Dev/test sender: logs the message and reports success when a recipient exists. */
@Component
@ConditionalOnProperty(name = "barbarizoo.notifications.provider", havingValue = "simulated", matchIfMissing = true)
public class SimulatedNotificationSender implements NotificationSender {

    private static final Logger log = LoggerFactory.getLogger(SimulatedNotificationSender.class);

    @Override
    public boolean send(String channel, String recipient, String body) {
        if (!StringUtils.hasText(recipient)) {
            return false;
        }
        log.info("[notify:{}] -> {} : {}", channel, recipient, body);
        return true;
    }
}
