package com.saladapp.admin.product;

import com.saladapp.admin.product.dto.ProductRequest;
import com.saladapp.admin.product.dto.ProductResponse;
import com.saladapp.common.BusinessRuleException;
import com.saladapp.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class SaladProductService {

    private static final Set<String> STATUSES = Set.of("ACTIVE", "SOLD_OUT", "HIDDEN");

    private final SaladProductRepository productRepository;

    public SaladProductService(SaladProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProducts() {
        return productRepository.findAllByOrderByDisplayOrderAscNameAsc()
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        SaladProduct product = new SaladProduct(
                UUID.randomUUID(),
                request.name().trim(),
                request.price() == null ? 0 : request.price(),
                normalizeStatus(request.status()),
                request.description(),
                request.displayOrder() == null ? 0 : request.displayOrder(),
                request.visible() == null || request.visible()
        );
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(UUID productId, ProductRequest request) {
        SaladProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다."));
        product.update(
                request.name().trim(),
                request.price() == null ? product.getPrice() : request.price(),
                normalizeStatus(request.status()),
                request.description(),
                request.displayOrder() == null ? product.getDisplayOrder() : request.displayOrder(),
                request.visible() == null ? product.isVisible() : request.visible()
        );
        return ProductResponse.from(product);
    }

    private String normalizeStatus(String status) {
        String normalized = status == null || status.isBlank() ? "ACTIVE" : status.trim().toUpperCase();
        if (!STATUSES.contains(normalized)) {
            throw new BusinessRuleException("상품 상태가 올바르지 않습니다.");
        }
        return normalized;
    }
}
