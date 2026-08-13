package com.stay.backend.global.config.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth/callback}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long userId = userDetails.getUserId();
        String email = userDetails.getEmail();

        // 1. JWT Access Token & Refresh Token 생성
        String accessToken = tokenProvider.createAccessToken(userId, email);
        String refreshToken = tokenProvider.createRefreshToken(userId);

        // 2. Refresh Token은 최강 보안 HttpOnly 쿠키로 세팅
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // HTTPS 적용 시 true로 전환
                .path("/")
                .maxAge(14 * 24 * 60 * 60) // 14일
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", refreshTokenCookie.toString());

        // 3. 프론트엔드 리다이렉트 URL 생성
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", accessToken)
                .build().toUriString();

        log.info("Google OAuth2 소셜 로그인 성공: userId={}, redirectUrl={}", userId, targetUrl);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
