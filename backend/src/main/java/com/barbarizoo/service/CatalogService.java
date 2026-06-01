package com.barbarizoo.service;

import com.barbarizoo.api.dto.Dtos.ServiceDto;
import com.barbarizoo.api.dto.Dtos.StaffDto;
import com.barbarizoo.domain.Staff;
import com.barbarizoo.repo.ServiceRepository;
import com.barbarizoo.repo.StaffRepository;
import com.barbarizoo.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
                .map(s -> new ServiceDto(
                        s.getId(), s.getName(), s.getCategory(), s.getDurationMin(),
                        s.getBasePriceCents(), s.getVatRate(),
                        s.getStaff().stream().map(Staff::getId).toList()))
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
}
