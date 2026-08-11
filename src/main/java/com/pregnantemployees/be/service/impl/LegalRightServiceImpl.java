package com.pregnantemployees.be.service.impl;

import com.pregnantemployees.be.dto.LegalRightRequest;
import com.pregnantemployees.be.dto.LegalRightResponse;
import com.pregnantemployees.be.entity.LegalRight;
import com.pregnantemployees.be.repository.LegalRightRepository;
import com.pregnantemployees.be.service.LegalRightService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LegalRightServiceImpl implements LegalRightService {

    private final LegalRightRepository legalRightRepository;

    public LegalRightServiceImpl(LegalRightRepository legalRightRepository) {
        this.legalRightRepository = legalRightRepository;
    }

    @Override
    public List<LegalRightResponse> getAll() {
        return legalRightRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public LegalRightResponse create(LegalRightRequest request) {
        LegalRight legalRight = new LegalRight();
        legalRight.setTitle(request.title());
        legalRight.setCategory(request.category());
        legalRight.setDescription(request.description());
        legalRight.setDetailedText(request.detailedText());
        return toResponse(legalRightRepository.save(legalRight));
    }

    @Override
    public LegalRightResponse update(Long id, LegalRightRequest request) {
        LegalRight legalRight = legalRightRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Legal right not found"));
        legalRight.setTitle(request.title());
        legalRight.setCategory(request.category());
        legalRight.setDescription(request.description());
        legalRight.setDetailedText(request.detailedText());
        return toResponse(legalRightRepository.save(legalRight));
    }

    @Override
    public void delete(Long id) {
        if (!legalRightRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Legal right not found");
        }
        legalRightRepository.deleteById(id);
    }

    private LegalRightResponse toResponse(LegalRight legalRight) {
        return new LegalRightResponse(
                legalRight.getId(),
                legalRight.getTitle(),
                legalRight.getCategory(),
                legalRight.getDescription(),
                legalRight.getDetailedText()
        );
    }
}