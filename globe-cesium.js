/**
 * Game Theory AI — Cesium Globe Visualization v2
 * Features: satellite imagery, animated arc pulses, fly-to detail cards, auto-tour
 */

const CESIUM_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzOTg5N2M3MS01ZjBjLTQ2NjYtYWJiZi1hMDYyYThmN2VlNmIiLCJpZCI6NDA0MTU5LCJpYXQiOjE3NzM2MTI3MDF9.klmTKXwvP-wn06nAHKLY6IdXrPwoDAMfs2KzpLN2sr4';

const GEO_COORDS = {
  'united states': { lat: 38.9, lng: -77.0, label: 'United States', zoom: 5000000 },
  'us': { lat: 38.9, lng: -77.0, label: 'United States', zoom: 5000000 },
  'usa': { lat: 38.9, lng: -77.0, label: 'United States', zoom: 5000000 },
  'america': { lat: 38.9, lng: -77.0, label: 'United States', zoom: 5000000 },
  'israel': { lat: 31.8, lng: 35.2, label: 'Israel', zoom: 800000 },
  'iran': { lat: 35.7, lng: 51.4, label: 'Iran', zoom: 2000000 },
  'russia': { lat: 55.75, lng: 37.6, label: 'Russia', zoom: 5000000 },
  'china': { lat: 39.9, lng: 116.4, label: 'China', zoom: 5000000 },
  'saudi arabia': { lat: 24.7, lng: 46.7, label: 'Saudi Arabia', zoom: 2000000 },
  'saudi': { lat: 24.7, lng: 46.7, label: 'Saudi Arabia', zoom: 2000000 },
  'turkey': { lat: 39.9, lng: 32.9, label: 'Turkey', zoom: 1500000 },
  'eu': { lat: 50.85, lng: 4.35, label: 'EU (Brussels)', zoom: 3000000 },
  'europe': { lat: 50.85, lng: 4.35, label: 'EU', zoom: 3000000 },
  'european union': { lat: 50.85, lng: 4.35, label: 'EU', zoom: 3000000 },
  'uk': { lat: 51.5, lng: -0.1, label: 'United Kingdom', zoom: 1500000 },
  'united kingdom': { lat: 51.5, lng: -0.1, label: 'United Kingdom', zoom: 1500000 },
  'india': { lat: 28.6, lng: 77.2, label: 'India', zoom: 3000000 },
  'japan': { lat: 35.7, lng: 139.7, label: 'Japan', zoom: 1500000 },
  'north korea': { lat: 39.0, lng: 125.8, label: 'North Korea', zoom: 800000 },
  'south korea': { lat: 37.6, lng: 127.0, label: 'South Korea', zoom: 800000 },
  'taiwan': { lat: 25.0, lng: 121.5, label: 'Taiwan', zoom: 600000 },
  'ukraine': { lat: 50.45, lng: 30.5, label: 'Ukraine', zoom: 1500000 },
  'germany': { lat: 52.5, lng: 13.4, label: 'Germany', zoom: 1200000 },
  'france': { lat: 48.9, lng: 2.35, label: 'France', zoom: 1500000 },
  'brazil': { lat: -15.8, lng: -47.9, label: 'Brazil', zoom: 4000000 },
  'australia': { lat: -35.3, lng: 149.1, label: 'Australia', zoom: 4000000 },
  'egypt': { lat: 30.0, lng: 31.2, label: 'Egypt', zoom: 1500000 },
  'pakistan': { lat: 33.7, lng: 73.0, label: 'Pakistan', zoom: 2000000 },
  'mexico': { lat: 19.4, lng: -99.1, label: 'Mexico', zoom: 2000000 },
  'canada': { lat: 45.4, lng: -75.7, label: 'Canada', zoom: 5000000 },
  'vietnam': { lat: 21.0, lng: 105.8, label: 'Vietnam', zoom: 1200000 },
  'hezbollah': { lat: 33.9, lng: 35.5, label: 'Hezbollah (Lebanon)', zoom: 500000 },
  'houthis': { lat: 15.4, lng: 44.2, label: 'Houthis (Yemen)', zoom: 800000 },
  'nato': { lat: 50.88, lng: 4.42, label: 'NATO (Brussels)', zoom: 3000000 },
  'uae': { lat: 24.45, lng: 54.65, label: 'UAE', zoom: 800000 },
  'bahrain': { lat: 26.07, lng: 50.55, label: 'Bahrain', zoom: 300000 },
  'kuwait': { lat: 29.38, lng: 47.99, label: 'Kuwait', zoom: 400000 },
  'qatar': { lat: 25.29, lng: 51.53, label: 'Qatar', zoom: 400000 },
  'iraq': { lat: 33.31, lng: 44.37, label: 'Iraq', zoom: 1500000 },
  'syria': { lat: 33.51, lng: 36.29, label: 'Syria', zoom: 1000000 },
  'yemen': { lat: 15.37, lng: 44.19, label: 'Yemen', zoom: 1000000 },
  'lebanon': { lat: 33.89, lng: 35.50, label: 'Lebanon', zoom: 400000 },
};

const PLAYER_COLORS = [
  '#22d3ee', '#e879f9', '#fbbf24', '#4ade80',
  '#f87171', '#818cf8', '#fb923c', '#67e8f9',
  '#a78bfa', '#f472b6', '#34d399', '#fcd34d',
];

function resolvePlayerLocations(players) {
  const resolved = [];
  const seen = new Set();
  for (const player of players) {
    const key = player.toLowerCase().trim();
    let found = false;
    for (const [geoKey, coords] of Object.entries(GEO_COORDS)) {
      if ((key.includes(geoKey) || geoKey.includes(key)) && !seen.has(coords.label)) {
        resolved.push({ name: player, ...coords });
        seen.add(coords.label);
        found = true;
        break;
      }
    }
    if (!found && !seen.has(player)) {
      resolved.push({ name: player, lat: 20 + resolved.length * 8, lng: 10, label: player, zoom: 2000000 });
      seen.add(player);
    }
  }
  return resolved;
}

// =============================================
// GLOBE INIT
// =============================================
let _globeViewer = null;
let _tourRunning = false;
let _tourTimeout = null;

async function initGlobe(containerId, analysisResult) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clean up previous viewer
  if (_globeViewer) {
    try { _globeViewer.destroy(); } catch(e) {}
    _globeViewer = null;
  }
  stopTour();

  Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

  const W = container.clientWidth;
  const H = Math.min(600, Math.max(420, W * 0.55));
  container.style.height = H + 'px';
  container.innerHTML = '';

  const viewer = new Cesium.Viewer(container, {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    vrButton: false,
    infoBox: true,
    selectionIndicator: true,
    creditContainer: document.createElement('div'),
  });

  // Load terrain
  try {
    viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
  } catch(e) {
    console.warn('Terrain load failed:', e);
  }

  viewer.scene.backgroundColor = Cesium.Color.BLACK;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.atmosphereLightIntensity = 3.0;
  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1628');

  // =============================================
  // CAMERA CONTROLS OPTIMIZATION
  // =============================================
  const controller = viewer.scene.screenSpaceCameraController;

  // Zoom limits — prevent going underground or too far out
  controller.minimumZoomDistance = 50000;     // ~50km min (street-level zoom)
  controller.maximumZoomDistance = 30000000;  // ~30,000km max (full globe view)

  // Smooth zoom with inertia
  controller.zoomEventTypes = [
    Cesium.CameraEventType.WHEEL,
    Cesium.CameraEventType.PINCH,
  ];
  controller.inertiaZoom = 0.8;            // Smooth zoom deceleration

  // Left click+drag = rotate/orbit globe
  controller.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];
  controller.inertiaRotate = 0.9;          // Smooth rotation momentum

  // Right click+drag = zoom (alternative to scroll)
  controller.zoomEventTypes.push(Cesium.CameraEventType.RIGHT_DRAG);

  // Middle click+drag = pan/translate
  controller.translateEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG];

  // Tilt with Ctrl+left drag or two-finger tilt on mobile
  controller.tiltEventTypes = [
    { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL },
    { eventType: Cesium.CameraEventType.PINCH, modifier: undefined },
  ];
  controller.inertiaTilt = 0.8;

  // Enable smooth look-at behavior
  controller.enableRotate = true;
  controller.enableTranslate = true;
  controller.enableZoom = true;
  controller.enableTilt = true;
  controller.enableLook = true;

  // Prevent camera from going below terrain
  viewer.scene.globe.depthTestAgainstTerrain = true;

  // Mobile: improve touch responsiveness
  controller.minimumPickingTerrainDistanceWithInertia = 2000;

  _globeViewer = viewer;
  container._cesiumViewer = viewer;

  const players = analysisResult.players || [];
  const locations = resolvePlayerLocations(players);

  // Store location data for detail cards and tour
  container._locations = locations;
  container._analysisResult = analysisResult;

  // =============================================
  // PLAYER MARKERS with rich info boxes
  // =============================================
  locations.forEach((loc, i) => {
    const color = Cesium.Color.fromCssColorString(PLAYER_COLORS[i % PLAYER_COLORS.length]);
    const hexColor = PLAYER_COLORS[i % PLAYER_COLORS.length];

    // Find connections for this player
    const connections = locations.filter((other, j) => j !== i).map(other => other.label).join(', ');

    // Build rich detail card HTML
    const detailHtml = `
      <div style="font-family:Inter,sans-serif;padding:12px;min-width:240px;background:#0f172a;border-radius:8px">
        <h3 style="color:${hexColor};margin:0 0 10px;font-size:16px;font-weight:700">${loc.label}</h3>
        <div style="color:#94a3b8;font-size:12px;margin-bottom:8px">
          <strong style="color:#e2e8f0">Role:</strong> ${loc.name}
        </div>
        <div style="color:#94a3b8;font-size:12px;margin-bottom:8px">
          <strong style="color:#e2e8f0">Connected to:</strong> ${connections}
        </div>
        <div style="color:#94a3b8;font-size:12px;margin-bottom:12px">
          <strong style="color:#e2e8f0">Coordinates:</strong> ${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="globeFlyToPlayer(${i})" style="background:${hexColor}22;color:${hexColor};border:1px solid ${hexColor}44;padding:4px 12px;border-radius:6px;font-size:11px;cursor:pointer">Zoom In</button>
          <button onclick="startTour()" style="background:rgba(251,191,36,0.1);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);padding:4px 12px;border-radius:6px;font-size:11px;cursor:pointer">Tour All</button>
        </div>
      </div>`;

    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat),
      point: {
        pixelSize: 16,
        color: color.withAlpha(0.9),
        outlineColor: color.withAlpha(0.4),
        outlineWidth: 10,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: loc.label,
        font: 'bold 14px Inter, Arial, sans-serif',
        fillColor: color,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -22),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000),
      },
      description: detailHtml,
      name: loc.label,
    });

    // Ground glow ellipse
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat),
      ellipse: {
        semiMajorAxis: Math.min(loc.zoom * 0.08, 200000),
        semiMinorAxis: Math.min(loc.zoom * 0.08, 200000),
        material: color.withAlpha(0.12),
        outline: true,
        outlineColor: color.withAlpha(0.3),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  });

  // =============================================
  // ANIMATED ARC PULSES
  // =============================================
  const arcEntities = [];

  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const a = locations[i];
      const b = locations[j];
      const colorHex = PLAYER_COLORS[(i + j) % PLAYER_COLORS.length];
      const color = Cesium.Color.fromCssColorString(colorHex);

      const surfaceDist = Cesium.Cartesian3.distance(
        Cesium.Cartesian3.fromDegrees(a.lng, a.lat),
        Cesium.Cartesian3.fromDegrees(b.lng, b.lat)
      );
      const arcHeight = Math.min(surfaceDist * 0.15, 1500000);

      // Full arc path (50 points)
      const numPoints = 50;
      const fullPath = [];
      for (let t = 0; t <= numPoints; t++) {
        const frac = t / numPoints;
        const lat = a.lat + (b.lat - a.lat) * frac;
        const lng = a.lng + (b.lng - a.lng) * frac;
        const height = Math.sin(frac * Math.PI) * arcHeight;
        fullPath.push({ lng, lat, height });
      }

      // Static base arc (dim glow)
      viewer.entities.add({
        polyline: {
          positions: fullPath.map(p => Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.height)),
          width: 1.5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: color.withAlpha(0.25),
          }),
        },
      });

      // Animated pulse entity (bright segment that travels along the arc)
      arcEntities.push({ fullPath, color, colorHex, offset: Math.random(), speed: 0.3 + Math.random() * 0.4 });
    }
  }

  // Create pulse dot entities
  const pulseDots = arcEntities.map((arc, idx) => {
    return viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(arc.fullPath[0].lng, arc.fullPath[0].lat, arc.fullPath[0].height),
      point: {
        pixelSize: 5,
        color: Cesium.Color.fromCssColorString(arc.colorHex).withAlpha(0.9),
        outlineColor: Cesium.Color.fromCssColorString(arc.colorHex).withAlpha(0.4),
        outlineWidth: 4,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  });

  // Animate pulses along arcs
  viewer.clock.onTick.addEventListener(() => {
    const time = Date.now() / 1000;
    arcEntities.forEach((arc, idx) => {
      const t = ((time * arc.speed + arc.offset) % 1);
      const pathIdx = Math.floor(t * (arc.fullPath.length - 1));
      const p = arc.fullPath[Math.min(pathIdx, arc.fullPath.length - 1)];
      if (pulseDots[idx]) {
        pulseDots[idx].position = Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.height);
      }
    });
  });

  // =============================================
  // CONTROL PANEL (player buttons + tour)
  // =============================================
  const controlDiv = document.createElement('div');
  controlDiv.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;flex-wrap:wrap;gap:6px;max-width:75%;align-items:center';

  // Tour button
  const tourBtn = document.createElement('button');
  tourBtn.id = 'tourBtn';
  tourBtn.innerHTML = '\u25B6 Tour';
  tourBtn.style.cssText = 'background:rgba(0,0,0,0.8);color:#fbbf24;border:1px solid rgba(251,191,36,0.4);padding:5px 14px;border-radius:20px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif;backdrop-filter:blur(8px);transition:all 0.2s;font-weight:600';
  tourBtn.addEventListener('click', () => { _tourRunning ? stopTour() : startTour(); });
  controlDiv.appendChild(tourBtn);

  // Player buttons
  locations.forEach((loc, i) => {
    const btn = document.createElement('button');
    btn.textContent = loc.label;
    btn.style.cssText = `background:rgba(0,0,0,0.7);color:${PLAYER_COLORS[i % PLAYER_COLORS.length]};border:1px solid ${PLAYER_COLORS[i % PLAYER_COLORS.length]}44;padding:4px 12px;border-radius:20px;font-size:11px;cursor:pointer;font-family:Inter,sans-serif;backdrop-filter:blur(8px);transition:all 0.2s`;
    btn.addEventListener('mouseenter', () => { btn.style.borderColor = PLAYER_COLORS[i % PLAYER_COLORS.length]; btn.style.background = 'rgba(0,0,0,0.9)'; });
    btn.addEventListener('mouseleave', () => { btn.style.borderColor = PLAYER_COLORS[i % PLAYER_COLORS.length] + '44'; btn.style.background = 'rgba(0,0,0,0.7)'; });
    btn.addEventListener('click', () => {
      stopTour();
      globeFlyToPlayer(i);
    });
    controlDiv.appendChild(btn);
  });

  // View All button
  const allBtn = document.createElement('button');
  allBtn.textContent = 'View All';
  allBtn.style.cssText = 'background:rgba(0,0,0,0.7);color:#94a3b8;border:1px solid #94a3b844;padding:4px 12px;border-radius:20px;font-size:11px;cursor:pointer;font-family:Inter,sans-serif;backdrop-filter:blur(8px);transition:all 0.2s';
  allBtn.addEventListener('click', () => {
    stopTour();
    if (container._homeView) {
      viewer.camera.flyTo({ ...container._homeView, duration: 2.0, easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT });
    } else {
      viewer.flyTo(viewer.entities, { duration: 2.0 });
    }
  });
  controlDiv.appendChild(allBtn);

  container.style.position = 'relative';
  container.appendChild(controlDiv);

  // Add conflict zone overlays
  addConflictZones(viewer, analysisResult);

  // Initial fly-to: center on the conflict region with proper framing
  // Store home position for reset after tour
  let _homeView = null;
  if (locations.length > 0) {
    // Calculate weighted center (bias toward more clustered players)
    const avgLat = locations.reduce((s, l) => s + l.lat, 0) / locations.length;
    const avgLng = locations.reduce((s, l) => s + l.lng, 0) / locations.length;

    // Calculate altitude from bounding extent
    const minLat = Math.min(...locations.map(l => l.lat));
    const maxLat = Math.max(...locations.map(l => l.lat));
    const minLng = Math.min(...locations.map(l => l.lng));
    const maxLng = Math.max(...locations.map(l => l.lng));
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxSpan = Math.max(latSpan, lngSpan);

    // Convert span to altitude (degrees to meters, roughly)
    // 1 degree ~= 111km, we want camera far enough to see all players
    const altitude = Math.max(2000000, maxSpan * 111000 * 1.8);

    _homeView = {
      destination: Cesium.Cartesian3.fromDegrees(avgLng, avgLat - 5, altitude),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-40),
        roll: 0,
      },
    };

    setTimeout(() => {
      viewer.camera.flyTo({
        ..._homeView,
        duration: 3.0,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      });
    }, 500);
  } else {
    setTimeout(() => { viewer.flyTo(viewer.entities, { duration: 3.0 }); }, 500);
  }

  // Store home view for View All button
  container._homeView = _homeView;

  // Resize handler
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    container.style.height = Math.min(600, Math.max(420, w * 0.55)) + 'px';
  });
}


// =============================================
// CONFLICT ZONE POLYGONS
// =============================================
const CONFLICT_ZONES = [
  {
    id: 'strait_of_hormuz',
    label: 'Strait of Hormuz',
    keywords: ['strait', 'hormuz', 'oil', 'tanker', 'shipping', 'chokepoint'],
    color: '#f87171',
    positions: [56.0,26.6, 56.3,26.2, 56.8,26.3, 56.9,26.7, 56.5,27.0, 56.1,26.9],
    description: 'Critical chokepoint — 20% of global oil supply passes through',
  },
  {
    id: 'lebanon_israel_border',
    label: 'Lebanon-Israel Border',
    keywords: ['lebanon', 'hezbollah', 'northern front', 'border'],
    color: '#fb923c',
    positions: [35.1,33.4, 35.9,33.4, 35.9,33.05, 35.1,33.05],
    description: 'Hezbollah front — active cross-border fire zone',
  },
  {
    id: 'gulf_bases',
    label: 'Gulf Military Bases',
    keywords: ['gulf', 'bases', 'uae', 'bahrain', 'kuwait', 'al-dhafra', 'jaber'],
    color: '#fbbf24',
    positions: [49.5,23.5, 55.5,23.5, 55.5,27.5, 49.5,27.5],
    description: 'US/allied military installations under Iranian missile threat',
  },
  {
    id: 'gaza',
    label: 'Gaza Strip',
    keywords: ['gaza', 'hamas', 'palestinian'],
    color: '#f87171',
    positions: [34.22,31.59, 34.56,31.59, 34.56,31.22, 34.22,31.22],
    description: 'Active conflict zone — ongoing military operations',
  },
  {
    id: 'yemen_houthi',
    label: 'Houthi-Controlled Yemen',
    keywords: ['yemen', 'houthi', 'red sea', 'aden'],
    color: '#fb923c',
    positions: [42.5,12.5, 46.0,12.5, 46.0,16.0, 44.0,17.5, 42.5,16.0],
    description: 'Houthi territory — anti-shipping missile launch zone',
  },
  {
    id: 'iran_nuclear',
    label: 'Iran Nuclear Sites',
    keywords: ['nuclear', 'natanz', 'fordow', 'enrichment', 'isfahan'],
    color: '#dc2626',
    positions: [51.0,32.0, 53.5,32.0, 53.5,34.0, 51.0,34.0],
    description: 'Key nuclear facilities — primary strike targets',
  },
];

function addConflictZones(viewer, analysisResult) {
  if (!viewer || !analysisResult) return;

  // Combine all text for keyword matching
  const allText = [
    analysisResult.analysis || '',
    JSON.stringify(analysisResult.recommendations || []),
    JSON.stringify(analysisResult.probabilities || {}),
    JSON.stringify(analysisResult.assumptions || []),
    JSON.stringify(analysisResult.players || []),
  ].join(' ').toLowerCase();

  let zonesAdded = 0;

  CONFLICT_ZONES.forEach(zone => {
    // Check if any keywords match the analysis
    const relevant = zone.keywords.some(kw => allText.includes(kw));
    if (!relevant) return;

    const color = Cesium.Color.fromCssColorString(zone.color);

    // Build positions array [lng, lat, lng, lat, ...]
    const positions = [];
    for (let i = 0; i < zone.positions.length; i += 2) {
      positions.push(zone.positions[i], zone.positions[i + 1]);
    }

    // Polygon with pulsing effect via CallbackProperty
    const startTime = Date.now();
    viewer.entities.add({
      name: zone.label,
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty(() => {
            const pulse = 0.12 + Math.sin((Date.now() - startTime) / 800) * 0.08;
            return color.withAlpha(pulse);
          }, false)
        ),
        outline: true,
        outlineColor: color.withAlpha(0.6),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      description: `<div style="font-family:Inter,sans-serif;padding:10px;background:#0f172a;border-radius:8px">
        <h3 style="color:${zone.color};margin:0 0 8px;font-size:15px">${zone.label}</h3>
        <p style="color:#94a3b8;margin:0;font-size:13px">${zone.description}</p>
      </div>`,
    });

    zonesAdded++;
  });

  if (zonesAdded > 0) {
    console.log(`Added ${zonesAdded} conflict zone overlays`);
  }
}

// =============================================
// FLY TO PLAYER (with detail card)
// =============================================
function globeFlyToPlayer(index) {
  const container = document.getElementById('globeContainer');
  if (!container || !_globeViewer || !container._locations) return;
  const loc = container._locations[index];
  if (!loc) return;

  _globeViewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, loc.zoom),
    orientation: {
      heading: Cesium.Math.toRadians(15),
      pitch: Cesium.Math.toRadians(-35),
      roll: 0,
    },
    duration: 2.5,
    complete: () => {
      // Select the entity to show info box
      const entity = _globeViewer.entities.values.find(e => e.name === loc.label);
      if (entity) _globeViewer.selectedEntity = entity;
    },
  });
}

// =============================================
// AUTO-TOUR CINEMATIC MODE
// =============================================
function startTour() {
  const container = document.getElementById('globeContainer');
  if (!container || !_globeViewer || !container._locations) return;
  if (container._locations.length === 0) return;

  _tourRunning = true;
  const btn = document.getElementById('tourBtn');
  if (btn) { btn.innerHTML = '\u25A0 Stop Tour'; btn.style.color = '#f87171'; btn.style.borderColor = 'rgba(248,113,113,0.4)'; }

  let index = 0;
  const locations = container._locations;

  function visitNext() {
    if (!_tourRunning || index >= locations.length) {
      // Loop back or stop
      if (_tourRunning && locations.length > 0) {
        index = 0;
      } else {
        stopTour();
        return;
      }
    }

    const loc = locations[index];
    index++;

    _globeViewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, loc.zoom * 0.8),
      orientation: {
        heading: Cesium.Math.toRadians(10 + index * 30),
        pitch: Cesium.Math.toRadians(-30),
        roll: 0,
      },
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      complete: () => {
        // Show detail card
        const entity = _globeViewer.entities.values.find(e => e.name === loc.label);
        if (entity) _globeViewer.selectedEntity = entity;

        // Wait, then fly to next
        _tourTimeout = setTimeout(visitNext, 4000);
      },
    });
  }

  // Start with a zoom-out to show full region
  const tourCenter = {
    lng: locations.reduce((s, l) => s + l.lng, 0) / locations.length,
    lat: locations.reduce((s, l) => s + l.lat, 0) / locations.length,
  };
  _globeViewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(tourCenter.lng, tourCenter.lat - 5, 15000000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-40),
      roll: 0,
    },
    duration: 2.0,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    complete: () => { _tourTimeout = setTimeout(visitNext, 1500); },
  });
}

function stopTour() {
  _tourRunning = false;
  if (_tourTimeout) { clearTimeout(_tourTimeout); _tourTimeout = null; }
  const btn = document.getElementById('tourBtn');
  if (btn) { btn.innerHTML = '\u25B6 Tour'; btn.style.color = '#fbbf24'; btn.style.borderColor = 'rgba(251,191,36,0.4)'; }

  // Return to home view after tour ends
  const container = document.getElementById('globeContainer');
  if (_globeViewer && container && container._homeView) {
    setTimeout(() => {
      _globeViewer.camera.flyTo({
        ...container._homeView,
        duration: 2.0,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      });
    }, 300);
  }
}

// =============================================
// FULLSCREEN
// =============================================
function toggleGlobeFullscreen() {
  const container = document.getElementById('globeContainer');
  if (!container) return;

  if (document.fullscreenElement === container) {
    document.exitFullscreen();
  } else {
    container.requestFullscreen().catch(() => {
      container.style.cssText = 'position:fixed;inset:0;z-index:9999;height:100vh!important;width:100vw;border-radius:0;margin:0';
      container._fakeFS = true;
      const esc = (e) => {
        if (e.key === 'Escape' && container._fakeFS) {
          container.style.cssText = '';
          container._fakeFS = false;
          document.removeEventListener('keydown', esc);
          if (_globeViewer) _globeViewer.resize();
        }
      };
      document.addEventListener('keydown', esc);
    });
  }
  setTimeout(() => { if (_globeViewer) _globeViewer.resize(); }, 200);
}

// Exports
window.initGlobe = initGlobe;
window.toggleGlobeFullscreen = toggleGlobeFullscreen;
window.globeFlyToPlayer = globeFlyToPlayer;
window.startTour = startTour;
window.stopTour = stopTour;

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('globeFullscreenBtn');
  if (btn) btn.innerHTML = document.fullscreenElement ? '\u2716 Exit' : '\u26F6 Fullscreen';
  if (_globeViewer) setTimeout(() => _globeViewer.resize(), 100);
});
