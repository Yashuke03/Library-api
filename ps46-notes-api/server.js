const express = require('express');
const pool = require('./db');
const app = express();
app.use(express.json());

app.get('/notes', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM Notes ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/notes', async (req, res) => {
  const { title, content } = req.body;
  const [result] = await pool.query(
    'INSERT INTO Notes (title, content) VALUES (?, ?)',
    [title, content]
  );
  res.status(201).json({ id: result.insertId, title, content });
});

app.listen(process.env.PORT || 3000, () => console.log('Notes API running'));
