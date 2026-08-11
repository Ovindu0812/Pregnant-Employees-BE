package com.pregnantemployees.be.controller;

import com.pregnantemployees.be.dto.LegalRightRequest;
import com.pregnantemployees.be.dto.LegalRightResponse;
import com.pregnantemployees.be.service.LegalRightService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/legal-rights")
public class LegalRightController {

    private final LegalRightService legalRightService;

    public LegalRightController(LegalRightService legalRightService) {
        this.legalRightService = legalRightService;
    }

    @GetMapping
    public ResponseEntity<List<LegalRightResponse>> getAll() {
        return ResponseEntity.ok(legalRightService.getAll());
    }

    @PostMapping
    public ResponseEntity<LegalRightResponse> create(@Valid @RequestBody LegalRightRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(legalRightService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LegalRightResponse> update(@PathVariable Long id, @Valid @RequestBody LegalRightRequest request) {
        return ResponseEntity.ok(legalRightService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        legalRightService.delete(id);
        return ResponseEntity.noContent().build();
    }
}