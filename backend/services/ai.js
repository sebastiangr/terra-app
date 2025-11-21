const { GoogleGenAI } = require("@google/genai");

// Inicializar Gemini
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeProperty(rawText, url) {
  
  if (!rawText || rawText.length < 200) {
    console.warn("⚠️ Texto insuficiente para análisis.");
    throw new Error("Contenido insuficiente (Posible Captcha o página vacía).");
  }

  const prompt = `
    Eres un experto en Real Estate. Analiza este texto crudo de una web inmobiliaria.
    
    URL: ${url}
    TEXTO: """${rawText}"""

    INSTRUCCIONES:
    1. Extrae datos clave.
    2. Precio: solo números (null si no hay). Moneda: normalizar a COP si es Colombia.
    3. Sentiment: análisis crítico de la oportunidad.
    
    SCHEMA JSON ESTRICTO:
    {
      "title": "string",
      "description": "string",
      "price": number | null,
      "currency": "string",
      "location": "string",
      "type": "string",
      "features": {
        "bedrooms": number | null,
        "bathrooms": number | null,
        "area_total_m2": number | null,
        "parking": boolean
      },
      "sentiment": {
        "pros": ["string"],
        "cons": ["string"],
        "score": number
      }
    }
  `;

  try {

    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash', 
      config: {
        responseMimeType: 'application/json',
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
    });

    const jsonText = response.text();
    
    if (!jsonText) {
      throw new Error("Respuesta vacía de Gemini");
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("❌ Error SDK GenAI:", error);
    throw new Error(`Fallo IA: ${error.message}`);
  }
}

module.exports = { analyzeProperty };