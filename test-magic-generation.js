// Test Magic Component Generation
// This script tests the Magic Component Generator and integrates it with petit-recipe

/**
 * Test script for Magic Component Generation
 */
async function testMagicGeneration() {
  console.log('🧪 Starting Magic Component Generation Test...');

  try {
    // Initialize the generator
    await window.magicGenerator.initialize();

    // Test component generation with petit-recipe requirements
    const recipeCardSpecs = {
      style: 'modern',
      features: ['thumbnail', 'title', 'servings', 'cookTime', 'difficulty'],
      layout: 'card',
      responsive: true,
      animations: true,
      clickable: true,
      theme: 'light'
    };

    console.log('🎨 Generating recipe card component...');
    const generatedComponent = await window.magicGenerator.generateRecipeCard(recipeCardSpecs);

    // Save the generated component
    const files = await window.magicGenerator.saveComponent(generatedComponent, 'enhanced-recipe-card');

    console.log('✅ Component generation completed!');
    console.log('📋 Generated files:', Object.keys(files));

    // Test rendering with sample data
    await testComponentRendering(generatedComponent);

    return {
      success: true,
      component: generatedComponent,
      files: files,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Magic generation test failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test component rendering with sample recipe data
 */
async function testComponentRendering(component) {
  console.log('🖼️ Testing component rendering...');

  try {
    // Create a test container
    const testContainer = document.createElement('div');
    testContainer.id = 'magic-test-container';
    testContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border: 2px solid #3498db;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '❌ Close Test';
    closeButton.style.cssText = `
      margin-bottom: 12px;
      padding: 8px 12px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    closeButton.onclick = () => testContainer.remove();

    testContainer.appendChild(closeButton);

    // Add title
    const title = document.createElement('h3');
    title.textContent = '🔮 Magic Generated Component';
    title.style.margin = '0 0 12px 0';
    testContainer.appendChild(title);

    // Sample recipe data
    const sampleRecipe = {
      id: 'test-recipe-1',
      name: 'Magic Generated Recipe Card',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM0OThkYiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2FtcGxlIFJlY2lwZTwvdGV4dD48L3N2Zz4=',
      category: 'Test',
      servings: 4,
      cookTime: '30 min',
      difficulty: 'easy'
    };

    // Create a render container
    const renderContainer = document.createElement('div');
    testContainer.appendChild(renderContainer);

    // Inject the CSS
    const style = document.createElement('style');
    style.textContent = component.css;
    document.head.appendChild(style);

    // Render the component
    if (window.EnhancedRecipeCard) {
      window.EnhancedRecipeCard.render(sampleRecipe, renderContainer);
      console.log('✅ Component rendered successfully');
    } else {
      // Fallback rendering
      renderContainer.innerHTML = component.html
        .replace(/\{\{recipeId\}\}/g, sampleRecipe.id)
        .replace(/\{\{recipeName\}\}/g, sampleRecipe.name)
        .replace(/\{\{thumbnailUrl\}\}/g, sampleRecipe.thumbnail)
        .replace(/\{\{category\}\}/g, sampleRecipe.category)
        .replace(/\{\{servings\}\}/g, sampleRecipe.servings)
        .replace(/\{\{cookTime\}\}/g, sampleRecipe.cookTime)
        .replace(/\{\{difficulty\}\}/g, sampleRecipe.difficulty);

      console.log('✅ Component rendered with fallback method');
    }

    // Append to document
    document.body.appendChild(testContainer);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (testContainer.parentNode) {
        testContainer.remove();
        console.log('🧹 Test container auto-removed');
      }
    }, 10000);

    return true;

  } catch (error) {
    console.error('❌ Component rendering test failed:', error);
    return false;
  }
}

/**
 * Test integration with petit-recipe UI
 */
async function testPetitRecipeIntegration() {
  console.log('🔗 Testing petit-recipe integration...');

  try {
    // Check if petit-recipe app is available
    if (!window.app) {
      console.warn('⚠️ petit-recipe app not available');
      return false;
    }

    // Test if recipes are loaded
    const recipes = window.app.getRecipes();
    if (!recipes || recipes.length === 0) {
      console.warn('⚠️ No recipes available for testing');
      return false;
    }

    console.log(`📊 Found ${recipes.length} recipes for integration test`);

    // Generate component for first recipe
    const firstRecipe = recipes[0];
    const testResult = await testMagicGeneration();

    if (testResult.success) {
      console.log('✅ Magic component generation successful');
      console.log('🔗 Integration test completed');

      // Store results for later use
      if (!window.magicTestResults) {
        window.magicTestResults = [];
      }
      window.magicTestResults.push(testResult);

      return true;
    } else {
      console.error('❌ Magic component generation failed');
      return false;
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
}

/**
 * Run all Magic MCP tests
 */
async function runAllMagicTests() {
  console.log('🚀 Running all Magic MCP tests...');

  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  try {
    // Test 1: Component Generation
    console.log('📋 Test 1: Component Generation');
    results.tests.generation = await testMagicGeneration();

    // Test 2: Integration with petit-recipe
    console.log('📋 Test 2: petit-recipe Integration');
    results.tests.integration = await testPetitRecipeIntegration();

    // Summary
    const successCount = Object.values(results.tests).filter(test => test.success).length;
    const totalTests = Object.keys(results.tests).length;

    console.log(`🎯 Magic MCP Test Summary: ${successCount}/${totalTests} tests passed`);

    results.summary = {
      passed: successCount,
      total: totalTests,
      success: successCount === totalTests
    };

    // Store results globally
    window.magicTestResults = results;

    return results;

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    results.error = error.message;
    return results;
  }
}

// Make functions globally available
window.testMagicGeneration = testMagicGeneration;
window.testComponentRendering = testComponentRendering;
window.testPetitRecipeIntegration = testPetitRecipeIntegration;
window.runAllMagicTests = runAllMagicTests;

console.log('🧪 Magic MCP test suite loaded - use runAllMagicTests() to start testing');
