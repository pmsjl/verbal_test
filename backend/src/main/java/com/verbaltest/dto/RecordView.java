package com.verbaltest.dto;

import java.time.LocalDateTime;

/**
 * 测试记录的扁平视图，JOIN 上 participant 表的常用字段，供管理页表格和 CSV 导出共用。
 */
public record RecordView(
        Long id,
        Long participantId,
        String code,
        Integer age,
        String gender,
        Integer englishLevel,
        String musicHabit,
        String condition,
        Integer score,
        Long durationMs,
        LocalDateTime createdAt
) {}
