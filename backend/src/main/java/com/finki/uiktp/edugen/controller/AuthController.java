package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.dto.AuthDto.AuthResponse;
import com.finki.uiktp.edugen.model.dto.AuthDto.LoginRequest;
import com.finki.uiktp.edugen.model.dto.AuthDto.RegisterRequest;
import com.finki.uiktp.edugen.service.Implementation.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            System.out.println("Register request received: " + request);
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            System.out.println("Login request received: " + request);
            System.out.println("Email: " + (request != null ? request.getEmail() : "null"));
            System.out.println("Password: " + (request != null ? "[PASSWORD LENGTH: " +
                    (request.getPassword() != null ? request.getPassword().length() : 0) + "]" : "null"));

            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}