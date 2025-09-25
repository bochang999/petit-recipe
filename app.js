// Emergency App Object - Essential UI Functions
// Missing window.app object causing all button failures

window.app = {
  // Navigation functions
  showSettings() {
    console.log("⚙️ Settings screen requested");
    const recipeScreen = document.getElementById("recipes-screen");
    const settingsScreen = document.getElementById("settings-screen");

    if (recipeScreen) recipeScreen.classList.remove("active");
    if (settingsScreen) settingsScreen.classList.add("active");
  },

  navigateBack() {
    console.log("← Navigate back requested");
    const settingsScreen = document.getElementById("settings-screen");
    const recipeScreen = document.getElementById("recipes-screen");

    if (settingsScreen) settingsScreen.classList.remove("active");
    if (recipeScreen) recipeScreen.classList.add("active");
  },

  // Delete confirmation functions
  cancelDeleteRecipe() {
    console.log("🚫 Delete cancelled");
    const deleteModal = document.getElementById("delete-modal");
    if (deleteModal) {
      deleteModal.style.display = "none";
    }
  },

  executeDeleteRecipe() {
    console.log("🗑️ Execute delete requested");
    // Basic implementation - should be enhanced with actual deletion logic
    const deleteModal = document.getElementById("delete-modal");
    if (deleteModal) {
      deleteModal.style.display = "none";
    }
    alert("削除機能は現在準備中です");
  },

  // Data management functions
  exportData() {
    console.log("📦 Export data requested");
    alert("エクスポート機能は現在準備中です");
  },

  importData() {
    console.log("📥 Import data requested");
    const fileInput = document.getElementById("import-file-input");
    if (fileInput) {
      fileInput.click();
    }
  },

  async handleFileSelection(event) {
    console.log("📁 File selection:", event.target.files);
    const file = event.target.files[0];
    if (!file) {
      alert("ファイルが選択されていません");
      return;
    }

    try {
      console.log("📥 インポート開始:", file.name);
      const fileContent = await this.readFileAsText(file);
      console.log("📄 ファイル内容読み込み完了");

      const importData = JSON.parse(fileContent);
      console.log("✅ JSON解析完了:", importData);

      // Use the database import function
      if (window.petitRecipeDB && window.petitRecipeDB.importData) {
        const result = await window.petitRecipeDB.importData(importData);
        console.log("✅ インポート完了:", result);
        alert(
          `インポートが完了しました！${result.importedRecipes}件のレシピを追加しました。`,
        );

        // Refresh UI
        if (window.forceRefreshLocalRecipes) {
          await window.forceRefreshLocalRecipes();
        }
      } else {
        throw new Error("petitRecipeDB not available");
      }
    } catch (error) {
      console.error("❌ インポートエラー:", error);
      alert(`インポートに失敗しました: ${error.message}`);
    }
  },

  // Helper function to read file as text
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("File reading failed"));
      reader.readAsText(file);
    });
  },

  // Recipe screen navigation
  showAddRecipeScreen() {
    console.log("➕ Add recipe screen requested");
    const recipeScreen = document.getElementById("recipes-screen");
    const addScreen = document.getElementById("add-recipe-screen");

    if (recipeScreen) recipeScreen.classList.remove("active");
    if (addScreen) addScreen.classList.add("active");
  },

  // Recipe editing functions
  startEditRecipe() {
    console.log("✏️ Edit recipe requested");
    alert("編集機能は現在準備中です");
  },

  duplicateRecipe() {
    console.log("📋 Duplicate recipe requested");
    alert("複製機能は現在準備中です");
  },

  confirmDeleteRecipe() {
    console.log("🗑️ Delete recipe requested");
    const deleteModal = document.getElementById("delete-modal");
    if (deleteModal) {
      deleteModal.style.display = "flex";
    }
  },

  // Additional navigation support
  showRecipeDetail(recipeId) {
    console.log("📖 Recipe detail requested:", recipeId);
    const recipeScreen = document.getElementById("recipes-screen");
    const detailScreen = document.getElementById("recipe-detail-screen");

    if (recipeScreen) recipeScreen.classList.remove("active");
    if (detailScreen) detailScreen.classList.add("active");
  },

  // Simple recipe operations using recipeDataManager
  async addRecipeFromForm(formData) {
    console.log("➕ Adding recipe from form");
    try {
      if (window.addNewRecipe) {
        const result = await window.addNewRecipe(formData);
        console.log("✅ Recipe added successfully:", result.name);
        // Refresh UI
        if (window.refreshRecipeData) {
          await window.refreshRecipeData();
        }
        return result;
      } else {
        alert("レシピ管理システムが初期化されていません");
      }
    } catch (error) {
      console.error("❌ Recipe addition failed:", error);
      alert("レシピの追加に失敗しました: " + error.message);
    }
  },

  async deleteRecipeById(recipeId) {
    console.log("🗑️ Deleting recipe ID:", recipeId);
    try {
      if (window.removeRecipe) {
        await window.removeRecipe(recipeId);
        console.log("✅ Recipe deleted successfully");
        // Refresh UI
        if (window.refreshRecipeData) {
          await window.refreshRecipeData();
        }
      } else {
        alert("レシピ管理システムが初期化されていません");
      }
    } catch (error) {
      console.error("❌ Recipe deletion failed:", error);
      alert("レシピの削除に失敗しました: " + error.message);
    }
  },
};

// Global navigation functions
window.showAIRecipeInput = function () {
  console.log("🤖 AI Recipe Input requested");
  const recipeScreen = document.getElementById("recipes-screen");
  const aiScreen = document.getElementById("ai-recipe-screen");

  if (recipeScreen) recipeScreen.classList.remove("active");
  if (aiScreen) aiScreen.classList.add("active");
};

window.navigateBack = function () {
  console.log("← Navigate back requested");
  // Find active screen and return to recipes screen
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => screen.classList.remove("active"));

  const recipesScreen = document.getElementById("recipes-screen");
  if (recipesScreen) recipesScreen.classList.add("active");
};

window.processAIRecipe = function (event) {
  event.preventDefault();
  console.log("🤖 AI Recipe processing requested");
  alert("AI レシピ処理機能は現在準備中です");
};

console.log("✅ Emergency app object and global functions created");
console.log("🔍 window.app object:", window.app);
console.log("🔍 window.app.showSettings:", typeof window.app.showSettings);
