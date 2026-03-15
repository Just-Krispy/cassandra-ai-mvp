# Decision Tree Visualization Module

Interactive D3.js-based decision tree visualization for Cassandra AI MVP.

## Features

✅ **Interactive Tree Layout**
- Click nodes to expand/collapse branches
- Smooth animations for tree transitions
- D3 hierarchy rendering with proper spacing

✅ **Node Types**
- **Decision nodes** (blue) - Player choices
- **Chance nodes** (amber) - Uncertain outcomes with probabilities
- **Outcome nodes** (green/red/gray) - Final results color-coded by value

✅ **Visual Features**
- Hover tooltips with detailed information
- Zoom and pan controls (scroll to zoom, drag to pan)
- Color coding for outcomes (green = positive, red = negative)
- Probability labels on edges
- Smooth animations when expanding/collapsing

✅ **Responsive Design**
- Scales to container size
- Mobile-friendly (touch gestures supported)
- Dark mode aesthetic matching landing page
- Responsive text sizing

✅ **Fallback Mode**
- Text-based outline if tree parsing fails
- Still functional and readable
- Graceful degradation

## Files

- **tree-viz.js** - Main visualization module (14.7 KB)
- **tree-viz.css** - Styling and animations (3.9 KB)
- **tree-viz-demo.html** - Live demo with examples (12 KB)

## Quick Start

### 1. Include Dependencies

```html
<!-- D3.js v7 (required) -->
<script src="https://d3js.org/d3.v7.min.js"></script>

<!-- Visualization module -->
<link rel="stylesheet" href="tree-viz.css">
<script src="tree-viz.js"></script>
```

### 2. Create Container

```html
<div id="tree-container" style="width: 100%; height: 700px;"></div>
```

### 3. Render Tree

```javascript
// Get container element
const container = document.getElementById('tree-container');

// Define tree data
const treeData = {
  name: "Should I invest?",
  type: "decision",
  children: [
    {
      name: "Invest $10,000",
      type: "chance",
      probability: "60%",
      children: [
        {
          name: "Startup succeeds",
          type: "outcome",
          value: 50000,
          outcome: "positive",
          probability: "30%"
        },
        {
          name: "Startup fails",
          type: "outcome",
          value: -10000,
          outcome: "negative",
          probability: "70%"
        }
      ]
    },
    {
      name: "Don't invest",
      type: "outcome",
      value: 0,
      outcome: "neutral"
    }
  ]
};

// Render
const viz = renderDecisionTree(treeData, container);
```

## Data Structure

### Tree Node Schema

```javascript
{
  name: string,              // Display name/label
  type: string,              // "decision" | "chance" | "outcome"
  description?: string,      // Optional tooltip detail
  probability?: string,      // e.g. "60%" - shows on edges
  value?: number,           // Numeric value for outcomes
  outcome?: string,         // "positive" | "negative" | "neutral"
  children?: Array<Node>    // Child nodes
}
```

### Node Types

**Decision Node** (blue)
```javascript
{
  name: "Should I do X?",
  type: "decision",
  children: [...]
}
```

**Chance Node** (amber)
```javascript
{
  name: "Option A",
  type: "chance",
  probability: "60%",
  children: [...]
}
```

**Outcome Node** (green/red/gray)
```javascript
{
  name: "Success",
  type: "outcome",
  value: 100,           // Positive value = green
  outcome: "positive",
  probability: "30%"
}
```

## Parsing Claude Responses

The module automatically parses Claude's decision analysis in multiple formats:

### 1. JSON Format (Best)

```javascript
const claudeResponse = `
{
  "name": "Decision",
  "type": "decision",
  "children": [...]
}
`;

renderDecisionTree(claudeResponse, container);
```

### 2. JSON in Code Block

```javascript
const claudeResponse = `
Here's your decision tree:

\`\`\`json
{
  "name": "Decision",
  "type": "decision",
  "children": [...]
}
\`\`\`
`;

renderDecisionTree(claudeResponse, container);
```

### 3. Text Format (Auto-parsed)

```javascript
const claudeResponse = `
Should I learn AI/ML?

- Learn AI/ML
  - Land AI role (40%)
    → Outcome: High salary (+90)
  - Struggle with math (35%)
    → Outcome: Frustration (-30)

- Stick with web dev
  - Master full-stack (50%)
    → Outcome: Steady career (+40)
`;

renderDecisionTree(claudeResponse, container);
```

The parser recognizes:
- Bullet points (`-`, `•`, `*`)
- Outcome indicators (`→`)
- Probability patterns (`(60%)`, `(30% chance)`)
- Indentation-based hierarchy

### 4. Fallback Mode

If parsing fails, automatically displays text outline:
```javascript
renderDecisionTree("Complex unstructured text...", container);
// Shows formatted text fallback
```

## Customization

```javascript
const viz = new DecisionTreeViz(container, {
  width: 1200,
  height: 800,
  nodeRadius: 8,
  fontSize: 14,
  animationDuration: 750,
  colorScheme: {
    decision: '#60a5fa',    // blue
    chance: '#f59e0b',      // amber
    positive: '#10b981',    // green
    negative: '#ef4444',    // red
    neutral: '#9ca3af',     // gray
    background: '#0f172a',  // dark slate
    text: '#f1f5f9',        // light slate
    link: '#475569'         // slate
  }
});

viz.render(treeData);
```

## API Reference

### `renderDecisionTree(treeData, containerElement, options?)`

Main export function for simple integration.

**Parameters:**
- `treeData` - Tree object or Claude response string
- `containerElement` - DOM element to render into
- `options` - Optional configuration object

**Returns:** `DecisionTreeViz` instance

### `DecisionTreeViz` Class

**Constructor:**
```javascript
new DecisionTreeViz(containerElement, options?)
```

**Methods:**
- `render(treeData)` - Render/update tree
- `resize()` - Resize to fit container
- `update(source)` - Internal update method
- `collapse(node)` - Collapse node and children
- `parseClaudeResponse(text)` - Parse text to tree structure

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

**Requirements:**
- ES6+ support
- SVG rendering
- D3.js v7 compatible

## Performance

- **Tree size:** Handles 100+ nodes smoothly
- **Animation:** 750ms default (configurable)
- **Responsive:** Debounced resize (250ms)
- **Memory:** Minimal - no leaks

## Integration with Cassandra AI

### Frontend Flow

```javascript
// 1. User submits decision scenario
const userInput = "Should I invest in this startup?";

// 2. Send to Claude API
const response = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({ scenario: userInput })
});

const claudeAnalysis = await response.json();

// 3. Render decision tree
const container = document.getElementById('tree-viz');
renderDecisionTree(claudeAnalysis.tree, container);
```

### Backend Example (Node.js)

```javascript
// api/analyze.js
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req) {
  const { scenario } = await req.json();
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Analyze this decision and provide a decision tree in JSON format:
      
${scenario}

Return as JSON with this structure:
{
  "name": "decision question",
  "type": "decision",
  "children": [
    {
      "name": "option",
      "type": "chance",
      "probability": "60%",
      "children": [
        {"name": "outcome", "type": "outcome", "value": 100, "outcome": "positive"}
      ]
    }
  ]
}`
    }]
  });

  return Response.json({
    tree: message.content[0].text,
    analysis: message.content[0].text
  });
}
```

## Demo

Open `tree-viz-demo.html` in a browser to see:
- 4 example decision trees
- Interactive controls
- Full feature showcase
- Integration code samples

## Troubleshooting

**Tree not rendering:**
- Check D3.js v7 is loaded
- Verify container has width/height
- Open browser console for errors

**Parsing fails:**
- Use JSON format for reliability
- Check text format follows patterns
- Fallback mode will display text

**Mobile issues:**
- Ensure viewport meta tag is set
- Test touch gestures (pinch zoom, drag)
- Check responsive CSS is loaded

## Next Steps

1. ✅ Integrate with Cassandra AI frontend
2. ✅ Connect to Claude API backend
3. ✅ Add loading states
4. ✅ Implement error handling
5. ✅ Test with real decision scenarios

## License

MIT - Part of Cassandra AI MVP

## Author

Built by Archer 🦞 for Krispy's Cassandra AI project
