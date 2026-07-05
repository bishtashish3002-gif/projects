package com.library.library_management_system.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.library.library_management_system.entity.Book;
import com.library.library_management_system.entity.IssueRecord;
import com.library.library_management_system.entity.Student;
import com.library.library_management_system.repository.BookRepository;
import com.library.library_management_system.repository.IssueRecordRepository;
import com.library.library_management_system.repository.StudentRepository;

@Service
public class IssueRecordService {

      private final IssueRecordRepository         issueRecordRepository;
      private final BookRepository bookRepository;
      private final StudentRepository studentRepository;

    // Constructor Injection
      public IssueRecordService(IssueRecordRepository issueRecordRepository,
                              BookRepository bookRepository,
                              StudentRepository studentRepository) {

            this.issueRecordRepository = issueRecordRepository;
            this.bookRepository = bookRepository;
            this.studentRepository = studentRepository;
      }

    // Issue a Book
      public IssueRecord issueBook(Long studentId, Long bookId) {

            Student student = studentRepository.findById(studentId).orElse(null);
            Book book = bookRepository.findById(bookId).orElse(null);

            if (student == null || book == null) {
                  return null;
            }

            if (book.getQuantity() <= 0) {
                  return null;
            }

        // Decrease available quantity
            book.setQuantity(book.getQuantity() - 1);
            bookRepository.save(book);

        // Create Issue Record
            IssueRecord issueRecord = new IssueRecord();
            issueRecord.setStudent(student);
            issueRecord.setBook(book);
            issueRecord.setIssueDate(LocalDate.now());

            return issueRecordRepository.save(issueRecord);
      }

    // Return a Book
      public IssueRecord returnBook(Long issueRecordId) {

            IssueRecord issueRecord = issueRecordRepository.findById(issueRecordId).orElse(null);

            if (issueRecord == null || issueRecord.isReturned()) {
                  return null;
            }

            Book book = issueRecord.getBook();

        // Increase quantity
            book.setQuantity(book.getQuantity() + 1);
            bookRepository.save(book);

            issueRecord.setReturnDate(LocalDate.now());

            return issueRecordRepository.save(issueRecord);
      }

    // Get all Issue Records
      public List<IssueRecord> getAllIssueRecords() {
            return issueRecordRepository.findAll();
      }

    // Get Issue Record by ID
      public IssueRecord getIssueRecordById(Long id) {
            return issueRecordRepository.findById(id).orElse(null);
      }

    // Delete Issue Record (Optional)
      public void deleteIssueRecord(Long id) {
            issueRecordRepository.deleteById(id);
      }
}