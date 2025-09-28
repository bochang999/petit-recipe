#!/usr/bin/env node
/**
 * Chrome MCP Testing Workflow - Master Runner
 * Executes the complete testing workflow for BOC-111 Phase 5 verification
 */

const ComprehensiveReportGenerator = require('./phase4-comprehensive-report.cjs');

async function main() {
    console.log('🔬 Chrome MCP Testing Workflow for Petit Recipe');
    console.log('================================================');
    console.log('Testing BOC-111 Phase 5 UI/UX Improvements');
    console.log('Target: http://127.0.0.1:8085');
    console.log('================================================\n');

    try {
        const generator = new ComprehensiveReportGenerator();
        const finalReport = await generator.run();

        console.log('\n🎯 WORKFLOW EXECUTION COMPLETE');
        console.log('==============================\n');

        // Save report to file
        const fs = require('fs');
        const reportPath = '/data/data/com.termux/files/home/petit-recipe/ai-assistant-knowledge-hub/chrome-mcp-testing-workflow/final-test-report.json';

        fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
        console.log(`📄 Full report saved to: ${reportPath}`);

        // Return exit code based on compliance
        const exitCode = finalReport.compliancePercentage >= 80 ? 0 : 1;
        process.exit(exitCode);

    } catch (error) {
        console.error(`❌ Workflow failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
