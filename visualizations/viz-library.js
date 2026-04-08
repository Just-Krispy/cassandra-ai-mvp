// Nash Visualization Library — Shared Utilities
// Theme, animation, tooltips, exports, confidence meter

export const NashTheme = {
  background: '#0a0a0f',
  primary: '#00d4ff',
  secondary: '#ff6b35',
  success: '#00ff88',
  warning: '#ffd700',
  danger: '#ff4757',
  text: '#f1f1f9',
  border: '#222235',
};

// Animation: Fade in (simple utility)
export function fadeIn(el, duration = 800) {
  el.style.opacity = 0;
  el.style.display = '';
  let last = +new Date();
  const tick = function() {
    el.style.opacity = +el.style.opacity + (new Date() - last) / duration;
    last = +new Date();
    if (+el.style.opacity < 1) {
      requestAnimationFrame(tick);
    }
  };
  tick();
}

// Tooltip system (barebones, customizable)
export function showTooltip(text, x, y, parent = document.body) {
  let tip = document.createElement('div');
  tip.className = 'nash-tooltip';
  tip.style.position = 'fixed';
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
  tip.style.padding = '7px 14px';
  tip.style.background = NashTheme.background;
  tip.style.color = NashTheme.text;
  tip.style.border = `1px solid ${NashTheme.primary}`;
  tip.style.borderRadius = '6px';
  tip.style.zIndex = 4000;
  tip.style.pointerEvents = 'none';
  tip.style.fontSize = '1rem';
  tip.style.whiteSpace = 'nowrap';
  tip.innerText = text;
  parent.appendChild(tip);
  return tip;
}

export function hideTooltip(tip) {
  if (tip && tip.parentNode) tip.parentNode.removeChild(tip);
}

// Export chart/canvas as PNG
export function exportChartAsPNG(canvas, name='nash-chart') {
  const link = document.createElement('a');
  link.download = name + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Export SVG as PNG (D3 charts)
export function exportSVGAsPNG(svgEl, name='nash-chart') {
  var s = new XMLSerializer().serializeToString(svgEl);
  var img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(s);
  img.onload = function() {
    var canvas = document.createElement('canvas');
    canvas.width = svgEl.clientWidth || 720;
    canvas.height = svgEl.clientHeight || 480;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img,0,0);
    const link = document.createElement('a');
    link.download = name + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
}

// Nash Confidence Meter (circular, SVG)
export function renderConfidenceMeter(container, percent, label = 'Confidence') {
  // percent: 0-100
  container.innerHTML = '';
  let size = 88, strokeWidth = 8, r = (size-strokeWidth)/2, c = 2*Math.PI*r;
  let circleBg = `<circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="#222235" stroke-width="${strokeWidth}" fill="none"/>`;
  let circleVal = `<circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="${NashTheme.primary}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round"
    stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - percent/100)}" transform="rotate(-90 ${size/2} ${size/2})" />`;
  let text = `<text x="50%" y="52%" text-anchor="middle" dy=".3em" font-size="1.36em" fill="${NashTheme.text}">${percent}%</text>`;
  let labelText = `<text x="50%" y="88%" text-anchor="middle" font-size=".77em" fill="${NashTheme.secondary}">${label}</text>`;
  container.innerHTML = `<svg width="${size}" height="${size}" font-family="inherit">${circleBg}${circleVal}${text}${labelText}</svg>`;
}