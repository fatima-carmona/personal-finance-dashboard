package com.financetracker.service;

import com.financetracker.document.UserPreference;
import com.financetracker.dto.UserPreferenceDTO;
import com.financetracker.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserPreferenceService {

    private final UserPreferenceRepository userPreferenceRepository;

    public UserPreferenceDTO getPreferences(Long userId) {
        UserPreference pref = userPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> userPreferenceRepository.save(UserPreference.builder().userId(userId).build()));
        return toDto(pref);
    }

    public UserPreferenceDTO updatePreferences(Long userId, UserPreferenceDTO dto) {
        UserPreference pref = userPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> UserPreference.builder().userId(userId).build());

        pref.setTheme(dto.getTheme());
        pref.setCurrency(dto.getCurrency());
        pref.setDateFormat(dto.getDateFormat());
        pref.setEmailNotifications(dto.isEmailNotifications());
        pref.setDefaultDashboardView(dto.getDefaultDashboardView());

        return toDto(userPreferenceRepository.save(pref));
    }

    private UserPreferenceDTO toDto(UserPreference pref) {
        return UserPreferenceDTO.builder()
                .theme(pref.getTheme())
                .currency(pref.getCurrency())
                .dateFormat(pref.getDateFormat())
                .emailNotifications(pref.isEmailNotifications())
                .defaultDashboardView(pref.getDefaultDashboardView())
                .build();
    }
}
