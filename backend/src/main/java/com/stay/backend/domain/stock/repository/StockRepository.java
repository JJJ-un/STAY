package com.stay.backend.domain.stock.repository;

import com.stay.backend.domain.stock.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByTicker(String ticker);

    boolean existsByTicker(String ticker);

    List<Stock> findAllByOrderByVolumeDesc();

    List<Stock> findAllByOrderByChangeRateDesc();

    List<Stock> findAllByOrderByChangeRateAsc();

    List<Stock> findAllByOrderByMarketCapDesc();
}
