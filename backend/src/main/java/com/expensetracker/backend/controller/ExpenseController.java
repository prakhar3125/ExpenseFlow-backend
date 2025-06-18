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

    // FIXED: Added the @PostMapping to handle creation of new expenses.
    @PostMapping
    public ResponseEntity<ExpenseDto> addExpense(@AuthenticationPrincipal User user, @RequestBody CreateExpenseRequest request) {
        ExpenseDto newExpense = expenseService.addExpense(user.getId(), request);
        return ResponseEntity.ok(newExpense);
    }
}
