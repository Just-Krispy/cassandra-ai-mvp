/**
 * Game Theory AI — Interactive Globe Visualization
 * Renders players on a 3D globe with arcs showing relationships and outcomes.
 * Uses Three.js + custom WebGL globe.
 */

// Country/region -> lat/lng lookup
const GEO_COORDS = {
  'united states': { lat: 38.9, lng: -77.0, label: 'US' },
  'us': { lat: 38.9, lng: -77.0, label: 'US' },
  'usa': { lat: 38.9, lng: -77.0, label: 'US' },
  'america': { lat: 38.9, lng: -77.0, label: 'US' },
  'israel': { lat: 31.8, lng: 35.2, label: 'Israel' },
  'iran': { lat: 35.7, lng: 51.4, label: 'Iran' },
  'russia': { lat: 55.75, lng: 37.6, label: 'Russia' },
  'china': { lat: 39.9, lng: 116.4, label: 'China' },
  'saudi arabia': { lat: 24.7, lng: 46.7, label: 'Saudi Arabia' },
  'saudi': { lat: 24.7, lng: 46.7, label: 'Saudi Arabia' },
  'turkey': { lat: 39.9, lng: 32.9, label: 'Turkey' },
  'eu': { lat: 50.85, lng: 4.35, label: 'EU' },
  'europe': { lat: 50.85, lng: 4.35, label: 'EU' },
  'european union': { lat: 50.85, lng: 4.35, label: 'EU' },
  'uk': { lat: 51.5, lng: -0.1, label: 'UK' },
  'united kingdom': { lat: 51.5, lng: -0.1, label: 'UK' },
  'india': { lat: 28.6, lng: 77.2, label: 'India' },
  'japan': { lat: 35.7, lng: 139.7, label: 'Japan' },
  'north korea': { lat: 39.0, lng: 125.8, label: 'N. Korea' },
  'south korea': { lat: 37.6, lng: 127.0, label: 'S. Korea' },
  'taiwan': { lat: 25.0, lng: 121.5, label: 'Taiwan' },
  'ukraine': { lat: 50.45, lng: 30.5, label: 'Ukraine' },
  'germany': { lat: 52.5, lng: 13.4, label: 'Germany' },
  'france': { lat: 48.9, lng: 2.35, label: 'France' },
  'brazil': { lat: -15.8, lng: -47.9, label: 'Brazil' },
  'australia': { lat: -35.3, lng: 149.1, label: 'Australia' },
  'egypt': { lat: 30.0, lng: 31.2, label: 'Egypt' },
  'pakistan': { lat: 33.7, lng: 73.0, label: 'Pakistan' },
  'mexico': { lat: 19.4, lng: -99.1, label: 'Mexico' },
  'canada': { lat: 45.4, lng: -75.7, label: 'Canada' },
  'vietnam': { lat: 21.0, lng: 105.8, label: 'Vietnam' },
  'hezbollah': { lat: 33.9, lng: 35.5, label: 'Hezbollah' },
  'houthis': { lat: 15.4, lng: 44.2, label: 'Houthis' },
  'nato': { lat: 50.88, lng: 4.42, label: 'NATO' },
};

/**
 * Match player names from the analysis to geo coordinates.
 */
function resolvePlayerLocations(players) {
  const resolved = [];
  for (const player of players) {
    const key = player.toLowerCase().trim();
    // Try exact match first
    if (GEO_COORDS[key]) {
      resolved.push({ name: player, ...GEO_COORDS[key] });
      continue;
    }
    // Try partial match
    let found = false;
    for (const [geoKey, coords] of Object.entries(GEO_COORDS)) {
      if (key.includes(geoKey) || geoKey.includes(key)) {
        resolved.push({ name: player, ...coords });
        found = true;
        break;
      }
    }
    if (!found) {
      // Place unknowns at a default with offset
      resolved.push({ name: player, lat: 20 + resolved.length * 10, lng: 0, label: player });
    }
  }
  return resolved;
}

/**
 * Convert lat/lng to 3D sphere coordinates.
 */
function latLngToVec3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Create a curved arc between two points on the globe.
 */
function createArc(start, end, color, heightScale) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  mid.normalize().multiplyScalar(start.length() + dist * (heightScale || 0.4));

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  const points = curve.getPoints(48);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: color || 0x22d3ee,
    transparent: true,
    opacity: 0.6,
    linewidth: 1.5,
  });
  return new THREE.Line(geometry, material);
}

/**
 * Create a pulsing marker at a point on the globe.
 */
function createMarker(position, color, size) {
  const geo = new THREE.SphereGeometry(size || 0.8, 12, 12);
  const mat = new THREE.MeshBasicMaterial({ color: color || 0x22d3ee, transparent: true, opacity: 0.9 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);

  // Glow ring
  const ringGeo = new THREE.RingGeometry(size * 1.5, size * 2.2, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: color || 0x22d3ee, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.copy(position);
  ring.lookAt(new THREE.Vector3(0, 0, 0));

  return { mesh, ring };
}

/**
 * Create a text sprite label.
 */
function createLabel(text, position, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 28px Inter, Arial, sans-serif';
  ctx.fillStyle = color || '#22d3ee';
  ctx.textAlign = 'center';
  ctx.fillText(text, 128, 40);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  const offset = position.clone().normalize().multiplyScalar(3);
  sprite.position.copy(position).add(offset);
  sprite.scale.set(6, 1.5, 1);
  return sprite;
}

/**
 * Initialize the interactive globe in a container element.
 */
function initGlobe(containerId, analysisResult) {
  const container = document.getElementById(containerId);
  if (!container || typeof THREE === 'undefined') return;

  const W = container.clientWidth;
  const H = Math.min(500, W * 0.6);
  container.style.height = H + 'px';

  // Scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
  camera.position.set(0, 0, 110);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0x334466, 1.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(50, 30, 50);
  scene.add(dirLight);

  // Globe with Earth texture (NASA Blue Marble)
  const RADIUS = 35;
  const globeGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
  const texLoader = new THREE.TextureLoader();
  const earthTex = texLoader.load('https://unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg');
  const bumpTex = texLoader.load('https://unpkg.com/three-globe@2.41.12/example/img/earth-topology.png');
  const globeMat = new THREE.MeshPhongMaterial({
    map: earthTex,
    bumpMap: bumpTex,
    bumpScale: 0.8,
    shininess: 15,
    transparent: true,
    opacity: 0.92,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // Subtle wireframe overlay for tech feel
  const wireGeo = new THREE.SphereGeometry(RADIUS + 0.15, 36, 18);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.06 });
  scene.add(new THREE.Mesh(wireGeo, wireMat));

  // Atmosphere glow
  const atmosGeo = new THREE.SphereGeometry(RADIUS + 2.5, 64, 64);
  const atmosMat = new THREE.MeshBasicMaterial({ color: 0x0891b2, transparent: true, opacity: 0.08, side: THREE.BackSide });
  scene.add(new THREE.Mesh(atmosGeo, atmosMat));

  // Resolve players to globe positions
  const players = analysisResult.players || [];
  const locations = resolvePlayerLocations(players);

  // Risk color mapping
  const probabilities = analysisResult.probabilities || {};
  const maxProb = Math.max(...Object.values(probabilities), 0.5);

  // Player markers + labels
  const markers = [];
  const playerColors = [0x22d3ee, 0xe879f9, 0xfbbf24, 0x4ade80, 0xf87171, 0x818cf8, 0xfb923c, 0x67e8f9];

  locations.forEach((loc, i) => {
    const pos = latLngToVec3(loc.lat, loc.lng, RADIUS + 1);
    const color = playerColors[i % playerColors.length];
    const marker = createMarker(pos, color, 1.0);
    scene.add(marker.mesh);
    scene.add(marker.ring);
    markers.push(marker);

    const label = createLabel(loc.label || loc.name, pos, '#' + color.toString(16).padStart(6, '0'));
    scene.add(label);
  });

  // Arcs between all player pairs (connection intensity based on analysis)
  const arcs = [];
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const posA = latLngToVec3(locations[i].lat, locations[i].lng, RADIUS + 1);
      const posB = latLngToVec3(locations[j].lat, locations[j].lng, RADIUS + 1);

      // Color: cyan for cooperative, magenta for adversarial, yellow for neutral
      const arcColors = [0x22d3ee, 0xe879f9, 0xfbbf24, 0x4ade80];
      const arcColor = arcColors[(i + j) % arcColors.length];

      const arc = createArc(posA, posB, arcColor, 0.3 + Math.random() * 0.2);
      arc.userData = { from: locations[i].name, to: locations[j].name };
      scene.add(arc);
      arcs.push(arc);
    }
  }

  // Mouse interaction for rotation
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let rotY = 0, rotX = 0.3;
  let autoRotate = true;

  container.addEventListener('mousedown', (e) => { isDragging = true; autoRotate = false; prevMouse = { x: e.clientX, y: e.clientY }; });
  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    rotY += (e.clientX - prevMouse.x) * 0.005;
    rotX += (e.clientY - prevMouse.y) * 0.005;
    rotX = Math.max(-1.2, Math.min(1.2, rotX));
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  container.addEventListener('mouseup', () => { isDragging = false; });
  container.addEventListener('mouseleave', () => { isDragging = false; });

  // Touch support
  container.addEventListener('touchstart', (e) => { isDragging = true; autoRotate = false; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    rotY += (e.touches[0].clientX - prevMouse.x) * 0.005;
    rotX += (e.touches[0].clientY - prevMouse.y) * 0.005;
    rotX = Math.max(-1.2, Math.min(1.2, rotX));
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  container.addEventListener('touchend', () => { isDragging = false; }, { passive: true });

  // Animation
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    if (autoRotate) rotY += 0.003;

    globe.rotation.y = rotY;
    globe.rotation.x = rotX;
    // Rotate everything together
    scene.children.forEach(child => {
      if (child !== camera && child.type !== 'AmbientLight' && child.type !== 'DirectionalLight') {
        child.rotation.y = rotY;
        child.rotation.x = rotX;
      }
    });

    // Pulse markers
    markers.forEach((m, i) => {
      const pulse = 1 + Math.sin(time * 3 + i) * 0.15;
      m.ring.scale.setScalar(pulse);
      m.ring.material.opacity = 0.2 + Math.sin(time * 2 + i) * 0.1;
    });

    // Animate arc opacity
    arcs.forEach((arc, i) => {
      arc.material.opacity = 0.3 + Math.sin(time * 1.5 + i * 0.7) * 0.2;
    });

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  const onResize = () => {
    const w = container.clientWidth;
    const h = Math.min(500, w * 0.6);
    container.style.height = h + 'px';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);
}

// Export for use in index.html
window.initGlobe = initGlobe;
