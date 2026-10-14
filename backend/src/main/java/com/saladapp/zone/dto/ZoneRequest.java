package com.saladapp.zone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ZoneRequest(
        @NotBlank @Size(max = 80) String zoneName,
        String description,
        List<List<Double>> boundary,
        @Pattern(regexp = "#[0-9a-fA-F]{6}") String color
) {
}
