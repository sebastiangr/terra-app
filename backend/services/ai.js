const { GoogleGenAI } = require("@google/genai");

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeProperty(scrapeData, url) {
  
  const { text } = scrapeData;

  // Si hubo error en scraping, devolvemos objeto vacío
  if (!text || scrapeData.error) {
      return emptySchema();
  }

  const prompt = `
  Analiza estos METADATOS de un enlace inmobiliario.
  URL: ${url}
  DATA: """${text}"""

  OBJETIVO: Pre-llenar un formulario.
  
  INSTRUCCIONES DE EXTRACCIÓN Y LIMPIEZA:
  
  1. TÍTULO (IMPORTANTE): 
    - Ignora el título original si es subjetivo.
    - Genera un título NUEVO y OBJETIVO con el formato: "{Tipo de Inmueble} en {Ubicación}".
    - EJEMPLO MALO: "Hermosa casa regalada gangazo en Guarne".
    - EJEMPLO BUENO: "Casa Campestre en Guarne, Antioquia".
    - Elimina adjetivos como: Hermosa, Espectacular, Barata, Oportunidad, Gangazo, Lujosa.

  2. UBICACIÓN:
    - Sé lo más específico posible (Municipio, Vereda, Barrio).

  3. PRECIO:
    - Si aparece en "Precio Metadata", úsalo.
    - Si no, búscalo en la descripción.
    - Si es confuso o dice "A convenir", pon null.

  4. CARACTERÍSTICAS:
    - Extrae habitaciones, baños, etc., solo si estás seguro.

  INSTRUCCIONES:
  1. Extrae lo que puedas confirmar (habitaciones, área, ubicación) del título o descripción.
  2. Si un dato no está explícito, DEJA NULL (no inventes).
  3. El precio puede venir en la DATA como "Precio Detectado", úsalo. Si no, búscalo en el texto.
  4. Sentiment: Breve opinión basada en la descripción corta.

  SCHEMA JSON:
  {
      "title": "string (El título limpio)",
      "description": "string (Resumen de max 150 caracteres)",
      "price": number | null,
      "currency": "string",
      "location": "string",
      "type": "string (Casa, Finca, Lote, Apartamento)",
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
      config: { responseMimeType: 'application/json' },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    let jsonText = response.text;
    if (!jsonText && response.candidates?.length > 0) jsonText = response.candidates[0].content.parts[0].text;

    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error IA:", error);
    return emptySchema(); // Fallback elegante
  }
}

function emptySchema() {
  return {
    title: "", description: "", price: null, currency: "COP", location: "", type: "",
    features: { bedrooms: null, bathrooms: null, area_total_m2: null, parking: false },
    sentiment: { pros: [], cons: [], score: 0 }
  };
}

module.exports = { analyzeProperty };