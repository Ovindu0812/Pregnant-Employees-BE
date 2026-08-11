package com.pregnantemployees.be.dto;

import jakarta.validation.constraints.NotBlank;

public record LegalRightRequest(
        @NotBlank String title,
        @NotBlank String category,
        @NotBlank String description,
        @NotBlank String detailedText
) {
}