package com.saladapp.admin.naver;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NaverOrderRepository extends JpaRepository<NaverOrder, UUID> {

    List<NaverOrder> findAllByOrderByCreatedAtDesc();

    Optional<NaverOrder> findByNaverOrderNo(String naverOrderNo);
}
