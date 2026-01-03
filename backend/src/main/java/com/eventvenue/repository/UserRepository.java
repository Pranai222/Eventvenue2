package com.eventvenue.repository;

import com.eventvenue.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Role-specific queries for allowing same email across different roles
    Optional<User> findByEmailAndRole(String email, String role);
    boolean existsByEmailAndRole(String email, String role);
}
