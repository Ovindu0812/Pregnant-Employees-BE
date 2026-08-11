package com.pregnantemployees.be.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record ProfileRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        String phone,
        LocalDate dob,
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