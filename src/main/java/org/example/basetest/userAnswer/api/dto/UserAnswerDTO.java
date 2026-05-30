package org.example.basetest.userAnswer.api.dto;

import org.example.basetest.question.api.dto.QuestionDTO;

import java.time.LocalDateTime;

public record UserAnswerDTO(
    Long id,
    QuestionDTO questionDTO,
    Integer selectedAnswerIndex,
    Boolean isCorrect,
    LocalDateTime answerAt
) {
}
