package com.barbarizoo.notifications;

import com.barbarizoo.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Real notification sender. EMAIL messages go out over SMTP (any provider:
 * Brevo, Postmark, Gmail, …) configured via {@code spring.mail.*}. Channels we
 * don't yet integrate (e.g. WhatsApp) fall back to logging so dispatch still
 * succeeds. Activated with {@code barbarizoo.notifications.provider=email}.
 */
@Component
@ConditionalOnProperty(name = "barbarizoo.notifications.provider", havingValue = "email")
public class EmailNotificationSender implements NotificationSender {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationSender.class);

    private final JavaMailSender mail;
    private final AppProperties properties;

    public EmailNotificationSender(JavaMailSender mail, AppProperties properties) {
        this.mail = mail;
        this.properties = properties;
    }

    @Override
    public boolean send(String channel, String recipient, String body) {
        if (!StringUtils.hasText(recipient)) {
            return false;
        }
        if (!"EMAIL".equalsIgnoreCase(channel)) {
            // WhatsApp/SMS not wired yet — log so dispatch isn't stuck retrying.
            log.info("[notify:{} not integrated] -> {} : {}", channel, recipient, body);
            return true;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(properties.getNotifications().getFromEmail());
            msg.setTo(recipient);
            msg.setSubject(subjectFor(body));
            msg.setText(body + "\n\n— " + properties.getNotifications().getFromName());
            mail.send(msg);
            return true;
        } catch (Exception e) {
            log.warn("Email send to {} failed: {}", recipient, e.getMessage());
            return false;
        }
    }

    /** A friendly subject inferred from the message type. */
    private String subjectFor(String body) {
        String name = properties.getNotifications().getFromName();
        if (body.startsWith("Booking confirmed")) {
            return name + " — booking confirmed";
        }
        return name + " — appointment reminder";
    }
}
