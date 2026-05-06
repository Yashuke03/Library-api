const express = require('express');
const pool = require('./db');
const app = express();
app.use(express.json());

app.get('/products', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM Products ORDER BY id DESC');
  res.json(rows);
});

app.get('/products/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Product not found' });
  res.json(rows[0]);
});

app.put('/products/:id', async (req, res) => {
  const { name, price, stock } = req.body;
  const [result] = await pool.query(
    'UPDATE Products SET name = ?, price = ?, stock = ? WHERE id = ?',
    [name, price, stock, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Product not found' });
  res.json({ id: Number(req.params.id), name, price, stock });
});

app.listen(process.env.PORT || 3000, () => console.log('Products API running'));
