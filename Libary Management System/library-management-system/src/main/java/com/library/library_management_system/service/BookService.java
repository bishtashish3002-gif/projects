package com.library.library_management_system.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.library.library_management_system.entity.Book;
import com.library.library_management_system.repository.BookRepository;

@Service
public class BookService {
      private final BookRepository bookRepository;

      //constructor injection
      public BookService(BookRepository bookRepository) {
            this.bookRepository = bookRepository;
      }

      // create a new book
      public Book addBook(Book book) {
            return bookRepository.save(book);
      }

      // get all books
      
      // get a book by ID
      // update a book
      // delete a book
}
