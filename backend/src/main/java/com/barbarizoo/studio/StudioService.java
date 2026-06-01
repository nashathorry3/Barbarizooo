package com.barbarizoo.studio;

import com.barbarizoo.common.NotFoundException;
import com.barbarizoo.domain.Hairstyle;
import com.barbarizoo.repo.HairstyleRepository;
import com.barbarizoo.studio.StudioDtos.HairstyleDto;
import com.barbarizoo.studio.StudioDtos.PreviewRequest;
import com.barbarizoo.studio.StudioDtos.PreviewResponse;
import com.barbarizoo.studio.StudioDtos.SessionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * AI Hairstyle Preview engine.
 *
 * <p>The recommendation ranking is real and deterministic (face shape + gender +
 * German trend score). Photo-realistic try-on rendering requires a GPU vision
 * model and is intentionally stubbed in this build — {@link #preview} returns
 * style metadata with a clear SIMULATED status rather than a fake image.</p>
 *
 * <p>GDPR: sessions require explicit consent and hold no uploaded images; nothing
 * biometric is stored or used for identification.</p>
 */
@Service
@Transactional(readOnly = true)
public class StudioService {

    private static final String PRIVACY_NOTICE =
            "Your photo (if provided) is processed in the EU, never used to identify you, "
                    + "and deleted at the end of the session.";

    private final HairstyleRepository hairstyles;

    public StudioService(HairstyleRepository hairstyles) {
        this.hairstyles = hairstyles;
    }

    public SessionResponse createSession() {
        // Stateless session token; no image persistence in this build.
        return new SessionResponse("studio_" + UUID.randomUUID(), PRIVACY_NOTICE);
    }

    /** Ranks styles by suitability for the given face shape and gender. */
    public List<HairstyleDto> recommend(String faceShape, String gender) {
        String shape = normalize(faceShape);
        String g = normalize(gender);
        return hairstyles.findAll().stream()
                .map(h -> toDto(h, score(h, shape, g)))
                .sorted(Comparator.comparingInt(HairstyleDto::matchScore).reversed()
                        .thenComparing(HairstyleDto::trendScore, Comparator.reverseOrder()))
                .toList();
    }

    public PreviewResponse preview(PreviewRequest req) {
        Hairstyle style = hairstyles.findById(req.styleId())
                .orElseThrow(() -> new NotFoundException("Hairstyle not found"));
        return new PreviewResponse(
                style.getId(), style.getName(), "SIMULATED",
                "Recommendation engine is live. Photo-realistic try-on rendering is not enabled "
                        + "in this build; showing style details instead.",
                style.getRecommendedCategory());
    }

    /** match = trend baseline + face-shape fit + gender fit. */
    private int score(Hairstyle h, String shape, String gender) {
        int s = h.getTrendScore() / 10; // 0..10 baseline from popularity
        if (StringUtils.hasText(shape) && csvContains(h.getFaceShapes(), shape)) {
            s += 6;
        }
        if (StringUtils.hasText(gender)) {
            if (h.getGender().equals(gender) || h.getGender().equals("UNISEX")) {
                s += 3;
            } else {
                s -= 3;
            }
        }
        return s;
    }

    private boolean csvContains(String csv, String value) {
        for (String part : csv.split(",")) {
            if (part.trim().equalsIgnoreCase(value)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String v) {
        return v == null ? null : v.trim().toUpperCase();
    }

    private HairstyleDto toDto(Hairstyle h, int matchScore) {
        return new HairstyleDto(
                h.getId(), h.getName(), h.getCategory(), h.getGender(),
                h.getTrendScore(), h.getRecommendedCategory(), h.getDescription(), matchScore);
    }
}
