# 🔬 BOC-95副作用の詳細技術分析 - 深層解析レポート

## 🎯 現在のコード構造の完全分析

### 📊 Phase実装の実際の構造

#### Phase 1: 状態管理（script.js:585-627）
```javascript
// アプリ状態の保存
saveState() {
  try {
    const stateData = {
      currentScreen: this.state.currentScreen,      // 新システム
      selectedRecipeId: this.state.selectedRecipeId,
      history: this.history                         // 履歴管理
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
      this.history = stateData.history || [];       // 履歴復元
      console.log('📂 アプリ状態読み込み完了:', stateData);
      return true;
    }
  } catch (error) {
    // フォールバック処理
    this.state = {
      currentScreen: 'recipes-screen',
      selectedRecipeId: null
    };
    this.history = [];
    return false;
  }
}
```

#### Phase 2: ナビゲーション管理（script.js:439-519）
```javascript
showScreen(screenId) {
  // 現在の画面が同じ場合は何もしない
  if (this.state.currentScreen === screenId) {
    console.log('📱 同じ画面のため切り替えスキップ:', screenId);
    return;
  }

  console.log(`🔄 画面遷移: ${this.state.currentScreen} → ${screenId}`);

  // DOM操作
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add("active");

    // ▼▼▼ 新システムの状態管理 ▼▼▼
    this.state.currentScreen = screenId;

    // 履歴に追加（重複回避）
    if (this.history.length === 0 || this.history[this.history.length - 1] !== screenId) {
      this.history.push(screenId);
      console.log('📚 履歴追加:', this.history);
    }

    // 状態永続化
    this.saveState();

    // ▼▼▼ 互換性のための旧システム ▼▼▼
    this.currentScreen = screenId;  // 旧プロパティとの互換性
  }
}

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

  // ▼▼▼ 直接的な画面切り替え（showScreenを使わない） ▼▼▼
  this.state.currentScreen = previousScreen;
  this.currentScreen = previousScreen;  // 互換性

  // DOM操作
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  const targetScreen = document.getElementById(previousScreen);
  if (targetScreen) {
    targetScreen.classList.add("active");

    // 特別処理：レシピ一覧の再描画
    if (previousScreen === 'recipes-screen') {
      this.renderRecipes();
    }

    // 状態保存
    this.saveState();
  }
}
```

#### Phase 3: ネイティブ統合（script.js:687-705）
```javascript
document.addEventListener("DOMContentLoaded", function () {
  app = new PetitRecipeApp();          // ①アプリインスタンス作成
  window.app = app;                    // ②グローバル変数設定

  // ▼▼▼ 問題の核心部分 ▼▼▼
  App.addListener('backButton', () => {
    console.log('🔙 ネイティブ戻るボタン押下検出');
    if (app.history.length > 1) {      // ③外部からhistory参照
      console.log('📱 アプリ内ナビゲーション実行');
      app.navigateBack();              // ④外部からメソッド呼び出し
    } else {
      console.log('🚪 アプリ終了');
      App.exitApp();
    }
  });
  console.log('✅ ネイティブ統合完了: backButton対応済み');
});
```

---

## 🚨 深層的な副作用分析

### 1. **状態管理の二重化問題**

#### 🔍 具体的な問題箇所
```javascript
// コンストラクタ（script.js:7-25）
constructor() {
  this.currentScreen = "recipes-screen";    // ①旧システム

  // Phase 1実装
  this.state = {
    currentScreen: 'recipes-screen',        // ②新システム
    selectedRecipeId: null
  };
}

// showScreen内（script.js:462-475）
this.state.currentScreen = screenId;       // 新システム更新
this.currentScreen = screenId;             // 旧システム互換性

// navigateBack内（script.js:499-500）
this.state.currentScreen = previousScreen; // 新システム更新
this.currentScreen = previousScreen;       // 旧システム更新
```

**問題点**:
- 同じデータが2箇所で管理されている
- 同期が取れなくなるリスク
- メモリ使用量の無駄

#### 🔍 レシピ表示での具体的問題
```javascript
// showRecipeDetail（script.js:333-347）
showRecipeDetail(recipeId) {
  const recipe = this.recipes.find((r) => r.id === recipeId);
  this.currentRecipe = recipe;
  this.currentPortion = 1;

  this.incrementViewCount(recipeId);
  this.showScreen("recipe-detail-screen");    // Phase 2システムを使用
  // ★selectedRecipeIdの更新がない！
}
```

**潜在的バグ**: `this.state.selectedRecipeId`が更新されていない

### 2. **イベントリスナー管理の構造的問題**

#### 🔍 setupEventListeners vs グローバルリスナー
```javascript
// setupEventListeners（クラス内）
setupEventListeners() {
  // DOM検索機能
  const searchInput = document.getElementById("recipe-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      this.searchRecipes(e.target.value);  // thisコンテキスト
    });
  }

  // ソートタブ
  document.querySelectorAll(".sort-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      // DOM操作とthis.sortRecipes呼び出し
    });
  });

  // 分量調整
  const portionSlider = document.getElementById("portion-slider");
  if (portionSlider) {
    portionSlider.addEventListener("input", (e) => {
      this.updatePortion(e.target.value);  // thisコンテキスト
    });
  }
}

// グローバルリスナー（クラス外）
App.addListener('backButton', () => {
  if (app.history.length > 1) {    // グローバル変数app依存
    app.navigateBack();             // 外部からメソッド呼び出し
  }
});
```

**構造的問題**:
1. **コンテキスト不整合**: クラス内は`this`、外部は`app`変数
2. **責任分散**: DOM関連はクラス内、ネイティブ関連は外部
3. **デバッグ困難**: イベント処理ロジックが2箇所に分散

### 3. **メモリ管理とライフサイクル問題**

#### 🔍 リスナー登録のタイミング分析
```javascript
// アプリ初期化フロー
document.addEventListener("DOMContentLoaded", function () {
  app = new PetitRecipeApp();    // ①インスタンス作成
  // ↓ constructor実行
  //   ↓ this.init()実行
  //     ↓ this.setupEventListeners()実行 → DOMリスナー登録

  window.app = app;              // ②グローバル変数設定

  App.addListener('backButton', () => {  // ③ネイティブリスナー登録
    // appインスタンスに依存
  });
});
```

**問題シナリオ**:
1. **アプリ再初期化時**:
   - 新しいインスタンスが作成される
   - 古いネイティブリスナーは古いインスタンスを参照し続ける
   - メモリリークとバグの温床

2. **Capacitor hot reload時**:
   - リスナーが重複登録される可能性
   - 予期しない動作が発生

### 4. **具体的な副作用メカニズムの特定**

#### 🔍 シナリオ1: レシピ詳細表示時の状態不整合
```javascript
// 問題の発生フロー
showRecipeDetail(recipeId) {
  const recipe = this.recipes.find((r) => r.id === recipeId);
  this.currentRecipe = recipe;           // ①旧システム
  this.currentPortion = 1;

  this.incrementViewCount(recipeId);
  this.showScreen("recipe-detail-screen"); // ②新システム呼び出し

  // ★★★ 問題: selectedRecipeIdが更新されていない ★★★
  // this.state.selectedRecipeId = recipeId; ← これが欠けている
}

// showScreen内での状態更新
showScreen(screenId) {
  this.state.currentScreen = screenId;       // "recipe-detail-screen"
  // selectedRecipeIdは更新されないまま
  this.saveState(); // ③不完全な状態で保存
}

// アプリ再起動時の状態復元
loadState() {
  const stateData = JSON.parse(saved);
  this.state.currentScreen = stateData.currentScreen;     // "recipe-detail-screen"
  this.state.selectedRecipeId = stateData.selectedRecipeId; // null のまま！
}
```

**結果**: レシピ詳細画面に復元されるが、どのレシピかわからない状態

#### 🔍 シナリオ2: バックボタン処理時の競合状態
```javascript
// ネイティブbackButton押下
App.addListener('backButton', () => {
  console.log('🔙 ネイティブ戻るボタン押下検出');
  if (app.history.length > 1) {
    app.navigateBack();                     // ①外部からメソッド呼び出し
  }
});

// navigateBack実行中
navigateBack() {
  this.history.pop();                       // ②履歴操作
  const previousScreen = this.history[this.history.length - 1];

  // ★★★ showScreenを使わない直接操作 ★★★
  this.state.currentScreen = previousScreen; // ③状態更新
  this.currentScreen = previousScreen;       // ④互換性更新

  // DOM操作
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  const targetScreen = document.getElementById(previousScreen);
  targetScreen.classList.add("active");

  this.saveState();                         // ⑤状態保存
}
```

**問題**: `showScreen`メソッドを通さないため、履歴管理ロジックがバイパスされる

#### 🔍 シナリオ3: 閲覧数カウントのHTML内コード実行
```javascript
// renderRecipes内のHTML生成（script.js:309）
const recipesHtml = this.filteredRecipes.map((recipe) => {
  return `
    <div class="recipe-card" onclick="app.showRecipeDetail('${recipe.id}')">
      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      ★★★ 問題: HTML内でグローバル変数appを直接参照 ★★★
  `;
});
```

**構造的問題**:
1. HTMLとJavaScriptの結合度が高い
2. `app`変数のグローバル依存
3. リファクタリング時の影響範囲が不明確

### 5. **発生条件の特定**

#### 🔍 副作用が発生する具体的条件

**条件A: アプリ開発・デバッグ時**
```javascript
// hot reloadやdevtools使用時
1. アプリ初期化
2. ネイティブリスナー登録
3. hot reload発生
4. 新しいアプリインスタンス作成
5. 古いリスナーが古いインスタンスを参照 → 動作不良
```

**条件B: レシピ詳細→戻る→アプリ再起動のフロー**
```javascript
1. レシピ詳細表示 → selectedRecipeId未更新
2. 戻るボタン → 正常動作
3. アプリ強制終了
4. アプリ再起動 → レシピ詳細画面に復元されるが、recipeId不明
5. エラー発生またはブランク画面
```

**条件C: 複雑なナビゲーション履歴**
```javascript
1. レシピ一覧 → レシピ詳細A → 戻る → レシピ詳細B
2. 履歴: ['recipes-screen', 'recipe-detail-screen', 'recipes-screen', 'recipe-detail-screen']
3. backButton押下 → navigateBack()
4. 直前の'recipes-screen'に戻る（期待: レシピ詳細B → レシピ一覧）
5. ユーザーの期待と異なる動作
```

## 💡 詳細解決策の技術仕様

### 🎯 Phase 1: 即座の修正（Critical Issues）

#### 1.1 ネイティブリスナーの統合
```javascript
// 現在の問題箇所を削除
// script.js:691-704を完全削除

// setupEventListeners内に追加
setupEventListeners() {
  // 既存のDOMイベント設定...

  // ▼▼▼ 新規追加: ネイティブイベント統合 ▼▼▼
  this.setupNativeListeners();
}

setupNativeListeners() {
  // 重複登録防止
  if (this.nativeListenersRegistered) {
    console.log('⚠️ ネイティブリスナー既に登録済み');
    return;
  }

  // Capacitor環境チェック
  if (typeof window.Capacitor !== "undefined" &&
      window.Capacitor.Plugins &&
      window.Capacitor.Plugins.App) {

    // backButtonハンドラー
    this.backButtonHandler = () => {
      console.log('🔙 ネイティブ戻るボタン押下検出');
      this.handleNativeBackButton();
    };

    window.Capacitor.Plugins.App.addListener('backButton', this.backButtonHandler);
    this.nativeListenersRegistered = true;
    console.log('✅ ネイティブリスナー設定完了');
  } else {
    console.log('ℹ️ Capacitor環境ではありません - ネイティブリスナー不要');
  }
}

handleNativeBackButton() {
  if (this.history.length > 1) {
    console.log('📱 アプリ内ナビゲーション実行');
    this.navigateBack();
  } else {
    console.log('🚪 アプリ終了');
    if (window.Capacitor && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.exitApp();
    }
  }
}

// クリーンアップ機能
removeNativeListeners() {
  if (this.nativeListenersRegistered && this.backButtonHandler) {
    window.Capacitor.Plugins.App.removeListener('backButton', this.backButtonHandler);
    this.nativeListenersRegistered = false;
    this.backButtonHandler = null;
    console.log('🧹 ネイティブリスナークリーンアップ完了');
  }
}
```

#### 1.2 状態管理の統一
```javascript
// コンストラクタの修正
constructor() {
  this.recipes = [];
  this.filteredRecipes = [];
  this.currentRecipe = null;
  this.currentPortion = 1;
  // this.currentScreen = "recipes-screen"; ← 削除
  this.viewCounts = {};

  // 統一された状態管理
  this.history = [];
  this.state = {
    currentScreen: 'recipes-screen',
    selectedRecipeId: null,
    // 将来的な拡張用
    searchTerm: '',
    sortMode: 'name'
  };

  // ネイティブリスナー管理用
  this.nativeListenersRegistered = false;
  this.backButtonHandler = null;

  this.init();
}

// showRecipeDetailの修正
showRecipeDetail(recipeId) {
  const recipe = this.recipes.find((r) => r.id === recipeId);
  if (!recipe) {
    console.error("レシピが見つかりません:", recipeId);
    return;
  }

  this.currentRecipe = recipe;
  this.currentPortion = 1;

  // ★★★ 重要: selectedRecipeIdの更新 ★★★
  this.state.selectedRecipeId = recipeId;

  // 閲覧数をインクリメント
  this.incrementViewCount(recipeId);

  // レシピ詳細画面に切り替え
  this.showScreen("recipe-detail-screen");

  // 以下、既存のDOM更新処理...
}

// showScreenの簡素化
showScreen(screenId) {
  // 現在の画面が同じ場合は何もしない
  if (this.state.currentScreen === screenId) {
    console.log('📱 同じ画面のため切り替えスキップ:', screenId);
    return;
  }

  console.log(`🔄 画面遷移: ${this.state.currentScreen} → ${screenId}`);

  // DOM操作
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add("active");

    // 状態更新
    this.state.currentScreen = screenId;

    // 履歴に追加（重複回避）
    if (this.history.length === 0 || this.history[this.history.length - 1] !== screenId) {
      this.history.push(screenId);
      console.log('📚 履歴追加:', this.history);
    }

    // 状態永続化
    this.saveState();
  } else {
    console.error('❌ 画面要素が見つかりません:', screenId);
  }
}
```

### 🎯 Phase 2: 構造改善（Architecture Enhancement）

#### 2.1 イベント委譲パターンの導入
```javascript
// renderRecipes内のHTML生成を修正
renderRecipes() {
  // ... 既存のロジック ...

  const recipesHtml = this.filteredRecipes.map((recipe) => {
    return `
      <div class="recipe-card" data-recipe-id="${recipe.id}">
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
          <strong>材料:</strong> ${recipe.ingredients.map(ing => ing.name).join(", ")}
        </div>
      </div>
    `;
  }).join("");

  recipesList.innerHTML = recipesHtml;
}

// setupEventListeners内に追加
setupEventListeners() {
  // 既存のイベント設定...

  // イベント委譲パターン
  const recipesList = document.getElementById('recipes-list');
  if (recipesList) {
    recipesList.addEventListener('click', (e) => {
      const recipeCard = e.target.closest('.recipe-card');
      if (recipeCard) {
        const recipeId = recipeCard.dataset.recipeId;
        this.showRecipeDetail(recipeId);
      }
    });
  }

  // ネイティブリスナー設定
  this.setupNativeListeners();
}
```

#### 2.2 状態復元の強化
```javascript
// init()メソッドの状態復元ロジック改善
async init() {
  console.log("🍳 Petit Recipe with RecipeBox UI 初期化開始");

  // StatusBar設定...
  await this.loadRecipes();
  this.loadViewCounts();

  // 状態復元
  const stateRestored = this.loadState();
  if (stateRestored) {
    console.log('🔄 前回の状態を復元:', this.state);

    // 画面状態復元
    this.showScreen(this.state.currentScreen);

    // レシピ詳細画面の場合の特別処理
    if (this.state.currentScreen === 'recipe-detail-screen' && this.state.selectedRecipeId) {
      // selectedRecipeIdに基づいてレシピを復元
      const recipe = this.recipes.find(r => r.id === this.state.selectedRecipeId);
      if (recipe) {
        this.currentRecipe = recipe;
        this.currentPortion = 1;
        // DOM更新（レシピ詳細の内容を再描画）
        this.updateRecipeDetailDisplay();
        console.log('✅ レシピ詳細状態復元完了:', recipe.name);
      } else {
        console.warn('⚠️ 保存されたレシピIDが見つかりません、一覧画面に戻ります');
        this.showScreen('recipes-screen');
      }
    }
  } else {
    console.log('🆕 初回起動またはクリーン初期化');
    this.renderRecipes();
  }

  // イベントリスナー設定
  this.setupEventListeners();
  console.log("✅ Petit Recipe 初期化完了");
}

// 新メソッド: レシピ詳細表示の更新
updateRecipeDetailDisplay() {
  if (!this.currentRecipe) return;

  // タイトル設定
  const titleElement = document.getElementById("recipe-detail-title");
  if (titleElement) {
    titleElement.textContent = this.currentRecipe.name;
  }

  // 材料と手順の再描画
  this.updateIngredients();
  this.updateInstructions();

  // 分量スライダーの初期化
  const portionSlider = document.getElementById("portion-slider");
  if (portionSlider) {
    portionSlider.value = this.currentPortion;
  }
}
```

### 🎯 Phase 3: 高度な改善（Advanced Features）

#### 3.1 履歴管理の最適化
```javascript
// より洗練された履歴管理
addToHistory(screenId, metadata = {}) {
  const historyEntry = {
    screen: screenId,
    timestamp: Date.now(),
    metadata: { ...metadata }
  };

  // 同じ画面の連続は避ける
  if (this.history.length === 0 ||
      this.history[this.history.length - 1].screen !== screenId) {
    this.history.push(historyEntry);

    // 履歴の最大長制限
    if (this.history.length > 10) {
      this.history = this.history.slice(-10);
    }

    console.log('📚 履歴追加:', historyEntry);
  }
}

navigateBack() {
  console.log('⬅️ 戻る操作開始');

  if (this.history.length <= 1) {
    console.log('📚 履歴が少ないため、デフォルト画面に戻ります');
    this.showScreen('recipes-screen');
    return;
  }

  // 現在の画面を履歴から削除
  const currentEntry = this.history.pop();

  // 前の画面を取得
  const previousEntry = this.history[this.history.length - 1];
  console.log('📚 前の画面:', previousEntry);

  // 状態復元
  this.state.currentScreen = previousEntry.screen;

  // メタデータがある場合の特別処理
  if (previousEntry.metadata.recipeId) {
    this.state.selectedRecipeId = previousEntry.metadata.recipeId;
  }

  // DOM更新とshowScreenの統一化
  this.showScreenDirect(previousEntry.screen);
}
```

#### 3.2 デバッグとモニタリング機能
```javascript
// デバッグ用のメソッド追加
getDebugInfo() {
  return {
    state: { ...this.state },
    history: [...this.history],
    currentRecipe: this.currentRecipe ? this.currentRecipe.id : null,
    nativeListenersRegistered: this.nativeListenersRegistered,
    timestamp: new Date().toISOString()
  };
}

// 開発環境での状態監視
setupDebugMode() {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.petitRecipeDebug = {
      getState: () => this.getDebugInfo(),
      resetState: () => {
        localStorage.removeItem('petit-recipe-state');
        location.reload();
      },
      exportState: () => {
        const state = this.getDebugInfo();
        console.log('🐛 Current State:', state);
        return state;
      }
    };
    console.log('🐛 Debug mode enabled. Use window.petitRecipeDebug');
  }
}
```

## 📊 実装リスクと回避策

### ⚠️ 高リスク項目

#### リスク1: 既存機能の破綻
**詳細**: 状態管理統一時にthis.currentScreen削除による互換性問題
**回避策**:
```javascript
// 段階的移行パターン
get currentScreen() {
  console.warn('⚠️ currentScreen property is deprecated. Use this.state.currentScreen');
  return this.state.currentScreen;
}

set currentScreen(value) {
  console.warn('⚠️ currentScreen property is deprecated. Use this.state.currentScreen');
  this.state.currentScreen = value;
}
```

#### リスク2: ネイティブリスナーの重複登録
**詳細**: 開発時のhot reloadで古いリスナーが残存
**回避策**:
```javascript
setupNativeListeners() {
  // 既存リスナーの完全削除
  if (window.Capacitor && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.removeAllListeners('backButton');
  }

  // 重複防止フラグリセット
  this.nativeListenersRegistered = false;

  // 新しいリスナー登録
  // ... 既存のロジック
}
```

### 🎯 実装優先順位マトリックス

| 優先度 | 項目 | 影響度 | 実装コスト | 実装時期 |
|--------|------|--------|------------|----------|
| P0 | ネイティブリスナー統合 | 高 | 低 | 即座 |
| P0 | selectedRecipeId更新追加 | 高 | 低 | 即座 |
| P1 | 状態管理統一 | 中 | 中 | 1-2日 |
| P1 | イベント委譲パターン | 中 | 中 | 1-2日 |
| P2 | 履歴管理最適化 | 低 | 高 | 1週間 |
| P3 | デバッグ機能 | 低 | 中 | 適宜 |

### 🔍 検証項目チェックリスト

#### 機能検証
- [ ] レシピ詳細表示→戻る→アプリ再起動で正しく復元される
- [ ] 物理戻るボタンが期待通りに動作する
- [ ] アプリ終了が適切なタイミングで実行される
- [ ] 履歴管理が一貫している
- [ ] 閲覧数カウントが正常に動作する

#### 技術検証
- [ ] メモリリークが発生しない
- [ ] ネイティブリスナーの重複登録がない
- [ ] 状態データの整合性が保たれる
- [ ] エラーハンドリングが適切に動作する
- [ ] パフォーマンスに悪影響がない

#### 開発者体験検証
- [ ] コードの可読性が向上している
- [ ] デバッグが容易になっている
- [ ] 機能追加時の影響範囲が明確
- [ ] テストコード作成が容易
- [ ] ドキュメント化が完了している

---

## 🎯 最終推奨事項

### 即座実装（今日中）
1. **ネイティブリスナーの統合**: script.js:691-704削除 + setupNativeListeners実装
2. **selectedRecipeId更新**: showRecipeDetail内に`this.state.selectedRecipeId = recipeId;`追加

### 短期実装（今週中）
1. **状態管理の統一**: this.currentScreen → this.state.currentScreen移行
2. **イベント委譲**: HTMLからonclick削除 + イベント委譲パターン実装

### 中長期実装（来週以降）
1. **履歴管理の最適化**: メタデータ付き履歴システム
2. **デバッグ機能**: 開発効率向上のための支援機能

この段階的なアプローチにより、リスクを最小化しながら、BOC-95の副作用を根本的に解決し、より堅牢で保守性の高いアプリケーションアーキテクチャを実現できます。