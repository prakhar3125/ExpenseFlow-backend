package com.expensetracker.backend.dto;
import lombok.Data;

@Data
public class SignUpRequest {
    private String email;
    private String password;
}