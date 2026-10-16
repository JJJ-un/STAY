package com.stay.backend.domain.stock.service;

import com.stay.backend.domain.journal.repository.JournalRepository;
import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.dto.TrackingTargetDto;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.domain.stock.service.StockTrackingService.TrackingAlertResult;
import com.stay.backend.domain.stock.storage.CandleRollupEngine;
import com.stay.backend.domain.stock.storage.RealtimePriceStorage;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
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

    @Spy
    private RealtimePriceStorage realtimePriceStorage = new RealtimePriceStorage();

    @Mock
    private CandleRollupEngine candleRollupEngine;

    @Test
    @DisplayName("과거 패턴과 현재 실시간 차트가 85% 이상 일치하면 PATTERN_MATCHED 알림을 발생시킨다")
    void shouldTriggerPatternMatchedAlertWhenSimilarityExceedsThreshold() {
        // 1. Given (준비: DTO 프로젝션으로 5개 과거 급락 캔들 전달)
        TrackingTargetDto target = new TrackingTargetDto(
                100L,
                1L,
                "NVDA",
                bd(128.50),
                null,
                null,
                "과거 급락 패턴 재현! 뇌동매도 금지!",
                ChartRangeType.MONTH_3,
                "[100.0, 95.0, 90.0, 88.0, 94.0]",
                0.85,
                true
        );

        given(journalRepository.findActiveTrackingTargetsChunk(eq(0L), any())).willReturn(List.of(target));

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
        TrackingTargetDto target = new TrackingTargetDto(
                101L,
                1L,
                "NVDA",
                bd(128.50),
                bd(150.0),
                null,
                "목표가 도달 시 분할 익절!",
                ChartRangeType.DAY_1,
                "[120.0, 125.0, 130.0, 140.0, 150.0]",
                0.85,
                true
        );

        given(journalRepository.findActiveTrackingTargetsChunk(eq(0L), any())).willReturn(List.of(target));

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
        TrackingTargetDto target = new TrackingTargetDto(
                102L,
                1L,
                "NVDA",
                bd(105.0),
                bd(100.0),
                null,
                "쿨다운 테스트",
                ChartRangeType.DAY_1,
                "[100.0, 100.0, 100.0, 100.0, 100.0]",
                0.85,
                true
        );

        given(journalRepository.findActiveTrackingTargetsChunk(eq(0L), any())).willReturn(List.of(target));

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
    @DisplayName("여러 유저의 서로 다른 반도체 종목 4건을 동시에 감시하여 조건 만족 2건만 정확히 추출하고 종목별 묶음으로 차트 캐싱을 100% 재사용한다")
    void shouldProcessMultipleJournalsBatchCorrectly() {
        // [일지 1] NVDA 일지 : 99.9% 일치 ➔ 알림 O
        TrackingTargetDto t1 = new TrackingTargetDto(
                201L, 1L, "NVDA", bd(128.5), null, null,
                "NVDA 패턴 일치!", ChartRangeType.MONTH_3, "[100.0, 95.0, 90.0, 88.0, 94.0]", 0.85, true
        );

        // [일지 2] NVDA 일지 : 목표가 $150 미도달 ➔ 알림 X
        TrackingTargetDto t2 = new TrackingTargetDto(
                202L, 2L, "NVDA", bd(128.5), bd(150.0), null,
                "NVDA 목표가 아직 미도달", ChartRangeType.MONTH_3, null, null, false
        );

        // [일지 3] AMD 일지 : 패턴 불일치(하락 vs 상승) ➔ 알림 X
        TrackingTargetDto t3 = new TrackingTargetDto(
                203L, 3L, "AMD", bd(145.0), null, null,
                "AMD 패턴 불일치", ChartRangeType.DAY_1, "[100.0, 110.0, 120.0, 130.0, 140.0]", 0.85, true
        );

        // [일지 4] TSM 일지 : 목표가 $200 돌파 ($205) ➔ 알림 O
        TrackingTargetDto t4 = new TrackingTargetDto(
                204L, 4L, "TSM", bd(205.0), bd(200.0), null,
                "TSM 목표가 돌파 익절!", ChartRangeType.DAY_1, "[180.0, 185.0, 190.0, 195.0, 205.0]", 0.85, true
        );

        given(journalRepository.findActiveTrackingTargetsChunk(eq(0L), any())).willReturn(List.of(t1, t2, t3, t4));

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

        // NVDA 일지가 2건이었지만, 종목별 그룹핑에 의해 차트 서비스는 정확히 1번만 호출됨!
        verify(stockChartService, times(1)).getChartData(eq("NVDA"), eq(ChartRangeType.MONTH_3), any());

        log.info("🚀 [반도체 다중 배치 감시 테스트] 감시대상=4건 ➔ 조건만족 알림발송=2건 (NVDA 패턴일치, TSM 목표가돌파), NVDA 차트 API 호출 횟수=1회 (종목 그룹핑 N+1 제거 성공)");
    }

    @Test
    @DisplayName("패턴 추적이 없는 순수 목표가/손절가 일지는 차트 API를 0회 호출하고 DB 실시간 현재가로 즉시 알림을 발생시킨다")
    void shouldTriggerTargetAlertWithoutCallingChartApiWhenNoPatternTracking() {
        // 1. Given (패턴 추적 없이 목표가 $120, 손절가 $100만 설정된 순수 가격 알림 일지, 현재가 $128.50)
        TrackingTargetDto pureTarget = new TrackingTargetDto(
                301L,
                1L,
                "NVDA",
                bd(128.50),
                bd(120.0),
                null,
                "순수 목표가 도달 알림!",
                null,
                null,
                null,
                true
        );

        given(journalRepository.findActiveTrackingTargetsChunk(eq(0L), any())).willReturn(List.of(pureTarget));

        // 2. When
        List<TrackingAlertResult> alerts = stockTrackingService.checkAllActiveTrackingJournals();

        // 3. Then (차트 API는 0회 호출되고, 실시간 현재가 128.50으로 목표가 도달 알림 즉시 발생!)
        assertThat(alerts).hasSize(1);
        assertThat(alerts.get(0).isTargetReached()).isTrue();
        assertThat(alerts.get(0).currentPrice()).isEqualByComparingTo(bd(128.50));

        // 차트 서비스가 전혀 호출되지 않았음을 명확히 검증 (외부 API 호출 0회!)
        verify(stockChartService, times(0)).getChartData(any(), any(), any());

        log.info("⚡ [차트 미호출 목표가 판정 테스트] 차트 API 호출=0회, 현재가=128.50, 목표가=120.00, 판정성공!");
    }

    @Test
    @DisplayName("대량 일지가 존재할 때 No-Offset Keyset 커서로 청크를 연속 분할 조회하여 누락 없이 전수 처리한다")
    void shouldProcessMultipleChunksUsingKeysetCursorWithoutMissingData() {
        // 1. Given: 1회차 청크(1,000건 가정, ID=1000까지) + 2회차 청크(마지막 청크, ID=1500까지)
        TrackingTargetDto chunk1Target = new TrackingTargetDto(
                1000L, 1L, "NVDA", bd(128.50), bd(120.00), null,
                "1차 청크 목표가 도달!", null, null, null, true
        );
        TrackingTargetDto chunk2Target = new TrackingTargetDto(
                1500L, 2L, "TSM", bd(205.00), bd(200.00), null,
                "2차 청크 목표가 도달!", null, null, null, true
        );

        // 첫 번째 쿼리 (lastJournalId = 0L) -> 1,000건 청크 반환 (CHUNK_SIZE 1000개라고 가정하기 위해 1000개 리스트 모의)
        List<TrackingTargetDto> firstChunk = new ArrayList<>(Collections.nCopies(StockTrackingService.CHUNK_SIZE - 1,
                new TrackingTargetDto(1L, 1L, "NVDA", bd(128.50), bd(200.0), null, "미도달", null, null, null, true)));
        firstChunk.add(chunk1Target); // 마지막에 1000L 추가

        given(journalRepository.findActiveTrackingTargetsChunk(eq(0L), any()))
                .willReturn(firstChunk);

        // 두 번째 쿼리 (lastJournalId = 1000L) -> 다음 1건 청크 반환 (마지막 청크)
        given(journalRepository.findActiveTrackingTargetsChunk(eq(1000L), any()))
                .willReturn(List.of(chunk2Target));

        // 2. When (배치 실행)
        List<TrackingAlertResult> alerts = stockTrackingService.checkAllActiveTrackingJournals();

        // 3. Then (두 청크 모두 누락 없이 처리되어 2건의 목표가 도달 알림 생성 확인)
        assertThat(alerts).hasSize(2);
        assertThat(alerts).extracting(TrackingAlertResult::journalId)
                .containsExactlyInAnyOrder(1000L, 1500L);

        // No-Offset 커서 호출 횟수 검증: 1회차(0L), 2회차(1000L) 총 2회 호출!
        verify(journalRepository, times(1)).findActiveTrackingTargetsChunk(eq(0L), any());
        verify(journalRepository, times(1)).findActiveTrackingTargetsChunk(eq(1000L), any());

        log.info("📦 [No-Offset Keyset 청크 분할 처리 테스트] 1차 청크(ID 0~1000) -> 2차 청크(ID 1000~1500) 연속 분할 조회 및 누락 0건 전수 검사 성공!");
    }

    @Test
    @DisplayName("DB 현재가가 목표가 미도달이더라도, 웹소켓 인메모리 저장소에 최신 체결가가 있으면 웹소켓 시세를 우선하여 목표가를 판정한다")
    void shouldPrioritizeWebsocketRealtimePriceOverDatabasePrice() {
        // 1. Given: DB 저장가는 120.0 (목표가 130.0 미도달)
        TrackingTargetDto target = new TrackingTargetDto(
                2000L,
                1L,
                "NVDA",
                bd(120.0), // DB 저장가 (미도달)
                bd(130.0), // 목표가
                null,
                "웹소켓 체결가 즉시 판정 테스트",
                null,
                null,
                null,
                true
        );

        given(journalRepository.findActiveTrackingTargetsChunk(eq(0L), any()))
                .willReturn(List.of(target));

        // 웹소켓 인메모리 저장소에 최신 체결가 135.0 (목표가 초과 달성!) 적재
        realtimePriceStorage.updatePrice("NVDA", new com.stay.backend.infra.kis.dto.RealtimeStockPrice(
                "NVDA",
                bd(135.0),
                bd(15.0),
                bd(12.5),
                10_000_000L
        ));

        // 2. When
        List<TrackingAlertResult> alerts = stockTrackingService.checkAllActiveTrackingJournals();

        // 3. Then: DB 가격이 아닌 웹소켓 가격(135.0)을 우선 채택하여 목표가 도달 알림 생성!
        assertThat(alerts).hasSize(1);
        TrackingAlertResult alert = alerts.get(0);
        assertThat(alert.isTargetReached()).isTrue();
        assertThat(alert.currentPrice()).isEqualByComparingTo(bd(135.0));

        log.info("⚡ [웹소켓 시세 우선 판정 테스트] DB 가격(120.0) 대신 웹소켓 실시간 가격(135.0)을 즉시 채택하여 목표가 달성 판정 성공!");
    }

    @Test
    @DisplayName("DAY_1(5분봉) 패턴 감시 시 외부 차트 API 대신 CandleRollupEngine의 인메모리 캔들을 우선 채택한다")
    void shouldPrioritizeCandleRollupEngineForDay1Range() {
        // 1. Given: DAY_1 탭의 패턴 추적 일지 등록
        TrackingTargetDto target = new TrackingTargetDto(
                3000L,
                1L,
                "NVDA",
                bd(120.0),
                null,
                null,
                "5분봉 롤업 패턴 감시",
                ChartRangeType.DAY_1,
                "[100.0, 95.0, 90.0, 88.0, 94.0]",
                null,
                true
        );

        given(journalRepository.findActiveTrackingTargetsChunk(eq(0L), any()))
                .willReturn(List.of(target));

        // CandleRollupEngine이 인메모리 5분봉 시계열을 반환하도록 설정 (5개 캔들)
        given(candleRollupEngine.getDailyCandles("NVDA"))
                .willReturn(List.of(bd(100.0), bd(95.0), bd(90.0), bd(88.0), bd(94.0)));

        // 2. When
        List<TrackingAlertResult> alerts = stockTrackingService.checkAllActiveTrackingJournals();

        // 3. Then
        assertThat(alerts).hasSize(1);
        TrackingAlertResult alert = alerts.get(0);
        assertThat(alert.isPatternMatched()).isTrue();
        assertThat(alert.similarity()).isGreaterThanOrEqualTo(0.85);

        // 검증: DAY_1에 대해서는 stockChartService.getChartData가 절대 호출되지 않아야 함! (0회)
        verify(stockChartService, times(0)).getChartData(eq("NVDA"), eq(ChartRangeType.DAY_1), any());
        verify(candleRollupEngine, times(1)).getDailyCandles("NVDA");

        log.info("🎯 [DAY_1 5분봉 롤업 엔진 우선 연동 테스트] 외부 차트 API 호출 0회 및 인메모리 캔들로 DTW 패턴 매칭 100% 성공!");
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
}
