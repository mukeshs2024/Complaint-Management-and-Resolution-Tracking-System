package com.app.complaint.controller;

import com.app.complaint.entity.User;
import com.app.complaint.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/users") // Base path for user-related actions
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint to handle user login requests.
     * Takes username and password in the request body.
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
            
            // INSECURE CHECK: Compares raw passwords because we removed the security config.
            if (user.getPassword().equals(password)) { 
                // Login Success: Return role and username (and future token)
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
    
    // (You can add a /register endpoint here later if needed)
}