// Recipe Addition Helper - 実際のレシピ追加用ヘルパー関数

/**
 * 実際のレシピを追加するヘルパー関数
 * recipes.jsonに直接追加します
 */
window.addRealRecipe = async function(recipeData) {
    try {
        console.log('🍳 Adding real recipe:', recipeData.name);

        // 現在のrecipes.jsonを読み込み
        const response = await fetch('./recipes.json');
        const data = await response.json();

        // 新しいIDを生成
        const maxId = data.recipes.length > 0
            ? Math.max(...data.recipes.map(r => parseInt(r.id) || 0))
            : 0;
        const newId = (maxId + 1).toString();

        // レシピデータを標準化
        const standardizedRecipe = {
            id: newId,
            name: recipeData.name || 'New Recipe',
            servings: recipeData.servings || 1,
            cookTime: recipeData.cookTime || '30分',
            ingredients: recipeData.ingredients || [],
            steps: recipeData.steps || []
        };

        // recipes.jsonに追加
        data.recipes.push(standardizedRecipe);
        data.lastUpdated = new Date().toISOString();

        // 注意: 実際の環境では、サーバー側でJSONファイルを更新する必要があります
        console.log('📝 Recipe data prepared:', standardizedRecipe);
        console.log('📄 Updated recipes.json data:', data);
        console.log('⚠️ Note: In production, this needs server-side file update');

        return standardizedRecipe;
    } catch (error) {
        console.error('❌ Failed to add real recipe:', error);
        throw error;
    }
};

/**
 * レシピ追加のテスト用サンプル
 */
window.addSampleRecipe = async function() {
    const sampleRecipe = {
        name: "簡単オムレツ",
        servings: 2,
        cookTime: "10分",
        ingredients: [
            { name: "卵", amount: 3, unit: "個" },
            { name: "牛乳", amount: 30, unit: "ml" },
            { name: "バター", amount: 10, unit: "g" },
            { name: "塩", amount: 1, unit: "つまみ" }
        ],
        steps: [
            "卵をボウルに割り入れ、牛乳と塩を加えてよく混ぜる",
            "フライパンにバターを熱し、卵液を流し入れる",
            "半熟状態で火を止め、半分に折りたたんで完成"
        ]
    };

    return await window.addRealRecipe(sampleRecipe);
};

/**
 * layered-data-architectureとの統合テスト
 */
window.testRecipeArchitecture = async function() {
    console.log('🧪 Testing recipe architecture with empty data...');

    try {
        if (window.recipeArchitecture) {
            // アーキテクチャ状態確認
            const status = await window.recipeArchitecture.getStatus();
            console.log('📊 Architecture Status:', status);

            // 空のレシピリストロード確認
            const recipes = await window.recipeArchitecture.getAllRecipes();
            console.log(`📝 Current recipes count: ${recipes.length}`);

            if (recipes.length === 0) {
                console.log('✅ Empty recipe list handling working correctly');
            }

        } else {
            console.log('❌ Recipe architecture not available');
        }
    } catch (error) {
        console.error('❌ Architecture test failed:', error);
    }
};

console.log('🔧 Recipe addition helper loaded');
console.log('📝 Available functions:');
console.log('  - addRealRecipe(recipeData) - Add a real recipe');
console.log('  - addSampleRecipe() - Add a sample omelet recipe');
console.log('  - testRecipeArchitecture() - Test current architecture status');
