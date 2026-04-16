const pool = require('../config/db');

const createUser = async (name, email, passwordHash) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  return result.insertId;
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
