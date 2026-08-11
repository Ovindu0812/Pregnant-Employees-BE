package com.pregnantemployees.be.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AssessmentRequest(
        Long userId,
        String userName,
        String workplaceType,
        @NotNull Integer pregnancyWeek,
        String conditions,
        @NotBlank String workingHours,
        @NotBlank String standingTime,
        @NotBlank String liftingWeight,
        @NotBlank String stressLevel
) {
}