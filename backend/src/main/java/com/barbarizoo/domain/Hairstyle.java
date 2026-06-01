package com.barbarizoo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/** A style in the AI Hairstyle Preview trend catalog (global, cross-tenant). */
@Entity
@Table(name = "hairstyle")
@Getter
@Setter
public class Hairstyle {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String gender;

    /** Comma-separated suitable face shapes, e.g. "OVAL,ROUND,SQUARE". */
    @Column(name = "face_shapes", nullable = false)
    private String faceShapes;

    @Column(name = "trend_score", nullable = false)
    private int trendScore;

    @Column(name = "recommended_category", nullable = false)
    private String recommendedCategory;

    @Column(nullable = false)
    private String description;
}
