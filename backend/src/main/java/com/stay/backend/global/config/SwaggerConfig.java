package com.stay.backend.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(createInfo());
    }

    private Info createInfo() {
        return new Info()
                .title("STAY Server API")
                .version("v1.0.0")
                .description("STAY 주식일지 및 뇌동매매 방지 서비스 공식 API 서버입니다.");
    }
}
