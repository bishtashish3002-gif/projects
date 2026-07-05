package com.library.library_management_system.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.library.library_management_system.entity.Student;
import com.library.library_management_system.repository.StudentRepository;

@Service
public class StudentService {
      private final StudentRepository studentRepository;

      //constructor injection
      public StudentService(StudentRepository studentRepository) {
            this.studentRepository = studentRepository;
      }

      // create a new student
      public Student addStudent(Student student) {
            return studentRepository.save(student);
      }

      // get all students
      public List<Student> getAllStudents() {
            return studentRepository.findAll();
      }
      // get a student by ID
      public Student getStudentById(Long id){
            return studentRepository.findById(id).orElse(null);
      }
      // update a student
      public Student updateStudent(Long id, Student updateStudent){
            Student existingStudent = studentRepository.findById(id).orElse(null);

            if(existingStudent !=null){
                  existingStudent.setName(updateStudent.getName());
                  existingStudent.setEmail(updateStudent.getEmail());
                  existingStudent.setPhone(updateStudent.getPhone());
                  
                  return studentRepository.save(existingStudent);
            }
            return null;
      }
      // delete a student
      public void deleteStudent(Long id){
            studentRepository.deleteById(id);
      }
}
