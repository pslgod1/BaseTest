package org.example.basetest.user.api.dto.auth;

public record SimpleResponse(
        boolean success,
        String message
) {
}
