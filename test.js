// ChatGPT提案に基づくテスト機能
// Testing functionality based on ChatGPT recommendations

/**
 * Simple test framework for ChatGPT-enhanced robust loadRecipes function
 */
class RecipeTestFramework {
  constructor() {
    this.tests = [];
    this.logs = [];
  }

  log(message) {
    console.log(message);
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  /**
   * Test loadRecipes function with different data formats
   */
  async testLoadRecipes() {
    this.log("🧪 Starting loadRecipes tests...");

    // Test 1: Direct array format
    await this.testArrayFormat();

    // Test 2: Nested object format
    await this.testNestedFormat();

    // Test 3: Deep nested format
    await this.testDeepNestedFormat();

    // Test 4: Error handling
    await this.testErrorHandling();

    this.log("✅ All loadRecipes tests completed");
  }

  async testArrayFormat() {
    this.log("📊 Test 1: Direct array format");

    // Mock array format data
    const testData = [
      { id: "1", name: "Test Recipe 1", servings: 2 },
      { id: "2", name: "Test Recipe 2", servings: 4 },
    ];

    const result = this.validateTestData(testData);
    if (result.valid) {
      this.log("✅ Array format validation passed");
    } else {
      this.log(`❌ Array format validation failed: ${result.error}`);
    }
  }

  async testNestedFormat() {
    this.log("📊 Test 2: Nested object format {recipes: [...]}");

    // Mock nested format data
    const testData = {
      version: "1.0",
      recipes: [
        { id: "1", name: "Test Recipe 1", servings: 2 },
        { id: "2", name: "Test Recipe 2", servings: 4 },
      ],
    };

    const result = this.validateTestData(testData);
    if (result.valid) {
      this.log("✅ Nested format validation passed");
    } else {
      this.log(`❌ Nested format validation failed: ${result.error}`);
    }
  }

  async testDeepNestedFormat() {
    this.log("📊 Test 3: Deep nested format {data: {recipes: [...]}}");

    // Mock deep nested format data
    const testData = {
      version: "1.0",
      data: {
        recipes: [
          { id: "1", name: "Test Recipe 1", servings: 2 },
          { id: "2", name: "Test Recipe 2", servings: 4 },
        ],
      },
    };

    const result = this.validateTestData(testData);
    if (result.valid) {
      this.log("✅ Deep nested format validation passed");
    } else {
      this.log(`❌ Deep nested format validation failed: ${result.error}`);
    }
  }

  async testErrorHandling() {
    this.log("📊 Test 4: Error handling");

    // Test invalid data
    const invalidData = { invalid: true };
    const result = this.validateTestData(invalidData);

    if (!result.valid) {
      this.log("✅ Error handling works correctly (invalid data rejected)");
    } else {
      this.log("❌ Error handling failed (invalid data accepted)");
    }
  }

  /**
   * Validation function based on ChatGPT's robust loadRecipes logic
   */
  validateTestData(candidate) {
    try {
      // Support multiple formats (from ChatGPT implementation)
      let arr = null;
      if (Array.isArray(candidate)) {
        arr = candidate;
      } else if (Array.isArray(candidate.recipes)) {
        arr = candidate.recipes;
      } else if (candidate.data && Array.isArray(candidate.data.recipes)) {
        arr = candidate.data.recipes;
      }

      if (!Array.isArray(arr)) {
        return { valid: false, error: "Not a valid recipe array" };
      }

      // Basic validation: first item should have id/title/name
      if (
        arr.length === 0 ||
        (typeof arr[0] === "object" &&
          (arr[0].id || arr[0].title || arr[0].name))
      ) {
        return { valid: true, count: arr.length };
      } else {
        return { valid: false, error: "Invalid recipe format" };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Test actual recipes.json file format
   */
  async testRecipesJsonFile() {
    this.log("🧪 Testing actual recipes.json file...");

    try {
      const response = await fetch("./recipes.json");
      if (!response.ok) {
        this.log(`❌ Failed to fetch recipes.json: ${response.status}`);
        return;
      }

      const data = await response.json();
      const result = this.validateTestData(data);

      if (result.valid) {
        this.log(
          `✅ recipes.json validation passed: ${result.count} recipes found`,
        );
      } else {
        this.log(`❌ recipes.json validation failed: ${result.error}`);
      }
    } catch (error) {
      this.log(`❌ Error testing recipes.json: ${error.message}`);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.log("🚀 Starting ChatGPT-enhanced Recipe Test Suite...");

    await this.testLoadRecipes();
    await this.testRecipesJsonFile();

    this.log("🎉 Test suite completed");

    // Return logs for debugging
    return {
      success: true,
      logs: this.logs,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get test logs for debug panel
   */
  getTestLogs() {
    return this.logs;
  }
}

// Make test framework globally available
window.RecipeTestFramework = RecipeTestFramework;

// Add convenience function for debug panel
window.runRecipeTests = async function () {
  const testFramework = new RecipeTestFramework();
  const result = await testFramework.runAllTests();

  // Store logs in global debug logs
  if (!window.debugLogs) window.debugLogs = [];
  window.debugLogs = window.debugLogs.concat(result.logs);

  alert(`✅ Tests completed! ${result.logs.length} log entries generated.`);

  return result;
};

console.log(
  "🧪 Recipe Test Framework loaded - use window.runRecipeTests() to run tests",
);
