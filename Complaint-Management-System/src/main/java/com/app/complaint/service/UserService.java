package com.app.complaint.service;

import com.app.complaint.entity.User;
import com.app.complaint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        // TEMPORARY: Ensure default users exist for testing
        initializeDefaultUsers(); 
    }

    /**
     * Saves a new user to the database. 
     * NOTE: This method currently uses INSECURE, temporary hashing 
     * (the password is just stored). We will fix this with Spring Security later.
     */
    public User registerNewUser(User user) {
        // In a real scenario, we would use a proper PasswordEncoder here.
        // For now, we save it as is to allow the application to run.
        return userRepository.save(user);
    }

    /**
     * Finds a user by username for the login process.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Helper method to create a few users automatically when the application starts
     * so we can immediately test the login feature.
     */
    private void initializeDefaultUsers() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            // INSECURE: Password 'admin123' is NOT hashed. Will be fixed later.
            admin.setPassword("admin123"); 
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Created default ADMIN user: admin");
        }
        
        if (userRepository.findByUsername("student").isEmpty()) {
            User student = new User();
            student.setUsername("student");
            // INSECURE: Password 'student123' is NOT hashed. Will be fixed later.
            student.setPassword("student123");
            student.setRole("STUDENT");
            userRepository.save(student);
            System.out.println("Created default STUDENT user: student");
        }
    }
}