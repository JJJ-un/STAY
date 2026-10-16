package com.stay.backend.analysis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stay.backend.domain.journal.repository.JournalRepository;
import com.stay.backend.domain.notification.service.NotificationService;
import com.stay.backend.domain.stock.dto.StockChartResponse;
import com.stay.backend.domain.stock.dto.TrackingTargetDto;
import com.stay.backend.domain.stock.entity.ChartRangeType;
import com.stay.backend.domain.stock.scheduler.StockTrackingScheduler;
import com.stay.backend.domain.stock.service.*;
import com.stay.backend.domain.stock.storage.*;
import com.stay.backend.infra.kis.KisWebSocketHandler;
import com.sun.management.ThreadMXBean;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.lang.management.ManagementFactory;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

/** Offline replay and failure injection; no market API, database or browser connection. */
class StayAnalysisTest {
    private static final Instant BASE = Instant.parse("2026-10-15T00:00:00Z");
    private final PatternMatchingEngine engine = new PatternMatchingEngine();

    @Test void olderBucketCannotOverwriteCurrentClose() {
        var rollup = new CandleRollupEngine(mock(StockChartService.class));
        rollup.acceptTick("NVDA", bd(100), BASE.plusSeconds(1));
        rollup.acceptTick("NVDA", bd(110), BASE.plusSeconds(301));
        rollup.acceptTick("NVDA", bd(90), BASE.plusSeconds(2));
        assertThat(rollup.getDailyCandles("NVDA")).containsExactly(bd(100),bd(110));
    }

    @Test void olderTickWithinSameBucketCannotOverwriteLatestClose() {
        var rollup = new CandleRollupEngine(mock(StockChartService.class));
        rollup.acceptTick("NVDA", bd(100), BASE.plusSeconds(2));
        rollup.acceptTick("NVDA", bd(110), BASE.plusSeconds(3));
        rollup.acceptTick("NVDA", bd(90), BASE.plusSeconds(1));
        assertThat(rollup.getDailyCandles("NVDA")).containsExactly(bd(110));
    }

    @Test void failedBackfillCanRecoverOnNextRead() {
        var charts = mock(StockChartService.class);
        when(charts.getChartData("NVDA",ChartRangeType.DAY_1,null))
                .thenThrow(new IllegalStateException("injected outage"))
                .thenReturn(List.of(new StockChartResponse("2026-10-15 00:00",bd(100),bd(100),bd(100),bd(0),1L)));
        var rollup = new CandleRollupEngine(charts);
        assertThat(rollup.getDailyCandles("NVDA")).isEmpty();
        assertThat(rollup.getDailyCandles("NVDA")).containsExactly(bd(100));
        verify(charts,times(2)).getChartData("NVDA",ChartRangeType.DAY_1,null);
    }

    @Test void failedNotificationCanBeRetriedOnNextSweep() {
        var repository = mock(JournalRepository.class);
        when(repository.findActiveTrackingTargetsChunk(eq(0L),any())).thenReturn(List.of(target(1)));
        var tracking = tracking(repository);
        var notifications = mock(NotificationService.class);
        var attempts = failFirstSave(notifications);
        var scheduler = new StockTrackingScheduler(tracking,notifications);
        scheduler.runTrackingMonitorTask(); scheduler.runTrackingMonitorTask();
        assertThat(attempts.get()).isEqualTo(2);
    }

    @Test void oneFailedNotificationDoesNotSkipOtherRecipients() {
        var repository = mock(JournalRepository.class);
        when(repository.findActiveTrackingTargetsChunk(eq(0L),any())).thenReturn(List.of(target(1),target(2)));
        var notifications = mock(NotificationService.class);
        var attempts = failFirstSave(notifications);
        new StockTrackingScheduler(tracking(repository),notifications).runTrackingMonitorTask();
        assertThat(attempts.get()).isEqualTo(2);
    }

    @Test void successfulSaveSuppressesNextSweep() {
        var repository = mock(JournalRepository.class);
        when(repository.findActiveTrackingTargetsChunk(eq(0L),any())).thenReturn(List.of(target(1)));
        var notifications = mock(NotificationService.class);
        var scheduler = new StockTrackingScheduler(tracking(repository),notifications);
        scheduler.runTrackingMonitorTask(); scheduler.runTrackingMonitorTask();
        verify(notifications,times(1)).createTrackingAlert(any());
    }

    @Test void concurrentSweepsReserveOneCandidatePerJournal() throws Exception {
        var repository = mock(JournalRepository.class);
        when(repository.findActiveTrackingTargetsChunk(eq(0L),any())).thenReturn(List.of(target(1)));
        var tracking = tracking(repository);
        try (var pool=java.util.concurrent.Executors.newFixedThreadPool(8)) {
            var start=new java.util.concurrent.CountDownLatch(1);
            var jobs=new ArrayList<java.util.concurrent.Callable<Integer>>();
            for(int i=0;i<32;i++)jobs.add(()->{start.await();return tracking.checkAllActiveTrackingJournals().size();});
            var futures=new ArrayList<java.util.concurrent.Future<Integer>>();
            for(var job:jobs)futures.add(pool.submit(job));
            start.countDown();
            int candidates=0;for(var future:futures)candidates+=future.get();
            assertThat(candidates).isEqualTo(1);
        }
    }

    @Test void dtwMatchesOriginalRecurrenceAcrossLengthsAndWindows() {
        var random = new Random(20261015);
        for(int caseId=0;caseId<250;caseId++) {
            var a=random.doubles(5+random.nextInt(76),-2,2).toArray();
            var b=random.doubles(5+random.nextInt(76),-2,2).toArray();
            int window=caseId%4;
            assertThat(engine.calculateFastDtwDistance(a,b,window))
                    .as("case %s lengths %s/%s window %s",caseId,a.length,b.length,window)
                    .isCloseTo(denseDistance(a,b,window),within(1e-12));
        }
    }

    @Test void replayTraversesParserStorageRollupAndSseBoundary() throws Exception {
        var storage = new RealtimePriceStorage();
        var rollup = new CandleRollupEngine(mock(StockChartService.class));
        var sse = mock(StockSseService.class);
        var handler = new KisWebSocketHandler(sse,storage,rollup);
        var session = mock(WebSocketSession.class);
        for(int i=0;i<1000;i++) {
            var fields=new String[21]; Arrays.fill(fields,"0");
            fields[0]="DNAS"+(i%2==0?"NVDA":"TSLA");
            fields[11]=Integer.toString(100+i); fields[20]=Integer.toString(i+1);
            handler.handleMessage(session,new TextMessage("0|HDFSCNT0|001|"+String.join("^",fields)));
        }
        verify(sse,times(1000)).broadcastSingleStock(any());
        assertThat(storage.size()).isEqualTo(2);
        assertThat(storage.getLatestCurrentPrice("NVDA").orElseThrow()).isEqualByComparingTo("1098");
        assertThat(storage.getLatestCurrentPrice("TSLA").orElseThrow()).isEqualByComparingTo("1099");
        assertThat(rollup.getDailyCandles("NVDA")).containsExactly(new BigDecimal("1098"));
        assertThat(rollup.getDailyCandles("TSLA")).containsExactly(new BigDecimal("1099"));
    }

    @Test @EnabledIfEnvironmentVariable(named="STAY_MEASURE",matches="true")
    void measureDtwAllocationAndTimeAgainstOriginalRecurrence() throws Exception {
        var bean=(ThreadMXBean)ManagementFactory.getThreadMXBean();
        assertThat(bean.isThreadAllocatedMemorySupported()).isTrue();
        bean.setThreadAllocatedMemoryEnabled(true);
        var rows=new ArrayList<Map<String,Object>>();
        for(int size:List.of(64,256,1024,2048)) {
            double[] a=new double[size],b=new double[size];
            for(int i=0;i<size;i++) { a[i]=Math.sin(i*.13); b[i]=Math.sin((i-1)*.13); }
            for(int i=0;i<5;i++) { denseDistance(a,b,1); engine.calculateFastDtwDistance(a,b,1); }
            var oldTime=new ArrayList<Double>(); var newTime=new ArrayList<Double>();
            var oldBytes=new ArrayList<Double>(); var newBytes=new ArrayList<Double>();
            for(int i=0;i<20;i++) {
                if(i%2==0) { sample(bean,a,b,true,oldTime,oldBytes); sample(bean,a,b,false,newTime,newBytes); }
                else { sample(bean,a,b,false,newTime,newBytes); sample(bean,a,b,true,oldTime,oldBytes); }
            }
            rows.add(Map.of("length",size,"denseMedianMs",median(oldTime),"rollingMedianMs",median(newTime),
                    "denseMedianAllocatedBytes",median(oldBytes),"rollingMedianAllocatedBytes",median(newBytes)));
        }
        var report=new LinkedHashMap<String,Object>();
        report.put("java",System.getProperty("java.version")); report.put("os",System.getProperty("os.name"));
        report.put("arch",System.getProperty("os.arch")); report.put("availableProcessors",Runtime.getRuntime().availableProcessors()); report.put("measuredAt",Instant.now().toString());
        report.put("conditions","DTW distance only; same arrays; window1; 5 warmups/20 alternating pairs; " +
                "original dense recurrence copied from HEAD 801ffa7; Java thread allocated bytes; not live-market accuracy or API latency");
        report.put("rows",rows);
        Path path=Path.of("build/reports/stay-analysis/pattern-resources.json");
        Files.createDirectories(path.getParent()); new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(path.toFile(),report);
    }

    private void sample(ThreadMXBean bean,double[] a,double[] b,boolean dense,List<Double> times,List<Double> bytes) {
        long allocated=bean.getThreadAllocatedBytes(Thread.currentThread().threadId()),start=System.nanoTime();
        double result=dense?denseDistance(a,b,1):engine.calculateFastDtwDistance(a,b,1);
        long elapsed=System.nanoTime()-start,delta=bean.getThreadAllocatedBytes(Thread.currentThread().threadId())-allocated;
        assertThat(result).isFinite();times.add(elapsed/1e6);bytes.add((double)delta);
    }
    private static double median(List<Double> values) { var copy=new ArrayList<>(values);Collections.sort(copy);return copy.get((copy.size()-1)/2); }
    private static BigDecimal bd(long value) { return BigDecimal.valueOf(value); }
    private static TrackingTargetDto target(long id) { return new TrackingTargetDto(id,1L,"NVDA",bd(110),bd(100),null,"test",null,null,null,true); }
    private static StockTrackingService tracking(JournalRepository repository) {
        return new StockTrackingService(repository,mock(StockChartService.class),new PatternMatchingEngine(),new RealtimePriceStorage(),mock(CandleRollupEngine.class));
    }
    private static AtomicInteger failFirstSave(NotificationService notifications) {
        var attempts=new AtomicInteger();
        doAnswer(call->{if(attempts.getAndIncrement()==0)throw new IllegalStateException("injected save failure");return null;})
                .when(notifications).createTrackingAlert(any());return attempts;
    }

    // Frozen original DP implementation: reference for equality and paired resource measurements.
    private static double denseDistance(double[] a,double[] b,int w) {
        int n=a.length,m=b.length; double[][] dtw=new double[n+1][m+1];
        for(int i=0;i<=n;i++)Arrays.fill(dtw[i],Double.POSITIVE_INFINITY);dtw[0][0]=0;
        int window=Math.max(w,Math.abs(n-m));
        for(int i=1;i<=n;i++)for(int j=Math.max(1,i-window);j<=Math.min(m,i+window);j++)
            dtw[i][j]=Math.pow(a[i-1]-b[j-1],2)+Math.min(dtw[i-1][j],Math.min(dtw[i][j-1],dtw[i-1][j-1]));
        return Math.sqrt(dtw[n][m]);
    }
}
