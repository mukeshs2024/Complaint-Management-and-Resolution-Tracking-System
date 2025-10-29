package com.app.complaint.controller;

import com.app.complaint.entity.Complaint;
import com.app.complaint.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 🌟 FIX: Added @CrossOrigin annotation. 
// This allows your local file:// index.html to fetch data from this API.
@CrossOrigin(origins = "*") 
@RestController
@RequestMapping("/api/complaints") // Base URI for this controller
public class ComplaintController {

    private final ComplaintService complaintService;

    // Dependency Injection via Constructor
    @Autowired
    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // POST: Create a new Complaint
    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody Complaint complaint) {
        Complaint createdComplaint = complaintService.createComplaint(complaint);
        return new ResponseEntity<>(createdComplaint, HttpStatus.CREATED);
    }

    // GET: Get all Complaints
    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    // GET: Get Complaint by ID
    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Long id) {
        return complaintService.getComplaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT: Update Complaint Status
    // Example PUT to: /api/complaints/1?status=CLOSED
    @PutMapping("/{id}")
    public ResponseEntity<Complaint> updateComplaint(@PathVariable Long id, @RequestParam String status) {
        try {
            Complaint updatedComplaint = complaintService.updateComplaintStatus(id, status);
            return ResponseEntity.ok(updatedComplaint);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE: Delete a Complaint
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
    public void deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
    }
}