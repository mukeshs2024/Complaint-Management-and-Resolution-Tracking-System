package com.app.complaint.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // --- 1. Password Encoder Bean ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    // --- 2. Security Filter Chain Configuration ---
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        http
            // Disables CSRF protection, which is safe for a stateless REST API 
            // where sessions are not maintained via cookies (like in your case).
            .csrf(AbstractHttpConfigurer::disable)
            
            // Ensures the application is stateless (no session cookies)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Defines the authorization rules
            .authorizeHttpRequests(authorize -> authorize
                // Allow public access to the login endpoint
                .requestMatchers("/api/users/login").permitAll()
                
                // Allow public access to view and submit basic complaints
                .requestMatchers("/api/complaints").permitAll()
                
                // Require ADMIN role for the resolve endpoint
                .requestMatchers("/api/complaints/*/resolve").hasRole("ADMIN")

                // All other requests must be authenticated (e.g., if you add other secure endpoints)
                .anyRequest().authenticated()
            );

        return http.build();
    }
}