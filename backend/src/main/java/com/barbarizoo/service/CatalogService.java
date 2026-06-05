package com.barbarizoo.service;

import com.barbarizoo.api.dto.Dtos.CreateServiceRequest;
import com.barbarizoo.api.dto.Dtos.CreateStaffRequest;
import com.barbarizoo.api.dto.Dtos.ServiceDto;
import com.barbarizoo.api.dto.Dtos.StaffDto;
import com.barbarizoo.api.dto.Dtos.UpdateServiceRequest;
import com.barbarizoo.api.dto.Dtos.UpdateServiceStaffRequest;
import com.barbarizoo.common.NotFoundException;
import com.barbarizoo.domain.ServiceEntity;
import com.barbarizoo.domain.Staff;
import com.barbarizoo.repo.ServiceRepository;
import com.barbarizoo.repo.StaffRepository;
import com.barbarizoo.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Read access to the service catalog and staff for the current tenant. */
@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final ServiceRepository services;
    private final StaffRepository staff;

    public CatalogService(ServiceRepository services, StaffRepository staff) {
        this.services = services;
        this.staff = staff;
    }

    public List<ServiceDto> listServices() {
        UUID tenant = TenantContext.get();
        return services.findByTenantIdAndActiveTrueOrderByName(tenant).stream()
                .map(this::toDto)
                .toList();
    }

    public List<StaffDto> listStaff() {
        UUID tenant = TenantContext.get();
        return staff.findByTenantIdAndActiveTrueOrderByDisplayName(tenant).stream()
                .map(st -> new StaffDto(
                        st.getId(), st.getDisplayName(), st.getRole(),
                        st.getSeniorityLevel(), st.getColor()))
                .toList();
    }

    @Transactional
    public ServiceDto createService(CreateServiceRequest req) {
        UUID tenant = TenantContext.get();
        ServiceEntity entity = new ServiceEntity();
        entity.setId(UUID.randomUUID());
        entity.setTenantId(tenant);
        entity.setName(req.name());
        entity.setCategory(req.category());
        entity.setDurationMin(req.durationMin());
        entity.setBasePriceCents(req.basePriceCents());
        entity.setVatRate(req.vatRate() != null ? req.vatRate() : 19);
        entity.setActive(true);
        entity.setStaff(resolveStaff(tenant, req.staffIds()));
        services.save(entity);
        return toDto(entity);
    }

    /** Edit a service's details (e.g. the owner-set price). Null fields are kept. */
    @Transactional
    public ServiceDto updateService(UUID id, UpdateServiceRequest req) {
        UUID tenant = TenantContext.get();
        ServiceEntity entity = services.findByIdAndTenantId(id, tenant)
                .orElseThrow(() -> new NotFoundException("Service not found"));
        if (req.name() != null && !req.name().isBlank()) {
            entity.setName(req.name());
        }
        if (req.category() != null && !req.category().isBlank()) {
            entity.setCategory(req.category());
        }
        if (req.durationMin() != null) {
            entity.setDurationMin(req.durationMin());
        }
        if (req.basePriceCents() != null) {
            entity.setBasePriceCents(req.basePriceCents());
        }
        if (req.vatRate() != null) {
            entity.setVatRate(req.vatRate());
        }
        return toDto(entity);
    }

    @Transactional
    public void deactivateService(UUID id) {
        UUID tenant = TenantContext.get();
        ServiceEntity entity = services.findByIdAndTenantId(id, tenant)
                .orElseThrow(() -> new NotFoundException("Service not found"));
        entity.setActive(false);
    }

    @Transactional
    public StaffDto createStaff(CreateStaffRequest req) {
        UUID tenant = TenantContext.get();
        Staff entity = new Staff();
        entity.setId(UUID.randomUUID());
        entity.setTenantId(tenant);
        entity.setDisplayName(req.displayName());
        entity.setRole(req.role() != null ? req.role() : "STYLIST");
        entity.setSeniorityLevel(req.seniorityLevel() != null ? req.seniorityLevel() : "MID");
        entity.setColor(req.color() != null ? req.color() : "#6366f1");
        entity.setActive(true);
        staff.save(entity);
        return new StaffDto(entity.getId(), entity.getDisplayName(), entity.getRole(),
                entity.getSeniorityLevel(), entity.getColor());
    }

    @Transactional
    public void deactivateStaff(UUID id) {
        UUID tenant = TenantContext.get();
        Staff entity = staff.findByIdAndTenantId(id, tenant)
                .orElseThrow(() -> new NotFoundException("Staff member not found"));
        entity.setActive(false);
    }

    @Transactional
    public ServiceDto updateServiceStaff(UUID serviceId, UpdateServiceStaffRequest req) {
        UUID tenant = TenantContext.get();
        ServiceEntity entity = services.findByIdAndTenantId(serviceId, tenant)
                .orElseThrow(() -> new NotFoundException("Service not found"));
        entity.setStaff(resolveStaff(tenant, req.staffIds()));
        return toDto(entity);
    }

    private Set<Staff> resolveStaff(UUID tenant, List<UUID> staffIds) {
        Set<Staff> result = new HashSet<>();
        if (staffIds == null) {
            return result;
        }
        for (UUID staffId : staffIds) {
            staff.findByIdAndTenantId(staffId, tenant).ifPresent(result::add);
        }
        return result;
    }

    private ServiceDto toDto(ServiceEntity s) {
        return new ServiceDto(
                s.getId(), s.getName(), s.getCategory(), s.getDurationMin(),
                s.getBasePriceCents(), s.getVatRate(),
                s.getStaff().stream().map(Staff::getId).toList());
    }
}
