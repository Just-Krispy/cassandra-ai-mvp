/**
 * Streaming Example - Cassandra AI API
 * Shows real-time analysis as Claude generates it
 * 
 * Run with: node examples/streaming-example.js
 */

import { analyzeScenario } from '../api.js';

async function main() {
  console.log('🎯 Cassandra AI - Streaming Analysis Example\n');
  
  const scenario = `
    I'm bidding on a house in a competitive market. There are 3 other bidders.
    The asking price is $500k. I'm willing to pay up to $550k.
    Should I bid my max upfront or incrementally?
  `;
  
  console.log('📝 Scenario:', scenario.trim());
  console.log('\n' + '─'.repeat(80) + '\n');
  console.log('🔄 Streaming analysis (watch it generate in real-time):\n');
  console.log('─'.repeat(80) + '\n');
  
  let fullText = '';
  let lastUpdateTime = Date.now();
  
  try {
    const result = await analyzeScenario(scenario, (chunk, partialData) => {
      // Stream text chunks to console
      process.stdout.write(chunk);
      fullText += chunk;
      
      // Show partial structured data every 2 seconds
      const now = Date.now();
      if (partialData && (now - lastUpdateTime) > 2000) {
        console.log('\n\n' + '─'.repeat(40));
        console.log('📊 Partial Update:');
        if (partialData.gameType) {
          console.log(`  Game Type: ${partialData.gameType}`);
        }
        if (partialData.confidence) {
          console.log(`  Confidence: ${partialData.confidence}`);
        }
        if (partialData.recommendations && partialData.recommendations.length > 0) {
          console.log(`  Recommendations so far: ${partialData.recommendations.length}`);
        }
        console.log('─'.repeat(40) + '\n');
        lastUpdateTime = now;
      }
    });
    
    // Final output
    console.log('\n\n' + '═'.repeat(80));
    console.log('\n✅ Analysis Complete!\n');
    console.log('═'.repeat(80) + '\n');
    
    console.log(`🎮 Game Type: ${result.gameType}`);
    console.log(`👥 Players: ${result.players.join(', ')}`);
    console.log(`🎯 Confidence: ${result.confidence}\n`);
    
    console.log(`💡 Final Recommendations (${result.recommendations.length}):`);
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
    
    // Decision tree if available
    if (result.treeData && result.treeData.nodes) {
      console.log(`🌳 Decision Tree:`);
      console.log(`  Nodes: ${result.treeData.nodes.length}`);
      console.log(`  Edges: ${result.treeData.edges.length}`);
      console.log('');
    }
    
    console.log('─'.repeat(80));
    console.log(`\n💰 Cost: $${result.usage.cost.toFixed(4)}`);
    console.log(`⏱️  Total characters streamed: ${fullText.length.toLocaleString()}`);
    console.log('');
    
  } catch (error) {
    console.error(`\n\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
