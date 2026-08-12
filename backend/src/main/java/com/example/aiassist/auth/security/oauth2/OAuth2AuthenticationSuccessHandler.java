package com.example.aiassist.auth.security.oauth2;

import com.example.aiassist.auth.dto.AuthResponse;
import com.example.aiassist.auth.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Value("${app.cookie.secure:true}")
    private boolean secureCookie;

    public OAuth2AuthenticationSuccessHandler(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            response.sendRedirect(UriComponentsBuilder
                    .fromUriString(redirectUri)
                    .queryParam("error", "oauth2_email_not_provided")
                    .build()
                    .toUriString());
            return;
        }

        String name = oAuth2User.getAttribute("name");
        AuthResponse authResponse = authService.processOAuth2Login(email, name);

        ResponseCookie cookie = ResponseCookie.from("codementor_token", authResponse.getToken())
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(secureCookie ? "None" : "Lax")
                .path("/")
                .maxAge(86400)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        String targetUrl = UriComponentsBuilder
                .fromUriString(redirectUri)
                .queryParam("token", authResponse.getToken())
                .queryParam("email", authResponse.getEmail())
                .queryParam("name", authResponse.getName())
                .queryParam("role", authResponse.getRole())
                .queryParam("handle", authResponse.getHandle())
                .build()
                .toUriString();

        response.sendRedirect(targetUrl);
    }
}
