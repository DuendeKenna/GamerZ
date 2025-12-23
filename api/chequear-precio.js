// api/chequear-precio.js - Proxy seguro para la API de Mercado Libre
// removed express import

// Helper para CORS
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

// --- Cache simple en memoria para el token ---
let globalToken = null;
let tokenExpiresAt = 0;

async function getAccessToken(appId, secretKey) {
  const now = Date.now();
  if (globalToken && now < tokenExpiresAt - 600000) {
    return globalToken;
  }

  const tokenUrl = 'https://api.mercadolibre.com/oauth/token';
  const tokenParams = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: appId,
    client_secret: secretKey,
  });

  console.log(`[API] Solicitando Token ML (AppID: ${appId ? appId.slice(0, 5) + '...' : 'N/A'})`);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams,
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('[API] Error Auth ML:', data);
    throw new Error(`Error Auth ML: ${data.message || 'Desconocido'} (${data.error || 'no_error_code'})`);
  }

  globalToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in * 1000);
  console.log('[API] Nuevo Token obtenido con éxito.');
  return globalToken;
}

const handler = async (req, res) => {
  // Asegurar itemId
  const { itemId } = req.query;

  if (!itemId) {
    return res.status(400).json({ error: 'El parámetro itemId es requerido.' });
  }

  const APP_ID = process.env.ML_APP_ID;
  const SECRET_KEY = process.env.ML_SECRET_KEY;

  if (!APP_ID || !SECRET_KEY) {
    console.error('[API] Error: Faltan credenciales en variables de entorno.');
    return res.status(500).json({ error: 'Servidor mal configurado (Credenciales faltantes).' });
  }

  try {
    const token = await getAccessToken(APP_ID, SECRET_KEY);

    // Consultamos la API oficial de items
    const apiUrl = `https://api.mercadolibre.com/items/${itemId}`;

    // console.log(`[API] Fetching ${apiUrl}`);

    const apiResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!apiResponse.ok) {
      const errData = await apiResponse.json().catch(() => ({}));
      console.warn(`[API] Error ${apiResponse.status} para ${itemId}:`, errData);
      // Retornar el error original de ML
      return res.status(apiResponse.status).json({
        error: `API ML retornó ${apiResponse.status}`,
        details: errData
      });
    }

    const itemData = await apiResponse.json();

    const price = itemData.price;
    const available_quantity = itemData.available_quantity;
    const title = itemData.title;
    const itemStatus = itemData.status;

    return res.status(200).json({
      price,
      available_quantity,
      title,
      status: itemStatus,
      currency_id: itemData.currency_id
    });

  } catch (error) {
    console.error('[API] Excepción fatal en handler:', error);
    return res.status(500).json({ error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
};

export default allowCors(handler);
