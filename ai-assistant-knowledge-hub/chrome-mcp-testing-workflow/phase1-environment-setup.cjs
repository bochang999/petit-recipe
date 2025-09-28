#!/usr/bin/env node
/**
 * Chrome MCP Testing Workflow - Phase 1: Environment Setup
 * Tests basic connectivity and environment readiness
 */

const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');

class EnvironmentSetup {
    constructor() {
        this.testResults = {
            serverConnectivity: false,
            chromeAvailability: false,
            nodeModules: false,
            jsdom: false,
            puppeteer: false
        };
    }

    async checkServerConnectivity() {
        console.log('🔍 Checking HTTP server on port 8085...');

        return new Promise((resolve) => {
            const req = http.get('http://127.0.0.1:8085', (res) => {
                console.log(`✅ Server responding with status: ${res.statusCode}`);
                this.testResults.serverConnectivity = true;
                resolve(true);
            });

            req.on('error', (err) => {
                console.log(`❌ Server connection failed: ${err.message}`);
                this.testResults.serverConnectivity = false;
                resolve(false);
            });

            req.setTimeout(5000, () => {
                console.log('❌ Server connection timeout');
                this.testResults.serverConnectivity = false;
                resolve(false);
            });
        });
    }

    checkChromeAvailability() {
        console.log('🔍 Checking Chrome/Chromium availability...');

        const chromeCommands = ['google-chrome', 'chromium', 'chromium-browser', 'chrome'];

        for (const cmd of chromeCommands) {
            try {
                const result = execSync(`which ${cmd}`, { encoding: 'utf8', stdio: 'pipe' });
                if (result.trim()) {
                    console.log(`✅ Found Chrome at: ${result.trim()}`);
                    this.testResults.chromeAvailability = true;
                    return true;
                }
            } catch (error) {
                // Continue to next command
            }
        }

        console.log('❌ Chrome/Chromium not found in PATH');
        this.testResults.chromeAvailability = false;
        return false;
    }

    checkNodeModules() {
        console.log('🔍 Checking required Node.js modules...');

        const requiredModules = ['jsdom', 'puppeteer-core'];
        let allAvailable = true;

        for (const module of requiredModules) {
            try {
                require.resolve(module);
                console.log(`✅ ${module} available`);
                this.testResults[module.replace('-', '')] = true;
            } catch (error) {
                console.log(`❌ ${module} not available: ${error.message}`);
                this.testResults[module.replace('-', '')] = false;
                allAvailable = false;
            }
        }

        this.testResults.nodeModules = allAvailable;
        return allAvailable;
    }

    async testBasicConnectivity() {
        console.log('🔍 Testing basic application connectivity...');

        return new Promise((resolve) => {
            const req = http.get('http://127.0.0.1:8085/index.html', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const hasTitle = data.includes('Petit Recipe');
                    const hasJS = data.includes('ui.js') || data.includes('core.js');
                    const hasCSS = data.includes('style.css');

                    console.log(`✅ HTML loaded (${data.length} bytes)`);
                    console.log(`✅ Title found: ${hasTitle}`);
                    console.log(`✅ JavaScript files: ${hasJS}`);
                    console.log(`✅ CSS files: ${hasCSS}`);

                    resolve(hasTitle && hasJS && hasCSS);
                });
            });

            req.on('error', (err) => {
                console.log(`❌ Application connectivity failed: ${err.message}`);
                resolve(false);
            });
        });
    }

    generateReport() {
        console.log('\n📊 Phase 1 Environment Setup Report:');
        console.log('=====================================');

        Object.entries(this.testResults).forEach(([test, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            console.log(`${test}: ${status}`);
        });

        const allPassed = Object.values(this.testResults).every(result => result);
        console.log(`\nOverall Status: ${allPassed ? '✅ READY' : '❌ NEEDS ATTENTION'}`);

        return {
            phase: 'Phase 1: Environment Setup',
            timestamp: new Date().toISOString(),
            results: this.testResults,
            status: allPassed ? 'READY' : 'NEEDS_ATTENTION'
        };
    }

    async run() {
        console.log('🚀 Starting Phase 1: Environment Setup');
        console.log('======================================\n');

        await this.checkServerConnectivity();
        this.checkChromeAvailability();
        this.checkNodeModules();
        await this.testBasicConnectivity();

        return this.generateReport();
    }
}

// Export for use in other modules
module.exports = EnvironmentSetup;

// Run if called directly
if (require.main === module) {
    const setup = new EnvironmentSetup();
    setup.run().then(report => {
        console.log('\n' + JSON.stringify(report, null, 2));
    });
}
