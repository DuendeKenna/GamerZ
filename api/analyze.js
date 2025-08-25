// Importa el SDK oficial de Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Exporta la función handler que Vercel ejecutará
export default async function handler(req, res) {
  // Solo permite peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Obtiene los datos enviados desde la página (frontend)
    const { gameName, components, availableGpus, availableCpus } = req.body;

    // Valida que los datos necesarios estén presentes
    if (!gameName || !components || !availableGpus || !availableCpus) {
      return res.status(400).json({ error: 'Faltan datos del juego, componentes o listas de hardware.' });
    }

    // Obtiene la API Key de las variables de entorno de Vercel (¡más seguro!)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Este error se verá en los logs de Vercel si la variable no está configurada
      console.error("GEMINI_API_KEY no está configurada en las variables de entorno.");
      return res.status(500).json({ error: 'Error de configuración del servidor.' });
    }
    
    // Formatea las listas de hardware disponible para el prompt
    const gpuOptionsText = availableGpus
        .filter(gpu => gpu.price > 0) // Filtra solo las GPUs dedicadas
        .map(gpu => `- ${gpu.name}`)
        .join('\n');

    // Inicializa la IA generativa de Google con la clase correcta
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construye el prompt para la IA con los datos y las nuevas instrucciones
    const prompt = `
        Actuá como un experto en hardware de PC gamer en Argentina. Sos un asesor honesto y tu objetivo es darle al cliente la información justa y necesaria. Usá jerga gamer casual.

        **TAREA:** Analizá si la PC que está armando el cliente es buena para el juego "${gameName}".

        **PC ARMADA:**
        - CPU: ${components.cpu.name}
        - RAM: ${components.totalRam} GB (siempre en Dual Channel)
        - GPU Actual: ${components.selectedGpu.name}

        **GPUs Dedicadas Disponibles (para recomendar SOLO si es necesario):**
        ${gpuOptionsText}

        **INSTRUCCIONES CLAVE Y OBLIGATORIAS:**
        - NO uses títulos, tu respuesta empieza en el punto 1 y sin presentaciones.
        - Usa un lenguaje neutro en cuanto a género para referirte al cliente porque no sabemos si es hombre o mujer.
        - El objetivo del cliente es 60 FPS estables en 1080p.

        **FORMATO OBLIGATORIO (SOLO 3 PUNTOS):**

        1.  **Veredicto Rápido:** ¿Sirve o no sirve la PC actual para este juego? Sé directo y claro, si el setup es suficiente para correr el juego a 60 FPS, lo corre. En el siguiente apartado (punto 2) te explayarás sobre la calidad a la que puede correrlo.

        2.  **Rendimiento con la PC Actual:** Estimación realista de FPS y calidad gráfica (Baja/Media/Alta) en 1080p.

        3.  **Análisis y Recomendación:**
            - **SI LA PC ACTUAL RINDE BIEN (60+ FPS estables):** Decilo con seguridad y afirmá que no necesita ninguna mejora. Tu respuesta DEBE terminar acá. Ejemplo: "Para LoL, esta configuración es perfecta. Vas a jugar de 10 y no necesitás gastar un peso más. ¡A disfrutar!".
            - **SI LA PC ACTUAL NO RINDE BIEN (<60 FPS):** Indicalo y recomendá UNA SOLA GPU dedicada de la lista (la más lógica y económica) para alcanzar los 60 FPS.
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
