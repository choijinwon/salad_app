package com.saladapp.admin.product;

import com.saladapp.admin.product.dto.ProductRequest;
import com.saladapp.admin.product.dto.ProductResponse;
import com.saladapp.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
public class SaladProductController {

    private final SaladProductService productService;

    public SaladProductController(SaladProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    ApiResponse<List<ProductResponse>> getProducts() {
        return ApiResponse.ok(productService.getProducts());
    }

    @PostMapping
    ApiResponse<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ApiResponse.ok(productService.createProduct(request), "상품이 등록되었습니다.");
    }

    @PatchMapping("/{productId}")
    ApiResponse<ProductResponse> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody ProductRequest request
    ) {
        return ApiResponse.ok(productService.updateProduct(productId, request), "상품이 수정되었습니다.");
    }
}
