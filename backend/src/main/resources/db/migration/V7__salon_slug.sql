-- Per-salon public booking links: each location gets a unique URL slug,
-- e.g. /book/{slug}. Backfill the demo salon with the slug 'demo'.

ALTER TABLE location ADD COLUMN slug VARCHAR(80);

UPDATE location SET slug = 'demo' WHERE id = '11111111-1111-1111-1111-111111111111';

CREATE UNIQUE INDEX ux_location_slug ON location(slug);
