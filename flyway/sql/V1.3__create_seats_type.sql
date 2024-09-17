DROP TABLE IF EXISTS seats_type CASCADE;

CREATE TABLE seats_type (
    id		SERIAL		PRIMARY KEY,
    type	VARCHAR(10)	NOT NULL UNIQUE
);

INSERT INTO seats_type (type)
VALUES
  ('ga'),
  ('res'),
  ('vip')