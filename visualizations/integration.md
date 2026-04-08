# Integrating the Nash Visualization Library

## Quick Start

1. **Copy `viz-library.js`** into your web project.
2. **Include Chart.js & D3.js from CDN**:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://d3js.org/d3.v7.min.js"></script>
```

3. **Load/combine needed component code from `demo.html` or adapt for your UI framework.** Each chart expects a unique `container` (`div` or `canvas`).

4. **Use sample JSON from `/sample-data/` as a reference** when wiring to your data layer.

5. **Style with the Nash theme** using provided CSS classes or variables in `viz-library.js`.

## Typical Integration Flow

- Import `viz-library.js` for shared styles/utilities
- Load Chart.js/D3.js if not present
- Render chart in your component (see demo.html for examples)
- Provide data as per the matching sample in `/sample-data/`

## Theming

Match Nash Intelligence UI guidelines by:
- Using theme colors from `viz-library.js`
- Default dark mode; optionally adapt for light mode

## Export/Interactivity

- All charts rely on standard Chart.js/D3.js interactivity
- Use export helpers inside `viz-library.js` for PNG/SVG snapshots
- Customize tooltips, confidence meters, and cards as needed

---
Questions? Raise issues or DM Archer in Discord 🦞