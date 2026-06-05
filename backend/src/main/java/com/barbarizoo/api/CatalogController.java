package com.barbarizoo.api;

import com.barbarizoo.api.dto.Dtos.CreateServiceRequest;
import com.barbarizoo.api.dto.Dtos.CreateStaffRequest;
import com.barbarizoo.api.dto.Dtos.ServiceDto;
import com.barbarizoo.api.dto.Dtos.StaffDto;
import com.barbarizoo.api.dto.Dtos.UpdateServiceStaffRequest;
import com.barbarizoo.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {

    private final CatalogService catalog;

    public CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/services")
    public List<ServiceDto> services() {
        return catalog.listServices();
    }

    @GetMapping("/staff")
    public List<StaffDto> staff() {
        return catalog.listStaff();
    }

    /** Create a service — owners and managers only. */
    @PostMapping("/services")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ServiceDto createService(@Valid @RequestBody CreateServiceRequest request) {
        return catalog.createService(request);
    }

    /** Deactivate a service — owners and managers only. */
    @DeleteMapping("/services/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public void deactivateService(@PathVariable UUID id) {
        catalog.deactivateService(id);
    }

    /** Create a staff member — owners and managers only. */
    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public StaffDto createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return catalog.createStaff(request);
    }

    /** Deactivate a staff member — owners and managers only. */
    @DeleteMapping("/staff/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public void deactivateStaff(@PathVariable UUID id) {
        catalog.deactivateStaff(id);
    }

    /** Replace the staff assigned to a service — owners and managers only. */
    @PutMapping("/services/{id}/staff")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ServiceDto updateServiceStaff(@PathVariable UUID id, @RequestBody UpdateServiceStaffRequest request) {
        return catalog.updateServiceStaff(id, request);
    }
}
