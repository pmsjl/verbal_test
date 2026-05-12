package com.verbaltest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record RecordCreateRequest(
        @NotNull Long participantId,
        @NotBlank @Pattern(regexp = "no_music|music") String condition,
        @NotNull @Min(0) Integer score,
        @NotNull @Min(0) Long durationMs
) {}
