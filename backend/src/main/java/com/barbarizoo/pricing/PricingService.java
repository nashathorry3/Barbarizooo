package com.barbarizoo.pricing;

import com.barbarizoo.domain.ServiceEntity;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;

/**
 * Dynamic Pricing Engine — rules-based "lite" version (see docs/06 & docs/02).
 * Transparent, owner-friendly rules that also generate the data needed to train
 * the ML version later. Adjusts a service's base price by slot demand signals.
 */
@Service
public class PricingService {

    private static final double PEAK_SURCHARGE = 0.15;      // +15% at busy times
    private static final double OFFPEAK_DISCOUNT = 0.10;    // -10% at quiet times

    /** Computes the final price (in cents) for a service at a given slot. */
    public int priceForSlot(ServiceEntity service, LocalDateTime slotStart) {
        double factor = 1.0 + demandAdjustment(slotStart);
        return (int) Math.round(service.getBasePriceCents() * factor);
    }

    /** Returns the price adjustment fraction (e.g. +0.15, -0.10, or 0). */
    private double demandAdjustment(LocalDateTime slot) {
        DayOfWeek day = slot.getDayOfWeek();
        int hour = slot.getHour();

        boolean weekend = day == DayOfWeek.FRIDAY || day == DayOfWeek.SATURDAY;
        boolean lateAfternoon = hour >= 16;            // typical rush after work
        boolean weekdayMorning = !weekend && hour < 12; // typically quiet

        if (weekend || lateAfternoon) {
            return PEAK_SURCHARGE;
        }
        if (weekdayMorning) {
            return -OFFPEAK_DISCOUNT;
        }
        return 0.0;
    }
}
