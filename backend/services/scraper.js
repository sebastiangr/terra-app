const puppeteer = require('puppeteer');

async function scrapeUrl(url) {
  console.log(`🕷️ Iniciando scraping de: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
        
    // Truco: Fingir ser un navegador real de escritorio
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    // Ir a la URL y esperar a que la red se calme (max 30s)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Lógica de extracción
    const data = await page.evaluate(() => {
      // 1. Intentar sacar la imagen principal (Meta tags suelen ser más fiables que clases CSS ofuscadas)
      const ogImage = document.querySelector('meta[property="og:image"]')?.content;
      
      // 2. Sacar todo el texto visible del cuerpo
      const rawText = document.body.innerText;

      // 3. Limpieza básica (quitar saltos de línea excesivos)
      return {
        image: ogImage || null,
        text: rawText.replace(/\s+/g, ' ').substring(0, 15000) // Limitar caracteres para no saturar a Gemini
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