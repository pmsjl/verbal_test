package com.verbaltest.dto;

public record LeaderboardEntry(
        Long id,
        String code,
        String condition,
        Integer score,
        Long durationMs
) {}
