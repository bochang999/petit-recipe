const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('🚀 Starting Puppeteer test...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('📱 Navigating to app...');
    await page.goto('http://127.0.0.1:8085');

    console.log('🔍 Testing button layout...');
    const actionButtonsRow = await page.$('.action-buttons-row');
    console.log('✅ action-buttons-row found:', !!actionButtonsRow);

    const debugButton = await page.$('.debug-logs-button');
    console.log('✅ debug button found:', !!debugButton);

    const addButton = await page.$('.add-recipe-button');
    console.log('✅ add button found:', !!addButton);

    console.log('🎨 Testing CSS styling...');
    const buttonStyles = await page.evaluate(() => {
      const row = document.querySelector('.action-buttons-row');
      if (!row) return null;
      const styles = window.getComputedStyle(row);
      return {
        display: styles.display,
        justifyContent: styles.justifyContent,
        gap: styles.gap
      };
    });
    console.log('🎨 Button row styles:', buttonStyles);

    console.log('🧪 Testing debug panel...');
    const debugFound = await page.evaluate(() => {
      const debugBtn = document.querySelector('.debug-logs-button');
      if (debugBtn) {
        debugBtn.click();
        return true;
      }
      return false;
    });
    console.log('🧪 Debug panel test:', debugFound);

    console.log('📝 Testing form elements...');
    const formTest = await page.evaluate(() => {
      const titleInput = document.getElementById('recipe-title');
      const ingredientsInput = document.getElementById('recipe-ingredients');
      const instructionsInput = document.getElementById('recipe-instructions');
      return {
        titleFound: !!titleInput,
        ingredientsFound: !!ingredientsInput,
        instructionsFound: !!instructionsInput
      };
    });
    console.log('📝 Form elements:', formTest);

    await browser.close();
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
})();
