package com.stay.backend.infra.kis;

import com.stay.backend.domain.stock.entity.StockExchange;
import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import com.stay.backend.infra.kis.dto.KisOverseasPriceResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * 한국투자증권 해외주식 시세 조회 HTTP REST 클라이언트
 */
@Slf4j
@Component
public class KisApiClient {

    private static final String TR_ID_OVERSEAS_PRICE = "HHDFS76200200";

    private final KisAuthManager authManager;
    private final RestClient restClient;

    public KisApiClient(
            KisAuthManager authManager,
            @Value("${koreainvest.api.url}") String baseUrl
    ) {
        this.authManager = authManager;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    /**
     * 해외 반도체 종목 현재가 상세 시세 조회
     *
     * @param ticker 종목 심볼 (예: NVDA, AMD, TSM)
     * @return 한투 해외주식 현재가 상세 응답 DTO
     */
    public KisOverseasPriceResponse getOverseasStockPrice(String ticker) {
        String exchangeCode = getExchangeCodeByTicker(ticker);
        String accessToken = authManager.getAccessToken();

        try {
            log.debug("한투 해외주식 현재가 조회 요청: ticker={}, excd={}", ticker, exchangeCode);

            KisOverseasPriceResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/uapi/overseas-price/v1/quotations/price-detail")
                            .queryParam("AUTH", "")
                            .queryParam("EXCD", exchangeCode)
                            .queryParam("SYMB", ticker.toUpperCase())
                            .build())
                    .headers(headers -> {
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        headers.setBearerAuth(accessToken);
                        headers.set("appkey", authManager.getAppKey());
                        headers.set("appsecret", authManager.getAppSecret());
                        headers.set("tr_id", TR_ID_OVERSEAS_PRICE);
                    })
                    .retrieve()
                    .body(KisOverseasPriceResponse.class);

            if (response == null || !response.isSuccess() || response.output() == null) {
                log.warn("한투 시세 조회 응답 오류: ticker={}, msgCd={}, msg={}",
                        ticker,
                        response != null ? response.msgCd() : "NULL",
                        response != null ? response.msg1() : "No response");
            }

            return response;
        } catch (Exception e) {
            log.error("한투 해외주식 시세 조회 HTTP 통신 실패: ticker={}, error={}", ticker, e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 종목 티커에 따른 거래소 코드(EXCD) 반환
     */
    public String getExchangeCodeByTicker(String ticker) {
        return StockExchange.fromTicker(ticker);
    }
}
