/**
 * Cassandra AI - Claude API Integration
 * Game Theory Analysis Module
 */

import Anthropic from '@anthropic-ai/sdk';

// Configuration
const API_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.7,
  rateLimitDelay: 1000, // ms between requests
  costPerMillionInputTokens: 3.00,
  costPerMillionOutputTokens: 15.00
};

// Rate limiting state
let lastRequestTime = 0;
let totalInputTokens = 0;
let totalOutputTokens = 0;

/**
 * Get Anthropic client instance
 */
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY || localStorage?.getItem('ANTHROPIC_API_KEY');
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not found. Set it as an environment variable or in localStorage.');
  }
  
  return new Anthropic({ apiKey });
}

/**
 * Rate limiting - enforce minimum delay between requests
 */
async function enforceRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < API_CONFIG.rateLimitDelay) {
    const delay = API_CONFIG.rateLimitDelay - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Track token usage and costs
 */
function trackUsage(inputTokens, outputTokens) {
  totalInputTokens += inputTokens;
  totalOutputTokens += outputTokens;
  
  const inputCost = (inputTokens / 1_000_000) * API_CONFIG.costPerMillionInputTokens;
  const outputCost = (outputTokens / 1_000_000) * API_CONFIG.costPerMillionOutputTokens;
  const totalCost = inputCost + outputCost;
  
  return {
    inputTokens,
    outputTokens,
    cost: totalCost,
    totalInputTokens,
    totalOutputTokens,
    totalCost: (totalInputTokens / 1_000_000) * API_CONFIG.costPerMillionInputTokens +
               (totalOutputTokens / 1_000_000) * API_CONFIG.costPerMillionOutputTokens
  };
}

/**
 * Get current usage statistics
 */
export function getUsageStats() {
  return {
    totalInputTokens,
    totalOutputTokens,
    totalCost: (totalInputTokens / 1_000_000) * API_CONFIG.costPerMillionInputTokens +
               (totalOutputTokens / 1_000_000) * API_CONFIG.costPerMillionOutputTokens,
    requestsMade: Math.floor(totalInputTokens / 1000) // rough estimate
  };
}

/**
 * System prompt for game theory expert persona
 */
const SYSTEM_PROMPT = `You are a world-class game theory expert and strategic advisor. Your specialty is analyzing decision scenarios through the lens of game theory, identifying optimal strategies, and providing actionable recommendations.

Your analysis should:
- Identify the type of game (sequential, simultaneous, cooperative, zero-sum, etc.)
- Map out all players and their objectives
- Construct payoff matrices when applicable
- Identify Nash equilibria and dominant strategies
- Provide probability estimates with confidence intervals
- Highlight key assumptions that should be validated
- Give clear, actionable strategic recommendations

CRITICAL: You MUST respond with valid JSON in the exact format specified. Do not add any text before or after the JSON object.`;

/**
 * Few-shot examples for prompt engineering
 */
const FEW_SHOT_EXAMPLES = [
  {
    scenario: "Should I accept a job offer with 20% more pay but a longer commute, or stay at my current job where I'm comfortable?",
    response: {
      gameType: "Sequential Decision Game (Single Player)",
      players: ["You"],
      analysis: "This is a single-player decision problem with two clear options. The key factors are monetary gain vs. quality of life (commute time, comfort). The decision has long-term implications affecting career trajectory, daily stress, and financial security.",
      recommendations: [
        "Calculate the true hourly rate after accounting for commute time",
        "Test the commute during rush hour to assess realistic impact",
        "Negotiate for remote work days to offset commute burden",
        "Consider the career growth potential at each position beyond salary"
      ],
      probabilities: {
        "accept_new_job": 0.45,
        "stay_current_job": 0.55
      },
      confidence: "medium",
      assumptions: [
        "Commute time has consistent value/cost to you",
        "No major changes expected at current job",
        "20% salary increase is guaranteed and sustainable",
        "Comfort at current job won't lead to stagnation"
      ],
      treeData: null
    }
  },
  {
    scenario: "Two tech companies are deciding whether to cooperate on a new standard or compete with proprietary solutions.",
    response: {
      gameType: "Simultaneous Game (Prisoner's Dilemma variant)",
      players: ["Company A", "Company B"],
      analysis: "Classic coordination problem with elements of the Prisoner's Dilemma. Both companies benefit most from cooperation (industry-wide standard adoption), but each has an incentive to defect and establish their proprietary solution if the other cooperates. The Nash equilibrium may not align with the Pareto optimal outcome.",
      payoffMatrix: {
        "A_cooperate_B_cooperate": { A: 8, B: 8 },
        "A_cooperate_B_compete": { A: 2, B: 10 },
        "A_compete_B_cooperate": { A: 10, B: 2 },
        "A_compete_B_compete": { A: 4, B: 4 }
      },
      nashEquilibrium: ["Both compete (4,4) - suboptimal but stable"],
      recommendations: [
        "Establish binding commitments or contracts before proceeding",
        "Use phased cooperation with checkpoints to build trust",
        "Involve third-party standards body as enforcement mechanism",
        "Publicly announce cooperation to create reputational stakes"
      ],
      probabilities: {
        "both_cooperate": 0.30,
        "both_compete": 0.50,
        "mixed": 0.20
      },
      confidence: "high",
      assumptions: [
        "No significant power imbalance between companies",
        "Market won't support multiple competing standards long-term",
        "No regulatory pressure to cooperate",
        "Reputation costs of defection are moderate"
      ]
    }
  },
  {
    scenario: "I'm at an auction for a vintage guitar. Should I bid aggressively early or wait and bid at the last moment?",
    response: {
      gameType: "Dynamic Auction Game (English Auction)",
      players: ["You", "Other Bidders (unknown count)"],
      analysis: "This is an ascending-bid auction with incomplete information. Your strategy depends on whether it's a private-value auction (guitar's value is personal) or common-value auction (objective market value). Early aggressive bidding signals strong interest and may discourage competitors, but also reveals your valuation ceiling. Last-moment bidding preserves information but risks being outbid.",
      recommendations: [
        "Set a strict maximum bid based on your personal valuation (not market sentiment)",
        "If private value: bid incrementally to just above competitors until your max",
        "If common value: wait to observe others' signals about true market value",
        "Watch for signs of 'auction fever' in yourself - stick to your max",
        "Consider the winner's curse if many bidders are involved"
      ],
      probabilities: {
        "aggressive_early_bidding_optimal": 0.35,
        "patient_incremental_optimal": 0.45,
        "snipe_bidding_optimal": 0.20
      },
      confidence: "medium",
      assumptions: [
        "Auction follows standard English auction rules",
        "You have a clear personal valuation independent of others",
        "Other bidders are rational (not emotionally driven)",
        "No collusion among other bidders"
      ],
      treeData: {
        nodes: [
          { id: 'start', label: 'Auction Begins' },
          { id: 'bid_early', label: 'Bid Early/Aggressively' },
          { id: 'wait', label: 'Wait & Observe' },
          { id: 'win_early', label: 'Win (potential overpay)' },
          { id: 'scare_off', label: 'Scare off competition' },
          { id: 'bid_war', label: 'Bid war ensues' },
          { id: 'snipe', label: 'Last-moment bid' },
          { id: 'win_snipe', label: 'Win at better price' },
          { id: 'lose', label: 'Lose auction' }
        ],
        edges: [
          { from: 'start', to: 'bid_early', label: '35%' },
          { from: 'start', to: 'wait', label: '65%' },
          { from: 'bid_early', to: 'win_early', label: '40%' },
          { from: 'bid_early', to: 'scare_off', label: '30%' },
          { from: 'bid_early', to: 'bid_war', label: '30%' },
          { from: 'wait', to: 'snipe', label: '70%' },
          { from: 'wait', to: 'lose', label: '30%' },
          { from: 'snipe', to: 'win_snipe', label: '60%' },
          { from: 'snipe', to: 'lose', label: '40%' }
        ]
      }
    }
  }
];

/**
 * Build the analysis prompt with few-shot examples
 */
function buildPrompt(scenarioText) {
  const examplesText = FEW_SHOT_EXAMPLES.map((ex, i) => 
    `Example ${i + 1}:
SCENARIO: ${ex.scenario}
RESPONSE: ${JSON.stringify(ex.response, null, 2)}`
  ).join('\n\n---\n\n');

  return `${examplesText}

---

Now analyze this scenario:
SCENARIO: ${scenarioText}

Respond with ONLY a valid JSON object in this exact format:
{
  "gameType": "string - type of game theory scenario",
  "players": ["array of player names/roles"],
  "analysis": "string - detailed narrative analysis",
  "recommendations": ["array of actionable recommendations"],
  "probabilities": {
    "option_name": 0.XX
  },
  "confidence": "low|medium|high",
  "assumptions": ["array of key assumptions to validate"],
  "payoffMatrix": {optional - if applicable},
  "nashEquilibrium": ["array - if applicable"],
  "treeData": {optional - nodes and edges if complex decision tree}
}

RESPONSE:`;
}

/**
 * Parse and validate Claude's response
 */
function parseResponse(text) {
  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanText);
    
    // Validate required fields
    const required = ['gameType', 'players', 'analysis', 'recommendations', 'probabilities', 'confidence'];
    for (const field of required) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse Claude response: ${error.message}\nRaw response: ${text}`);
  }
}

/**
 * Analyze a game theory scenario (streaming version)
 * 
 * @param {string} scenarioText - The scenario to analyze
 * @param {function} onChunk - Callback for streaming chunks (text, parsedData)
 * @returns {Promise<Object>} Complete analysis result with usage stats
 */
export async function analyzeScenario(scenarioText, onChunk = null) {
  if (!scenarioText || scenarioText.trim().length === 0) {
    throw new Error('Scenario text cannot be empty');
  }

  await enforceRateLimit();
  
  const client = getClient();
  const prompt = buildPrompt(scenarioText);
  
  try {
    if (onChunk) {
      // Streaming mode
      let fullText = '';
      
      const stream = await client.messages.create({
        model: API_CONFIG.model,
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const chunk = event.delta.text;
          fullText += chunk;
          
          // Try to parse incrementally (for UI updates)
          try {
            const partial = parseResponse(fullText);
            onChunk(chunk, partial);
          } catch {
            // Not yet valid JSON, just send the text chunk
            onChunk(chunk, null);
          }
        }
        
        if (event.type === 'message_delta' && event.usage) {
          // Track final usage
          const usage = trackUsage(event.usage.input_tokens || 0, event.usage.output_tokens || 0);
        }
      }
      
      const result = parseResponse(fullText);
      
      return {
        ...result,
        usage: getUsageStats(),
        rawResponse: fullText
      };
      
    } else {
      // Non-streaming mode
      const response = await client.messages.create({
        model: API_CONFIG.model,
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }]
      });

      const usage = trackUsage(response.usage.input_tokens, response.usage.output_tokens);
      const text = response.content[0].text;
      const result = parseResponse(text);
      
      return {
        ...result,
        usage,
        rawResponse: text
      };
    }
    
  } catch (error) {
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    } else if (error.status === 401) {
      throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY.');
    } else if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error(`API request failed: ${error.message}`);
    }
  }
}

/**
 * Reset usage tracking (useful for testing or daily resets)
 */
export function resetUsageTracking() {
  totalInputTokens = 0;
  totalOutputTokens = 0;
}

/**
 * Test the API connection
 */
export async function testConnection() {
  try {
    const client = getClient();
    await client.messages.create({
      model: API_CONFIG.model,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }]
    });
    return { success: true, message: 'API connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export default {
  analyzeScenario,
  getUsageStats,
  resetUsageTracking,
  testConnection
};
