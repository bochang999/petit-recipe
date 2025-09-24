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
    }
};

console.log('✅ Emergency app object created with essential UI functions');
