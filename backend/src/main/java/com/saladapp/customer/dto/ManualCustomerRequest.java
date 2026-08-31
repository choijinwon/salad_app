package com.saladapp.customer.dto;

import com.saladapp.common.enums.OrderSource;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record ManualCustomerRequest(
        @NotBlank String name,
        @NotBlank String phone,
        @NotNull LocalDate birthdate,
        @NotBlank String address,
        @NotNull UUID zoneId,
        @NotNull OrderSource orderSource,
        @Min(1) @Max(20) int totalCount,
        @Min(0) int unitPrice,
        @NotNull LocalDate startDate
) {
}
