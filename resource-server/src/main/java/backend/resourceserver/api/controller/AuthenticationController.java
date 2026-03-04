package backend.resourceserver.api.controller;

import backend.resourceserver.api.Dto.LoginRequest;
import backend.resourceserver.api.Dto.RegisterRequest;
import backend.resourceserver.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return userService.createUser(request.getProfileId(), request.getFullName(), request.getPassword());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return userService.loginUser(request.getProfileId(), request.getPassword());
    }
}
