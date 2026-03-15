/**
 * Game Theory AI — PDF Export
 * Generates a branded professional PDF report from analysis results.
 * Uses html2pdf.js (loaded via CDN).
 */

async function exportPDF() {
  const result = window.__lastAnalysisResult;
  if (!result) { alert('Run an analysis first to export a PDF.'); return; }

  const btn = document.getElementById('pdfExportBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Generating...'; }

  const scenario = document.getElementById('scenario')?.value || '';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  let probBars = '';
  if (result.probabilities) {
    probBars = Object.entries(result.probabilities).sort((a,b) => b[1]-a[1]).map(([key, val]) => {
      const pct = (val*100).toFixed(0);
      const color = val > 0.3 ? '#0891b2' : val > 0.15 ? '#d97706' : '#dc2626';
      return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px"><span>' + key.replace(/_/g,' ') + '</span><span style="font-weight:600">' + pct + '%</span></div><div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden"><div style="background:' + color + ';height:100%;width:' + pct + '%;border-radius:4px"></div></div></div>';
    }).join('');
  }

  let recsHtml = (result.recommendations||[]).map(r => '<li style="margin-bottom:6px;font-size:12px;color:#374151">' + r + '</li>').join('');
  let assumeHtml = (result.assumptions||[]).map(a => '<li style="margin-bottom:4px;font-size:11px;color:#6b7280">' + a + '</li>').join('');

  let matrixHtml = '';
  if (result.payoffMatrix) {
    matrixHtml = '<table style="width:100%;border-collapse:collapse;margin-top:8px">' + Object.entries(result.payoffMatrix).map(([s,p]) => '<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:11px">' + s.replace(/_/g,' ') + '</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280">' + JSON.stringify(p) + '</td></tr>').join('') + '</table>';
    if (result.nashEquilibrium) matrixHtml += '<p style="font-size:11px;color:#6b7280;margin-top:8px"><strong>Nash Equilibrium:</strong> ' + result.nashEquilibrium.join('; ') + '</p>';
  }

  const html = '<div style="font-family:Helvetica Neue,Arial,sans-serif;color:#111827;padding:40px;max-width:800px;margin:0 auto;background:white">'
    + '<div style="border-bottom:3px solid #0891b2;padding-bottom:16px;margin-bottom:24px"><h1 style="font-size:28px;font-weight:800;margin:0;color:#0891b2">Game Theory AI</h1><p style="font-size:13px;color:#6b7280;margin:4px 0 0">Strategic Analysis Report</p><p style="font-size:12px;color:#9ca3af;margin:2px 0 0">' + date + ' at ' + time + '</p></div>'
    + '<div style="background:#f0fdfa;border-left:4px solid #0891b2;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px"><h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#0891b2;margin:0 0 4px">Game Type</h3><p style="font-size:14px;font-weight:600;color:#111827;margin:0">' + (result.gameType||'N/A') + '</p>' + (result.players ? '<p style="font-size:12px;color:#6b7280;margin:4px 0 0">Players: ' + result.players.join(', ') + '</p>' : '') + '</div>'
    + '<div style="margin-bottom:20px"><h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin:0 0 8px">Scenario</h3><p style="font-size:12px;color:#374151;line-height:1.6;white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #e5e7eb">' + scenario.substring(0,1500) + '</p></div>'
    + '<div style="margin-bottom:20px"><h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin:0 0 8px">Analysis</h3><p style="font-size:12px;color:#374151;line-height:1.7">' + (result.analysis||'N/A') + '</p></div>'
    + (probBars ? '<div style="margin-bottom:20px"><h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin:0 0 12px">Outcome Probabilities</h3>' + probBars + '<p style="font-size:11px;color:#9ca3af;margin-top:8px">Confidence: ' + (result.confidence||'N/A') + '</p></div>' : '')
    + (recsHtml ? '<div style="margin-bottom:20px"><h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin:0 0 8px">Recommendations</h3><ul style="padding-left:16px;margin:0">' + recsHtml + '</ul></div>' : '')
    + (matrixHtml ? '<div style="margin-bottom:20px"><h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin:0 0 8px">Payoff Matrix</h3>' + matrixHtml + '</div>' : '')
    + (assumeHtml ? '<div style="margin-bottom:20px"><h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#d97706;margin:0 0 8px">Key Assumptions</h3><ul style="padding-left:16px;margin:0">' + assumeHtml + '</ul></div>' : '')
    + '<div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:32px;text-align:center"><p style="font-size:10px;color:#9ca3af;margin:0">Generated by Game Theory AI</p><p style="font-size:10px;color:#d1d5db;margin:4px 0 0">' + date + '</p></div>'
    + '</div>';

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  tempDiv.style.cssText = 'position:absolute;left:-9999px;top:0';
  document.body.appendChild(tempDiv);

  try {
    await html2pdf().set({
      margin: [10,10,10,10],
      filename: 'game-theory-analysis-' + new Date().toISOString().slice(0,10) + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(tempDiv.firstElementChild).save();
  } catch(err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed: ' + err.message);
  } finally {
    document.body.removeChild(tempDiv);
    if (btn) { btn.disabled = false; btn.innerHTML = '\u{1F4E5} PDF'; }
  }
}

window.exportPDF = exportPDF;
