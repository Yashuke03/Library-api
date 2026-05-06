const express = require('express');
const pool = require('./db');
const app = express();
app.use(express.json());

app.get('/students', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM Students ORDER BY id DESC');
  res.json(rows);
});

app.post('/students', async (req, res) => {
  const { name, age, grade } = req.body;
  const [result] = await pool.query(
    'INSERT INTO Students (name, age, grade) VALUES (?, ?, ?)',
    [name, age, grade]
  );
  res.status(201).json({ id: result.insertId, name, age, grade });
});

app.put('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, grade } = req.body;
  const [result] = await pool.query(
    'UPDATE Students SET name = ?, age = ?, grade = ? WHERE id = ?',
    [name, age, grade, id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Student not found' });
  res.json({ id: Number(id), name, age, grade });
});

app.delete('/students/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM Students WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Student not found' });
  res.json({ message: 'Student deleted' });
});

app.listen(process.env.PORT || 3000, () => console.log('Students API running'));
