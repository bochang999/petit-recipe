// BOC-107: Layered Data Architecture - Single Source of Truth Implementation
// Long-term sustainable solution with proper engineering principles

/**
 * Layer 1: BaseDataLoader - Immutable APK-embedded foundation
 * Ensures data is always available, no matter what happens to user data
 */
class BaseDataLoader {
    constructor() {
        this.baseData = null;
        this.isLoaded = false;
    }

    /**
     * Load base recipes from APK-embedded JSON
     * This data never changes and provides fallback guarantee
     */
    async loadBaseData() {
        if (this.isLoaded && this.baseData) {
            return this.baseData;
        }

        try {
            console.log('📚 Loading base recipe data from APK...');
            const response = await fetch('./recipes.json');

            if (!response.ok) {
                throw new Error(`Failed to load base data: ${response.status}`);
            }

            const data = await response.json();

            if (!data.recipes || !Array.isArray(data.recipes)) {
                throw new Error('Invalid base data structure');
            }

            this.baseData = data.recipes;
            this.isLoaded = true;

            if (this.baseData.length === 0) {
                console.log('📝 Base data loaded: Empty recipe list (ready for new recipes)');
            } else {
                console.log(`✅ Base data loaded: ${this.baseData.length} recipes`);
            }
            return this.baseData;
        } catch (error) {
            console.error('❌ Base data loading failed:', error);
            // Emergency fallback
            return this.getEmergencyFallback();
        }
    }

    /**
     * Emergency fallback when everything fails
     */
    getEmergencyFallback() {
        console.log('🚨 Using emergency fallback data');
        return [{
            id: "emergency-1",
            name: "Emergency Recipe",
            servings: 1,
            cookTime: "5分",
            ingredients: [
                { name: "データロード失敗", amount: 1, unit: "回" }
            ],
            steps: [
                "アプリを再起動してください",
                "問題が続く場合は開発者にお知らせください"
            ]
        }];
    }

    /**
     * Get base recipe by ID
     */
    async getBaseRecipeById(id) {
        const baseData = await this.loadBaseData();
        return baseData.find(recipe => recipe.id === id);
    }

    /**
     * Check if recipe exists in base data
     */
    async hasBaseRecipe(id) {
        const baseData = await this.loadBaseData();
        return baseData.some(recipe => recipe.id === id);
    }
}

/**
 * Layer 2: UserDataManager - Mutable user extensions and overrides
 * Handles user additions, edits, and deletions without touching base data
 */
class UserDataManager {
    constructor() {
        this.userData = {
            additions: [],      // New recipes added by user
            overrides: new Map(), // Edits to existing recipes
            deletions: new Set()  // IDs of deleted recipes
        };
        this.isInitialized = false;
    }

    /**
     * Initialize user data storage
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Import Filesystem dynamically to handle both web and native environments
            if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
                const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
                this.filesystem = Filesystem;
                this.directory = Directory.Documents;
                this.encoding = Encoding.UTF8;
                this.hasNativeFS = true;
            } else {
                // Web environment - use localStorage as fallback
                this.hasNativeFS = false;
            }

            await this.loadUserData();
            this.isInitialized = true;
            console.log('✅ User data manager initialized');
        } catch (error) {
            console.error('❌ User data initialization failed:', error);
            this.isInitialized = true; // Continue with empty user data
        }
    }

    /**
     * Load user data from storage
     */
    async loadUserData() {
        try {
            let userData;

            if (this.hasNativeFS) {
                // Native environment - use Capacitor FileSystem
                try {
                    const result = await this.filesystem.readFile({
                        path: 'user-recipes.json',
                        directory: this.directory,
                        encoding: this.encoding
                    });
                    userData = JSON.parse(result.data);
                } catch (fileError) {
                    // File doesn't exist yet - that's OK
                    console.log('📝 No user data file found, starting fresh');
                    return;
                }
            } else {
                // Web environment - use localStorage
                const stored = localStorage.getItem('petit-recipe-user-data');
                if (stored) {
                    userData = JSON.parse(stored);
                } else {
                    console.log('📝 No localStorage user data found, starting fresh');
                    return;
                }
            }

            // Restore user data structure
            this.userData.additions = userData.additions || [];
            this.userData.overrides = new Map(userData.overrides || []);
            this.userData.deletions = new Set(userData.deletions || []);

            console.log(`📊 User data loaded - Additions: ${this.userData.additions.length}, Overrides: ${this.userData.overrides.size}, Deletions: ${this.userData.deletions.size}`);
        } catch (error) {
            console.error('❌ Failed to load user data:', error);
        }
    }

    /**
     * Save user data to storage
     */
    async saveUserData() {
        try {
            const dataToSave = {
                version: "1.0",
                lastUpdated: new Date().toISOString(),
                additions: this.userData.additions,
                overrides: Array.from(this.userData.overrides.entries()),
                deletions: Array.from(this.userData.deletions)
            };

            if (this.hasNativeFS) {
                // Native environment
                await this.filesystem.writeFile({
                    path: 'user-recipes.json',
                    data: JSON.stringify(dataToSave, null, 2),
                    directory: this.directory,
                    encoding: this.encoding
                });
            } else {
                // Web environment
                localStorage.setItem('petit-recipe-user-data', JSON.stringify(dataToSave));
            }

            console.log('💾 User data saved successfully');
        } catch (error) {
            console.error('❌ Failed to save user data:', error);
            throw error;
        }
    }

    /**
     * Add new recipe (user addition)
     */
    async addRecipe(recipe) {
        await this.initialize();

        // Generate unique ID for user additions
        const userIds = this.userData.additions.map(r => r.id);
        const maxId = Math.max(0, ...userIds.map(id => parseInt(id.replace('user-', '')) || 0));
        const newId = `user-${maxId + 1}`;

        const newRecipe = { ...recipe, id: newId };
        this.userData.additions.push(newRecipe);

        await this.saveUserData();
        console.log(`✅ Added user recipe: ${newRecipe.name} (${newId})`);
        return newRecipe;
    }

    /**
     * Edit existing recipe (creates override)
     */
    async editRecipe(id, recipe) {
        await this.initialize();

        this.userData.overrides.set(id, { ...recipe, id });
        await this.saveUserData();
        console.log(`✅ Created override for recipe: ${id}`);
        return { ...recipe, id };
    }

    /**
     * Delete recipe (marks as deleted)
     */
    async deleteRecipe(id) {
        await this.initialize();

        this.userData.deletions.add(id);

        // Remove from additions if it was a user-added recipe
        this.userData.additions = this.userData.additions.filter(r => r.id !== id);

        // Remove override if it exists
        this.userData.overrides.delete(id);

        await this.saveUserData();
        console.log(`✅ Marked recipe as deleted: ${id}`);
        return id;
    }

    /**
     * Get user additions
     */
    getUserAdditions() {
        return this.userData.additions;
    }

    /**
     * Get override for specific recipe
     */
    getOverride(id) {
        return this.userData.overrides.get(id);
    }

    /**
     * Check if recipe is deleted
     */
    isDeleted(id) {
        return this.userData.deletions.has(id);
    }
}

/**
 * Layer 3: DataMerger - Runtime integration with fallback hierarchy
 * Combines base data and user data into unified view
 */
class DataMerger {
    constructor(baseLoader, userManager) {
        this.baseLoader = baseLoader;
        this.userManager = userManager;
    }

    /**
     * Get complete merged recipe dataset
     * Implements fallback hierarchy for maximum reliability
     */
    async getMergedRecipes() {
        try {
            // Level 1: Try full merge (base + user)
            return await this.performFullMerge();
        } catch (error) {
            console.error('❌ Full merge failed, falling back to base data:', error);

            try {
                // Level 2: Base data only
                return await this.baseLoader.loadBaseData();
            } catch (baseError) {
                console.error('❌ Base data failed, using emergency fallback:', baseError);

                // Level 3: Emergency fallback
                return this.baseLoader.getEmergencyFallback();
            }
        }
    }

    /**
     * Perform full merge of base and user data
     */
    async performFullMerge() {
        // Load both data sources
        const [baseData, _] = await Promise.all([
            this.baseLoader.loadBaseData(),
            this.userManager.initialize()
        ]);

        const mergedRecipes = [];

        // Start with base recipes
        for (const baseRecipe of baseData) {
            if (!this.userManager.isDeleted(baseRecipe.id)) {
                // Check for user override
                const override = this.userManager.getOverride(baseRecipe.id);
                mergedRecipes.push(override || baseRecipe);
            }
        }

        // Add user additions
        const userAdditions = this.userManager.getUserAdditions();
        mergedRecipes.push(...userAdditions);

        console.log(`🔄 Merged ${mergedRecipes.length} recipes (${baseData.length} base + ${userAdditions.length} user additions)`);
        return mergedRecipes;
    }

    /**
     * Get specific recipe with full fallback chain
     */
    async getRecipe(id) {
        await this.userManager.initialize();

        // Check if deleted
        if (this.userManager.isDeleted(id)) {
            return null;
        }

        // Check for user override first
        const override = this.userManager.getOverride(id);
        if (override) {
            return override;
        }

        // Check user additions
        const userAdditions = this.userManager.getUserAdditions();
        const userRecipe = userAdditions.find(r => r.id === id);
        if (userRecipe) {
            return userRecipe;
        }

        // Fall back to base data
        return await this.baseLoader.getBaseRecipeById(id);
    }
}

/**
 * Main Recipe Data Architecture
 * Provides unified interface with Excel-like immediate operations
 */
class RecipeDataArchitecture {
    constructor() {
        this.baseLoader = new BaseDataLoader();
        this.userManager = new UserDataManager();
        this.merger = new DataMerger(this.baseLoader, this.userManager);
        this.cache = null;
        this.lastUpdate = 0;
    }

    /**
     * Initialize the architecture
     */
    async initialize() {
        try {
            console.log('🏗️ Initializing Recipe Data Architecture...');

            // Initialize all layers with detailed logging
            console.log('🔄 Step 1: Loading base data...');
            const baseData = await this.baseLoader.loadBaseData();
            console.log(`✅ Base data loaded: ${baseData.length} recipes`);

            console.log('🔄 Step 2: Initializing user manager...');
            await this.userManager.initialize();
            console.log('✅ User manager initialized');

            // Get status for debugging
            const status = await this.getStatus();
            console.log('📊 Architecture Status:', status);

            console.log('✅ Recipe Data Architecture ready');
            return true;
        } catch (error) {
            console.error('❌ Architecture initialization failed:', error);
            return false;
        }
    }

    /**
     * Get all recipes with caching
     */
    async getAllRecipes(forceRefresh = false) {
        const now = Date.now();

        // Use cache if available and recent (unless forced refresh)
        if (!forceRefresh && this.cache && (now - this.lastUpdate) < 5000) {
            return this.cache;
        }

        this.cache = await this.merger.getMergedRecipes();
        this.lastUpdate = now;
        return this.cache;
    }

    /**
     * Excel-like immediate add
     */
    async addRecipe(recipe) {
        const result = await this.userManager.addRecipe(recipe);
        this.invalidateCache();
        return result;
    }

    /**
     * Excel-like immediate edit
     */
    async editRecipe(id, recipe) {
        const result = await this.userManager.editRecipe(id, recipe);
        this.invalidateCache();
        return result;
    }

    /**
     * Excel-like immediate delete
     */
    async deleteRecipe(id) {
        const result = await this.userManager.deleteRecipe(id);
        this.invalidateCache();
        return result;
    }

    /**
     * Get specific recipe
     */
    async getRecipe(id) {
        return await this.merger.getRecipe(id);
    }

    /**
     * Force refresh
     */
    async forceRefresh() {
        return await this.getAllRecipes(true);
    }

    /**
     * Invalidate cache
     */
    invalidateCache() {
        this.cache = null;
        this.lastUpdate = 0;
    }

    /**
     * Get architecture status for debugging
     */
    async getStatus() {
        try {
            const baseData = await this.baseLoader.loadBaseData();
            await this.userManager.initialize();

            return {
                baseRecipes: baseData.length,
                userAdditions: this.userManager.getUserAdditions().length,
                userOverrides: this.userManager.userData.overrides.size,
                userDeletions: this.userManager.userData.deletions.size,
                cacheValid: !!this.cache,
                lastUpdate: new Date(this.lastUpdate).toISOString()
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Export singleton
export const recipeArchitecture = new RecipeDataArchitecture();

// Global access for debugging
if (typeof window !== 'undefined') {
    window.recipeArchitecture = recipeArchitecture;
}
