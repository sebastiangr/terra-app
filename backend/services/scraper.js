const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeUrl(url) {
  console.log(`⚡ Scraper Ligero: Procesando ${url}`);

  try {
    // Hacemos la petición fingiendo ser un bot de previsualización (como Facebook o Discord)
    // Esto suele evitar redirecciones al Login.
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
        },
        timeout: 10000 // 10 segundos máximo
    });

    const $ = cheerio.load(data);
    const metadata = {};

    // 1. Extracción OpenGraph (Estándar en FB y ML)
    metadata.title = $('meta[property="og:title"]').attr('content') || $('title').text();
    metadata.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
    metadata.image = $('meta[property="og:image"]').attr('content');
    metadata.url = $('meta[property="og:url"]').attr('content') || url;
    metadata.site_name = $('meta[property="og:site_name"]').attr('content');

    // 2. Extracción JSON-LD (Clave para ML)
    let jsonLdData = {};
    let jsonImage = null;
    let rawPrice = null;
    let currency = null;

    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        const items = Array.isArray(json) ? json : [json];
        
        for (const item of items) {
          // Buscar Oferta/Producto
          if (item['@type'] === 'Product' || item['@type'] === 'Offer' || item['offers']) {
            jsonLdData = item;
            
            // Intentar sacar imagen del JSON-LD (Suele ser mejor que OG)
            if (item.image) {
              // A veces es un string, a veces un array
              jsonImage = Array.isArray(item.image) ? item.image[0] : item.image;
            }

            // Precio
            if (item.offers) {
              const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              rawPrice = offer.price;
              currency = offer.priceCurrency;
            }
          }
        }
      } catch (e) { }
    });

    if (jsonLdData.offers) {
      const offer = Array.isArray(jsonLdData.offers) ? jsonLdData.offers[0] : jsonLdData.offers;
      rawPrice = offer.price;
      currency = offer.priceCurrency;
    }


    // Texto consolidado para IA
    const textForAI = `
    Título Original: ${metadata.title}
    Descripción: ${metadata.description}
    Sitio: ${metadata.site_name}
    Precio Metadata: ${rawPrice ? rawPrice + ' ' + currency : 'No detectado'}
    Ubicación Metadata: ${jsonLdData.description || ''} (Buscar en descripción)
    `;

    return {
      image: finalImage, // Devuelve la mejor imagen encontrada
      text: textForAI.trim(),
      rawMetadata: metadata
    };

  } catch (error) {
    console.error("❌ Error Axios/Cheerio:", error.message);
    // Si falla (403/404), devolvemos nulls para que el usuario llene todo manual
    return {
      image: null,
      text: "No se pudo acceder a la URL automáticamente. Ingreso manual requerido.",
      error: true
    };
  }
}

module.exports = { scrapeUrl };