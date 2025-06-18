package com.expensetracker.backend.controller;


import com.expensetracker.backend.dto.CreateExpenseRequest;
import com.expensetracker.backend.dto.ExpenseDto;
import com.expensetracker.backend.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> getExpenses(
            @RequestParam(defaultValue = "30") Integer dateRange,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<Integer> sourceIds) {
        // In a real app, you would get the user ID from the security context
        Integer userId = 1; // Placeholder
        List<ExpenseDto> expenses = expenseService.getFilteredExpenses(userId, dateRange, category, sourceIds);
        return ResponseEntity.ok(expenses);
    }

    // Add POST, PUT, DELETE endpoints here...
}