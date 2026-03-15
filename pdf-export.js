/**
 * PDF Export for Game Theory AI
 * Generates a branded professional report using html2pdf.js
 */

window.exportPDF = async function () {
    var btn = document.getElementById('pdfExportBtn');
    if (!btn) return;

    var origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-2px;margin-right:4px"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-dashoffset="10"/></svg>Generating...';

    try {
        var scenario = (document.getElementById('scenario') || {}).value || 'N/A';
        var resultContent = document.getElementById('resultContent');
        if (!resultContent || !resultContent.innerHTML.trim()) {
            alert('No analysis results to export.');
            return;
        }

        var container = document.createElement('div');
        container.id = 'pdf-export-container';
        container.innerHTML = buildPDFContent(scenario, resultContent);
        document.body.appendChild(container);

        var opt = {
            margin: [12, 16, 16, 16],
            filename: 'game-theory-analysis-' + new Date().toISOString().slice(0, 10) + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await html2pdf().set(opt).from(container).save();

        document.body.removeChild(container);
    } catch (err) {
        console.error('PDF export error:', err);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = origHTML;
    }
};

function buildPDFContent(scenario, resultContent) {
    var now = new Date();
    var date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    var clone = resultContent.cloneNode(true);
    transformForPrint(clone);

    return '<style>'
        + '#pdf-export-container { position:fixed; left:-9999px; top:0; width:210mm; background:#fff; color:#1a1a2e; font-family:"Segoe UI",system-ui,-apple-system,sans-serif; font-size:11px; line-height:1.6; padding:0; }'
        + '#pdf-export-container * { color:#1a1a2e !important; background:transparent !important; border-color:#d1d5db !important; }'
        + '.pdf-header { text-align:center; padding-bottom:16px; margin-bottom:20px; border-bottom:3px solid #0891b2 !important; }'
        + '.pdf-header h1 { font-size:22px; font-weight:700; color:#0891b2 !important; margin:0 0 4px 0; letter-spacing:-0.5px; }'
        + '.pdf-header .subtitle { font-size:14px; color:#6b7280 !important; margin:0; }'
        + '.pdf-header .date { font-size:11px; color:#9ca3af !important; margin-top:6px; }'
        + '.pdf-scenario { background:#f0f9ff !important; border:1px solid #bae6fd !important; border-radius:8px; padding:14px 16px; margin-bottom:20px; }'
        + '.pdf-scenario h3 { font-size:13px; font-weight:600; color:#0369a1 !important; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:0.5px; }'
        + '.pdf-scenario p { font-size:11px; color:#334155 !important; margin:0; white-space:pre-wrap; }'
        + '.pdf-results { margin-bottom:20px; }'
        + '.pdf-results .space-y-6 > div { margin-bottom:16px; padding:12px 14px; border:1px solid #e5e7eb !important; border-radius:8px; page-break-inside:avoid; }'
        + '.pdf-results h4 { font-size:13px; font-weight:600; color:#0891b2 !important; margin-bottom:8px; }'
        + '.pdf-results p, .pdf-results li, .pdf-results td { font-size:11px; color:#374151 !important; }'
        + '.pdf-results .text-cyan-400, .pdf-results .text-magenta-400 { color:#0891b2 !important; }'
        + '.pdf-results .text-yellow-400 { color:#b45309 !important; }'
        + '.pdf-results .bg-gray-700 { background:#e5e7eb !important; border-radius:4px; overflow:hidden; }'
        + '.pdf-results .bg-green-500 { background:#16a34a !important; }'
        + '.pdf-results .bg-yellow-500 { background:#ca8a04 !important; }'
        + '.pdf-results .bg-red-500 { background:#dc2626 !important; }'
        + '.pdf-results .h-2 { height:8px !important; }'
        + '.pdf-results table { width:100%; border-collapse:collapse; }'
        + '.pdf-results td { padding:6px 8px; border-bottom:1px solid #e5e7eb !important; }'
        + '.pdf-results ul { list-style:none; padding:0; margin:0; }'
        + '.pdf-results li { padding:3px 0; }'
        + '.pdf-results svg { display:none !important; }'
        + '.pdf-footer { margin-top:24px; padding-top:12px; border-top:2px solid #0891b2 !important; text-align:center; }'
        + '.pdf-footer p { font-size:10px; color:#9ca3af !important; margin:0; }'
        + '.pdf-footer .brand { font-size:11px; color:#0891b2 !important; font-weight:600; }'
        + '</style>'
        + '<div class="pdf-header">'
        +     '<h1>Game Theory AI</h1>'
        +     '<p class="subtitle">Strategic Analysis Report</p>'
        +     '<p class="date">' + date + ' at ' + time + '</p>'
        + '</div>'
        + '<div class="pdf-scenario">'
        +     '<h3>Scenario</h3>'
        +     '<p>' + escapeHTML(scenario) + '</p>'
        + '</div>'
        + '<div class="pdf-results">'
        +     clone.innerHTML
        + '</div>'
        + '<div class="pdf-footer">'
        +     '<p class="brand">Generated by Game Theory AI</p>'
        +     '<p>gametheoryai.com</p>'
        + '</div>';
}

function transformForPrint(el) {
    var usageBlocks = el.querySelectorAll('.text-xs');
    usageBlocks.forEach(function(b) {
        if (b.textContent.indexOf('API Usage') !== -1) {
            var parent = b.closest('.rounded-lg');
            if (parent) parent.remove();
            else b.remove();
        }
    });
    el.querySelectorAll('.hidden').forEach(function(h) { h.remove(); });
}

function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
