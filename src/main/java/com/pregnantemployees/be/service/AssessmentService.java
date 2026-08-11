package com.pregnantemployees.be.service;

import com.pregnantemployees.be.dto.AssessmentRequest;
import com.pregnantemployees.be.dto.AssessmentResponse;

import java.util.List;

public interface AssessmentService {
    List<AssessmentResponse> getAllAssessments();

    List<AssessmentResponse> getAssessmentsByUserId(Long userId);

    AssessmentResponse submitAssessment(AssessmentRequest request);
}