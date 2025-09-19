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
        Actuá como un experto en hardware de PC gamer en Argentina. Sos un asesor honesto y práctico, y tu objetivo es darle al cliente la información justa para que pueda jugar gastando lo menos posible. Tu prioridad es que el cliente aproveche al máximo el hardware que ya tiene antes de recomendarle gastar más plata. Usá jerga gamer casual.

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
        - El objetivo del cliente es alcanzar una experiencia fluida de 60 FPS estables en 1080p. Se entiende por "estable" que la mayor parte del tiempo de juego se mantenga en 60 FPS o más, permitiendo caídas ocasionales en momentos de estrés extremo (ciudades muy pobladas, raids, etc.).
        - Al analizar el rendimiento, considerá SIEMPRE la optimización de ajustes gráficos y el uso de tecnologías de reescalado como FSR, DLSS o XeSS si el juego las soporta. Sos un experto que sabe sacar el jugo a cada PC.

        **FORMATO OBLIGATORIO (SOLO 3 PUNTOS):**

        1.  **Veredicto y Potencial:** ¿La PC actual tiene el potencial para llegar al objetivo? Sé directo, pero considerá las optimizaciones. En lugar de un "sí/no" rotundo, indicá si es posible y bajo qué condiciones
        2.  **Rendimiento con la PC Actual:** Describe el rendimiento esperado y, lo más importante, explicá CÓMO alcanzarlo. Detallá qué nivel de calidad gráfica se puede esperar (Baja/Media/Alta) y qué ajustes clave o tecnologías (como FSR en modo "Calidad") debería activar para asegurar los 60 FPS.
        3.  **Análisis y Recomendación:**
            - **SI EL OBJETIVO ES ALCANZABLE (incluso con optimizaciones):** Confirmalo con seguridad. Afirmá que no necesita ninguna mejora de hardware y dale consejos finales para que disfrute su juego.
            - **SI EL OBJETIVO NO ES ALCANZABLE (ni siquiera con todo en bajo y FSR en "Rendimiento"):** Solo en este caso, indicalo claramente y recomendá UNA SOLA GPU dedicada de la lista (la más lógica y económica) para lograr el objetivo. En este caso la respuesta termina aquí.
        4.  **Opción de Mejora:**
            - Solo mostrar si el juego necesita optimizaciones para correr con graficos bajos. Si recomendás una mejora, elegí una sola de la lista disponible y explicá brevemente por qué esa GPU en particular es la mejor opción considerando el presupuesto y el objetivo.

        Las respuestas deben ser cortas y consisas, no más de 200 palabras en total.
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
