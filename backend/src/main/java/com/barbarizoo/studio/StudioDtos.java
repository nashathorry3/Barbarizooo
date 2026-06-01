package com.barbarizoo.studio;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public final class StudioDtos {

    private StudioDtos() {
    }

    /** GDPR: the studio session cannot start without explicit consent. */
    public record ConsentRequest(
            @AssertTrue(message = "Consent is required to use the AI Hairstyle Preview") boolean consent) {
    }

    public record SessionResponse(String sessionId, String privacyNotice) {
    }

    public record HairstyleDto(
            UUID id, String name, String category, String gender,
            int trendScore, String recommendedCategory, String description,
            int matchScore) {
    }

    public record PreviewRequest(
            @NotNull String sessionId,
            @NotNull UUID styleId,
            String faceShape) {
    }

    /** Honest about the build: recommendations are live; photo rendering is stubbed. */
    public record PreviewResponse(
            UUID styleId, String styleName, String renderStatus, String message,
            String recommendedCategory) {
    }
}
