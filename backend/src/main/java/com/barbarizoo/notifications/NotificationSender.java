package com.barbarizoo.notifications;

/**
 * Channel-agnostic notification dispatch. The simulated implementation logs
 * messages; real WhatsApp (Business API) / Email (SES, Postmark) / SMS senders
 * implement the same contract and are selected per channel later.
 */
public interface NotificationSender {

    /** @return true if the message was accepted by the (simulated) provider. */
    boolean send(String channel, String recipient, String body);
}
