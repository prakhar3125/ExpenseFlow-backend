package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.CreateExpenseRequest;
import com.expensetracker.backend.dto.ExpenseDto;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "30") Integer dateRange,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<Integer> sourceIds) {
        List<ExpenseDto> expenses = expenseService.getFilteredExpenses(user.getId(), dateRange, category, sourceIds);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> addExpense(@AuthenticationPrincipal User user, @RequestBody CreateExpenseRequest request) {
        ExpenseDto newExpense = expenseService.addExpense(user.getId(), request);
        return ResponseEntity.ok(newExpense);
    }

    // FIXED: Added the @PutMapping to handle updating an expense.
    // It takes the expense ID from the URL path (e.g., /api/expenses/1).
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDto> updateExpense(@AuthenticationPrincipal User user, @PathVariable Integer id, @RequestBody CreateExpenseRequest request) {
        ExpenseDto updatedExpense = expenseService.updateExpense(user.getId(), id, request);
        return ResponseEntity.ok(updatedExpense);
    }

    // FIXED: Added the @DeleteMapping to handle deleting an expense.
    // It takes the expense ID from the URL path.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@AuthenticationPrincipal User user, @PathVariable Integer id) {
        expenseService.deleteExpense(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
