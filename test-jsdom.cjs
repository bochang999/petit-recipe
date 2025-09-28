const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const http = require('http');

async function testApplication() {
  try {
    console.log('🚀 Starting JSDOM test...');

    // Fetch the HTML from our server
    const response = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:8085', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    console.log('📱 Creating DOM from HTML...');
    const dom = new JSDOM(response, {
      url: 'http://127.0.0.1:8085',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    const { document } = dom.window;

    console.log('🔍 Testing button layout...');
    const actionButtonsRow = document.querySelector('.action-buttons-row');
    console.log('✅ action-buttons-row found:', !!actionButtonsRow);

    if (actionButtonsRow) {
      const buttons = actionButtonsRow.querySelectorAll('button');
      console.log('🔢 Number of buttons in row:', buttons.length);

      buttons.forEach((btn, index) => {
        const classes = Array.from(btn.classList);
        const text = btn.textContent || btn.title || 'No text';
        console.log(`  Button ${index + 1}: ${text} - Classes: ${classes.join(', ')}`);
      });
    }

    console.log('📝 Testing form elements...');
    const titleInput = document.getElementById('recipe-title');
    const ingredientsInput = document.getElementById('recipe-ingredients');
    const instructionsInput = document.getElementById('recipe-instructions');

    console.log('📝 Form elements found:');
    console.log('  - Title input:', !!titleInput);
    console.log('  - Ingredients input:', !!ingredientsInput);
    console.log('  - Instructions input:', !!instructionsInput);

    console.log('🎨 Testing sort tabs...');
    const sortTabs = document.querySelectorAll('.sort-tab');
    console.log('🎨 Sort tabs found:', sortTabs.length);
    sortTabs.forEach((tab, index) => {
      console.log(`  Tab ${index + 1}: ${tab.textContent} - Active: ${tab.classList.contains('active')}`);
    });

    console.log('🍳 Testing debug buttons...');
    const debugButtons = document.querySelectorAll('.debug-logs-button');
    console.log('🍳 Debug buttons found:', debugButtons.length);

    console.log('✅ JSDOM test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApplication();
