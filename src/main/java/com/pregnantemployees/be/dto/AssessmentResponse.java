package com.pregnantemployees.be.dto;

import java.time.LocalDateTime;

public record AssessmentResponse(
        Long id,
        Long userId,
        String userName,
        String workplaceType,
        Integer pregnancyWeek,
        String conditions,
        String workingHours,
        String standingTime,
        String liftingWeight,
        String stressLevel,
        String riskLevel,
        LocalDateTime createdAt
) {
}