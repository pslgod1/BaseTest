package org.example.basetest.userAnswer.api;

import org.example.basetest.userAnswer.api.dto.UserAnswerDTO;
import org.example.basetest.userAnswer.api.dto.UserCreateAnswer;
import org.example.basetest.userAnswer.domain.UserAnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-answer")
public class UserAnswerController {

    private final UserAnswerService userAnswerService;

    @Autowired
    public UserAnswerController(UserAnswerService userAnswerService) {
        this.userAnswerService = userAnswerService;
    }

    @PostMapping
    public ResponseEntity<UserAnswerDTO> userGaveAnswer(@RequestBody UserCreateAnswer userAnswerDTO) {
        return ResponseEntity.ok(userAnswerService.userGaveAnswer(userAnswerDTO));
    }
}
