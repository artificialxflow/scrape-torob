// scrape.js
// Node.js script for scraping Torob category products using Puppeteer Extra + Stealth
// Usage: node scrape.js <category_url>

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeCategory(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({
    'accept-language': 'fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7',
  });
  await page.goto(url, { waitUntil: 'networkidle2' });

  // اسکرول خودکار برای لود شدن محصولات بیشتر
  await page.evaluate(async () => {
    for (let i = 0; i < 10; i++) {
      window.scrollBy(0, window.innerHeight);
      await new Promise(res => setTimeout(res, 500));
    }
  });
  await new Promise(res => setTimeout(res, 5000)); // ۵ ثانیه صبر کن

  // ذخیره HTML صفحه برای دیباگ
  const html = await page.content();
  require('fs').writeFileSync('debug.html', html);

  const currentUrl = await page.url();
  let products = [];
  let debug = { currentUrl, foundInFrame: false, frameCount: 1 };

  // ابتدا در صفحه اصلی جستجو کن
  try {
    await page.waitForSelector('div[data-testid="product-card"]', { timeout: 5000 });
    products = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div[data-testid="product-card"]')).map(card => {
        let link = '';
        let parent = card.parentElement;
        while (parent && parent.tagName !== 'A') parent = parent.parentElement;
        if (parent && parent.tagName === 'A') link = parent.href;
        // تلاش برای یافتن تصویر معتبر
        let img = '';
        const imgs = card.querySelectorAll('img');
        for (const im of imgs) {
          if (im.src && im.src.startsWith('http') && im.src.length > 20) {
            img = im.src;
            break;
          }
        }
        if (!img) {
          // اگر img پیدا نشد، شاید در تگ picture باشد
          const pic = card.querySelector('picture img');
          if (pic && pic.src && pic.src.startsWith('http')) img = pic.src;
        }
        const name = card.innerText.split('\n')[0] || '';
        const priceMatch = card.innerText.match(/از\s[\d,\.]+\sتومان/);
        const price = priceMatch ? priceMatch[0] : '';
        const shopMatch = card.innerText.match(/در\s[\d,\.]+\sفروشگاه/);
        const shops = shopMatch ? shopMatch[0] : '';
        const isAd = !!card.querySelector('.ProductCard_desktop_adv_badge__3LVVm');
        return { name, price, shops, link, img, isAd };
      });
    });
    debug.foundInFrame = false;
  } catch (e) {
    // اگر در صفحه اصلی نبود، همه فریم‌ها را چک کن
    const frames = page.frames();
    debug.frameCount = frames.length;
    for (const frame of frames) {
      try {
        const els = await frame.$$('div[data-testid="product-card"]');
        if (els.length > 0) {
          products = await frame.evaluate(() => {
            return Array.from(document.querySelectorAll('div[data-testid="product-card"]')).map(card => {
              let link = '';
              let parent = card.parentElement;
              while (parent && parent.tagName !== 'A') parent = parent.parentElement;
              if (parent && parent.tagName === 'A') link = parent.href;
              // تلاش برای یافتن تصویر معتبر
              let img = '';
              const imgs = card.querySelectorAll('img');
              for (const im of imgs) {
                if (im.src && im.src.startsWith('http') && im.src.length > 20) {
                  img = im.src;
                  break;
                }
              }
              if (!img) {
                const pic = card.querySelector('picture img');
                if (pic && pic.src && pic.src.startsWith('http')) img = pic.src;
              }
              const name = card.innerText.split('\n')[0] || '';
              const priceMatch = card.innerText.match(/از\s[\d,\.]+\sتومان/);
              const price = priceMatch ? priceMatch[0] : '';
              const shopMatch = card.innerText.match(/در\s[\d,\.]+\sفروشگاه/);
              const shops = shopMatch ? shopMatch[0] : '';
              const isAd = !!card.querySelector('.ProductCard_desktop_adv_badge__3LVVm');
              return { name, price, shops, link, img, isAd };
            });
          });
          debug.foundInFrame = true;
          break;
        }
      } catch {}
    }
  }

  await browser.close();
  return { products, debug };
}

// Entry point
(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scrape.js <category_url>');
    process.exit(1);
  }
  try {
    const result = await scrapeCategory(url);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(2);
  }
})(); 