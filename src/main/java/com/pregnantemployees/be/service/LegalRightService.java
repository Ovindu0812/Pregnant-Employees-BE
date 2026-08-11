package com.pregnantemployees.be.service;

import com.pregnantemployees.be.dto.LegalRightRequest;
import com.pregnantemployees.be.dto.LegalRightResponse;

import java.util.List;

public interface LegalRightService {
    List<LegalRightResponse> getAll();

    LegalRightResponse create(LegalRightRequest request);

    LegalRightResponse update(Long id, LegalRightRequest request);

    void delete(Long id);
}