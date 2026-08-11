package com.pregnantemployees.be.service.impl;

import com.pregnantemployees.be.dto.AuthResponse;
import com.pregnantemployees.be.dto.LoginRequest;
import com.pregnantemployees.be.dto.RegisterRequest;
import com.pregnantemployees.be.dto.UserResponse;
import com.pregnantemployees.be.entity.AccountStatus;
import com.pregnantemployees.be.entity.AppUser;
import com.pregnantemployees.be.entity.UserRole;
import com.pregnantemployees.be.repository.AppUserRepository;
import com.pregnantemployees.be.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthServiceImpl implements AuthService {

    private final AppUserRepository userRepository;

    public AuthServiceImpl(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        userRepository.findByEmail(request.email()).ifPresent(user -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        });

        AppUser user = new AppUser();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setRole(parseRole(request.role()));
        user.setPhone(request.phone());
        user.setDob(request.dob());
        user.setSector(request.sector());
        user.setJobTitle(request.jobTitle());
        user.setOrganization(request.organization());
        user.setLocation(request.location());
        user.setYearsEmployed(request.yearsEmployed());
        user.setWorkingHours(request.workingHours());
        user.setWorkType(request.workType());
        user.setPregnancyWeek(request.pregnancyWeek());
        user.setExpectedDeliveryDate(request.expectedDeliveryDate());
        user.setWorkplaceType(request.workplaceType());
        user.setStatus(AccountStatus.ACTIVE);

        AppUser savedUser = userRepository.save(user);
        return new AuthResponse(toResponse(savedUser), "Registration successful");
    }

    @Override
    public UserResponse login(LoginRequest request) {
        AppUser user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.getPassword().equals(request.password())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (request.role() != null && !request.role().isBlank()) {
            UserRole requestedRole = parseRole(request.role());
            if (user.getRole() != requestedRole) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Role does not match account");
            }
        }

        return toResponse(user);
    }

    private UserRole parseRole(String role) {
        if (role == null || role.isBlank()) {
            return UserRole.EMPLOYEE;
        }
        return UserRole.valueOf(role.trim().toUpperCase());
    }

    private UserResponse toResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getPhone(),
                user.getDob(),
                user.getSector(),
                user.getJobTitle(),
                user.getOrganization(),
                user.getLocation(),
                user.getYearsEmployed(),
                user.getWorkingHours(),
                user.getWorkType(),
                user.getPregnancyWeek(),
                user.getExpectedDeliveryDate(),
                user.getWorkplaceType(),
                user.getCreatedAt()
        );
    }
}