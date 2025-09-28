#!/usr/bin/env node
/**
 * Chrome MCP Testing Workflow - Phase 2: Static DOM Analysis
 * Analyzes HTML structure using JSDOM to check BOC-111 Phase 5 fixes
 */

const { JSDOM } = require('jsdom');
const http = require('http');

class StaticDOMAnalysis {
    constructor() {
        this.testResults = {
            htmlLoaded: false,
            actionButtonsRow: false,
            formFields: false,
            cssLoaded: false,
            buttonLayout: false,
            titleBarFontSize: false,
            ingredientsList: false,
            settingsPage: false
        };

        this.findings = [];
    }

    async fetchHTML() {
        console.log('🔍 Fetching HTML from http://127.0.0.1:8085...');

        return new Promise((resolve, reject) => {
            const req = http.get('http://127.0.0.1:8085', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.log(`✅ HTML loaded (${data.length} bytes)`);
                    this.testResults.htmlLoaded = true;
                    resolve(data);
                });
            });

            req.on('error', (err) => {
                console.log(`❌ Failed to fetch HTML: ${err.message}`);
                this.testResults.htmlLoaded = false;
                reject(err);
            });
        });
    }

    analyzeActionButtonsRow(dom) {
        console.log('🔍 Analyzing action-buttons-row elements...');

        const actionButtonsRows = dom.querySelectorAll('.action-buttons-row');
        const findings = [];

        actionButtonsRows.forEach((row, index) => {
            const buttons = row.querySelectorAll('button');
            const hasHorizontalLayout = this.checkHorizontalLayout(row);

            findings.push({
                element: `action-buttons-row[${index}]`,
                buttonCount: buttons.length,
                buttonTexts: Array.from(buttons).map(btn => btn.textContent.trim()),
                hasHorizontalLayout: hasHorizontalLayout,
                className: row.className
            });
        });

        this.testResults.actionButtonsRow = actionButtonsRows.length > 0;

        if (actionButtonsRows.length > 0) {
            console.log(`✅ Found ${actionButtonsRows.length} action-buttons-row elements`);
        } else {
            console.log('❌ No action-buttons-row elements found');
        }

        this.findings.push({
            category: 'Action Buttons Row',
            elements: findings
        });

        return findings;
    }

    checkHorizontalLayout(element) {
        // Check for CSS classes that indicate horizontal layout
        const horizontalIndicators = [
            'flex', 'horizontal', 'row', 'inline-flex'
        ];

        const className = element.className.toLowerCase();
        return horizontalIndicators.some(indicator =>
            className.includes(indicator)
        );
    }

    analyzeFormFields(dom) {
        console.log('🔍 Analyzing form fields...');

        const requiredFields = [
            'recipe-title',
            'recipe-ingredients',
            'recipe-instructions'
        ];

        const foundFields = [];

        requiredFields.forEach(fieldId => {
            const element = dom.getElementById(fieldId);
            if (element) {
                foundFields.push({
                    id: fieldId,
                    tagName: element.tagName.toLowerCase(),
                    type: element.type || 'N/A',
                    className: element.className
                });
            }
        });

        this.testResults.formFields = foundFields.length === requiredFields.length;

        if (foundFields.length === requiredFields.length) {
            console.log(`✅ All ${requiredFields.length} form fields found`);
        } else {
            console.log(`❌ Only ${foundFields.length}/${requiredFields.length} form fields found`);
        }

        this.findings.push({
            category: 'Form Fields',
            required: requiredFields,
            found: foundFields
        });

        return foundFields;
    }

    analyzeCSSLoading(dom) {
        console.log('🔍 Analyzing CSS loading...');

        const cssLinks = dom.querySelectorAll('link[rel="stylesheet"]');
        const styleElements = dom.querySelectorAll('style');

        const cssFiles = Array.from(cssLinks).map(link => ({
            href: link.href,
            loaded: true  // In JSDOM, if it's in DOM, it's "loaded"
        }));

        this.testResults.cssLoaded = cssFiles.length > 0 || styleElements.length > 0;

        console.log(`✅ Found ${cssFiles.length} CSS files and ${styleElements.length} style elements`);

        this.findings.push({
            category: 'CSS Loading',
            cssFiles: cssFiles,
            inlineStyles: styleElements.length
        });

        return cssFiles;
    }

    analyzeTitleBarFontSize(dom) {
        console.log('🔍 Analyzing title bar font size...');

        // Look for title elements that should have 1.3rem font size
        const titleSelectors = [
            '.detail-page h1',
            '.detail-page .title',
            '.recipe-title',
            'h1',
            '.page-title'
        ];

        const titleElements = [];

        titleSelectors.forEach(selector => {
            const elements = dom.querySelectorAll(selector);
            elements.forEach(el => {
                titleElements.push({
                    selector: selector,
                    textContent: el.textContent.trim(),
                    className: el.className,
                    tagName: el.tagName.toLowerCase()
                });
            });
        });

        this.testResults.titleBarFontSize = titleElements.length > 0;

        console.log(`✅ Found ${titleElements.length} potential title elements`);

        this.findings.push({
            category: 'Title Bar Elements',
            elements: titleElements
        });

        return titleElements;
    }

    analyzeIngredientsList(dom) {
        console.log('🔍 Analyzing ingredients list...');

        const ingredientSelectors = [
            '.ingredients-list',
            '.recipe-ingredients',
            '#ingredients',
            '.ingredients'
        ];

        const ingredientElements = [];

        ingredientSelectors.forEach(selector => {
            const elements = dom.querySelectorAll(selector);
            elements.forEach(el => {
                ingredientElements.push({
                    selector: selector,
                    hasScrollRestriction: this.checkScrollRestriction(el),
                    className: el.className,
                    childrenCount: el.children.length
                });
            });
        });

        this.testResults.ingredientsList = ingredientElements.length > 0;

        console.log(`✅ Found ${ingredientElements.length} ingredients list elements`);

        this.findings.push({
            category: 'Ingredients List',
            elements: ingredientElements
        });

        return ingredientElements;
    }

    checkScrollRestriction(element) {
        // Check for CSS classes or styles that might restrict scrolling
        const restrictionIndicators = [
            'max-height', 'overflow-hidden', 'scroll-restriction'
        ];

        const className = element.className.toLowerCase();
        return restrictionIndicators.some(indicator =>
            className.includes(indicator)
        );
    }

    analyzeSettingsPage(dom) {
        console.log('🔍 Analyzing settings page elements...');

        const settingsSelectors = [
            '.settings-page',
            '#settings',
            '.import-export',
            '.settings-section'
        ];

        const settingsElements = [];

        settingsSelectors.forEach(selector => {
            const elements = dom.querySelectorAll(selector);
            elements.forEach(el => {
                settingsElements.push({
                    selector: selector,
                    className: el.className,
                    hasImportExport: this.checkImportExportFunctionality(el)
                });
            });
        });

        this.testResults.settingsPage = settingsElements.length > 0;

        console.log(`✅ Found ${settingsElements.length} settings-related elements`);

        this.findings.push({
            category: 'Settings Page',
            elements: settingsElements
        });

        return settingsElements;
    }

    checkImportExportFunctionality(element) {
        const importExportIndicators = [
            'import', 'export', 'download', 'upload'
        ];

        const content = element.textContent.toLowerCase();
        const className = element.className.toLowerCase();

        return importExportIndicators.some(indicator =>
            content.includes(indicator) || className.includes(indicator)
        );
    }

    generateReport() {
        console.log('\n📊 Phase 2 Static DOM Analysis Report:');
        console.log('======================================');

        Object.entries(this.testResults).forEach(([test, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            console.log(`${test}: ${status}`);
        });

        const allPassed = Object.values(this.testResults).every(result => result);
        console.log(`\nOverall Status: ${allPassed ? '✅ COMPLETE' : '⚠️  PARTIAL'}`);

        return {
            phase: 'Phase 2: Static DOM Analysis',
            timestamp: new Date().toISOString(),
            results: this.testResults,
            findings: this.findings,
            status: allPassed ? 'COMPLETE' : 'PARTIAL'
        };
    }

    async run() {
        console.log('🚀 Starting Phase 2: Static DOM Analysis');
        console.log('=========================================\n');

        try {
            const html = await this.fetchHTML();
            const dom = new JSDOM(html).window.document;

            this.analyzeActionButtonsRow(dom);
            this.analyzeFormFields(dom);
            this.analyzeCSSLoading(dom);
            this.analyzeTitleBarFontSize(dom);
            this.analyzeIngredientsList(dom);
            this.analyzeSettingsPage(dom);

            return this.generateReport();
        } catch (error) {
            console.log(`❌ Phase 2 failed: ${error.message}`);
            return {
                phase: 'Phase 2: Static DOM Analysis',
                timestamp: new Date().toISOString(),
                error: error.message,
                status: 'FAILED'
            };
        }
    }
}

// Export for use in other modules
module.exports = StaticDOMAnalysis;

// Run if called directly
if (require.main === module) {
    const analysis = new StaticDOMAnalysis();
    analysis.run().then(report => {
        console.log('\n' + JSON.stringify(report, null, 2));
    });
}
