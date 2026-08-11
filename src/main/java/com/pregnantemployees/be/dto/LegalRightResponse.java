package com.pregnantemployees.be.dto;

public record LegalRightResponse(
        Long id,
        String title,
        String category,
        String description,
        String detailedText
) {
}