const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const db = require('./db');
const auth = require('./middleware/auth');

dotenv.config();

const app = express();
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
);

app.get('/', async (req, res) => {
  return res.status(200).json({ success: true, message: 'Library API is running' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, and password are required' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    );

    const user = { id: result.insertId, name, email };
    const token = signToken(user);

    return res.status(201).json({ success: true, message: 'Registered successfully', token, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const [rows] = await db.execute('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

app.post('/api/books', auth, async (req, res) => {
  try {
    const { title, author, genre, year } = req.body;

    if (!title || !author || !genre || !year) {
      return res.status(400).json({ success: false, message: 'title, author, genre, year are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO books (title, author, genre, year, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, author, genre, year, req.user.id]
    );

    const [rows] = await db.execute('SELECT * FROM books WHERE id = ? AND user_id = ?', [result.insertId, req.user.id]);

    return res.status(201).json({ success: true, message: 'Book created', data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Create book failed', error: error.message });
  }
});

app.get('/api/books', auth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const author = req.query.author || '';
    const genre = req.query.genre || '';

    const filters = ['user_id = ?'];
    const values = [req.user.id];

    if (author) {
      filters.push('author LIKE ?');
      values.push(`%${author}%`);
    }

    if (genre) {
      filters.push('genre LIKE ?');
      values.push(`%${genre}%`);
    }

    const where = `WHERE ${filters.join(' AND ')}`;

    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM books ${where}`, values);
    const [rows] = await db.execute(
      `SELECT * FROM books ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return res.status(200).json({
      success: true,
      page,
      limit,
      total: countRows[0].total,
      data: rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Get books failed', error: error.message });
  }
});

app.get('/api/books/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Get book failed', error: error.message });
  }
});

app.put('/api/books/:id', auth, async (req, res) => {
  try {
    const { title, author, genre, year } = req.body;

    if (!title || !author || !genre || !year) {
      return res.status(400).json({ success: false, message: 'title, author, genre, year are required' });
    }

    const [result] = await db.execute(
      'UPDATE books SET title = ?, author = ?, genre = ?, year = ? WHERE id = ? AND user_id = ?',
      [title, author, genre, year, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const [rows] = await db.execute('SELECT * FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.status(200).json({ success: true, message: 'Book updated', data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Update book failed', error: error.message });
  }
});

app.delete('/api/books/:id', auth, async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    return res.status(200).json({ success: true, message: 'Book deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Delete book failed', error: error.message });
  }
});

app.post('/api/files/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'file is required' });
    }

    const [result] = await db.execute(
      'INSERT INTO files (filename, file_path, size, user_id) VALUES (?, ?, ?, ?)',
      [req.file.originalname, req.file.filename, req.file.size, req.user.id]
    );

    const [rows] = await db.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [result.insertId, req.user.id]);

    return res.status(201).json({ success: true, message: 'File uploaded', data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

app.get('/api/files', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, filename, file_path, size, user_id, created_at FROM files WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Get files failed', error: error.message });
  }
});

app.get('/api/files/:id/download', auth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const file = rows[0];
    const fullPath = path.join(uploadsDir, file.file_path);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'File missing in storage' });
    }

    return res.download(fullPath, file.filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Download failed', error: error.message });
  }
});

app.delete('/api/files/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const file = rows[0];
    const fullPath = path.join(uploadsDir, file.file_path);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }

    await db.execute('DELETE FROM files WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    return res.status(200).json({ success: true, message: 'File deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Delete file failed', error: error.message });
  }
});

app.use(async (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }

  return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
