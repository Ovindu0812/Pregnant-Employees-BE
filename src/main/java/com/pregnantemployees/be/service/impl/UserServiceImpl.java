package com.pregnantemployees.be.service.impl;

import com.pregnantemployees.be.dto.ProfileRequest;
import com.pregnantemployees.be.dto.UserResponse;
import com.pregnantemployees.be.entity.AccountStatus;
import com.pregnantemployees.be.entity.AppUser;
import com.pregnantemployees.be.repository.AppUserRepository;
import com.pregnantemployees.be.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final AppUserRepository userRepository;

    public UserServiceImpl(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public UserResponse getById(Long id) {
        return toResponse(findUser(id));
    }

    @Override
    public UserResponse updateProfile(Long id, ProfileRequest request) {
        AppUser user = findUser(id);
        user.setName(request.name());
        user.setEmail(request.email());
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
        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse toggleStatus(Long id) {
        AppUser user = findUser(id);
        user.setStatus(user.getStatus() == AccountStatus.ACTIVE ? AccountStatus.INACTIVE : AccountStatus.ACTIVE);
        return toResponse(userRepository.save(user));
    }

    private AppUser findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
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