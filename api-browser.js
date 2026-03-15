/**
 * Cassandra AI - Claude API Integration (Browser Version)
 * Game Theory Analysis Module
 */

// Configuration
const API_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.7,
  apiVersion: '2023-06-01',
  endpoint: 'https://api.anthropic.com/v1/messages',
  rateLimitDelay: 1000, // ms between requests
  costPerMillionInputTokens: 3.00,
  costPerMillionOutputTokens: 15.00
};

// Rate limiting state
let lastRequestTime = 0;
let totalInputTokens = 0;
let totalOutputTokens = 0;

/**
 * Get API key from localStorage
 */
function getApiKey() {
  const apiKey = localStorage.getItem('claude-api-key') || localStorage.getItem('ANTHROPIC_API_KEY');
  
  if (!apiKey) {
    throw new Error('API key not found. Please enter your Anthropic API key.');
  }
  
  return apiKey;
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
      ]
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
  "nashEquilibrium": ["array - if applicable"]
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
 * Make API request to Claude
 */
async function makeApiRequest(messages, apiKey) {
  const response = await fetch(API_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': API_CONFIG.apiVersion,
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      max_tokens: API_CONFIG.maxTokens,
      temperature: API_CONFIG.temperature,
      system: SYSTEM_PROMPT,
      messages: messages
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    } else if (response.status === 401) {
      throw new Error('Invalid API key. Please check your credentials and try again.');
    } else if (response.status === 400) {
      throw new Error(`Bad request: ${error.error?.message || 'Invalid request format'}`);
    } else {
      throw new Error(`API request failed (${response.status}): ${error.error?.message || 'Unknown error'}`);
    }
  }

  return await response.json();
}

/**
 * Analyze a game theory scenario
 * 
 * @param {string} scenarioText - The scenario to analyze
 * @returns {Promise<Object>} Complete analysis result with usage stats
 */
export async function analyzeScenario(scenarioText) {
  if (!scenarioText || scenarioText.trim().length === 0) {
    throw new Error('Scenario text cannot be empty');
  }

  await enforceRateLimit();
  
  const apiKey = getApiKey();
  const prompt = buildPrompt(scenarioText);
  
  try {
    const response = await makeApiRequest([
      { role: 'user', content: prompt }
    ], apiKey);

    const usage = trackUsage(
      response.usage?.input_tokens || 0,
      response.usage?.output_tokens || 0
    );
    
    const text = response.content?.[0]?.text || '';
    
    if (!text) {
      throw new Error('No response text received from API');
    }
    
    const result = parseResponse(text);
    
    return {
      ...result,
      usage,
      rawResponse: text
    };
    
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
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
    const apiKey = getApiKey();
    await makeApiRequest([
      { role: 'user', content: 'Hello' }
    ], apiKey);
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
