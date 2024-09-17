DROP TABLE IF EXISTS seats CASCADE;

CREATE TABLE seats(
    seat_id			SERIAL			PRIMARY KEY,
    seat_number 	INT				NOT NULL,
    seat_row    	INT				NOT NULL,
    section_number	INT				NOT NULL,
    seat_type		VARCHAR(10)		NOT NULL,
    event_id    	INT,
    user_id     	INT 			DEFAULT NULL,
    purchase_price  NUMERIC(10, 2)	DEFAULT NULL,

    FOREIGN KEY (seat_type) REFERENCES seats_type(type),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

/* Row 1: VIP
   Row 2 -3: RES
   Row 4 - 5: GA */