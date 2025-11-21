const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración DB (SQL Puro)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test de conexión DB al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a la DB:', err);
  } else {
    console.log('Conexión exitosa a PostgreSQL:', res.rows[0]);
  }
});

// Rutas Básicas
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Terra API is running 🚀' });
});

// Endpoint de prueba para ver datos (temporal)
app.get('/api/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});