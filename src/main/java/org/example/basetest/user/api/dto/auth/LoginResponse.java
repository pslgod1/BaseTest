package org.example.basetest.user.api.dto.auth;

public record LoginResponse(
        boolean success,
        String message,
        String redirectUrl
) {
}
