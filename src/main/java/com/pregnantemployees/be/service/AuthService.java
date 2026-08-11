package com.pregnantemployees.be.service;

import com.pregnantemployees.be.dto.AuthResponse;
import com.pregnantemployees.be.dto.LoginRequest;
import com.pregnantemployees.be.dto.RegisterRequest;
import com.pregnantemployees.be.dto.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    UserResponse login(LoginRequest request);
}