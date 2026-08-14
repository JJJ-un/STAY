package com.stay.backend.domain.stock.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StockSortType {
    VOLUME("거래량순"),
    GAINERS("상승률순"),
    LOSERS("하락률순"),
    MARKET_CAP("시가총액순");

    private final String description;
}
