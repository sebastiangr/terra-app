const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const { scrapeUrl } = require('./services/scraper');
const { analyzeProperty } = require('./services/ai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración DB (SQL Puro)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- MIDDLEWARE DE SEGURIDAD (MVP) ---
const ACCESS_CODE = process.env.ACCESS_CODE;

const checkAuth = (req, res, next) => {
  const code = req.headers['x-access-code'];
  if (code === ACCESS_CODE) {
    next();
  } else {
    res.status(401).json({ error: 'Acceso denegado. Código incorrecto.' });
  }
};

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


// 1. Endpoint Principal: ANALIZAR URL
app.post('/api/analyze', checkAuth, async (req, res) => {
  const { url } = req.body;
  
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    // Paso 1: Scraper
    const scrapeData = await scrapeUrl(url);
    
    // Paso 2: IA
    const aiAnalysis = await analyzeProperty(scrapeData, url);

    // Combinar resultados para que el Front los muestre (sin guardar aún)
    const responseData = {
      original_url: url,
      scraped_image: scrapeData.image,
      ...aiAnalysis
    };

    res.json(responseData);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Guardar Propiedad (Confirmado por usuario)
app.post('/api/properties', checkAuth, async (req, res) => {
  const data = req.body;
  // Asignamos source basado en URL
  const source = data.original_url.includes('facebook') ? 'Facebook' : 
                  data.original_url.includes('mercadolibre') ? 'MercadoLibre' : 'Otro';

  const query = `
    INSERT INTO properties (url, source, price, currency, location, title, main_image, ai_data)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    data.original_url,
    source,
    data.price,
    data.currency,
    data.location,
    data.title,
    data.scraped_image,
    JSON.stringify({ 
      description: data.description,
      features: data.features,
      sentiment: data.sentiment,
      type: data.type
    })
  ];

  try {
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error guardando en DB' });
  }
});

// Listar Propiedades
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