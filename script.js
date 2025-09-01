// ===== Petit Recipe JavaScript =====

// メインアプリケーションクラス
class PetitRecipe {
    constructor() {
        this.recipes = [];
        this.currentView = 'list';
        this.currentRecipeId = null;
        this.init();
    }

    // 初期化
    async init() {
        console.log('🍳 Petit Recipe 初期化開始');
        
        // レシピデータの読み込み
        await this.loadRecipes();
        
        // 初期画面の表示
        this.showRecipeList();
        
        // URL変更の監視（簡易ルーティング）
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        
        // 初期ルーティング
        this.handleRoute();
        
        console.log('✅ Petit Recipe 初期化完了');
    }

    // レシピデータの読み込み
    async loadRecipes() {
        try {
            const response = await fetch('src/data/recipes.json');
            this.recipes = await response.json();
            console.log('📖 レシピデータ読み込み完了:', this.recipes.length + '件');
        } catch (error) {
            console.error('❌ レシピデータ読み込み失敗:', error);
            // フォールバック用のダミーデータ
            this.recipes = [
                {
                    id: "1",
                    title: "サンプルレシピ",
                    servings: "2人前",
                    ingredients: ["材料1", "材料2"],
                    instructions: ["手順1", "手順2"],
                    cookTime: "30分",
                    difficulty: "初級"
                }
            ];
        }
    }

    // 簡易ルーティング処理
    handleRoute() {
        const path = window.location.hash.slice(1) || '/';
        
        if (path === '/' || path === '') {
            this.showRecipeList();
        } else if (path.startsWith('/recipe/')) {
            const recipeId = path.split('/recipe/')[1];
            this.showRecipeDetail(recipeId);
        } else {
            this.showRecipeList();
        }
    }

    // レシピ一覧画面の表示
    showRecipeList() {
        console.log('📋 レシピ一覧表示');
        
        this.currentView = 'list';
        this.currentRecipeId = null;
        
        // ビューの切り替え
        document.getElementById('recipe-list-view').classList.add('active');
        document.getElementById('recipe-detail-view').classList.remove('active');
        
        // ヘッダーの更新
        document.getElementById('app-title').textContent = '🍳 Petit Recipe';
        document.getElementById('backBtn').style.display = 'none';
        
        // レシピ一覧のレンダリング
        this.renderRecipeList();
        
        // URL更新
        window.history.replaceState({}, '', '#/');
    }

    // レシピ詳細画面の表示
    showRecipeDetail(recipeId) {
        console.log('📖 レシピ詳細表示:', recipeId);
        
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) {
            console.error('❌ レシピが見つかりません:', recipeId);
            this.showRecipeList();
            return;
        }
        
        this.currentView = 'detail';
        this.currentRecipeId = recipeId;
        
        // ビューの切り替え
        document.getElementById('recipe-list-view').classList.remove('active');
        document.getElementById('recipe-detail-view').classList.add('active');
        
        // ヘッダーの更新
        document.getElementById('app-title').textContent = recipe.title;
        document.getElementById('backBtn').style.display = 'block';
        
        // レシピ詳細のレンダリング
        this.renderRecipeDetail(recipe);
        
        // URL更新
        window.history.pushState({}, '', `#/recipe/${recipeId}`);
    }

    // レシピ一覧のレンダリング
    renderRecipeList() {
        const container = document.getElementById('recipes-container');
        container.innerHTML = '';

        this.recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card card';
            recipeCard.innerHTML = `
                <div class="recipe-header">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <span class="recipe-difficulty ${recipe.difficulty}">${recipe.difficulty}</span>
                </div>
                <div class="recipe-meta">
                    <span class="recipe-servings">👥 ${recipe.servings}</span>
                    <span class="recipe-time">⏱️ ${recipe.cookTime}</span>
                </div>
                <div class="recipe-preview">
                    <strong>材料:</strong> ${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}
                </div>
                <button class="recipe-btn" onclick="petitRecipe.showRecipeDetail('${recipe.id}')">
                    詳細を見る →
                </button>
            `;
            container.appendChild(recipeCard);
        });
    }

    // レシピ詳細のレンダリング
    renderRecipeDetail(recipe) {
        const container = document.getElementById('recipe-detail-content');
        
        const ingredientsList = recipe.ingredients.map(ingredient => 
            `<li class="ingredient-item">${ingredient}</li>`
        ).join('');
        
        const instructionsList = recipe.instructions.map((instruction, index) => 
            `<li class="instruction-item">
                <span class="step-number">${index + 1}</span>
                <span class="step-content">${instruction}</span>
            </li>`
        ).join('');

        container.innerHTML = `
            <div class="recipe-detail-card card">
                <div class="recipe-detail-header">
                    <h2 class="recipe-detail-title">${recipe.title}</h2>
                    <div class="recipe-detail-meta">
                        <span class="recipe-servings">👥 ${recipe.servings}</span>
                        <span class="recipe-time">⏱️ ${recipe.cookTime}</span>
                        <span class="recipe-difficulty ${recipe.difficulty}">${recipe.difficulty}</span>
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title">🛒 材料</h3>
                    <ul class="ingredients-list">
                        ${ingredientsList}
                    </ul>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title">📝 作り方</h3>
                    <ol class="instructions-list">
                        ${instructionsList}
                    </ol>
                </div>
            </div>
        `;
    }

    // 戻るボタンの処理
    goBack() {
        if (this.currentView === 'detail') {
            this.showRecipeList();
        }
    }
}

// グローバルインスタンス
let petitRecipe;

// DOMコンテンツ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
    petitRecipe = new PetitRecipe();
});