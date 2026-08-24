package com.stay.backend.domain.stock.service;

import com.stay.backend.domain.journal.entity.Journal;
import com.stay.backend.domain.journal.repository.JournalRepository;
import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.domain.stock.entity.Stock;
import com.stay.backend.domain.stock.service.StockTrackingService.TrackingAlertResult;
import com.stay.backend.domain.user.entity.AuthProvider;
import com.stay.backend.domain.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@Slf4j
@ExtendWith(MockitoExtension.class)
@DisplayName("StockTrackingService 실시간 주가 흐름 감시 스케줄러 단위 테스트")
class StockTrackingServiceTest {

    @InjectMocks
    private StockTrackingService stockTrackingService;

    @Mock
    private JournalRepository journalRepository;

    @Mock
    private StockChartService stockChartService;

    @Spy
    private PatternMatchingEngine patternMatchingEngine = new PatternMatchingEngine();

    private User testUser;
    private Stock testStock;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("test@stay.com")
                .nickname("테스터")
                .authProvider(AuthProvider.GOOGLE)
                .providerId("google_12345")
                .build();
        ReflectionTestUtils.setField(testUser, "id", 1L);

        testStock = createStock(1L, "엔비디아", "NVDA", 128.50);
    }

    @Test
    @DisplayName("과거 패턴과 현재 실시간 차트가 85% 이상 일치하면 PATTERN_MATCHED 알림을 발생시킨다")
    void shouldTriggerPatternMatchedAlertWhenSimilarityExceedsThreshold() {
        // 1. Given (준비: 일지에 5개 과거 급락 캔들 저장)
        Journal journal = Journal.builder()
                .user(testUser)
                .stock(testStock)
                .stayMessage("과거 급락 패턴 재현! 뇌동매도 금지!")
                .chartRangeType(ChartRangeType.MONTH_3)
                .pricePattern("[100.0, 95.0, 90.0, 88.0, 94.0]")
                .isTracking(true)
                .similarityThreshold(0.85)
                .build();
        ReflectionTestUtils.setField(journal, "id", 100L);

        given(journalRepository.findAllActiveTrackingJournals()).willReturn(List.of(journal));

        // 실시간 한투 API에서 가져온 현재 차트 (99% 유사 파동)
        List<StockChartResponse> mockChart = createMockChart(100.0, 96.0, 91.0, 89.0, 95.0);
        given(stockChartService.getChartData(eq("NVDA"), eq(ChartRangeType.MONTH_3), any())).willReturn(mockChart);

        // 2. When (실행: 스케줄러 1회 감시 가동!)
        List<TrackingAlertResult> alerts = stockTrackingService.checkAllActiveTrackingJournals();

        // 3. Then (검증)
        assertThat(alerts).hasSize(1);
        TrackingAlertResult result = alerts.get(0);
        assertThat(result.ticker()).isEqualTo("NVDA");
        assertThat(result.isPatternMatched()).isTrue();
        assertThat(result.similarity()).isGreaterThanOrEqualTo(0.85);
        assertThat(result.similarity()).isCloseTo(0.991, within(0.01));
        assertThat(result.stayMessage()).isEqualTo("과거 급락 패턴 재현! 뇌동매도 금지!");

        log.info("📊 [패턴 대조 감시 테스트] ticker={}, similarity={}% (임계치: 85%), 알림트리거={}",
                result.ticker(), String.format("%.2f", result.similarity() * 100), result.isPatternMatched());
    }

    @Test
    @DisplayName("현재가가 목표가 이상으로 도달하면 TARGET_PRICE_HIT 알림을 발생시킨다")
    void shouldTriggerTargetPriceHitAlertWhenPriceReachesTarget() {
        // 1. Given (목표가 $150.00 설정)
        Journal journal = Journal.builder()
                .user(testUser)
                .stock(testStock)
                .stayMessage("목표가 도달 시 분할 익절!")
                .chartRangeType(ChartRangeType.DAY_1)
                .pricePattern("[120.0, 125.0, 130.0, 140.0, 150.0]")
                .targetPrice(bd(150.0))
                .isTracking(true)
                .similarityThreshold(0.85)
                .build();
        ReflectionTestUtils.setField(journal, "id", 101L);

        given(journalRepository.findAllActiveTrackingJournals()).willReturn(List.of(journal));

        // 실시간 차트 마지막 종가가 $152.00로 목표가 돌파
        List<StockChartResponse> mockChart = createMockChart(120.0, 125.0, 130.0, 140.0, 152.0);
        given(stockChartService.getChartData(eq("NVDA"), eq(ChartRangeType.DAY_1), any())).willReturn(mockChart);

        // 2. When
        List<TrackingAlertResult> alerts = stockTrackingService.checkAllActiveTrackingJournals();

        // 3. Then
        assertThat(alerts).hasSize(1);
        assertThat(alerts.get(0).isTargetReached()).isTrue();
        assertThat(alerts.get(0).currentPrice()).isEqualByComparingTo(bd(152.0));

        log.info("📈 [목표가 도달 감시 테스트] ticker={}, 현재가={}, 목표가={}, 도달판정={}",
                alerts.get(0).ticker(), alerts.get(0).currentPrice(), alerts.get(0).targetPrice(), alerts.get(0).isTargetReached());
    }

    @Test
    @DisplayName("동일 일지에 대해 알림이 1번 발생하면 30분 동안은 중복 알림을 완벽히 차단한다 (쿨다운)")
    void shouldBlockDuplicateAlertWithin30MinutesCooldown() {
        // 1. Given (목표가 도달 일지)
        Journal journal = Journal.builder()
                .user(testUser)
                .stock(testStock)
                .stayMessage("쿨다운 테스트")
                .chartRangeType(ChartRangeType.DAY_1)
                .pricePattern("[100.0, 100.0, 100.0, 100.0, 100.0]")
                .targetPrice(bd(100.0))
                .isTracking(true)
                .build();
        ReflectionTestUtils.setField(journal, "id", 102L);

        given(journalRepository.findAllActiveTrackingJournals()).willReturn(List.of(journal));

        List<StockChartResponse> mockChart = createMockChart(100.0, 100.0, 100.0, 100.0, 105.0);
        given(stockChartService.getChartData(eq("NVDA"), eq(ChartRangeType.DAY_1), any())).willReturn(mockChart);

        // 2. When & Then: 1번째 실행 ➔ 알림 정상 발송 (1건)
        List<TrackingAlertResult> firstAlerts = stockTrackingService.checkAllActiveTrackingJournals();
        assertThat(firstAlerts).hasSize(1);

        // 3. When & Then: 1분 뒤 2번째 실행 ➔ 30분 쿨다운으로 중복 발송 차단 (0건)!
        List<TrackingAlertResult> secondAlerts = stockTrackingService.checkAllActiveTrackingJournals();
        assertThat(secondAlerts).isEmpty();

        log.info("🛡️ [30분 쿨다운 테스트] 1차 알림발송={}건, 2차 알림차단={}건 (중복 알림 폭탄 방어 완료)",
                firstAlerts.size(), secondAlerts.size());
    }

    @Test
    @DisplayName("여러 유저의 서로 다른 반도체 종목 4건을 동시에 감시하여 조건 만족 2건만 정확히 추출하고 차트 캐싱을 100% 재사용한다")
    void shouldProcessMultipleJournalsBatchCorrectly() {
        // 1. Given (준비: NVDA 2건, AMD 1건, TSM 1건)
        Stock amdStock = createStock(2L, "AMD", "AMD", 145.0);
        Stock tsmStock = createStock(3L, "TSMC", "TSM", 205.0);

        // [일지 1] NVDA 일지 : 99.9% 일치 ➔ 알림 O
        Journal j1 = Journal.builder()
                .user(testUser)
                .stock(testStock)
                .stayMessage("NVDA 패턴 일치!")
                .chartRangeType(ChartRangeType.MONTH_3)
                .pricePattern("[100.0, 95.0, 90.0, 88.0, 94.0]")
                .isTracking(true)
                .similarityThreshold(0.85)
                .build();
        ReflectionTestUtils.setField(j1, "id", 201L);

        // [일지 2] NVDA 일지 : 목표가 $120 미도달 ➔ 알림 X
        Journal j2 = Journal.builder()
                .user(testUser)
                .stock(testStock)
                .stayMessage("NVDA 목표가 아직 미도달")
                .chartRangeType(ChartRangeType.MONTH_3)
                .targetPrice(bd(120.0))
                .isTracking(true)
                .build();
        ReflectionTestUtils.setField(j2, "id", 202L);

        // [일지 3] AMD 일지 : 패턴 불일치(하락 vs 상승) ➔ 알림 X
        Journal j3 = Journal.builder()
                .user(testUser)
                .stock(amdStock)
                .stayMessage("AMD 패턴 불일치")
                .chartRangeType(ChartRangeType.DAY_1)
                .pricePattern("[100.0, 110.0, 120.0, 130.0, 140.0]")
                .isTracking(true)
                .similarityThreshold(0.85)
                .build();
        ReflectionTestUtils.setField(j3, "id", 203L);

        // [일지 4] TSM 일지 : 목표가 $200 돌파 ($205) ➔ 알림 O
        Journal j4 = Journal.builder()
                .user(testUser)
                .stock(tsmStock)
                .stayMessage("TSM 목표가 돌파 익절!")
                .chartRangeType(ChartRangeType.DAY_1)
                .pricePattern("[180.0, 185.0, 190.0, 195.0, 205.0]")
                .targetPrice(bd(200.0))
                .isTracking(true)
                .similarityThreshold(0.85)
                .build();
        ReflectionTestUtils.setField(j4, "id", 204L);

        given(journalRepository.findAllActiveTrackingJournals())
                .willReturn(List.of(j1, j2, j3, j4));

        // Mock 차트 시세 설정 (NVDA 99% 일치, AMD 0% 불일치, TSM $205 돌파)
        given(stockChartService.getChartData(eq("NVDA"), eq(ChartRangeType.MONTH_3), any()))
                .willReturn(createMockChart(100.0, 96.0, 91.0, 89.0, 95.0));
        given(stockChartService.getChartData(eq("AMD"), eq(ChartRangeType.DAY_1), any()))
                .willReturn(createMockChart(100.0, 90.0, 80.0, 70.0, 60.0));
        given(stockChartService.getChartData(eq("TSM"), eq(ChartRangeType.DAY_1), any()))
                .willReturn(createMockChart(180.0, 185.0, 190.0, 195.0, 205.0));

        // 2. When (실행: 스케줄러 1회 배치 가동!)
        List<TrackingAlertResult> alerts = stockTrackingService.checkAllActiveTrackingJournals();

        // 3. Then (검증)
        assertThat(alerts).hasSize(2);
        assertThat(alerts).extracting(TrackingAlertResult::ticker)
                .containsExactlyInAnyOrder("NVDA", "TSM");

        verify(stockChartService, times(1)).getChartData(eq("NVDA"), eq(ChartRangeType.MONTH_3), any());

        log.info("🚀 [반도체 다중 배치 감시 테스트] 감시대상=4건 ➔ 조건만족 알림발송=2건 (NVDA 패턴일치, TSM 목표가돌파), NVDA 차트 API 호출 횟수=1회 (캐시 재사용 100% 성공)");
    }


    private BigDecimal bd(double val) {
        return BigDecimal.valueOf(val);
    }

    private List<StockChartResponse> createMockChart(double... prices) {
        List<StockChartResponse> items = new ArrayList<>();
        for (int i = 0; i < prices.length; i++) {
            String time = String.format("2026-08-20 10:%02d", i * 5);
            items.add(new StockChartResponse(time, bd(prices[i]), bd(prices[i] + 1.0), bd(prices[i] - 1.0), BigDecimal.ZERO, 1000L));
        }
        return items;
    }

    private Stock createStock(Long id, String name, String ticker, double price) {
        Stock stock = Stock.builder()
                .name(name)
                .ticker(ticker)
                .currentPrice(bd(price))
                .changePrice(bd(1.0))
                .changeRate(bd(1.0))
                .volume(1000000L)
                .marketCap(1000000000000L)
                .build();
        ReflectionTestUtils.setField(stock, "id", id);
        return stock;
    }
}
