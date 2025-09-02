// ===== Petit Recipe with RecipeBox UI =====

// データアダプタークラス: petit-recipe形式をRecipeBox形式に変換
class DataAdapter {
    static petitToRecipeBox(petitRecipe) {
        return {
            id: `recipe_${petitRecipe.id}`,
            name: petitRecipe.title,
            category: 'main', // デフォルト
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            servings: parseInt(petitRecipe.servings) || 1,
            cookTime: petitRecipe.cookTime || '30分',
            difficulty: petitRecipe.difficulty || '初級',
            ingredients: petitRecipe.ingredients.map(ing => {
                const match = ing.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(\w+)$/);
                if (match) {
                    return { name: match[1], amount: parseFloat(match[2]), unit: match[3] };
                } else {
                    return { name: ing, amount: 1, unit: '個' };
                }
            }),
            steps: petitRecipe.instructions || []
        };
    }
}

// RecipeBox互換のメインアプリケーションクラス
class PetitRecipe {
    constructor() {
        this.recipes = [];
        this.currentScreen = 'main-screen';
        this.init();
    }

    // 初期化
    async init() {
        console.log('🍳 Petit Recipe with RecipeBox UI 初期化開始');
        
        // レシピデータの読み込み
        await this.loadRecipes();
        
        // イベントリスナー設定
        this.setupEventListeners();
        
        // 初期画面表示
        this.showScreen('recipes-screen'); // 直接レシピ画面へ
        this.renderRecipesList();
        
        console.log('✅ Petit Recipe 初期化完了');
    }

    // レシピデータの読み込み
    async loadRecipes() {
        try {
            const response = await fetch('src/data/recipes.json');
            const petitRecipes = await response.json();
            
            // petit-recipe形式をRecipeBox形式に変換
            this.recipes = petitRecipes.map(recipe => DataAdapter.petitToRecipeBox(recipe));
            
            console.log('📖 レシピデータ読み込み完了:', this.recipes.length + '件');
        } catch (error) {
            console.error('❌ レシピデータ読み込み失敗:', error);
            // フォールバック用のダミーデータ
            this.recipes = [{
                id: "recipe_1",
                name: "サンプルレシピ",
                category: "main",
                servings: 2,
                ingredients: [{ name: "材料1", amount: 100, unit: "g" }],
                steps: ["手順1"],
                cookTime: "30分",
                difficulty: "初級"
            }];
        }
    }

    // イベントリスナー設定
    setupEventListeners() {
        // 検索機能
        const searchInput = document.getElementById('recipe-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterRecipes(e.target.value);
            });
        }

        // ソート機能
        const sortTabs = document.querySelectorAll('.sort-tab');
        sortTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // アクティブタブの切り替え
                sortTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const sortType = e.target.dataset.sort;
                this.sortRecipes(sortType);
            });
        });
    }

    // 画面切り替え
    showScreen(screenId) {
        // すべての画面を非表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 指定された画面を表示
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    // レシピ一覧の表示
    renderRecipesList() {
        const recipesListContainer = document.getElementById('recipes-list');
        if (!recipesListContainer) return;

        if (this.recipes.length === 0) {
            recipesListContainer.innerHTML = '<div class="no-recipes">レシピがありません</div>';
            return;
        }

        const recipeCards = this.recipes.map(recipe => {
            const difficultyClass = recipe.difficulty.replace('級', '').toLowerCase();
            const categoryIcon = this.getCategoryIcon(recipe.category);
            
            return `
                <div class="recipe-card" onclick="petitRecipe.showRecipeDetail('${recipe.id}')">
                    <div class="recipe-header">
                        <div class="recipe-icon">${categoryIcon}</div>
                        <div class="recipe-meta">
                            <h3 class="recipe-title">${recipe.name}</h3>
                            <div class="recipe-tags">
                                <span class="recipe-time">⏱️ ${recipe.cookTime}</span>
                                <span class="recipe-servings">👥 ${recipe.servings}人前</span>
                                <span class="recipe-difficulty ${difficultyClass}">${recipe.difficulty}</span>
                            </div>
                        </div>
                    </div>
                    <div class="recipe-preview">
                        <strong>材料:</strong> ${recipe.ingredients.slice(0, 3).map(ing => ing.name).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}
                    </div>
                </div>
            `;
        }).join('');

        recipesListContainer.innerHTML = recipeCards;
    }

    // レシピ詳細の表示
    showRecipeDetail(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) {
            console.error('レシピが見つかりません:', recipeId);
            return;
        }

        // レシピ詳細画面に切り替え
        this.showScreen('recipe-detail-screen');
        
        // タイトルの設定
        const titleElement = document.getElementById('recipe-detail-title');
        if (titleElement) {
            titleElement.textContent = recipe.name;
        }

        // 材料リストの表示
        this.renderIngredients(recipe);
        
        // 手順の表示
        this.renderSteps(recipe);

        // 追加情報の表示
        this.renderAdditionalInfo(recipe);
    }

    // 材料リストのレンダリング
    renderIngredients(recipe) {
        const ingredientsList = document.getElementById('ingredients-list');
        if (!ingredientsList) return;

        const ingredientsHtml = recipe.ingredients.map(ingredient => `
            <div class="ingredient-item">
                <span class="ingredient-name">${ingredient.name}</span>
                <span class="ingredient-amount">${ingredient.amount}${ingredient.unit}</span>
            </div>
        `).join('');

        ingredientsList.innerHTML = ingredientsHtml;
    }

    // 手順のレンダリング
    renderSteps(recipe) {
        const stepsList = document.getElementById('steps-list');
        if (!stepsList) return;

        const stepsHtml = recipe.steps.map((step, index) => `
            <div class="step-item">
                <span class="step-number">${index + 1}</span>
                <span class="step-text">${step}</span>
            </div>
        `).join('');

        stepsList.innerHTML = stepsHtml;
    }

    // 追加情報のレンダリング
    renderAdditionalInfo(recipe) {
        const categoryElement = document.getElementById('recipe-category');
        const yieldElement = document.getElementById('recipe-yield');
        const equipmentElement = document.getElementById('recipe-equipment');
        const cookingTimeElement = document.getElementById('recipe-cooking-time');

        if (categoryElement) {
            categoryElement.innerHTML = `<strong>カテゴリ:</strong> ${this.getCategoryName(recipe.category)}`;
        }
        if (yieldElement) {
            yieldElement.innerHTML = `<strong>分量:</strong> ${recipe.servings}人前`;
        }
        if (cookingTimeElement) {
            cookingTimeElement.innerHTML = `<strong>調理時間:</strong> ${recipe.cookTime}`;
        }
        if (equipmentElement) {
            equipmentElement.innerHTML = `<strong>難易度:</strong> ${recipe.difficulty}`;
        }

        // バージョン履歴は非表示
        const versionList = document.getElementById('version-list');
        if (versionList) {
            versionList.innerHTML = '<div class="version-item">初回作成</div>';
        }
    }

    // カテゴリアイコンの取得
    getCategoryIcon(category) {
        const icons = {
            main: '🍛',
            dessert: '🍰',
            sauce: '🥄',
            drink: '🥤',
            side: '🥗'
        };
        return icons[category] || '🍳';
    }

    // カテゴリ名の取得
    getCategoryName(category) {
        const names = {
            main: 'メイン料理',
            dessert: 'デザート',
            sauce: 'タレ・調味料',
            drink: '飲み物',
            side: '副菜'
        };
        return names[category] || 'その他';
    }

    // レシピ検索・フィルタリング
    filterRecipes(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderRecipesList();
            return;
        }

        const filtered = this.recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        const originalRecipes = this.recipes;
        this.recipes = filtered;
        this.renderRecipesList();
        this.recipes = originalRecipes;
    }

    // レシピソート
    sortRecipes(sortType) {
        switch (sortType) {
            case 'time':
                this.recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'name':
                this.recipes.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
                break;
            case 'popular':
                // 人気順はランダム（実際のアプリでは使用回数等でソート）
                this.recipes.sort(() => Math.random() - 0.5);
                break;
        }
        this.renderRecipesList();
    }
}

// グローバル関数（RecipeBox互換）
function showScreen(screenId) {
    if (window.petitRecipe) {
        window.petitRecipe.showScreen(screenId);
    }
}

// グローバルインスタンス
let petitRecipe;

// DOMコンテンツ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', function() {
    petitRecipe = new PetitRecipe();
    window.petitRecipe = petitRecipe; // グローバルアクセス用
});