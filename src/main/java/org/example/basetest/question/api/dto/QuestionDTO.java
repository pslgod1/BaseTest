package org.example.basetest.question.api.dto;



import org.example.basetest.question.db.Type;

import java.util.List;

public record QuestionDTO(
        Long id,
        String question,
        List<String> answers,
        Integer correctAnswerIndex,
        Type type
) {
}
