package com.saladapp.admin.account;

import com.saladapp.admin.account.dto.AdminAccountRequest;
import com.saladapp.admin.account.dto.AdminAccountResponse;
import com.saladapp.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/accounts")
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    public AdminAccountController(AdminAccountService adminAccountService) {
        this.adminAccountService = adminAccountService;
    }

    @GetMapping
    ApiResponse<List<AdminAccountResponse>> getAdmins() {
        return ApiResponse.ok(adminAccountService.getAdmins());
    }

    @PostMapping
    ApiResponse<AdminAccountResponse> createAdmin(@Valid @RequestBody AdminAccountRequest request) {
        return ApiResponse.ok(adminAccountService.createAdmin(request), "관리자 계정이 등록되었습니다.");
    }
}
