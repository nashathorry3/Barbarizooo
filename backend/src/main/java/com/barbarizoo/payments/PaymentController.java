package com.barbarizoo.payments;

import com.barbarizoo.payments.PaymentDtos.CreateDepositRequest;
import com.barbarizoo.payments.PaymentDtos.DepositIntentResponse;
import com.barbarizoo.payments.PaymentDtos.PaymentDto;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService payments;

    public PaymentController(PaymentService payments) {
        this.payments = payments;
    }

    /** Public: customer starts a deposit payment for their booking. */
    @PostMapping("/deposit")
    public DepositIntentResponse createDeposit(@Valid @RequestBody CreateDepositRequest request) {
        return payments.createDeposit(request.bookingId());
    }

    /** Public: confirm the deposit (in production this is a PSP webhook). */
    @PostMapping("/deposit/{providerRef}/confirm")
    public PaymentDto confirmDeposit(@PathVariable String providerRef) {
        return payments.confirmDeposit(providerRef);
    }

    /** Dashboard: list payments — owners and managers. */
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public List<PaymentDto> list() {
        return payments.list();
    }
}
