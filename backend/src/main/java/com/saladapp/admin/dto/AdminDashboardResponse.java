package com.saladapp.admin.dto;

import java.time.LocalDate;

public record AdminDashboardResponse(
        LocalDate date,
        int totalCount,
        int completedCount,
        int inTransitCount,
        int pendingCount,
        int bagReturnedCount
) {
}
