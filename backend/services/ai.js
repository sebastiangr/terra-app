const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeProperty(rawText, url) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Actúa como un experto analista inmobiliario y extractor de datos.
  Analiza el siguiente texto extraído de un sitio web de bienes raíces (puede contener menús y basura, ignóralo).
  
  URL de origen: ${url}
  
  TEXTO A ANALIZAR:
  """
  ${rawText}
  """

  TU TAREA:
  Extrae la información y devuélvela SOLAMENTE en formato JSON válido (sin bloques de código markdown).
  Usa exactamente esta estructura. Si no encuentras un dato, pon null o 0.
  
  Estructura JSON requerida:
  {
      "title": "Título corto y descriptivo del anuncio",
      "description": "Resumen breve de la descripción (max 300 caracteres)",
      "price": 0, (Solo el número, convierte a COP si está en otra moneda o asume COP si no se dice. Si es 0 o 'consultar', pon null),
      "currency": "COP",
      "location": "Ciudad/Municipio y Barrio si aplica",
      "type": "Casa | Apartamento | Terreno | Finca | Otro",
      "features": {
          "bedrooms": 0,
          "bathrooms": 0,
          "area_total_m2": 0,
          "area_constructed_m2": 0,
          "parking": false,
          "stratum": 0 (estrato socioeconómico si aplica, sino null)
      },
      "sentiment": {
          "pros": ["pro1", "pro2"], (Lo bueno según la descripción)
          "cons": ["con1", "con2"], (Lo malo o faltante)
          "score": 0 (Califica del 1 al 10 la oportunidad según precio/características)
      }
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpieza: A veces Gemini devuelve ```json ... ```
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ Error en Gemini:", error);
    throw new Error("Falló el análisis de IA");
  }
}

module.exports = { analyzeProperty };