import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000');
  // Open chatbot toggle
  await page.click('#chatbot-toggle');
  await page.fill('#chatbot-input', 'Teste de integração');
  await page.click('#chatbot-send');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test/screenshots/desktop-chat.png', fullPage: false });

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000');
  await page.click('#chatbot-toggle');
  await page.fill('#chatbot-input', 'Teste mobile');
  await page.click('#chatbot-send');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test/screenshots/mobile-chat.png', fullPage: false });

  await browser.close();
  console.log('Screenshots saved to test/screenshots/');
})();
