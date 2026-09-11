package com.stay.backend.domain.journal.service;

import com.stay.backend.domain.journal.dto.JournalCreateRequest;
import com.stay.backend.domain.journal.dto.JournalDetailResponse;
import com.stay.backend.domain.journal.entity.CurrencyType;
import com.stay.backend.domain.journal.entity.EmotionType;
import com.stay.backend.domain.journal.entity.TradeType;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.domain.stock.entity.Stock;
import com.stay.backend.domain.stock.repository.StockRepository;
import com.stay.backend.domain.user.entity.AuthProvider;
import com.stay.backend.domain.user.entity.User;
import com.stay.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
@DisplayName("JournalService 일지 작성 시 주가 패턴 DB 저장 및 복원 검증 테스트")
class JournalServiceTest {

    @Autowired
    private JournalService journalService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockRepository stockRepository;

    @Test
    @DisplayName("일지 작성 시 넘겨준 주가 배열(5개)이 DB에 저장되고 상세 조회 시 100% 동일하게 복원된다")
    void shouldSaveAndRestorePricePatternWhenCreatingJournal() {
        // 1. Given (준비: 고유한 테스트용 유저 생성)
        long uniqueTime = System.currentTimeMillis();
        User user = userRepository.save(User.builder()
                .email("test-journal-" + uniqueTime + "@stay.com")
                .nickname("테스터" + uniqueTime)
                .authProvider(AuthProvider.GOOGLE)
                .providerId("google_" + uniqueTime)
                .build());

        // 종목 조회 또는 생성
        Stock stock = stockRepository.findByTicker("NVDA")
                .orElseGet(() -> stockRepository.save(Stock.builder()
                        .name("엔비디아")
                        .ticker("NVDA")
                        .currentPrice(new BigDecimal("128.50"))
                        .changePrice(new BigDecimal("2.50"))
                        .changeRate(new BigDecimal("1.98"))
                        .volume(1000000L)
                        .marketCap(3000000000000L)
                        .build()));

        // 유저가 일지 작성 시 차트에서 선택한 5개 캔들 주가 배열
        List<BigDecimal> selectedPattern = List.of(
                new BigDecimal("128.50"),
                new BigDecimal("126.30"),
                new BigDecimal("124.10"),
                new BigDecimal("125.80"),
                new BigDecimal("127.90")
        );

        JournalCreateRequest request = new JournalCreateRequest(
                stock.getId(),
                TradeType.BUY,
                LocalDateTime.now(),
                CurrencyType.USD,
                new BigDecimal("128.50"),
                new BigDecimal("10"),
                new BigDecimal("1285.00"),
                new BigDecimal("150.00"),
                new BigDecimal("120.00"),
                null,
                EmotionType.PANIC,
                "과거 급락 후 반등 경험",
                "절대 뇌동매도 금지! 150달러까지 STAY!",
                ChartRangeType.MONTH_3,
                selectedPattern, // 👈 5개 주가 배열 전달
                true,            // 👈 추적 활성화
                null
        );

        // 2. When (실행: 일지 작성 서비스 호출)
        Long savedJournalId = journalService.createJournal(user.getId(), request);

        // 3. Then (검증: DB에서 조회하여 확인)
        JournalDetailResponse detail = journalService.getJournalDetail(savedJournalId, user.getId());

        // ✅ 1. 일지 ID 생성 확인
        assertThat(savedJournalId).isNotNull();

        // ✅ 2. 주가 패턴 배열 5개가 DB에 완벽히 저장되고 복원되었는지 확인
        assertThat(detail.pricePattern()).isNotNull();
        assertThat(detail.pricePattern()).hasSize(5);
        assertThat(detail.pricePattern().get(0)).isEqualByComparingTo("128.50");
        assertThat(detail.pricePattern().get(1)).isEqualByComparingTo("126.30");
        assertThat(detail.pricePattern().get(2)).isEqualByComparingTo("124.10");
        assertThat(detail.pricePattern().get(3)).isEqualByComparingTo("125.80");
        assertThat(detail.pricePattern().get(4)).isEqualByComparingTo("127.90");

        // ✅ 3. STAY 다짐 메시지가 온전히 보존되었는지 확인
        assertThat(detail.stayMessage()).isEqualTo("절대 뇌동매도 금지! 150달러까지 STAY!");
    }

    @Test
    @DisplayName("일지 수정 시 isTracking 추적 토글을 false로 끄면 DB에 정상 반영된다")
    void shouldUpdateTrackingToggleToFalseWhenUpdatingJournal() {
        // 1. Given: isTracking = true 일지 생성
        long uniqueTime = System.currentTimeMillis();
        User user = userRepository.save(User.builder()
                .email("test-toggle-" + uniqueTime + "@stay.com")
                .nickname("토글러" + uniqueTime)
                .authProvider(AuthProvider.GOOGLE)
                .providerId("google_toggle_" + uniqueTime)
                .build());

        Stock stock = stockRepository.findByTicker("NVDA")
                .orElseGet(() -> stockRepository.save(Stock.builder()
                        .name("엔비디아")
                        .ticker("NVDA")
                        .currentPrice(new BigDecimal("128.50"))
                        .changePrice(new BigDecimal("2.50"))
                        .changeRate(new BigDecimal("1.98"))
                        .volume(1000000L)
                        .marketCap(1000000000000L)
                        .build()));

        Long journalId = journalService.createJournal(user.getId(), new JournalCreateRequest(
                stock.getId(),
                TradeType.BUY,
                LocalDateTime.now(),
                CurrencyType.USD,
                new BigDecimal("128.50"),
                new BigDecimal("10"),
                new BigDecimal("1285.00"),
                new BigDecimal("150.00"),
                new BigDecimal("120.00"),
                null,
                EmotionType.CONFIDENCE,
                "매매 근거",
                "STAY!",
                ChartRangeType.MONTH_3,
                List.of(new BigDecimal("128.50"), new BigDecimal("126.00"), new BigDecimal("125.00"), new BigDecimal("127.00"), new BigDecimal("129.00")),
                true,
                null
        ));

        // 2. When: isTracking = false 로 수정 요청
        com.stay.backend.domain.journal.dto.JournalUpdateRequest updateRequest = new com.stay.backend.domain.journal.dto.JournalUpdateRequest(
                TradeType.BUY,
                LocalDateTime.now(),
                CurrencyType.USD,
                new BigDecimal("128.50"),
                new BigDecimal("10"),
                new BigDecimal("1285.00"),
                new BigDecimal("160.00"),
                new BigDecimal("115.00"),
                null,
                EmotionType.CONFIDENCE,
                "목표가 상향 및 매매 종료",
                "STAY 완료!",
                true,
                false // 👈 추적 토글 OFF!
        );

        journalService.updateJournal(journalId, user.getId(), updateRequest);

        // 3. Then: getJournalDetail 조회 시 isTracking이 false로 갱신되었는지 확인
        JournalDetailResponse detail = journalService.getJournalDetail(journalId, user.getId());
        assertThat(detail.isTracking()).isFalse();
        assertThat(detail.targetPrice()).isEqualByComparingTo("160.00");
    }
}
