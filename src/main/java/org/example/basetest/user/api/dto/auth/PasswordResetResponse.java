package org.example.basetest.user.api.dto.auth;

public record PasswordResetResponse(
        boolean success,
        String message,
        String resetId
){
}
