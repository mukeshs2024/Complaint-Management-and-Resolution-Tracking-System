package com.app.complaint.controller;

import com.app.complaint.entity.User;
import com.app.complaint.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // New Import!
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder; // Inject the PasswordEncoder

    @Autowired
    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder; // Assign the Encoder
    }

    /**
     * Endpoint to handle user login requests.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        if (username == null || password == null) {
            return new ResponseEntity<>("Username and password are required.", HttpStatus.BAD_REQUEST);
        }

        Optional<User> userOptional = userService.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // SECURE CHECK: Use passwordEncoder.matches() to compare raw password 
            // with the hashed password from the database.
            if (passwordEncoder.matches(password, user.getPassword())) { 
                // Login Success: Return role and username
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "username", user.getUsername(),
                        "role", user.getRole()
                ));
            }
        }
        
        // Login Failure
        return new ResponseEntity<>("Invalid username or password.", HttpStatus.UNAUTHORIZED);
    }
}