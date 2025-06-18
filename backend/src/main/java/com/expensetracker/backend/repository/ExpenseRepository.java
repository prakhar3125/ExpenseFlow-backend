package com.expensetracker.backend.repository;

import com.expensetracker.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

    List<Expense> findByUserIdAndTransactionDateBetween(Integer userId, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserIdAndCategoryAndTransactionDateBetween(Integer userId, String category, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserIdAndSourceIdInAndTransactionDateBetween(Integer userId, List<Integer> sourceIds, LocalDate startDate, LocalDate endDate);

    // FIXED: Added a dedicated query to sum expenses for a specific source.
    // This is more efficient and reliable. It tells the database to sum the 'amount' column
    // for all expenses that match the given source ID. COALESCE ensures it returns 0 if there are no expenses.
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.source.id = :sourceId")
    BigDecimal sumAmountBySourceId(@Param("sourceId") Integer sourceId);
}
