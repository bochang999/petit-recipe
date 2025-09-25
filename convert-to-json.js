// BOC-108: Convert recipes-data.js to recipes.json
// Converts legacy JavaScript data structure to loadable JSON format

function parseIngredients(ingredientsArray) {
  return ingredientsArray.map(ingredient => {
    const match = ingredient.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*([^\d\s]+)$/);
    if (match) {
      return {
        name: match[1].trim(),
        amount: parseFloat(match[2]),
        unit: match[3].trim()
      };
    }

    const matchNoAmount = ingredient.match(/^(.+?)\s+([^\d\s]+)$/);
    if (matchNoAmount) {
      return {
        name: matchNoAmount[1].trim(),
        amount: 1,
        unit: matchNoAmount[2].trim()
      };
    }

    return {
      name: ingredient.trim(),
      amount: 1,
      unit: "個"
    };
  });
}

function convertLegacyToJSON() {
  if (typeof window === 'undefined' || !window.PETIT_RECIPE_DATA) {
    console.error('window.PETIT_RECIPE_DATA not found');
    return null;
  }

  const converted = window.PETIT_RECIPE_DATA.map(recipe => {
    const servingsMatch = recipe.servings.match(/(\d+)/);
    const servingsNumber = servingsMatch ? parseInt(servingsMatch[1]) : 4;

    return {
      id: recipe.id,
      name: recipe.title,
      servings: servingsNumber,
      cookTime: recipe.cookTime || "30分",
      ingredients: parseIngredients(recipe.ingredients),
      steps: recipe.instructions
    };
  });

  return {
    version: "1.0",
    lastUpdated: new Date().toISOString(),
    recipes: converted
  };
}

function validateRecipeData(data) {
  if (!data || !data.recipes || !Array.isArray(data.recipes)) {
    return { valid: false, error: "Invalid recipes array" };
  }

  for (let i = 0; i < data.recipes.length; i++) {
    const recipe = data.recipes[i];

    if (!recipe.id || !recipe.name) {
      return { valid: false, error: `Recipe ${i + 1}: Missing id or name` };
    }

    if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      return { valid: false, error: `Recipe ${recipe.name}: Missing ingredients` };
    }

    if (!recipe.steps || !Array.isArray(recipe.steps) || recipe.steps.length === 0) {
      return { valid: false, error: `Recipe ${recipe.name}: Missing steps` };
    }

    for (let ingredient of recipe.ingredients) {
      if (!ingredient.name || typeof ingredient.amount !== 'number' || !ingredient.unit) {
        return { valid: false, error: `Recipe ${recipe.name}: Invalid ingredient format` };
      }
    }
  }

  return { valid: true, totalRecipes: data.recipes.length };
}

// Export for Node.js environment if available
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { convertLegacyToJSON, validateRecipeData, parseIngredients };
}

console.log('Recipe conversion script loaded. Use convertLegacyToJSON() to convert data.');
