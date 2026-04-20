const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const db = require('./db');
const auth = require('./middleware/auth');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'library_dashboard_secret';
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const signToken = (user) => jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

const registerHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, password are required' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const user = { id: result.insertId, name, email };
    const token = signToken(user);

    return res.status(201).json({ success: true, message: 'Registered', token, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Register failed', error: error.message });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const [rows] = await db.execute('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
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
};

const getBooksHandler = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 6, 1);
    const offset = (page - 1) * limit;
    const author = req.query.author || '';
    const genre = req.query.genre || '';

    const where = ['user_id = ?'];
    const values = [req.user.id];

    if (author) {
      where.push('author LIKE ?');
      values.push(`%${author}%`);
    }

    if (genre) {
      where.push('genre LIKE ?');
      values.push(`%${genre}%`);
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;
    const [totalRows] = await db.execute(`SELECT COUNT(*) AS total FROM books ${whereSql}`, values);
    const total = totalRows[0].total;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const [rows] = await db.execute(
      `SELECT id, title, author, genre, year, user_id, created_at FROM books ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return res.status(200).json({ success: true, page, limit, total, totalPages, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Get books failed', error: error.message });
  }
};

const addBookHandler = async (req, res) => {
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
    return res.status(201).json({ success: true, message: 'Book added', data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Add book failed', error: error.message });
  }
};

const deleteBookHandler = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM books WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    return res.status(200).json({ success: true, message: 'Book deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Delete book failed', error: error.message });
  }
};

const listFilesHandler = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, filename, file_path, size, user_id, created_at FROM files WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Get files failed', error: error.message });
  }
};

const uploadFileHandler = async (req, res) => {
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
};

const downloadFileHandler = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) {
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
};

const deleteFileHandler = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) {
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
};

app.get('/health', async (req, res) => res.status(200).json({ success: true }));

app.post('/register', registerHandler);
app.post('/login', loginHandler);
app.get('/books', auth, getBooksHandler);
app.post('/books', auth, addBookHandler);
app.delete('/books/:id', auth, deleteBookHandler);
app.get('/files', auth, listFilesHandler);
app.post('/upload', auth, upload.single('file'), uploadFileHandler);
app.get('/files/:id', auth, downloadFileHandler);
app.delete('/files/:id', auth, deleteFileHandler);

// Backward-compatible aliases
app.post('/api/auth/register', registerHandler);
app.post('/api/auth/login', loginHandler);
app.get('/api/books', auth, getBooksHandler);
app.post('/api/books', auth, addBookHandler);
app.delete('/api/books/:id', auth, deleteBookHandler);
app.get('/api/files', auth, listFilesHandler);
app.post('/api/files/upload', auth, upload.single('file'), uploadFileHandler);
app.get('/api/files/:id/download', auth, downloadFileHandler);
app.delete('/api/files/:id', auth, deleteFileHandler);

app.use(async (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }

  return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

app.listen(PORT, async () => {
  try {
    await db.execute('SELECT 1');
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
});
