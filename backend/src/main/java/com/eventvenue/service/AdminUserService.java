package com.eventvenue.service;

import com.eventvenue.entity.AdminUser;
import com.eventvenue.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminUserService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AdminUser createAdmin(String email, String password, String name) {
        if (adminUserRepository.existsByEmail(email)) {
            throw new RuntimeException("Admin with this email already exists");
        }

        AdminUser admin = AdminUser.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .role("ADMIN")
                .isActive(true)
                .build();

        return adminUserRepository.save(admin);
    }

    public Optional<AdminUser> findByEmail(String email) {
        return adminUserRepository.findByEmail(email);
    }

    public Optional<AdminUser> findById(Long id) {
        return adminUserRepository.findById(id);
    }
}
