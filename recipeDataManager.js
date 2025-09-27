// BOC-107: Simple Recipe Data Manager - Single Source of Truth
// Excel-like operations: Direct Capacitor FileSystem management

/**
 * APK-Exclusive Simple Recipe Data Manager
 * Target: Documents/recipes.json as the ONLY data source
 * 4 Core Functions: loadRecipes, saveRecipes, addRecipe, deleteRecipe
 * Assumption: Always runs in Capacitor native environment
 */
class RecipeDataManager {
  constructor() {
    this.filePath = "recipes.json";
    // APK-exclusive: No environment detection needed
    this.filesystem = null;
    this.directory = null;
    this.encoding = null;
  }

  /**
   * Initialize Capacitor FileSystem (APK-exclusive)
   */
  async initialize() {
    // APK-exclusive: Direct Capacitor plugin access
    const { Filesystem, Directory, Encoding } = Capacitor.Plugins;
    this.filesystem = Filesystem;
    this.directory = Directory.Documents;
    this.encoding = Encoding.UTF8;
    console.log("✅ APK-exclusive Capacitor FileSystem initialized");
  }

  /**
   * Core Function 1: loadRecipes()
   * Load recipes from Documents/recipes.json (APK-exclusive)
   */
  async loadRecipes() {
    try {
      await this.initialize();

      // APK-exclusive: Always use Capacitor FileSystem
      try {
        alert("📁 READING: Attempting to read Documents/recipes.json");
        const result = await this.filesystem.readFile({
          path: this.filePath,
          directory: this.directory,
          encoding: this.encoding,
        });
        alert(`📁 READ SUCCESS: File size ${result.data.length} characters`);
        const data = JSON.parse(result.data);
        alert(`📁 PARSE SUCCESS: Found ${data.recipes.length} recipes`);
        console.log(
          `✅ Loaded ${data.recipes.length} recipes from Documents/${this.filePath}`,
        );
        return data.recipes || [];
      } catch (fileError) {
        console.log(
          "📝 No recipes.json found in Documents, initializing from APK assets",
        );
        alert("📝 CREATING INITIAL FILE: recipes.json not found in Documents");
        const result = await this.createInitialRecipesFile();
        alert(`📝 INITIAL FILE RESULT: Created ${result.length} recipes`);
        return result;
      }
    } catch (error) {
      console.error("❌ loadRecipes failed:", error);
      return [];
    }
  }

  /**
   * Core Function 2: saveRecipes(data)
   * Save recipes to Documents/recipes.json (APK-exclusive)
   */
  async saveRecipes(recipes) {
    try {
      await this.initialize();

      const dataToSave = {
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        recipes: recipes,
      };

      // APK-exclusive: Always use Capacitor FileSystem
      await this.filesystem.writeFile({
        path: this.filePath,
        data: JSON.stringify(dataToSave, null, 2),
        directory: this.directory,
        encoding: this.encoding,
      });
      console.log(
        `💾 Saved ${recipes.length} recipes to Documents/${this.filePath}`,
      );

      return true;
    } catch (error) {
      console.error("❌ saveRecipes failed:", error);
      return false;
    }
  }

  /**
   * Core Function 3: addRecipe(newRecipe)
   * Excel-like: Load → Add → Save
   */
  async addRecipe(newRecipe) {
    try {
      console.log("➕ Adding recipe:", newRecipe.name);

      // Step 1: Load current recipes
      const currentRecipes = await this.loadRecipes();

      // Step 2: Generate new ID
      const maxId =
        currentRecipes.length > 0
          ? Math.max(...currentRecipes.map((r) => parseInt(r.id) || 0))
          : 0;
      const newId = (maxId + 1).toString();

      // Step 3: Standardize recipe data
      const standardizedRecipe = {
        id: newId,
        name: newRecipe.name || "New Recipe",
        servings: newRecipe.servings || 1,
        cookTime: newRecipe.cookTime || "30分",
        ingredients: newRecipe.ingredients || [],
        steps: newRecipe.steps || [],
      };

      // Step 4: Add to current recipes
      currentRecipes.push(standardizedRecipe);

      // Step 5: Save back to file
      const success = await this.saveRecipes(currentRecipes);

      if (success) {
        console.log(
          `✅ Recipe added successfully: ${standardizedRecipe.name} (ID: ${newId})`,
        );
        return standardizedRecipe;
      } else {
        throw new Error("Failed to save recipe");
      }
    } catch (error) {
      console.error("❌ addRecipe failed:", error);
      throw error;
    }
  }

  /**
   * Core Function 4: deleteRecipe(recipeId)
   * Excel-like: Load → Delete → Save
   */
  async deleteRecipe(recipeId) {
    try {
      console.log("🗑️ Deleting recipe ID:", recipeId);

      // Step 1: Load current recipes
      const currentRecipes = await this.loadRecipes();

      // Step 2: Find and remove recipe
      const recipeToDelete = currentRecipes.find((r) => r.id === recipeId);
      if (!recipeToDelete) {
        throw new Error(`Recipe with ID ${recipeId} not found`);
      }

      const updatedRecipes = currentRecipes.filter((r) => r.id !== recipeId);

      // Step 3: Save back to file
      const success = await this.saveRecipes(updatedRecipes);

      if (success) {
        console.log(
          `✅ Recipe deleted successfully: ${recipeToDelete.name} (ID: ${recipeId})`,
        );
        return recipeId;
      } else {
        throw new Error("Failed to save after deletion");
      }
    } catch (error) {
      console.error("❌ deleteRecipe failed:", error);
      throw error;
    }
  }

  /**
   * Helper: Initialize recipes from APK assets (APK-exclusive)
   * Following user's APK専用シンプル化最終プラン
   */
  async createInitialRecipesFile() {
    console.log("🔧 APK初回起動を検出。初期レシピをコピーします。");

    try {
      // APK専用: 同梱された初期レシピ(./recipes.json)を取得
      const response = await fetch("./recipes.json");
      const bundledData = await response.text();

      // ユーザーの保存領域に書き込む
      await this.initialize();
      await this.filesystem.writeFile({
        path: this.filePath,
        data: bundledData,
        directory: this.directory,
        encoding: this.encoding,
      });

      console.log("✅ 初期レシピのコピーが完了しました。");
      return JSON.parse(bundledData).recipes || [];
    } catch (copyError) {
      console.error(
        "❌ 致命的エラー: 初期レシピのコピーに失敗しました！",
        copyError,
      );
      // エラーが発生した場合、空のレシピデータを返す
      return [];
    }
  }

  /**
   * Helper: Create empty recipes file (backup method)
   */
  async createEmptyRecipesFile() {
    const emptyData = [];
    await this.saveRecipes(emptyData);
    return emptyData;
  }

  /**
   * Helper: Get recipe by ID
   */
  async getRecipeById(recipeId) {
    const recipes = await this.loadRecipes();
    return recipes.find((r) => r.id === recipeId);
  }

  /**
   * Helper: Clear old localStorage data
   */
  async clearOldLocalStorageData() {
    try {
      console.log("🧹 Clearing old localStorage recipe data...");

      // Clear all old recipe-related localStorage keys
      const keysToRemove = [
        "petit-recipe-db",
        "petitRecipeDB",
        "recipe-database",
        "recipeViewCounts",
        "last_recipe_count",
      ];

      keysToRemove.forEach((key) => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed old localStorage key: ${key}`);
        }
      });

      console.log("✅ Old localStorage data cleared");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear localStorage:", error);
      return false;
    }
  }

  /**
   * Helper: Update existing recipe
   */
  async updateRecipe(recipeId, updatedData) {
    try {
      console.log("✏️ Updating recipe ID:", recipeId);

      // Step 1: Load current recipes
      const currentRecipes = await this.loadRecipes();

      // Step 2: Find and update recipe
      const recipeIndex = currentRecipes.findIndex((r) => r.id === recipeId);
      if (recipeIndex === -1) {
        throw new Error(`Recipe with ID ${recipeId} not found`);
      }

      currentRecipes[recipeIndex] = {
        ...currentRecipes[recipeIndex],
        ...updatedData,
        id: recipeId,
      };

      // Step 3: Save back to file
      const success = await this.saveRecipes(currentRecipes);

      if (success) {
        console.log(
          `✅ Recipe updated successfully: ${currentRecipes[recipeIndex].name} (ID: ${recipeId})`,
        );
        return currentRecipes[recipeIndex];
      } else {
        throw new Error("Failed to save after update");
      }
    } catch (error) {
      console.error("❌ updateRecipe failed:", error);
      throw error;
    }
  }
}

// Create global singleton instance
window.recipeDataManager = new RecipeDataManager();

// Global helper functions for UI integration
window.loadAllRecipes = async function () {
  return await window.recipeDataManager.loadRecipes();
};

window.addNewRecipe = async function (recipeData) {
  return await window.recipeDataManager.addRecipe(recipeData);
};

window.removeRecipe = async function (recipeId) {
  return await window.recipeDataManager.deleteRecipe(recipeId);
};

window.refreshRecipeData = async function () {
  const recipes = await window.recipeDataManager.loadRecipes();
  window.PETIT_RECIPE_DATA = recipes;
  console.log(`🔄 Refreshed: ${recipes.length} recipes loaded`);
  return recipes;
};

// APK専用 シンプル化最終プラン: リフレッシュ機能
window.forceRefreshLocalRecipes = async function () {
  console.log("🔄 レシピをリフレッシュします...");

  try {
    // APK専用: Capacitor FileSystemから直接読み込み
    const { Filesystem, Directory, Encoding } = Capacitor.Plugins;

    const contents = await Filesystem.readFile({
      path: "recipes.json",
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    const data = JSON.parse(contents.data);

    // UIを更新する - シンプルなDOM更新
    renderRecipesToUI(data.recipes);
    console.log("✅ リフレッシュ完了。");

    return data.recipes;
  } catch (error) {
    console.error("❌ リフレッシュに失敗:", error);
    return [];
  }
};

// APK専用: シンプルなUI更新関数
function renderRecipesToUI(recipes) {
  const recipesList = document.getElementById("recipes-list");
  if (recipesList) {
    if (recipes.length === 0) {
      recipesList.innerHTML =
        '<div class="no-recipes">レシピがありません<br><small>新しいレシピを追加してください</small></div>';
    } else {
      const recipesHtml = recipes
        .map(
          (recipe) => `
                <div class="recipe-card">
                    <div class="recipe-header">
                        <h3 class="recipe-title">${recipe.name || "Unknown Recipe"}</h3>
                        <div class="recipe-meta">
                            <span class="recipe-time">⏱️ ${recipe.cookTime || "不明"}</span>
                            <span class="recipe-servings">🍴 ${recipe.servings || 1}人前</span>
                        </div>
                    </div>
                    <div class="recipe-preview">
                        <p>材料: ${(recipe.ingredients || []).length}種類</p>
                        <p>手順: ${(recipe.steps || []).length}ステップ</p>
                    </div>
                </div>
            `,
        )
        .join("");
      recipesList.innerHTML = recipesHtml;
    }
    console.log(`📋 UI更新完了: ${recipes.length} recipes displayed`);
  } else {
    console.error("❌ recipes-list element not found");
  }
}

// Test function for development
window.testRecipeDataManager = async function () {
  console.log("🧪 Testing Recipe Data Manager...");

  try {
    // Test load
    const recipes = await window.recipeDataManager.loadRecipes();
    console.log(`📊 Current recipes: ${recipes.length}`);

    // Test add
    const testRecipe = {
      name: "Test Recipe",
      servings: 2,
      cookTime: "15分",
      ingredients: [{ name: "Test ingredient", amount: 1, unit: "個" }],
      steps: ["Test step 1", "Test step 2"],
    };

    const addedRecipe = await window.recipeDataManager.addRecipe(testRecipe);
    console.log("✅ Add test successful:", addedRecipe.name);

    // Test delete
    await window.recipeDataManager.deleteRecipe(addedRecipe.id);
    console.log("✅ Delete test successful");

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Clean localStorage function
window.cleanOldRecipeData = async function () {
  if (
    window.recipeDataManager &&
    window.recipeDataManager.clearOldLocalStorageData
  ) {
    return await window.recipeDataManager.clearOldLocalStorageData();
  }
  console.log("⚠️ recipeDataManager not available for cleanup");
  return false;
};

// APK専用 起動時初期化関数 (ユーザー提案実装)
window.initializeAndLoadRecipes = async function () {
  console.log("🚀 APK専用 シンプル初期化開始");

  // CapacitorのFileSystemプラグインを直接取得
  const { Filesystem, Directory, Encoding } = Capacitor.Plugins;
  const RECIPE_FILE = "recipes.json";

  try {
    // 【手順1】まず、ユーザーの保存領域にあるファイルの読み込みを試みる
    const contents = await Filesystem.readFile({
      path: RECIPE_FILE,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    console.log("✅ ユーザーのレシピファイルを読み込みました。");
    const data = JSON.parse(contents.data);
    renderRecipesToUI(data.recipes || []);
    return data;
  } catch (e) {
    // 【手順2】読み込みに失敗した場合（＝初回起動でファイルが存在しない）
    console.log("ℹ️ 初回起動を検出。初期レシピをコピーします。");

    try {
      // APKに同梱された初期レシピ(./recipes.json)を取得
      const response = await fetch("./recipes.json");
      const bundledData = await response.text();

      // ユーザーの保存領域に書き込む
      await Filesystem.writeFile({
        path: RECIPE_FILE,
        data: bundledData,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      console.log("✅ 初期レシピのコピーが完了しました。");
      const data = JSON.parse(bundledData);
      renderRecipesToUI(data.recipes || []);
      return data;
    } catch (copyError) {
      console.error(
        "❌ 致命的エラー: 初期レシピのコピーに失敗しました！",
        copyError,
      );
      // エラーが発生した場合、空のレシピデータを返す
      const emptyData = { version: "1.0", recipes: [] };
      renderRecipesToUI([]);
      return emptyData;
    }
  }
};

// 究極のデバッグ関数 - BOC-107 Export Error Diagnosis
window.testFileRead = async function () {
  const { Filesystem, Directory, Encoding } = Capacitor.Plugins;
  const FILENAME = "recipes.json";

  console.log(`[DEBUG] 📝これから ${FILENAME} の読み込みテストを開始します...`);

  try {
    const result = await Filesystem.readFile({
      path: FILENAME,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    console.log(
      "[DEBUG] ✅ 読み込み成功！ファイルの中身（生テキスト）:",
      result.data,
    );
    console.log("[DEBUG] 📊 ファイルサイズ:", result.data.length, "characters");

    // Try to parse as JSON to check structure
    try {
      const parsed = JSON.parse(result.data);
      console.log("[DEBUG] 🔍 JSON解析成功！構造:", {
        hasVersion: !!parsed.version,
        hasRecipes: !!parsed.recipes,
        recipeCount: parsed.recipes ? parsed.recipes.length : "N/A",
        dataKeys: Object.keys(parsed),
      });
    } catch (parseError) {
      console.error("[DEBUG] ❌ JSON解析失敗！", parseError);
    }

    return result.data;
  } catch (error) {
    console.error(
      `[DEBUG] ❌ 読み込み失敗！エラー詳細:`,
      JSON.stringify(error, null, 2),
    );
    return null;
  }
};

// Gemini's Solution: initializeAndLoadRecipes with enhanced logging for false error detection
window.initializeAndLoadRecipes = async function () {
  console.log("[DIAG] 🚀 initializeAndLoadRecipes開始");

  try {
    const { Filesystem, Directory, Encoding } = Capacitor.Plugins;
    const RECIPE_FILE = "recipes.json";

    console.log("[DIAG] 📁 Documents/recipes.json読み込み試行中...");

    try {
      // Try to read existing user recipes file first
      const contents = await Filesystem.readFile({
        path: RECIPE_FILE,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      const data = JSON.parse(contents.data);
      console.log("[DIAG] ✅ TRYブロックの最後まで到達。成功を返します。");
      console.log(
        "[DIAG] 📊 レシピ数:",
        data.recipes ? data.recipes.length : 0,
      );

      // Successfully loaded, render to UI
      if (window.app && window.app.renderRecipes) {
        window.app.renderRecipes(data.recipes || []);
        console.log("[DIAG] ✅ UI更新完了");
      } else {
        console.log(
          "[DIAG] ⚠️ UI更新関数が見つかりません - 手動レンダリング実行",
        );
        renderRecipesToUI(data.recipes || []);
      }

      return data;
    } catch (fileError) {
      console.log("[DIAG] 📝 初回起動検出 - APKアセットからコピーします");

      // File doesn't exist, copy from APK assets
      const response = await fetch("./recipes.json");
      const bundledData = await response.text();

      await Filesystem.writeFile({
        path: RECIPE_FILE,
        data: bundledData,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      const data = JSON.parse(bundledData);
      console.log(
        "[DIAG] ✅ 初期コピー成功 - TRYブロックの最後まで到達。成功を返します。",
      );
      console.log(
        "[DIAG] 📊 コピーしたレシピ数:",
        data.recipes ? data.recipes.length : 0,
      );

      // Render initial recipes to UI
      if (window.app && window.app.renderRecipes) {
        window.app.renderRecipes(data.recipes || []);
        console.log("[DIAG] ✅ UI更新完了");
      } else {
        console.log(
          "[DIAG] ⚠️ UI更新関数が見つかりません - 手動レンダリング実行",
        );
        renderRecipesToUI(data.recipes || []);
      }

      return data;
    }
  } catch (e) {
    console.error(
      "[DIAG] ❌ CATCHブロックが実行されました。エラーを返します。",
      e,
    );

    // This might be the source of "false error reporting"
    if (typeof displayDataLoadError === "function") {
      console.log(
        "[DIAG] ⚠️ displayDataLoadError()が呼ばれます - これが偽エラーの原因かもしれません",
      );
      displayDataLoadError();
    }

    return { version: "1.0", recipes: [] };
  }
};

// Create global instance for app integration
window.recipeDataManager = new RecipeDataManager();

console.log("✅ APK専用 Simple Recipe Data Manager loaded");
console.log("🔧 Global instance created: window.recipeDataManager");
console.log("🔧 Available functions:");
console.log("  - testFileRead() - 究極のデバッグ関数（BOC-107対応）");
console.log("  - initializeAndLoadRecipes() - APK専用起動時初期化");
console.log("  - forceRefreshLocalRecipes() - APK専用リフレッシュ");
console.log("  - loadAllRecipes() - Load all recipes");
console.log("  - addNewRecipe(data) - Add new recipe");
console.log("  - removeRecipe(id) - Delete recipe");
