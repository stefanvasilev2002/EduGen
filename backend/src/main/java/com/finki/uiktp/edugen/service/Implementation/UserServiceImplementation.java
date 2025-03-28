package com.finki.uiktp.edugen.service.Implementation;

import com.finki.uiktp.edugen.model.Exceptions.UserNotFoundException;
import com.finki.uiktp.edugen.model.User;
import com.finki.uiktp.edugen.model.enums.Role;
import com.finki.uiktp.edugen.repository.UserRepository;
import com.finki.uiktp.edugen.service.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImplementation implements UserService {

    private final UserRepository userRepository;

    public UserServiceImplementation(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> listAll() {
        return this.userRepository.findAll();
    }

    @Override
    public Optional<User> findById(Long id) {
        return this.userRepository.findById(id);
    }

    @Override
    public User create(String username, LocalDate dateOfBirth, String phoneNumber, String email, Role role) {
        if (username == null || username.isEmpty() || dateOfBirth == null || phoneNumber == null || phoneNumber.isEmpty() || email == null || email.isEmpty()) {
            throw new IllegalArgumentException("All fields are required");
        }
        User user = new User(username, dateOfBirth, phoneNumber, email, role);
        return this.userRepository.save(user);
    }

    @Override
    public Optional<User> update(Long id, String username, LocalDate dateOfBirth, String phoneNumber, String email, Role role) {
        User user = this.userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        user.setUsername(username);
        user.setDateOfBirth(dateOfBirth);
        user.setPhoneNumber(phoneNumber);
        user.setEmail(email);
        user.setRole(role);
        return Optional.of(this.userRepository.save(user));
    }

    @Override
    public User delete(Long id) {
        User user = this.userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        this.userRepository.delete(user);
        return user;
    }
}
