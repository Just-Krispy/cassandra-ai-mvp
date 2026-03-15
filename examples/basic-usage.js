/**
 * Basic Usage Example - Cassandra AI API
 * 
 * Run with: node examples/basic-usage.js
 */

import { analyzeScenario, getUsageStats } from '../api.js';

async function main() {
  console.log('🎯 Cassandra AI - Basic Usage Example\n');
  
  const scenario = `
    I'm considering two job offers:
    
    Offer A: $120k/year, fully remote, startup (50 employees), equity package, high growth potential but risky
    Offer B: $105k/year, hybrid (3 days office), Fortune 500 company, stable, good benefits, slower growth
    
    I have a family and a mortgage. What should I consider?
  `;
  
  console.log('📝 Analyzing scenario...\n');
  console.log('Scenario:', scenario.trim());
  console.log('\n' + '─'.repeat(80) + '\n');
  
  try {
    // Non-streaming analysis
    const result = await analyzeScenario(scenario);
    
    // Display results
    console.log(`🎮 Game Type: ${result.gameType}\n`);
    
    console.log(`👥 Players: ${result.players.join(', ')}\n`);
    
    console.log(`📊 Analysis:`);
    console.log(result.analysis);
    console.log('');
    
    console.log(`💡 Recommendations:`);
    result.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    console.log('');
    
    console.log(`🎲 Probabilities:`);
    Object.entries(result.probabilities).forEach(([option, prob]) => {
      const percentage = (prob * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(prob * 30));
      console.log(`  ${option}: ${percentage}% ${bar}`);
    });
    console.log('');
    
    console.log(`🎯 Confidence: ${result.confidence}`);
    console.log('');
    
    console.log(`🔍 Key Assumptions to Validate:`);
    if (result.assumptions) {
      result.assumptions.forEach((assumption, i) => {
        console.log(`  ${i + 1}. ${assumption}`);
      });
    } else {
      console.log('  (None specified)');
    }
    console.log('');
    
    // Usage stats
    console.log('─'.repeat(80));
    console.log(`\n💰 API Usage:`);
    console.log(`  Input tokens: ${result.usage.inputTokens.toLocaleString()}`);
    console.log(`  Output tokens: ${result.usage.outputTokens.toLocaleString()}`);
    console.log(`  Cost: $${result.usage.cost.toFixed(4)}`);
    console.log('');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
