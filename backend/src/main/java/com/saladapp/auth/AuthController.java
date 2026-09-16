package com.saladapp.auth;

import com.saladapp.auth.dto.AuthSessionResponse;
import com.saladapp.auth.dto.CustomerLoginRequest;
import com.saladapp.auth.dto.CustomerSignupRequest;
import com.saladapp.auth.dto.DriverLoginRequest;
import com.saladapp.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/customer/signup")
    ApiResponse<AuthSessionResponse> signupCustomer(@Valid @RequestBody CustomerSignupRequest request) {
        return ApiResponse.ok(authService.signupCustomer(request), "회원가입이 완료되었습니다.");
    }

    @PostMapping("/customer/login")
    ApiResponse<AuthSessionResponse> loginCustomer(@Valid @RequestBody CustomerLoginRequest request) {
        return ApiResponse.ok(authService.loginCustomer(request), "로그인되었습니다.");
    }

    @PostMapping("/driver/login")
    ApiResponse<AuthSessionResponse> loginDriver(@Valid @RequestBody DriverLoginRequest request) {
        return ApiResponse.ok(authService.loginDriver(request), "로그인되었습니다.");
    }
}
