const pool = require('../config/db');

const createBook = async ({ title, author, genre, year }) => {
  const [result] = await pool.query(
    'INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)',
    [title, author, genre, year]
  );

  return result.insertId;
};

const getBooks = async ({ page, limit, author, genre }) => {
  const offset = (page - 1) * limit;
  const whereParts = [];
  const values = [];

  if (author) {
    whereParts.push('author LIKE ?');
    values.push(`%${author}%`);
  }

  if (genre) {
    whereParts.push('genre LIKE ?');
    values.push(`%${genre}%`);
  }

  const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM books ${whereClause}`,
    values
  );

  const [rows] = await pool.query(
    `SELECT * FROM books ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...values, Number(limit), Number(offset)]
  );

  return {
    total: countRows[0].total,
    page,
    limit,
    books: rows
  };
};

const getBookById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
  return rows[0] || null;
};

const updateBookById = async (id, { title, author, genre, year }) => {
  const [result] = await pool.query(
    'UPDATE books SET title = ?, author = ?, genre = ?, year = ? WHERE id = ?',
    [title, author, genre, year, id]
  );
  return result.affectedRows;
};

const deleteBookById = async (id) => {
  const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
  return result.affectedRows;
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById
};
