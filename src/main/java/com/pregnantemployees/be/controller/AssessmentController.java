package com.pregnantemployees.be.controller;

import com.pregnantemployees.be.dto.AssessmentRequest;
import com.pregnantemployees.be.dto.AssessmentResponse;
import com.pregnantemployees.be.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @GetMapping
    public ResponseEntity<List<AssessmentResponse>> getAllAssessments() {
        return ResponseEntity.ok(assessmentService.getAllAssessments());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AssessmentResponse>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(assessmentService.getAssessmentsByUserId(userId));
    }

    @PostMapping("/submit")
    public ResponseEntity<AssessmentResponse> submit(@Valid @RequestBody AssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assessmentService.submitAssessment(request));
    }
}