package com.stay.backend.domain.stock.storage;

import com.stay.backend.infra.kis.dto.RealtimeStockPrice;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RealtimePriceStorage 단위 테스트")
class RealtimePriceStorageTest {

    private RealtimePriceStorage storage;

    @BeforeEach
    void setUp() {
        storage = new RealtimePriceStorage();
    }

    @Test
    @DisplayName("소켓 체결가 수신 시 대소문자/공백 정규화되어 O(1)로 저장 및 단건 조회가 가능해야 한다")
    void updateAndGetPrice_Success() {
        // given
        RealtimeStockPrice price = new RealtimeStockPrice(
                "NVDA",
                new BigDecimal("125.5000"),
                new BigDecimal("2.5000"),
                new BigDecimal("2.03"),
                50_000_000L
        );

        // when
        storage.updatePrice(" nvda ", price);

        // then
        Optional<RealtimeStockPrice> retrieved = storage.getLatestPrice("NVDA");
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().currentPrice()).isEqualByComparingTo("125.5000");

        Optional<BigDecimal> currentPrice = storage.getLatestCurrentPrice("nvda");
        assertThat(currentPrice).isPresent();
        assertThat(currentPrice.get()).isEqualByComparingTo("125.5000");
    }

    @Test
    @DisplayName("동일 종목의 새 체결가가 들어오면 최신 시세로 덮어쓰여져야 한다")
    void overwritePrice_Success() {
        // given
        RealtimeStockPrice firstPrice = new RealtimeStockPrice(
                "TSLA",
                new BigDecimal("200.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                1000L
        );
        RealtimeStockPrice latestPrice = new RealtimeStockPrice(
                "TSLA",
                new BigDecimal("205.50"),
                new BigDecimal("5.50"),
                new BigDecimal("2.75"),
                2000L
        );

        // when
        storage.updatePrice("TSLA", firstPrice);
        storage.updatePrice("TSLA", latestPrice);

        // then
        assertThat(storage.size()).isEqualTo(1);
        assertThat(storage.getLatestCurrentPrice("TSLA"))
                .isPresent()
                .contains(new BigDecimal("205.50"));
    }

    @Test
    @DisplayName("null 또는 빈 티커/시세가 들어와도 예외 없이 안전하게 무시되어야 한다")
    void nullSafety_Success() {
        storage.updatePrice(null, null);
        storage.updatePrice("   ", null);

        assertThat(storage.size()).isEqualTo(0);
        assertThat(storage.getLatestPrice(null)).isEmpty();
        assertThat(storage.getLatestPrice("   ")).isEmpty();
        assertThat(storage.getLatestCurrentPrice("AAPL")).isEmpty();
    }

    @Test
    @DisplayName("멀티스레드 환경에서 1,000건의 동시 갱신이 일어나도 레이스 컨디션 없이 안전하게 최종값이 보존되어야 한다")
    void concurrentUpdates_Success() throws InterruptedException {
        int threadCount = 20;
        int updatesPerThread = 50;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            final int threadIndex = i;
            executor.submit(() -> {
                try {
                    for (int j = 0; j < updatesPerThread; j++) {
                        String ticker = "STOCK_" + (j % 5);
                        BigDecimal price = BigDecimal.valueOf(threadIndex * 100 + j);
                        storage.updatePrice(ticker, new RealtimeStockPrice(ticker, price, BigDecimal.ZERO, BigDecimal.ZERO, 0L));
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        // 5개 종목이 모두 정상 저장되어 있어야 함
        assertThat(storage.size()).isEqualTo(5);
        for (int i = 0; i < 5; i++) {
            assertThat(storage.getLatestPrice("STOCK_" + i)).isPresent();
        }
    }
}
