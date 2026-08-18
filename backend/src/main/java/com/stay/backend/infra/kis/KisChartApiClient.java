package com.stay.backend.infra.kis;

import com.stay.backend.domain.stock.entity.StockExchange;
import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import com.stay.backend.infra.kis.dto.KisChartPriceResponse;
import com.stay.backend.infra.kis.dto.KisMinuteChartPriceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * 한국투자증권 해외주식 기간별(일/주/월봉) 및 분봉 차트 시세 통신 클라이언트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KisChartApiClient {

    private final KisAuthManager kisAuthManager;
    private final RestClient restClient = RestClient.create();

    @Value("${koreainvest.api.key}")
    private String appKey;

    @Value("${koreainvest.api.secret}")
    private String appSecret;

    @Value("${koreainvest.api.url}")
    private String baseUrl;

    // 기간별 시세 TR ID
    private static final String TR_ID_PERIOD_CHART = "HHDFS76240000";
    // 분봉 시세 TR ID
    private static final String TR_ID_MINUTE_CHART = "HHDFS76950200";

    /**
     * 해외주식 기간별 시세 (일/주/월봉) 조회
     * @param ticker 종목 티커 (예: NVDA, TSM)
     * @param gubnCode 기간구분 (0: 일봉, 1: 주봉, 2: 월봉)
     * @param baseDate 조회 기준일자 (YYYYMMDD, 빈 문자열이면 오늘)
     */
    public KisChartPriceResponse fetchPeriodChart(String ticker, String gubnCode, String baseDate) {
        String exchangeCode = getExchangeCode(ticker);
        String token = kisAuthManager.getAccessToken();
        String targetBaseDate = (baseDate != null) ? baseDate : "";

        try {
            return restClient.get()
                    .uri(baseUrl + "/uapi/overseas-price/v1/quotations/inquire-daily-chartprice" +
                            "?AUTH=" +
                            "&EXCD=" + exchangeCode +
                            "&SYMB=" + ticker +
                            "&GUBN=" + gubnCode +
                            "&BYMD=" + targetBaseDate +
                            "&MODP=1")
                    .header("content-type", "application/json; charset=utf-8")
                    .header("authorization", "Bearer " + token)
                    .header("appkey", appKey)
                    .header("appsecret", appSecret)
                    .header("tr_id", TR_ID_PERIOD_CHART)
                    .header("custtype", "P")
                    .retrieve()
                    .body(KisChartPriceResponse.class);
        } catch (Exception e) {
            log.error("한투 기간별 차트 API 호출 실패: ticker={}, gubn={}, error={}", ticker, gubnCode, e.getMessage());
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 해외주식 분봉 시세 (5분봉) 조회
     * @param ticker 종목 티커 (예: NVDA, TSM)
     * @param minuteInterval 분 단위 (예: 5)
     */
    public KisMinuteChartPriceResponse fetchMinuteChart(String ticker, int minuteInterval) {
        String exchangeCode = getExchangeCode(ticker);
        String token = kisAuthManager.getAccessToken();

        try {
            return restClient.get()
                    .uri(baseUrl + "/uapi/overseas-price/v1/quotations/inquire-time-itemchartprice" +
                            "?AUTH=" +
                            "&EXCD=" + exchangeCode +
                            "&SYMB=" + ticker +
                            "&NMIN=" + minuteInterval +
                            "&PINC=1" +
                            "&NEXT=" +
                            "&NREC=120" +
                            "&FILL=" +
                            "&KEYB=")
                    .header("content-type", "application/json; charset=utf-8")
                    .header("authorization", "Bearer " + token)
                    .header("appkey", appKey)
                    .header("appsecret", appSecret)
                    .header("tr_id", TR_ID_MINUTE_CHART)
                    .header("custtype", "P")
                    .retrieve()
                    .body(KisMinuteChartPriceResponse.class);
        } catch (Exception e) {
            log.error("한투 분봉 차트 API 호출 실패: ticker={}, interval={}, error={}", ticker, minuteInterval, e.getMessage());
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 종목 티커에 따른 거래소 코드 매핑
     */
    private String getExchangeCode(String ticker) {
        return StockExchange.fromTicker(ticker);
    }
}
