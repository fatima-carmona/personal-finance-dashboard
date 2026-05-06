package com.financetracker.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * User preferences stored in MongoDB — flexible, schema-light data
 * (theme, currency, dashboard layout, notification settings) that
 * doesn't need relational integrity or complex joins.
 */
@Document(collection = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    private String id;

    private Long userId; // references MySQL users.id

    @Builder.Default
    private String theme = "light"; // light | dark

    @Builder.Default
    private String currency = "USD";

    @Builder.Default
    private String dateFormat = "MM/dd/yyyy";

    @Builder.Default
    private boolean emailNotifications = true;

    @Builder.Default
    private String defaultDashboardView = "monthly"; // monthly | weekly | yearly
}
