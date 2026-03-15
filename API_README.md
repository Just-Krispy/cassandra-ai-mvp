# Cassandra AI - API Module Documentation

## Overview

Complete Claude API integration for game theory scenario analysis with streaming support, error handling, cost tracking, and rate limiting.

## Features

✅ **Direct Claude API Integration** - Uses Anthropic SDK
✅ **Streaming Support** - Real-time analysis as it generates
✅ **Error Handling** - Rate limits, network errors, invalid responses
✅ **Cost Tracking** - Token usage and cost estimates
✅ **Rate Limiting** - Prevents API spam
✅ **Prompt Engineering** - Game theory expert persona with few-shot examples
✅ **Structured Output** - Validated JSON responses

## Installation

```bash
npm install @anthropic-ai/sdk
```

## Setup

### Option 1: Environment Variable (Recommended)
```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

### Option 2: LocalStorage (Browser)
```javascript
localStorage.setItem('ANTHROPIC_API_KEY', 'your-api-key-here');
```

## Usage

### Basic (Non-Streaming)

```javascript
import { analyzeScenario } from './api.js';

const scenario = "Should I invest in stocks or bonds given current market volatility?";

try {
  const result = await analyzeScenario(scenario);
  
  console.log('Game Type:', result.gameType);
  console.log('Analysis:', result.analysis);
  console.log('Recommendations:', result.recommendations);
  console.log('Probabilities:', result.probabilities);
  console.log('Confidence:', result.confidence);
  console.log('Cost:', `$${result.usage.cost.toFixed(4)}`);
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

### Streaming (Real-time Updates)

```javascript
import { analyzeScenario } from './api.js';

const scenario = "Should I negotiate salary now or wait for annual review?";

try {
  const result = await analyzeScenario(scenario, (chunk, partialData) => {
    // Update UI in real-time
    if (partialData) {
      // Valid JSON parsed - update structured data
      updateUI(partialData);
    } else {
      // Just text chunk - append to display
      appendText(chunk);
    }
  });
  
  console.log('Final result:', result);
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

## Response Format

All responses follow this structure:

```javascript
{
  "gameType": "Sequential Decision Game",
  "players": ["You", "Employer"],
  "analysis": "Detailed narrative analysis of the scenario...",
  "recommendations": [
    "Research market salary data for your role",
    "Document your achievements since last review",
    "Consider timing relative to company budget cycles"
  ],
  "probabilities": {
    "negotiate_now": 0.45,
    "wait_for_review": 0.55
  },
  "confidence": "medium",
  "assumptions": [
    "Company follows standard annual review cycle",
    "Your performance has been strong",
    "No major budget constraints at company"
  ],
  "payoffMatrix": { /* optional - for multi-player games */ },
  "nashEquilibrium": [ /* optional - if applicable */ ],
  "treeData": { /* optional - for complex decision trees */
    "nodes": [...],
    "edges": [...]
  },
  "usage": {
    "inputTokens": 1250,
    "outputTokens": 890,
    "cost": 0.0171,
    "totalInputTokens": 5430,
    "totalOutputTokens": 3120,
    "totalCost": 0.0631
  },
  "rawResponse": "..." // Original Claude response text
}
```

## Utility Functions

### Get Usage Statistics

```javascript
import { getUsageStats } from './api.js';

const stats = getUsageStats();
console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);
console.log(`Total tokens: ${stats.totalInputTokens + stats.totalOutputTokens}`);
```

### Reset Usage Tracking

```javascript
import { resetUsageTracking } from './api.js';

// Useful for daily resets or testing
resetUsageTracking();
```

### Test API Connection

```javascript
import { testConnection } from './api.js';

const test = await testConnection();
if (test.success) {
  console.log('✅ API connected successfully');
} else {
  console.error('❌ Connection failed:', test.message);
}
```

## Error Handling

The module handles these error types:

**Rate Limits (429)**
```javascript
Error: Rate limit exceeded. Please wait before making another request.
```

**Authentication (401)**
```javascript
Error: Invalid API key. Please check your ANTHROPIC_API_KEY.
```

**Network Issues**
```javascript
Error: Network error. Please check your internet connection.
```

**Invalid Responses**
```javascript
Error: Failed to parse Claude response: Missing required field: gameType
```

**Empty Input**
```javascript
Error: Scenario text cannot be empty
```

## Rate Limiting

- Minimum 1000ms delay between requests
- Automatic enforcement
- Prevents API spam and quota exhaustion

## Cost Tracking

Current model: **Claude Sonnet 4 (2025-05-14)**

- Input: $3.00 per million tokens
- Output: $15.00 per million tokens

Average scenario analysis cost: **$0.02 - $0.05**

## Prompt Engineering Details

### System Prompt
Game theory expert persona with specific analysis requirements:
- Game type identification
- Player mapping
- Payoff matrices
- Nash equilibrium analysis
- Probability estimates with confidence
- Key assumptions to validate
- Actionable recommendations

### Few-Shot Examples
Three diverse scenarios included:
1. **Career decision** - Job offer evaluation
2. **Business strategy** - Cooperation vs competition (Prisoner's Dilemma)
3. **Auction strategy** - Bidding tactics (English auction)

### Response Validation
Ensures all required fields are present:
- `gameType` (string)
- `players` (array)
- `analysis` (string)
- `recommendations` (array)
- `probabilities` (object)
- `confidence` (string: low/medium/high)

## Integration Example

```javascript
// Example: Integrate with React component
import { useState } from 'react';
import { analyzeScenario } from './api.js';

function ScenarioAnalyzer() {
  const [scenario, setScenario] = useState('');
  const [result, setResult] = useState(null);
  const [streaming, setStreaming] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setStreaming('');
    
    try {
      const analysis = await analyzeScenario(scenario, (chunk, partial) => {
        setStreaming(prev => prev + chunk);
        if (partial) {
          setResult(partial); // Update with partial data
        }
      });
      
      setResult(analysis);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        placeholder="Describe your decision scenario..."
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      
      {streaming && <pre>{streaming}</pre>}
      
      {result && (
        <div>
          <h3>{result.gameType}</h3>
          <p>{result.analysis}</p>
          <h4>Recommendations:</h4>
          <ul>
            {result.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
          <p>Cost: ${result.usage.cost.toFixed(4)}</p>
        </div>
      )}
    </div>
  );
}
```

## Testing

See `api.test.js` for comprehensive test suite.

```bash
node api.test.js
```

## Performance

- **Response time:** 3-8 seconds (depending on complexity)
- **Streaming latency:** ~200ms to first token
- **Token usage:** 800-2000 input, 600-1500 output (typical)

## Security

- API keys never logged or exposed
- Support for environment variables (server) and localStorage (browser)
- No scenario data stored or transmitted beyond API call

## Troubleshooting

**"ANTHROPIC_API_KEY not found"**
→ Set the API key as environment variable or localStorage

**"Rate limit exceeded"**
→ Wait 60 seconds between requests (or increase `rateLimitDelay`)

**"Failed to parse Claude response"**
→ Check that model is responding with valid JSON (rare, usually self-corrects)

**Network timeout**
→ Increase `maxTokens` if scenarios are very complex

## Future Enhancements

- [ ] Multi-model support (Opus for complex scenarios, Haiku for simple)
- [ ] Caching for repeated scenario patterns
- [ ] Batch analysis API
- [ ] WebSocket streaming (for real-time collaboration)
- [ ] Historical analysis comparison

## License

MIT

---

Built for **Cassandra AI** - Your game theory decision companion 🎯
