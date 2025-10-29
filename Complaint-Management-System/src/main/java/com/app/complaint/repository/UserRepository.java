package com.app.complaint.repository; // CORRECTED package name

import com.app.complaint.entity.User; // Import from the 'entity' package
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Custom method to find a User by their username for login
    Optional<User> findByUsername(String username);
}