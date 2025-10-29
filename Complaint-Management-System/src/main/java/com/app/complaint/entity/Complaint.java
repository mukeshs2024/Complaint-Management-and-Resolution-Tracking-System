package com.app.complaint.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "complaint")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String status; // e.g., "PENDING", "IN_PROGRESS", "RESOLVED"
    
    // 🌟 NEW FIELD: To store the role/category of the complainant (STUDENT, STAFF, FACULTY)
    private String category; 
    
    // --- Constructors (Required by JPA) ---

    // Default Constructor (Required by JPA)
    public Complaint() {
    }

    // Parameterized Constructor
    public Complaint(String title, String description, String status, String category) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.category = category; // Include new field
    }

    // --- Getters and Setters ---
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    
    // 🌟 NEW GETTER
    public String getCategory() {
        return category;
    }

    // 🌟 NEW SETTER
    public void setCategory(String category) {
        this.category = category;
    }
}