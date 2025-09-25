// BOC-107: Local Recipe UI Integration - Excel-like immediate operations
// Connect existing UI to new local file system

/**
 * Excel-like recipe addition - immediate save and display
 */
window.addRecipeToLocal = async function (recipeData) {
  try {
    console.log("💾 Adding recipe to local storage...");

    // Convert UI format to storage format
    const recipe = {
      name: recipeData.name || recipeData.title,
      servings: parseInt(recipeData.servings) || 1,
      cookTime: recipeData.cookTime || "30分",
      ingredients: recipeData.ingredients || [],
      steps: recipeData.steps || recipeData.instructions || [],
    };

    // Ensure ingredients are in correct format
    if (
      recipe.ingredients.length > 0 &&
      typeof recipe.ingredients[0] === "string"
    ) {
      // Convert string format to object format
      recipe.ingredients = recipe.ingredients.map((ing) => {
        const match = ing.match(
          /^(.+?)\\s+(\\d+(?:\\.\\d+)?)\\s*([^\\d\\s]+)$/,
        );
        if (match) {
          return {
            name: match[1].trim(),
            amount: parseFloat(match[2]),
            unit: match[3].trim(),
          };
        }
        return {
          name: ing.trim(),
          amount: 1,
          unit: "個",
        };
      });
    }

    // Add to local storage
    const addedRecipe = await window.localRecipeManager.addRecipe(recipe);

    // Immediate UI refresh - Excel-like
    await window.forceRefreshLocalRecipes();

    console.log(
      `✅ Recipe added locally: ${addedRecipe.name} (ID: ${addedRecipe.id})`,
    );
    return addedRecipe;
  } catch (error) {
    console.error("❌ Failed to add recipe locally:", error);
    throw error;
  }
};

/**
 * Excel-like recipe editing - immediate update and display
 */
window.updateRecipeInLocal = async function (recipeId, recipeData) {
  try {
    console.log(`💾 Updating recipe ${recipeId} in local storage...`);

    const recipe = {
      name: recipeData.name || recipeData.title,
      servings: parseInt(recipeData.servings) || 1,
      cookTime: recipeData.cookTime || "30分",
      ingredients: recipeData.ingredients || [],
      steps: recipeData.steps || recipeData.instructions || [],
    };

    // Ensure ingredients format
    if (
      recipe.ingredients.length > 0 &&
      typeof recipe.ingredients[0] === "string"
    ) {
      recipe.ingredients = recipe.ingredients.map((ing) => {
        const match = ing.match(
          /^(.+?)\\s+(\\d+(?:\\.\\d+)?)\\s*([^\\d\\s]+)$/,
        );
        if (match) {
          return {
            name: match[1].trim(),
            amount: parseFloat(match[2]),
            unit: match[3].trim(),
          };
        }
        return {
          name: ing.trim(),
          amount: 1,
          unit: "個",
        };
      });
    }

    // Update in local storage
    const updatedRecipe = await window.localRecipeManager.updateRecipe(
      recipeId,
      recipe,
    );

    // Immediate UI refresh
    await window.forceRefreshLocalRecipes();

    console.log(`✅ Recipe updated locally: ${updatedRecipe.name}`);
    return updatedRecipe;
  } catch (error) {
    console.error("❌ Failed to update recipe locally:", error);
    throw error;
  }
};

/**
 * Excel-like recipe deletion - immediate remove and display
 */
window.deleteRecipeFromLocal = async function (recipeId) {
  try {
    console.log(`🗑️ Deleting recipe ${recipeId} from local storage...`);

    // Delete from local storage
    const deletedRecipe =
      await window.localRecipeManager.deleteRecipe(recipeId);

    // Immediate UI refresh
    await window.forceRefreshLocalRecipes();

    console.log(`✅ Recipe deleted locally: ${deletedRecipe.name}`);
    return deletedRecipe;
  } catch (error) {
    console.error("❌ Failed to delete recipe locally:", error);
    throw error;
  }
};

/**
 * Quick recipe lookup - immediate access
 */
window.getLocalRecipeById = async function (recipeId) {
  try {
    const recipe = await window.localRecipeManager.getRecipeById(recipeId);
    return recipe;
  } catch (error) {
    console.error("❌ Failed to get recipe locally:", error);
    return null;
  }
};

/**
 * Excel-like bulk operations
 */
window.importRecipesToLocal = async function (recipes) {
  try {
    console.log(`📥 Importing ${recipes.length} recipes to local storage...`);

    for (const recipe of recipes) {
      await window.localRecipeManager.addRecipe(recipe);
    }

    // Refresh UI after bulk import
    await window.forceRefreshLocalRecipes();

    console.log(`✅ Imported ${recipes.length} recipes locally`);
  } catch (error) {
    console.error("❌ Failed to import recipes locally:", error);
    throw error;
  }
};

/**
 * Export local recipes - for backup/sharing
 */
window.exportLocalRecipes = async function () {
  try {
    const recipes = await window.localRecipeManager.getAllRecipes();

    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      totalRecipes: recipes.length,
      recipes: recipes,
    };

    return exportData;
  } catch (error) {
    console.error("❌ Failed to export local recipes:", error);
    throw error;
  }
};

// Override existing functions to use local storage
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔗 Connecting UI to local recipe system...");

  // Override recipe addition if the function exists
  if (window.app && window.app.addRecipe) {
    const originalAddRecipe = window.app.addRecipe;
    window.app.addRecipe = async function (recipeData) {
      try {
        // Use local storage instead of embedded data
        const result = await window.addRecipeToLocal(recipeData);
        console.log("✅ Recipe added via local system");
        return result;
      } catch (error) {
        console.log("⚠️ Local add failed, trying original method");
        return originalAddRecipe.call(this, recipeData);
      }
    };
  }

  console.log("✅ UI connected to local recipe system");
});
