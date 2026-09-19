package com.verbaltest.dto;

public record AdminSessionResponse(
        boolean authenticated,
        String username,
        String csrfToken,
        String csrfHeader
) {}
