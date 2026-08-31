package com.saladapp.customer;

import com.saladapp.common.ApiResponse;
import com.saladapp.customer.dto.CustomerRegistrationResponse;
import com.saladapp.customer.dto.CustomerResponse;
import com.saladapp.customer.dto.ManualCustomerRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    ApiResponse<List<CustomerResponse>> getCustomers() {
        return ApiResponse.ok(customerService.getCustomers());
    }

    @PostMapping("/manual")
    ApiResponse<CustomerRegistrationResponse> createManualCustomer(@Valid @RequestBody ManualCustomerRequest request) {
        return ApiResponse.ok(customerService.createManualCustomer(request), "고객이 등록되었습니다.");
    }
}
