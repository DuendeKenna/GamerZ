// Importa el SDK de Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Exporta la función handler que Vercel ejecutará
export default async function handler(req, res) {
  // Solo permite peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Obtiene los datos enviados desde la página (frontend)
    const { gameName, components } = req.body;

    // Valida que los datos necesarios estén presentes
    if (!gameName || !components) {
      return res.status(400).json({ error: 'Faltan datos del juego o componentes.' });
    }

    // Obtiene la API Key de las variables de entorno de Vercel (¡más seguro!)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Este error se verá en los logs de Vercel si la variable no está configurada
      console.error("GEMINI_API_KEY no está configurada en las variables de entorno.");
      return res.status(500).json({ error: 'Error de configuración del servidor.' });
    }
    
    // Inicializa la IA generativa de Google
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Construye el prompt para la IA con los datos recibidos
    const prompt = `
        Actuá como un experto en hardware de PC y gaming que habla de forma casual y directa, como en la jerga gamer argentina.
        Analizá el rendimiento esperado para el juego "${gameName}" con la siguiente configuración de PC:
        - CPU: ${components.cpu.name}
        - RAM: ${components.totalRam} GB
        - Tarjeta Gráfica (GPU): ${components.selectedGpu.name}
        - Almacenamiento: ${components.selectedSsd.name}

        Tu respuesta debe ser concisa y en formato Markdown, estructurada de la siguiente manera:
        1.  **Veredicto Rápido:** Una o dos frases directas sobre si la PC se la banca para este juego y qué se puede esperar en general.
        2.  **Rendimiento Estimado (1080p):** Da una estimación de FPS (fotogramas por segundo) en resolución 1080p. Sé realista. Especifica una calidad gráfica aproximada (Baja, Media, Alta, Ultra). Por ejemplo: "En 1080p con gráficos en Medio, podés esperar unos 60-75 FPS bastante estables."
        3.  **Análisis y Recomendaciones:** Explica brevemente por qué das esa estimación. Si hay un cuello de botella (por ejemplo, la gráfica integrada para un juego muy exigente), mencionalo. Si la configuración es ideal, decilo también. Ofrecé una recomendación clave si es necesaria para mejorar la experiencia en ESE juego (ej: "Para este título, la posta sería saltar a la gráfica dedicada para no sufrir tirones").
    `;

    // Genera el contenido usando el modelo de IA
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Envía la respuesta de la IA de vuelta a la página
    res.status(200).json({ result: text });

  } catch (error) {
    // Manejo de errores
    console.error("Error en la función de Vercel:", error);
    res.status(500).json({ error: 'Hubo un problema al contactar a la IA.' });
  }
}
