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

    try {
      // Load recipes using recipeDataManager if available
      if (window.recipeDataManager) {
        console.log("📁 Using recipeDataManager for data loading");
        console.log(
          "🔍 RecipeDataManager type:",
          typeof window.recipeDataManager,
        );

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

        console.log(
          `✅ Loaded ${this.recipes.length} recipes from Capacitor FileSystem`,
        );
      } else {
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

      this.isInitialized = true;
      console.log("🎯 BOC-109: Core app initialization completed");

      // Trigger UI refresh if available
      if (window.ui && typeof window.ui.render === "function") {
        window.ui.render();
      } else {
        console.error("❌ UI layer not available");
      }
    } catch (error) {
      console.error("❌ BOC-109: Core app initialization failed:", error);
      console.error("❌ BOC-109: Core app initialization failed:", error);
      this.recipes = [];
      this.isInitialized = false;
    }
  },

  /**
   * Refresh recipe data
   */
  async refresh() {
    console.log("🔄 BOC-109: Core app refresh started");
    console.log(
      "🔍 Checking recipeDataManager availability:",
      !!window.recipeDataManager,
    );

    try {
      this.isInitialized = false;
      await this.initialize();
      alert("✅ リロードしました");
      console.log("✅ BOC-109: Core app refresh completed successfully");
    } catch (error) {
      console.error("❌ BOC-109: Core app refresh failed:", error);
      alert("❌ リロードに失敗しました");
    }
  },

  /**
   * Get all recipes
   */
  getRecipes() {
    return this.recipes;
  },

  /**
   * Get sorted recipes
   * @param {string} sortType - 'time' for chronological, 'name' for alphabetical
   */
  getSortedRecipes(sortType = 'time') {
    const recipesCopy = [...this.recipes];

    switch (sortType) {
      case 'time':
        // Sort by ID (chronological order - newest first)
        return recipesCopy.sort((a, b) => (b.id || 0) - (a.id || 0));

      case 'name':
        // Sort alphabetically by title (Japanese character ordering)
        return recipesCopy.sort((a, b) => {
          const titleA = a.title || a.name || '';
          const titleB = b.title || b.name || '';
          return titleA.localeCompare(titleB, 'ja-JP');
        });

      default:
        console.warn(`Unknown sort type: ${sortType}, defaulting to time`);
        return recipesCopy.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
  },

  /**
   * Get recipe by ID
   */
  getRecipeById(id) {
    return this.recipes.find((recipe) => recipe.id === id);
  },

  /**
   * Add new recipe
   * @param {Object} recipeData - Recipe data with title, ingredients, instructions
   */
  async addRecipe(recipeData) {
    console.log("📝 Adding new recipe:", recipeData.title);

    try {
      // Generate new ID (highest existing ID + 1)
      const maxId = this.recipes.length > 0 ? Math.max(...this.recipes.map(r => r.id || 0)) : 0;
      const newId = maxId + 1;

      // Create new recipe object
      const newRecipe = {
        id: newId,
        title: recipeData.title,
        name: recipeData.title, // For compatibility
        ingredients: this.parseIngredients(recipeData.ingredients),
        instructions: this.parseInstructions(recipeData.instructions),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to recipes array
      this.recipes.push(newRecipe);

      // Save to file if recipeDataManager is available
      if (window.recipeDataManager && window.recipeDataManager.saveRecipes) {
        await window.recipeDataManager.saveRecipes(this.recipes);
        console.log("✅ Recipe saved to file");
      }

      // Re-render UI
      if (window.ui && window.ui.render) {
        window.ui.render();
      }

      console.log(`✅ Recipe "${recipeData.title}" added successfully with ID: ${newId}`);
      return newRecipe;
    } catch (error) {
      console.error("❌ Failed to add recipe:", error);
      throw error;
    }
  },

  /**
   * Update existing recipe
   * @param {number} id - Recipe ID
   * @param {Object} recipeData - Updated recipe data
   */
  async updateRecipe(id, recipeData) {
    console.log(`📝 Updating recipe ID: ${id}`, recipeData.title);

    try {
      const recipeIndex = this.recipes.findIndex(r => r.id === id);
      if (recipeIndex === -1) {
        throw new Error(`Recipe with ID ${id} not found`);
      }

      // Update recipe object
      const updatedRecipe = {
        ...this.recipes[recipeIndex],
        title: recipeData.title,
        name: recipeData.title, // For compatibility
        ingredients: this.parseIngredients(recipeData.ingredients),
        instructions: this.parseInstructions(recipeData.instructions),
        updatedAt: new Date().toISOString()
      };

      // Update in recipes array
      this.recipes[recipeIndex] = updatedRecipe;

      // Save to file if recipeDataManager is available
      if (window.recipeDataManager && window.recipeDataManager.saveRecipes) {
        await window.recipeDataManager.saveRecipes(this.recipes);
        console.log("✅ Recipe updated in file");
      }

      // Re-render UI
      if (window.ui && window.ui.render) {
        window.ui.render();
      }

      console.log(`✅ Recipe "${recipeData.title}" updated successfully`);
      return updatedRecipe;
    } catch (error) {
      console.error("❌ Failed to update recipe:", error);
      throw error;
    }
  },

  /**
   * Delete recipe
   * @param {number} id - Recipe ID
   */
  async deleteRecipe(id) {
    console.log(`🗑️ Deleting recipe ID: ${id}`);

    try {
      const recipeIndex = this.recipes.findIndex(r => r.id === id);
      if (recipeIndex === -1) {
        throw new Error(`Recipe with ID ${id} not found`);
      }

      const recipeName = this.recipes[recipeIndex].title || this.recipes[recipeIndex].name;

      // Remove from recipes array
      this.recipes.splice(recipeIndex, 1);

      // Save to file if recipeDataManager is available
      if (window.recipeDataManager && window.recipeDataManager.saveRecipes) {
        await window.recipeDataManager.saveRecipes(this.recipes);
        console.log("✅ Recipe deleted from file");
      }

      // Re-render UI
      if (window.ui && window.ui.render) {
        window.ui.render();
      }

      console.log(`✅ Recipe "${recipeName}" deleted successfully`);
      return true;
    } catch (error) {
      console.error("❌ Failed to delete recipe:", error);
      throw error;
    }
  },

  /**
   * Parse ingredients text into array
   */
  parseIngredients(ingredientsText) {
    if (Array.isArray(ingredientsText)) {
      return ingredientsText;
    }
    return ingredientsText.split('\n').filter(line => line.trim() !== '');
  },

  /**
   * Parse instructions text into array
   */
  parseInstructions(instructionsText) {
    if (Array.isArray(instructionsText)) {
      return instructionsText;
    }
    return instructionsText.split('\n').filter(line => line.trim() !== '');
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
   * Show add recipe form
   */
  showAddRecipeForm() {
    console.log("➕ Showing add recipe form");

    // Reset edit mode
    this.editMode = false;
    this.editingRecipeId = null;

    // Navigate to add recipe screen first
    if (window.ui && window.ui.showScreen) {
      window.ui.showScreen('add-recipe-screen');

      // Use setTimeout to ensure screen is visible before clearing form
      setTimeout(() => {
        // Clear the form
        const form = document.getElementById('add-recipe-form');
        if (form) {
          form.reset();
        }

        // Reset form title to add mode
        const formTitle = document.querySelector('#add-recipe-screen .screen-header h2');
        if (formTitle) {
          formTitle.textContent = '新しいレシピを追加';
        }

        // Hide edit mode indicator
        const editIndicator = document.getElementById('edit-mode-indicator');
        if (editIndicator) {
          editIndicator.style.display = 'none';
        }

        console.log("✅ Add recipe form reset to add mode");
      }, 100);
    } else {
      console.error("❌ UI navigation not available");
      alert("❌ レシピ追加画面を開けません");
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

    // Navigate to add recipe screen with edit mode
    if (window.ui && window.ui.showScreen) {
      window.ui.showScreen('add-recipe-screen');
      // Use setTimeout to ensure screen is visible before populating form
      setTimeout(() => {
        this.populateEditForm();
      }, 100);
    } else {
      console.error("❌ UI navigation not available");
      alert("❌ レシピ編集画面を開けません");
    }
  },

  /**
   * Populate edit form with current recipe data
   */
  populateEditForm() {
    console.log("🔄 Populating edit form with recipe data");

    if (!this.selectedRecipe) {
      console.error("❌ No selected recipe to populate form");
      return;
    }

    console.log("📝 Selected recipe data:", this.selectedRecipe);

    const titleInput = document.getElementById('recipe-title');
    const ingredientsInput = document.getElementById('recipe-ingredients');
    const instructionsInput = document.getElementById('recipe-instructions');

    console.log("🔍 Form elements found:", {
      titleInput: !!titleInput,
      ingredientsInput: !!ingredientsInput,
      instructionsInput: !!instructionsInput
    });

    if (titleInput) {
      const title = this.selectedRecipe.title || this.selectedRecipe.name || '';
      titleInput.value = title;
      console.log("✅ Title populated:", title);
    }

    if (ingredientsInput) {
      const ingredients = this.selectedRecipe.ingredients || [];
      console.log("📋 Raw ingredients data:", ingredients, "Type:", typeof ingredients);

      let ingredientsText = '';
      if (Array.isArray(ingredients)) {
        ingredientsText = ingredients.join('\n');
      } else if (typeof ingredients === 'string') {
        ingredientsText = ingredients;
      } else {
        ingredientsText = String(ingredients);
      }

      ingredientsInput.value = ingredientsText;
      console.log("✅ Ingredients populated:", ingredientsText);
    }

    if (instructionsInput) {
      const instructions = this.selectedRecipe.instructions || [];
      console.log("📋 Raw instructions data:", instructions, "Type:", typeof instructions);

      let instructionsText = '';
      if (Array.isArray(instructions)) {
        instructionsText = instructions.join('\n');
      } else if (typeof instructions === 'string') {
        instructionsText = instructions;
      } else {
        instructionsText = String(instructions);
      }

      instructionsInput.value = instructionsText;
      console.log("✅ Instructions populated:", instructionsText);
    }

    // Mark as edit mode
    this.editMode = true;
    this.editingRecipeId = this.selectedRecipe.id;
    console.log("✏️ Edit mode activated for recipe ID:", this.editingRecipeId);

    // Update form title
    const formTitle = document.querySelector('#add-recipe-screen .screen-header h2');
    if (formTitle) {
      formTitle.textContent = 'レシピ編集';
      console.log("✅ Form title updated to edit mode");
    }

    // Show edit mode indicator
    const editIndicator = document.getElementById('edit-mode-indicator');
    if (editIndicator) {
      editIndicator.style.display = 'block';
      console.log("✅ Edit mode indicator shown");
    }

    console.log("🎯 Edit form population completed successfully");
  },

  /**
   * Handle recipe form submission (both add and edit)
   */
  async handleRecipeFormSubmit(event) {
    event.preventDefault();
    console.log("📝 Handling recipe form submission");

    const form = event.target;
    const formData = new FormData(form);

    const recipeData = {
      title: formData.get('title')?.trim() || '',
      ingredients: this.parseIngredients(formData.get('ingredients') || ''),
      instructions: this.parseInstructions(formData.get('instructions') || ''),
      lastModified: new Date().toISOString()
    };

    // Validate required fields
    if (!recipeData.title) {
      alert('❌ レシピ名を入力してください');
      return;
    }

    if (!recipeData.ingredients.length) {
      alert('❌ 材料を入力してください');
      return;
    }

    if (!recipeData.instructions.length) {
      alert('❌ 作り方を入力してください');
      return;
    }

    try {
      if (this.editMode && this.editingRecipeId) {
        // Edit mode: update existing recipe
        console.log(`✏️ Updating recipe ID: ${this.editingRecipeId}`);
        await this.updateRecipe(this.editingRecipeId, recipeData);
        alert(`✅ レシピを更新しました！\n「${recipeData.title}」`);
      } else {
        // Add mode: create new recipe
        console.log("➕ Adding new recipe");
        await this.addRecipe(recipeData);
        alert(`✅ 新しいレシピを追加しました！\n「${recipeData.title}」`);
      }

      // Reset form and edit mode
      form.reset();
      this.editMode = false;
      this.editingRecipeId = null;

      // Navigate back to main screen
      this.navigateBack();

      // Refresh UI
      if (window.ui) {
        window.ui.render();
      }

    } catch (error) {
      console.error("❌ Failed to save recipe:", error);
      alert("❌ レシピの保存に失敗しました");
    }
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

};

// Make app globally available
window.app = app;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔧 BOC-109: DOM loaded, starting core app initialization");
  window.app.initialize();
});

console.log("📦 BOC-109: Core.js loaded - Single Source of Truth established");
