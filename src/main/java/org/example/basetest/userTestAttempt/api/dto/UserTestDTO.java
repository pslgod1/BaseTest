package org.example.basetest.userTestAttempt.api.dto;

import org.example.basetest.test.api.dto.TestDTO;
import org.example.basetest.user.api.dto.UserDTO;
import org.example.basetest.userAnswer.api.dto.UserAnswerDTO;

import java.time.LocalDateTime;
import java.util.Set;

public record UserTestDTO(
    Long id,
    UserDTO user,
    TestDTO test,
    LocalDateTime startAt,
    LocalDateTime completedAt,
    Double percentage,
    Set<UserAnswerDTO> answers
) {
}
