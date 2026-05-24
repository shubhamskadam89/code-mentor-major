package com.example.aiassist.classroom.service;

import com.example.aiassist.classroom.dto.ClassroomRequestDTO;
import com.example.aiassist.classroom.dto.ClassroomResponseDTO;
import com.example.aiassist.classroom.dto.JoinClassroomDTO;
import com.example.aiassist.classroom.entity.Classroom;
import com.example.aiassist.classroom.repository.ClassroomRepository;
import com.example.aiassist.classroom.repository.AssignmentRepository;
import com.example.aiassist.common.exception.BadRequestException;
import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.common.util.JoinCodeGenerator;
import com.example.aiassist.student.entity.StudentProfile;
import com.example.aiassist.student.repository.StudentProfileRepository;
import com.example.aiassist.teacher.entity.Teacher;
import com.example.aiassist.teacher.repository.TeacherRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final TeacherRepository teacherRepository;
    private final StudentProfileRepository studentRepository;
    private final AssignmentRepository assignmentRepository;

    public ClassroomService(ClassroomRepository classroomRepository,
                            TeacherRepository teacherRepository,
                            StudentProfileRepository studentRepository,
                            AssignmentRepository assignmentRepository) {
        this.classroomRepository = classroomRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public ClassroomResponseDTO createClassroom(ClassroomRequestDTO request) {

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        String joinCode = JoinCodeGenerator.generate(6);

        Classroom classroom = new Classroom(
                request.getName(),
                joinCode,
                teacher
        );
        classroom.setSubjectName(request.getSubjectName());
        classroom.setSemester(request.getSemester());
        classroom.setDivision(request.getDivision());

        Classroom saved = classroomRepository.save(classroom);

        return mapToResponse(saved);
    }

    public ClassroomResponseDTO joinClassroom(JoinClassroomDTO request) {

        Classroom classroom = classroomRepository.findByJoinCode(request.getJoinCode())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid join code"));

        StudentProfile student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (classroom.getStudents().contains(student)) {
            throw new BadRequestException("Student already joined this classroom");
        }

        classroom.getStudents().add(student);
        classroomRepository.save(classroom);

        return mapToResponse(classroom);
    }

    public ClassroomResponseDTO joinClassroomByHandle(String handle, String joinCode) {

        Classroom classroom = classroomRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid join code"));

        StudentProfile student = studentRepository.findByHandle(handle)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (classroom.getStudents().contains(student)) {
            throw new BadRequestException("Student already joined this classroom");
        }

        classroom.getStudents().add(student);
        classroomRepository.save(classroom);

        return mapToResponse(classroom);
    }

    public List<ClassroomResponseDTO> getClassroomsByTeacher(Long teacherId, int page, int size) {

        teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        return classroomRepository
                .findByTeacherId(teacherId, PageRequest.of(page, size))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ClassroomResponseDTO> getClassroomsByStudent(Long studentId) {

        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return classroomRepository.findByStudentId(studentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ClassroomResponseDTO> getClassroomsByTeacherEmail(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        return classroomRepository.findByTeacherId(teacher.getId(), PageRequest.of(0, 1000))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ClassroomResponseDTO mapToResponse(Classroom classroom) {
        int activeAssignments = assignmentRepository.findByClassroomId(classroom.getId()).size();

        return new ClassroomResponseDTO(
                classroom.getId(),
                classroom.getName(),
                classroom.getSubjectName(),
                classroom.getSemester(),
                classroom.getDivision(),
                classroom.getJoinCode(),
                classroom.getTeacher().getName(),
                classroom.getStudents().size(),
                activeAssignments,
                classroom.isArchived(),
                classroom.getCreatedAt()
        );
    }
}