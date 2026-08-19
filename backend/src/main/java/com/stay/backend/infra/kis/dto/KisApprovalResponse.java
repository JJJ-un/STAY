package com.stay.backend.infra.kis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record KisApprovalResponse(
        @JsonProperty("approval_key")
        String approvalKey
) {}
