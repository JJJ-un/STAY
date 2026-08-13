package com.stay.backend.global.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common (공통)
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "잘못된 입력값입니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C002", "지원하지 않는 HTTP 메서드입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C003", "서버 내부 오류가 발생했습니다."),
    HANDLE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "C004", "접근 권한이 없습니다."),

    // User (회원)
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "존재하지 않는 회원입니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "U002", "이미 존재는 이메일입니다."),

    // Stock (주식종목)
    STOCK_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "존재하지 않는 주식 종목입니다."),

    // Journal (주식일지)
    JOURNAL_NOT_FOUND(HttpStatus.NOT_FOUND, "J001", "존재하지 않는 주식일지입니다."),
    UNAUTHORIZED_JOURNAL_ACCESS(HttpStatus.FORBIDDEN, "J002", "해당 주식일지에 대한 접근 권한이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
