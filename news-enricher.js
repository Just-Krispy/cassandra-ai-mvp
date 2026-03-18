/**
 * Cassandra AI - News Enricher
 * Enriches scenario prompts with current context via Claude API
 */

(function() {
  'use strict';

  // Track which scenarios have been enriched (rate limit: one per scenario)
  const enrichedScenarios = new Set();

  function getApiKey() {
    return localStorage.getItem('claude-api-key') || localStorage.getItem('ANTHROPIC_API_KEY');
  }

  function hashScenario(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString();
  }

  function setEnrichButtonState(state) {
    const btn = document.getElementById('enrichBtn');
    const spinner = document.getElementById('enrichSpinner');
    const icon = document.getElementById('enrichIcon');
    const label = document.getElementById('enrichLabel');

    if (!btn) return;

    switch (state) {
      case 'loading':
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
        spinner.classList.remove('hidden');
        icon.classList.add('hidden');
        label.textContent = 'Gathering Intel...';
        break;
      case 'done':
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
        spinner.classList.add('hidden');
        icon.classList.remove('hidden');
        label.textContent = 'Intel Added';
        break;
      case 'ready':
      default:
        btn.disabled = false;
        btn.classList.remove('opacity-60', 'cursor-not-allowed');
        spinner.classList.add('hidden');
        icon.classList.remove('hidden');
        label.textContent = 'Enrich with Live Intel';
        break;
    }
  }

  async function enrichScenario() {
    const textarea = document.getElementById('scenario');
    if (!textarea) return;

    const scenarioText = textarea.value.trim();
    if (!scenarioText) {
      alert('Please enter a scenario first.');
      return;
    }

    const hash = hashScenario(scenarioText);
    if (enrichedScenarios.has(hash)) {
      alert('This scenario has already been enriched. Modify the scenario text to enrich again.');
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      alert('API key not found. Please enter your Anthropic API key first.');
      return;
    }

    setEnrichButtonState('loading');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          temperature: 0.2,
          messages: [{
            role: 'user',
            content: `You are a neutral intelligence analyst gathering REAL, CURRENT data to enrich a game theory scenario analysis.

CRITICAL RULES:
1. ONLY state VERIFIED FACTS with specific numbers, dates, and sources
2. Pull from DIVERSE GLOBAL SOURCES to avoid bias:
   - Western: Reuters, AP, BBC, CNN
   - Middle East: Al Jazeera, Arab News, Tehran Times
   - Asian: SCMP, NHK, Times of India
   - European: DW, France24, The Guardian
   - Financial: Bloomberg, FT, OPEC reports
   - Institutional: UN, WHO, World Bank, ACLED
3. For each fact, note the source in parentheses
4. Present ALL sides of contested claims — "X claims..., while Y disputes..."
5. Include economic data: oil prices, currency moves, trade disruptions
6. Include humanitarian data: casualties from ALL sides, displacement, aid
7. Do NOT editorialize or assign blame — just facts
8. Flag any data point where sources disagree

FORMAT: Bullet points, each with source attribution. Group by category:
- Military/Security
- Diplomatic/Political
- Economic/Market
- Humanitarian
- Regional Reactions

SCENARIO TO ENRICH:
${scenarioText}

Search the web for the latest developments and return ONLY verified, sourced facts.`
          }]
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(function() { return {}; });
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your credentials.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error((err.error && err.error.message) || ('API error (' + response.status + ')'));
      }

      const data = await response.json();
      const enrichment = (data.content && data.content[0] && data.content[0].text) || '';

      if (!enrichment) {
        throw new Error('No enrichment data received.');
      }

      textarea.value = scenarioText + '\n\n--- LIVE INTELLIGENCE (multi-source, verified) ---\n' + enrichment;

      if (typeof window.updateCharCount === 'function') {
        window.updateCharCount();
      }

      enrichedScenarios.add(hash);
      setEnrichButtonState('done');

    } catch (error) {
      console.error('News enrichment error:', error);
      alert('Enrichment failed: ' + error.message);
      setEnrichButtonState('ready');
    }
  }

  function monitorTextChanges() {
    const textarea = document.getElementById('scenario');
    if (!textarea) return;

    let lastLength = textarea.value.length;
    textarea.addEventListener('input', function() {
      const currentLength = textarea.value.length;
      if (Math.abs(currentLength - lastLength) > 5 || currentLength < lastLength) {
        if (!textarea.value.includes('--- LIVE INTELLIGENCE')) {
          setEnrichButtonState('ready');
        }
      }
      lastLength = currentLength;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', monitorTextChanges);
  } else {
    monitorTextChanges();
  }

  window.enrichScenario = enrichScenario;
})();
