const pool = require('../config/db');

const saveFileMetadata = async ({ originalName, storedName, mimeType, size, uploadedBy }) => {
  const [result] = await pool.query(
    `INSERT INTO files (original_name, stored_name, mime_type, size, uploaded_by)
     VALUES (?, ?, ?, ?, ?)`,
    [originalName, storedName, mimeType, size, uploadedBy]
  );

  return result.insertId;
};

const getAllFiles = async () => {
  const [rows] = await pool.query(
    `SELECT f.id, f.original_name, f.stored_name, f.mime_type, f.size, f.created_at,
            u.id AS user_id, u.name AS uploaded_by_name, u.email AS uploaded_by_email
     FROM files f
     LEFT JOIN users u ON f.uploaded_by = u.id
     ORDER BY f.id DESC`
  );

  return rows;
};

const getFileById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM files WHERE id = ?', [id]);
  return rows[0] || null;
};

const deleteFileById = async (id) => {
  const [result] = await pool.query('DELETE FROM files WHERE id = ?', [id]);
  return result.affectedRows;
};

module.exports = {
  saveFileMetadata,
  getAllFiles,
  getFileById,
  deleteFileById
};
