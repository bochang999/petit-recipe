// Emergency App Object - Essential UI Functions
// Missing window.app object causing all button failures

window.app = {
    // Navigation functions
    showSettings() {
        console.log('⚙️ Settings screen requested');
        const recipeScreen = document.getElementById('recipes-screen');
        const settingsScreen = document.getElementById('settings-screen');

        if (recipeScreen) recipeScreen.classList.remove('active');
        if (settingsScreen) settingsScreen.classList.add('active');
    },

    navigateBack() {
        console.log('← Navigate back requested');
        const settingsScreen = document.getElementById('settings-screen');
        const recipeScreen = document.getElementById('recipes-screen');

        if (settingsScreen) settingsScreen.classList.remove('active');
        if (recipeScreen) recipeScreen.classList.add('active');
    },

    // Delete confirmation functions
    cancelDeleteRecipe() {
        console.log('🚫 Delete cancelled');
        const deleteModal = document.getElementById('delete-modal');
        if (deleteModal) {
            deleteModal.style.display = 'none';
        }
    },

    executeDeleteRecipe() {
        console.log('🗑️ Execute delete requested');
        // Basic implementation - should be enhanced with actual deletion logic
        const deleteModal = document.getElementById('delete-modal');
        if (deleteModal) {
            deleteModal.style.display = 'none';
        }
        alert('削除機能は現在準備中です');
    },

    // Data management functions
    exportData() {
        console.log('📦 Export data requested');
        alert('エクスポート機能は現在準備中です');
    },

    importData() {
        console.log('📥 Import data requested');
        const fileInput = document.getElementById('import-file-input');
        if (fileInput) {
            fileInput.click();
        }
    },

    handleFileSelection(event) {
        console.log('📁 File selection:', event.target.files);
        const file = event.target.files[0];
        if (file) {
            alert(`ファイル選択: ${file.name} - インポート機能は現在準備中です`);
        }
    },

    // Recipe screen navigation
    showAddRecipeScreen() {
        console.log('➕ Add recipe screen requested');
        const recipeScreen = document.getElementById('recipes-screen');
        const addScreen = document.getElementById('add-recipe-screen');

        if (recipeScreen) recipeScreen.classList.remove('active');
        if (addScreen) addScreen.classList.add('active');
    },

    // Recipe editing functions
    startEditRecipe() {
        console.log('✏️ Edit recipe requested');
        alert('編集機能は現在準備中です');
    },

    duplicateRecipe() {
        console.log('📋 Duplicate recipe requested');
        alert('複製機能は現在準備中です');
    },

    confirmDeleteRecipe() {
        console.log('🗑️ Delete recipe requested');
        const deleteModal = document.getElementById('delete-modal');
        if (deleteModal) {
            deleteModal.style.display = 'flex';
        }
    },

    // Additional navigation support
    showRecipeDetail(recipeId) {
        console.log('📖 Recipe detail requested:', recipeId);
        const recipeScreen = document.getElementById('recipes-screen');
        const detailScreen = document.getElementById('recipe-detail-screen');

        if (recipeScreen) recipeScreen.classList.remove('active');
        if (detailScreen) detailScreen.classList.add('active');
    }
};

// Global navigation functions
window.showAIRecipeInput = function() {
    console.log('🤖 AI Recipe Input requested');
    const recipeScreen = document.getElementById('recipes-screen');
    const aiScreen = document.getElementById('ai-recipe-screen');

    if (recipeScreen) recipeScreen.classList.remove('active');
    if (aiScreen) aiScreen.classList.add('active');
};

window.navigateBack = function() {
    console.log('← Navigate back requested');
    // Find active screen and return to recipes screen
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    const recipesScreen = document.getElementById('recipes-screen');
    if (recipesScreen) recipesScreen.classList.add('active');
};

window.processAIRecipe = function(event) {
    event.preventDefault();
    console.log('🤖 AI Recipe processing requested');
    alert('AI レシピ処理機能は現在準備中です');
};

console.log('✅ Emergency app object and global functions created');
