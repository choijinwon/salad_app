package com.saladapp.zone.dto;

import jakarta.validation.constraints.NotBlank;

public record ZoneRequest(
        @NotBlank String zoneName,
        String description
) {
}
