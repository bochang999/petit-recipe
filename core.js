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
  currentScreen: "recipes-screen",
  selectedRecipe: null,

  // Initialization flag
  isInitialized: false,

  /**
   * Initialize the application
   */
  async initialize() {
    console.log("🚀 BOC-109: Core app initialization started");
    alert("🚀 INIT STEP 1: initialization started");

    try {
      alert("🚀 INIT STEP 2: Checking recipeDataManager");
      // Load recipes using recipeDataManager if available
      if (window.recipeDataManager) {
        alert("📁 INIT STEP 3: Using recipeDataManager");
        console.log("📁 Using recipeDataManager for data loading");
        console.log(
          "🔍 RecipeDataManager type:",
          typeof window.recipeDataManager,
        );

        alert("📁 INIT STEP 4: Calling loadRecipes()");
        const loadResult = await window.recipeDataManager.loadRecipes();

        // Handle new enhanced loadRecipes return format
        if (
          loadResult &&
          typeof loadResult === "object" &&
          loadResult.recipes
        ) {
          // New format: {recipes: [...], source: 'filesystem', logs: [...]}
          this.recipes = loadResult.recipes;
          console.log(`📊 Data source: ${loadResult.source}`);
          console.log(
            `📋 Debug logs available: ${loadResult.logs ? loadResult.logs.length : 0} entries`,
          );
          if (loadResult.logs && loadResult.logs.length > 0) {
            // Store logs for debug panel
            if (!window.debugLogs) window.debugLogs = [];
            window.debugLogs = window.debugLogs.concat(loadResult.logs);
          }
        } else {
          // Legacy format: simple array or null
          this.recipes = Array.isArray(loadResult) ? loadResult : [];
        }

        alert(`✅ INIT STEP 5: Loaded ${this.recipes.length} recipes`);
        console.log(
          `✅ Loaded ${this.recipes.length} recipes from Capacitor FileSystem`,
        );
      } else {
        alert("⚠️ INIT STEP 3: Using direct fetch fallback");
        // Fallback: Direct fetch
        console.log("⚠️ RecipeDataManager not available, using direct fetch");
        const response = await fetch("./recipes.json");
        if (response.ok) {
          const data = await response.json();
          this.recipes = data.recipes || [];
          console.log(`✅ Direct fetch: Loaded ${this.recipes.length} recipes`);
        } else {
          console.error(`❌ Fetch failed: ${response.status}`);
          this.recipes = [];
        }
      }

      alert("🚀 INIT STEP 6: Setting isInitialized = true");
      this.isInitialized = true;
      console.log("🎯 BOC-109: Core app initialization completed");

      alert("🚀 INIT STEP 7: Checking UI render");
      // Trigger UI refresh if available
      if (window.ui && typeof window.ui.render === "function") {
        alert("🎨 INIT STEP 8: Calling ui.render()");
        window.ui.render();
        alert("🎨 INIT STEP 9: ui.render() completed");
      } else {
        alert("❌ INIT STEP 8: ui.render not available");
      }

      alert("🚀 INIT STEP 10: INITIALIZATION COMPLETE");
    } catch (error) {
      alert("❌ INITIALIZATION ERROR: " + error.message);
      alert("❌ ERROR DETAILS: " + error.name + " - " + error.toString());
      console.error("❌ BOC-109: Core app initialization failed:", error);
      this.recipes = [];
      this.isInitialized = false;
    }
  },

  /**
   * Refresh recipe data
   */
  async refresh() {
    alert("🔄 STEP 1: refresh() started");
    console.log("🔄 BOC-109: Core app refresh started");
    console.log(
      "🔍 Checking recipeDataManager availability:",
      !!window.recipeDataManager,
    );

    try {
      alert("🔄 STEP 2: Setting isInitialized = false");
      this.isInitialized = false;

      alert("🔄 STEP 3: Calling initialize()");
      await this.initialize();

      alert("✅ STEP 4: refresh completed successfully");
      console.log("✅ BOC-109: Core app refresh completed successfully");
    } catch (error) {
      alert("❌ REFRESH ERROR: " + error.message);
      console.error("❌ BOC-109: Core app refresh failed:", error);
    }
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
    return this.recipes.find((recipe) => recipe.id === id);
  },

  /**
   * Show recipe details page
   */
  showRecipeDetails(recipeId) {
    console.log(`🍳 Showing recipe details for ID: ${recipeId}`);

    const recipe = this.getRecipeById(recipeId);
    if (!recipe) {
      console.error(`❌ Recipe not found with ID: ${recipeId}`);
      alert(`レシピが見つかりません (ID: ${recipeId})`);
      return;
    }

    // Store current recipe for detail page
    this.selectedRecipe = recipe;
    console.log(`✅ Selected recipe: ${recipe.name}`);

    // Navigate to detail screen
    this.currentScreen = "recipe-detail-screen";

    // Use UI layer to show screen and render recipe details
    if (window.ui) {
      window.ui.showScreen("recipe-detail-screen");
      window.ui.renderRecipeDetails(recipe);
    } else {
      console.error("❌ UI layer not available");
    }
  },

  /**
   * Navigate back to main screen
   */
  navigateBack() {
    console.log("← Navigating back to main screen");

    this.currentScreen = "recipes-screen";
    this.selectedRecipe = null;

    if (window.ui) {
      window.ui.showScreen("recipes-screen");
    } else {
      console.error("❌ UI layer not available");
    }
  },

  /**
   * Start editing the current recipe
   */
  startEditRecipe() {
    console.log("✏️ Starting recipe edit");

    if (!this.selectedRecipe) {
      console.error("❌ No recipe selected for editing");
      alert("編集するレシピが選択されていません");
      return;
    }

    console.log(`✏️ Editing recipe: ${this.selectedRecipe.name}`);

    // TODO: Navigate to edit screen and populate with current recipe data
    alert(`✏️ レシピ編集機能は準備中です\nレシピ: ${this.selectedRecipe.name}`);
  },

  /**
   * Duplicate the current recipe
   */
  duplicateRecipe() {
    console.log("📋 Duplicating current recipe");

    if (!this.selectedRecipe) {
      console.error("❌ No recipe selected for duplication");
      alert("複製するレシピが選択されていません");
      return;
    }

    const originalRecipe = this.selectedRecipe;
    const duplicatedRecipe = {
      ...originalRecipe,
      id: `${originalRecipe.id}_copy_${Date.now()}`,
      name: `${originalRecipe.name} (コピー)`,
    };

    console.log(`📋 Duplicating recipe: ${originalRecipe.name}`);

    // Add to recipes list
    this.recipes.push(duplicatedRecipe);

    // Save to storage if available
    if (
      window.recipeDataManager &&
      typeof window.recipeDataManager.saveRecipes === "function"
    ) {
      window.recipeDataManager.saveRecipes(this.recipes);
    }

    // Refresh UI
    if (window.ui) {
      window.ui.render();
    }

    alert(`✅ レシピを複製しました！\n新しいレシピ: ${duplicatedRecipe.name}`);
    console.log(`✅ Recipe duplicated: ${duplicatedRecipe.name}`);
  },

  /**
   * Confirm and delete the current recipe
   */
  confirmDeleteRecipe() {
    console.log("🗑️ Confirm delete recipe");

    if (!this.selectedRecipe) {
      console.error("❌ No recipe selected for deletion");
      alert("削除するレシピが選択されていません");
      return;
    }

    const recipeName = this.selectedRecipe.name;
    const confirm = window.confirm(
      `🗑️ レシピを削除しますか？\n\n` +
        `レシピ名: ${recipeName}\n\n` +
        `⚠️ この操作は取り消すことができません。`,
    );

    if (!confirm) {
      console.log("Recipe deletion cancelled by user");
      return;
    }

    this.deleteRecipe(this.selectedRecipe.id);
  },

  /**
   * Delete recipe by ID
   */
  deleteRecipe(recipeId) {
    console.log(`🗑️ Deleting recipe with ID: ${recipeId}`);

    const recipeIndex = this.recipes.findIndex(
      (recipe) => recipe.id === recipeId,
    );

    if (recipeIndex === -1) {
      console.error(`❌ Recipe not found with ID: ${recipeId}`);
      alert("削除するレシピが見つかりません");
      return;
    }

    const deletedRecipe = this.recipes[recipeIndex];

    // Remove from recipes array
    this.recipes.splice(recipeIndex, 1);

    // Save to storage if available
    if (
      window.recipeDataManager &&
      typeof window.recipeDataManager.saveRecipes === "function"
    ) {
      window.recipeDataManager.saveRecipes(this.recipes);
    }

    // Navigate back to main screen
    this.navigateBack();

    // Refresh UI
    if (window.ui) {
      window.ui.render();
    }

    alert(`✅ レシピを削除しました\nレシピ名: ${deletedRecipe.name}`);
    console.log(`✅ Recipe deleted: ${deletedRecipe.name}`);
  },
};

// Make app globally available
window.app = app;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔧 BOC-109: DOM loaded, starting core app initialization");
  alert("🚀 APP STARTING! DOM loaded");
  window.app.initialize();
});

console.log("📦 BOC-109: Core.js loaded - Single Source of Truth established");
