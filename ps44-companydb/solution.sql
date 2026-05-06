CREATE DATABASE IF NOT EXISTS CompanyDB;
USE CompanyDB;

CREATE TABLE Employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  joining_date DATE NOT NULL
);

INSERT INTO Employees (name, department, salary, joining_date) VALUES
('Anil Kumar','IT',70000,'2022-01-10'),
('Bina Shah','HR',55000,'2021-07-15'),
('Chetan Rao','IT',85000,'2020-03-20'),
('Deepa Nair','Sales',50000,'2023-04-01'),
('Esha Verma','Sales',65000,'2022-11-11');

-- GROUP BY: average salary by department
SELECT department, AVG(salary) AS avg_salary
FROM Employees
GROUP BY department;

-- HAVING: departments with avg salary > 60000
SELECT department, AVG(salary) AS avg_salary
FROM Employees
GROUP BY department
HAVING AVG(salary) > 60000;

-- ORDER BY: highest salary first
SELECT * FROM Employees ORDER BY salary DESC;

-- LIKE: names starting with 'D'
SELECT * FROM Employees WHERE name LIKE 'D%';

-- BETWEEN: salary in range 50000 to 70000
SELECT * FROM Employees WHERE salary BETWEEN 50000 AND 70000;
