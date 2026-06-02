package org.example.basetest.user.domain;

import org.example.basetest.question.api.dto.QuestionMapper;
import org.example.basetest.question.db.QuestionEntity;
import org.example.basetest.question.domain.QuestionService;
import org.example.basetest.test.api.dto.CreateTestDto;
import org.example.basetest.test.api.dto.TestDTO;
import org.example.basetest.test.api.dto.TestMapper;
import org.example.basetest.test.db.TestEntity;
import org.example.basetest.test.domain.TestService;
import org.example.basetest.user.api.dto.UserDTO;
import org.example.basetest.user.api.dto.UserMapper;
import org.example.basetest.user.db.Role;
import org.example.basetest.user.db.UserEntity;
import org.example.basetest.userTestAttempt.api.dto.UserTestDTO;
import org.example.basetest.userTestAttempt.api.dto.UserTestMapper;
import org.example.basetest.userTestAttempt.domain.UserTestService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class AdminService {
    private final UserService userService;
    private final QuestionService questionService;
    private final TestService testService;
    private final TestMapper testMapper;
    private final QuestionMapper questionMapper;
    private final UserTestService userTestService;
    private final UserTestMapper userTestMapper;
    private final UserMapper userMapper;

    public AdminService(UserService userService, QuestionService questionService, TestService testService, TestMapper testMapper, QuestionMapper questionMapper, UserTestService userTestService, UserTestMapper userTestMapper, UserMapper userMapper) {
        this.userService = userService;
        this.questionService = questionService;
        this.testService = testService;
        this.testMapper = testMapper;
        this.questionMapper = questionMapper;
        this.userTestService = userTestService;
        this.userTestMapper = userTestMapper;
        this.userMapper = userMapper;
    }

    //========================================Controller===========================================================

    public List<UserTestDTO> getUserTests(Long testId){
        return userTestMapper.convertEntityToDTOList(userTestService.findAllByTestId(testId));
    }

    public UserTestDTO getUserTest(Long userTestId) {
        return  userTestMapper.convertEntityToDTO(userTestService.findById(userTestId));
    }

    public List<UserDTO> findAllAdmin() {
        return userMapper.convertEntityListToDTOList(userService.findAllByRole(Role.ADMIN));
    }

    public UserDTO giveAdmin(String email) {
        UserEntity user = userService.findByEmail(email);
        user.setRole(Role.ADMIN);
        return userMapper.convertEntityToDto(userService.save(user));
    }

    public TestDTO createTest(CreateTestDto testDto) {
        try {
            TestEntity testEntity = new TestEntity();
            testEntity.setTitle(testDto.title());
            testEntity.setDescription(testDto.description());
            testEntity.setTimeLimitMinutes(testDto.timeLimitMinutes());
            testEntity.setAdmin(userService.findCurrentUser());
            testEntity.setCreatedAt(LocalDateTime.now());

            // Сначала сохраняем тест без вопросов
            TestEntity savedTest = testService.save(testEntity);

            // Потом сохраняем вопросы с привязкой к тесту
            Set<QuestionEntity> questionSet = questionMapper.convertCreateDtoToEntitySet(testDto.questions());
            for (QuestionEntity question : questionSet) {
                question.setTest(savedTest);
                questionService.save(question);
            }

            // Возвращаем свежий тест из БД
            return testMapper.convertEntityToDTO(testService.findByIdWithQuestion(savedTest.getId()));
        } catch (Exception e) {
            throw new RuntimeException("Error saving test", e);
        }
    }

    public void deletedTest(Long testId) {
        try {
            userTestService.deleteAllByTestId(testId);
            testService.delete(testId);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting test", e);
        }
    }

}
