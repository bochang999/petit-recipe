// Petit Recipe App JavaScript - RecipeBox UI Integration

// ▼▼▼ Phase 3: Neural Network (Native Integration) ▼▼▼
import { App } from '@capacitor/app';
// ▲▲▲ Native Integration Imports ▲▲▲

class PetitRecipeApp {
  constructor() {
    this.recipes = [];
    this.filteredRecipes = [];
    this.currentRecipe = null;
    this.currentPortion = 1;
    this.currentScreen = "recipes-screen";
    this.viewCounts = {};

    // ▼▼▼ Phase 1: App Memory (State Management) ▼▼▼
    this.history = [];
    this.state = {
      currentScreen: 'recipes-screen',
      selectedRecipeId: null
    };
    // ▲▲▲ App Memory Implementation ▲▲▲

    this.init();
  }

  async init() {
    console.log("🍳 Petit Recipe with RecipeBox UI 初期化開始");

    // ▼▼▼ StatusBar JavaScript configuration for proper safe area handling ▼▼▼
    if (typeof window.Capacitor !== "undefined") {
      try {
        // Import StatusBar plugin properly for Capacitor 7.0+
        const { StatusBar } = window.Capacitor.Plugins;
        if (StatusBar) {
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setStyle({ style: 'LIGHT' });
          await StatusBar.setBackgroundColor({ color: '#3498db' });
          console.log("✅ StatusBar JavaScript configuration applied");
        } else {
          console.warn("⚠️ StatusBar plugin not available");
        }
      } catch (error) {
        console.warn("⚠️ StatusBar configuration failed:", error);
      }
    }

    // レシピデータの読み込み
    await this.loadRecipes();

    // 閲覧数データの読み込み
    this.loadViewCounts();

    // ▼▼▼ Phase 1: State Restoration ▼▼▼
    // アプリ状態の復元
    const stateRestored = this.loadState();
    if (stateRestored) {
      console.log('🔄 前回の状態を復元:', this.state);
      // 復元された状態に基づいて画面を表示
      this.showScreen(this.state.currentScreen);

      // レシピ詳細画面の場合、レシピも復元
      if (this.state.currentScreen === 'recipe-detail-screen' && this.state.selectedRecipeId) {
        this.showRecipeDetail(this.state.selectedRecipeId);
      }
    } else {
      console.log('🆕 初回起動またはクリーン初期化');
      // 初期画面表示
      this.renderRecipes();
    }
    // ▲▲▲ State Restoration ▲▲▲

    // イベントリスナー設定
    this.setupEventListeners();

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
            if (!Filesystem || !Directory) {
              throw new Error("Filesystem plugin not available");
            }
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
                                <span class="recipe-views">🍴 ${this.getViewCount(recipe.id)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="recipe-preview">
                        <strong>材料:</strong> ${recipe.ingredients
                          .map((ing) => ing.name)
                          .join(", ")}
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

    // 材料・手順の表示
    this.renderIngredients(recipe);
    this.renderSteps(recipe);
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


  // ▼▼▼ Phase 2: Enhanced Screen Navigation ▼▼▼
  // 画面切り替え（履歴管理機能付き）
  showScreen(screenId) {
    // 現在の画面が同じ場合は何もしない
    if (this.state.currentScreen === screenId) {
      console.log('📱 同じ画面のため切り替えスキップ:', screenId);
      return;
    }

    console.log(`🔄 画面遷移: ${this.state.currentScreen} → ${screenId}`);

    // すべての画面を非表示
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    // 指定された画面を表示
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add("active");

      // ▼▼▼ Phase 2: State & History Management ▼▼▼
      // 状態を更新
      this.state.currentScreen = screenId;

      // 履歴に追加（同じ画面の連続は避ける）
      if (this.history.length === 0 || this.history[this.history.length - 1] !== screenId) {
        this.history.push(screenId);
        console.log('📚 履歴追加:', this.history);
      }

      // 状態を永続化
      this.saveState();
      // ▲▲▲ State & History Management ▲▲▲

      // 古い currentScreen プロパティとの互換性のため
      this.currentScreen = screenId;
    } else {
      console.error('❌ 画面要素が見つかりません:', screenId);
    }
  }

  // 戻るナビゲーション
  navigateBack() {
    console.log('⬅️ 戻る操作開始');

    if (this.history.length <= 1) {
      console.log('📚 履歴が少ないため、デフォルト画面に戻ります');
      this.showScreen('recipes-screen');
      return;
    }

    // 現在の画面を履歴から削除
    this.history.pop();

    // 前の画面を取得
    const previousScreen = this.history[this.history.length - 1];
    console.log('📚 前の画面:', previousScreen);

    // 前の画面を表示（showScreenは履歴に追加するが、すでに存在するのでスキップされる）
    this.state.currentScreen = previousScreen;
    this.currentScreen = previousScreen;

    // 画面切り替え（履歴追加はしない）
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    const targetScreen = document.getElementById(previousScreen);
    if (targetScreen) {
      targetScreen.classList.add("active");
      console.log(`✅ 戻り完了: ${previousScreen}`);

      // レシピ一覧画面に戻る場合は、レシピを再描画
      if (previousScreen === 'recipes-screen') {
        this.renderRecipes();
      }

      // 状態を保存
      this.saveState();
    }
  }
  // ▲▲▲ Enhanced Screen Navigation ▲▲▲

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

  // ▼▼▼ Phase 1: State Management Methods ▼▼▼
  // アプリ状態の保存
  saveState() {
    try {
      const stateData = {
        currentScreen: this.state.currentScreen,
        selectedRecipeId: this.state.selectedRecipeId,
        history: this.history
      };
      localStorage.setItem('petit-recipe-state', JSON.stringify(stateData));
      console.log('💾 アプリ状態保存完了:', stateData);
    } catch (error) {
      console.error('❌ アプリ状態保存失敗:', error);
    }
  }

  // アプリ状態の読み込み
  loadState() {
    try {
      const saved = localStorage.getItem('petit-recipe-state');
      if (saved) {
        const stateData = JSON.parse(saved);
        this.state.currentScreen = stateData.currentScreen || 'recipes-screen';
        this.state.selectedRecipeId = stateData.selectedRecipeId || null;
        this.history = stateData.history || [];
        console.log('📂 アプリ状態読み込み完了:', stateData);
        return true;
      } else {
        console.log('📂 アプリ状態初期化');
        return false;
      }
    } catch (error) {
      console.error('❌ アプリ状態読み込み失敗:', error);
      // フォールバック：デフォルト状態
      this.state = {
        currentScreen: 'recipes-screen',
        selectedRecipeId: null
      };
      this.history = [];
      return false;
    }
  }
  // ▲▲▲ State Management Methods ▲▲▲

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


// グローバルインスタンス
let app;

// DOMコンテンツ読み込み完了後に初期化
document.addEventListener("DOMContentLoaded", function () {
  app = new PetitRecipeApp();
  window.app = app; // グローバルアクセス用

  // ▼▼▼ Phase 3: Neural Network (Native Integration) ▼▼▼
  // Capacitor backButton統合
  App.addListener('backButton', () => {
    console.log('🔙 ネイティブ戻るボタン押下検出');
    if (app.history.length > 1) {
      console.log('📱 アプリ内ナビゲーション実行');
      app.navigateBack();
    } else {
      console.log('🚪 アプリ終了');
      App.exitApp();
    }
  });
  console.log('✅ ネイティブ統合完了: backButton対応済み');
  // ▲▲▲ Native Integration Complete ▲▲▲
});
