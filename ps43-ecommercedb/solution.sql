CREATE DATABASE IF NOT EXISTS ECommerceDB;
USE ECommerceDB;

CREATE TABLE Products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL
);

CREATE TABLE Orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  order_date DATE NOT NULL,
  FOREIGN KEY (product_id) REFERENCES Products(id)
);

INSERT INTO Products (name, category, price, stock) VALUES
('Keyboard','Electronics',1500,3),
('Mouse','Electronics',800,12),
('Notebook','Stationery',100,20),
('Pen Pack','Stationery',60,4);

INSERT INTO Orders (product_id, quantity, order_date) VALUES
(1,2,CURDATE()-INTERVAL 10 DAY),
(2,1,CURDATE()-INTERVAL 5 DAY),
(3,10,CURDATE()-INTERVAL 35 DAY),
(4,5,CURDATE()-INTERVAL 2 DAY);

-- 1) Revenue per category
SELECT p.category, SUM(p.price * o.quantity) AS revenue
FROM Orders o JOIN Products p ON o.product_id = p.id
GROUP BY p.category;

-- 2) Low stock (<5)
SELECT * FROM Products WHERE stock < 5;

-- 3) Orders in last 30 days
SELECT o.*, p.name
FROM Orders o JOIN Products p ON o.product_id = p.id
WHERE o.order_date >= CURDATE() - INTERVAL 30 DAY;
