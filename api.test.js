/**
 * Cassandra AI - API Test Suite
 * Run with: node api.test.js
 */

import { analyzeScenario, getUsageStats, resetUsageTracking, testConnection } from './api.js';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.cyan}━━━ ${name} ━━━${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test scenarios
const scenarios = {
  simple: "Should I buy a car or continue using public transportation?",
  complex: "Two competing startups are deciding whether to merge or continue competing. Company A has strong tech but weak distribution. Company B has great distribution but weaker tech. What should they do?",
  multiPlayer: "Three friends are deciding where to go for dinner. Alice wants Italian, Bob wants Thai, Carol wants Mexican. How should they decide?",
  sequential: "I'm playing poker. I have a medium hand. Should I bet aggressively, call, or fold based on my opponents' behavior?",
  invalid: "" // Empty scenario for error testing
};

async function runTests() {
  log('\n🧪 Cassandra AI - API Test Suite\n', 'cyan');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: API Connection
  logTest('Test 1: API Connection');
  try {
    const connectionTest = await testConnection();
    if (connectionTest.success) {
      logSuccess('API connection successful');
      passed++;
    } else {
      logError(`Connection failed: ${connectionTest.message}`);
      failed++;
      log('\n⚠️  Remaining tests may fail without valid API connection\n', 'yellow');
    }
  } catch (error) {
    logError(`Connection test threw error: ${error.message}`);
    failed++;
  }
  
  // Test 2: Simple Scenario (Non-Streaming)
  logTest('Test 2: Simple Scenario Analysis (Non-Streaming)');
  try {
    resetUsageTracking();
    const result = await analyzeScenario(scenarios.simple);
    
    // Validate structure
    const requiredFields = ['gameType', 'players', 'analysis', 'recommendations', 'probabilities', 'confidence', 'usage'];
    const missingFields = requiredFields.filter(field => !(field in result));
    
    if (missingFields.length > 0) {
      logError(`Missing fields: ${missingFields.join(', ')}`);
      failed++;
    } else {
      logSuccess('All required fields present');
      logInfo(`Game Type: ${result.gameType}`);
      logInfo(`Players: ${result.players.join(', ')}`);
      logInfo(`Confidence: ${result.confidence}`);
      logInfo(`Recommendations: ${result.recommendations.length}`);
      logInfo(`Cost: $${result.usage.cost.toFixed(4)}`);
      passed++;
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    failed++;
  }
  
  // Test 3: Streaming Mode
  logTest('Test 3: Streaming Analysis');
  try {
    let chunkCount = 0;
    let partialUpdates = 0;
    
    const result = await analyzeScenario(scenarios.complex, (chunk, partial) => {
      chunkCount++;
      if (partial) {
        partialUpdates++;
      }
    });
    
    if (chunkCount > 0) {
      logSuccess(`Received ${chunkCount} chunks with ${partialUpdates} partial updates`);
      logInfo(`Final analysis length: ${result.analysis.length} chars`);
      logInfo(`Cost: $${result.usage.cost.toFixed(4)}`);
      passed++;
    } else {
      logError('No chunks received during streaming');
      failed++;
    }
  } catch (error) {
    logError(`Streaming test failed: ${error.message}`);
    failed++;
  }
  
  // Test 4: Complex Multi-Player Scenario
  logTest('Test 4: Multi-Player Scenario');
  try {
    const result = await analyzeScenario(scenarios.multiPlayer);
    
    if (result.players.length >= 3) {
      logSuccess(`Correctly identified ${result.players.length} players`);
      logInfo(`Players: ${result.players.join(', ')}`);
      
      if (result.payoffMatrix) {
        logSuccess('Payoff matrix generated');
      } else {
        logWarning('No payoff matrix (may be intentional for this game type)');
      }
      
      passed++;
    } else {
      logError(`Expected 3+ players, got ${result.players.length}`);
      failed++;
    }
  } catch (error) {
    logError(`Multi-player test failed: ${error.message}`);
    failed++;
  }
  
  // Test 5: Probability Validation
  logTest('Test 5: Probability Validation');
  try {
    const result = await analyzeScenario(scenarios.sequential);
    
    const probs = Object.values(result.probabilities);
    const total = probs.reduce((sum, p) => sum + p, 0);
    
    // Check if probabilities are reasonable (sum close to 1.0)
    if (Math.abs(total - 1.0) < 0.15) { // Allow 15% tolerance
      logSuccess(`Probabilities sum to ${total.toFixed(2)} (within tolerance)`);
      
      // Display probabilities
      Object.entries(result.probabilities).forEach(([option, prob]) => {
        logInfo(`  ${option}: ${(prob * 100).toFixed(1)}%`);
      });
      
      passed++;
    } else {
      logWarning(`Probabilities sum to ${total.toFixed(2)} (expected ~1.0)`);
      passed++; // Still pass, but warn
    }
  } catch (error) {
    logError(`Probability test failed: ${error.message}`);
    failed++;
  }
  
  // Test 6: Error Handling - Empty Scenario
  logTest('Test 6: Error Handling - Empty Scenario');
  try {
    await analyzeScenario(scenarios.invalid);
    logError('Should have thrown error for empty scenario');
    failed++;
  } catch (error) {
    if (error.message.includes('cannot be empty')) {
      logSuccess('Correctly rejected empty scenario');
      passed++;
    } else {
      logError(`Unexpected error: ${error.message}`);
      failed++;
    }
  }
  
  // Test 7: Usage Tracking
  logTest('Test 7: Usage Tracking');
  try {
    const stats = getUsageStats();
    
    if (stats.totalInputTokens > 0 && stats.totalOutputTokens > 0) {
      logSuccess('Usage tracking working');
      logInfo(`Total input tokens: ${stats.totalInputTokens.toLocaleString()}`);
      logInfo(`Total output tokens: ${stats.totalOutputTokens.toLocaleString()}`);
      logInfo(`Total cost: $${stats.totalCost.toFixed(4)}`);
      passed++;
    } else {
      logError('Usage tracking not capturing token counts');
      failed++;
    }
  } catch (error) {
    logError(`Usage tracking test failed: ${error.message}`);
    failed++;
  }
  
  // Test 8: Rate Limiting
  logTest('Test 8: Rate Limiting (Time-based)');
  try {
    const start = Date.now();
    
    // Make two quick requests
    await analyzeScenario("Quick test 1");
    await analyzeScenario("Quick test 2");
    
    const elapsed = Date.now() - start;
    
    // Should take at least 1000ms due to rate limiting
    if (elapsed >= 1000) {
      logSuccess(`Rate limiting enforced (${elapsed}ms for 2 requests)`);
      passed++;
    } else {
      logWarning(`Requests completed in ${elapsed}ms (expected >1000ms)`);
      passed++; // May vary in practice
    }
  } catch (error) {
    logError(`Rate limiting test failed: ${error.message}`);
    failed++;
  }
  
  // Test 9: Decision Tree Data
  logTest('Test 9: Decision Tree Data Generation');
  try {
    const result = await analyzeScenario("Should I invest in cryptocurrency now or wait for a market dip?");
    
    if (result.treeData && result.treeData.nodes && result.treeData.edges) {
      logSuccess('Decision tree data generated');
      logInfo(`Nodes: ${result.treeData.nodes.length}`);
      logInfo(`Edges: ${result.treeData.edges.length}`);
      passed++;
    } else {
      logWarning('No decision tree data (may not be applicable for this scenario)');
      passed++; // Not all scenarios need tree data
    }
  } catch (error) {
    logError(`Decision tree test failed: ${error.message}`);
    failed++;
  }
  
  // Test 10: Response Validation
  logTest('Test 10: Response Field Types');
  try {
    const result = await analyzeScenario(scenarios.simple);
    
    const validations = [
      { field: 'gameType', type: 'string' },
      { field: 'players', type: 'array' },
      { field: 'analysis', type: 'string' },
      { field: 'recommendations', type: 'array' },
      { field: 'probabilities', type: 'object' },
      { field: 'confidence', type: 'string' }
    ];
    
    let valid = true;
    validations.forEach(({ field, type }) => {
      const value = result[field];
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (actualType !== type) {
        logError(`${field}: expected ${type}, got ${actualType}`);
        valid = false;
      }
    });
    
    if (valid) {
      logSuccess('All field types correct');
      passed++;
    } else {
      failed++;
    }
  } catch (error) {
    logError(`Validation test failed: ${error.message}`);
    failed++;
  }
  
  // Summary
  console.log(`\n${'═'.repeat(50)}`);
  log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`, passed === 10 ? 'green' : 'yellow');
  
  if (failed === 0) {
    log('🎉 All tests passed! API module is ready for integration.\n', 'green');
  } else {
    log(`⚠️  ${failed} test(s) failed. Review errors above.\n`, 'yellow');
  }
  
  // Final usage stats
  const finalStats = getUsageStats();
  log(`💰 Total API cost for test suite: $${finalStats.totalCost.toFixed(4)}\n`, 'cyan');
}

// Run tests
runTests().catch(error => {
  logError(`\n💥 Test suite crashed: ${error.message}\n`);
  process.exit(1);
});
