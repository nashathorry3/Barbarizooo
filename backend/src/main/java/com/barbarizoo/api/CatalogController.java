package com.barbarizoo.api;

import com.barbarizoo.api.dto.Dtos.ServiceDto;
import com.barbarizoo.api.dto.Dtos.StaffDto;
import com.barbarizoo.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
