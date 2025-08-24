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
    
    const cpuOptionsText = availableCpus
        .map(cpu => `- ${cpu.name} (ID: ${cpu.id})`)
        .join('\n');

    // Inicializa la IA generativa de Google con la clase correcta
    const genAI = new GoogleGenerativeAI(apiKey);
    // Usa el modelo "gemini-1.5-flash", más rápido y con límites más generosos
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construye el prompt para la IA con los datos y las nuevas instrucciones
    const prompt = `
        Actuá como un experto en hardware de PC y gaming realista y bien informado, que habla de forma casual, directa y sin lenguaje ofensivo, como en la jerga gamer argentina.
        
        **Contexto:** Estás asistiendo a un cliente que está configurando una PC de gama media para comprarla. Tu objetivo es dar una estimación precisa y útil para ayudarlo a decidir. Diferenciá claramente entre juegos e-sports/livianos y juegos AAA exigentes.

        **Configuración de PC seleccionada:**
        - CPU: ${components.cpu.name}
        - RAM: ${components.totalRam} GB (siempre en Dual Channel)
        - Tarjeta Gráfica (GPU) actual: ${components.selectedGpu.name}
        - Almacenamiento: ${components.selectedSsd.name}

        **Juego a analizar:** "${gameName}"

        **Hardware disponible para recomendar (si es necesario):**
        CPUs con gráficos integrados (APUs):
        ${cpuOptionsText}
        GPUs dedicadas:
        ${gpuOptionsText}

        **Instrucciones para tu respuesta:**
        - No incluyas un título.
        - Tu respuesta debe tener únicamente los siguientes 3 puntos, en formato Markdown.
        - El objetivo es una experiencia jugable (al menos 50-60 FPS estables). No apuntamos a Ultra, sino a un buen balance de calidad/rendimiento.
        - La RAM siempre está en Dual Channel, tenelo muy en cuenta para el rendimiento de los gráficos integrados.
        
        **Lógica de recomendación obligatoria:**
        1. Evalúa el rendimiento con la **configuración actual**.
        2. Si el rendimiento es bajo y la GPU actual es integrada, **primero** revisa si otro CPU de la lista de APUs disponibles ofrece una mejora suficiente para jugar decentemente.
        3. **SOLO si ninguna APU de la lista es suficiente**, recomendá la GPU dedicada más económica y lógica de la lista.

        **Formato de respuesta requerido:**
        1.  **Veredicto Rápido:** Una o dos frases directas sobre si la PC se la banca para este juego.
        2.  **Rendimiento Estimado (1080p):** Da una estimación de FPS realista en resolución 1080p con la **configuración actual**. Especifica una calidad gráfica (Baja, Media, Alta).
        3.  **Análisis y Opciones de Mejora:** Si la configuración actual es suficiente, decilo. Si no lo es, seguí la lógica de recomendación. Luego, si hay GPUs dedicadas disponibles, explicá de forma concisa qué mejora de rendimiento (FPS aproximados) podría esperar el cliente al agregar cada una de las GPUs dedicadas de la lista.
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
