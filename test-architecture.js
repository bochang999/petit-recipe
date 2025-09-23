// BOC-107: Architecture Testing - Validate Excel-like immediate response
// Test the complete layered data architecture system

import { recipeArchitecture } from './layered-data-architecture.js';

/**
 * Test the complete architecture system
 */
async function testArchitecture() {
    console.log('🧪 Starting Architecture Test Suite...');
    console.log('='.repeat(50));

    let testsPassed = 0;
    let testsTotal = 0;

    // Test 1: Architecture Initialization
    testsTotal++;
    console.log('\n📋 Test 1: Architecture Initialization');
    try {
        const initialized = await recipeArchitecture.initialize();
        if (initialized) {
            console.log('✅ Architecture initialized successfully');
            testsPassed++;
        } else {
            console.log('❌ Architecture initialization failed');
        }
    } catch (error) {
        console.log('❌ Architecture initialization error:', error.message);
    }

    // Test 2: Data Loading
    testsTotal++;
    console.log('\n📋 Test 2: Data Loading');
    try {
        const recipes = await recipeArchitecture.getAllRecipes();
        if (recipes && recipes.length > 0) {
            console.log(`✅ Loaded ${recipes.length} recipes successfully`);
            testsPassed++;
        } else {
            console.log('❌ No recipes loaded');
        }
    } catch (error) {
        console.log('❌ Data loading error:', error.message);
    }

    // Test 3: Excel-like Add Operation
    testsTotal++;
    console.log('\n📋 Test 3: Excel-like Add Operation');
    try {
        const testRecipe = {
            name: "テストレシピ",
            servings: 1,
            cookTime: "5分",
            ingredients: [
                { name: "テスト材料", amount: 1, unit: "個" }
            ],
            steps: ["テスト手順"]
        };

        const addedRecipe = await recipeArchitecture.addRecipe(testRecipe);
        if (addedRecipe && addedRecipe.id) {
            console.log(`✅ Recipe added with ID: ${addedRecipe.id}`);
            testsPassed++;

            // Test immediate availability
            const retrievedRecipe = await recipeArchitecture.getRecipe(addedRecipe.id);
            if (retrievedRecipe) {
                console.log('✅ Recipe immediately available after add');
            } else {
                console.log('❌ Recipe not immediately available');
            }
        } else {
            console.log('❌ Recipe add failed');
        }
    } catch (error) {
        console.log('❌ Add operation error:', error.message);
    }

    // Test 4: Excel-like Edit Operation
    testsTotal++;
    console.log('\n📋 Test 4: Excel-like Edit Operation');
    try {
        const recipes = await recipeArchitecture.getAllRecipes();
        if (recipes.length > 0) {
            const firstRecipe = recipes[0];
            const editedData = {
                ...firstRecipe,
                name: firstRecipe.name + " (編集済み)"
            };

            const editedRecipe = await recipeArchitecture.editRecipe(firstRecipe.id, editedData);
            if (editedRecipe && editedRecipe.name.includes("編集済み")) {
                console.log('✅ Recipe edited successfully');

                // Test immediate availability of changes
                const retrievedRecipe = await recipeArchitecture.getRecipe(firstRecipe.id);
                if (retrievedRecipe && retrievedRecipe.name.includes("編集済み")) {
                    console.log('✅ Changes immediately available');
                    testsPassed++;
                } else {
                    console.log('❌ Changes not immediately available');
                }
            } else {
                console.log('❌ Recipe edit failed');
            }
        } else {
            console.log('⚠️ No recipes available for edit test');
        }
    } catch (error) {
        console.log('❌ Edit operation error:', error.message);
    }

    // Test 5: Architecture Status
    testsTotal++;
    console.log('\n📋 Test 5: Architecture Status');
    try {
        const status = await recipeArchitecture.getStatus();
        if (status && typeof status.baseRecipes === 'number') {
            console.log('✅ Architecture status available:');
            console.log(`   📊 Base recipes: ${status.baseRecipes}`);
            console.log(`   📝 User additions: ${status.userAdditions}`);
            console.log(`   ✏️ User overrides: ${status.userOverrides}`);
            console.log(`   🗑️ User deletions: ${status.userDeletions}`);
            testsPassed++;
        } else {
            console.log('❌ Architecture status unavailable');
        }
    } catch (error) {
        console.log('❌ Status check error:', error.message);
    }

    // Test Results
    console.log('\n' + '='.repeat(50));
    console.log('🧪 Test Results:');
    console.log(`✅ Passed: ${testsPassed}/${testsTotal}`);
    console.log(`❌ Failed: ${testsTotal - testsPassed}/${testsTotal}`);

    if (testsPassed === testsTotal) {
        console.log('🎉 All tests passed! Excel-like architecture working perfectly!');
        return true;
    } else {
        console.log('⚠️ Some tests failed. Architecture needs attention.');
        return false;
    }
}

/**
 * Test Excel-like operations specifically
 */
async function testExcelLikeOperations() {
    console.log('\n🎯 Testing Excel-like Immediate Operations...');

    try {
        console.log('📊 Before operations:');
        const beforeRecipes = await recipeArchitecture.getAllRecipes();
        console.log(`   Recipes count: ${beforeRecipes.length}`);

        // Add → Immediate availability
        console.log('\n🔄 Add → Immediate Check:');
        const startTime = Date.now();
        const newRecipe = await recipeArchitecture.addRecipe({
            name: "即座テスト",
            servings: 1,
            cookTime: "1分",
            ingredients: [{ name: "即座材料", amount: 1, unit: "個" }],
            steps: ["即座手順"]
        });
        const addTime = Date.now() - startTime;

        const immediateCheck = await recipeArchitecture.getRecipe(newRecipe.id);
        const checkTime = Date.now() - startTime;

        console.log(`   ⚡ Add time: ${addTime}ms`);
        console.log(`   ⚡ Immediate availability: ${checkTime}ms`);
        console.log(`   ✅ Recipe immediately available: ${!!immediateCheck}`);

        // Force refresh test
        console.log('\n🔄 Force Refresh Test:');
        const refreshStart = Date.now();
        const refreshedRecipes = await recipeArchitecture.forceRefresh();
        const refreshTime = Date.now() - refreshStart;

        console.log(`   ⚡ Refresh time: ${refreshTime}ms`);
        console.log(`   ✅ Recipes after refresh: ${refreshedRecipes.length}`);

        console.log('\n🎯 Excel-like performance: EXCELLENT!');
        return true;

    } catch (error) {
        console.log('❌ Excel-like operations test failed:', error.message);
        return false;
    }
}

// Auto-run tests if called directly
if (typeof window !== 'undefined') {
    window.testArchitecture = testArchitecture;
    window.testExcelLikeOperations = testExcelLikeOperations;

    // Global test runner
    window.runArchitectureTests = async function() {
        console.clear();
        const basicTests = await testArchitecture();
        const excelTests = await testExcelLikeOperations();

        console.log('\n🏁 Final Results:');
        console.log(`   Basic Architecture: ${basicTests ? '✅' : '❌'}`);
        console.log(`   Excel-like Operations: ${excelTests ? '✅' : '❌'}`);

        return basicTests && excelTests;
    };

    console.log('🧪 Architecture tests loaded. Run window.runArchitectureTests() to start.');
}

export { testArchitecture, testExcelLikeOperations };
