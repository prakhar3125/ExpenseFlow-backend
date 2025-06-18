package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.SourceDto;
import com.expensetracker.backend.service.SourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sources")
@RequiredArgsConstructor
public class SourceController {

    private final SourceService sourceService;

    @GetMapping
    public ResponseEntity<List<SourceDto>> getAllSourcesForUser() {
        // In a real app, you would get the user ID from the security context
        Integer userId = 1; // Placeholder
        List<SourceDto> sources = sourceService.getSourcesByUserId(userId);
        return ResponseEntity.ok(sources);
    }

    // Add POST, PUT, DELETE endpoints here...
}
