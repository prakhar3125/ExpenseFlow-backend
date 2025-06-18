package com.expensetracker.backend.service;


import com.expensetracker.backend.dto.ExpenseDto;
import com.expensetracker.backend.dto.CreateExpenseRequest;
import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public List<ExpenseDto> getFilteredExpenses(Integer userId, int dateRange, String category, List<Integer> sourceIds) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(dateRange);

        List<Expense> expenses;

        if (sourceIds != null && !sourceIds.isEmpty()) {
            expenses = expenseRepository.findByUserIdAndSourceIdInAndTransactionDateBetween(userId, sourceIds, startDate, endDate);
        } else if (category != null && !category.equalsIgnoreCase("all")) {
            expenses = expenseRepository.findByUserIdAndCategoryAndTransactionDateBetween(userId, category, startDate, endDate);
        } else {
            expenses = expenseRepository.findByUserIdAndTransactionDateBetween(userId, startDate, endDate);
        }

        return expenses.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    // Add create, update, and delete methods here...

    private ExpenseDto convertToDto(Expense expense) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(expense.getId());
        dto.setSourceId(expense.getSource().getId());
        dto.setSourceName(expense.getSource().getName());
        dto.setAmount(expense.getAmount());
        dto.setVendor(expense.getVendor());
        dto.setCategory(expense.getCategory());
        dto.setDescription(expense.getDescription());
        dto.setTransactionDate(expense.getTransactionDate());
        dto.setReceiptImageUrl(expense.getReceiptImageUrl());
        return dto;
    }
}