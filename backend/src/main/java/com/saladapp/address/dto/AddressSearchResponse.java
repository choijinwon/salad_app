package com.saladapp.address.dto;

import java.util.List;

public record AddressSearchResponse(
        String source,
        int totalCount,
        int currentPage,
        int countPerPage,
        List<AddressSearchItem> addresses
) {
}
