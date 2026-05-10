package com.financetracker.controller;

import com.financetracker.dto.UserPreferenceDTO;
import com.financetracker.security.CurrentUser;
import com.financetracker.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UserPreferenceController {

    private final UserPreferenceService userPreferenceService;
    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<UserPreferenceDTO> get() {
        return ResponseEntity.ok(userPreferenceService.getPreferences(currentUser.id()));
    }

    @PutMapping
    public ResponseEntity<UserPreferenceDTO> update(@RequestBody UserPreferenceDTO dto) {
        return ResponseEntity.ok(userPreferenceService.updatePreferences(currentUser.id(), dto));
    }
}
