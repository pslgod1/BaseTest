package org.example.basetest.question.api.dto;



import org.example.basetest.question.db.Type;

import java.util.List;

public record CreateQuestionDto(
     String question,
     List<String> answerOptions,
     Integer correctAnswerIndex,
     Type type
){
}
