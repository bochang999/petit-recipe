// ▼▼▼ BOC-109: UI Layer - Clean UI Management ▼▼▼
// Handles all DOM manipulation and UI rendering

/**
 * UI management object
 * Responsible for rendering data from app.recipes to the DOM
 */
const ui = {

  /**
   * Render all recipes to the UI
   * This function receives data and displays it - no data management
   */
  render() {
    console.log('🎨 BOC-109: UI render started');

    if (!window.app || !window.app.isInitialized) {
      console.log('⏳ App not initialized yet, skipping render');
      return;
    }

    const recipes = window.app.getRecipes();
    console.log(`🎨 Rendering ${recipes.length} recipes to UI`);

    const recipesListElement = document.getElementById('recipes-list');
    if (!recipesListElement) {
      console.error('❌ recipes-list element not found');
      return;
    }

    // Clear existing content
    recipesListElement.innerHTML = '';

    if (recipes.length === 0) {
      recipesListElement.innerHTML = `
        <div class="empty-state">
          <p>レシピがありません</p>
          <p>新しいレシピを追加してください</p>
        </div>
      `;
      return;
    }

    // Render each recipe
    recipes.forEach(recipe => {
      const recipeElement = this.createRecipeElement(recipe);
      recipesListElement.appendChild(recipeElement);
    });

    console.log('✅ BOC-109: UI render completed');
  },

  /**
   * Create a single recipe element
   */
  createRecipeElement(recipe) {
    const element = document.createElement('div');
    element.className = 'recipe-item';
    element.innerHTML = `
      <div class="recipe-card">
        <h3 class="recipe-title">${recipe.name || 'No title'}</h3>
        <div class="recipe-info">
          <span class="cook-time">⏱️ ${recipe.cookTime || '30分'}</span>
          <span class="servings">👥 ${recipe.servings || 4}人前</span>
        </div>
        <div class="recipe-ingredients">
          <strong>材料:</strong> ${this.formatIngredients(recipe.ingredients)}
        </div>
      </div>
    `;

    // Add click handler if needed
    element.addEventListener('click', () => {
      console.log(`Recipe clicked: ${recipe.name}`);
      // Future: show recipe details
    });

    return element;
  },

  /**
   * Format ingredients for display
   */
  formatIngredients(ingredients) {
    if (!Array.isArray(ingredients)) {
      return 'No ingredients';
    }

    return ingredients
      .slice(0, 3) // Show first 3 ingredients
      .map(ing => `${ing.name} ${ing.amount}${ing.unit}`)
      .join(', ') + (ingredients.length > 3 ? '...' : '');
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    console.log('🔗 BOC-109: Setting up UI event listeners');

    // Refresh button (header)
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        console.log('🔄 Refresh button clicked - triggering app refresh');
        if (window.app && typeof window.app.refresh === 'function') {
          window.app.refresh();
        } else {
          console.error('❌ app.refresh not available');
        }
      });
      console.log('✅ Header refresh button connected');
    } else {
      console.error('❌ Header refresh button not found');
    }

    // Settings button
    const settingsButton = document.querySelector('.settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', () => {
        console.log('⚙️ Settings button clicked');
        if (window.app && window.app.showSettings) {
          window.app.showSettings();
        } else {
          console.error('❌ app.showSettings not available');
          alert('設定機能は準備中です');
        }
      });
      console.log('✅ Settings button connected');
    }

    // AI Recipe Add button
    const aiAddButton = document.querySelector('.ai-add-button');
    if (aiAddButton) {
      aiAddButton.addEventListener('click', () => {
        console.log('🤖 AI Add button clicked');
        if (window.showAIRecipeInput) {
          window.showAIRecipeInput();
        } else {
          console.error('❌ showAIRecipeInput not available');
          alert('AI追加機能は準備中です');
        }
      });
      console.log('✅ AI Add button connected');
    }

    // Data refresh button (search area)
    const refreshDataButton = document.querySelector('.refresh-data-button');
    if (refreshDataButton) {
      refreshDataButton.addEventListener('click', () => {
        console.log('🔄 Data refresh button clicked');
        if (window.forceReloadRecipes) {
          window.forceReloadRecipes();
        } else if (window.app && typeof window.app.refresh === 'function') {
          window.app.refresh();
        } else {
          console.error('❌ No refresh function available');
        }
      });
      console.log('✅ Data refresh button connected');
    }

    // Sort tabs
    const sortTabs = document.querySelectorAll('.sort-tab');
    sortTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const sortType = tab.dataset.sort;
        console.log(`📊 Sort tab clicked: ${sortType}`);

        // Update active tab
        sortTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Future: implement sorting
        console.log('🔮 Sorting feature coming soon');
      });
    });
    if (sortTabs.length > 0) {
      console.log(`✅ ${sortTabs.length} sort tabs connected`);
    }

    console.log('🔗 BOC-109: All UI event listeners setup completed');
  },

  /**
   * Show user feedback message
   */
  showMessage(message, type = 'info') {
    console.log(`📢 UI Message (${type}): ${message}`);
    // Future: implement actual message display
    alert(message); // Temporary simple implementation
  }
};

// Make ui globally available
window.ui = ui;

// NOTE: Event listeners are now set up by core.js after initialization
// This ensures proper initialization order: core.js → data loading → UI render → event listeners

// Re-render when app is initialized or refreshed
document.addEventListener('DOMContentLoaded', () => {
  // Wait for app initialization
  const checkAppReady = () => {
    if (window.app && window.app.isInitialized) {
      console.log('🎨 App ready, triggering initial UI render');
      window.ui.render();
    } else {
      setTimeout(checkAppReady, 100);
    }
  };
  setTimeout(checkAppReady, 100);
});

console.log('🎨 BOC-109: UI.js loaded - Clean UI layer established');
