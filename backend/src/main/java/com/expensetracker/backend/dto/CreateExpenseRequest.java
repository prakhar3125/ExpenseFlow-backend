package com.expensetracker.backend.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CreateExpenseRequest {
    private Integer sourceId;
    private BigDecimal amount;
    private String vendor;
    private String category;
    private String description;
    private LocalDate transactionDate;
}

