package com.app.complaint.service;

import com.app.complaint.entity.User;
import com.app.complaint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // New Import!
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Inject the Encoder

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder; // Assign the Encoder
        initializeDefaultUsers();
    }

    /**
     * Finds a user by username for the login process.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Helper method to create a few users automatically.
     */
    private void initializeDefaultUsers() {
        // --- 1. ADMIN USER ---
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            // NOW SECURE: HASH the password before saving
            admin.setPassword(passwordEncoder.encode("admin123")); 
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Created default ADMIN user: admin");
        }
        
        // --- 2. STUDENT USER ---
        if (userRepository.findByUsername("student").isEmpty()) {
            User student = new User();
            student.setUsername("student");
            // NOW SECURE: HASH the password before saving
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole("STUDENT");
            userRepository.save(student);
            System.out.println("Created default STUDENT user: student");
        }
    }
}