package com.library.library_management_system.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.library.library_management_system.entity.IssueRecord;
import com.library.library_management_system.service.IssueRecordService;

@RestController
@RequestMapping("/issues")
public class IssueRecordController {

      private final IssueRecordService issueRecordService;

    // Constructor Injection
      public IssueRecordController(IssueRecordService issueRecordService) {
            this.issueRecordService = issueRecordService;
      }

    // Issue a Book
      @PostMapping("/issue")
      public IssueRecord issueBook(@RequestParam Long studentId,
            @RequestParam Long bookId) {
                  return issueRecordService.issueBook(studentId, bookId);
      }

    // Return a Book
      @PutMapping("/return/{id}")
      public IssueRecord returnBook(@PathVariable Long id) {
            return issueRecordService.returnBook(id);
      }

    // Get All Issue Records
      @GetMapping
      public List<IssueRecord> getAllIssueRecords() {
            return issueRecordService.getAllIssueRecords();
      }

    // Get Issue Record by ID
      @GetMapping("/{id}")
      public IssueRecord getIssueRecordById(@PathVariable Long id) {
            return issueRecordService.getIssueRecordById(id);
      }
      // Delete Issue Record
      @DeleteMapping("/{id}")
      public void deleteIssueRecord(@PathVariable Long id) {
            issueRecordService.deleteIssueRecord(id);
      }
}