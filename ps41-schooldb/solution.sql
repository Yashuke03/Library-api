CREATE DATABASE IF NOT EXISTS SchoolDB;
USE SchoolDB;

CREATE TABLE Students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  class VARCHAR(20) NOT NULL
);

CREATE TABLE Marks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES Students(id)
);

INSERT INTO Students (name, class) VALUES
('Asha','10A'),('Ravi','10A'),('Meena','10B'),('Karan','10B'),('Neha','10C');

INSERT INTO Marks (student_id, subject, score) VALUES
(1,'Math',78),(1,'Science',82),
(2,'Math',35),(2,'Science',38),
(3,'Math',90),(3,'Science',88),
(4,'Math',40),(4,'Science',42),
(5,'Math',67),(5,'Science',72);

-- 1) Total score per student
SELECT s.id, s.name, SUM(m.score) AS total_score
FROM Students s
JOIN Marks m ON s.id = m.student_id
GROUP BY s.id, s.name;

-- 2) Top scorer
SELECT s.id, s.name, SUM(m.score) AS total_score
FROM Students s
JOIN Marks m ON s.id = m.student_id
GROUP BY s.id, s.name
ORDER BY total_score DESC
LIMIT 1;

-- 3) Students scoring below 40 in any subject
SELECT DISTINCT s.id, s.name, m.subject, m.score
FROM Students s
JOIN Marks m ON s.id = m.student_id
WHERE m.score < 40;
