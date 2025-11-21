const puppeteer = require('puppeteer');

async function scrapeUrl(url) {
  console.log(`🕷️ Iniciando scraping optimizado de: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-features=IsolateOrigins,site-per-process', // Ahorra memoria
      '--blink-settings=imagesEnabled=false' // Deshabilita imágenes a nivel motor
    ]
  });

  try {
    const page = await browser.newPage();
    
    // 1. Optimización: Interceptar requests para bloquear basura
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // User Agent realista
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    // 2. Optimización: Timeout más largo y esperar solo al DOM
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', // Mucho más rápido que networkidle2
      timeout: 60000 // 60 segundos por si el VPS es lento
    });

    // Pequeña espera extra para asegurar que algún JS crítico cargue (opcional)
    // await new Promise(r => setTimeout(r, 2000));

    const data = await page.evaluate(() => {
      // Intentamos sacar la imagen del OpenGraph (meta tags) ya que bloqueamos la carga visual
      const ogImage = document.querySelector('meta[property="og:image"]')?.content || 
                      document.querySelector('meta[name="twitter:image"]')?.content;
      
      const rawText = document.body.innerText;

      return {
        image: ogImage || null,
        text: rawText.replace(/\s+/g, ' ').substring(0, 20000)
      };
    });

    return data;

  } catch (error) {
    console.error("❌ Error en Scraper:", error);
    throw new Error(`Falló el scraping: ${error.message}`);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeUrl };