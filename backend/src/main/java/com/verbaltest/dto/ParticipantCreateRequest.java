package com.verbaltest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ParticipantCreateRequest(
        @NotBlank @Size(max = 32) String code,
        @NotNull @Min(1) Integer age,
        @NotBlank @Size(max = 8) String gender,
        @NotBlank @Size(max = 64) String musicHabit
) {}
