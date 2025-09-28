#!/usr/bin/env node
/**
 * Chrome MCP Testing Workflow - Phase 3: Chrome DevTools Protocol Testing
 * Uses Chrome DevTools Protocol to test the actual running application
 */

const { spawn } = require('child_process');
const WebSocket = require('ws');
const http = require('http');

class ChromeDevToolsTesting {
    constructor() {
        this.testResults = {
            chromeStarted: false,
            devToolsConnected: false,
            pageNavigated: false,
            domAnalyzed: false,
            cssAnalyzed: false,
            buttonInteraction: false,
            formTesting: false
        };

        this.findings = [];
        this.chrome = null;
        this.ws = null;
        this.messageId = 0;
    }

    async startChrome() {
        console.log('🚀 Starting Chrome with DevTools...');

        return new Promise((resolve, reject) => {
            this.chrome = spawn('chromium-browser', [
                '--headless',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--remote-debugging-port=9222',
                '--enable-features=NetworkService,NetworkServiceLogging'
            ], {
                stdio: ['ignore', 'pipe', 'pipe']
            });

            this.chrome.on('error', (err) => {
                console.log(`❌ Failed to start Chrome: ${err.message}`);
                this.testResults.chromeStarted = false;
                reject(err);
            });

            // Wait a bit for Chrome to start
            setTimeout(() => {
                console.log('✅ Chrome started with DevTools');
                this.testResults.chromeStarted = true;
                resolve();
            }, 2000);
        });
    }

    async connectDevTools() {
        console.log('🔗 Connecting to Chrome DevTools...');

        return new Promise((resolve, reject) => {
            // Get the DevTools WebSocket URL
            const req = http.get('http://localhost:9222/json', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const tabs = JSON.parse(data);
                        if (tabs.length === 0) {
                            throw new Error('No Chrome tabs available');
                        }

                        const tab = tabs[0];
                        const wsUrl = tab.webSocketDebuggerUrl;

                        this.ws = new WebSocket(wsUrl);

                        this.ws.on('open', () => {
                            console.log('✅ Connected to Chrome DevTools');
                            this.testResults.devToolsConnected = true;
                            resolve();
                        });

                        this.ws.on('error', (err) => {
                            console.log(`❌ DevTools connection failed: ${err.message}`);
                            this.testResults.devToolsConnected = false;
                            reject(err);
                        });

                    } catch (error) {
                        console.log(`❌ Failed to parse DevTools response: ${error.message}`);
                        reject(error);
                    }
                });
            });

            req.on('error', (err) => {
                console.log(`❌ Failed to get DevTools info: ${err.message}`);
                reject(err);
            });
        });
    }

    async sendCommand(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = ++this.messageId;
            const message = JSON.stringify({ id, method, params });

            const timeout = setTimeout(() => {
                reject(new Error(`Command timeout: ${method}`));
            }, 10000);

            const handler = (data) => {
                const response = JSON.parse(data);
                if (response.id === id) {
                    clearTimeout(timeout);
                    this.ws.off('message', handler);
                    if (response.error) {
                        reject(new Error(response.error.message));
                    } else {
                        resolve(response.result);
                    }
                }
            };

            this.ws.on('message', handler);
            this.ws.send(message);
        });
    }

    async navigateToApp() {
        console.log('🌐 Navigating to Petit Recipe application...');

        try {
            await this.sendCommand('Page.enable');
            await this.sendCommand('Runtime.enable');
            await this.sendCommand('DOM.enable');

            const result = await this.sendCommand('Page.navigate', {
                url: 'http://127.0.0.1:8085'
            });

            // Wait for page to load
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log('✅ Successfully navigated to application');
            this.testResults.pageNavigated = true;

        } catch (error) {
            console.log(`❌ Navigation failed: ${error.message}`);
            this.testResults.pageNavigated = false;
            throw error;
        }
    }

    async analyzeDOMStructure() {
        console.log('🔍 Analyzing DOM structure...');

        try {
            const document = await this.sendCommand('DOM.getDocument');
            const rootNode = document.root;

            // Search for specific BOC-111 Phase 5 elements
            const elements = await this.analyzeSpecificElements(rootNode.nodeId);

            this.findings.push({
                category: 'Chrome DevTools DOM Analysis',
                elements: elements
            });

            console.log(`✅ DOM analysis complete - found ${elements.length} key elements`);
            this.testResults.domAnalyzed = true;

        } catch (error) {
            console.log(`❌ DOM analysis failed: ${error.message}`);
            this.testResults.domAnalyzed = false;
        }
    }

    async analyzeSpecificElements(nodeId) {
        const elements = [];

        try {
            // Find action-buttons-row elements
            const actionButtons = await this.sendCommand('DOM.querySelectorAll', {
                nodeId: nodeId,
                selector: '.action-buttons-row'
            });

            for (const buttonNodeId of actionButtons.nodeIds) {
                const node = await this.sendCommand('DOM.describeNode', {
                    nodeId: buttonNodeId
                });

                const styles = await this.sendCommand('CSS.getComputedStyleForNode', {
                    nodeId: buttonNodeId
                });

                const displayStyle = styles.computedStyle.find(prop => prop.name === 'display');
                const flexDirection = styles.computedStyle.find(prop => prop.name === 'flex-direction');

                elements.push({
                    type: 'action-buttons-row',
                    nodeId: buttonNodeId,
                    display: displayStyle ? displayStyle.value : 'unknown',
                    flexDirection: flexDirection ? flexDirection.value : 'unknown'
                });
            }

            // Find title elements
            const titleElements = await this.sendCommand('DOM.querySelectorAll', {
                nodeId: nodeId,
                selector: 'h1, .title, .page-title'
            });

            for (const titleNodeId of titleElements.nodeIds) {
                const styles = await this.sendCommand('CSS.getComputedStyleForNode', {
                    nodeId: titleNodeId
                });

                const fontSize = styles.computedStyle.find(prop => prop.name === 'font-size');

                elements.push({
                    type: 'title-element',
                    nodeId: titleNodeId,
                    fontSize: fontSize ? fontSize.value : 'unknown'
                });
            }

            // Find ingredients list
            const ingredientsList = await this.sendCommand('DOM.querySelectorAll', {
                nodeId: nodeId,
                selector: '.ingredients-list, .recipe-ingredients'
            });

            for (const listNodeId of ingredientsList.nodeIds) {
                const styles = await this.sendCommand('CSS.getComputedStyleForNode', {
                    nodeId: listNodeId
                });

                const maxHeight = styles.computedStyle.find(prop => prop.name === 'max-height');
                const overflow = styles.computedStyle.find(prop => prop.name === 'overflow');

                elements.push({
                    type: 'ingredients-list',
                    nodeId: listNodeId,
                    maxHeight: maxHeight ? maxHeight.value : 'unknown',
                    overflow: overflow ? overflow.value : 'unknown'
                });
            }

        } catch (error) {
            console.log(`❌ Element analysis error: ${error.message}`);
        }

        return elements;
    }

    async testButtonInteractions() {
        console.log('🖱️ Testing button interactions...');

        try {
            // Find and click the first action button
            const document = await this.sendCommand('DOM.getDocument');
            const buttons = await this.sendCommand('DOM.querySelectorAll', {
                nodeId: document.root.nodeId,
                selector: '.action-buttons-row button'
            });

            if (buttons.nodeIds.length > 0) {
                const firstButton = buttons.nodeIds[0];

                // Get button coordinates
                const boxModel = await this.sendCommand('DOM.getBoxModel', {
                    nodeId: firstButton
                });

                if (boxModel && boxModel.model && boxModel.model.content) {
                    const [x, y] = boxModel.model.content;

                    // Simulate click
                    await this.sendCommand('Input.dispatchMouseEvent', {
                        type: 'mousePressed',
                        x: x + 10,
                        y: y + 10,
                        button: 'left',
                        clickCount: 1
                    });

                    await this.sendCommand('Input.dispatchMouseEvent', {
                        type: 'mouseReleased',
                        x: x + 10,
                        y: y + 10,
                        button: 'left'
                    });

                    console.log('✅ Button interaction test successful');
                    this.testResults.buttonInteraction = true;
                }
            }

        } catch (error) {
            console.log(`❌ Button interaction test failed: ${error.message}`);
            this.testResults.buttonInteraction = false;
        }
    }

    async cleanup() {
        console.log('🧹 Cleaning up Chrome process...');

        if (this.ws) {
            this.ws.close();
        }

        if (this.chrome) {
            this.chrome.kill('SIGTERM');

            // Force kill if needed
            setTimeout(() => {
                if (this.chrome && !this.chrome.killed) {
                    this.chrome.kill('SIGKILL');
                }
            }, 5000);
        }
    }

    generateReport() {
        console.log('\n📊 Phase 3 Chrome DevTools Testing Report:');
        console.log('==========================================');

        Object.entries(this.testResults).forEach(([test, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            console.log(`${test}: ${status}`);
        });

        const allPassed = Object.values(this.testResults).every(result => result);
        console.log(`\nOverall Status: ${allPassed ? '✅ COMPLETE' : '⚠️  PARTIAL'}`);

        return {
            phase: 'Phase 3: Chrome DevTools Testing',
            timestamp: new Date().toISOString(),
            results: this.testResults,
            findings: this.findings,
            status: allPassed ? 'COMPLETE' : 'PARTIAL'
        };
    }

    async run() {
        console.log('🚀 Starting Phase 3: Chrome DevTools Testing');
        console.log('=============================================\n');

        try {
            await this.startChrome();
            await this.connectDevTools();
            await this.navigateToApp();
            await this.analyzeDOMStructure();
            await this.testButtonInteractions();

            return this.generateReport();

        } catch (error) {
            console.log(`❌ Phase 3 failed: ${error.message}`);
            return {
                phase: 'Phase 3: Chrome DevTools Testing',
                timestamp: new Date().toISOString(),
                error: error.message,
                status: 'FAILED'
            };
        } finally {
            await this.cleanup();
        }
    }
}

// Export for use in other modules
module.exports = ChromeDevToolsTesting;

// Run if called directly
if (require.main === module) {
    const testing = new ChromeDevToolsTesting();
    testing.run().then(report => {
        console.log('\n' + JSON.stringify(report, null, 2));
    });
}
