const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Endpoint de prueba para verificar que el servidor funciona
app.get('/api', (req, res) => {
  res.json({ message: '¡Hola! La API está funcionando correctamente.' });
});

// Endpoint para obtener todas las propiedades
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las propiedades.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});