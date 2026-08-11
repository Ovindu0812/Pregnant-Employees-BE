package com.pregnantemployees.be.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank String name,
        LocalDate dob,
        String phone,
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotBlank String confirmPassword,
        String role,
        String sector,
        String jobTitle,
        String organization,
        String location,
        String yearsEmployed,
        String workingHours,
        String workType,
        Integer pregnancyWeek,
        LocalDate expectedDeliveryDate,
        String workplaceType
) {
}