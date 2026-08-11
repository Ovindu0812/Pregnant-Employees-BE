package com.pregnantemployees.be.service;

import com.pregnantemployees.be.dto.FeedbackRequest;
import com.pregnantemployees.be.dto.FeedbackResponse;

import java.util.List;

public interface FeedbackService {
    List<FeedbackResponse> getAllFeedback();

    FeedbackResponse createFeedback(FeedbackRequest request);
}