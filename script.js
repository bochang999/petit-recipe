// Petit Recipe App JavaScript - RecipeBox UI Integration

// ▼▼▼ Phase 3: Neural Network (Native Integration) ▼▼▼
// 動的インポート: ブラウザ/Capacitor環境で条件分岐
// ▲▲▲ Native Integration Imports ▲▲▲

// 🧪 デバッグログ管理
let debugLogs = [];
function addDebugLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  debugLogs.push(logEntry);
  console.log(logEntry);

  // 最新20件のみ保持
  if (debugLogs.length > 20) {
    debugLogs.shift();
  }
}

// 🔧 テスト関数 (グローバルスコープ)
window.testSort = function(sortType) {
  addDebugLog(`🔘 物理テストボタン: ${sortType}`);
  if (window.app && typeof window.app.sortRecipes === 'function') {
    addDebugLog(`✅ app.sortRecipes関数が存在`);
    window.app.sortRecipes(sortType);
  } else {
    addDebugLog(`❌ app.sortRecipes関数が見つからない`);
    addDebugLog(`🔍 window.app = ${typeof window.app}`);
  }
}

// 📱 ログ表示 (グローバルスコープ)
window.showLogs = function() {
  const logDiv = document.getElementById('debug-logs');
  const logContent = document.getElementById('log-content');

  if (logDiv && logContent) {
    logContent.innerHTML = debugLogs.join('<br>');
    logDiv.style.display = logDiv.style.display === 'none' ? 'block' : 'none';
  }
}

// ▼▼▼ BOC-97: Data Persistence Layer - localStorage Migration System ▼▼▼
class LocalRecipeDatabase {
  constructor() {
    this.STORAGE_KEY = 'petit_recipe_data';
    this.VERSION_KEY = 'petit_recipe_version';
    this.CURRENT_VERSION = '1.0.0';
    this.MIGRATION_LOG_KEY = 'petit_recipe_migration_log';
  }

  // 初回移行ロジック - マイルストーン3の核心機能
  async initialize() {
    console.log('🗄️ LocalRecipeDatabase初期化開始');

    if (!this.hasLocalData()) {
      console.log('📥 初回起動：静的データからlocalStorageへ移行開始');
      await this.migrateFromStaticData();
    } else {
      console.log('✅ localStorageデータ存在確認済み');
    }

    return this.loadRecipes();
  }

  // localStorageにレシピデータが存在するかチェック
  hasLocalData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const hasData = data !== null && data !== undefined;
    console.log('🔍 localStorageデータチェック:', hasData ? '存在' : '未存在');
    return hasData;
  }

  // recipes-data.jsからlocalStorageへの初回移行
  async migrateFromStaticData() {
    try {
      console.log('🔄 静的データ移行処理開始');

      // window.PETIT_RECIPE_DATAからデータを取得
      const staticData = window.PETIT_RECIPE_DATA || [];
      console.log('📋 移行対象データ件数:', staticData.length);

      if (staticData.length === 0) {
        console.warn('⚠️ 移行対象の静的データが見つかりません');
        return;
      }

      // localStorageに保存
      this.saveRecipes(staticData);

      // バージョン情報も保存
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);

      // 移行ログ記録
      const migrationLog = {
        timestamp: new Date().toISOString(),
        sourceDataCount: staticData.length,
        version: this.CURRENT_VERSION
      };
      localStorage.setItem(this.MIGRATION_LOG_KEY, JSON.stringify(migrationLog));

      console.log('✅ 静的データからlocalStorageへの移行完了');
      console.log('📊 移行データ:', staticData.length + '件のレシピ');

    } catch (error) {
      console.error('❌ データ移行エラー:', error);
      throw new Error(`Migration failed: ${error.message}`);
    }
  }

  // localStorageからレシピデータを読み込み
  loadRecipes() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        console.log('📭 localStorageにデータが見つかりません');
        return [];
      }

      const recipes = JSON.parse(data);
      console.log('📖 localStorageからレシピデータ読み込み完了:', recipes.length + '件');
      return recipes;

    } catch (error) {
      console.error('❌ localStorageデータ読み込みエラー:', error);
      return [];
    }
  }

  // localStorageにレシピデータを保存
  saveRecipes(recipes) {
    try {
      const dataString = JSON.stringify(recipes);
      localStorage.setItem(this.STORAGE_KEY, dataString);
      console.log('💾 localStorageにレシピデータ保存完了:', recipes.length + '件');

    } catch (error) {
      console.error('❌ localStorageデータ保存エラー:', error);
      throw new Error(`Save failed: ${error.message}`);
    }
  }

  // 移行状況の確認（デバッグ用）
  getMigrationStatus() {
    const hasLocal = this.hasLocalData();
    const version = localStorage.getItem(this.VERSION_KEY);
    const migrationLog = localStorage.getItem(this.MIGRATION_LOG_KEY);

    return {
      hasLocalData: hasLocal,
      version: version,
      migrationLog: migrationLog ? JSON.parse(migrationLog) : null
    };
  }

  // ▼▼▼ BOC-98: Recipe Addition (CRUD - Create) Implementation ▼▼▼

  // レシピ追加メソッド - マイルストーン3 CRUD機能の基盤
  addRecipe(newRecipe) {
    try {
      console.log('📝 新規レシピ追加開始:', newRecipe);

      // Step 1: バリデーション
      const validationResult = this.validateRecipe(newRecipe);
      if (!validationResult.isValid) {
        throw new Error(`Recipe validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Step 2: 既存レシピデータ読み込み
      const existingRecipes = this.loadRecipes();

      // Step 3: ユニークID生成
      const recipeWithId = {
        ...newRecipe,
        id: this.generateUniqueId(existingRecipes),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Step 4: レシピリストに追加
      const updatedRecipes = [...existingRecipes, recipeWithId];

      // Step 5: localStorage保存
      this.saveRecipes(updatedRecipes);

      console.log('✅ レシピ追加完了:', recipeWithId.id, recipeWithId.title);
      return recipeWithId;

    } catch (error) {
      console.error('❌ レシピ追加エラー:', error);
      throw new Error(`Failed to add recipe: ${error.message}`);
    }
  }

  // ユニークID生成 - 既存IDとの重複回避
  generateUniqueId(existingRecipes = []) {
    const existingIds = new Set(existingRecipes.map(recipe => recipe.id));
    let newId;

    do {
      // タイムスタンプベース + ランダム要素でユニーク性確保
      newId = `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    } while (existingIds.has(newId));

    console.log('🆔 生成されたユニークID:', newId);
    return newId;
  }

  // レシピデータバリデーション
  validateRecipe(recipe) {
    const errors = [];

    // 必須フィールドチェック
    if (!recipe.title || typeof recipe.title !== 'string' || recipe.title.trim() === '') {
      errors.push('Recipe title is required');
    }

    if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      errors.push('Recipe ingredients are required');
    }

    if (!recipe.instructions || !Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
      errors.push('Recipe instructions are required');
    }

    // オプショナルフィールドのデフォルト値設定
    const validatedRecipe = {
      title: recipe.title?.trim() || '',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      servings: recipe.servings || '1人前',
      cookTime: recipe.cookTime || '未設定',
      difficulty: recipe.difficulty || '初級'
    };

    return {
      isValid: errors.length === 0,
      errors: errors,
      validatedRecipe: validatedRecipe
    };
  }

  // 現在のレシピ件数取得（統計用）
  getRecipeCount() {
    const recipes = this.loadRecipes();
    return recipes.length;
  }

  // 特定IDのレシピ存在確認 (簡易版)
  recipeExistsSimple(recipeId) {
    const recipes = this.loadRecipes();
    return recipes.some(recipe => recipe.id === recipeId);
  }

  // ▲▲▲ BOC-98: Recipe Addition Implementation ▲▲▲

  // ▼▼▼ BOC-99: Recipe Edit/Delete (CRUD - Update/Delete) Implementation ▼▼▼

  // 特定IDのレシピ取得メソッド
  getRecipeById(recipeId) {
    try {
      console.log('🔍 レシピ取得開始 ID:', recipeId);

      const recipes = this.loadRecipes();
      const recipe = recipes.find(r => r.id === recipeId);

      if (!recipe) {
        throw new Error(`Recipe not found with ID: ${recipeId}`);
      }

      console.log('✅ レシピ取得成功:', recipe.title);
      return recipe;

    } catch (error) {
      console.error('❌ レシピ取得エラー:', error);
      throw new Error(`Failed to get recipe: ${error.message}`);
    }
  }

  // レシピ更新メソッド - 既存レシピのデータを更新
  updateRecipe(updatedRecipe) {
    try {
      console.log('📝 レシピ更新開始:', updatedRecipe.id);

      // Step 1: バリデーション
      const validationResult = this.validateRecipe(updatedRecipe);
      if (!validationResult.isValid) {
        throw new Error(`Recipe validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Step 2: 既存レシピデータ読み込み
      const existingRecipes = this.loadRecipes();

      // Step 3: 対象レシピのインデックス検索
      const recipeIndex = existingRecipes.findIndex(r => r.id === updatedRecipe.id);
      if (recipeIndex === -1) {
        throw new Error(`Recipe not found for update: ${updatedRecipe.id}`);
      }

      // Step 4: 元レシピのcreatedAtを保持しつつ更新
      const originalRecipe = existingRecipes[recipeIndex];
      const updatedRecipeWithTimestamp = {
        ...updatedRecipe,
        id: updatedRecipe.id, // ID保持
        createdAt: originalRecipe.createdAt, // 作成日時保持
        updatedAt: new Date().toISOString() // 更新日時を現在時刻に
      };

      // Step 5: 配列内の該当レシピを更新
      existingRecipes[recipeIndex] = updatedRecipeWithTimestamp;

      // Step 6: localStorage保存
      this.saveRecipes(existingRecipes);

      console.log('✅ レシピ更新完了:', updatedRecipeWithTimestamp.id, updatedRecipeWithTimestamp.title);
      return updatedRecipeWithTimestamp;

    } catch (error) {
      console.error('❌ レシピ更新エラー:', error);
      throw new Error(`Failed to update recipe: ${error.message}`);
    }
  }

  // レシピ削除メソッド - 指定IDのレシピを完全削除
  deleteRecipe(recipeId) {
    try {
      console.log('🗑️ レシピ削除開始 ID:', recipeId);

      // Step 1: 既存レシピデータ読み込み
      const existingRecipes = this.loadRecipes();

      // Step 2: 削除対象レシピの存在確認
      const targetRecipe = existingRecipes.find(r => r.id === recipeId);
      if (!targetRecipe) {
        throw new Error(`Recipe not found for deletion: ${recipeId}`);
      }

      // Step 3: 削除前ログ記録 (バックアップ・監査用)
      console.log('📋 削除対象レシピ:', targetRecipe.title, 'created:', targetRecipe.createdAt);

      // Step 4: 対象レシピ以外でフィルタリング
      const updatedRecipes = existingRecipes.filter(r => r.id !== recipeId);

      // Step 5: localStorage保存
      this.saveRecipes(updatedRecipes);

      console.log('✅ レシピ削除完了:', recipeId);
      console.log('📊 残レシピ件数:', updatedRecipes.length);

      return {
        deletedRecipe: targetRecipe,
        remainingCount: updatedRecipes.length
      };

    } catch (error) {
      console.error('❌ レシピ削除エラー:', error);
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }
  }

  // レシピ存在チェック (拡張版)
  recipeExists(recipeId) {
    try {
      const recipes = this.loadRecipes();
      return recipes.some(recipe => recipe.id === recipeId);
    } catch (error) {
      console.error('❌ レシピ存在チェックエラー:', error);
      return false;
    }
  }

  // CRUD操作統計取得
  getCRUDStats() {
    try {
      const recipes = this.loadRecipes();
      const now = new Date();
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        totalRecipes: recipes.length,
        recentlyCreated: recipes.filter(r => new Date(r.createdAt) > oneWeekAgo).length,
        recentlyUpdated: recipes.filter(r => r.updatedAt && new Date(r.updatedAt) > oneWeekAgo).length,
        originalRecipes: recipes.filter(r => !r.updatedAt || r.createdAt === r.updatedAt).length
      };

      console.log('📊 CRUD統計:', stats);
      return stats;

    } catch (error) {
      console.error('❌ CRUD統計取得エラー:', error);
      return null;
    }
  }

  // ▲▲▲ BOC-99: Recipe Edit/Delete Implementation ▲▲▲

  // ▼▼▼ BOC-100: Backup and Restore Functionality ▼▼▼

  // データエクスポート機能 - 全レシピと閲覧データを統合JSON出力
  exportAllData() {
    try {
      console.log('📦 データエクスポート開始');

      // Step 1: レシピデータ取得
      const recipes = this.loadRecipes();

      // Step 2: 閲覧数データ取得 (ViewCountManagerから)
      const viewCounts = JSON.parse(localStorage.getItem('petit_recipe_view_counts') || '{}');

      // Step 3: システム情報取得
      const migrationStatus = this.getMigrationStatus();

      // Step 4: エクスポートデータ構造作成
      const exportData = {
        version: this.CURRENT_VERSION,
        exportDate: new Date().toISOString(),
        appVersion: 'petit-recipe-v3.0',
        totalRecipes: recipes.length,
        totalViewCounts: Object.keys(viewCounts).length,
        data: {
          recipes: recipes,
          viewCounts: viewCounts,
          migrationLog: migrationStatus.migrationLog
        },
        metadata: {
          dataVersion: migrationStatus.version,
          exportedBy: 'LocalRecipeDatabase',
          originalMigrationTime: migrationStatus.migrationLog?.timestamp || null
        }
      };

      console.log('✅ エクスポートデータ作成完了:', {
        recipes: exportData.totalRecipes,
        viewCounts: exportData.totalViewCounts,
        size: JSON.stringify(exportData).length + ' bytes'
      });

      return exportData;

    } catch (error) {
      console.error('❌ データエクスポートエラー:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  // データインポート機能 - バックアップからの完全復元
  importAllData(importData) {
    try {
      console.log('📥 データインポート開始');

      // Step 1: データ形式検証
      const validationResult = this.validateImportData(importData);
      if (!validationResult.isValid) {
        throw new Error(`Import validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Step 2: 現在のデータ取得（ログ用）
      const currentRecipes = this.loadRecipes();
      const currentViewCounts = JSON.parse(localStorage.getItem('petit_recipe_view_counts') || '{}');

      console.log('📊 インポート前状態:', {
        currentRecipes: currentRecipes.length,
        currentViewCounts: Object.keys(currentViewCounts).length
      });

      // Step 3: レシピデータ上書き
      this.saveRecipes(importData.data.recipes);

      // Step 4: 閲覧数データ上書き
      localStorage.setItem('petit_recipe_view_counts', JSON.stringify(importData.data.viewCounts));

      // Step 5: バージョン情報更新
      localStorage.setItem(this.VERSION_KEY, importData.version);

      // Step 6: インポートログ記録
      const importLog = {
        timestamp: new Date().toISOString(),
        importedRecipes: importData.data.recipes.length,
        importedViewCounts: Object.keys(importData.data.viewCounts).length,
        sourceVersion: importData.version,
        sourceExportDate: importData.exportDate,
        replacedRecipes: currentRecipes.length,
        replacedViewCounts: Object.keys(currentViewCounts).length
      };

      localStorage.setItem('petit_recipe_import_log', JSON.stringify(importLog));

      console.log('✅ データインポート完了:', {
        importedRecipes: importLog.importedRecipes,
        importedViewCounts: importLog.importedViewCounts,
        sourceDate: importData.exportDate
      });

      return importLog;

    } catch (error) {
      console.error('❌ データインポートエラー:', error);
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  // インポートデータ検証
  validateImportData(data) {
    const errors = [];

    // 必須フィールドチェック
    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format');
      return { isValid: false, errors };
    }

    if (!data.version) errors.push('Missing version information');
    if (!data.exportDate) errors.push('Missing export date');
    if (!data.data) errors.push('Missing data section');

    if (data.data) {
      if (!Array.isArray(data.data.recipes)) {
        errors.push('Invalid recipes format - must be array');
      } else {
        // レシピ構造の基本チェック
        const invalidRecipes = data.data.recipes.filter(recipe =>
          !recipe.id || !recipe.title || !Array.isArray(recipe.ingredients)
        );
        if (invalidRecipes.length > 0) {
          errors.push(`${invalidRecipes.length} recipes missing required fields`);
        }
      }

      if (data.data.viewCounts && typeof data.data.viewCounts !== 'object') {
        errors.push('Invalid viewCounts format - must be object');
      }
    }

    // バージョン互換性チェック
    if (data.version && !this.isVersionCompatible(data.version)) {
      errors.push(`Incompatible version: ${data.version} (current: ${this.CURRENT_VERSION})`);
    }

    const isValid = errors.length === 0;
    if (isValid) {
      console.log('✅ インポートデータ検証成功:', {
        version: data.version,
        recipes: data.data.recipes?.length || 0,
        viewCounts: data.data.viewCounts ? Object.keys(data.data.viewCounts).length : 0
      });
    }

    return { isValid, errors };
  }

  // バージョン互換性チェック
  isVersionCompatible(importVersion) {
    // 現在は1.0.0のみサポート
    const supportedVersions = ['1.0.0'];
    return supportedVersions.includes(importVersion);
  }

  // バックアップ・リストア統計情報取得
  getBackupStats() {
    try {
      const importLog = localStorage.getItem('petit_recipe_import_log');
      const migrationStatus = this.getMigrationStatus();
      const currentRecipes = this.loadRecipes();
      const currentViewCounts = JSON.parse(localStorage.getItem('petit_recipe_view_counts') || '{}');

      return {
        currentData: {
          recipes: currentRecipes.length,
          viewCounts: Object.keys(currentViewCounts).length,
          version: migrationStatus.version
        },
        lastImport: importLog ? JSON.parse(importLog) : null,
        lastMigration: migrationStatus.migrationLog
      };

    } catch (error) {
      console.error('❌ バックアップ統計取得エラー:', error);
      return null;
    }
  }

  // ▲▲▲ BOC-100: Backup and Restore Functionality ▲▲▲
}
// ▲▲▲ BOC-97: Data Persistence Layer Implementation ▲▲▲

class PetitRecipeApp {
  constructor() {
    this.recipes = [];
    this.filteredRecipes = [];
    this.currentRecipe = null;
    this.currentPortion = 1;
    this.currentScreen = "recipes-screen";
    this.viewCounts = {};

    // ▼▼▼ BOC-97: LocalRecipeDatabase Integration ▼▼▼
    this.recipeDB = new LocalRecipeDatabase();
    // ▲▲▲ BOC-97: Database Integration ▲▲▲

    // ▼▼▼ Phase 1: App Memory (State Management) ▼▼▼
    this.history = [];
    this.state = {
      currentScreen: 'recipes-screen',
      selectedRecipeId: null
    };

    // ▼▼▼ BOC-99: Edit/Delete State Management ▼▼▼
    this.editMode = null; // null | 'add' | 'edit'
    this.editingRecipeId = null;
    this.pendingDeleteRecipeId = null;
    // ▲▲▲ BOC-99: Edit/Delete State ▲▲▲

    // ネイティブリスナー管理用
    this.nativeListenersRegistered = false;
    this.backButtonHandler = null;
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

  // ▼▼▼ BOC-97: Updated Recipe Loading with localStorage Priority ▼▼▼
  async loadRecipes() {
    try {
      console.log("🔄 BOC-97: localStorage優先レシピデータ読み込み開始...");

      // STEP 1: localStorage Database Initialization
      const petitRecipes = await this.recipeDB.initialize();

      // STEP 2: データが取得できた場合の処理
      if (petitRecipes && petitRecipes.length > 0) {
        console.log("📋 LocalStorageからデータ取得成功:", petitRecipes.length + "件");
      } else {
        console.log("⚠️ LocalStorageデータなし - フォールバック処理開始");

        // フォールバック: 従来の方法でデータ取得
        let fallbackData = null;

        // 1. まずglobalのPETIT_RECIPE_DATAを確認
        if (
          typeof window.PETIT_RECIPE_DATA !== "undefined" &&
          Array.isArray(window.PETIT_RECIPE_DATA)
        ) {
          console.log("✅ グローバルレシピデータを使用:", window.PETIT_RECIPE_DATA.length + "件");
          fallbackData = window.PETIT_RECIPE_DATA;
        } else {
          console.log("⚠️ グローバルデータなし、fetchを試行");

          // 2. Capacitor環境での特別処理
          if (
            typeof window.Capacitor !== "undefined" &&
            window.Capacitor.isNativePlatform()
          ) {
            console.log("📱 ネイティブAPK環境でのデータ読み込み");
            try {
              const { Filesystem, Directory } = window.Capacitor.Plugins;
              if (!Filesystem || !Directory) {
                throw new Error("Filesystem plugin not available");
              }
              const result = await Filesystem.readFile({
                path: "public/src/data/recipes.json",
                directory: Directory.Application,
              });
              fallbackData = JSON.parse(atob(result.data));
              console.log("✅ Capacitor経由でデータ読み込み成功");
            } catch (capacitorError) {
              console.log("⚠️ Capacitorアクセス失敗、通常fetch試行:", capacitorError.message);
              throw capacitorError;
            }
          } else {
            // 3. Web環境での通常fetch
            console.log("🌐 Web環境での通常fetch");
            const response = await fetch("src/data/recipes.json");
            console.log("📡 Fetch response:", response.status, response.statusText);

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            fallbackData = await response.json();
          }
        }

        // フォールバックデータをlocalStorageに保存
        if (fallbackData && fallbackData.length > 0) {
          console.log("💾 フォールバックデータをlocalStorageに保存");
          this.recipeDB.saveRecipes(fallbackData);
          petitRecipes.push(...fallbackData);
        }
      }

      console.log("📋 最終取得データ:", petitRecipes.length + "件");

      // petit-recipe形式をRecipeBox形式に変換
      this.recipes = petitRecipes.map((recipe) =>
        this.convertPetitToRecipeBox(recipe),
      );
      this.filteredRecipes = [...this.recipes];

      console.log("📖 BOC-97: レシピデータ読み込み完了:", this.recipes.length + "件");
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
    addDebugLog('🎧 setupEventListeners開始');
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
        addDebugLog('🔘 ソートボタンクリック検出: ' + e.target.textContent);

        // アクティブタブの切り替え
        document
          .querySelectorAll(".sort-tab")
          .forEach((t) => t.classList.remove("active"));
        e.target.classList.add("active");

        const sortType = e.target.dataset.sort;
        addDebugLog('📊 ソートタイプ: ' + sortType);
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

    // ▼▼▼ Phase 3: ネイティブイベント統合 ▼▼▼
    this.setupNativeListeners();
  }

  // ネイティブリスナー設定
  async setupNativeListeners() {
    // 重複登録防止
    if (this.nativeListenersRegistered) {
      console.log('⚠️ ネイティブリスナー既に登録済み');
      return;
    }

    // Capacitor環境チェック
    if (typeof window.Capacitor !== "undefined" && window.Capacitor.isNativePlatform()) {
      try {
        // 動的インポート: ブラウザ環境では失敗しても続行
        const { App } = await import('@capacitor/app');

        // backButtonハンドラー
        this.backButtonHandler = () => {
          console.log('🔙 ネイティブ戻るボタン押下検出');
          this.handleNativeBackButton();
        };

        await App.addListener('backButton', this.backButtonHandler);
        this.nativeListenersRegistered = true;
        console.log('✅ ネイティブリスナー設定完了');
      } catch (error) {
        console.log('ℹ️ Capacitorプラグインインポート失敗 (ブラウザ環境):', error.message);
      }
    } else {
      console.log('ℹ️ Capacitor環境ではありません - ネイティブリスナー不要');
    }

    // ▼▼▼ BOC-98: Recipe Addition Form Event Listeners ▼▼▼
    this.setupAddRecipeFormListeners();
    // ▲▲▲ BOC-98: Form Event Listeners ▲▲▲
  }

  // ネイティブ戻るボタン処理
  async handleNativeBackButton() {
    if (this.history.length > 1) {
      console.log('📱 アプリ内ナビゲーション実行');
      this.navigateBack();
    } else {
      console.log('🚪 アプリ終了');
      if (typeof window.Capacitor !== "undefined" && window.Capacitor.isNativePlatform()) {
        try {
          const { App } = await import('@capacitor/app');
          await App.exitApp();
        } catch (error) {
          console.log('ℹ️ アプリ終了処理失敗 (ブラウザ環境):', error.message);
        }
      }
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

    // ★★★ 重要: selectedRecipeIdの更新 ★★★
    this.state.selectedRecipeId = recipeId;

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
    // レシピ詳細画面の場合は同じ画面でも再表示を許可
    if (this.state.currentScreen === screenId && screenId !== 'recipe-detail-screen') {
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


      // レシピ一覧画面の場合はレシピリストを描画
      if (screenId === 'recipes-screen') {
        this.renderRecipes();
        console.log('🎨 レシピ一覧画面でレシピリスト描画実行');
      }

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

  // ▼▼▼ BOC-98: Recipe Addition Methods ▼▼▼

  // レシピ追加画面表示
  showAddRecipeScreen() {
    console.log('📝 レシピ追加画面表示開始');

    // 追加モード設定
    this.editMode = 'add';
    this.editingRecipeId = null;

    this.showScreen('add-recipe-screen');
    this.clearAddRecipeForm();
    this.showEditModeIndicator(false); // 追加モードでは非表示
  }

  // レシピ追加フォームのイベントリスナー設定
  setupAddRecipeFormListeners() {
    const form = document.getElementById('add-recipe-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddRecipeSubmit();
      });
      console.log('📋 レシピ追加フォームリスナー設定完了');
    }
  }


  // フォームデータ収集
  collectFormData() {
    return {
      title: document.getElementById('recipe-title')?.value?.trim() || '',
      servings: document.getElementById('recipe-servings')?.value?.trim() || '1人前',
      cookTime: document.getElementById('recipe-cooktime')?.value?.trim() || '未設定',
      difficulty: document.getElementById('recipe-difficulty')?.value || '初級',
      ingredients: document.getElementById('recipe-ingredients')?.value?.trim() || '',
      instructions: document.getElementById('recipe-instructions')?.value?.trim() || ''
    };
  }

  // フォームバリデーション
  validateAddRecipeForm(formData) {
    const errors = [];

    // レシピ名チェック
    if (!formData.title) {
      errors.push('レシピ名は必須です');
    }

    // 材料チェック
    if (!formData.ingredients) {
      errors.push('材料は必須です');
    }

    // 手順チェック
    if (!formData.instructions) {
      errors.push('作り方は必須です');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // フォームデータからレシピオブジェクト作成
  createRecipeFromForm(formData) {
    return {
      title: formData.title,
      servings: formData.servings,
      cookTime: formData.cookTime,
      difficulty: formData.difficulty,
      ingredients: formData.ingredients.split('\n').filter(line => line.trim() !== ''),
      instructions: formData.instructions.split('\n').filter(line => line.trim() !== '')
    };
  }

  // フォームクリア
  clearAddRecipeForm() {
    const form = document.getElementById('add-recipe-form');
    if (form) {
      form.reset();
      // デフォルト値復元
      document.getElementById('recipe-servings').value = '1人前';
      document.getElementById('recipe-cooktime').value = '未設定';
      document.getElementById('recipe-difficulty').value = '初級';
    }
  }

  // エラーメッセージ表示
  showFormErrors(errors) {
    const errorMessage = errors.join('\n');
    alert(`入力エラー:\n${errorMessage}`);
  }

  // 成功メッセージ表示
  showSuccessMessage(message) {
    alert(message);
  }

  // エラーメッセージ表示
  showErrorMessage(message) {
    alert(message);
  }

  // レシピ一覧再読み込み
  async refreshRecipeList() {
    console.log('🔄 レシピ一覧再読み込み開始');
    await this.loadRecipes();
    this.renderRecipes();
    console.log('✅ レシピ一覧更新完了');
  }

  // ▲▲▲ BOC-98: Recipe Addition Implementation ▲▲▲

  // ▼▼▼ BOC-99: Recipe Edit/Delete UI Integration ▼▼▼

  // レシピ編集開始 - 詳細画面から呼び出される
  startEditRecipe() {
    try {
      const currentRecipeId = this.state.selectedRecipeId;
      if (!currentRecipeId) {
        throw new Error('No recipe selected for editing');
      }

      console.log('📝 レシピ編集開始:', currentRecipeId);

      // 編集モード設定
      this.editMode = 'edit';
      this.editingRecipeId = currentRecipeId;

      // レシピデータ取得・フォームプリフィル
      const recipe = this.recipeDB.getRecipeById(currentRecipeId);
      this.prefillEditForm(recipe);

      // 編集画面表示
      this.showScreen('add-recipe-screen');
      this.showEditModeIndicator(true);

      console.log('✅ 編集モード開始完了:', recipe.title);

    } catch (error) {
      console.error('❌ 編集開始エラー:', error);
      this.showErrorMessage(`編集を開始できませんでした: ${error.message}`);
    }
  }

  // フォームにレシピデータをプリフィル
  prefillEditForm(recipe) {
    console.log('📋 フォームデータプリフィル開始:', recipe.title);

    // 基本情報フィールド
    document.getElementById('recipe-title').value = recipe.title || '';
    document.getElementById('recipe-servings').value = recipe.servings || '1人前';
    document.getElementById('recipe-cooktime').value = recipe.cookTime || '未設定';
    document.getElementById('recipe-difficulty').value = recipe.difficulty || '初級';

    // 材料・手順配列 → テキストエリア変換
    const ingredientsText = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.join('\n')
      : recipe.ingredients || '';

    const instructionsText = Array.isArray(recipe.instructions)
      ? recipe.instructions.join('\n')
      : recipe.instructions || '';

    document.getElementById('recipe-ingredients').value = ingredientsText;
    document.getElementById('recipe-instructions').value = instructionsText;

    console.log('✅ フォームプリフィル完了');
  }

  // 編集モードインジケータ表示制御
  showEditModeIndicator(show) {
    const indicator = document.getElementById('edit-mode-indicator');
    const screenTitle = document.querySelector('#add-recipe-screen .screen-title');

    if (show) {
      indicator.style.display = 'block';
      if (screenTitle) screenTitle.textContent = 'レシピを編集';
    } else {
      indicator.style.display = 'none';
      if (screenTitle) screenTitle.textContent = '新しいレシピを追加';
    }
  }

  // フォーム送信処理を拡張 (追加・編集両対応)
  async handleAddRecipeSubmit() {
    try {
      console.log(`📤 ${this.editMode === 'edit' ? 'レシピ更新' : 'レシピ追加'}フォーム送信開始`);

      // フォームデータ収集
      const formData = this.collectFormData();
      console.log('📋 収集したフォームデータ:', formData);

      // バリデーション
      const validationResult = this.validateAddRecipeForm(formData);
      if (!validationResult.isValid) {
        this.showFormErrors(validationResult.errors);
        return;
      }

      // レシピオブジェクト作成
      const recipeData = this.createRecipeFromForm(formData);

      let savedRecipe;

      if (this.editMode === 'edit') {
        // 編集モード: 更新処理
        recipeData.id = this.editingRecipeId;
        savedRecipe = this.recipeDB.updateRecipe(recipeData);
        console.log('✅ レシピ更新完了:', savedRecipe.id);
        this.showSuccessMessage('レシピが正常に更新されました！');
      } else {
        // 追加モード: 新規作成処理 (既存処理)
        savedRecipe = this.recipeDB.addRecipe(recipeData);
        console.log('✅ レシピ追加完了:', savedRecipe.id);
        this.showSuccessMessage('レシピが正常に追加されました！');
      }

      // 編集モード終了・画面遷移
      this.exitEditMode();
      this.navigateBack();

      // レシピ一覧を再読み込み・再描画
      await this.refreshRecipeList();

      // 編集の場合は詳細画面に戻る
      if (this.editMode === 'edit') {
        setTimeout(() => {
          this.showRecipeDetail(savedRecipe.id);
        }, 100); // 画面遷移後に詳細表示
      }

    } catch (error) {
      console.error(`❌ ${this.editMode === 'edit' ? 'レシピ更新' : 'レシピ追加'}エラー:`, error);
      this.showErrorMessage(`${this.editMode === 'edit' ? 'レシピの更新' : 'レシピの追加'}に失敗しました: ${error.message}`);
    }
  }

  // 編集モード終了
  exitEditMode() {
    this.editMode = null;
    this.editingRecipeId = null;
    this.showEditModeIndicator(false);
  }

  // レシピ削除確認開始
  confirmDeleteRecipe() {
    try {
      const currentRecipeId = this.state.selectedRecipeId;
      if (!currentRecipeId) {
        throw new Error('No recipe selected for deletion');
      }

      console.log('🗑️ 削除確認開始:', currentRecipeId);

      // レシピ名取得・モーダル表示
      const recipe = this.recipeDB.getRecipeById(currentRecipeId);
      this.pendingDeleteRecipeId = currentRecipeId;

      document.getElementById('delete-recipe-name').textContent = recipe.title;
      document.getElementById('delete-modal').classList.add('active');

      console.log('✅ 削除確認モーダル表示:', recipe.title);

    } catch (error) {
      console.error('❌ 削除確認エラー:', error);
      this.showErrorMessage(`削除確認を表示できませんでした: ${error.message}`);
    }
  }

  // レシピ削除キャンセル
  cancelDeleteRecipe() {
    console.log('🚫 レシピ削除キャンセル');
    this.pendingDeleteRecipeId = null;
    document.getElementById('delete-modal').classList.remove('active');
  }

  // レシピ削除実行
  async executeDeleteRecipe() {
    try {
      if (!this.pendingDeleteRecipeId) {
        throw new Error('No recipe pending for deletion');
      }

      console.log('🗑️ レシピ削除実行開始:', this.pendingDeleteRecipeId);

      // データベースから削除
      const result = this.recipeDB.deleteRecipe(this.pendingDeleteRecipeId);

      // モーダルクローズ・状態クリア
      this.cancelDeleteRecipe();

      // 成功メッセージ
      this.showSuccessMessage(`「${result.deletedRecipe.title}」を削除しました`);

      // レシピ一覧に戻る
      this.showScreen('recipes-screen');

      // レシピ一覧を再読み込み・再描画
      await this.refreshRecipeList();

      console.log('✅ レシピ削除完了 - 残り件数:', result.remainingCount);

    } catch (error) {
      console.error('❌ レシピ削除エラー:', error);
      this.showErrorMessage(`レシピの削除に失敗しました: ${error.message}`);
      this.cancelDeleteRecipe(); // エラー時もモーダルクローズ
    }
  }

  // ▲▲▲ BOC-99: Recipe Edit/Delete Implementation ▲▲▲

  // ▼▼▼ BOC-100: Settings and Backup/Restore UI Methods ▼▼▼

  // 設定画面表示
  showSettings() {
    try {
      console.log('⚙️ 設定画面表示');

      // 履歴に現在の画面を追加
      this.history.push(this.currentScreen);
      this.currentScreen = 'settings-screen';

      // 画面切り替え
      this.showScreen('settings-screen');

      // データベース状態表示更新
      this.updateSettingsInfo();

      console.log('✅ 設定画面表示完了');

    } catch (error) {
      console.error('❌ 設定画面表示エラー:', error);
      this.showErrorMessage('設定画面の表示に失敗しました');
    }
  }

  // 設定画面情報更新
  updateSettingsInfo() {
    try {
      const stats = this.recipeDB.getBackupStats();

      // アプリバージョン更新
      const versionElement = document.getElementById('app-version');
      if (versionElement) {
        versionElement.textContent = 'Petit Recipe v3.0 (BOC-100)';
      }

      // データベース状態更新
      const dbStatusElement = document.getElementById('db-status');
      if (dbStatusElement && stats) {
        const statusText = `レシピ: ${stats.currentData.recipes}件, 閲覧データ: ${stats.currentData.viewCounts}件 (v${stats.currentData.version})`;
        dbStatusElement.textContent = statusText;
      } else if (dbStatusElement) {
        dbStatusElement.textContent = 'データ読み込みエラー';
      }

      console.log('✅ 設定画面情報更新完了:', stats);

    } catch (error) {
      console.error('❌ 設定画面情報更新エラー:', error);
      const dbStatusElement = document.getElementById('db-status');
      if (dbStatusElement) {
        dbStatusElement.textContent = 'ステータス取得失敗';
      }
    }
  }

  // データエクスポート処理
  exportData() {
    try {
      console.log('📦 データエクスポート処理開始');

      // データベースからエクスポートデータ取得
      const exportData = this.recipeDB.exportAllData();

      // ファイル名生成
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `petit-recipe-backup-${timestamp}.json`;

      // JSON文字列変換（見やすい形式）
      const jsonString = JSON.stringify(exportData, null, 2);

      // ダウンロード処理
      this.downloadFile(jsonString, filename, 'application/json');

      console.log('✅ データエクスポート完了:', {
        filename: filename,
        recipes: exportData.totalRecipes,
        viewCounts: exportData.totalViewCounts,
        size: (jsonString.length / 1024).toFixed(1) + 'KB'
      });

      this.showSuccessMessage(`バックアップファイル「${filename}」をダウンロードしました`);

    } catch (error) {
      console.error('❌ データエクスポートエラー:', error);
      this.showErrorMessage(`エクスポートに失敗しました: ${error.message}`);
    }
  }

  // ファイルダウンロード処理
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // メモリ解放
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // データインポート処理開始
  importData() {
    try {
      console.log('📥 データインポート処理開始');

      // ファイル選択ダイアログをトリガー
      const fileInput = document.getElementById('import-file-input');
      if (fileInput) {
        fileInput.click();
      } else {
        throw new Error('ファイル入力要素が見つかりません');
      }

    } catch (error) {
      console.error('❌ インポート開始エラー:', error);
      this.showErrorMessage('インポート処理の開始に失敗しました');
    }
  }

  // ファイル選択時の処理
  handleFileSelection(event) {
    try {
      const file = event.target.files[0];
      if (!file) {
        console.log('📁 ファイル選択がキャンセルされました');
        return;
      }

      console.log('📂 ファイル選択:', file.name, file.type, file.size + 'bytes');

      // ファイル形式チェック
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        this.showErrorMessage('JSONファイルを選択してください');
        return;
      }

      // ファイル読み込み
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonContent = e.target.result;
          const importData = JSON.parse(jsonContent);

          // 確認モーダル表示前にデータを保存
          this.pendingImportData = importData;
          this.showImportConfirmation();

        } catch (parseError) {
          console.error('❌ JSONパースエラー:', parseError);
          this.showErrorMessage('JSONファイルの形式が正しくありません');
        }
      };

      reader.onerror = () => {
        console.error('❌ ファイル読み込みエラー');
        this.showErrorMessage('ファイルの読み込みに失敗しました');
      };

      reader.readAsText(file);

      // ファイル入力をリセット（同じファイルを再選択可能にする）
      event.target.value = '';

    } catch (error) {
      console.error('❌ ファイル選択処理エラー:', error);
      this.showErrorMessage('ファイル処理でエラーが発生しました');
    }
  }

  // インポート確認モーダル表示
  showImportConfirmation() {
    const modal = document.getElementById('import-confirmation-modal');
    if (modal) {
      modal.style.display = 'flex';
      console.log('⚠️ インポート確認モーダル表示');
    }
  }

  // インポート確認キャンセル
  cancelImport() {
    const modal = document.getElementById('import-confirmation-modal');
    if (modal) {
      modal.style.display = 'none';
      this.pendingImportData = null;
      console.log('❌ インポートキャンセル');
    }
  }

  // インポート実行確認
  confirmImport() {
    try {
      if (!this.pendingImportData) {
        throw new Error('インポートデータが見つかりません');
      }

      console.log('⚡ インポート実行開始');

      // データベースにインポート実行
      const importLog = this.recipeDB.importAllData(this.pendingImportData);

      // モーダル非表示
      this.cancelImport();

      console.log('✅ インポート完了:', importLog);
      this.showSuccessMessage(`インポート完了: レシピ${importLog.importedRecipes}件、閲覧データ${importLog.importedViewCounts}件`);

      // アプリリロード（新しいデータを完全反映）
      setTimeout(() => {
        console.log('🔄 アプリリロード開始');
        location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ インポート実行エラー:', error);
      this.cancelImport();
      this.showErrorMessage(`インポートに失敗しました: ${error.message}`);
    }
  }

  // ▲▲▲ BOC-100: Settings and Backup/Restore UI Methods ▲▲▲

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
    addDebugLog('🔄 レシピソート開始: ' + sortType);
    
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

  // ネイティブリスナーはsetupEventListeners()内で管理

  // 🧪 初期化完了確認テスト
  alert("初期化完了");
});
