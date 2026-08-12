package com.example.aiassist.auth.controller;

import com.example.aiassist.auth.dto.AuthResponse;
import com.example.aiassist.auth.dto.GoogleAuthRequest;
import com.example.aiassist.auth.dto.LoginRequest;
import com.example.aiassist.auth.dto.RegisterRequest;
import com.example.aiassist.auth.entity.User;
import com.example.aiassist.auth.repository.UserRepository;
import com.example.aiassist.auth.security.JwtUtil;
import com.example.aiassist.auth.service.AuthService;
import com.example.aiassist.common.exception.BadRequestException;
import com.example.aiassist.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@RestController
@RequestMapping({"/api/auth", "/auth"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Value("${app.cookie.secure:true}")
    private boolean secureCookie;

    private void setTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("codementor_token", token)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(secureCookie ? "None" : "Lax")
                .path("/")
                .maxAge(86400)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("codementor_token", "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(secureCookie ? "None" : "Lax")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        setTokenCookie(response, authResponse.getToken());
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        setTokenCookie(response, authResponse.getToken());
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@RequestBody GoogleAuthRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.loginWithGoogleToken(request);
        setTokenCookie(response, authResponse.getToken());
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @GetMapping("/google")
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/google");
    }

    @GetMapping("/google/callback")
    public void googleCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException, jakarta.servlet.ServletException {
        if (error != null) {
            response.sendRedirect(UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("error", error)
                    .build()
                    .toUriString());
            return;
        }
        String target = UriComponentsBuilder.fromPath("/login/oauth2/code/google")
                .queryParam("code", code)
                .queryParam("state", state)
                .build()
                .toUriString();
        request.getRequestDispatcher(target).forward(request, response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "codementor_token", required = false) String cookieToken) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (cookieToken != null) {
            token = cookieToken;
        }

        if (token == null || !jwtUtil.isTokenValid(token)) {
            throw new BadRequestException("Missing or invalid session credentials");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User account not found"));

        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .classCode(user.getClassCode())
                .institution(user.getInstitution())
                .handle(user.getHandle())
                .build();
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletResponse response) {
        clearTokenCookie(response);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "codementor_token", required = false) String cookieToken,
            HttpServletResponse response) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (cookieToken != null) {
            token = cookieToken;
        }

        if (token == null || !jwtUtil.isTokenValid(token)) {
            throw new BadRequestException("Invalid or expired session credentials");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User account not found"));

        String newToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        setTokenCookie(response, newToken);

        AuthResponse authResponse = AuthResponse.builder()
                .token(newToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .classCode(user.getClassCode())
                .institution(user.getInstitution())
                .handle(user.getHandle())
                .build();
        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }
}
