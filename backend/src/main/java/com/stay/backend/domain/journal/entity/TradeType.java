package com.stay.backend.domain.journal.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 주식일지 매매 유형 Enum (BUY: 매수, SELL: 매도, WATCH: 관망/분석)
 */
@Getter
@RequiredArgsConstructor
public enum TradeType {
    BUY("매수"),
    SELL("매도"),
    WATCH("관망/분석");

    private final String description;
}
