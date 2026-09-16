package com.saladapp.admin.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SaladProductRepository extends JpaRepository<SaladProduct, UUID> {

    List<SaladProduct> findAllByOrderByDisplayOrderAscNameAsc();
}
