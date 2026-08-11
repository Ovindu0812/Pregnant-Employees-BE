package com.pregnantemployees.be.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FeedbackRequest(
        Long userId,
        String userName,
        @NotNull @Min(1) @Max(5) Integer rating,
        @NotBlank String comment
) {
}