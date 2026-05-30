package org.example.basetest.user.api;

import org.example.basetest.user.api.dto.UserDTO;
import org.example.basetest.user.domain.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(){
        return ResponseEntity.ok(userService.findCurrentUserDto());
    }
}
