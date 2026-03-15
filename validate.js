#!/usr/bin/env node
/**
 * Cassandra AI - Pre-Integration Validation Script
 * 
 * Checks that all deliverables are present and functional
 * Run with: node validate.js
 */

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function validate() {
  log('\n🔍 Cassandra AI - Delivery Validation\n', 'cyan');
  
  let passed = 0;
  let failed = 0;
  
  // Check 1: Required files exist
  log('📁 Checking required files...', 'bold');
  const requiredFiles = [
    'api.js',
    'api.test.js',
    'package.json',
    'API_README.md',
    'QUICKSTART.md',
    'DELIVERY_SUMMARY.md',
    '.env.example',
    '.gitignore',
    'examples/basic-usage.js',
    'examples/streaming-example.js'
  ];
  
  for (const file of requiredFiles) {
    const path = join(__dirname, file);
    if (existsSync(path)) {
      log(`  ✅ ${file}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${file} - NOT FOUND`, 'red');
      failed++;
    }
  }
  
  // Check 2: API module structure
  log('\n📦 Checking API module structure...', 'bold');
  try {
    const apiContent = await readFile(join(__dirname, 'api.js'), 'utf-8');
    
    const checks = [
      { name: 'analyzeScenario function', pattern: /export async function analyzeScenario/ },
      { name: 'getUsageStats function', pattern: /export function getUsageStats/ },
      { name: 'testConnection function', pattern: /export async function testConnection/ },
      { name: 'Streaming support', pattern: /onChunk/ },
      { name: 'Error handling', pattern: /catch.*error/ },
      { name: 'Rate limiting', pattern: /enforceRateLimit/ },
      { name: 'Cost tracking', pattern: /trackUsage/ },
      { name: 'System prompt', pattern: /SYSTEM_PROMPT/ },
      { name: 'Few-shot examples', pattern: /FEW_SHOT_EXAMPLES/ }
    ];
    
    for (const check of checks) {
      if (check.pattern.test(apiContent)) {
        log(`  ✅ ${check.name}`, 'green');
        passed++;
      } else {
        log(`  ❌ ${check.name} - NOT FOUND`, 'red');
        failed++;
      }
    }
  } catch (error) {
    log(`  ❌ Failed to read api.js: ${error.message}`, 'red');
    failed += 9;
  }
  
  // Check 3: Package.json configuration
  log('\n⚙️  Checking package.json configuration...', 'bold');
  try {
    const pkgContent = await readFile(join(__dirname, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgContent);
    
    if (pkg.type === 'module') {
      log(`  ✅ ES modules enabled (type: "module")`, 'green');
      passed++;
    } else {
      log(`  ❌ ES modules not enabled`, 'red');
      failed++;
    }
    
    if (pkg.dependencies && pkg.dependencies['@anthropic-ai/sdk']) {
      log(`  ✅ Anthropic SDK dependency`, 'green');
      passed++;
    } else {
      log(`  ❌ Missing @anthropic-ai/sdk dependency`, 'red');
      failed++;
    }
    
    if (pkg.scripts && pkg.scripts.test) {
      log(`  ✅ Test script configured`, 'green');
      passed++;
    } else {
      log(`  ❌ No test script`, 'red');
      failed++;
    }
  } catch (error) {
    log(`  ❌ Failed to parse package.json: ${error.message}`, 'red');
    failed += 3;
  }
  
  // Check 4: Documentation completeness
  log('\n📚 Checking documentation...', 'bold');
  try {
    const readmeContent = await readFile(join(__dirname, 'API_README.md'), 'utf-8');
    
    const docChecks = [
      { name: 'Installation instructions', pattern: /npm install/ },
      { name: 'Usage examples', pattern: /analyzeScenario/ },
      { name: 'Error handling docs', pattern: /Error Handling/ },
      { name: 'Response format docs', pattern: /Response Format/ },
      { name: 'Streaming example', pattern: /Streaming/ }
    ];
    
    for (const check of docChecks) {
      if (check.pattern.test(readmeContent)) {
        log(`  ✅ ${check.name}`, 'green');
        passed++;
      } else {
        log(`  ❌ ${check.name} - NOT FOUND`, 'red');
        failed++;
      }
    }
  } catch (error) {
    log(`  ❌ Failed to read API_README.md: ${error.message}`, 'red');
    failed += 5;
  }
  
  // Check 5: Test suite structure
  log('\n🧪 Checking test suite...', 'bold');
  try {
    const testContent = await readFile(join(__dirname, 'api.test.js'), 'utf-8');
    
    const testChecks = [
      { name: 'API connection test', pattern: /Test 1.*API Connection/ },
      { name: 'Simple scenario test', pattern: /Test 2.*Simple Scenario/ },
      { name: 'Streaming test', pattern: /Test 3.*Streaming/ },
      { name: 'Error handling test', pattern: /Test 6.*Error Handling/ },
      { name: 'Usage tracking test', pattern: /Test 7.*Usage Tracking/ },
      { name: 'Probability validation', pattern: /Test 5.*Probability/ }
    ];
    
    for (const check of testChecks) {
      if (check.pattern.test(testContent)) {
        log(`  ✅ ${check.name}`, 'green');
        passed++;
      } else {
        log(`  ❌ ${check.name} - NOT FOUND`, 'red');
        failed++;
      }
    }
  } catch (error) {
    log(`  ❌ Failed to read api.test.js: ${error.message}`, 'red');
    failed += 6;
  }
  
  // Check 6: Try to import the module
  log('\n🔌 Checking module import...', 'bold');
  try {
    const { analyzeScenario, getUsageStats, testConnection } = await import('./api.js');
    
    if (typeof analyzeScenario === 'function') {
      log(`  ✅ analyzeScenario function exported`, 'green');
      passed++;
    } else {
      log(`  ❌ analyzeScenario not a function`, 'red');
      failed++;
    }
    
    if (typeof getUsageStats === 'function') {
      log(`  ✅ getUsageStats function exported`, 'green');
      passed++;
    } else {
      log(`  ❌ getUsageStats not a function`, 'red');
      failed++;
    }
    
    if (typeof testConnection === 'function') {
      log(`  ✅ testConnection function exported`, 'green');
      passed++;
    } else {
      log(`  ❌ testConnection not a function`, 'red');
      failed++;
    }
  } catch (error) {
    log(`  ❌ Failed to import api.js: ${error.message}`, 'red');
    failed += 3;
  }
  
  // Final report
  console.log('\n' + '═'.repeat(60));
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  log(`\n📊 Validation Results: ${passed}/${total} passed (${percentage}%)`, 'cyan');
  
  if (failed === 0) {
    log('\n🎉 All checks passed! Module is ready for integration.\n', 'green');
    log('Next steps:', 'bold');
    log('  1. npm install', 'cyan');
    log('  2. export ANTHROPIC_API_KEY="your-key"', 'cyan');
    log('  3. npm test', 'cyan');
    log('  4. node examples/basic-usage.js\n', 'cyan');
    process.exit(0);
  } else {
    log(`\n⚠️  ${failed} check(s) failed. Review errors above.\n`, 'yellow');
    process.exit(1);
  }
}

validate().catch(error => {
  log(`\n💥 Validation crashed: ${error.message}\n`, 'red');
  process.exit(1);
});
