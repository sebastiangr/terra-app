// backend/services/scraper.js
const puppeteer = require('puppeteer-extra'); // <--- Usamos la versión Extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Activamos el modo sigilo (oculta que es un bot)
puppeteer.use(StealthPlugin());

async function scrapeUrl(rawUrl) {
  // 1. Limpieza de URL (Vital para MercadoLibre)
  // Quitamos tracking de Facebook (?utm_...) que suele forzar el login
  const url = rawUrl.split('?')[0]; 
  
  console.log(`🕷️ Iniciando scraping Stealth en: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: "new", 
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
    ]
  });

  try {
    const page = await browser.newPage();
    
    // 2. Configuración Humana
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Header de idioma aceptado (importante para evitar redirecciones raras)
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    });

    // 3. Navegación "Lenta pero Segura"
    // Quitamos el bloqueo de recursos. ML detecta si no cargas CSS/Fuentes.
    await page.goto(url, { 
      waitUntil: 'networkidle2', // Esperamos a que termine de cargar todo
      timeout: 60000 
    });

    // 4. Validación de éxito (Detectar si nos mandó al login)
    const title = await page.title();
    if (title.includes("Ingresa") || title.includes("Login") || title.includes("Robot")) {
      throw new Error("MercadoLibre detectó el bot y pidió Login.");
    }

    // 5. Scroll humano (Cargar lazy images)
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 3000) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // 6. Extracción
    const data = await page.evaluate(() => {
      // Selectores específicos de ML para la imagen (backup)
      const ogImage = document.querySelector('meta[property="og:image"]')?.content || 
                      document.querySelector('img.ui-pdp-gallery__figure__image')?.src;
      
      const rawText = document.body.innerText;

      return {
        image: ogImage || null,
        // Cortamos un poco menos para asegurar que entre la info técnica
        text: rawText.replace(/\s+/g, ' ').substring(0, 25000)
      };
    });

    return data;

  } catch (error) {
    console.error("❌ Error en Scraper:", error);
    throw new Error(`Scraping fallido: ${error.message}`);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeUrl };