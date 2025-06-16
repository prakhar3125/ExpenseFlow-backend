package com.expensetracker.backend.repository;

import com.expensetracker.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

    // Find expenses for a user within a date range
    List<Expense> findByUserIdAndTransactionDateBetween(Integer userId, LocalDate startDate, LocalDate endDate);

    // Find expenses for a user, filtered by category and date range
    List<Expense> findByUserIdAndCategoryAndTransactionDateBetween(Integer userId, String category, LocalDate startDate, LocalDate endDate);

    // Find expenses for a user, filtered by source and date range
    List<Expense> findByUserIdAndSourceIdInAndTransactionDateBetween(Integer userId, List<Integer> sourceIds, LocalDate startDate, LocalDate endDate);
}
