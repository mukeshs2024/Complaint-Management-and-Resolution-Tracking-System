package com.app.complaint.repository;

import com.app.complaint.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    // JpaRepository provides all basic CRUD methods (save, findById, findAll, delete, etc.)
    
    // You can define custom query methods here, e.g.:
    // List<Complaint> findByStatus(String status);
}