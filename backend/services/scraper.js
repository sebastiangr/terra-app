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
        timeout: 15000 // 10 segundos máximo
    });

    const $ = cheerio.load(data);

    // 1. Extracción Meta Tags (OpenGraph)
    const metadata = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      site_name: $('meta[property="og:site_name"]').attr('content')
    };

    // 2. Extracción JSON-LD (Especial para MercadoLibre)
    let jsonImage = null;
    let rawPrice = null;
    let currency = null;
    let jsonDescription = '';

    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const jsonStr = $(el).html();
        if (!jsonStr) return;
        
        const json = JSON.parse(jsonStr);
        const items = Array.isArray(json) ? json : [json];
        
        for (const item of items) {
          // Buscamos objetos de Producto u Oferta
          if (['Product', 'Offer', 'RealEstateListing'].includes(item['@type']) || item['offers']) {
            
            // Imagen: A veces viene en 'image', 'image[0]' o dentro de 'offers'
            if (item.image) {
              jsonImage = Array.isArray(item.image) ? item.image[0] : item.image;
            }

            // Descripción oculta en JSON
            if (item.description) jsonDescription = item.description;

            // Precio
            const offer = item.offers ? (Array.isArray(item.offers) ? item.offers[0] : item.offers) : item;
            if (offer && offer.price) {
              rawPrice = offer.price;
              currency = offer.priceCurrency;
            }
          }
        }
      } catch (e) { 
      }
    });

    // Definimos finalImage explícitamente
    const finalImage = jsonImage || metadata.image || null;

    if (jsonLdData.offers) {
      const offer = Array.isArray(jsonLdData.offers) ? jsonLdData.offers[0] : jsonLdData.offers;
      rawPrice = offer.price;
      currency = offer.priceCurrency;
    }

    // Preparamos el texto para la IA
    const textForAI = `
    Título Original: ${metadata.title}
    Descripción Meta: ${metadata.description}
    Descripción JSON: ${jsonDescription}
    Sitio: ${metadata.site_name}
    Precio Metadata: ${rawPrice ? rawPrice + ' ' + currency : 'No detectado'}
    `;

    return {
      image: finalImage, // Ahora sí está definida
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