package com.stay.backend.global.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Expiry;
import org.checkerframework.checker.index.qual.NonNegative;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * 고성능 로컬 인메모리 Caffeine 캐시 설정
 * - 차트 기간 탭(분봉, 일봉, 주봉, 월봉)별 동적 차등 TTL 적용
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_STOCK_CHARTS = "stockCharts";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(CACHE_STOCK_CHARTS);

        Caffeine<Object, Object> caffeineBuilder = Caffeine.newBuilder()
                .maximumSize(500)
                .recordStats()
                .expireAfter(new Expiry<Object, Object>() {
                    @Override
                    public long expireAfterCreate(Object key, Object value, long currentTime) {
                        String keyStr = String.valueOf(key);

                        // 1. 당일 5분봉 (DAY_1): 5분 TTL
                        if (keyStr.contains("DAY_1")) {
                            return TimeUnit.MINUTES.toNanos(5);
                        }
                        // 2. 1주/3개월 일봉 (WEEK_1, MONTH_3): 1시간 TTL
                        if (keyStr.contains("WEEK_1") || keyStr.contains("MONTH_3")) {
                            return TimeUnit.HOURS.toNanos(1);
                        }
                        // 3. 1년/5년 주봉·월봉 (YEAR_1, YEAR_5): 24시간 TTL
                        return TimeUnit.HOURS.toNanos(24);
                    }

                    @Override
                    public long expireAfterUpdate(Object key, Object value, long currentTime, @NonNegative long currentDuration) {
                        return currentDuration;
                    }

                    @Override
                    public long expireAfterRead(Object key, Object value, long currentTime, @NonNegative long currentDuration) {
                        return currentDuration;
                    }
                });

        cacheManager.setCaffeine(caffeineBuilder);
        return cacheManager;
    }
}
