package org.example.basetest.userTestAttempt.api.dto;

import org.example.basetest.test.api.dto.TestDTO;
import org.example.basetest.test.api.dto.TestMapper;
import org.example.basetest.user.api.dto.UserDTO;
import org.example.basetest.user.api.dto.UserMapper;
import org.example.basetest.userAnswer.api.dto.UserAnswerMapper;
import org.example.basetest.userTestAttempt.db.UserTestAttemptEntity;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;


@Component
public class UserTestMapper {

    private final UserMapper userMapper;
    private final TestMapper testMapper;
    private final UserAnswerMapper userAnswerMapper;

    public UserTestMapper(@Lazy UserMapper userMapper,@Lazy TestMapper testMapper,@Lazy UserAnswerMapper userAnswerMapper) {
        this.userMapper = userMapper;
        this.testMapper = testMapper;
        this.userAnswerMapper = userAnswerMapper;
    }

    public UserTestDTO convertEntityToDTO(UserTestAttemptEntity entity) {
        UserDTO userDto = userMapper.convertEntityToDto(entity.getUser());
        TestDTO testDto = testMapper.convertEntityToDTO(entity.getTest());
        return new UserTestDTO(
                entity.getId(),
                userDto,
                testDto,
                entity.getStartedAt(),
                entity.getCompletedAt(),
                entity.getPercentage(),
                userAnswerMapper.convertDtoToEntity(entity.getUserAnswers())
        );
    }




    public List<UserTestDTO> convertEntityToDTOList(List<UserTestAttemptEntity> entityList) {
        List<UserTestDTO> dtoList = new ArrayList<>();
        for (UserTestAttemptEntity entity : entityList) {
            dtoList.add(convertEntityToDTO(entity));
        }
        return dtoList;
    }
}
