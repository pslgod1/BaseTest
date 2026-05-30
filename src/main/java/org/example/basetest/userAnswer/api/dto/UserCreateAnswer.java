package org.example.basetest.userAnswer.api.dto;

public record UserCreateAnswer(
        long userTestId,
        long questionId,
        int selectedAnswerIndex
) {
}
