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

  function setButtonState(btnId, spinnerId, iconId, labelId, state, readyText) {
    const btn = document.getElementById(btnId);
    const spinner = document.getElementById(spinnerId);
    const icon = document.getElementById(iconId);
    const label = document.getElementById(labelId);

    if (!btn) return;

    switch (state) {
      case 'loading':
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
        spinner.classList.remove('hidden');
        icon.classList.add('hidden');
        label.textContent = 'Enriching...';
        break;
      case 'done':
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
        spinner.classList.add('hidden');
        icon.classList.remove('hidden');
        label.textContent = 'Enriched';
        break;
      case 'ready':
      default:
        btn.disabled = false;
        btn.classList.remove('opacity-60', 'cursor-not-allowed');
        spinner.classList.add('hidden');
        icon.classList.remove('hidden');
        label.textContent = readyText;
        break;
    }
  }

  function setEnrichButtonState(state) {
    setButtonState('enrichBtn', 'enrichSpinner', 'enrichIcon', 'enrichLabel', state, 'Enrich with News');
  }

  function setHistoryButtonState(state) {
    setButtonState('historyBtn', 'historySpinner', 'historyIcon', 'historyLabel', state, 'Enrich with History');
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
          max_tokens: 4096,
          temperature: 0.2,
          tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 10 }],
          messages: [{
            role: 'user',
            content: `You are a neutral intelligence analyst gathering REAL-TIME, BREAKING, CURRENT news to enrich a game theory scenario analysis.

TODAY'S DATE: ${new Date().toISOString().slice(0,10)}

MANDATORY: Use the web_search tool to find ONLY the LATEST news and data. Search for developments from the LAST 48 HOURS and up to 7 DAYS MAX. Do NOT include historical context, background, or training data — this is a LIVE NEWS feed ONLY. If you cannot find a current source, say so rather than guessing. Every data point must be from the current week.

CRITICAL RULES:
1. ONLY state VERIFIED FACTS with specific numbers, dates, and sources
2. Pull from the WIDEST POSSIBLE range of GLOBAL SOURCES to fight bias:
   - Wire Services: Reuters, AP, AFP, Xinhua, TASS, Anadolu Agency
   - US/UK: CNN, BBC, NPR, NYT, Washington Post, Wall Street Journal, The Economist
   - Middle East: Al Jazeera, Al Arabiya, Arab News, Tehran Times, Haaretz, Times of Israel, Middle East Eye
   - Asian: SCMP, NHK, Nikkei Asia, Times of India, Hindustan Times, Channel News Asia, Straits Times
   - European: DW, France24, The Guardian, Der Spiegel, Le Monde, EuroNews, Politico EU
   - African: Africa News, Daily Maverick, The East African, Nation Africa
   - Latin American: EFE, Folha de S.Paulo, La Nacion, Infobae
   - Russian/Post-Soviet: RT (flag as state media), TASS (flag as state media), Moscow Times, Meduza
   - Financial/Markets: Bloomberg, Financial Times, CNBC, MarketWatch, Oil Price, S&P Global, OPEC Monthly Report
   - Defense/Security: Jane's, IISS, RUSI, War on the Rocks, Defense One, The War Zone
   - Think Tanks: RAND, Brookings, CFR, Chatham House, Carnegie, SIPRI, Crisis Group, Atlantic Council
   - Institutional/Data: UN OCHA, WHO, World Bank, IMF, ACLED, UNHCR, IAEA, Amnesty International, HRW
   - Open Source Intel: Bellingcat, OSINT aggregators, satellite imagery reports
   - Social/Ground Truth: Verified journalist accounts, official government statements, military communiques
3. For each fact, note the source in parentheses
4. Present ALL sides of contested claims — "X claims..., while Y disputes..."
5. Include economic data: oil prices, currency moves, trade disruptions
6. Include humanitarian data: casualties from ALL sides, displacement, aid
7. Do NOT editorialize or assign blame — just facts
8. Flag any data point where sources disagree

FORMAT: Bullet points, each with source attribution. Group by category:
- Military/Security (troop movements, strikes, casualties from ALL sides, weapons used, defense systems)
- Diplomatic/Political (negotiations, UN votes, sanctions, statements from each government)
- Economic/Market (oil prices, currency moves, trade disruptions, sanctions impact, shipping insurance rates, stock markets)
- Humanitarian (civilian casualties ALL sides, displacement numbers, aid access, infrastructure damage, food/water/medical)
- Intelligence/OSINT (satellite imagery findings, verified social media, intercepted communications if public)
- Regional Reactions (neighboring countries' positions, military posture changes, alliance shifts)
- Domestic Politics (polling in each country, protests, political opposition statements, election impacts)
- Legal/International Law (ICJ rulings, war crimes allegations from both sides, Geneva Convention issues)
- Information Warfare (competing narratives, disinformation identified, media restrictions, internet shutdowns)
- Long-term Projections (think tank forecasts, economic modeling, reconstruction estimates)

IMPORTANT: For EVERY contested fact, present it as: "Source A reports X, while Source B reports Y"
Flag ALL state media sources explicitly: (TASS - Russian state media), (IRNA - Iranian state media), etc.
Include data freshness: note the date of each data point where possible.

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
      // With web_search tool, response has multiple content blocks (tool_use, search_results, text)
      // Extract all text blocks and combine them
      let enrichment = '';
      if (data.content && Array.isArray(data.content)) {
        for (const block of data.content) {
          if (block.type === 'text' && block.text) {
            enrichment += block.text + '\n';
          }
        }
      }
      enrichment = enrichment.trim();

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

  async function enrichWithHistory() {
    const textarea = document.getElementById('scenario');
    if (!textarea) return;

    const scenarioText = textarea.value.trim();
    if (!scenarioText) {
      alert('Please enter a scenario first.');
      return;
    }

    const hash = 'hist_' + hashScenario(scenarioText);
    if (enrichedScenarios.has(hash)) {
      alert('This scenario has already been enriched with history. Modify the scenario text to enrich again.');
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      alert('API key not found. Please enter your Anthropic API key first.');
      return;
    }

    setHistoryButtonState('loading');

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
          max_tokens: 4096,
          temperature: 0.3,
          tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 10 }],
          messages: [{
            role: 'user',
            content: `You are a historian and game theory analyst. Your job is to enrich a scenario with HISTORICAL parallels, precedents, and pattern analysis — NOT current news.

TODAY'S DATE: ${new Date().toISOString().slice(0,10)}

MANDATORY: Use web_search to find historical data, academic sources, and archived analyses. Search for HISTORICAL PRECEDENTS and ANALOGOUS SITUATIONS from the past — wars, treaties, crises, economic events, political decisions that mirror or inform the user's scenario.

CRITICAL RULES:
1. Focus EXCLUSIVELY on historical data — NO current news or live developments
2. Find the closest historical analogues to the scenario described
3. For each historical parallel, provide: what happened, why it's relevant, and what the outcome was
4. Include specific dates, figures, casualty numbers, economic impacts from historical events
5. Reference academic papers, historical archives, and expert analyses where possible
6. Identify patterns: What happened when leaders made similar choices in the past?
7. Include game theory outcomes from historical crises (who won, who lost, what was the Nash equilibrium)

FORMAT YOUR RESPONSE AS:
## Historical Parallels
- List the most relevant historical analogues with dates and outcomes

## Pattern Analysis
- What patterns emerge from these historical cases?
- What strategies succeeded vs failed?

## Game Theory Lessons
- Nash equilibria observed in similar historical situations
- Commitment problems and how they were (or weren't) solved
- Credibility of threats/promises based on historical track record

## Key Historical Data Points
- Specific numbers, dates, treaties, battles, economic data that inform this scenario
- Source each data point

## Historical Warnings
- What went wrong in similar situations?
- What red lines were crossed and what were the consequences?
- What off-ramps existed but were missed?

SCENARIO TO ANALYZE HISTORICALLY:
${scenarioText}

Search for historical precedents, academic analyses, and pattern data. Return ONLY historically-sourced intelligence.`
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
      let enrichment = '';
      if (data.content && Array.isArray(data.content)) {
        for (const block of data.content) {
          if (block.type === 'text' && block.text) {
            enrichment += block.text + '\n';
          }
        }
      }
      enrichment = enrichment.trim();

      if (!enrichment) {
        throw new Error('No historical data received.');
      }

      textarea.value = scenarioText + '\n\n--- HISTORICAL INTELLIGENCE (pattern analysis, verified) ---\n' + enrichment;

      if (typeof window.updateCharCount === 'function') {
        window.updateCharCount();
      }

      enrichedScenarios.add(hash);
      setHistoryButtonState('done');

    } catch (error) {
      console.error('History enrichment error:', error);
      alert('Enrichment failed: ' + error.message);
      setHistoryButtonState('ready');
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
        if (!textarea.value.includes('--- HISTORICAL INTELLIGENCE')) {
          setHistoryButtonState('ready');
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
  window.enrichWithHistory = enrichWithHistory;
})();
