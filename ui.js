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
   * @param {string} sortType - Optional sort type ('time' or 'name')
   */
  render(sortType = null) {
    console.log("🎨 BOC-109: UI render started");

    if (!window.app || !window.app.isInitialized) {
      console.log("⏳ App not initialized yet, skipping render");
      return;
    }

    // Get sorted recipes if sortType is specified, otherwise use default
    let recipes;
    if (sortType && window.app.getSortedRecipes) {
      recipes = window.app.getSortedRecipes(sortType);
      console.log(`🎨 Rendering ${recipes.length} recipes with sort: ${sortType}`);
    } else {
      // Get current active sort from UI
      const activeTab = document.querySelector('.sort-tab.active');
      const currentSort = activeTab ? activeTab.dataset.sort : 'time';
      recipes = window.app.getSortedRecipes ? window.app.getSortedRecipes(currentSort) : window.app.getRecipes();
      console.log(`🎨 Rendering ${recipes.length} recipes with active sort: ${currentSort}`);
    }

    const recipesListElement = document.getElementById("recipes-list");
    if (!recipesListElement) {
      console.error("❌ recipes-list element not found");
      return;
    }

    // Clear existing content
    recipesListElement.innerHTML = "";

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
    recipes.forEach((recipe) => {
      const recipeElement = this.createRecipeElement(recipe);
      recipesListElement.appendChild(recipeElement);
    });

    console.log("✅ BOC-109: UI render completed");
  },

  /**
   * Create a single recipe element using Magic Enhanced Recipe Card
   */
  createRecipeElement(recipe) {
    // Use Magic Enhanced Recipe Card if available
    if (window.EnhancedRecipeCard) {
      console.log(`🔮 Using Magic Enhanced Recipe Card for: ${recipe.name}`);

      const container = document.createElement("div");
      container.className = "recipe-item enhanced";

      // Prepare recipe data for enhanced card
      const enhancedRecipeData = {
        id: recipe.id,
        name: recipe.name || "No title",
        thumbnail: recipe.thumbnail || null,
        category: recipe.category || this.getCategoryFromIngredients(recipe.ingredients),
        servings: recipe.servings || 4,
        cookTime: recipe.cookTime || "30分",
        difficulty: recipe.difficulty || this.calculateDifficulty(recipe)
      };

      // Render using Magic Enhanced Recipe Card
      window.EnhancedRecipeCard.render(enhancedRecipeData, container);

      return container;
    } else {
      // Fallback: Use traditional recipe card with enhanced styling
      console.log(`🔧 Using fallback enhanced recipe card for: ${recipe.name}`);

      const element = document.createElement("div");
      element.className = "recipe-item";
      element.innerHTML = `
        <div class="recipe-card-enhanced" data-recipe-id="${recipe.id}" role="article" tabindex="0" aria-label="Recipe: ${recipe.name}">
          <div class="recipe-card-inner">
            <div class="recipe-content">
              <h3 class="recipe-title">${recipe.name || "No title"}</h3>

              <div class="recipe-ingredients">
                <h4 class="ingredients-title">材料</h4>
                <ul class="ingredients-list">
                  ${this.formatIngredientsForCard(recipe.ingredients)}
                </ul>
              </div>

              <div class="recipe-actions">
                <button class="action-btn primary" onclick="window.app?.showRecipeDetails('${recipe.id}')" aria-label="View ${recipe.name} details">
                  <span>作り方を見る</span>
                  <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Add enhanced click handler
      const cardElement = element.querySelector('.recipe-card-enhanced');
      if (cardElement) {
        cardElement.addEventListener("click", (event) => {
          // Prevent double-clicks
          if (event.detail > 1) return;

          console.log(`🍳 Enhanced Recipe clicked: ${recipe.name} (ID: ${recipe.id})`);

          if (window.app && typeof window.app.showRecipeDetails === "function") {
            // Add visual feedback
            cardElement.style.transform = 'scale(0.98)';
            setTimeout(() => {
              cardElement.style.transform = '';
              window.app.showRecipeDetails(recipe.id);
            }, 100);
          } else {
            console.error("❌ app.showRecipeDetails not available");
            alert("レシピ詳細機能は準備中です");
          }
        });

        // Keyboard navigation
        cardElement.addEventListener("keydown", (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            cardElement.click();
          }
        });
      }

      return element;
    }
  },

  /**
   * Format ingredients for card display
   */
  formatIngredientsForCard(ingredients) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return '<li class="ingredient-item">材料情報がありません</li>';
    }

    // Display all ingredients with proper formatting
    const formattedIngredients = ingredients.map(ingredient => {
      let ingredientText = '';

      if (typeof ingredient === 'string') {
        // String format - display as is
        ingredientText = ingredient;
      } else if (typeof ingredient === 'object' && ingredient !== null) {
        // Object format - format with name, amount, and unit
        const name = ingredient.name || '不明な材料';
        const amount = ingredient.amount;
        const unit = ingredient.unit;

        if (amount && unit) {
          // Both amount and unit exist
          ingredientText = `${name} ${amount}${unit}`;
        } else if (amount) {
          // Only amount exists
          ingredientText = `${name} ${amount}`;
        } else if (unit && unit !== '個' && unit !== '適量') {
          // Only unit exists (and it's meaningful)
          ingredientText = `${name} ${unit}`;
        } else {
          // Only name exists
          ingredientText = name;
        }
      } else {
        // Fallback
        ingredientText = '不明な材料';
      }

      return `<li class="ingredient-item">${ingredientText}</li>`;
    }).join('');

    return formattedIngredients;
  },

  /**
   * Get category from ingredients (helper function)
   */
  getCategoryFromIngredients(ingredients) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return 'Recipe';
    }

    // Simple category detection based on ingredients
    const ingredientNames = ingredients.map(ing => (ing.name || '').toLowerCase()).join(' ');

    if (ingredientNames.includes('肉') || ingredientNames.includes('beef') || ingredientNames.includes('pork') || ingredientNames.includes('chicken')) {
      return 'Meat';
    } else if (ingredientNames.includes('魚') || ingredientNames.includes('fish') || ingredientNames.includes('salmon') || ingredientNames.includes('tuna')) {
      return 'Fish';
    } else if (ingredientNames.includes('野菜') || ingredientNames.includes('vegetable') || ingredientNames.includes('salad')) {
      return 'Vegetable';
    } else if (ingredientNames.includes('米') || ingredientNames.includes('rice') || ingredientNames.includes('pasta') || ingredientNames.includes('noodle')) {
      return 'Carbs';
    } else if (ingredientNames.includes('デザート') || ingredientNames.includes('dessert') || ingredientNames.includes('sweet') || ingredientNames.includes('cake')) {
      return 'Dessert';
    }

    return 'Recipe';
  },

  /**
   * Calculate difficulty based on recipe complexity (helper function)
   */
  calculateDifficulty(recipe) {
    if (recipe.difficulty) {
      return recipe.difficulty;
    }

    // Simple difficulty calculation
    const ingredientCount = (recipe.ingredients || []).length;
    const stepCount = (recipe.steps || []).length;
    const cookTimeMinutes = this.parseCookTime(recipe.cookTime);

    let difficultyScore = 0;
    difficultyScore += Math.min(ingredientCount * 0.5, 5); // Max 5 points for ingredients
    difficultyScore += Math.min(stepCount * 0.8, 8); // Max 8 points for steps
    difficultyScore += Math.min(cookTimeMinutes * 0.05, 3); // Max 3 points for time

    if (difficultyScore <= 5) {
      return 'easy';
    } else if (difficultyScore <= 10) {
      return 'medium';
    } else {
      return 'hard';
    }
  },

  /**
   * Parse cook time to minutes (helper function)
   */
  parseCookTime(cookTime) {
    if (!cookTime || typeof cookTime !== 'string') {
      return 30; // Default 30 minutes
    }

    const timeStr = cookTime.toLowerCase();
    let minutes = 0;

    // Extract hours and minutes
    const hourMatch = timeStr.match(/(\d+)\s*(時間|hour|h)/);
    const minuteMatch = timeStr.match(/(\d+)\s*(分|minute|min|m)/);

    if (hourMatch) {
      minutes += parseInt(hourMatch[1]) * 60;
    }
    if (minuteMatch) {
      minutes += parseInt(minuteMatch[1]);
    }

    // If no specific time found, try to extract just numbers
    if (minutes === 0) {
      const numberMatch = timeStr.match(/(\d+)/);
      if (numberMatch) {
        minutes = parseInt(numberMatch[1]);
      }
    }

    return minutes || 30;
  },

  /**
   * Format ingredients for display
   */
  formatIngredients(ingredients) {
    if (!Array.isArray(ingredients)) {
      return "No ingredients";
    }

    return (
      ingredients
        .slice(0, 3) // Show first 3 ingredients
        .map((ing) => `${ing.name} ${ing.amount}${ing.unit}`)
        .join(", ") + (ingredients.length > 3 ? "..." : "")
    );
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Prevent multiple setup
    if (this._listenersSetup) {
      console.log("🔄 BOC-109: Event listeners already setup, skipping...");
      return;
    }

    console.log("🔗 BOC-109: Setting up UI event listeners");

    // Refresh button (header) - Simplified
    const refreshButton = document.getElementById("refresh-button");
    if (refreshButton) {
      refreshButton.addEventListener("click", () => {
        console.log("🔄 Recipe data reload button clicked");
        if (window.app && typeof window.app.refresh === "function") {
          window.app.refresh();
        } else {
          console.error("❌ app.refresh not available");
        }
      });
      console.log("✅ Header refresh button connected");
    } else {
      console.error("❌ Header refresh button not found");
    }

    // Settings button
    const settingsButton = document.querySelector(".settings-button");
    if (settingsButton) {
      settingsButton.addEventListener("click", () => {
        console.log("⚙️ Settings button clicked");
        if (window.app && window.app.showSettings) {
          window.app.showSettings();
        } else {
          console.error("❌ app.showSettings not available");
          alert("設定機能は準備中です");
        }
      });
      console.log("✅ Settings button connected");
    }

    // AI Recipe Add button
    const aiAddButton = document.querySelector(".ai-add-button");
    if (aiAddButton) {
      aiAddButton.addEventListener("click", () => {
        console.log("🤖 AI Add button clicked");
        if (window.showAIRecipeInput) {
          window.showAIRecipeInput();
        } else {
          console.error("❌ showAIRecipeInput not available");
          alert("AI追加機能は準備中です");
        }
      });
      console.log("✅ AI Add button connected");
    }

    // Data refresh button (search area) - Simplified
    const refreshDataButton = document.querySelector(".refresh-data-button");
    if (refreshDataButton) {
      refreshDataButton.addEventListener("click", () => {
        console.log("🔄 Recipe data reload button clicked");
        if (window.forceReloadRecipes) {
          window.forceReloadRecipes();
        } else if (window.app && typeof window.app.refresh === "function") {
          window.app.refresh();
        } else {
          console.error("❌ No recipe reload function available");
        }
      });
      console.log("✅ Data refresh button connected");
    }

    // Sort tabs
    const sortTabs = document.querySelectorAll(".sort-tab");
    sortTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const sortType = tab.dataset.sort;
        console.log(`📊 Sort tab clicked: ${sortType}`);

        // Update active tab
        sortTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Re-render with new sort
        window.ui.render(sortType);
        console.log(`✅ Recipes sorted by: ${sortType}`);
      });
    });
    if (sortTabs.length > 0) {
      console.log(`✅ ${sortTabs.length} sort tabs connected`);
    }

    // Debug toggle button (floating)
    const debugToggleBtn = document.getElementById("debug-toggle-btn");
    if (debugToggleBtn) {
      debugToggleBtn.addEventListener("click", () => {
        console.log("🐛 Debug toggle button clicked");
        if (window.toggleMobileDebug) {
          window.toggleMobileDebug();
        } else {
          console.error("❌ toggleMobileDebug function not available");
          alert("デバッグ機能は準備中です");
        }
      });
      console.log("✅ Debug toggle button connected");
    }

    // Debug panel buttons
    const debugTestBtn = document.querySelector(".debug-btn.test");
    if (debugTestBtn) {
      debugTestBtn.addEventListener("click", () => {
        console.log("🧪 Debug test button clicked");
        if (window.testBOC100Functions) {
          window.testBOC100Functions();
        } else {
          console.error("❌ testBOC100Functions not available");
          alert("テスト機能は準備中です");
        }
      });
      console.log("✅ Debug test button connected");
    }

    const debugDiagnoseBtn = document.querySelector(".debug-btn.diagnose");
    if (debugDiagnoseBtn) {
      debugDiagnoseBtn.addEventListener("click", () => {
        console.log("🔬 Debug diagnose button clicked");
        if (window.diagnoseRecipeIdProblem) {
          window.diagnoseRecipeIdProblem();
        } else {
          console.error("❌ diagnoseRecipeIdProblem not available");
          alert("ID診断機能は準備中です");
        }
      });
      console.log("✅ Debug diagnose button connected");
    }

    const debugClearBtn = document.querySelector(".debug-btn.clear");
    if (debugClearBtn) {
      debugClearBtn.addEventListener("click", () => {
        console.log("🗑️ Debug clear button clicked");
        if (window.clearBOC100Logs) {
          window.clearBOC100Logs();
        } else {
          console.error("❌ clearBOC100Logs not available");
          alert("ログクリア機能は準備中です");
        }
      });
      console.log("✅ Debug clear button connected");
    }

    const debugCloseBtn = document.querySelector(".debug-btn.close");
    if (debugCloseBtn) {
      debugCloseBtn.addEventListener("click", () => {
        console.log("✕ Debug close button clicked");
        if (window.toggleMobileDebug) {
          window.toggleMobileDebug();
        } else {
          console.error("❌ toggleMobileDebug not available");
          alert("デバッグパネル機能は準備中です");
        }
      });
      console.log("✅ Debug close button connected");
    }

    // FAB (Floating Action Button) for recipe addition
    const fabButton = document.querySelector(".fab");
    if (fabButton) {
      fabButton.addEventListener("click", () => {
        console.log("➕ FAB button clicked - Add new recipe");
        if (window.app && window.app.showAddRecipeScreen) {
          window.app.showAddRecipeScreen();
        } else {
          console.error("❌ app.showAddRecipeScreen not available");
          alert("レシピ追加機能は準備中です");
        }
      });
      console.log("✅ FAB button connected");
    }

    // Recipe detail screen buttons
    const backButtons = document.querySelectorAll(".back-button");
    backButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log("← Back button clicked");
        if (window.app && window.app.navigateBack) {
          window.app.navigateBack();
        } else {
          console.error("❌ app.navigateBack not available");
          alert("戻る機能は準備中です");
        }
      });
    });
    if (backButtons.length > 0) {
      console.log(`✅ ${backButtons.length} back buttons connected`);
    }

    // Settings screen buttons
    const exportButton = document.querySelector(
      'button[onclick*="exportData"]',
    );
    if (exportButton) {
      exportButton.addEventListener("click", async () => {
        console.log("📦 Export button clicked");
        try {
          if (window.recipeDataManager && window.recipeDataManager.exportData) {
            await window.recipeDataManager.exportData();
          } else {
            console.error("❌ recipeDataManager.exportData not available");
            alert("エクスポート機能が利用できません");
          }
        } catch (error) {
          console.error("❌ Export failed:", error);
          alert(`エクスポートに失敗しました: ${error.message}`);
        }
      });
      console.log("✅ Export button connected");
    }

    const importButton = document.querySelector(
      'button[onclick*="importData"]',
    );
    if (importButton) {
      importButton.addEventListener("click", async () => {
        console.log("📥 Import button clicked");
        try {
          if (window.recipeDataManager && window.recipeDataManager.importData) {
            await window.recipeDataManager.importData();
          } else {
            console.error("❌ recipeDataManager.importData not available");
            alert("インポート機能が利用できません");
          }
        } catch (error) {
          console.error("❌ Import failed:", error);
          alert(`インポートに失敗しました: ${error.message}`);
        }
      });
      console.log("✅ Import button connected");
    }

    // Mark as setup to prevent duplicate calls
    this._listenersSetup = true;
    console.log("🔗 BOC-109: All UI event listeners setup completed");
  },

  /**
   * Show user feedback message
   */
  showMessage(message, type = "info") {
    console.log(`📢 UI Message (${type}): ${message}`);
    // Future: implement actual message display
    alert(message); // Temporary simple implementation
  },

  /**
   * Screen navigation functions
   */
  showScreen(screenId) {
    console.log(`🔄 Switching to screen: ${screenId}`);

    // Hide all screens
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => {
      screen.classList.remove("active");
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add("active");
      console.log(`✅ Screen ${screenId} activated`);
    } else {
      console.error(`❌ Screen ${screenId} not found`);
    }
  },

  /**
   * Debug logs functions
   */
  showDebugLogs() {
    console.log("🐛 Opening debug logs modal");

    try {
      // Show debug panel instead of modal for mobile compatibility
      const debugPanel = document.getElementById("mobile-debug-panel");
      console.log("🔍 Debug panel element:", debugPanel);

      if (debugPanel) {
        debugPanel.style.display = "block";
        debugPanel.style.visibility = "visible";
        console.log("🔍 Debug panel display set to:", debugPanel.style.display);

        // Refresh debug logs
        if (typeof this.refreshDebugLogs === 'function') {
          this.refreshDebugLogs();
          console.log("✅ Debug panel shown and logs refreshed");
        } else {
          console.log("✅ Debug panel shown (refresh function not available)");
        }
      } else {
        console.error("❌ Debug panel not found");
        // Fallback: create a simple debug alert
        const logs = this.debugLogs || ['No debug logs available'];
        alert(`🐛 Debug Logs:\n\n${logs.slice(-10).join('\n')}`);
      }
    } catch (error) {
      console.error("❌ Error in showDebugLogs:", error);
      alert("❌ デバッグログ機能でエラーが発生しました");
    }
  },

  hideDebugLogs() {
    console.log("🐛 Closing debug logs");

    const debugPanel = document.getElementById("mobile-debug-panel");
    if (debugPanel) {
      debugPanel.style.display = "none";
      console.log("✅ Debug panel hidden");
    }
  },

  refreshDebugLogs() {
    console.log("🔄 Refreshing debug logs");

    const content = document.getElementById("mobile-debug-content");
    if (!content) {
      console.error("❌ Debug content area not found");
      return;
    }

    // Get logs from various sources
    let allLogs = [];

    // BOC-100 logs if available
    if (window.boc100Logs && Array.isArray(window.boc100Logs)) {
      allLogs = allLogs.concat(
        window.boc100Logs.map(
          (log) => `[${log.time}] [${log.type.toUpperCase()}] ${log.message}`,
        ),
      );
    }

    // General debug logs if available
    if (window.debugLogs && Array.isArray(window.debugLogs)) {
      allLogs = allLogs.concat(window.debugLogs);
    }

    // Recent console logs (simplified)
    allLogs.push(
      `[${new Date().toLocaleTimeString()}] [INFO] Debug logs refreshed`,
    );
    allLogs.push(
      `[${new Date().toLocaleTimeString()}] [INFO] App initialized: ${!!window.app?.isInitialized}`,
    );
    allLogs.push(
      `[${new Date().toLocaleTimeString()}] [INFO] Recipes loaded: ${window.app?.getRecipes()?.length || 0}`,
    );

    // Create scrollable log display with copy functionality
    content.innerHTML = `
      <div class="debug-logs-container">
        <div class="debug-controls-top">
          <button onclick="window.ui.copyAllLogs()" class="debug-button">📋 全ログコピー</button>
          <button onclick="window.ui.clearDebugLogs()" class="debug-button">🧹 クリア</button>
          <button onclick="window.ui.scrollToBottom()" class="debug-button">⬇️ 最下部へ</button>
        </div>
        <div id="debug-logs-scroll" class="debug-logs-scroll">
          ${
            allLogs.length > 0
              ? allLogs
                  .map(
                    (log, index) =>
                      `<div class="debug-log-line" onclick="window.ui.copyLogLine(${index})">${log}</div>`,
                  )
                  .join("")
              : '<div class="debug-log-line">ログがありません</div>'
          }
        </div>
      </div>
    `;

    // Auto scroll to bottom
    this.scrollToBottom();

    console.log(`✅ Debug logs refreshed: ${allLogs.length} entries`);
  },

  copyAllLogs() {
    console.log("📋 Copying all debug logs");

    const logLines = document.querySelectorAll(".debug-log-line");
    const allText = Array.from(logLines)
      .map((line) => line.textContent)
      .join("\n");

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(allText)
        .then(() => {
          alert("✅ 全ログをコピーしました");
        })
        .catch((err) => {
          console.error("❌ Clipboard copy failed:", err);
          this.fallbackCopy(allText);
        });
    } else {
      this.fallbackCopy(allText);
    }
  },

  copyLogLine(index) {
    console.log(`📋 Copying log line ${index}`);

    const logLine = document.querySelectorAll(".debug-log-line")[index];
    if (!logLine) {
      console.error("❌ Log line not found");
      return;
    }

    const text = logLine.textContent;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert(`✅ ログをコピーしました: ${text.substring(0, 50)}...`);
        })
        .catch((err) => {
          console.error("❌ Clipboard copy failed:", err);
          this.fallbackCopy(text);
        });
    } else {
      this.fallbackCopy(text);
    }
  },

  fallbackCopy(text) {
    // Fallback for older browsers or restricted environments
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      alert("✅ ログをコピーしました (fallback method)");
    } catch (err) {
      console.error("❌ Fallback copy failed:", err);
      alert("❌ コピーに失敗しました。手動でテキストを選択してください。");
    }
    document.body.removeChild(textarea);
  },

  scrollToBottom() {
    const scrollContainer = document.getElementById("debug-logs-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  },

  clearDebugLogs() {
    console.log("🧹 Clearing debug logs");

    // Clear global log arrays
    if (window.boc100Logs) {
      window.boc100Logs.length = 0;
    }
    if (window.debugLogs) {
      window.debugLogs.length = 0;
    }

    // Refresh display
    this.refreshDebugLogs();

    alert("✅ デバッグログをクリアしました");
  },

  /**
   * Export data functionality
   */
  async exportData() {
    console.log("📦 Starting data export");

    try {
      // Get all recipes from app
      const recipes = window.app ? window.app.getRecipes() : [];

      // Create export data structure
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        recipesCount: recipes.length,
        recipes: recipes,
        metadata: {
          appVersion: "Petit Recipe v3.0",
          exportSource: "Settings Screen",
        },
      };

      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });

      // Create download
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `petit-recipe-backup-${timestamp}.json`;

      // Use Capacitor FileSystem (same as recipeDataManager.js)
      if (window.Capacitor && window.Capacitor.Plugins) {
        const { Filesystem, Directory, Encoding } = window.Capacitor.Plugins;

        await Filesystem.writeFile({
          path: filename,
          data: jsonData,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        alert(
          `✅ データをエクスポートしました: Documents/${filename}\n\nレシピ数: ${recipes.length}件`,
        );
      } else {
        throw new Error("Capacitor FileSystem not available");
      }

      console.log(`✅ Export completed: ${recipes.length} recipes`);
    } catch (error) {
      console.error("❌ Export failed:", error);
      alert(`❌ エクスポートに失敗しました: ${error.message}`);
    }
  },

  /**
   * Import data functionality
   */
  async importData() {
    console.log("📥 Starting data import");

    try {
      // Use Capacitor FileSystem (same as recipeDataManager.js)
      if (window.Capacitor && window.Capacitor.Plugins) {
        // APK environment - show file picker instructions
        const proceed = confirm(
          "📥 データをインポートしますか？\n\n⚠️ 現在のデータは全て上書きされます。\n\n📁 Documents フォルダにバックアップファイル(*.json)を配置してからOKを押してください。",
        );

        if (!proceed) {
          console.log("Import cancelled by user");
          return;
        }

        // Try to find backup files in Documents
        const { Filesystem, Directory, Encoding } = window.Capacitor.Plugins;

        try {
          const files = await Filesystem.readdir({
            path: "",
            directory: Directory.Documents,
          });

          const backupFiles = files.files.filter(
            (file) =>
              file.name.endsWith(".json") &&
              (file.name.includes("backup") ||
                file.name.includes("petit-recipe")),
          );

          if (backupFiles.length === 0) {
            alert(
              "❌ バックアップファイルが見つかりません。\n\nDocuments フォルダに *.json ファイルを配置してください。",
            );
            return;
          }

          // Use the most recent backup file
          const latestFile = backupFiles.sort((a, b) =>
            b.name.localeCompare(a.name),
          )[0];

          const fileData = await Filesystem.readFile({
            path: latestFile.name,
            directory: Directory.Documents,
            encoding: "utf8",
          });

          await this.processImportData(fileData.data, latestFile.name);
        } catch (fileError) {
          console.error("File system error:", fileError);
          alert(
            "❌ ファイル読み込みエラー: Documents フォルダにアクセスできません。",
          );
        }
      } else {
        throw new Error("Capacitor FileSystem not available");
      }
    } catch (error) {
      console.error("❌ Import failed:", error);
      alert(`❌ インポートに失敗しました: ${error.message}`);
    }
  },

  /**
   * Process imported data
   */
  async processImportData(jsonData, filename) {
    console.log(`📥 Processing import data from: ${filename}`);

    try {
      const importData = JSON.parse(jsonData);

      // Validate import data
      if (!importData.recipes || !Array.isArray(importData.recipes)) {
        throw new Error("無効なバックアップファイル形式です");
      }

      const recipeCount = importData.recipes.length;

      const confirm = window.confirm(
        `📥 データをインポートしますか？\n\n` +
          `ファイル: ${filename}\n` +
          `レシピ数: ${recipeCount}件\n` +
          `エクスポート日: ${importData.exportDate || "不明"}\n\n` +
          `⚠️ 現在のデータは全て上書きされます。`,
      );

      if (!confirm) {
        console.log("Import cancelled by user");
        return;
      }

      // Save imported data using recipeDataManager
      if (
        window.recipeDataManager &&
        typeof window.recipeDataManager.saveRecipes === "function"
      ) {
        console.log("📥 Using recipeDataManager to save imported data");

        const success = await window.recipeDataManager.saveRecipes(
          importData.recipes,
        );

        if (success) {
          // Update app state
          if (window.app) {
            window.app.recipes = importData.recipes;
            window.app.isInitialized = true;
          }

          // Re-render UI
          if (window.ui) {
            window.ui.render();
          }

          alert(
            `✅ データをインポートしました！\n\nインポート件数: ${recipeCount}件\nファイル: ${filename}`,
          );
          console.log(`✅ Import completed: ${recipeCount} recipes imported`);

          // Navigate back to main screen
          this.showScreen("recipes-screen");
        } else {
          throw new Error("レシピデータの保存に失敗しました");
        }
      } else {
        throw new Error("recipeDataManager が利用できません");
      }
    } catch (error) {
      console.error("❌ Import processing failed:", error);
      alert(`❌ インポート処理に失敗しました: ${error.message}`);
    }
  },

  /**
   * Render recipe details page
   */
  renderRecipeDetails(recipe) {
    console.log(`🍳 Rendering recipe details for: ${recipe.name}`);

    // Update the recipe title
    const titleElement = document.getElementById("recipe-detail-title");
    if (titleElement) {
      titleElement.textContent = recipe.name;
    }

    // Render ingredients
    const ingredientsContainer = document.getElementById("ingredients-list");
    if (ingredientsContainer && recipe.ingredients) {
      ingredientsContainer.innerHTML = "";

      recipe.ingredients.forEach((ingredient) => {
        const ingredientElement = document.createElement("div");
        ingredientElement.className = "ingredient-item";
        ingredientElement.innerHTML = `
          <span class="ingredient-name">${ingredient.name}</span>
          <span class="ingredient-amount">${ingredient.amount}${ingredient.unit}</span>
        `;
        ingredientsContainer.appendChild(ingredientElement);
      });

      console.log(`✅ Rendered ${recipe.ingredients.length} ingredients`);
    }

    // Render steps
    const stepsContainer = document.getElementById("steps-list");
    if (stepsContainer && recipe.steps) {
      stepsContainer.innerHTML = "";

      recipe.steps.forEach((step, index) => {
        const stepElement = document.createElement("div");
        stepElement.className = "step-item";
        stepElement.innerHTML = `
          <div class="step-number">${index + 1}</div>
          <div class="step-content">${step}</div>
        `;
        stepsContainer.appendChild(stepElement);
      });

      console.log(`✅ Rendered ${recipe.steps.length} steps`);
    }

    // Update serving info if available
    const servingInfo = document.querySelector(".portion-slider-container");
    if (servingInfo && recipe.servings) {
      const portionValue = document.getElementById("portion-value");
      const portionSlider = document.getElementById("portion-slider");

      if (portionValue) portionValue.textContent = recipe.servings;
      if (portionSlider) portionSlider.value = recipe.servings;
    }

    // Show nutrition info if available
    const nutritionContainer = document.getElementById("nutrition-info");
    if (nutritionContainer && recipe.nutrition) {
      nutritionContainer.innerHTML = `
        <h4>栄養情報 (1人前)</h4>
        <div class="nutrition-grid">
          ${recipe.nutrition.calories ? `<div class="nutrition-item">カロリー: ${recipe.nutrition.calories}kcal</div>` : ""}
          ${recipe.nutrition.protein ? `<div class="nutrition-item">タンパク質: ${recipe.nutrition.protein}g</div>` : ""}
          ${recipe.nutrition.carbs ? `<div class="nutrition-item">炭水化物: ${recipe.nutrition.carbs}g</div>` : ""}
          ${recipe.nutrition.fat ? `<div class="nutrition-item">脂質: ${recipe.nutrition.fat}g</div>` : ""}
        </div>
      `;
    }

    console.log("✅ Recipe details rendered successfully");
  },

  /**
   * BOC-111: Debug Panel Management Functions
   */

  /**
   * Toggle mobile debug panel visibility
   */
  toggleMobileDebug() {
    const debugPanel = document.getElementById("mobile-debug-panel");
    if (debugPanel) {
      const isVisible = debugPanel.style.display !== "none";
      debugPanel.style.display = isVisible ? "none" : "block";
      console.log(`🐛 Debug panel ${isVisible ? 'hidden' : 'shown'}`);

      if (!isVisible) {
        // Show current debug logs when opening
        this.updateDebugPanel();
      }
    }
  },

  /**
   * Update debug panel content with current logs
   */
  updateDebugPanel() {
    const debugContent = document.getElementById("mobile-debug-content");
    if (debugContent && window.debugLogs) {
      debugContent.innerHTML = window.debugLogs
        .slice(-20) // Show last 20 logs
        .map((log, index) => `<div class="debug-log-line">[${index + 1}] ${log}</div>`)
        .join("");
    }
  },

  /**
   * Test BOC-100 functions
   */
  testBOC100Functions() {
    console.log("🧪 Running BOC-100 function tests");

    const tests = [
      {
        name: "Recipe Data Manager",
        test: () => !!window.recipeDataManager
      },
      {
        name: "App Core Functions",
        test: () => !!(window.app && window.app.getRecipes)
      },
      {
        name: "UI Render Function",
        test: () => !!(window.ui && window.ui.render)
      },
      {
        name: "Recipes Array",
        test: () => window.app && Array.isArray(window.app.getRecipes())
      }
    ];

    const results = tests.map(test => ({
      name: test.name,
      passed: test.test(),
      status: test.test() ? "✅" : "❌"
    }));

    console.log("🧪 Test Results:", results);

    // Update debug panel with test results
    const debugContent = document.getElementById("mobile-debug-content");
    if (debugContent) {
      debugContent.innerHTML = `
        <h4>🧪 Function Tests</h4>
        ${results.map(r => `<div>${r.status} ${r.name}: ${r.passed ? 'PASS' : 'FAIL'}</div>`).join('')}
        <div>📊 Total Recipes: ${window.app ? window.app.getRecipes().length : 'N/A'}</div>
      `;
    }

    alert(`テスト完了: ${results.filter(r => r.passed).length}/${results.length} 成功`);
  },

  /**
   * Diagnose recipe ID problems
   */
  diagnoseRecipeIdProblem() {
    console.log("🔬 Running recipe ID diagnosis");

    if (!window.app || !window.app.getRecipes) {
      alert("❌ アプリが初期化されていません");
      return;
    }

    const recipes = window.app.getRecipes();
    const diagnosis = {
      totalRecipes: recipes.length,
      withIds: recipes.filter(r => r.id).length,
      withoutIds: recipes.filter(r => !r.id).length,
      duplicateIds: [],
      maxId: recipes.length > 0 ? Math.max(...recipes.map(r => r.id || 0)) : 0
    };

    // Check for duplicate IDs
    const idCounts = {};
    recipes.forEach(recipe => {
      if (recipe.id) {
        idCounts[recipe.id] = (idCounts[recipe.id] || 0) + 1;
      }
    });

    diagnosis.duplicateIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);

    console.log("🔬 Recipe ID Diagnosis:", diagnosis);

    const debugContent = document.getElementById("mobile-debug-content");
    if (debugContent) {
      debugContent.innerHTML = `
        <h4>🔬 ID診断結果</h4>
        <div>📊 総レシピ数: ${diagnosis.totalRecipes}</div>
        <div>✅ ID有り: ${diagnosis.withIds}</div>
        <div>❌ ID無し: ${diagnosis.withoutIds}</div>
        <div>🔄 重複ID: ${diagnosis.duplicateIds.length > 0 ? diagnosis.duplicateIds.join(', ') : 'なし'}</div>
        <div>📈 最大ID: ${diagnosis.maxId}</div>
      `;
    }

    alert(`ID診断完了: ${diagnosis.withIds}/${diagnosis.totalRecipes} にIDあり`);
  },

  /**
   * Clear BOC-100 logs
   */
  clearBOC100Logs() {
    console.log("🗑️ Clearing debug logs");

    if (window.debugLogs) {
      window.debugLogs = [];
    }

    const debugContent = document.getElementById("mobile-debug-content");
    if (debugContent) {
      debugContent.innerHTML = "<div>🧹 ログをクリアしました</div>";
    }

    console.log("✅ Debug logs cleared");
    alert("ログをクリアしました");
  }
};

// Make ui globally available
window.ui = ui;

// Make debug functions globally available
window.toggleMobileDebug = () => window.ui.toggleMobileDebug();
window.testBOC100Functions = () => window.ui.testBOC100Functions();
window.diagnoseRecipeIdProblem = () => window.ui.diagnoseRecipeIdProblem();
window.clearBOC100Logs = () => window.ui.clearBOC100Logs();

// Setup event listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("🔗 DOM loaded, setting up UI event listeners");
    if (window.ui && window.ui.setupEventListeners) {
      window.ui.setupEventListeners();
    }
  });
} else {
  // DOM is already loaded
  setTimeout(() => {
    console.log("🔗 DOM already loaded, setting up UI event listeners");
    if (window.ui && window.ui.setupEventListeners) {
      window.ui.setupEventListeners();
    }
  }, 100);
}

// Re-render when app is initialized or refreshed
document.addEventListener("DOMContentLoaded", () => {
  // Wait for app initialization
  const checkAppReady = () => {
    if (window.app && window.app.isInitialized) {
      console.log("🎨 App ready, triggering initial UI render");
      window.ui.render();
    } else {
      setTimeout(checkAppReady, 100);
    }
  };
  setTimeout(checkAppReady, 100);
});

console.log("🎨 BOC-109: UI.js loaded - Clean UI layer established");
