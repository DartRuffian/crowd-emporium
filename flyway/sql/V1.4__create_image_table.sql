DROP TABLE IF EXISTS images CASCADE;

CREATE TABLE images (
    image_id		SERIAL	PRIMARY KEY,
    event_id		INT,
    img_path		VARCHAR(50)	NOT NULL, -- file path pointing to image
    img_description	VARCHAR(50),

    FOREIGN KEY (event_id) REFERENCES events(event_id)
);


INSERT INTO images (event_id, img_path, img_description)
VALUES
    (1, '/website/events/images/taylorSwift.jpg', NULL),
    (2, '/website/events/images/garthBrooks.jpg', NULL),
    (3, '/website/events/images/singer3.jpg', NULL),
    (4, '/website/events/images/singer4.jpg', NULL);