# Library Management System REST API (Node.js + Express + MySQL)

This project is a complete **Library Management System REST API** with:
- User registration and login (JWT authentication)
- Book CRUD operations with pagination and filtering
- File upload and management (images + PDFs) using Multer

## 1) Project Structure

```bash
Library-api/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── bookController.js
│   └── fileController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── uploadMiddleware.js
├── models/
│   ├── bookModel.js
│   ├── fileModel.js
│   └── userModel.js
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   └── fileRoutes.js
├── sql/
│   └── schema.sql
├── uploads/
│   └── .gitkeep
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## 2) Setup Instructions (Step-by-Step)

### Step 1: Install Node.js and MySQL
- Install **Node.js** (v18+ recommended)
- Install **MySQL Server**

### Step 2: Install dependencies
```bash
npm install
```
> Important: If you skip this step and run `node server.js`, you will get errors like `Cannot find module 'express'`.

### Step 3: Create database tables
Run this SQL file in MySQL:
```bash
sql/schema.sql
```

### Step 4: Configure environment variables
Copy `.env.example` to `.env` and update values:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=library_db
JWT_SECRET=super_secret_jwt_key_change_me
JWT_EXPIRES_IN=1d
```

### Step 5: Start the server
```bash
npm run dev
```
or
```bash
npm start
```

Server base URL:
```bash
http://localhost:5000
```

---

## 3) Authentication Endpoints

### Register user
- **POST** `/api/auth/register`

Example JSON body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

### Login user
- **POST** `/api/auth/login`

Example JSON body:
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

You will receive a JWT token. Use it in protected routes:
```http
Authorization: Bearer <your_token>
```

---

## 4) Books API Endpoints

### Add new book (Protected)
- **POST** `/api/books`

Example JSON body:
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "genre": "Programming",
  "year": 2008
}
```

### Get all books (Public, Pagination + Filtering)
- **GET** `/api/books?page=1&limit=10&author=Robert&genre=Programming`

### Get single book by ID (Public)
- **GET** `/api/books/:id`

### Update book by ID (Protected)
- **PUT** `/api/books/:id`

Example JSON body:
```json
{
  "title": "Clean Code (Updated)",
  "author": "Robert C. Martin",
  "genre": "Software Engineering",
  "year": 2008
}
```

### Delete book by ID (Protected)
- **DELETE** `/api/books/:id`

---

## 5) File Upload and Management Endpoints

### Upload file (Protected)
- **POST** `/api/files/upload`
- Form-data key: `file`
- Supported formats: **JPG, PNG, WEBP, PDF**
- Max size: **5MB**

### List all files (Public)
- **GET** `/api/files`

### Download file by ID (Public)
- **GET** `/api/files/:id/download`

### Delete file by ID (Protected)
- **DELETE** `/api/files/:id`

---

## 6) Postman Testing Guide

1. Register a new user using `/api/auth/register`.
2. Login with `/api/auth/login` and copy the `token`.
3. In Postman, add header:
   - `Authorization: Bearer <token>`
4. Test protected routes:
   - `POST /api/books`
   - `PUT /api/books/:id`
   - `DELETE /api/books/:id`
   - `POST /api/files/upload`
   - `DELETE /api/files/:id`
5. Test public routes without token:
   - `GET /api/books`
   - `GET /api/books/:id`
   - `GET /api/files`
   - `GET /api/files/:id/download`

---

## 7) Notes

- The API uses async/await for database and controller operations.
- Global error handling middleware is included.
- File metadata is stored in MySQL, while files are stored physically in the `uploads` folder.
- JWT authentication protects sensitive operations.

## 8) Troubleshooting

### Error: `Cannot find module 'express'`
This means project packages are not installed yet.

Run:
```bash
npm install
```

Then start again:
```bash
npm run dev
```
or
```bash
npm start
```
