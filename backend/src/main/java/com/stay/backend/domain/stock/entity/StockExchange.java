package com.stay.backend.domain.stock.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.List;

/**
 * 해외 주식 거래소 코드 및 티커 매핑 Enum
 */
@Getter
@RequiredArgsConstructor
public enum StockExchange {
    NAS("나스닥", "NAS", List.of("NVDA", "AMD", "AVGO", "INTC", "ASML", "QCOM", "MU")),
    NYS("뉴욕증권거래소", "NYS", List.of("TSM"));

    private final String description;
    private final String code;
    private final List<String> tickers;

    /**
     * 종목 티커에 해당하는 한투 거래소 코드 반환 (기본값: NAS)
     */
    public static String fromTicker(String ticker) {
        if (ticker == null || ticker.isBlank()) {
            return NAS.getCode();
        }

        String normalizedTicker = ticker.trim().toUpperCase();

        return Arrays.stream(values())
                .filter(exchange -> exchange.getTickers().contains(normalizedTicker))
                .map(StockExchange::getCode)
                .findFirst()
                .orElse(NAS.getCode());
    }
}
