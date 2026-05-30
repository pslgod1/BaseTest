package org.example.basetest.test.api.dto;

import org.example.basetest.question.api.dto.QuestionDTO;
import org.example.basetest.user.api.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.List;

public record TestDTO(
    Long id,
    String title,
    String description,
    Integer timeLimitMinutes,
    LocalDateTime createAt,
    List<QuestionDTO> questions,
    UserDTO admin
) {
}
