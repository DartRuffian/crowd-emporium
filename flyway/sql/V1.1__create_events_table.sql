DROP TABLE IF EXISTS events CASCADE;

CREATE TABLE events(
    event_id			SERIAL			PRIMARY KEY,
    event_name			VARCHAR(50)		NOT NULL,
    event_date			DATE			NOT NULL,
    event_time			TIME			NOT NULL,
    seat_price			NUMERIC(8, 2)	NOT NULL, -- allows xxx,xxx.xx values
    seat_price_original	NUMERIC(8, 2)	NOT NULL,
    seat_price_vip		NUMERIC(3, 2)	NOT NULL, -- allows x.xx values
    seat_price_reserved	NUMERIC(3, 2)	NOT NULL
);

INSERT INTO events(event_name, event_date, event_time, seat_price, seat_price_original, seat_price_vip,
                   seat_price_reserved)
VALUES
    ('Taylor Swift', TO_DATE('08-25-2024', 'MM-DD-YYYY'),
     TO_TIMESTAMP('2024-08-25 07:30:00 PM', 'YYYY-MM-DD HH:MI:SS PM'), 150, 150, 1.9, 1.75),

    ('Garth Brooks', TO_DATE('08-30-2024', 'MM-DD-YYYY'),
     TO_TIMESTAMP('2024-08-30 07:45:00 PM', 'YYYY-MM-DD HH:MI:SS PM'), 100, 100, 1.5, 1.3),

    ('Classical Jazz', TO_DATE('09-01-2024', 'MM-DD-YYYY'),
     TO_TIMESTAMP('2024-09-01 09:00:00 PM', 'YYYY-MM-DD HH:MI:SS PM'), 80, 80, 1.75, 1.5),

    ('AC/DC', TO_DATE('09-15-2024', 'MM-DD-YYYY'),
     TO_TIMESTAMP('2024-09-15 07:00:00 PM', 'YYYY-MM-DD HH:MI:SS PM'), 110, 110, 1.6, 1.45);