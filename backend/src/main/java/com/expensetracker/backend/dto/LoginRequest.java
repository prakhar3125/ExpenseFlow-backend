package com.expensetracker.backend.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LoginRequest {
    private String email;
    private String password;
}