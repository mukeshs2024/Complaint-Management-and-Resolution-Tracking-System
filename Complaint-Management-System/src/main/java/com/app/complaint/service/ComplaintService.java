package com.app.complaint.service;

import com.app.complaint.entity.Complaint;
import com.app.complaint.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    // Dependency Injection via Constructor (Preferred over Field Injection)
    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    // Create (POST)
    public Complaint createComplaint(Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    // Read All (GET)
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // Read by ID (GET)
    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    // Update (PUT/PATCH) - Basic example
    public Complaint updateComplaintStatus(Long id, String newStatus) {
        return complaintRepository.findById(id).map(complaint -> {
            complaint.setStatus(newStatus);
            return complaintRepository.save(complaint);
        }).orElseThrow(() -> new RuntimeException("Complaint not found with ID: " + id));
    }
    
    // Delete (DELETE)
    public void deleteComplaint(Long id) {
        complaintRepository.deleteById(id);
    }
}