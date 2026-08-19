package com.stay.backend.infra.kis;

import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import com.stay.backend.infra.kis.dto.KisTokenResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Component
public class KisAuthManager {

    private final String appKey;
    private final String appSecret;
    private final String baseUrl;
    private final RestClient restClient;

    private String cachedAccessToken;
    private LocalDateTime tokenExpiresAt;

    public KisAuthManager(
            @Value("${koreainvest.api.key}") String appKey,
            @Value("${koreainvest.api.secret}") String appSecret,
            @Value("${koreainvest.api.url}") String baseUrl
    ) {
        this.appKey = appKey;
        this.appSecret = appSecret;
        this.baseUrl = baseUrl;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public synchronized String getAccessToken() {
        // 토큰이 유효한 경우 캐시된 토큰 반환 (만료 10분 전까지 재사용)
        if (cachedAccessToken != null && tokenExpiresAt != null &&
                LocalDateTime.now().plusMinutes(10).isBefore(tokenExpiresAt)) {
            return cachedAccessToken;
        }

        // 만료되었거나 처음 요청 시 신규 토큰 발급
        issueNewToken();
        return cachedAccessToken;
    }

    private void issueNewToken() {
        try {
            log.info("한국투자증권(KIS) 실제 OAuth 접근 토큰 발급 요청: baseUrl={}", baseUrl);

            Map<String, String> requestBody = Map.of(
                    "grant_type", "client_credentials",
                    "appkey", appKey,
                    "appsecret", appSecret
            );

            KisTokenResponse response = restClient.post()
                    .uri("/oauth2/tokenP")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(KisTokenResponse.class);

            if (response == null || response.accessToken() == null) {
                log.error("KIS 토큰 발급 응답이 비어있습니다.");
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            this.cachedAccessToken = response.accessToken();
            long expiresIn = (response.expiresIn() != null) ? response.expiresIn() : 86400L;
            this.tokenExpiresAt = LocalDateTime.now().plusSeconds(expiresIn);

            log.info("KIS 실제 OAuth 접근 토큰 발급 성공! (만료 예정: {})", tokenExpiresAt);
        } catch (Exception e) {
            log.error("KIS OAuth 토큰 발급 실패: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    public String getAppKey() {
        return appKey;
    }

    public String getAppSecret() {
        return appSecret;
    }

    /**
     * 한국투자증권 실시간 웹소켓(WebSocket) 전용 접속키(Approval Key) 발급
     */
    public String getWebSocketApprovalKey() {
        try {
            log.info("한국투자증권(KIS) 실시간 웹소켓 Approval Key 발급 요청");

            Map<String, String> requestBody = Map.of(
                    "grant_type", "client_credentials",
                    "appkey", appKey,
                    "secretkey", appSecret
            );

            com.stay.backend.infra.kis.dto.KisApprovalResponse response = restClient.post()
                    .uri("/oauth2/Approval")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(com.stay.backend.infra.kis.dto.KisApprovalResponse.class);

            if (response == null || response.approvalKey() == null) {
                log.error("KIS 웹소켓 Approval Key 응답이 비어있습니다.");
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            log.info("KIS 웹소켓 Approval Key 발급 성공");
            return response.approvalKey();
        } catch (Exception e) {
            log.error("KIS 웹소켓 Approval Key 발급 실패: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
