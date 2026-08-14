package com.stay.backend.global.config.security;

import io.swagger.v3.oas.annotations.Parameter;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 컨트롤러 메서드 파라미터에서 현재 로그인한 유저의 ID(PK)를 직접 주입받는 어노테이션
 * 비로그인 상태인 경우 null이 주입됩니다.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Parameter(hidden = true) // Swagger 문서 파라미터 입력창에서 숨김 처리
public @interface CurrentUserId {
}
