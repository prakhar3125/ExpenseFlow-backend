package com.expensetracker.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class ExpenseDto {
    private Integer id;
    private Integer sourceId;
    private String sourceName;
    private BigDecimal amount;
    private String vendor;
    private String category;
    private String description;
    private LocalDate transactionDate;
    private String receiptImageUrl;
}