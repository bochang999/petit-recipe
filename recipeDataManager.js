// BOC-107: Simple Recipe Data Manager - Single Source of Truth
// Excel-like operations: Direct Capacitor FileSystem management

/**
 * Simple Recipe Data Manager
 * Target: Documents/recipes.json as the ONLY data source
 * 4 Core Functions: loadRecipes, saveRecipes, addRecipe, deleteRecipe
 */
class RecipeDataManager {
    constructor() {
        this.filePath = 'recipes.json';
        this.isNative = false;
        this.filesystem = null;
        this.directory = null;
        this.encoding = null;
    }

    /**
     * Initialize FileSystem environment
     */
    async initialize() {
        try {
            if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
                // Native environment - use Capacitor FileSystem
                const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
                this.filesystem = Filesystem;
                this.directory = Directory.Documents;
                this.encoding = Encoding.UTF8;
                this.isNative = true;
                console.log('✅ Native Capacitor FileSystem initialized');
            } else {
                // Web environment - fallback to localStorage
                this.isNative = false;
                console.log('🌐 Web environment - using localStorage fallback');
            }
        } catch (error) {
            console.error('❌ FileSystem initialization failed:', error);
            this.isNative = false;
        }
    }

    /**
     * Core Function 1: loadRecipes()
     * Load recipes from Documents/recipes.json
     */
    async loadRecipes() {
        try {
            await this.initialize();

            if (this.isNative) {
                // Native: Read from Documents/recipes.json
                try {
                    const result = await this.filesystem.readFile({
                        path: this.filePath,
                        directory: this.directory,
                        encoding: this.encoding
                    });
                    const data = JSON.parse(result.data);
                    console.log(`✅ Loaded ${data.recipes.length} recipes from Documents/${this.filePath}`);
                    return data.recipes || [];
                } catch (fileError) {
                    console.log('📝 No recipes.json found in Documents, initializing with sample data');
                    return await this.createInitialRecipesFile();
                }
            } else {
                // Web: Fallback to current recipes.json
                const response = await fetch('./recipes.json');
                if (!response.ok) {
                    throw new Error('Failed to load recipes.json');
                }
                const data = await response.json();
                console.log(`✅ Loaded ${data.recipes.length} recipes from ./recipes.json (web fallback)`);
                return data.recipes || [];
            }
        } catch (error) {
            console.error('❌ loadRecipes failed:', error);
            return [];
        }
    }

    /**
     * Core Function 2: saveRecipes(data)
     * Save recipes to Documents/recipes.json
     */
    async saveRecipes(recipes) {
        try {
            await this.initialize();

            const dataToSave = {
                version: "1.0",
                lastUpdated: new Date().toISOString(),
                recipes: recipes
            };

            if (this.isNative) {
                // Native: Write to Documents/recipes.json
                await this.filesystem.writeFile({
                    path: this.filePath,
                    data: JSON.stringify(dataToSave, null, 2),
                    directory: this.directory,
                    encoding: this.encoding
                });
                console.log(`💾 Saved ${recipes.length} recipes to Documents/${this.filePath}`);
            } else {
                // Web: Save to localStorage as backup
                localStorage.setItem('petit-recipe-data', JSON.stringify(dataToSave));
                console.log(`💾 Saved ${recipes.length} recipes to localStorage (web fallback)`);
            }

            return true;
        } catch (error) {
            console.error('❌ saveRecipes failed:', error);
            return false;
        }
    }

    /**
     * Core Function 3: addRecipe(newRecipe)
     * Excel-like: Load → Add → Save
     */
    async addRecipe(newRecipe) {
        try {
            console.log('➕ Adding recipe:', newRecipe.name);

            // Step 1: Load current recipes
            const currentRecipes = await this.loadRecipes();

            // Step 2: Generate new ID
            const maxId = currentRecipes.length > 0
                ? Math.max(...currentRecipes.map(r => parseInt(r.id) || 0))
                : 0;
            const newId = (maxId + 1).toString();

            // Step 3: Standardize recipe data
            const standardizedRecipe = {
                id: newId,
                name: newRecipe.name || 'New Recipe',
                servings: newRecipe.servings || 1,
                cookTime: newRecipe.cookTime || '30分',
                ingredients: newRecipe.ingredients || [],
                steps: newRecipe.steps || []
            };

            // Step 4: Add to current recipes
            currentRecipes.push(standardizedRecipe);

            // Step 5: Save back to file
            const success = await this.saveRecipes(currentRecipes);

            if (success) {
                console.log(`✅ Recipe added successfully: ${standardizedRecipe.name} (ID: ${newId})`);
                return standardizedRecipe;
            } else {
                throw new Error('Failed to save recipe');
            }
        } catch (error) {
            console.error('❌ addRecipe failed:', error);
            throw error;
        }
    }

    /**
     * Core Function 4: deleteRecipe(recipeId)
     * Excel-like: Load → Delete → Save
     */
    async deleteRecipe(recipeId) {
        try {
            console.log('🗑️ Deleting recipe ID:', recipeId);

            // Step 1: Load current recipes
            const currentRecipes = await this.loadRecipes();

            // Step 2: Find and remove recipe
            const recipeToDelete = currentRecipes.find(r => r.id === recipeId);
            if (!recipeToDelete) {
                throw new Error(`Recipe with ID ${recipeId} not found`);
            }

            const updatedRecipes = currentRecipes.filter(r => r.id !== recipeId);

            // Step 3: Save back to file
            const success = await this.saveRecipes(updatedRecipes);

            if (success) {
                console.log(`✅ Recipe deleted successfully: ${recipeToDelete.name} (ID: ${recipeId})`);
                return recipeId;
            } else {
                throw new Error('Failed to save after deletion');
            }
        } catch (error) {
            console.error('❌ deleteRecipe failed:', error);
            throw error;
        }
    }

    /**
     * Helper: Create initial recipes file from embedded data for APK
     * Loads the full recipes.json data into Documents/recipes.json
     */
    async createInitialRecipesFile() {
        console.log('🔧 Creating initial recipes file with full recipe data for APK');

        try {
            // In APK environment, attempt to read from bundled assets first
            if (this.isNative) {
                console.log('📱 APK: Loading bundled recipes.json from assets');

                // Try to read bundled recipes.json from app assets
                try {
                    const bundledData = await fetch('./recipes.json');
                    const parsedData = await bundledData.json();
                    const recipes = parsedData.recipes || [];

                    console.log(`📦 Found ${recipes.length} bundled recipes, copying to Documents/recipes.json`);
                    await this.saveRecipes(recipes);
                    return recipes;
                } catch (bundleError) {
                    console.log('⚠️ Could not load bundled recipes.json, using minimal fallback');
                    // Fallback to minimal initial data
                    return await this.createEmptyRecipesFile();
                }
            } else {
                // Web environment - should not reach this point, but safety fallback
                console.log('🌐 Web environment - returning empty recipes');
                return await this.createEmptyRecipesFile();
            }
        } catch (error) {
            console.error('❌ createInitialRecipesFile failed:', error);
            return await this.createEmptyRecipesFile();
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
        return recipes.find(r => r.id === recipeId);
    }

    /**
     * Helper: Clear old localStorage data
     */
    async clearOldLocalStorageData() {
        try {
            console.log('🧹 Clearing old localStorage recipe data...');

            // Clear all old recipe-related localStorage keys
            const keysToRemove = [
                'petit-recipe-db',
                'petitRecipeDB',
                'recipe-database',
                'recipeViewCounts',
                'last_recipe_count'
            ];

            keysToRemove.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log(`🗑️ Removed old localStorage key: ${key}`);
                }
            });

            console.log('✅ Old localStorage data cleared');
            return true;
        } catch (error) {
            console.error('❌ Failed to clear localStorage:', error);
            return false;
        }
    }

    /**
     * Helper: Update existing recipe
     */
    async updateRecipe(recipeId, updatedData) {
        try {
            console.log('✏️ Updating recipe ID:', recipeId);

            // Step 1: Load current recipes
            const currentRecipes = await this.loadRecipes();

            // Step 2: Find and update recipe
            const recipeIndex = currentRecipes.findIndex(r => r.id === recipeId);
            if (recipeIndex === -1) {
                throw new Error(`Recipe with ID ${recipeId} not found`);
            }

            currentRecipes[recipeIndex] = { ...currentRecipes[recipeIndex], ...updatedData, id: recipeId };

            // Step 3: Save back to file
            const success = await this.saveRecipes(currentRecipes);

            if (success) {
                console.log(`✅ Recipe updated successfully: ${currentRecipes[recipeIndex].name} (ID: ${recipeId})`);
                return currentRecipes[recipeIndex];
            } else {
                throw new Error('Failed to save after update');
            }
        } catch (error) {
            console.error('❌ updateRecipe failed:', error);
            throw error;
        }
    }
}

// Create global singleton instance
window.recipeDataManager = new RecipeDataManager();

// Global helper functions for UI integration
window.loadAllRecipes = async function() {
    return await window.recipeDataManager.loadRecipes();
};

window.addNewRecipe = async function(recipeData) {
    return await window.recipeDataManager.addRecipe(recipeData);
};

window.removeRecipe = async function(recipeId) {
    return await window.recipeDataManager.deleteRecipe(recipeId);
};

window.refreshRecipeData = async function() {
    const recipes = await window.recipeDataManager.loadRecipes();
    window.PETIT_RECIPE_DATA = recipes;
    console.log(`🔄 Refreshed: ${recipes.length} recipes loaded`);
    return recipes;
};

window.forceRefreshLocalRecipes = async function() {
    console.log('🔄 Force refreshing local recipes and UI...');
    console.log('🖱️ Refresh button clicked - function called successfully');
    try {
        // Step 1: Clear old localStorage data to prevent sample data issues
        if (window.recipeDataManager && window.recipeDataManager.clearOldLocalStorageData) {
            await window.recipeDataManager.clearOldLocalStorageData();
        }

        // Step 2: Reload recipes from file (should be empty or real data)
        const recipes = await window.refreshRecipeData();

        // Step 3: Update the app's recipe data if app exists
        if (window.app && typeof window.app.renderRecipes === 'function') {
            window.app.recipes = recipes;
            window.app.filteredRecipes = [...recipes];
            window.app.renderRecipes();
            console.log('✅ App UI refreshed successfully');
        } else if (typeof window.renderRecipesList === 'function') {
            window.renderRecipesList();
            console.log('✅ UI refreshed via renderRecipesList');
        } else {
            // Manual DOM update as final fallback
            console.log('⚠️ No UI update function found - updating DOM manually');
            const recipesList = document.getElementById('recipes-list');
            if (recipesList) {
                if (recipes.length === 0) {
                    recipesList.innerHTML = '<div class="no-recipes">レシピがありません<br><small>新しいレシピを追加してください</small></div>';
                    console.log('📝 Empty recipe list displayed');
                } else {
                    const recipesHtml = recipes.map(recipe => `
                        <div class="recipe-card">
                            <div class="recipe-header">
                                <h3 class="recipe-title">${recipe.name || 'Unknown Recipe'}</h3>
                                <div class="recipe-meta">
                                    <span class="recipe-time">⏱️ ${recipe.cookTime || '不明'}</span>
                                    <span class="recipe-servings">🍴 ${recipe.servings || 1}人前</span>
                                </div>
                            </div>
                            <div class="recipe-preview">
                                <p>材料: ${(recipe.ingredients || []).length}種類</p>
                                <p>手順: ${(recipe.steps || []).length}ステップ</p>
                            </div>
                        </div>
                    `).join('');
                    recipesList.innerHTML = recipesHtml;
                    console.log(`📋 Manual DOM update: ${recipes.length} recipes displayed`);
                }
            } else {
                console.error('❌ recipes-list element not found - cannot update UI');
            }
        }

        console.log(`🎯 Final result: ${recipes.length} recipes displayed`);
        return recipes;
    } catch (error) {
        console.error('❌ Force refresh failed:', error);
        alert('レシピの更新に失敗しました: ' + error.message);
    }
};

// Test function for development
window.testRecipeDataManager = async function() {
    console.log('🧪 Testing Recipe Data Manager...');

    try {
        // Test load
        const recipes = await window.recipeDataManager.loadRecipes();
        console.log(`📊 Current recipes: ${recipes.length}`);

        // Test add
        const testRecipe = {
            name: "Test Recipe",
            servings: 2,
            cookTime: "15分",
            ingredients: [
                { name: "Test ingredient", amount: 1, unit: "個" }
            ],
            steps: ["Test step 1", "Test step 2"]
        };

        const addedRecipe = await window.recipeDataManager.addRecipe(testRecipe);
        console.log('✅ Add test successful:', addedRecipe.name);

        // Test delete
        await window.recipeDataManager.deleteRecipe(addedRecipe.id);
        console.log('✅ Delete test successful');

        console.log('🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

// Clean localStorage function
window.cleanOldRecipeData = async function() {
    if (window.recipeDataManager && window.recipeDataManager.clearOldLocalStorageData) {
        return await window.recipeDataManager.clearOldLocalStorageData();
    }
    console.log('⚠️ recipeDataManager not available for cleanup');
    return false;
};

console.log('✅ Simple Recipe Data Manager loaded');
console.log('🔧 Available functions:');
console.log('  - loadAllRecipes() - Load all recipes');
console.log('  - addNewRecipe(data) - Add new recipe');
console.log('  - removeRecipe(id) - Delete recipe');
console.log('  - refreshRecipeData() - Refresh and update PETIT_RECIPE_DATA');
console.log('  - forceRefreshLocalRecipes() - Force refresh with UI update');
console.log('  - cleanOldRecipeData() - Clear old localStorage data');
console.log('  - testRecipeDataManager() - Run tests');
