package com.pregnantemployees.be.service.impl;

import com.pregnantemployees.be.dto.FeedbackRequest;
import com.pregnantemployees.be.dto.FeedbackResponse;
import com.pregnantemployees.be.entity.Feedback;
import com.pregnantemployees.be.repository.FeedbackRepository;
import com.pregnantemployees.be.service.FeedbackService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackServiceImpl(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Override
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public FeedbackResponse createFeedback(FeedbackRequest request) {
        Feedback feedback = new Feedback();
        feedback.setUserId(request.userId());
        feedback.setUserName(request.userName());
        feedback.setRating(request.rating());
        feedback.setComment(request.comment());

        return toResponse(feedbackRepository.save(feedback));
    }

    private FeedbackResponse toResponse(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getUserId(),
                feedback.getUserName(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getCreatedAt()
        );
    }
}