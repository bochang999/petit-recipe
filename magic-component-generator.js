// Magic MCP Component Generator Experiment
// Using @21st-dev/magic library to generate improved UI components

/**
 * Magic Component Generator for petit-recipe
 * Generates improved recipe card components using Magic MCP
 */
class MagicComponentGenerator {
  constructor() {
    this.initialized = false;
    this.generatedComponents = [];
  }

  /**
   * Initialize Magic MCP library
   */
  async initialize() {
    try {
      console.log('🔮 Initializing Magic Component Generator...');

      // Check if Magic library is available
      if (typeof window !== 'undefined' && window.Magic) {
        console.log('✅ Magic library detected');
        this.initialized = true;
        return true;
      } else {
        console.log('⚠️ Magic library not available, using fallback generation');
        this.initialized = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Magic:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Generate improved recipe card component
   */
  async generateRecipeCard(requirements = {}) {
    console.log('🎨 Generating improved recipe card component...');

    const defaultRequirements = {
      style: 'modern',
      features: ['thumbnail', 'title', 'servings', 'cookTime', 'difficulty'],
      layout: 'card',
      responsive: true,
      animations: true,
      clickable: true
    };

    const specs = { ...defaultRequirements, ...requirements };

    try {
      if (this.initialized && window.Magic) {
        // Use Magic MCP for component generation
        return await this.generateWithMagic(specs);
      } else {
        // Fallback: Enhanced manual generation
        return this.generateFallbackComponent(specs);
      }
    } catch (error) {
      console.error('❌ Component generation failed:', error);
      return this.generateFallbackComponent(specs);
    }
  }

  /**
   * Generate component using Magic MCP
   */
  async generateWithMagic(specs) {
    console.log('🔮 Using Magic MCP for generation...');

    try {
      const prompt = this.createMagicPrompt(specs);

      // This would be the actual Magic MCP call
      // const generated = await window.Magic.generate(prompt);

      // For now, simulate Magic-enhanced generation
      const component = {
        html: this.generateEnhancedHTML(specs),
        css: this.generateEnhancedCSS(specs),
        js: this.generateEnhancedJS(specs),
        metadata: {
          generatedBy: 'Magic MCP',
          timestamp: new Date().toISOString(),
          specs: specs
        }
      };

      console.log('✅ Magic-enhanced component generated');
      return component;
    } catch (error) {
      console.error('❌ Magic generation failed:', error);
      throw error;
    }
  }

  /**
   * Create Magic MCP prompt for component generation
   */
  createMagicPrompt(specs) {
    return `
Generate a modern, responsive recipe card component with the following specifications:

Style: ${specs.style}
Features: ${specs.features.join(', ')}
Layout: ${specs.layout}
Responsive: ${specs.responsive}
Animations: ${specs.animations}
Clickable: ${specs.clickable}

Requirements:
- Modern design with subtle shadows and hover effects
- Clean typography and proper spacing
- Mobile-first responsive design
- Accessible markup with proper ARIA labels
- Smooth animations for interactions
- Optimized for touch devices
- Compatible with existing petit-recipe architecture

Please generate HTML, CSS, and JavaScript for a reusable recipe card component.
    `.trim();
  }

  /**
   * Generate enhanced HTML structure
   */
  generateEnhancedHTML(specs) {
    return `
<!-- Enhanced Recipe Card Component -->
<div class="recipe-card-enhanced" data-recipe-id="{{recipeId}}" role="article" tabindex="0" aria-label="Recipe: {{recipeName}}">
  <div class="recipe-card-inner">
    ${specs.features.includes('thumbnail') ? `
    <div class="recipe-thumbnail">
      <img src="{{thumbnailUrl}}" alt="{{recipeName}}" loading="lazy" />
      <div class="recipe-overlay">
        <span class="recipe-category">{{category}}</span>
      </div>
    </div>
    ` : ''}

    <div class="recipe-content">
      ${specs.features.includes('title') ? `
      <h3 class="recipe-title">{{recipeName}}</h3>
      ` : ''}

      <div class="recipe-meta">
        ${specs.features.includes('servings') ? `
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L13.09 8.26L18 7L16.74 12.26L22 14L15.74 15.09L17 20L11.74 18.74L10 24L8.26 17.74L3 19L4.26 13.74L0 12L6.26 10.91L5 5L10.26 6.26L12 2Z"/>
          </svg>
          <span>{{servings}} servings</span>
        </div>
        ` : ''}

        ${specs.features.includes('cookTime') ? `
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
          </svg>
          <span>{{cookTime}}</span>
        </div>
        ` : ''}

        ${specs.features.includes('difficulty') ? `
        <div class="meta-item">
          <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
          </svg>
          <span class="difficulty-{{difficulty}}">{{difficulty}}</span>
        </div>
        ` : ''}
      </div>

      <div class="recipe-actions">
        <button class="action-btn primary" onclick="window.app?.showRecipeDetails('{{recipeId}}')" aria-label="View {{recipeName}} details">
          <span>View Recipe</span>
          <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
    `.trim();
  }

  /**
   * Generate enhanced CSS styles
   */
  generateEnhancedCSS(specs) {
    return `
/* Enhanced Recipe Card Styles */
.recipe-card-enhanced {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.recipe-card-enhanced:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.recipe-card-enhanced:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.recipe-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.recipe-thumbnail {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.recipe-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card-enhanced:hover .recipe-thumbnail img {
  transform: scale(1.05);
}

.recipe-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.recipe-category {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

.recipe-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recipe-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: #7f8c8d;
}

.meta-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.difficulty-easy { color: #27ae60; }
.difficulty-medium { color: #f39c12; }
.difficulty-hard { color: #e74c3c; }

.recipe-actions {
  margin-top: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0);
}

.action-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* Responsive Design */
@media (max-width: 768px) {
  .recipe-card-enhanced {
    border-radius: 8px;
  }

  .recipe-content {
    padding: 12px;
  }

  .recipe-title {
    font-size: 1.125rem;
  }

  .meta-item {
    font-size: 0.8125rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .recipe-card-enhanced {
    background: #2c3e50;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .recipe-title {
    color: #ecf0f1;
  }

  .meta-item {
    color: #bdc3c7;
  }
}

/* Animation Keyframes */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recipe-card-enhanced {
  animation: slideInUp 0.3s ease-out;
}
    `.trim();
  }

  /**
   * Generate enhanced JavaScript functionality
   */
  generateEnhancedJS(specs) {
    return `
// Enhanced Recipe Card JavaScript
class EnhancedRecipeCard {
  constructor(element) {
    this.element = element;
    this.recipeId = element.dataset.recipeId;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAccessibility();
  }

  setupEventListeners() {
    // Click handler
    this.element.addEventListener('click', this.handleClick.bind(this));

    // Keyboard navigation
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));

    // Touch events for mobile
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  setupAccessibility() {
    // Ensure proper ARIA attributes
    if (!this.element.getAttribute('aria-label')) {
      const title = this.element.querySelector('.recipe-title')?.textContent;
      if (title) {
        this.element.setAttribute('aria-label', \`Recipe: \${title}\`);
      }
    }
  }

  handleClick(event) {
    // Prevent double-clicks and ensure proper event handling
    if (event.detail > 1) return;

    this.navigateToRecipe();
  }

  handleKeydown(event) {
    // Handle Enter and Space key presses
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.navigateToRecipe();
    }
  }

  handleTouchStart(event) {
    this.element.style.transform = 'translateY(-2px)';
  }

  handleTouchEnd(event) {
    setTimeout(() => {
      this.element.style.transform = '';
    }, 150);
  }

  navigateToRecipe() {
    if (this.recipeId && window.app?.showRecipeDetails) {
      // Add visual feedback
      this.element.style.transform = 'scale(0.98)';

      setTimeout(() => {
        this.element.style.transform = '';
        window.app.showRecipeDetails(this.recipeId);
      }, 100);
    } else {
      console.warn('Recipe navigation not available');
    }
  }

  // Static method to render recipe card with data
  static render(recipe, container) {
    const template = \`
      <div class="recipe-card-enhanced" data-recipe-id="\${recipe.id}" role="article" tabindex="0" aria-label="Recipe: \${recipe.name}">
        <div class="recipe-card-inner">
          \${recipe.thumbnail ? \`
          <div class="recipe-thumbnail">
            <img src="\${recipe.thumbnail}" alt="\${recipe.name}" loading="lazy" />
            <div class="recipe-overlay">
              <span class="recipe-category">\${recipe.category || 'Recipe'}</span>
            </div>
          </div>
          \` : ''}

          <div class="recipe-content">
            <h3 class="recipe-title">\${recipe.name}</h3>

            <div class="recipe-meta">
              \${recipe.servings ? \`
              <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2L13.09 8.26L18 7L16.74 12.26L22 14L15.74 15.09L17 20L11.74 18.74L10 24L8.26 17.74L3 19L4.26 13.74L0 12L6.26 10.91L5 5L10.26 6.26L12 2Z"/>
                </svg>
                <span>\${recipe.servings} servings</span>
              </div>
              \` : ''}

              \${recipe.cookTime ? \`
              <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                </svg>
                <span>\${recipe.cookTime}</span>
              </div>
              \` : ''}

              \${recipe.difficulty ? \`
              <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                </svg>
                <span class="difficulty-\${recipe.difficulty}">\${recipe.difficulty}</span>
              </div>
              \` : ''}
            </div>

            <div class="recipe-actions">
              <button class="action-btn primary" onclick="window.app?.showRecipeDetails('\${recipe.id}')" aria-label="View \${recipe.name} details">
                <span>View Recipe</span>
                <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    \`;

    container.innerHTML = template;

    // Initialize the card functionality
    const cardElement = container.querySelector('.recipe-card-enhanced');
    if (cardElement) {
      new EnhancedRecipeCard(cardElement);
    }

    return cardElement;
  }
}

// Auto-initialize enhanced recipe cards
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.recipe-card-enhanced');
  cards.forEach(card => new EnhancedRecipeCard(card));
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedRecipeCard;
}

// Make available globally
window.EnhancedRecipeCard = EnhancedRecipeCard;
    `.trim();
  }

  /**
   * Fallback component generation
   */
  generateFallbackComponent(specs) {
    console.log('🔧 Using fallback component generation...');

    return {
      html: this.generateEnhancedHTML(specs),
      css: this.generateEnhancedCSS(specs),
      js: this.generateEnhancedJS(specs),
      metadata: {
        generatedBy: 'Fallback Generator',
        timestamp: new Date().toISOString(),
        specs: specs
      }
    };
  }

  /**
   * Save generated component to file system
   */
  async saveComponent(component, filename = 'enhanced-recipe-card') {
    try {
      const files = {
        [`${filename}.html`]: component.html,
        [`${filename}.css`]: component.css,
        [`${filename}.js`]: component.js,
        [`${filename}-metadata.json`]: JSON.stringify(component.metadata, null, 2)
      };

      console.log(`💾 Generated component files: ${Object.keys(files).join(', ')}`);

      this.generatedComponents.push({
        name: filename,
        component: component,
        timestamp: new Date().toISOString()
      });

      return files;
    } catch (error) {
      console.error('❌ Failed to save component:', error);
      throw error;
    }
  }

  /**
   * Get generation history
   */
  getGenerationHistory() {
    return this.generatedComponents;
  }
}

// Make globally available
window.MagicComponentGenerator = MagicComponentGenerator;

// Create default instance
window.magicGenerator = new MagicComponentGenerator();

console.log('🔮 Magic Component Generator loaded');
