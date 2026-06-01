package com.barbarizoo.studio;

import com.barbarizoo.studio.StudioDtos.ConsentRequest;
import com.barbarizoo.studio.StudioDtos.HairstyleDto;
import com.barbarizoo.studio.StudioDtos.PreviewRequest;
import com.barbarizoo.studio.StudioDtos.PreviewResponse;
import com.barbarizoo.studio.StudioDtos.SessionResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public AI Hairstyle Preview endpoints (customer-facing). */
@RestController
@RequestMapping("/api/v1/studio")
public class StudioController {

    private final StudioService studio;

    public StudioController(StudioService studio) {
        this.studio = studio;
    }

    @PostMapping("/session")
    public SessionResponse session(@Valid @RequestBody ConsentRequest request) {
        return studio.createSession();
    }

    @GetMapping("/recommendations")
    public List<HairstyleDto> recommendations(
            @RequestParam(required = false) String faceShape,
            @RequestParam(required = false) String gender) {
        return studio.recommend(faceShape, gender);
    }

    @PostMapping("/preview")
    public PreviewResponse preview(@Valid @RequestBody PreviewRequest request) {
        return studio.preview(request);
    }
}
