-- Hairstyle catalog for the AI Hairstyle Preview recommendation engine.
-- Global (cross-tenant) trend catalog; "trend_score" reflects German-market popularity.

CREATE TABLE hairstyle (
    id                   UUID PRIMARY KEY,
    name                 VARCHAR(80) NOT NULL,
    category             VARCHAR(20) NOT NULL,   -- HAIR | BEARD
    gender               VARCHAR(12) NOT NULL,   -- MALE | FEMALE | UNISEX
    face_shapes          VARCHAR(80) NOT NULL,   -- comma list: OVAL,ROUND,SQUARE,HEART,LONG
    trend_score          INTEGER     NOT NULL,   -- 0..100
    recommended_category VARCHAR(20) NOT NULL,   -- maps to a service category to book
    description          VARCHAR(240) NOT NULL
);

INSERT INTO hairstyle (id, name, category, gender, face_shapes, trend_score, recommended_category, description) VALUES
    ('44444444-0000-0000-0000-000000000001', 'Textured Crop',      'HAIR',  'UNISEX', 'OVAL,ROUND,SQUARE', 95, 'HAIR',  'Short, textured top with tight sides — the dominant Berlin trend.'),
    ('44444444-0000-0000-0000-000000000002', 'Skin Fade',          'HAIR',  'MALE',   'OVAL,SQUARE,HEART', 92, 'HAIR',  'Sharp gradient fade, clean and low-maintenance.'),
    ('44444444-0000-0000-0000-000000000003', 'Modern Mullet',      'HAIR',  'UNISEX', 'OVAL,HEART,LONG',   80, 'HAIR',  'Retro-revival mullet with contemporary texture.'),
    ('44444444-0000-0000-0000-000000000004', 'Classic Side Part',  'HAIR',  'MALE',   'ROUND,OVAL',        74, 'HAIR',  'Timeless, office-friendly side part.'),
    ('44444444-0000-0000-0000-000000000005', 'Buzz Cut',           'HAIR',  'MALE',   'SQUARE,OVAL',       68, 'HAIR',  'Minimalist all-over short cut.'),
    ('44444444-0000-0000-0000-000000000006', 'Full Beard Sculpt',  'BEARD', 'MALE',   'OVAL,ROUND,SQUARE,HEART,LONG', 85, 'BEARD', 'Shaped full beard with defined lines.');
