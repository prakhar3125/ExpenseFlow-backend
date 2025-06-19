package com.expensetracker.backend.controller;


import com.expensetracker.backend.dto.JwtAuthenticationResponse;
import com.expensetracker.backend.dto.LoginRequest;
import com.expensetracker.backend.dto.SignUpRequest;
import com.expensetracker.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.Map; // Import the Map class

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest signUpRequest) {
        authService.signUp(signUpRequest);

        // --- THIS LINE IS CHANGED ---
        // We now return a Map object, which Spring will automatically convert to JSON.
        // The frontend will receive: {"message": "User registered successfully"}
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }
}