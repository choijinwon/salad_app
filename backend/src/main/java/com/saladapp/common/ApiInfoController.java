package com.saladapp.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class ApiInfoController {

    @GetMapping("/api")
    ApiResponse<Map<String, Object>> getApiInfo() {
        return ApiResponse.ok(Map.of(
                "service", "salad-delivery-backend",
                "status", "running",
                "endpoints", List.of(
                        "/actuator/health",
                        "/api/customers",
                        "/api/deliveries/today",
                        "/api/drivers",
                        "/api/zones",
                        "/api/admin/dashboard/today"
                )
        ));
    }
}
