package com.library.library_management_system.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


@Entity
@Table(name = "issue_records")
public class IssueRecord {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne
      @JoinColumn(name = "student_id", nullable = false)
      private Student student;

      @ManyToOne
      @JoinColumn(name = "book_id", nullable = false)
      private Book book;

      private LocalDate issueDate;
      
      private LocalDate returnDate;

      // Getters and Setters
      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public Student getStudent() {
            return student;
      }
      
      public void setStudent(Student student) {
            this.student = student;
      }

      public Book getBook() {
            return book;
      }

      public void setBook(Book book) {
            this.book = book;
      }

      public LocalDate getIssueDate() {
            return issueDate;
      }

      public void setIssueDate(LocalDate issueDate) {
            this.issueDate = issueDate;
      }

      public LocalDate getReturnDate() {
            return returnDate;
      }

      public void setReturnDate(LocalDate returnDate) {
            this.returnDate = returnDate;
      }
}
