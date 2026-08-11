package com.pregnantemployees.be.dto;

import com.pregnantemployees.be.entity.AccountStatus;
import com.pregnantemployees.be.entity.UserRole;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        AccountStatus status,
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
        String workplaceType,
        LocalDateTime createdAt
) {
}