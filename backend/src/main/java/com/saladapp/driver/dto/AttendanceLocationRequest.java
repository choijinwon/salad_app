package com.saladapp.driver.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AttendanceLocationRequest(
        @NotNull BigDecimal latitude,
        @NotNull BigDecimal longitude
) {
}
