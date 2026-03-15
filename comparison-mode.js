/**
 * Game Theory AI — Comparison Mode
 * Side-by-side scenario analysis with probability diff.
 */

let _comparisonOpen = false;

function openComparisonMode() {
  const overlay = document.getElementById('comparisonOverlay');
  if (!overlay) return;

  _comparisonOpen = true;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Pre-fill left side with current scenario if available
  const currentScenario = document.getElementById('scenario')?.value || '';
  const leftInput = document.getElementById('compLeft_scenario');
  if (leftInput && currentScenario) leftInput.value = currentScenario;

  // If we have a last result, show it on the left
  if (window.__lastAnalysisResult && typeof formatAnalysisResult === 'function') {
    const leftResults = document.getElementById('compLeft_results');
    leftResults.innerHTML = formatAnalysisResult(window.__lastAnalysisResult);
    leftResults.classList.remove('hidden');
    document.getElementById('compLeft_status').textContent = 'Previous analysis loaded';
    document.getElementById('compLeft_status').style.color = '#4ade80';
    _compLeftResult = window.__lastAnalysisResult;
    updateComparisonSummary();
  }
}

function closeComparisonMode() {
  const overlay = document.getElementById('comparisonOverlay');
  if (!overlay) return;
  _comparisonOpen = false;
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

let _compLeftResult = null;
let _compRightResult = null;

async function runComparisonAnalysis(side) {
  const input = document.getElementById(`comp${side}_scenario`);
  const resultsDiv = document.getElementById(`comp${side}_results`);
  const statusEl = document.getElementById(`comp${side}_status`);
  const btn = document.getElementById(`comp${side}_btn`);

  const scenario = input.value.trim();
  if (!scenario) { statusEl.textContent = 'Enter a scenario first'; statusEl.style.color = '#f87171'; return; }

  const apiKey = localStorage.getItem('claude-api-key') || localStorage.getItem('ANTHROPIC_API_KEY');
  if (!apiKey) { statusEl.textContent = 'API key required'; statusEl.style.color = '#f87171'; return; }

  btn.disabled = true;
  btn.textContent = 'Analyzing...';
  statusEl.textContent = 'Running analysis...';
  statusEl.style.color = '#fbbf24';

  try {
    const result = await analyzeScenario(scenario);

    if (side === 'Left') _compLeftResult = result;
    else _compRightResult = result;

    resultsDiv.innerHTML = formatAnalysisResult(result);
    resultsDiv.classList.remove('hidden');
    statusEl.textContent = 'Analysis complete';
    statusEl.style.color = '#4ade80';

    updateComparisonSummary();
  } catch (err) {
    statusEl.textContent = 'Error: ' + (err.message || 'Analysis failed');
    statusEl.style.color = '#f87171';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Analyze';
  }
}

function updateComparisonSummary() {
  const summaryDiv = document.getElementById('compSummary');
  if (!_compLeftResult || !_compRightResult) {
    summaryDiv.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px">Run both analyses to see comparison</p>';
    return;
  }

  const leftProbs = _compLeftResult.probabilities || {};
  const rightProbs = _compRightResult.probabilities || {};

  // Merge all outcome keys
  const allKeys = [...new Set([...Object.keys(leftProbs), ...Object.keys(rightProbs)])];

  let html = '<div style="display:grid;gap:12px">';

  // Header
  html += `<div style="display:grid;grid-template-columns:1fr 60px 1fr;gap:8px;text-align:center;font-size:12px;color:#94a3b8;padding-bottom:8px;border-bottom:1px solid #374151">
    <span style="color:#22d3ee;font-weight:600">Scenario A</span>
    <span>vs</span>
    <span style="color:#e879f9;font-weight:600">Scenario B</span>
  </div>`;

  // Game type comparison
  html += `<div style="display:grid;grid-template-columns:1fr 60px 1fr;gap:8px;font-size:13px">
    <span style="color:#e2e8f0">${_compLeftResult.gameType || 'N/A'}</span>
    <span style="color:#94a3b8;text-align:center;font-size:11px">Type</span>
    <span style="color:#e2e8f0;text-align:right">${_compRightResult.gameType || 'N/A'}</span>
  </div>`;

  // Probability comparison bars
  allKeys.forEach(key => {
    const leftVal = (leftProbs[key] || 0) * 100;
    const rightVal = (rightProbs[key] || 0) * 100;
    const diff = rightVal - leftVal;
    const diffColor = diff > 0 ? '#4ade80' : diff < 0 ? '#f87171' : '#94a3b8';
    const diffStr = diff > 0 ? '+' + diff.toFixed(0) + '%' : diff.toFixed(0) + '%';

    html += `<div style="background:#1f2937;border-radius:8px;padding:10px">
      <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${key.replace(/_/g, ' ')}</div>
      <div style="display:grid;grid-template-columns:1fr 50px 1fr;gap:8px;align-items:center">
        <div>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
            <span style="color:#22d3ee">${leftVal.toFixed(0)}%</span>
          </div>
          <div style="background:#374151;border-radius:4px;height:6px;overflow:hidden">
            <div style="background:#22d3ee;height:100%;width:${leftVal}%;border-radius:4px"></div>
          </div>
        </div>
        <div style="text-align:center;font-size:11px;font-weight:600;color:${diffColor}">${diff !== 0 ? diffStr : '='}</div>
        <div>
          <div style="display:flex;justify-content:flex-end;font-size:12px;margin-bottom:3px">
            <span style="color:#e879f9">${rightVal.toFixed(0)}%</span>
          </div>
          <div style="background:#374151;border-radius:4px;height:6px;overflow:hidden;direction:rtl">
            <div style="background:#e879f9;height:100%;width:${rightVal}%;border-radius:4px"></div>
          </div>
        </div>
      </div>
    </div>`;
  });

  // Confidence comparison
  html += `<div style="display:grid;grid-template-columns:1fr 60px 1fr;gap:8px;font-size:12px;padding-top:8px;border-top:1px solid #374151">
    <span style="color:#22d3ee">Confidence: ${_compLeftResult.confidence || 'N/A'}</span>
    <span></span>
    <span style="color:#e879f9;text-align:right">Confidence: ${_compRightResult.confidence || 'N/A'}</span>
  </div>`;

  html += '</div>';
  summaryDiv.innerHTML = html;
}

// Exports
window.openComparisonMode = openComparisonMode;
window.closeComparisonMode = closeComparisonMode;
window.runComparisonAnalysis = runComparisonAnalysis;
