# 🚀 Cassandra AI - API Quick Start

Get up and running with the Claude API integration in 5 minutes.

## 1️⃣ Prerequisites

- Node.js 18+ installed
- Anthropic API key ([get one here](https://console.anthropic.com/))

## 2️⃣ Installation

```bash
cd ~/.openclaw/workspace/cassandra-ai-mvp
npm install
```

This installs the Anthropic SDK and all dependencies.

## 3️⃣ Set Your API Key

### Option A: Environment Variable (Recommended)

```bash
export ANTHROPIC_API_KEY='sk-ant-your-key-here'
```

Add to your `~/.bashrc` or `~/.zshrc` to persist:

```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### Option B: In Code (Browser/LocalStorage)

```javascript
localStorage.setItem('ANTHROPIC_API_KEY', 'sk-ant-your-key-here');
```

## 4️⃣ Test Connection

Quick test to verify everything works:

```bash
npm run test:quick
```

Should output:
```
{ success: true, message: 'API connection successful' }
```

## 5️⃣ Run Your First Analysis

### Basic Example

```bash
node examples/basic-usage.js
```

This analyzes a job offer scenario and displays:
- Game type identification
- Strategic analysis
- Actionable recommendations
- Probability estimates
- Cost breakdown

### Streaming Example

```bash
node examples/streaming-example.js
```

Watch the analysis generate in real-time as Claude thinks through the problem.

## 6️⃣ Use in Your Code

### Simple Analysis

```javascript
import { analyzeScenario } from './api.js';

const scenario = "Should I negotiate my salary now or wait until my performance review?";

const result = await analyzeScenario(scenario);

console.log(result.gameType);        // "Sequential Decision Game"
console.log(result.recommendations); // Array of strategic advice
console.log(result.probabilities);   // { negotiate_now: 0.45, wait: 0.55 }
console.log(result.confidence);      // "medium"
```

### With Streaming (Real-time UI Updates)

```javascript
import { analyzeScenario } from './api.js';

const result = await analyzeScenario(scenario, (chunk, partialData) => {
  // Update your UI as chunks arrive
  if (partialData) {
    updateUI(partialData); // Structured data
  } else {
    appendText(chunk);     // Raw text
  }
});
```

## 7️⃣ Run Full Test Suite

```bash
npm test
```

Runs 10 comprehensive tests covering:
- API connection
- Simple & complex scenarios
- Streaming mode
- Multi-player games
- Probability validation
- Error handling
- Usage tracking
- Rate limiting
- Decision tree generation
- Response validation

Expected output:
```
📊 Test Results: 10 passed, 0 failed

🎉 All tests passed! API module is ready for integration.

💰 Total API cost for test suite: $0.15-0.25
```

## 8️⃣ Integration Checklist

Ready to integrate into your app? Check these off:

- [ ] API key configured (env var or localStorage)
- [ ] `npm install` completed successfully
- [ ] Connection test passes (`npm run test:quick`)
- [ ] Reviewed `API_README.md` for detailed docs
- [ ] Tested with your own scenario
- [ ] Error handling implemented in your app
- [ ] Usage tracking enabled (optional but recommended)

## 9️⃣ Next Steps

**For Frontend Integration:**
1. Import `analyzeScenario` into your React/Vue/etc. component
2. Add loading states and error handling
3. Use streaming callback for real-time updates
4. Display results in your UI (see response format in API_README.md)

**For Backend Integration:**
1. Set API key as environment variable on your server
2. Create REST endpoint that calls `analyzeScenario`
3. Add authentication/rate limiting to your endpoint
4. Return structured JSON to frontend

**Example React Component:**

```javascript
import { useState } from 'react';
import { analyzeScenario } from './api.js';

function GameTheoryAnalyzer() {
  const [scenario, setScenario] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await analyzeScenario(scenario, (chunk, partial) => {
        if (partial) setResult(partial); // Real-time updates
      });
      setResult(analysis);
    } catch (err) {
      setError(err.message);
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
        rows={6}
      />
      
      <button onClick={handleAnalyze} disabled={loading || !scenario}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="results">
          <h3>{result.gameType}</h3>
          <p>{result.analysis}</p>
          
          <h4>Recommendations:</h4>
          <ul>
            {result.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
          
          <h4>Probabilities:</h4>
          {Object.entries(result.probabilities).map(([option, prob]) => (
            <div key={option}>
              {option}: {(prob * 100).toFixed(1)}%
              <div className="progress-bar" style={{width: `${prob * 100}%`}} />
            </div>
          ))}
          
          <small>Cost: ${result.usage.cost.toFixed(4)}</small>
        </div>
      )}
    </div>
  );
}
```

## 🔟 Troubleshooting

**"ANTHROPIC_API_KEY not found"**
- Make sure you've set the environment variable
- Try running `echo $ANTHROPIC_API_KEY` to verify
- Restart your terminal after adding to `.bashrc`

**"Rate limit exceeded"**
- Default: 1 request per second minimum
- For faster testing, edit `API_CONFIG.rateLimitDelay` in api.js
- Production: respect Anthropic's rate limits

**"npm: command not found"**
- Install Node.js: https://nodejs.org/
- Or use `nvm`: https://github.com/nvm-sh/nvm

**Import errors**
- Make sure `package.json` has `"type": "module"`
- Use `.js` extension in imports: `from './api.js'` (not `from './api'`)

**Streaming not working**
- Streaming requires the callback parameter: `analyzeScenario(text, onChunk)`
- Check that your `onChunk` function is being called
- Test with `examples/streaming-example.js`

## 📚 Additional Resources

- **API_README.md** - Complete API documentation
- **api.test.js** - Test suite with 10 comprehensive tests
- **examples/basic-usage.js** - Simple analysis example
- **examples/streaming-example.js** - Real-time streaming demo

## 💰 Cost Estimates

Based on Claude Sonnet 4 pricing ($3/$15 per million tokens):

| Scenario Complexity | Avg Cost |
|---------------------|----------|
| Simple (1-2 players, basic decision) | $0.02 |
| Medium (2-3 players, moderate complexity) | $0.03 |
| Complex (multi-player, detailed analysis) | $0.05 |

**Test suite:** ~$0.20 total

**Daily usage estimate:**
- 100 analyses/day = $2-5/day
- 1000 analyses/day = $20-50/day

## ✅ You're Ready!

The API module is production-ready and includes:
- ✅ Direct Claude API integration
- ✅ Streaming support
- ✅ Error handling (rate limits, network, parsing)
- ✅ Cost tracking
- ✅ Rate limiting
- ✅ Prompt engineering (game theory expert)
- ✅ Few-shot examples
- ✅ Structured JSON output
- ✅ Comprehensive tests

**Questions?** Check `API_README.md` or run `npm test` to verify everything works.

---

Built for **Cassandra AI** 🎯 | Your game theory companion
