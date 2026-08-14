package com.stay.backend.domain.stock.service;

import com.stay.backend.domain.stock.dto.StockResponse;
import com.stay.backend.domain.stock.entity.Stock;
import com.stay.backend.domain.stock.entity.StockSortType;
import com.stay.backend.domain.stock.repository.StockRepository;
import com.stay.backend.global.common.exception.CustomException;
import com.stay.backend.global.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockService {

    private final StockRepository stockRepository;

    /**
     * 메인 화면 해외 반도체 종목 목록 조회 (탭 정렬 및 검색어 필터링 지원)
     */
    public List<StockResponse> getStocks(StockSortType sortType, String keyword) {
        List<Stock> stocks;

        // 1. 검색어가 있는 경우 검색 수행
        if (keyword != null && !keyword.trim().isEmpty()) {
            String searchKeyword = keyword.trim();
            stocks = stockRepository.findByNameContainingIgnoreCaseOrTickerContainingIgnoreCase(searchKeyword, searchKeyword);
        } else {
            // 2. 정렬 조건에 따른 조회 (기본값: 거래량순)
            StockSortType finalSortType = (sortType != null) ? sortType : StockSortType.VOLUME;
            stocks = switch (finalSortType) {
                case VOLUME -> stockRepository.findAllByOrderByVolumeDesc();
                case GAINERS -> stockRepository.findAllByOrderByChangeRateDesc();
                case LOSERS -> stockRepository.findAllByOrderByChangeRateAsc();
                case MARKET_CAP -> stockRepository.findAllByOrderByMarketCapDesc();
            };
        }

        return stocks.stream()
                .map(StockResponse::from)
                .toList();
    }

    /**
     * 종목 단건 상세 조회 (ID 기준)
     */
    public StockResponse getStockDetail(Long stockId) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));
        return StockResponse.from(stock);
    }

    /**
     * 종목 단건 상세 조회 (티커 기준)
     */
    public StockResponse getStockByTicker(String ticker) {
        Stock stock = stockRepository.findByTicker(ticker)
                .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));
        return StockResponse.from(stock);
    }
}
