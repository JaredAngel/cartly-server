ALTER TABLE ingredients
  DROP COLUMN IF EXISTS label;

DROP TYPE IF EXISTS ingredient_label;

DROP TABLE IF EXISTS ingredients;