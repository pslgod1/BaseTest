package org.example.basetest.userAnswer.api.dto;

import org.example.basetest.question.api.dto.QuestionMapper;
import org.example.basetest.userAnswer.db.UserAnswerEntity;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class UserAnswerMapper {

    private final QuestionMapper questionMapper;

    public UserAnswerMapper(QuestionMapper questionMapper) {
        this.questionMapper = questionMapper;
    }

    public UserAnswerDTO convertEntityToDto(UserAnswerEntity entity) {
        return new UserAnswerDTO(
                entity.getId(),
                questionMapper.convertEntityToQuestionDto(entity.getQuestion()),
                entity.getSelectedAnswerIndex(),
                entity.getIsCorrect(),
                entity.getAnsweredAt()
        );
    }

    public Set<UserAnswerDTO> convertDtoToEntity(Set<UserAnswerEntity> entities) {
        Set<UserAnswerDTO> entitySet = new HashSet<>();
        for (UserAnswerEntity dto : entities) {
            entitySet.add(convertEntityToDto(dto));
        }
        return entitySet;
    }
}
