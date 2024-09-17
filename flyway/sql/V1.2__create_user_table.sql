DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    user_id		SERIAL			PRIMARY KEY,
    first_name	VARCHAR(50)		NOT NULL,
    last_name	VARCHAR(50)		NOT NULL,
    phone		VARCHAR(10)		NOT NULL,
    username	VARCHAR(50)		NOT NULL,
    password	VARCHAR(150)	NOT NULL,
    is_admin    BOOLEAN         DEFAULT false NOT NULL
);

INSERT INTO users (first_name, last_name, phone, username, password, is_admin)
VALUES
    ('Frodo', 'Baggins', '1112223333', 'frodo@test.com', '$2b$12$yUvy26nnXvGKb7yFVdyfGe0215ZPWW8xuRStQRDq3UZA3I78E3aEu', true), /* password is: pass1 */
    ('Bilbo', 'Baggins', '2223334444', 'bilbo@test.com', '$2b$12$VauwFrILbhlnDG0Uxq0Ci.5sPZ9ijw2UFkdMM5wnw9x7uQjTjwDE6', false), /* password is: pass2 */
    ('Samwise', 'Gamgee', '4445556666', 'samwise@test.com', '$2b$12$zVVe87JW7kNS9eHFG/uvbOLLTFuXoAX4HHBYIgfMk1NbOpYRzLDYC', false), /* password is: pass3 */
    ('Fname', 'Lname', '1231231234', 'test@test.com', '$2b$12$R5LAPIHvo2RO9CyfdkXOvuFQM/yMQ8Jh3sJvbJoP8R7fBjQoV7PBK', false), /* password is: password */
    ('William', 'Grate', '3332221111', 'wgrate@stumail.jccc.edu', '$2b$12$R5LAPIHvo2RO9CyfdkXOvuFQM/yMQ8Jh3sJvbJoP8R7fBjQoV7PBK', true), /* password is: password */
    ('Bodie', 'Schmi', '7778889999', 'bschmi33@stumail.jccc.edu', '$2b$12$R5LAPIHvo2RO9CyfdkXOvuFQM/yMQ8Jh3sJvbJoP8R7fBjQoV7PBK', true); /* password is: password */