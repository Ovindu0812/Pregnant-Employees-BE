package com.pregnantemployees.be.service.impl;

import com.pregnantemployees.be.dto.AssessmentRequest;
import com.pregnantemployees.be.dto.AssessmentResponse;
import com.pregnantemployees.be.entity.Assessment;
import com.pregnantemployees.be.repository.AssessmentRepository;
import com.pregnantemployees.be.service.AssessmentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssessmentServiceImpl implements AssessmentService {

    private final AssessmentRepository assessmentRepository;

    public AssessmentServiceImpl(AssessmentRepository assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }

    @Override
    public List<AssessmentResponse> getAllAssessments() {
        return assessmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<AssessmentResponse> getAssessmentsByUserId(Long userId) {
        return assessmentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    @Override
    public AssessmentResponse submitAssessment(AssessmentRequest request) {
        Assessment assessment = new Assessment();
        assessment.setUserId(request.userId());
        assessment.setUserName(request.userName());
        assessment.setWorkplaceType(resolveWorkplaceType(request.workplaceType()));
        assessment.setPregnancyWeek(request.pregnancyWeek());
        assessment.setConditions(request.conditions());
        assessment.setWorkingHours(request.workingHours());
        assessment.setStandingTime(request.standingTime());
        assessment.setLiftingWeight(request.liftingWeight());
        assessment.setStressLevel(request.stressLevel());
        assessment.setRiskLevel(calculateRiskLevel(request));

        Assessment saved = assessmentRepository.save(assessment);
        return toResponse(saved);
    }

    private String calculateRiskLevel(AssessmentRequest request) {
        if ("High".equalsIgnoreCase(request.stressLevel()) || "Heavy".equalsIgnoreCase(request.liftingWeight())) {
            return "High";
        }
        if ("Long".equalsIgnoreCase(request.standingTime())) {
            return "Medium";
        }
        return "Low";
    }

    private String resolveWorkplaceType(String workplaceType) {
        return workplaceType == null || workplaceType.isBlank() ? "Office" : workplaceType;
    }

    private AssessmentResponse toResponse(Assessment assessment) {
        return new AssessmentResponse(
                assessment.getId(),
                assessment.getUserId(),
                assessment.getUserName(),
                assessment.getWorkplaceType(),
                assessment.getPregnancyWeek(),
                assessment.getConditions(),
                assessment.getWorkingHours(),
                assessment.getStandingTime(),
                assessment.getLiftingWeight(),
                assessment.getStressLevel(),
                assessment.getRiskLevel(),
                assessment.getCreatedAt()
        );
    }
}