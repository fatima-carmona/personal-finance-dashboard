package com.financetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferenceDTO {
    private String theme;
    private String currency;
    private String dateFormat;
    private boolean emailNotifications;
    private String defaultDashboardView;
}
