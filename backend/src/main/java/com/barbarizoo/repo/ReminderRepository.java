package com.barbarizoo.repo;

import com.barbarizoo.domain.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReminderRepository extends JpaRepository<Reminder, UUID> {

    List<Reminder> findByStatusAndSendAtLessThanEqual(String status, LocalDateTime cutoff);

    List<Reminder> findByTenantIdOrderBySendAtDesc(UUID tenantId);
}
