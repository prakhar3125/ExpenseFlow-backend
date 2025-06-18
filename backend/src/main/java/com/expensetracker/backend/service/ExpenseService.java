package com.expensetracker.backend.service;


import com.expensetracker.backend.dto.ExpenseDto;
import com.expensetracker.backend.dto.CreateExpenseRequest;
import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.model.Source;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.SourceRepository;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final SourceRepository sourceRepository;

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

    public ExpenseDto addExpense(Integer userId, CreateExpenseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Source source = sourceRepository.findById(request.getSourceId())
                .orElseThrow(() -> new IllegalArgumentException("Source not found"));

        Expense expense = new Expense();
        expense.setUser(user);
        expense.setSource(source);
        expense.setAmount(request.getAmount());
        expense.setVendor(request.getVendor());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setTransactionDate(request.getTransactionDate());

        Expense savedExpense = expenseRepository.save(expense);
        return convertToDto(savedExpense);
    }

    public ExpenseDto updateExpense(Integer userId, Integer expenseId, CreateExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .filter(e -> e.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Expense not found or user not authorized"));

        Source source = sourceRepository.findById(request.getSourceId())
                .orElseThrow(() -> new IllegalArgumentException("Source not found"));

        expense.setSource(source);
        expense.setAmount(request.getAmount());
        expense.setVendor(request.getVendor());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setTransactionDate(request.getTransactionDate());

        Expense updatedExpense = expenseRepository.save(expense);
        return convertToDto(updatedExpense);
    }

    public void deleteExpense(Integer userId, Integer expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .filter(e -> e.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Expense not found or user not authorized"));

        expenseRepository.delete(expense);
    }

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

