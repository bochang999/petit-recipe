// BOC-107: Local Recipe Manager - Excel-like Local File System
// Capacitor FileSystem integration for immediate save/load without APK rebuild

import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

class LocalRecipeManager {
  constructor() {
    this.RECIPE_FILE = "recipes.json";
    this.directory = Directory.Documents;
    this.recipes = [];
    this.isInitialized = false;
  }

  /**
   * Initialize local recipe system - Excel-like immediate availability
   */
  async initialize() {
    try {
      console.log("🔄 Initializing Local Recipe Manager...");

      // Try to load existing local recipes
      const hasLocal = await this.hasLocalRecipes();

      if (hasLocal) {
        // Load from local storage
        this.recipes = await this.loadFromLocal();
        console.log(
          `✅ Loaded ${this.recipes.length} recipes from local storage`,
        );
      } else {
        // First time - migrate from embedded data
        await this.migrateFromEmbedded();
        console.log(
          `✅ Migrated ${this.recipes.length} recipes to local storage`,
        );
      }

      this.isInitialized = true;
      return this.recipes;
    } catch (error) {
      console.error("❌ Failed to initialize Local Recipe Manager:", error);
      // Fallback to embedded data if available
      return this.loadFallback();
    }
  }

  /**
   * Check if local recipes file exists
   */
  async hasLocalRecipes() {
    try {
      await Filesystem.stat({
        path: this.RECIPE_FILE,
        directory: this.directory,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load recipes from local storage
   */
  async loadFromLocal() {
    try {
      const result = await Filesystem.readFile({
        path: this.RECIPE_FILE,
        directory: this.directory,
        encoding: Encoding.UTF8,
      });

      const data = JSON.parse(result.data);
      return data.recipes || [];
    } catch (error) {
      console.error("❌ Failed to load from local storage:", error);
      throw error;
    }
  }

  /**
   * Save recipes to local storage - Excel-like immediate save
   */
  async saveToLocal(recipes = this.recipes) {
    try {
      const data = {
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        recipes: recipes,
      };

      await Filesystem.writeFile({
        path: this.RECIPE_FILE,
        data: JSON.stringify(data, null, 2),
        directory: this.directory,
        encoding: Encoding.UTF8,
      });

      this.recipes = recipes;
      console.log(`✅ Saved ${recipes.length} recipes to local storage`);
      return true;
    } catch (error) {
      console.error("❌ Failed to save to local storage:", error);
      throw error;
    }
  }

  /**
   * Migrate embedded recipes to local storage (first time only)
   */
  async migrateFromEmbedded() {
    try {
      // Load from embedded recipes.json or fallback data
      let embeddedRecipes = [];

      // Try to load from recipes.json
      try {
        const response = await fetch("./recipes.json");
        if (response.ok) {
          const data = await response.json();
          embeddedRecipes = data.recipes || [];
        }
      } catch (fetchError) {
        console.log("No embedded recipes.json found, using fallback");
      }

      // If no embedded data, use minimal fallback
      if (embeddedRecipes.length === 0) {
        embeddedRecipes = [
          {
            id: "1",
            name: "初期レシピ",
            servings: 1,
            cookTime: "5分",
            ingredients: [
              { name: "材料を追加してください", amount: 1, unit: "個" },
            ],
            steps: ["新しいレシピを追加してお使いください"],
          },
        ];
      }

      // Save to local storage
      await this.saveToLocal(embeddedRecipes);
      return embeddedRecipes;
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  }

  /**
   * Add new recipe - Excel-like immediate add
   */
  async addRecipe(recipe) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Generate new ID
      const maxId = this.recipes.reduce(
        (max, r) => Math.max(max, parseInt(r.id) || 0),
        0,
      );
      recipe.id = String(maxId + 1);

      // Add to recipes array
      this.recipes.push(recipe);

      // Save immediately
      await this.saveToLocal(this.recipes);

      console.log(`✅ Added recipe: ${recipe.name} (ID: ${recipe.id})`);
      return recipe;
    } catch (error) {
      console.error("❌ Failed to add recipe:", error);
      throw error;
    }
  }

  /**
   * Update existing recipe - Excel-like immediate update
   */
  async updateRecipe(recipeId, updatedRecipe) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const index = this.recipes.findIndex((r) => r.id === recipeId);
      if (index === -1) {
        throw new Error(`Recipe with ID ${recipeId} not found`);
      }

      // Update recipe
      this.recipes[index] = { ...updatedRecipe, id: recipeId };

      // Save immediately
      await this.saveToLocal(this.recipes);

      console.log(`✅ Updated recipe: ${updatedRecipe.name} (ID: ${recipeId})`);
      return this.recipes[index];
    } catch (error) {
      console.error("❌ Failed to update recipe:", error);
      throw error;
    }
  }

  /**
   * Delete recipe - Excel-like immediate delete
   */
  async deleteRecipe(recipeId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const index = this.recipes.findIndex((r) => r.id === recipeId);
      if (index === -1) {
        throw new Error(`Recipe with ID ${recipeId} not found`);
      }

      const deletedRecipe = this.recipes[index];
      this.recipes.splice(index, 1);

      // Save immediately
      await this.saveToLocal(this.recipes);

      console.log(`✅ Deleted recipe: ${deletedRecipe.name} (ID: ${recipeId})`);
      return deletedRecipe;
    } catch (error) {
      console.error("❌ Failed to delete recipe:", error);
      throw error;
    }
  }

  /**
   * Get all recipes
   */
  async getAllRecipes() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.recipes;
  }

  /**
   * Get recipe by ID
   */
  async getRecipeById(recipeId) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.recipes.find((r) => r.id === recipeId);
  }

  /**
   * Fallback for when local storage fails
   */
  loadFallback() {
    console.log("⚠️ Using fallback data due to local storage failure");
    return [
      {
        id: "1",
        name: "フォールバックレシピ",
        servings: 1,
        cookTime: "5分",
        ingredients: [
          { name: "ローカルストレージエラー", amount: 1, unit: "個" },
        ],
        steps: [
          "ローカルストレージにアクセスできません",
          "アプリを再起動してください",
        ],
      },
    ];
  }

  /**
   * Force refresh - reload from local storage
   */
  async forceRefresh() {
    try {
      this.recipes = await this.loadFromLocal();
      console.log(`🔄 Force refreshed: ${this.recipes.length} recipes loaded`);
      return this.recipes;
    } catch (error) {
      console.error("❌ Force refresh failed:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const localRecipeManager = new LocalRecipeManager();

// Global access for legacy compatibility
if (typeof window !== "undefined") {
  window.localRecipeManager = localRecipeManager;
}
