// BOC-107: Recipe Architecture Initialization - Excel-like immediate response system
// Connect layered data architecture to existing UI

import { recipeArchitecture } from './layered-data-architecture.js';

/**
 * Initialize the complete recipe architecture system
 * Ensures Excel-like immediate response for all operations
 */
async function initializeRecipeArchitecture() {
    try {
        console.log('🏗️ Initializing Recipe Architecture System...');

        // Initialize the layered architecture
        const initialized = await recipeArchitecture.initialize();

        if (!initialized) {
            throw new Error('Failed to initialize recipe architecture');
        }

        // Load and display recipes immediately
        const recipes = await recipeArchitecture.getAllRecipes();
        console.log(`✅ Recipe Architecture ready with ${recipes.length} recipes`);

        // Setup global functions for UI integration
        setupGlobalFunctions();

        // Setup UI event handlers
        setupUIHandlers();

        // Initial display
        await displayRecipes();

        console.log('🎯 Excel-like recipe system ready!');
        return true;

    } catch (error) {
        console.error('❌ Recipe Architecture initialization failed:', error);

        // Fallback to emergency mode
        await initializeEmergencyMode();
        return false;
    }
}

/**
 * Setup global functions for UI integration
 */
function setupGlobalFunctions() {
    // Excel-like immediate add
    window.addRecipeExcel = async function(recipeData) {
        try {
            const addedRecipe = await recipeArchitecture.addRecipe(recipeData);
            await displayRecipes(); // Immediate refresh
            console.log(`✅ Recipe added immediately: ${addedRecipe.name}`);
            return addedRecipe;
        } catch (error) {
            console.error('❌ Failed to add recipe:', error);
            throw error;
        }
    };

    // Excel-like immediate edit
    window.editRecipeExcel = async function(id, recipeData) {
        try {
            const editedRecipe = await recipeArchitecture.editRecipe(id, recipeData);
            await displayRecipes(); // Immediate refresh
            console.log(`✅ Recipe edited immediately: ${editedRecipe.name}`);
            return editedRecipe;
        } catch (error) {
            console.error('❌ Failed to edit recipe:', error);
            throw error;
        }
    };

    // Excel-like immediate delete
    window.deleteRecipeExcel = async function(id) {
        try {
            const deletedRecipe = await recipeArchitecture.deleteRecipe(id);
            await displayRecipes(); // Immediate refresh
            console.log(`✅ Recipe deleted immediately: ${deletedRecipe}`);
            return deletedRecipe;
        } catch (error) {
            console.error('❌ Failed to delete recipe:', error);
            throw error;
        }
    };

    // Force refresh - Excel-like F5
    window.forceRefreshRecipes = async function() {
        try {
            const recipes = await recipeArchitecture.forceRefresh();
            await displayRecipes();
            console.log(`🔄 Forced refresh: ${recipes.length} recipes loaded`);
            return recipes;
        } catch (error) {
            console.error('❌ Force refresh failed:', error);
            throw error;
        }
    };

    // Get single recipe
    window.getRecipeExcel = async function(id) {
        try {
            return await recipeArchitecture.getRecipe(id);
        } catch (error) {
            console.error('❌ Failed to get recipe:', error);
            return null;
        }
    };

    // Get architecture status for debugging
    window.getArchitectureStatus = async function() {
        return await recipeArchitecture.getStatus();
    };
}

/**
 * Setup UI event handlers
 */
function setupUIHandlers() {
    // Override existing functions to use new architecture
    if (window.recipes && window.recipes.length) {
        console.log('📝 Migrating existing recipes to new architecture...');
        // Migration will happen automatically in the architecture
    }

    // Setup refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = window.forceRefreshRecipes;
        console.log('🔗 Refresh button connected to Excel-like system');
    }

    // Setup add recipe form if it exists
    const addForm = document.getElementById('addRecipeForm');
    if (addForm) {
        addForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            // Extract form data and call addRecipeExcel
            const formData = new FormData(addForm);
            const recipeData = Object.fromEntries(formData.entries());
            await window.addRecipeExcel(recipeData);
        });
        console.log('🔗 Add form connected to Excel-like system');
    }
}

/**
 * Display recipes using existing UI
 */
async function displayRecipes() {
    try {
        const recipes = await recipeArchitecture.getAllRecipes();

        // Update global recipes variable for compatibility
        window.recipes = recipes;

        // Convert to PETIT_RECIPE_DATA format for UI compatibility
        window.PETIT_RECIPE_DATA = recipes.map(recipe => ({
            id: recipe.id,
            title: recipe.name,
            servings: `${recipe.servings}人前`,
            cookTime: recipe.cookTime,
            ingredients: recipe.ingredients.map(ing => `${ing.name} ${ing.amount}${ing.unit}`),
            instructions: recipe.steps
        }));

        // Call existing display function if available
        if (window.app && window.app.renderRecipes) {
            window.app.renderRecipes();
        } else if (typeof window.displayRecipes === 'function') {
            window.displayRecipes();
        } else if (typeof window.renderRecipes === 'function') {
            window.renderRecipes();
        } else {
            // Fallback: trigger custom event
            document.dispatchEvent(new CustomEvent('recipesUpdated', {
                detail: { recipes, legacyData: window.PETIT_RECIPE_DATA }
            }));
        }

        console.log(`📊 Displayed ${recipes.length} recipes`);
        console.log(`🔄 Legacy format updated: ${window.PETIT_RECIPE_DATA.length} items`);
    } catch (error) {
        console.error('❌ Failed to display recipes:', error);
    }
}

/**
 * Emergency fallback mode
 */
async function initializeEmergencyMode() {
    console.log('🚨 Initializing emergency fallback mode...');

    try {
        // Try to load from original recipes.json
        const response = await fetch('./recipes.json');
        if (response.ok) {
            const data = await response.json();
            window.recipes = data.recipes || [];
            console.log(`⚠️ Emergency mode: loaded ${window.recipes.length} recipes from JSON`);
        } else {
            throw new Error('Cannot load recipes.json');
        }
    } catch (error) {
        // Absolute fallback
        window.recipes = [{
            id: "emergency-1",
            name: "システムエラー",
            servings: 1,
            cookTime: "5分",
            ingredients: [
                { name: "システム復旧が必要", amount: 1, unit: "回" }
            ],
            steps: [
                "アプリを再起動してください",
                "問題が続く場合は開発者にお知らせください"
            ]
        }];
        console.log('🚨 Absolute emergency mode activated');
    }

    // Basic functions for emergency mode
    window.forceRefreshRecipes = async function() {
        location.reload();
    };
}

/**
 * Auto-initialize when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRecipeArchitecture);
} else {
    // DOM already ready
    initializeRecipeArchitecture();
}

// Export for manual initialization
export { initializeRecipeArchitecture };
