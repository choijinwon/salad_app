package com.saladapp.address;

import com.saladapp.address.dto.AddressSearchResponse;
import com.saladapp.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressSearchService addressSearchService;

    public AddressController(AddressSearchService addressSearchService) {
        this.addressSearchService = addressSearchService;
    }

    @GetMapping("/search")
    ApiResponse<AddressSearchResponse> searchAddresses(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(addressSearchService.search(keyword, page, size));
    }
}
