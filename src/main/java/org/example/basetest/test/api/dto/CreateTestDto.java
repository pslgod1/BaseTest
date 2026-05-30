package org.example.basetest.test.api.dto;

import org.example.basetest.question.api.dto.CreateQuestionDto;

import java.util.Set;

public record CreateTestDto(
        Set<CreateQuestionDto> questions,
        String title,
        String description,
        Integer timeLimitMinutes
) {
}
