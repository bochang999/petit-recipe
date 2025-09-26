// ▼▼▼ BOC-109: Core Application State - The Heart of the App ▼▼▼
// Single Source of Truth for all recipe data

/**
 * Global application state object
 * This is the ONLY place where recipe data should be stored
 */
const app = {
  // The single source of truth for recipe data
  recipes: [],

  // Application state
  currentScreen: 'recipes-screen',
  selectedRecipe: null,

  // Initialization flag
  isInitialized: false,

  /**
   * Initialize the application
   */
  async initialize() {
    console.log('🚀 BOC-109: Core app initialization started');

    try {
      // Load recipes using recipeDataManager if available
      if (window.recipeDataManager) {
        console.log('📁 Using recipeDataManager for data loading');
        this.recipes = await window.recipeDataManager.loadRecipes();
        console.log(`✅ Loaded ${this.recipes.length} recipes from JSON file`);
      } else {
        // Fallback: Direct fetch
        console.log('⚠️ RecipeDataManager not available, using direct fetch');
        const response = await fetch('./recipes.json');
        if (response.ok) {
          const data = await response.json();
          this.recipes = data.recipes || [];
          console.log(`✅ Direct fetch: Loaded ${this.recipes.length} recipes`);
        } else {
          console.error(`❌ Fetch failed: ${response.status}`);
          this.recipes = [];
        }
      }

      this.isInitialized = true;
      console.log('🎯 BOC-109: Core app initialization completed');

      // Trigger UI refresh if available
      if (window.ui && typeof window.ui.render === 'function') {
        window.ui.render();
      }

      // ▼▼▼ BOC-109: UI Neural Connection - Connect buttons to brain ▼▼▼
      // UIの神経接続（イベントリスナー）を開始する
      if (window.ui && typeof window.ui.setupEventListeners === 'function') {
        window.ui.setupEventListeners();
        console.log('🔗 BOC-109: UI event listeners connected - Neural pathways active');
      } else {
        console.error('❌ BOC-109: ui.setupEventListeners not available - Neural connection failed');
      }
      // ▲▲▲ BOC-109: UI Neural Connection Complete ▲▲▲

    } catch (error) {
      console.error('❌ BOC-109: Core app initialization failed:', error);
      this.recipes = [];
      this.isInitialized = false;
    }
  },

  /**
   * Refresh recipe data
   */
  async refresh() {
    console.log('🔄 BOC-109: Core app refresh started');
    this.isInitialized = false;
    await this.initialize();
  },

  /**
   * Get all recipes
   */
  getRecipes() {
    return this.recipes;
  },

  /**
   * Get recipe by ID
   */
  getRecipeById(id) {
    return this.recipes.find(recipe => recipe.id === id);
  }
};

// Make app globally available
window.app = app;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 BOC-109: DOM loaded, starting core app initialization');
  window.app.initialize();
});

console.log('📦 BOC-109: Core.js loaded - Single Source of Truth established');
