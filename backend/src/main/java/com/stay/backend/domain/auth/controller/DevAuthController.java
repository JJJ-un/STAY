package com.stay.backend.domain.auth.controller;

import com.stay.backend.domain.user.entity.AuthProvider;
import com.stay.backend.domain.user.entity.User;
import com.stay.backend.domain.user.repository.UserRepository;
import com.stay.backend.global.common.response.ApiResponse;
import com.stay.backend.global.config.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Dev Auth", description = "로컬 개발 및 테스트용 간편 인증 API")
@Profile("!prod")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class DevAuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Operation(
            summary = "로컬 개발용 1초 테스트 토큰 발급",
            description = "구글 콘솔 설정 없이도 로컬에서 1번 테스트 유저로 즉시 로그인할 수 있는 실제 JWT AccessToken을 발급합니다."
    )
    @PostMapping("/dev-token")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDevToken() {
        // 1. 테스트 유저가 DB에 없으면 안전하게 자동 생성 (이메일 기준 조회)
        User testUser = userRepository.findByEmail("test@stay.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .email("test@stay.com")
                        .nickname("STAY 테스터")
                        .profileImageUrl("")
                        .authProvider(AuthProvider.GOOGLE)
                        .providerId("dev_test_provider_1")
                        .build()));

        // 2. 해당 유저 ID에 대한 진짜 유효한 JWT AccessToken 및 RefreshToken 생성
        String accessToken = jwtTokenProvider.createAccessToken(testUser.getId(), testUser.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(testUser.getId());

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "tokenType", "Bearer"
        )));
    }
}
