package com.pregnantemployees.be.dto;

import java.time.LocalDateTime;

public record FeedbackResponse(
        Long id,
        Long userId,
        String userName,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}