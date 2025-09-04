// Petit Recipe App JavaScript - RecipeBox UI Integration

class PetitRecipeApp {
  constructor() {
    this.recipes = [];
    this.filteredRecipes = [];
    this.currentRecipe = null;
    this.currentPortion = 1;
    this.currentScreen = "recipes-screen";
    this.viewCounts = {};
    this.init();
  }

  async init() {
    console.log("🍳 Petit Recipe with RecipeBox UI 初期化開始");

    // レシピデータの読み込み
    await this.loadRecipes();

    // 閲覧数データの読み込み
    this.loadViewCounts();

    // イベントリスナー設定
    this.setupEventListeners();

    // 初期画面表示
    this.renderRecipes();

    console.log("✅ Petit Recipe 初期化完了");
  }

  // レシピデータの読み込み
  async loadRecipes() {
    try {
      console.log("🔄 レシピデータ読み込み開始...");
      console.log("🌐 現在のURL:", window.location.href);
      console.log("📱 Capacitor環境:", typeof window.Capacitor !== "undefined");

      let petitRecipes;

      // 1. まずgrlobalのPETIT_RECIPE_DATAを確認
      if (
        typeof window.PETIT_RECIPE_DATA !== "undefined" &&
        Array.isArray(window.PETIT_RECIPE_DATA)
      ) {
        console.log(
          "✅ グローバルレシピデータを使用:",
          window.PETIT_RECIPE_DATA.length + "件",
        );
        petitRecipes = window.PETIT_RECIPE_DATA;
      } else {
        console.log("⚠️ グローバルデータなし、fetchを試行");

        // 2. Capacitor環境での特別処理
        if (
          typeof window.Capacitor !== "undefined" &&
          window.Capacitor.isNativePlatform()
        ) {
          console.log("📱 ネイティブAPK環境でのデータ読み込み");
          try {
            // CapacitorのFilesystemプラグインを使用してアセットにアクセス
            const { Filesystem, Directory } = window.Capacitor.Plugins;
            const result = await Filesystem.readFile({
              path: "public/src/data/recipes.json",
              directory: Directory.Application,
            });
            petitRecipes = JSON.parse(atob(result.data));
            console.log("✅ Capacitor経由でデータ読み込み成功");
          } catch (capacitorError) {
            console.log(
              "⚠️ Capacitorアクセス失敗、通常fetch試行:",
              capacitorError.message,
            );
            throw capacitorError;
          }
        } else {
          // 3. Web環境での通常fetch
          console.log("🌐 Web環境での通常fetch");
          const response = await fetch("src/data/recipes.json");
          console.log(
            "📡 Fetch response:",
            response.status,
            response.statusText,
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          petitRecipes = await response.json();
        }
      }

      console.log("📋 生データ:", petitRecipes.length + "件", petitRecipes);

      // petit-recipe形式をRecipeBox形式に変換
      this.recipes = petitRecipes.map((recipe) =>
        this.convertPetitToRecipeBox(recipe),
      );
      this.filteredRecipes = [...this.recipes];

      console.log("📖 レシピデータ読み込み完了:", this.recipes.length + "件");
      console.log("✅ 変換後データ:", this.recipes);
    } catch (error) {
      console.error("❌ レシピデータ読み込み失敗:", error);
      console.error("❌ エラー詳細:", error.message, error.stack);

      // 最後の手段: フォールバックデータ
      console.log("🆘 フォールバックデータを使用");
      this.recipes = [
        {
          id: "recipe_1",
          name: "サンプルレシピ",
          category: "main",
          servings: 2,
          ingredients: [{ name: "材料1", amount: 100, unit: "g" }],
          steps: ["手順1"],
          cookTime: "30分",
          difficulty: "初級",
        },
      ];
      this.filteredRecipes = [...this.recipes];
      console.log("🔄 フォールバックデータ:", this.recipes.length + "件");
    }
  }

  // petit-recipe形式をRecipeBox形式に変換
  convertPetitToRecipeBox(petitRecipe) {
    console.log("🔄 変換中:", petitRecipe.title, petitRecipe);
    const converted = {
      id: `recipe_${petitRecipe.id}`,
      name: petitRecipe.title,
      category: this.getCategoryFromTitle(petitRecipe.title),
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      servings: this.parseServings(petitRecipe.servings),
      cookTime: petitRecipe.cookTime || "30分",
      difficulty: petitRecipe.difficulty || "初級",
      ingredients: this.parseIngredients(petitRecipe.ingredients || []),
      steps: petitRecipe.instructions || [],
      yield: `${petitRecipe.servings}人前`,
      versions: [{ version: "1.0", date: "2024-01-01", changes: "初版作成" }],
    };
    console.log("✅ 変換結果:", converted);
    return converted;
  }

  // 人数の解析
  parseServings(servings) {
    if (typeof servings === "number") return servings;
    if (typeof servings === "string") {
      const match = servings.match(/(\d+)/);
      return match ? parseInt(match[1]) : 1;
    }
    return 1;
  }

  // 材料の解析
  parseIngredients(ingredients) {
    return ingredients.map((ing) => {
      if (typeof ing === "string") {
        const match = ing.match(/^(.+?)\s+([\d.]+)\s*(\S+)$/);
        if (match) {
          return {
            name: match[1],
            amount: parseFloat(match[2]),
            unit: match[3],
          };
        } else {
          return { name: ing, amount: 1, unit: "個" };
        }
      }
      return ing; // すでにオブジェクト形式の場合
    });
  }

  // タイトルからカテゴリを推測
  getCategoryFromTitle(title) {
    if (!title) return "main";
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes("プリン") ||
      lowerTitle.includes("ケーキ") ||
      lowerTitle.includes("チョコ")
    ) {
      return "dessert";
    }
    if (
      lowerTitle.includes("タレ") ||
      lowerTitle.includes("ソース") ||
      lowerTitle.includes("ドレッシング")
    ) {
      return "sauce";
    }
    if (
      lowerTitle.includes("ジュース") ||
      lowerTitle.includes("茶") ||
      lowerTitle.includes("コーヒー")
    ) {
      return "drink";
    }
    return "main";
  }

  // イベントリスナー設定
  setupEventListeners() {
    // 検索機能
    const searchInput = document.getElementById("recipe-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchRecipes(e.target.value);
      });
    }

    // ソートタブ
    document.querySelectorAll(".sort-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        // アクティブタブの切り替え
        document
          .querySelectorAll(".sort-tab")
          .forEach((t) => t.classList.remove("active"));
        e.target.classList.add("active");

        const sortType = e.target.dataset.sort;
        this.sortRecipes(sortType);
      });
    });

    // 分量調整スライダー
    const portionSlider = document.getElementById("portion-slider");
    if (portionSlider) {
      portionSlider.addEventListener("input", (e) => {
        this.updatePortion(e.target.value);
      });
    }
  }

  // レシピ一覧の表示
  renderRecipes() {
    console.log("🎨 レシピ一覧表示開始:", this.filteredRecipes.length + "件");
    const recipesList = document.getElementById("recipes-list");
    if (!recipesList) {
      console.error("❌ recipes-list要素が見つかりません");
      return;
    }

    if (this.filteredRecipes.length === 0) {
      console.log("⚠️ 表示するレシピがありません");
      recipesList.innerHTML =
        '<div class="no-recipes">レシピがありません</div>';
      return;
    }

    console.log("📋 表示データ:", this.filteredRecipes);

    const recipesHtml = this.filteredRecipes
      .map((recipe) => {
        return `
                <div class="recipe-card" onclick="app.showRecipeDetail('${recipe.id}')">
                    <div class="recipe-header">
                        <div class="recipe-meta">
                            <h3 class="recipe-title">${recipe.name}</h3>
                            <div class="recipe-tags">
                                <span class="recipe-time">⏱️ ${recipe.cookTime}</span>
                                <span class="recipe-servings">👥 ${recipe.servings}人前</span>
                                <span class="recipe-views">👁️ ${this.getViewCount(recipe.id)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="recipe-preview">
                        <strong>材料:</strong> ${recipe.ingredients
                          .slice(0, 3)
                          .map((ing) => ing.name)
                          .join(
                            ", ",
                          )}${recipe.ingredients.length > 3 ? "..." : ""}
                    </div>
                </div>
            `;
      })
      .join("");

    recipesList.innerHTML = recipesHtml;
  }

  // レシピ詳細の表示
  showRecipeDetail(recipeId) {
    const recipe = this.recipes.find((r) => r.id === recipeId);
    if (!recipe) {
      console.error("レシピが見つかりません:", recipeId);
      return;
    }

    this.currentRecipe = recipe;
    this.currentPortion = 1;

    // 閲覧数をインクリメント
    this.incrementViewCount(recipeId);

    // レシピ詳細画面に切り替え
    this.showScreen("recipe-detail-screen");

    // タイトルの設定
    const titleElement = document.getElementById("recipe-detail-title");
    if (titleElement) {
      titleElement.textContent = recipe.name;
    }

    // 人数スライダーリセット
    const portionSlider = document.getElementById("portion-slider");
    const portionValue = document.getElementById("portion-value");
    if (portionSlider && portionValue) {
      portionSlider.value = "1";
      portionValue.textContent = "1";
    }

    // 材料・手順・追加情報の表示
    this.renderIngredients(recipe);
    this.renderSteps(recipe);
    this.renderAdditionalInfo(recipe);
  }

  // 材料リストのレンダリング
  renderIngredients(recipe) {
    const ingredientsList = document.getElementById("ingredients-list");
    if (!ingredientsList) return;

    const ingredientsHtml = recipe.ingredients
      .map(
        (ingredient) => `
            <div class="ingredient-item">
                <span class="ingredient-name">${ingredient.name}</span>
                <span class="ingredient-amount" data-original-amount="${ingredient.amount}">${this.formatAmount(ingredient.amount * this.currentPortion)}${ingredient.unit}</span>
            </div>
        `,
      )
      .join("");

    ingredientsList.innerHTML = ingredientsHtml;
  }

  // 手順のレンダリング
  renderSteps(recipe) {
    const stepsList = document.getElementById("steps-list");
    if (!stepsList) return;

    const stepsHtml = recipe.steps
      .map(
        (step, index) => `
            <div class="step-item">
                <span class="step-number">${index + 1}</span>
                <span class="step-text">${step}</span>
            </div>
        `,
      )
      .join("");

    stepsList.innerHTML = stepsHtml;
  }

  // 追加情報のレンダリング
  renderAdditionalInfo(recipe) {
    const categoryElement = document.getElementById("recipe-category");
    const yieldElement = document.getElementById("recipe-yield");
    const equipmentElement = document.getElementById("recipe-equipment");
    const cookingTimeElement = document.getElementById("recipe-cooking-time");

    if (categoryElement) {
      categoryElement.innerHTML = `<strong>カテゴリ:</strong> ${this.getCategoryName(recipe.category)}`;
    }
    if (yieldElement) {
      yieldElement.innerHTML = `<strong>分量:</strong> ${recipe.yield || recipe.servings + "人前"}`;
    }
    if (cookingTimeElement) {
      cookingTimeElement.innerHTML = `<strong>調理時間:</strong> ${recipe.cookTime}`;
    }
    if (equipmentElement) {
      const equipment = recipe.equipment
        ? recipe.equipment.join(", ")
        : recipe.difficulty || "なし";
      equipmentElement.innerHTML = `<strong>器具・難易度:</strong> ${equipment}`;
    }

    // バージョン履歴
    const versionList = document.getElementById("version-list");
    if (versionList && recipe.versions) {
      const versionsHtml = recipe.versions
        .map(
          (version) => `
                <div class="version-item">
                    <span class="version-number">v${version.version}</span>
                    <span class="version-date">${version.date}</span>
                    <span class="version-changes">${version.changes}</span>
                </div>
            `,
        )
        .join("");
      versionList.innerHTML = versionsHtml;
    }
  }

  // 分量調整
  updatePortion(portion) {
    this.currentPortion = parseInt(portion);

    const portionValue = document.getElementById("portion-value");
    if (portionValue) {
      portionValue.textContent = portion;
    }

    // 材料の分量を更新
    if (this.currentRecipe) {
      this.renderIngredients(this.currentRecipe);
    }
  }

  // レシピ検索
  searchRecipes(searchTerm) {
    if (!searchTerm.trim()) {
      this.filteredRecipes = [...this.recipes];
    } else {
      this.filteredRecipes = this.recipes.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.ingredients.some((ing) =>
            ing.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }
    this.renderRecipes();
  }


  // 画面切り替え
  showScreen(screenId) {
    // すべての画面を非表示
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    // 指定された画面を表示
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add("active");
      this.currentScreen = screenId;
    }
  }

  // カテゴリアイコンの取得
  getCategoryIcon(category) {
    const icons = {
      main: "🍛",
      dessert: "🍰",
      sauce: "🥄",
      drink: "🥤",
      side: "🥗",
      bread: "🍞",
    };
    return icons[category] || "🍳";
  }

  // カテゴリ名の取得
  getCategoryName(category) {
    const names = {
      main: "メイン料理",
      dessert: "デザート",
      sauce: "タレ・調味料",
      drink: "飲み物",
      side: "副菜",
      bread: "パン類",
    };
    return names[category] || "その他";
  }

  // 数量のフォーマット
  formatAmount(amount) {
    if (amount === 0) return "";
    if (amount < 0.1) return amount.toFixed(2);
    if (amount < 1) return amount.toFixed(1);
    if (amount % 1 === 0) return Math.round(amount);
    return amount.toFixed(1);
  }

  // 閲覧数データの読み込み
  loadViewCounts() {
    try {
      const saved = localStorage.getItem('petit-recipe-viewcounts');
      if (saved) {
        this.viewCounts = JSON.parse(saved);
        console.log('📊 閲覧数データ読み込み:', this.viewCounts);
      } else {
        this.viewCounts = {};
        console.log('📊 閲覧数データ初期化');
      }
    } catch (error) {
      console.error('❌ 閲覧数データ読み込み失敗:', error);
      this.viewCounts = {};
    }
  }

  // 閲覧数データの保存
  saveViewCounts() {
    try {
      localStorage.setItem('petit-recipe-viewcounts', JSON.stringify(this.viewCounts));
      console.log('💾 閲覧数データ保存完了:', this.viewCounts);
    } catch (error) {
      console.error('❌ 閲覧数データ保存失敗:', error);
    }
  }

  // 閲覧数のインクリメント
  incrementViewCount(recipeId) {
    if (!this.viewCounts[recipeId]) {
      this.viewCounts[recipeId] = 0;
    }
    this.viewCounts[recipeId]++;
    console.log(`📈 レシピ ${recipeId} 閲覧数: ${this.viewCounts[recipeId]}`);
    this.saveViewCounts();
  }

  // レシピの閲覧数取得
  getViewCount(recipeId) {
    return this.viewCounts[recipeId] || 0;
  }

  // レシピのソート
  sortRecipes(sortType) {
    console.log(`🔄 レシピソート開始: ${sortType}`);
    
    switch (sortType) {
      case 'time':
        // 時系列順（デフォルト順序）
        this.filteredRecipes = [...this.filteredRecipes].sort((a, b) => {
          return this.recipes.indexOf(a) - this.recipes.indexOf(b);
        });
        break;
        
      case 'name':
        // あいうえお順
        this.filteredRecipes = [...this.filteredRecipes].sort((a, b) => {
          return a.name.localeCompare(b.name, 'ja', { numeric: true });
        });
        break;
        
      case 'popular':
        // 人気順（閲覧数の多い順）
        this.filteredRecipes = [...this.filteredRecipes].sort((a, b) => {
          const viewCountA = this.getViewCount(a.id);
          const viewCountB = this.getViewCount(b.id);
          return viewCountB - viewCountA; // 降順
        });
        break;
        
      default:
        console.warn('⚠️ 不明なソートタイプ:', sortType);
        break;
    }
    
    console.log(`✅ ソート完了: ${this.filteredRecipes.length}件`);
    this.renderRecipes();
  }
}

// グローバル関数（HTML onclick属性で使用）
function showScreen(screenId) {
  if (window.app) {
    window.app.showScreen(screenId);
  }
}

// グローバルインスタンス
let app;

// DOMコンテンツ読み込み完了後に初期化
document.addEventListener("DOMContentLoaded", function () {
  app = new PetitRecipeApp();
  window.app = app; // グローバルアクセス用
});
