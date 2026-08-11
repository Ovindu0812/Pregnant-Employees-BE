package com.pregnantemployees.be.service;

import com.pregnantemployees.be.dto.ProfileRequest;
import com.pregnantemployees.be.dto.UserResponse;

import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();

    UserResponse getById(Long id);

    UserResponse updateProfile(Long id, ProfileRequest request);

    UserResponse toggleStatus(Long id);
}