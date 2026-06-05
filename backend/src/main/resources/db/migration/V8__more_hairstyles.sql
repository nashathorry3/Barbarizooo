-- Expands the hairstyle catalog to 18 styles for the AI Preview recommendation engine.

INSERT INTO hairstyle (id, name, category, gender, face_shapes, trend_score, recommended_category, description) VALUES
    ('44444444-0000-0000-0000-000000000007', 'Curtains / Middle Part', 'HAIR',  'MALE',   'OVAL,LONG,HEART',       93, 'HAIR',  'Centre-parted swooping fringe — the biggest menswear hair trend right now.'),
    ('44444444-0000-0000-0000-000000000008', 'French Crop',            'HAIR',  'MALE',   'OVAL,ROUND,SQUARE',     89, 'HAIR',  'Textured fringe top with clean high-skin fade sides.'),
    ('44444444-0000-0000-0000-000000000009', 'Taper Fade',             'HAIR',  'MALE',   'OVAL,ROUND,HEART,SQUARE', 91, 'HAIR', 'Smooth graduation from short sides to any top length — endlessly versatile.'),
    ('44444444-0000-0000-0000-000000000010', 'Undercut',               'HAIR',  'UNISEX', 'OVAL,SQUARE',           87, 'HAIR',  'Disconnected sides and nape with a long, styled top of any texture.'),
    ('44444444-0000-0000-0000-000000000011', 'Pompadour',              'HAIR',  'MALE',   'OVAL,SQUARE,HEART',     78, 'HAIR',  'Swept-back volume at the crown — American classic with a Berlin twist.'),
    ('44444444-0000-0000-0000-000000000012', 'Quiff',                  'HAIR',  'MALE',   'OVAL,LONG,HEART',       76, 'HAIR',  'Lifted front volume, timeless shape with a modern textured finish.'),
    ('44444444-0000-0000-0000-000000000013', 'Slicked Back',           'HAIR',  'MALE',   'OVAL,SQUARE',           71, 'HAIR',  'Wet-look swept-back finish — smart for business or a night out.'),
    ('44444444-0000-0000-0000-000000000014', 'Shag Cut',               'HAIR',  'UNISEX', 'OVAL,LONG,HEART',       85, 'HAIR',  'Layered 70s-revival shag with curtain bangs — a Berlin salon favourite.'),
    ('44444444-0000-0000-0000-000000000015', 'Pixie Cut',              'HAIR',  'FEMALE', 'OVAL,HEART,SQUARE',     82, 'HAIR',  'Short, bold and effortless. Frames the face with confidence.'),
    ('44444444-0000-0000-0000-000000000016', 'French Bob',             'HAIR',  'FEMALE', 'OVAL,ROUND,HEART',      88, 'HAIR',  'Chin-length blunt bob — Parisian chic meets Berlin cool.'),
    ('44444444-0000-0000-0000-000000000017', 'Stubble Fade',           'BEARD', 'MALE',   'OVAL,ROUND,SQUARE,HEART,LONG', 79, 'BEARD', 'Close stubble with shaped edges — clean, defined, and low-maintenance.'),
    ('44444444-0000-0000-0000-000000000018', 'Long Waves',             'HAIR',  'UNISEX', 'OVAL,LONG,HEART',       77, 'HAIR',  'Natural shoulder-length waves with light layers for movement and texture.');
