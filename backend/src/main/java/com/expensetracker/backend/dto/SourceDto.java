package com.expensetracker.backend.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;


@Data
public class SourceDto {
    private Integer id;
    private String name;
    private String type;
    private BigDecimal initialBalance;
    private BigDecimal currentBalance; // Calculated field
    private String color;
    private BigDecimal alertThreshold;
    private boolean isActive;
    private String description;
}