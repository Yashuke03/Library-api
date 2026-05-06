const express = require('express');
const pool = require('./db');
const app = express();
app.use(express.json());

app.get('/contacts', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM Contacts ORDER BY id DESC');
  res.json(rows);
});

app.post('/contacts', async (req, res) => {
  const { name, phone, email } = req.body;
  const [result] = await pool.query(
    'INSERT INTO Contacts (name, phone, email) VALUES (?, ?, ?)',
    [name, phone, email]
  );
  res.status(201).json({ id: result.insertId, name, phone, email });
});

app.delete('/contacts/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM Contacts WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Contact not found' });
  res.json({ message: 'Contact deleted' });
});

app.listen(process.env.PORT || 3000, () => console.log('Contacts API running'));
