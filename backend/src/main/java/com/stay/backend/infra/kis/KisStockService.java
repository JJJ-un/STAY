package com.stay.backend.infra.kis;

import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import com.stay.backend.infra.kis.dto.KisOverseasPriceResponse;
import com.stay.backend.infra.kis.dto.RealtimeStockPrice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 한국투자증권 100% 실제 주가 시세 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KisStockService {

    private final KisApiClient kisApiClient;

    /**
     * 한국투자증권 서버로부터 100% 실제 해외 반도체 종목 실시간 시세를 조회합니다.
     *
     * @param ticker 종목 티커 (예: NVDA, AMD, TSM 등)
     * @return 정제된 실시간 시세 DTO
     */
    public RealtimeStockPrice getRealtimePrice(String ticker) {
        if (ticker == null || ticker.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        String normalizedTicker = ticker.trim().toUpperCase();
        log.debug("한투 실제 시세 조회 시작: ticker={}", normalizedTicker);

        KisOverseasPriceResponse response = kisApiClient.getOverseasStockPrice(normalizedTicker);

        if (response == null || !response.isSuccess() || response.output() == null) {
            log.error("한투 시세 조회 응답 실패: ticker={}, msgCd={}, msg={}",
                    normalizedTicker,
                    response != null ? response.msgCd() : "NULL",
                    response != null ? response.msg1() : "응답 없음");
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        KisOverseasPriceResponse.KisOverseasPriceOutput output = response.output();

        RealtimeStockPrice realtimePrice = new RealtimeStockPrice(
                normalizedTicker,
                output.getLastAsBigDecimal(),
                output.getDiffAsBigDecimal(),
                output.getRateAsBigDecimal(),
                output.getTvolAsLong()
        );

        log.info("한투 실제 시세 수신 완료: ticker={}, 현재가={}, 변동={}, 등락률={}%",
                normalizedTicker,
                realtimePrice.currentPrice(),
                realtimePrice.changePrice(),
                realtimePrice.changeRate());

        return realtimePrice;
    }
}
