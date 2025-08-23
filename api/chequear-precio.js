// api/index.js - Nuestro backend con Express.js

const express = require('express');
const app = express();

// Middleware para parsear JSON (útil para futuras peticiones POST)
app.use(express.json());

// --- Creamos nuestra ruta (endpoint) para chequear precios ---
// El frontend llamará a: /api/chequear-precio?itemId=MLA12345
app.get('/api/chequear-precio', async (req, res) => {
  // 1. Obtenemos el itemId de la URL
  const { itemId } = req.query;

  if (!itemId) {
    return res.status(400).json({ error: 'El parámetro itemId es requerido.' });
  }

  // 2. Obtenemos las credenciales seguras desde las Variables de Entorno de Vercel
  const APP_ID = process.env.ML_APP_ID;
  const SECRET_KEY = process.env.ML_SECRET_KEY;

  if (!APP_ID || !SECRET_KEY) {
    return res.status(500).json({ error: 'Las credenciales de la API no están configuradas en el servidor.' });
  }

  try {
    // 3. Obtenemos el Access Token de Mercado Libre
    const tokenUrl = 'https://api.mercadolibre.com/oauth/token';
    const tokenParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: APP_ID,
      client_secret: SECRET_KEY,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams,
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error(`Error de autenticación de ML: ${tokenData.message || 'Respuesta inválida'}`);
    }
    
    const accessToken = tokenData.access_token;

  // 4. Consultamos la página pública del producto
  const publicUrl = `https://www.mercadolibre.com.ar/p/${itemId}`;
  const pageResponse = await fetch(publicUrl);
  const html = await pageResponse.text();
  if (!pageResponse.ok) {
    throw new Error(`Error al consultar la página pública del item ${itemId}`);
  }

  // 5. Parseamos el HTML para obtener precio y cantidad disponible
  // Usamos expresiones regulares simples para extraer los datos
  const priceMatch = html.match(/"price":([0-9]+)/);
  const quantityMatch = html.match(/"available_quantity":([0-9]+)/);
  const price = priceMatch ? parseInt(priceMatch[1], 10) : null;
  const available_quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : null;

  if (price === null) {
    throw new Error(`No se pudo encontrar el precio del producto en la página pública.`);
  }

  res.status(200).json({ price, available_quantity });

  } catch (error) {
    console.error('Error en el endpoint /api/chequear-precio:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Exportamos la app para que Vercel la pueda usar ---
// Vercel buscará este 'module.exports' y lo ejecutará.
module.exports = app;
