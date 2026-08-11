package com.pregnantemployees.be.repository;

import com.pregnantemployees.be.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}