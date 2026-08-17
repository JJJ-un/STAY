package com.stay.backend.domain.journal.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 주식일지 매매 유형 Enum
 */
@Getter
@RequiredArgsConstructor
public enum TradeType {
    BUY("매수"),
    SELL("매도"),
    REBALANCE("리밸런싱"),
    WATCH("관망/분석");

    private final String description;
}
