package com.finki.uiktp.edugen.service;

import com.finki.uiktp.edugen.model.User;
import com.finki.uiktp.edugen.model.enums.Role;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> listAll();

    Optional<User> findById(Long id);

    User create(String username, LocalDate dateOfBirth, String phoneNumber, String email, Role role);

    Optional<User> update(Long id, String username, LocalDate dateOfBirth, String phoneNumber, String email, Role role);

    User delete(Long id);
}
