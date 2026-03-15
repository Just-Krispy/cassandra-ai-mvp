/**
 * Game Theory AI — Cesium Globe Visualization
 * Interactive 3D globe with satellite imagery, player markers, arcs, and fly-to.
 */

const CESIUM_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzOTg5N2M3MS01ZjBjLTQ2NjYtYWJiZi1hMDYyYThmN2VlNmIiLCJpZCI6NDA0MTU5LCJpYXQiOjE3NzM2MTI3MDF9.klmTKXwvP-wn06nAHKLY6IdXrPwoDAMfs2KzpLN2sr4';

// Country/region -> lat/lng lookup
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

async function initGlobe(containerId, analysisResult) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Set Cesium token
  Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

  // Set container size
  const W = container.clientWidth;
  const H = Math.min(550, Math.max(400, W * 0.5));
  container.style.height = H + 'px';
  container.innerHTML = '';

  // Create viewer
  const viewer = new Cesium.Viewer(container, {
    // Terrain loaded async after viewer init
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
    creditContainer: document.createElement('div'), // Hide credits from view
  });

  // Load world terrain (async - new API)
  try {
    const terrain = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
    viewer.terrainProvider = terrain;
  } catch(e) {
    console.warn('Terrain load failed, using ellipsoid:', e);
  }

  // Dark space background
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#000000');
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.atmosphereLightIntensity = 3.0;

  // Remove default imagery and use Cesium World Imagery
  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1628');

  // Resolve players
  const players = analysisResult.players || [];
  const locations = resolvePlayerLocations(players);

  // Add player markers
  locations.forEach((loc, i) => {
    const color = Cesium.Color.fromCssColorString(PLAYER_COLORS[i % PLAYER_COLORS.length]);

    // Pulsing point marker
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat),
      point: {
        pixelSize: 14,
        color: color.withAlpha(0.9),
        outlineColor: color.withAlpha(0.4),
        outlineWidth: 8,
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
        pixelOffset: new Cesium.Cartesian2(0, -20),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000),
      },
      description: `<div style="font-family:Inter,sans-serif;padding:8px">
        <h3 style="color:${PLAYER_COLORS[i % PLAYER_COLORS.length]};margin:0 0 8px">${loc.label}</h3>
        <p style="margin:0;color:#ccc">Player in scenario: <strong>${loc.name}</strong></p>
        <p style="margin:4px 0 0;color:#999;font-size:12px">Click to zoom in. Scroll to zoom further.</p>
      </div>`,
      name: loc.label,
    });

    // Glowing ellipse on ground
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat),
      ellipse: {
        semiMajorAxis: Math.min(loc.zoom * 0.08, 200000),
        semiMinorAxis: Math.min(loc.zoom * 0.08, 200000),
        material: color.withAlpha(0.15),
        outline: true,
        outlineColor: color.withAlpha(0.4),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  });

  // Draw arcs between players
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const a = locations[i];
      const b = locations[j];
      const color = Cesium.Color.fromCssColorString(PLAYER_COLORS[(i + j) % PLAYER_COLORS.length]).withAlpha(0.5);

      // Compute arc height based on distance
      const surfaceDist = Cesium.Cartesian3.distance(
        Cesium.Cartesian3.fromDegrees(a.lng, a.lat),
        Cesium.Cartesian3.fromDegrees(b.lng, b.lat)
      );
      const arcHeight = Math.min(surfaceDist * 0.15, 1500000);

      // Create arc as a series of points with elevation
      const numPoints = 50;
      const positions = [];
      for (let t = 0; t <= numPoints; t++) {
        const frac = t / numPoints;
        const lat = a.lat + (b.lat - a.lat) * frac;
        const lng = a.lng + (b.lng - a.lng) * frac;
        const height = Math.sin(frac * Math.PI) * arcHeight;
        positions.push(Cesium.Cartesian3.fromDegrees(lng, lat, height));
      }

      viewer.entities.add({
        polyline: {
          positions: positions,
          width: 2,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            color: color,
          }),
        },
      });
    }
  }

  // Build player list panel for click-to-fly
  const listDiv = document.createElement('div');
  listDiv.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;display:flex;flex-wrap:wrap;gap:6px;max-width:70%';
  locations.forEach((loc, i) => {
    const btn = document.createElement('button');
    btn.textContent = loc.label;
    btn.style.cssText = `background:rgba(0,0,0,0.7);color:${PLAYER_COLORS[i % PLAYER_COLORS.length]};border:1px solid ${PLAYER_COLORS[i % PLAYER_COLORS.length]}44;padding:4px 12px;border-radius:20px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif;backdrop-filter:blur(8px);transition:all 0.2s`;
    btn.addEventListener('mouseenter', () => { btn.style.borderColor = PLAYER_COLORS[i % PLAYER_COLORS.length]; btn.style.background = 'rgba(0,0,0,0.9)'; });
    btn.addEventListener('mouseleave', () => { btn.style.borderColor = PLAYER_COLORS[i % PLAYER_COLORS.length] + '44'; btn.style.background = 'rgba(0,0,0,0.7)'; });
    btn.addEventListener('click', () => {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(loc.lng, loc.lat, loc.zoom),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0,
        },
        duration: 2.0,
      });
    });
    listDiv.appendChild(btn);
  });

  // "View All" button
  const allBtn = document.createElement('button');
  allBtn.textContent = 'View All';
  allBtn.style.cssText = 'background:rgba(0,0,0,0.7);color:#94a3b8;border:1px solid #94a3b844;padding:4px 12px;border-radius:20px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif;backdrop-filter:blur(8px);transition:all 0.2s';
  allBtn.addEventListener('click', () => {
    viewer.flyTo(viewer.entities, { duration: 2.0 });
  });
  listDiv.appendChild(allBtn);

  container.style.position = 'relative';
  container.appendChild(listDiv);

  // Initial view: fly to show all players
  setTimeout(() => {
    viewer.flyTo(viewer.entities, { duration: 3.0 });
  }, 500);

  // Handle resize
  const onResize = () => {
    const w = container.clientWidth;
    const h = Math.min(550, Math.max(400, w * 0.5));
    container.style.height = h + 'px';
  };
  window.addEventListener('resize', onResize);

  // Store viewer for fullscreen
  container._cesiumViewer = viewer;
}

// Fullscreen toggle
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
          if (container._cesiumViewer) container._cesiumViewer.resize();
        }
      };
      document.addEventListener('keydown', esc);
    });
  }
  setTimeout(() => {
    if (container._cesiumViewer) container._cesiumViewer.resize();
  }, 200);
}

window.initGlobe = initGlobe;
window.toggleGlobeFullscreen = toggleGlobeFullscreen;

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('globeFullscreenBtn');
  if (btn) btn.innerHTML = document.fullscreenElement ? '&#x2716; Exit' : '&#x26F6; Fullscreen';
  const container = document.getElementById('globeContainer');
  if (container && container._cesiumViewer) {
    setTimeout(() => container._cesiumViewer.resize(), 100);
  }
});
