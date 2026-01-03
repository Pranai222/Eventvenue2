package com.eventvenue.service;

import com.eventvenue.entity.User;
import com.eventvenue.entity.PointHistory;
import com.eventvenue.entity.SystemSettings;
import com.eventvenue.repository.UserRepository;
import com.eventvenue.repository.PointHistoryRepository;
import com.eventvenue.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PointHistoryRepository pointHistoryRepository;
    
    @Autowired
    private SystemSettingsRepository systemSettingsRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public User adjustUserPoints(Long userId, Long pointsChange, String reason) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        Long previousPoints = user.getPoints();
        Long newPoints = previousPoints + pointsChange;

        if (newPoints < 0) {
            throw new RuntimeException("Cannot reduce points below zero");
        }

        user.setPoints(newPoints);
        userRepository.save(user);

        PointHistory history = PointHistory.builder()
                .userId(userId)
                .pointsChanged(pointsChange) // Using correct DB field name
                .reason(reason)
                .previousPoints(previousPoints)
                .newPoints(newPoints)
                .build();
        pointHistoryRepository.save(history);

        return user;
    }

    public ConversionRateResponse getConversionRate() {
        Optional<SystemSettings> setting = systemSettingsRepository
                .findBySettingKey(SystemSettings.CONVERSION_RATE_KEY);
        
        int rate = 1; // Default: 1 point = $1
        if (setting.isPresent()) {
            try {
                rate = Integer.parseInt(setting.get().getSettingValue());
            } catch (NumberFormatException e) {
                rate = 1;
            }
        }
        
        return new ConversionRateResponse(rate);
    }

    @Transactional
    public ConversionRateResponse updateConversionRate(int pointsPerDollar) {
        if (pointsPerDollar < 1) {
            throw new RuntimeException("Conversion rate must be at least 1");
        }
        
        Optional<SystemSettings> settingOptional = systemSettingsRepository
                .findBySettingKey(SystemSettings.CONVERSION_RATE_KEY);
        
        SystemSettings setting;
        if (settingOptional.isPresent()) {
            setting = settingOptional.get();
            setting.setSettingValue(String.valueOf(pointsPerDollar));
        } else {
            setting = new SystemSettings(
                SystemSettings.CONVERSION_RATE_KEY,
                String.valueOf(pointsPerDollar)
            );
        }
        
        systemSettingsRepository.save(setting);
        return new ConversionRateResponse(pointsPerDollar);
    }

    public static class ConversionRateResponse {
        private int pointsPerDollar;

        public ConversionRateResponse(int pointsPerDollar) {
            this.pointsPerDollar = pointsPerDollar;
        }

        public int getPointsPerDollar() {
            return pointsPerDollar;
        }

        public void setPointsPerDollar(int pointsPerDollar) {
            this.pointsPerDollar = pointsPerDollar;
        }
    }
}
