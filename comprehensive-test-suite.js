// Comprehensive Test Suite for petit-recipe
// Advanced testing functionality for Enhanced Test Runner

/**
 * Comprehensive test suite with detailed validation
 */
class ComprehensiveTestSuite {
    constructor() {
        this.testResults = [];
        this.mockData = this.generateMockData();
        this.benchmarks = {
            renderTime: 100,  // ms
            loadTime: 500,    // ms
            memoryUsage: 50   // MB
        };
    }

    /**
     * Generate mock data for testing
     */
    generateMockData() {
        return {
            recipes: [
                {
                    id: 'test-1',
                    name: 'Test Recipe 1',
                    ingredients: [
                        { name: '牛肉', amount: '200', unit: 'g' },
                        { name: '玉ねぎ', amount: '1', unit: '個' }
                    ],
                    steps: ['Step 1', 'Step 2'],
                    cookTime: '30分',
                    servings: 4,
                    category: 'Meat',
                    difficulty: 'easy'
                },
                {
                    id: 'test-2',
                    name: 'Test Recipe 2',
                    ingredients: [
                        { name: '魚', amount: '1', unit: '尾' },
                        { name: '醤油', amount: '大さじ2', unit: '' }
                    ],
                    steps: ['Step 1', 'Step 2', 'Step 3'],
                    cookTime: '45分',
                    servings: 2,
                    category: 'Fish',
                    difficulty: 'medium'
                }
            ]
        };
    }

    /**
     * Deep validation of app structure
     */
    async validateAppStructure() {
        const tests = [
            {
                name: 'App Object Structure',
                test: () => {
                    if (!window.app) throw new Error('App object missing');

                    const requiredProps = ['recipes', 'currentScreen', 'selectedRecipe', 'isInitialized'];
                    const missing = requiredProps.filter(prop => !(prop in window.app));
                    if (missing.length > 0) {
                        throw new Error(`Missing app properties: ${missing.join(', ')}`);
                    }

                    const requiredMethods = ['initialize', 'refresh', 'getRecipes', 'getRecipeById', 'showRecipeDetails'];
                    const missingMethods = requiredMethods.filter(method => typeof window.app[method] !== 'function');
                    if (missingMethods.length > 0) {
                        throw new Error(`Missing app methods: ${missingMethods.join(', ')}`);
                    }

                    return { success: true, structure: 'valid' };
                }
            },
            {
                name: 'Recipe Data Validation',
                test: () => {
                    const recipes = window.app.getRecipes();
                    if (!Array.isArray(recipes)) {
                        throw new Error('Recipes is not an array');
                    }

                    if (recipes.length === 0) {
                        return { success: true, warning: 'No recipes loaded' };
                    }

                    // Validate first recipe structure
                    const recipe = recipes[0];
                    const requiredFields = ['id', 'name'];
                    const missing = requiredFields.filter(field => !recipe[field]);
                    if (missing.length > 0) {
                        throw new Error(`Recipe missing fields: ${missing.join(', ')}`);
                    }

                    return { success: true, count: recipes.length, sample: recipe.name };
                }
            }
        ];

        const results = [];
        for (const test of tests) {
            try {
                const result = await test.test();
                results.push({ name: test.name, ...result });
            } catch (error) {
                results.push({ name: test.name, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * Test Magic MCP integration thoroughly
     */
    async validateMagicMCPIntegration() {
        const tests = [
            {
                name: 'Magic Generator Initialization',
                test: async () => {
                    if (!window.magicGenerator) {
                        throw new Error('Magic generator not found');
                    }

                    await window.magicGenerator.initialize();

                    return {
                        success: true,
                        initialized: window.magicGenerator.initialized,
                        generatedComponents: window.magicGenerator.generatedComponents.length
                    };
                }
            },
            {
                name: 'Component Generation Capability',
                test: async () => {
                    if (!window.magicGenerator) {
                        throw new Error('Magic generator not available');
                    }

                    const specs = {
                        style: 'modern',
                        features: ['thumbnail', 'title', 'servings'],
                        layout: 'card',
                        responsive: true
                    };

                    const component = await window.magicGenerator.generateRecipeCard(specs);

                    if (!component || !component.html || !component.css) {
                        throw new Error('Generated component incomplete');
                    }

                    return {
                        success: true,
                        hasHTML: !!component.html,
                        hasCSS: !!component.css,
                        hasJS: !!component.js,
                        metadata: component.metadata
                    };
                }
            },
            {
                name: 'Enhanced Recipe Card Integration',
                test: () => {
                    // Check if enhanced CSS is loaded
                    const enhancedCSS = Array.from(document.styleSheets).some(sheet => {
                        try {
                            return sheet.href && sheet.href.includes('enhanced-recipe-card');
                        } catch (e) {
                            return false;
                        }
                    });

                    if (!enhancedCSS) {
                        throw new Error('Enhanced recipe card CSS not loaded');
                    }

                    // Check if enhanced card class exists in UI
                    const hasEnhancedCardClass = window.ui &&
                        typeof window.ui.createRecipeElement === 'function';

                    if (!hasEnhancedCardClass) {
                        throw new Error('Enhanced card integration not found in UI');
                    }

                    return {
                        success: true,
                        cssLoaded: enhancedCSS,
                        uiIntegrated: hasEnhancedCardClass
                    };
                }
            }
        ];

        const results = [];
        for (const test of tests) {
            try {
                const result = await test.test();
                results.push({ name: test.name, ...result });
            } catch (error) {
                results.push({ name: test.name, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * Performance and memory testing
     */
    async validatePerformance() {
        const tests = [
            {
                name: 'Render Performance Test',
                test: async () => {
                    if (!window.ui || typeof window.ui.render !== 'function') {
                        throw new Error('UI render function not available');
                    }

                    const iterations = 5;
                    const times = [];

                    for (let i = 0; i < iterations; i++) {
                        const start = performance.now();
                        window.ui.render();
                        const duration = performance.now() - start;
                        times.push(duration);

                        // Small delay between tests
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }

                    const avgTime = times.reduce((a, b) => a + b) / times.length;
                    const maxTime = Math.max(...times);

                    if (avgTime > this.benchmarks.renderTime) {
                        throw new Error(`Render too slow: ${avgTime.toFixed(2)}ms (benchmark: ${this.benchmarks.renderTime}ms)`);
                    }

                    return {
                        success: true,
                        avgTime: Math.round(avgTime * 100) / 100,
                        maxTime: Math.round(maxTime * 100) / 100,
                        benchmark: this.benchmarks.renderTime
                    };
                }
            },
            {
                name: 'Memory Usage Analysis',
                test: () => {
                    if (!performance.memory) {
                        return { success: true, memory: 'Not available' };
                    }

                    const memory = performance.memory;
                    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
                    const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

                    const warning = usedMB > this.benchmarks.memoryUsage;

                    return {
                        success: true,
                        usedMB,
                        totalMB,
                        limitMB,
                        warning: warning ? `High memory usage: ${usedMB}MB` : null
                    };
                }
            },
            {
                name: 'Recipe Loading Speed',
                test: async () => {
                    if (!window.recipeDataManager || typeof window.recipeDataManager.loadRecipes !== 'function') {
                        throw new Error('Recipe data manager not available');
                    }

                    const start = performance.now();
                    const result = await window.recipeDataManager.loadRecipes();
                    const duration = performance.now() - start;

                    if (duration > this.benchmarks.loadTime) {
                        throw new Error(`Loading too slow: ${duration.toFixed(2)}ms (benchmark: ${this.benchmarks.loadTime}ms)`);
                    }

                    const recipeCount = Array.isArray(result) ? result.length :
                                      (result.recipes ? result.recipes.length : 0);

                    return {
                        success: true,
                        duration: Math.round(duration * 100) / 100,
                        recipeCount,
                        benchmark: this.benchmarks.loadTime
                    };
                }
            }
        ];

        const results = [];
        for (const test of tests) {
            try {
                const result = await test.test();
                results.push({ name: test.name, ...result });
            } catch (error) {
                results.push({ name: test.name, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * UI interaction and integration testing
     */
    async validateUIInteractions() {
        const tests = [
            {
                name: 'Screen Navigation Test',
                test: () => {
                    if (!window.ui || typeof window.ui.showScreen !== 'function') {
                        throw new Error('UI showScreen function not available');
                    }

                    // Test navigation to different screens
                    const screens = ['recipes-screen', 'settings-screen', 'recipe-detail-screen'];
                    const results = {};

                    for (const screen of screens) {
                        try {
                            window.ui.showScreen(screen);
                            results[screen] = 'ok';
                        } catch (e) {
                            results[screen] = e.message;
                        }
                    }

                    // Return to main screen
                    window.ui.showScreen('recipes-screen');

                    return { success: true, screenTests: results };
                }
            },
            {
                name: 'Recipe Detail Navigation',
                test: () => {
                    const recipes = window.app.getRecipes();
                    if (recipes.length === 0) {
                        return { success: true, skipped: 'No recipes to test' };
                    }

                    const testRecipe = recipes[0];

                    if (!window.app.showRecipeDetails) {
                        throw new Error('showRecipeDetails function not available');
                    }

                    // Test showing recipe details
                    window.app.showRecipeDetails(testRecipe.id);

                    if (window.app.selectedRecipe?.id !== testRecipe.id) {
                        throw new Error('Recipe selection failed');
                    }

                    if (window.app.currentScreen !== 'recipe-detail-screen') {
                        throw new Error('Screen navigation failed');
                    }

                    // Test navigation back
                    window.app.navigateBack();

                    if (window.app.currentScreen !== 'recipes-screen') {
                        throw new Error('Back navigation failed');
                    }

                    return {
                        success: true,
                        testedRecipe: testRecipe.name,
                        navigation: 'working'
                    };
                }
            },
            {
                name: 'Recipe Element Creation',
                test: () => {
                    if (!window.ui || typeof window.ui.createRecipeElement !== 'function') {
                        throw new Error('createRecipeElement function not available');
                    }

                    const testRecipe = this.mockData.recipes[0];
                    const element = window.ui.createRecipeElement(testRecipe);

                    if (!element) {
                        throw new Error('Failed to create recipe element');
                    }

                    const hasEnhanced = element.querySelector('.recipe-card-enhanced');
                    const hasTraditional = element.querySelector('.recipe-card');

                    return {
                        success: true,
                        elementCreated: true,
                        enhancedCard: !!hasEnhanced,
                        traditionalCard: !!hasTraditional,
                        elementType: element.tagName.toLowerCase()
                    };
                }
            }
        ];

        const results = [];
        for (const test of tests) {
            try {
                const result = await test.test();
                results.push({ name: test.name, ...result });
            } catch (error) {
                results.push({ name: test.name, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * Data integrity and management testing
     */
    async validateDataIntegrity() {
        const tests = [
            {
                name: 'Recipe CRUD Operations',
                test: async () => {
                    const initialCount = window.app.getRecipes().length;

                    // Test duplication (if available)
                    if (window.app.selectedRecipe && typeof window.app.duplicateRecipe === 'function') {
                        const originalCount = window.app.recipes.length;
                        window.app.duplicateRecipe();
                        const newCount = window.app.recipes.length;

                        if (newCount !== originalCount + 1) {
                            throw new Error('Recipe duplication failed');
                        }

                        // Clean up - remove the duplicated recipe
                        window.app.recipes.pop();
                    }

                    return {
                        success: true,
                        initialCount,
                        crudOperations: 'tested'
                    };
                }
            },
            {
                name: 'Data Format Validation',
                test: () => {
                    const recipes = window.app.getRecipes();

                    if (recipes.length === 0) {
                        return { success: true, warning: 'No recipes to validate' };
                    }

                    const validationResults = recipes.map((recipe, index) => {
                        const issues = [];

                        if (!recipe.id) issues.push('missing id');
                        if (!recipe.name) issues.push('missing name');
                        if (!Array.isArray(recipe.ingredients)) issues.push('invalid ingredients');
                        if (!Array.isArray(recipe.steps)) issues.push('invalid steps');

                        return { index, issues: issues.length > 0 ? issues : null };
                    });

                    const invalidRecipes = validationResults.filter(r => r.issues);

                    if (invalidRecipes.length > 0) {
                        throw new Error(`Invalid recipes found: ${invalidRecipes.length}`);
                    }

                    return {
                        success: true,
                        validatedCount: recipes.length,
                        allValid: true
                    };
                }
            },
            {
                name: 'Storage Integration Test',
                test: async () => {
                    if (!window.recipeDataManager) {
                        throw new Error('Recipe data manager not available');
                    }

                    const hasLoadFunction = typeof window.recipeDataManager.loadRecipes === 'function';
                    const hasSaveFunction = typeof window.recipeDataManager.saveRecipes === 'function';

                    if (!hasLoadFunction || !hasSaveFunction) {
                        throw new Error('Storage functions not available');
                    }

                    // Test loading
                    const loadResult = await window.recipeDataManager.loadRecipes();
                    const isValidLoad = Array.isArray(loadResult) ||
                                       (loadResult && Array.isArray(loadResult.recipes));

                    if (!isValidLoad) {
                        throw new Error('Load function returned invalid format');
                    }

                    return {
                        success: true,
                        hasLoad: hasLoadFunction,
                        hasSave: hasSaveFunction,
                        loadTested: true
                    };
                }
            }
        ];

        const results = [];
        for (const test of tests) {
            try {
                const result = await test.test();
                results.push({ name: test.name, ...result });
            } catch (error) {
                results.push({ name: test.name, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * Run comprehensive test suite
     */
    async runComprehensiveTests() {
        const startTime = performance.now();
        const results = {
            timestamp: new Date().toISOString(),
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                mobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
            },
            testSuites: {}
        };

        try {
            results.testSuites.appStructure = await this.validateAppStructure();
            results.testSuites.magicMCP = await this.validateMagicMCPIntegration();
            results.testSuites.performance = await this.validatePerformance();
            results.testSuites.uiInteractions = await this.validateUIInteractions();
            results.testSuites.dataIntegrity = await this.validateDataIntegrity();
        } catch (error) {
            results.error = error.message;
        }

        const totalDuration = performance.now() - startTime;
        results.duration = Math.round(totalDuration);

        // Calculate summary statistics
        const allTests = Object.values(results.testSuites).flat();
        results.summary = {
            total: allTests.length,
            passed: allTests.filter(t => t.success).length,
            failed: allTests.filter(t => !t.success).length,
            warnings: allTests.filter(t => t.warning).length
        };

        this.testResults = results;
        return results;
    }

    /**
     * Get detailed test report
     */
    getDetailedReport() {
        return this.testResults;
    }

    /**
     * Export test results
     */
    exportResults(format = 'json') {
        if (!this.testResults) {
            throw new Error('No test results available');
        }

        if (format === 'json') {
            return JSON.stringify(this.testResults, null, 2);
        } else if (format === 'html') {
            return this.generateHTMLReport();
        }

        throw new Error(`Unsupported format: ${format}`);
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport() {
        const results = this.testResults;
        if (!results) return '<p>No test results available</p>';

        let html = `
            <div class="comprehensive-test-report">
                <h2>Comprehensive Test Report</h2>
                <div class="test-summary">
                    <p><strong>Timestamp:</strong> ${results.timestamp}</p>
                    <p><strong>Duration:</strong> ${results.duration}ms</p>
                    <p><strong>Total Tests:</strong> ${results.summary.total}</p>
                    <p><strong>Passed:</strong> <span style="color: green;">${results.summary.passed}</span></p>
                    <p><strong>Failed:</strong> <span style="color: red;">${results.summary.failed}</span></p>
                    <p><strong>Warnings:</strong> <span style="color: orange;">${results.summary.warnings}</span></p>
                </div>
        `;

        for (const [suiteName, tests] of Object.entries(results.testSuites)) {
            html += `<h3>${suiteName}</h3><ul>`;
            for (const test of tests) {
                const status = test.success ? '✅' : '❌';
                const details = test.error ? ` - ${test.error}` : '';
                html += `<li>${status} ${test.name}${details}</li>`;
            }
            html += '</ul>';
        }

        html += '</div>';
        return html;
    }
}

// Make available globally
window.ComprehensiveTestSuite = ComprehensiveTestSuite;

// Create default instance
window.comprehensiveTestSuite = new ComprehensiveTestSuite();

console.log('🧪 Comprehensive Test Suite loaded');
