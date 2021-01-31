CREATE TYPE ingredient_label AS ENUM (
  'Spices',
  'Meat/Fish',
  'Produce',
  'Refrigerated',
  'Other'
);

CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  title TEXT NOT NULL,
  created_ts TIMESTAMPTZ DEFAULT now() NOT NULL,
  label ingredient_label,
  content TEXT,
  recipe_id INTEGER
    REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  author_id INTEGER 
    REFERENCES users(id) ON DELETE CASCADE NOT NULL
);