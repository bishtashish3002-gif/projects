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
      public List<Book> getAllBooks() {
            return bookRepository.findAll();
      }
      // get a book by ID
      public Book getBookById(Long id){
            return bookRepository.findById(id).orElse(null);
      }
      // update a book
      public Book updateBook(Long id, Book updateBook){
            Book existingBook = bookRepository.findById(id).orElse(null);

            if(existingBook !=null){
                  existingBook.setTitle(updateBook.getTitle());
                  existingBook.setAuthor(updateBook.getAuthor());
                  existingBook.setCategory(updateBook.getCategory());
                  existingBook.setQuantity(updateBook.getQuantity());
                  
                  return bookRepository.save(existingBook);
            }
            return null;
      }
      // delete a book
      public void deleteBook(Long id){
            bookRepository.deleteById(id);
      }
}
