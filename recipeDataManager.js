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
                    console.log('📝 No recipes.json found in Documents, creating empty one');
                    return await this.createEmptyRecipesFile();
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
     * Helper: Create empty recipes file
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

console.log('✅ Simple Recipe Data Manager loaded');
console.log('🔧 Available functions:');
console.log('  - loadAllRecipes() - Load all recipes');
console.log('  - addNewRecipe(data) - Add new recipe');
console.log('  - removeRecipe(id) - Delete recipe');
console.log('  - refreshRecipeData() - Refresh and update PETIT_RECIPE_DATA');
console.log('  - testRecipeDataManager() - Run tests');
