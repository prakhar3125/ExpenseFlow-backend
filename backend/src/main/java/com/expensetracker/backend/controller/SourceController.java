package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.SourceDto;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.service.SourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sources")
@RequiredArgsConstructor
public class SourceController {

    private final SourceService sourceService;

    @GetMapping
    public ResponseEntity<List<SourceDto>> getAllSourcesForUser(@AuthenticationPrincipal User user) {
        List<SourceDto> sources = sourceService.getSourcesByUserId(user.getId());
        return ResponseEntity.ok(sources);
    }

    // FIXED: Added the @PostMapping to handle creation of new sources.
    @PostMapping
    public ResponseEntity<SourceDto> createSource(@AuthenticationPrincipal User user, @RequestBody SourceDto sourceDto) {
        SourceDto createdSource = sourceService.createSource(user.getId(), sourceDto);
        return ResponseEntity.ok(createdSource);
    }
}

