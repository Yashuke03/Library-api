CREATE DATABASE IF NOT EXISTS LibraryDB;
USE LibraryDB;

CREATE TABLE Books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  author VARCHAR(100) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL
);

CREATE TABLE BorrowedBooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL,
  member_id INT NOT NULL,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES Books(id),
  FOREIGN KEY (member_id) REFERENCES Members(id)
);

-- 1) Insert data
INSERT INTO Books (title, author, is_available) VALUES
('Clean Code','Robert C. Martin',TRUE),
('Atomic Habits','James Clear',TRUE),
('The Alchemist','Paulo Coelho',FALSE);

INSERT INTO Members (name, email) VALUES
('Arun','arun@mail.com'),('Divya','divya@mail.com'),('Rita','rita@mail.com');

-- 2) Find available books
SELECT * FROM Books WHERE is_available = TRUE;

-- 3) Update availability
UPDATE Books SET is_available = FALSE WHERE id = 2;

-- 4) Delete member
DELETE FROM Members WHERE id = 3;

-- 5) Join to simulate borrow
INSERT INTO BorrowedBooks (book_id, member_id) VALUES (1,1);
SELECT bb.id, b.title, m.name, bb.borrowed_at
FROM BorrowedBooks bb
JOIN Books b ON bb.book_id = b.id
JOIN Members m ON bb.member_id = m.id;
