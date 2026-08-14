package com.stay.backend.domain.stock.repository;

import com.stay.backend.domain.stock.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByTicker(String ticker);

    // 1. 거래량/거래대금순 정렬
    List<Stock> findAllByOrderByVolumeDesc();

    // 2. 급등/상승률순 정렬
    List<Stock> findAllByOrderByChangeRateDesc();

    // 3. 급락/하락률순 정렬
    List<Stock> findAllByOrderByChangeRateAsc();

    // 4. 시가총액순 정렬
    List<Stock> findAllByOrderByMarketCapDesc();

    // 5. 종목명 또는 티커 검색 (대소문자 무시)
    List<Stock> findByNameContainingIgnoreCaseOrTickerContainingIgnoreCase(String name, String ticker);
}
