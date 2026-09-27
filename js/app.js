// CritterCraft: Moonless Night — 22x14 Tactical Citadel Valley, Flow-Field Mazing, 4-Portal Siege & 10s Intro.
import {
  GRID_W,
  GRID_H,
  ALTAR_GX,
  ALTAR_GZ,
  UNITS,
  UNIT_MAP,
  ZOMBIE_TYPES,
  computeDynamicCost,
  computeDynamicOreCost,
  computeHarmonyState,
  isTileIlluminated,
  computeBalanceState,
} from './balance.js';
import {
  box,
  vMat,
  makeBlockTexture,
  buildVoxelMoon,
  buildCatNapCutsceneRig,
  buildMoonAltar,
  buildPortalArch,
  buildResourceNodeMesh,
  buildStructureMesh,
  buildCritterUnitMesh,
  buildVoxelZombie,
} from './voxel_models.js';

const THREE = window.THREE;
const $ = (id) => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const TILE_SIZE = 1.08;
const gridToWorld = (gx, gz) => ({
  x: (gx - (GRID_W - 1) / 2) * TILE_SIZE,
  z: (gz - (GRID_H - 1) / 2) * TILE_SIZE,
});
const worldToGrid = (wx, wz) => ({
  gx: clamp(Math.round(wx / TILE_SIZE + (GRID_W - 1) / 2), 0, GRID_W - 1),
  gz: clamp(Math.round(wz / TILE_SIZE + (GRID_H - 1) / 2), 0, GRID_H - 1),
});

/* ============================================================ Renderer & Scene */
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#140f2d');
scene.fog = new THREE.FogExp2('#140f2d', 0.012);

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 160);

const hemiLight = new THREE.HemisphereLight('#c5b8ff', '#261c4a', 0.85);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight('#fff3bf', 1.55);
dirLight.position.set(10, 22, 14);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.left = -16;
dirLight.shadow.camera.right = 16;
dirLight.shadow.camera.top = 14;
dirLight.shadow.camera.bottom = -14;
scene.add(dirLight);

const altarLight = new THREE.PointLight('#ffd43b', 2.4, 9.5);
scene.add(altarLight);

const worldGroup = new THREE.Group();
scene.add(worldGroup);
const tileGroup = new THREE.Group();
const unitGroup = new THREE.Group();
const zombieGroup = new THREE.Group();
const projGroup = new THREE.Group();
const fxGroup = new THREE.Group();
const cineGroup = new THREE.Group();
worldGroup.add(tileGroup, unitGroup, zombieGroup, projGroup, fxGroup, cineGroup);

/* ============================================================ Game State */
const S = {
  screen: 'title', // 'title' | 'intro' | 'play' | 'victory'
  paused: false,
  sandbox: false,
  difficulty: 'tactical', // 'tactical' (Hard Default) | 'nightmare' | 'cozy'
  speedMode: 'normal', // 'normal' (1.0x) | 'fast' (1.45x) | 'gentle' (0.6x)
  camPreset: 'wide', // 'wide' (full 22x14 map) | 'citadel' (zoomed in)
  musicOn: true,
  soundOn: true,
  roleFilter: 'all',
  selectedTool: 'sunnyfox',

  // 10-second opening cutscene state
  introTime: 0,
  introPhase: 0,
  moonVisible: true,
  catnapState: 'cute',

  // Dual-Resource Economy & Objective
  starlight: 115,
  ore: 50,
  moonShards: 0,
  moonTarget: 100,
  baseHp: 600,
  baseMaxHp: 600,
  wave: 1,
  waveTimer: 22,
  time: 0,
  spawnTimer: 2.2,
  smokeStormTimer: 11.0,
  passiveTimer: 0,
  carePackageCooldown: 0,

  // Entities & 22x14 Grid
  gridW: GRID_W,
  gridH: GRID_H,
  tiles: [], // [gx][gz]
  flowField: [], // [gx][gz] -> { dx, dz, cost }
  units: [],
  zombies: [],
  projectiles: [],
  orbs: [],
  particles: [],
  cineZombies: [],
  cineCritters: [],

  // Camera Orbit & Pan
  camYaw: 0,
  camPitch: 0.76,
  camZoom: 1.0,
  ready: false,
};

/* ============================================================ Audio */
let AC = null;
const tracks = {
  intro: new Audio('music/moonless_intro.mp3'),
  village: new Audio('music/voxel_village.mp3'),
};
tracks.intro.loop = false;
tracks.village.loop = true;
tracks.intro.volume = 0.45;
tracks.village.volume = 0.38;
let activeTrack = null;

function playMusic(name) {
  activeTrack = name;
  for (const [k, a] of Object.entries(tracks)) {
    if (k !== name) a.pause();
  }
  const t = tracks[name];
  if (!t) return;
  if (S.musicOn && !S.paused && S.screen !== 'title') {
    if (name === 'intro') t.currentTime = 0;
    t.play().catch(() => {});
  } else {
    t.pause();
  }
}

function initAudio() {
  if (!AC) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) AC = new Ctx();
  }
  if (AC && AC.state === 'suspended') AC.resume().catch(() => {});
}

function sfx(kind) {
  if (!S.soundOn) return;
  initAudio();
  if (!AC) return;
  const now = AC.currentTime;
  const osc = AC.createOscillator();
  const gain = AC.createGain();
  osc.connect(gain);
  gain.connect(AC.destination);
  if (kind === 'place') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.09);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (kind === 'dig') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (kind === 'star') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.19);
  } else if (kind === 'rocket') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.65);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc.start(now);
    osc.stop(now + 0.72);
  } else if (kind === 'boom') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.38);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.42);
  } else if (kind === 'win') {
    [523, 659, 784, 1046].forEach((f, i) => {
      const o = AC.createOscillator();
      const g = AC.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, now + i * 0.11);
      g.gain.setValueAtTime(0.16, now + i * 0.11);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.28);
      o.connect(g);
      g.connect(AC.destination);
      o.start(now + i * 0.11);
      o.stop(now + i * 0.11 + 0.3);
    });
  }
}

/* ============================================================ 22x14 Multi-Biome Voxel World */
const grassTex = makeBlockTexture('#37b24d', '#2b8a3e');
const darkGrassTex = makeBlockTexture('#2b8a3e', '#237032');
const cliffTex = makeBlockTexture('#868e96', '#495057', true);
const cryptTex = makeBlockTexture('#3b1f7a', '#5f3dc4', true);
const waterTex = makeBlockTexture('#1c7ed6', '#339af0');

let moonMesh = null;
let catnapRig = null;
let altarMesh = null;
const portalMeshes = {};
const pineTrees = [];
const skyClouds = [];

// Resource Vein & Terrain Lookup Helpers
const STAR_VEINS = new Set(['6,3', '15,3', '6,10', '15,10']);
const REDSTONE_VEINS = new Set(['7,6', '14,7', '10,3', '11,10']);
const MOON_GEODES = new Set(['3,2', '18,2', '3,11', '18,11']);
const HIGH_CLIFFS = new Set([
  '8,4', '13,4', '8,9', '13,9',
  '4,5', '17,5', '4,8', '17,8',
]);
const WATER_TILES = new Set([
  '5,2', '5,3', '5,4',
  '16,2', '16,3', '16,4',
  '5,9', '5,10', '5,11',
  '16,9', '16,10', '16,11',
]);

function isPortalTile(gx, gz) {
  if (gx === GRID_W - 1 && (gz === 6 || gz === 7)) return 'E';
  if (gx === 0 && (gz === 6 || gz === 7)) return 'W';
  if (gz === 0 && (gx === 10 || gx === 11)) return 'N';
  if (gz === GRID_H - 1 && (gx === 10 || gx === 11)) return 'S';
  return null;
}

function buildWorld() {
  tileGroup.clear();
  cineGroup.clear();
  pineTrees.length = 0;
  skyClouds.length = 0;
  S.tiles = [];

  for (let gx = 0; gx < GRID_W; gx++) {
    S.tiles[gx] = [];
    for (let gz = 0; gz < GRID_H; gz++) {
      const key = `${gx},${gz}`;
      const { x, z } = gridToWorld(gx, gz);
      const portalDir = isPortalTile(gx, gz);
      const isCrypt = !!portalDir;
      const isAltar = (gx === 10 || gx === 11) && (gz === 6 || gz === 7);
      const isWater = WATER_TILES.has(key);
      const elevation = HIGH_CLIFFS.has(key) ? 1 : 0;
      const oreKind = STAR_VEINS.has(key)
        ? 'star'
        : REDSTONE_VEINS.has(key)
        ? 'redstone'
        : MOON_GEODES.has(key)
        ? 'geode'
        : null;

      const mat = new THREE.MeshStandardMaterial({
        map: isCrypt
          ? cryptTex
          : isWater
          ? waterTex
          : elevation > 0
          ? cliffTex
          : (gx + gz) % 2 === 0
          ? grassTex
          : darkGrassTex,
        roughness: isWater ? 0.22 : 0.82,
      });

      const blockH = isWater ? 0.28 : elevation > 0 ? 0.76 : 0.44;
      const topY = isWater ? -0.08 : elevation > 0 ? 0.32 : 0.0;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(TILE_SIZE * 0.98, blockH, TILE_SIZE * 0.98),
        mat
      );
      mesh.position.set(x, topY - blockH / 2, z);
      mesh.receiveShadow = true;
      tileGroup.add(mesh);

      // Lit / Red-Smoke Corruption overlay ring on top of tile
      const ring = box(TILE_SIZE * 0.9, 0.025, TILE_SIZE * 0.9, '#ffd43b', x, topY + 0.015, z, {
        transparent: true,
        opacity: 0.0,
        emissive: '#ffd43b',
        emissiveIntensity: 0.45,
      });
      tileGroup.add(ring);

      // Red-Smoke corruption cloud mesh (hidden unless corrupted)
      const smokeMesh = box(TILE_SIZE * 0.85, 0.28, TILE_SIZE * 0.85, '#e03131', x, topY + 0.16, z, {
        emissive: '#9c36b5',
        emissiveIntensity: 0.75,
        transparent: true,
        opacity: 0.48,
      });
      smokeMesh.visible = false;
      tileGroup.add(smokeMesh);

      let oreMesh = null;
      if (oreKind) {
        oreMesh = buildResourceNodeMesh(oreKind);
        oreMesh.position.set(x, topY, z);
        tileGroup.add(oreMesh);
      }

      const tile = {
        gx,
        gz,
        x,
        z,
        topY,
        elevation,
        portalDir,
        isCrypt,
        isAltar,
        isWater,
        hasBridge: false,
        bridgeMesh: null,
        oreKind,
        hasOre: !!oreKind,
        oreMesh,
        smokeTimer: 0,
        smokeMesh,
        mesh,
        ring,
        unit: null,
      };
      mesh.userData.tile = tile;
      S.tiles[gx][gz] = tile;
    }
  }

  // Central Citadel Moon Altar at (10.5, 6.5)
  const altarPos = gridToWorld(ALTAR_GX, ALTAR_GZ);
  altarMesh = buildMoonAltar();
  altarMesh.position.set(altarPos.x, 0, altarPos.z);
  tileGroup.add(altarMesh);
  altarLight.position.set(altarPos.x, 2.5, altarPos.z);

  // 4 Cardinal Invasion Portal Arches (E, W, N, S)
  const pCoords = {
    E: gridToWorld(GRID_W - 0.6, 6.5),
    W: gridToWorld(-0.4, 6.5),
    N: gridToWorld(10.5, -0.4),
    S: gridToWorld(10.5, GRID_H - 0.6),
  };
  for (const [dir, pos] of Object.entries(pCoords)) {
    const pm = buildPortalArch(dir);
    pm.position.set(pos.x, 0, pos.z);
    tileGroup.add(pm);
    portalMeshes[dir] = pm;
  }

  // Surrounding Voxel Pine Trees outside the 22x14 border
  for (let i = 0; i < 24; i++) {
    const side = i < 12 ? -1 : 1;
    const tx = -12.5 + (i % 12) * 2.25;
    if (Math.abs(tx) < 2.2) continue; // keep N/S portal clear
    const tz = side * (GRID_H * TILE_SIZE * 0.5 + 1.45 + (i % 3) * 0.55);
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);
    tree.add(box(0.7, 0.35, 0.7, '#2b8a3e', 0, -0.17, 0));
    tree.add(box(0.28, 0.75, 0.28, '#5c3c1e', 0, 0.38, 0));
    tree.add(box(0.88, 0.62, 0.88, '#2f9e44', 0, 0.92, 0));
    tree.add(box(0.62, 0.55, 0.62, '#37b24d', 0, 1.38, 0));
    tileGroup.add(tree);
    pineTrees.push(tree);
  }

  // Slow Drifting Voxel Night Clouds
  for (let i = 0; i < 6; i++) {
    const cl = box(2.5 + (i % 2) * 0.9, 0.38, 1.2, '#2b2354', -13 + i * 5.2, 7.5 + (i % 2) * 0.7, -8.5 - (i % 3) * 0.8, {
      transparent: true,
      opacity: 0.62,
    });
    tileGroup.add(cl);
    skyClouds.push(cl);
  }

  // 3D Voxel Full Moon in the Sky
  moonMesh = buildVoxelMoon();
  moonMesh.position.set(1.4, 4.9, -5.4);
  cineGroup.add(moonMesh);

  // CatNap Transformation & Rocket Rig on the North Hilltop
  catnapRig = buildCatNapCutsceneRig();
  catnapRig.position.set(-1.2, 0.2, -5.2);
  cineGroup.add(catnapRig);

  recomputeFlowField();
}

/* ============================================================ Real-Time BFS Flow-Field Maze Pathfinding */
function recomputeFlowField() {
  const dist = Array.from({ length: GRID_W }, () => Array(GRID_H).fill(9999));
  const q = [];

  // Seed with the 4 central Altar tiles
  for (const [ax, az] of [[10, 6], [11, 6], [10, 7], [11, 7]]) {
    dist[ax][az] = 0;
    q.push([ax, az]);
  }

  const dirs = [
    [1, 0, 1.0],
    [-1, 0, 1.0],
    [0, 1, 1.0],
    [0, -1, 1.0],
  ];

  // Dijkstra / weighted BFS so zombies route around walls & rivers when a corridor is open,
  // or breach the thinnest wall if completely sealed!
  let head = 0;
  while (head < q.length) {
    const [cx, cz] = q[head++];
    const curD = dist[cx][cz];
    for (const [dx, dz, stepCost] of dirs) {
      const nx = cx + dx;
      const nz = cz + dz;
      if (nx < 0 || nx >= GRID_W || nz < 0 || nz >= GRID_H) continue;
      const t = S.tiles[nx][nz];
      let tilePenalty = stepCost;
      if (t.isWater && !t.hasBridge) tilePenalty += 4.5; // zombies prefer dry land or bridges over deep water
      if (t.elevation > 0) tilePenalty += 1.5;
      if (t.unit) {
        // High penalty for walls/towers so zombies maze around them unless sealed!
        tilePenalty += t.unit.isStructure || t.unit.def?.role === 'defend' ? 14.0 : 8.0;
      }
      const nd = curD + tilePenalty;
      if (nd < dist[nx][nz]) {
        dist[nx][nz] = nd;
        q.push([nx, nz]);
      }
    }
  }

  S.flowField = Array.from({ length: GRID_W }, (_, gx) =>
    Array.from({ length: GRID_H }, (__, gz) => {
      let bestDx = ALTAR_GX - gx;
      let bestDz = ALTAR_GZ - gz;
      let bestVal = dist[gx][gz];
      for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        const nx = gx + dx;
        const nz = gz + dz;
        if (nx < 0 || nx >= GRID_W || nz < 0 || nz >= GRID_H) continue;
        if (dist[nx][nz] < bestVal) {
          bestVal = dist[nx][nz];
          bestDx = dx;
          bestDz = dz;
        }
      }
      const len = Math.hypot(bestDx, bestDz) || 1;
      return { dx: bestDx / len, dz: bestDz / len, cost: dist[gx][gz] };
    })
  );
}

/* ============================================================ 10-Second Opening Cinematics */
function startIntroCutscene() {
  initAudio();
  S.screen = 'intro';
  S.paused = false;
  S.introTime = 0;
  S.introPhase = 1;
  S.moonVisible = true;
  S.catnapState = 'cute';
  document.body.classList.remove('titleScreen');
  document.body.classList.add('inIntro');
  $('titleModal').classList.add('hidden');
  $('victoryModal').classList.add('hidden');
  $('cineBanner').classList.remove('hidden');

  clearGameplayEntities();
  catnapRig.position.set(-1.2, 0.2, -5.2);
  if (moonMesh) {
    moonMesh.visible = true;
    moonMesh.scale.setScalar(1);
    moonMesh.position.set(1.4, 4.9, -5.4);
  }
  const { cute, night, rocket, flame } = catnapRig.userData;
  cute.visible = true;
  cute.scale.setScalar(1);
  night.visible = false;
  night.scale.setScalar(0.2);
  rocket.visible = true;
  rocket.position.set(1.35, 0.16, 0);
  flame.visible = false;

  S.cineZombies.forEach((z) => cineGroup.remove(z));
  S.cineCritters.forEach((c) => cineGroup.remove(c.mesh || c));
  S.cineZombies = [];
  S.cineCritters = [];

  playMusic('intro');
  updateCineText(
    'Phase 1 / 3 · 月黑风高 (Windy Moonlit Night)',
    'Cute CatNap stands under the Full Moon… swirling purple dream-mist transforms him into Nightmare CatNap!'
  );
}

function updateCineText(title, sub) {
  $('cinePhase').textContent = title;
  $('cineSub').textContent = sub;
}

function stepIntroCutscene(dt) {
  S.introTime += dt;
  const t = S.introTime;
  const { cute, night, smokeGroup, rocket, flame } = catnapRig.userData;

  $('cineTimer').textContent = `${Math.max(0, 10.0 - t).toFixed(1)}s`;

  pineTrees.forEach((tr, i) => {
    tr.rotation.z = Math.sin(t * 2.1 + i) * 0.05;
  });

  if (t < 3.2) {
    S.introPhase = 1;
    camera.position.set(0.1 + Math.sin(t * 0.4) * 0.35, 3.4, 4.2);
    camera.lookAt(0.2, 2.7, -5.2);

    if (t < 1.6) {
      cute.visible = true;
      night.visible = false;
      S.catnapState = 'cute';
      cute.position.y = Math.abs(Math.sin(t * 4)) * 0.08;
      cute.rotation.y = Math.sin(t * 2) * 0.18;
    } else {
      const p = clamp((t - 1.6) / 1.2, 0, 1);
      cute.visible = p < 0.45;
      cute.scale.setScalar(1 + p * 0.4);
      night.visible = true;
      S.catnapState = 'nightmare';
      night.scale.setScalar(0.35 + 0.65 * p);
      smokeGroup.rotation.y = t * 2.4;
    }
  } else if (t < 6.8) {
    if (S.introPhase !== 2) {
      S.introPhase = 2;
      cute.visible = false;
      night.visible = true;
      night.scale.setScalar(1);
      S.catnapState = 'nightmare';
      flame.visible = true;
      sfx('rocket');
      updateCineText(
        'Phase 2 / 3 · Rocket Launch to the Moon! 🚀🌕',
        'Nightmare CatNap launches his Red-Smoke Rocket straight into the Full Moon — the Moon vanishes!'
      );
    }
    smokeGroup.rotation.y = t * 2.5;
    const flight = clamp((t - 3.3) / 2.4, 0, 1);
    rocket.position.y = 0.16 + flight * 6.2;
    rocket.position.x = 1.35 + flight * 1.35;
    rocket.rotation.y = t * 4;

    camera.position.set(0.5, 3.8 + flight * 1.4, 3.8);
    camera.lookAt(0.8, 2.5 + flight * 3.2, -5.2);

    if (t >= 5.7 && S.moonVisible) {
      S.moonVisible = false;
      moonMesh.visible = false;
      rocket.visible = false;
      sfx('boom');
      scene.background.set('#0b081c');
      hemiLight.intensity = 0.42;
      dirLight.intensity = 0.55;
      for (let i = 0; i < 18; i++) {
        spawnBurstCube(1.5, 6.4, -5.5, i % 2 ? '#ffd43b' : '#b197fc', 2.4);
      }
      updateCineText(
        'Phase 2 / 3 · The Moon Is Gone! 🌑',
        'Poof! The Moon shattered into 100 Moon Shards across the 22×14 Valley!'
      );
    }
  } else if (t < 10.0) {
    if (S.introPhase !== 3) {
      S.introPhase = 3;
      sfx('place');
      updateCineText(
        'Phase 3 / 3 · 4-Portal Zombies Emerge & Critters Rally! 🧟‍♂️✨',
        'Zombies rise around the 22×14 Citadel — and Smiling Critters hop in to build, maze, and restore the Moon!'
      );
      const zTypes = ['walker', 'runner', 'bucket', 'creeper', 'balloon', 'digger'];
      zTypes.forEach((zt, idx) => {
        const zm = buildVoxelZombie(ZOMBIE_TYPES[zt]);
        const pos = gridToWorld(15 + (idx % 3) * 1.6, 4 + Math.floor(idx / 3) * 3.2);
        zm.position.set(pos.x, -1.2, pos.z);
        cineGroup.add(zm);
        S.cineZombies.push(zm);
      });
      const cIds = ['sunnyfox', 'lunabat', 'poppydash', 'bobby', 'bubba', 'dogday', 'craftycorn', 'kickin'];
      cIds.forEach((cid, idx) => {
        const cm = buildCritterUnitMesh(UNIT_MAP[cid]);
        const pos = gridToWorld(8 + (idx % 4) * 1.5, 4.8 + Math.floor(idx / 4) * 3.0);
        cm.position.set(pos.x, 3.2 + idx * 0.35, pos.z);
        cineGroup.add(cm);
        S.cineCritters.push({ mesh: cm, delay: idx * 0.12 });
      });
    }

    const k = clamp((t - 6.8) / 3.0, 0, 1);
    camera.position.set(0, 7.5 + k * 8.2, 9.0 + k * 8.5);
    camera.lookAt(0, 0.2, 0);

    const zRise = clamp((t - 6.9) / 1.4, 0, 1);
    S.cineZombies.forEach((zm, i) => {
      zm.position.y = -1.2 + zRise * 1.2;
      zm.rotation.y = Math.sin(t * 4 + i) * 0.15;
    });

    S.cineCritters.forEach((c, i) => {
      const ck = clamp((t - 7.1 - c.delay) / 0.9, 0, 1);
      c.mesh.position.y = (1 - ck) * 3.2 + Math.abs(Math.sin(t * 6 + i)) * 0.12;
    });
  } else {
    finishIntroAndStartGame();
  }
}

function finishIntroAndStartGame() {
  S.cineZombies.forEach((z) => cineGroup.remove(z));
  S.cineCritters.forEach((c) => cineGroup.remove(c.mesh));
  S.cineZombies = [];
  S.cineCritters = [];

  // Move Nightmare CatNap onto the far North Citadel Ridge
  catnapRig.position.set(-2.5, 0.2, -9.2);
  const { cute, night, rocket } = catnapRig.userData;
  cute.visible = false;
  night.visible = true;
  night.scale.setScalar(1);
  rocket.visible = false;
  S.catnapState = 'nightmare';
  S.moonVisible = false;
  if (moonMesh) moonMesh.visible = false;
  scene.background.set('#0e0a24');
  hemiLight.intensity = 0.55;
  dirLight.intensity = 0.78;

  S.screen = 'play';
  document.body.classList.remove('inIntro', 'titleScreen');
  $('cineBanner').classList.add('hidden');
  $('titleModal').classList.add('hidden');

  if (S.units.length === 0) {
    setupStarterCitadel();
  }
  framePlayCamera();
  playMusic('village');
  say(
    '22×14 Tactical Siege: Expand to Redstone & Moon Geode veins, maze the East/West gates, and watch for Flying Balloons & Creepers!',
    4.8
  );
  updateHUD();
}

/* ============================================================ Gameplay Setup, Building & Engineering */
function clearGameplayEntities() {
  unitGroup.clear();
  zombieGroup.clear();
  projGroup.clear();
  fxGroup.clear();
  S.units = [];
  S.zombies = [];
  S.projectiles = [];
  S.orbs = [];
  S.particles = [];
  for (let gx = 0; gx < GRID_W; gx++) {
    for (let gz = 0; gz < GRID_H; gz++) {
      const t = S.tiles[gx]?.[gz];
      if (!t) continue;
      t.unit = null;
      t.smokeTimer = 0;
      if (t.smokeMesh) t.smokeMesh.visible = false;
      if (t.bridgeMesh) {
        tileGroup.remove(t.bridgeMesh);
        t.bridgeMesh = null;
        t.hasBridge = false;
      }
    }
  }
}

function resetGame(playIntro = false) {
  clearGameplayEntities();
  S.starlight = 115;
  S.ore = 50;
  S.moonShards = 0;
  S.baseHp = 600;
  S.baseMaxHp = 600;
  S.wave = 1;
  S.waveTimer = 22;
  S.spawnTimer = 2.2;
  S.smokeStormTimer = 11.0;

  for (let gx = 0; gx < GRID_W; gx++) {
    for (let gz = 0; gz < GRID_H; gz++) {
      const t = S.tiles[gx][gz];
      if (t.oreMesh) {
        t.hasOre = true;
        t.oreMesh.visible = true;
      }
    }
  }
  recomputeFlowField();
  if (playIntro) {
    startIntroCutscene();
  } else {
    finishIntroAndStartGame();
  }
}

function setupStarterCitadel() {
  // Compact starter garrison around Central Citadel (10..11, 6..7) — player must expand outward to veins & geodes!
  placeCritterUnit(9, 5, 'sunnyfox', true); // Lantern light + Starlight
  placeCritterUnit(10, 4, 'poppydash', true); // Near North Redstone Vein (10,3)
  placeCritterUnit(13, 6, 'bobby', true); // East Gate Bastion Wall
  placeCritterUnit(12, 6, 'lunabat', true); // East Gate Anti-Air Crossbow
  placeCritterUnit(8, 7, 'mikey', true); // West Gate Watchtower

  // Initial Wave 1 East Portal reconnaissance squad
  spawnZombieFromPortal('walker', 'E');
  spawnZombieFromPortal('runner', 'E');
  spawnZombieFromPortal('digger', 'E');
}

function countUnitType(unitId) {
  let n = 0;
  for (const u of S.units) {
    if (u.def?.id === unitId) n++;
    if (u.mounted && u.mounted.def?.id === unitId) n++;
  }
  return n;
}

function updatePowerNetwork() {
  for (const u of S.units) {
    u.powered = false;
    if (u.isStructure) continue;
    for (const other of S.units) {
      if (
        (other.structureKind === 'conduit' || other.def?.id === 'poppydash') &&
        Math.hypot(other.gx - u.gx, other.gz - u.gz) <= 2.3
      ) {
        u.powered = true;
        break;
      }
    }
  }
}

function placeStructureAt(gx, gz, kind = 'wall', free = false) {
  if (gx < 0 || gx >= GRID_W || gz < 0 || gz >= GRID_H) return { ok: false, reason: 'out_of_bounds' };
  const tile = S.tiles[gx][gz];
  if (tile.isCrypt || tile.isAltar) return { ok: false, reason: 'reserved_tile' };

  const oreCost = free ? 0 : kind === 'wall' ? 12 : 14;
  if (!free && !S.sandbox && S.ore < oreCost) {
    say(`Need ${oreCost} ⚙️ Redstone Ore! Build PoppyDash Quarries or mine redstone rocks!`, 2.2);
    return { ok: false, reason: 'no_ore' };
  }

  // Building a Cobble Bridge on a deep river tile makes that water tile walkable & buildable!
  if (kind === 'wall' && tile.isWater && !tile.hasBridge) {
    if (!free && !S.sandbox) S.ore -= oreCost;
    const bMesh = buildStructureMesh('wall', true);
    bMesh.position.set(tile.x, 0, tile.z);
    tileGroup.add(bMesh);
    tile.hasBridge = true;
    tile.bridgeMesh = bMesh;
    sfx('place');
    recomputeFlowField();
    updateHUD();
    return { ok: true, action: 'built_bridge' };
  }

  if (tile.unit) return { ok: false, reason: 'occupied' };
  if (!free && !S.sandbox) S.ore -= oreCost;

  const mesh = buildStructureMesh(kind, false);
  mesh.position.set(tile.x, tile.topY, tile.z);
  unitGroup.add(mesh);

  const st = {
    gx,
    gz,
    x: tile.x,
    z: tile.z,
    isStructure: true,
    structureKind: kind,
    def: {
      id: `struct_${kind}`,
      name: kind === 'wall' ? 'Cobble Maze Wall' : 'Redstone Conduit',
      role: 'defend',
      baseCost: 0,
      oreCost,
      hp: kind === 'wall' ? 540 : 260,
    },
    level: 1,
    hp: kind === 'wall' ? 540 : 260,
    maxHp: kind === 'wall' ? 540 : 260,
    mesh,
  };
  tile.unit = st;
  S.units.push(st);
  sfx('place');
  updatePowerNetwork();
  recomputeFlowField();
  updateHUD();
  return { ok: true, action: `placed_${kind}`, unit: st };
}

function placeCritterUnit(gx, gz, unitId, free = false) {
  if (gx < 0 || gx >= GRID_W || gz < 0 || gz >= GRID_H) return { ok: false, reason: 'out_of_bounds' };
  const tile = S.tiles[gx][gz];
  if (tile.isCrypt || tile.isAltar) return { ok: false, reason: 'reserved_tile' };

  const def = UNIT_MAP[unitId];
  if (!def) return { ok: false, reason: 'unknown_unit' };

  if (tile.isWater && !tile.hasBridge && !def.amphibious) {
    say('🌊 Deep River! Build a 🧱 Cobble Bridge (12 ⚙️) first or place Bubba Moat!', 2.4);
    return { ok: false, reason: 'water_tile' };
  }

  const count = countUnitType(unitId);
  const starCost = free ? 0 : computeDynamicCost(unitId, count);
  const oreCost = free ? 0 : computeDynamicOreCost(unitId, count);

  // Case A: Stack Attack Critter on top of Mikey & JJ Watchtower
  if (tile.unit && tile.unit.def?.stackable && !tile.unit.mounted && def.role === 'attack') {
    if (!free && !S.sandbox && (S.starlight < starCost || S.ore < oreCost)) {
      say(`Need ${starCost} 🌟 + ${oreCost} ⚙️ to mount ${def.name}!`, 2.0);
      return { ok: false, reason: 'insufficient_resources' };
    }
    if (!free && !S.sandbox) {
      S.starlight -= starCost;
      S.ore -= oreCost;
    }
    const mMesh = buildCritterUnitMesh(def);
    mMesh.position.set(0, 0.86, 0);
    mMesh.scale.setScalar(0.88);
    tile.unit.mesh.add(mMesh);
    tile.unit.mounted = {
      def,
      level: 1,
      cooldown: 0.2,
      mesh: mMesh,
    };
    sfx('place');
    spawnBurstCube(tile.x, tile.topY + 1.4, tile.z, def.color, 1.2);
    updatetileLightVisuals();
    updateHUD();
    return { ok: true, action: 'mounted', unit: tile.unit };
  }

  // Case B: Tap same unit -> Upgrade it
  if (tile.unit && tile.unit.def?.id === unitId) {
    return upgradeUnitAt(gx, gz, free);
  }

  if (tile.unit) return { ok: false, reason: 'occupied' };

  if (!free && !S.sandbox && (S.starlight < starCost || S.ore < oreCost)) {
    say(`Need ${starCost} 🌟 + ${oreCost} ⚙️ for ${def.name}!`, 2.0);
    return { ok: false, reason: 'insufficient_resources' };
  }
  if (!free && !S.sandbox) {
    S.starlight -= starCost;
    S.ore -= oreCost;
  }

  const mesh = buildCritterUnitMesh(def);
  mesh.position.set(tile.x, tile.topY, tile.z);
  unitGroup.add(mesh);

  const unit = {
    gx,
    gz,
    x: tile.x,
    z: tile.z,
    topY: tile.topY,
    elevation: tile.elevation,
    def,
    level: 1,
    hp: def.hp,
    maxHp: def.hp,
    cooldown: 0.4,
    prodTimer: def.prodInterval ? def.prodInterval * 0.65 : 0,
    asleep: false,
    powered: false,
    mesh,
    mounted: null,
  };
  tile.unit = unit;
  S.units.push(unit);

  if (!free) {
    sfx('place');
    spawnBurstCube(tile.x, tile.topY + 0.7, tile.z, def.color, 1.0);
  }
  updatePowerNetwork();
  recomputeFlowField();
  updatetileLightVisuals();
  updateHUD();
  return { ok: true, action: 'placed', unit };
}

function upgradeUnitAt(gx, gz, free = false) {
  const tile = S.tiles[gx]?.[gz];
  if (!tile || !tile.unit) return { ok: false, reason: 'empty' };
  const u = tile.unit;
  if (u.level >= 4) {
    say(`${u.def.name} is at Awakened MAX Level 4! 👑`, 1.8);
    return { ok: false, reason: 'max_level' };
  }
  const starCost = free ? 0 : Math.round((u.def.baseCost || 20) * 0.85 * u.level);
  const oreCost = free ? 0 : Math.round((u.def.oreCost || 10) * 0.9 * u.level);
  if (!free && !S.sandbox && (S.starlight < starCost || S.ore < oreCost)) {
    say(`Upgrade to Lv.${u.level + 1} needs ${starCost} 🌟 + ${oreCost} ⚙️!`, 2.0);
    return { ok: false, reason: 'insufficient_resources' };
  }
  if (!free && !S.sandbox) {
    S.starlight -= starCost;
    S.ore -= oreCost;
  }
  u.level++;
  u.maxHp = Math.round(u.def.hp * (1 + (u.level - 1) * 0.48));
  u.hp = u.maxHp;
  if (u.mounted) u.mounted.level = u.level;
  if (u.mesh.userData.crown) u.mesh.userData.crown.visible = true;
  u.mesh.scale.setScalar(1 + (u.level - 1) * 0.09);
  sfx('star');
  spawnBurstCube(u.x, (u.topY || 0) + 1.2, u.z, '#ffd43b', 1.3);
  updatetileLightVisuals();
  updateHUD();
  return { ok: true, action: 'upgraded', level: u.level };
}

function purifyAt(gx, gz, free = false) {
  const cost = free ? 0 : 15;
  if (!free && !S.sandbox && S.starlight < cost) {
    say('Need 15 🌟 Starlight to cast Purify & Wake!', 1.8);
    return { ok: false, reason: 'no_starlight' };
  }
  if (!free && !S.sandbox) S.starlight -= cost;
  let woke = 0;
  for (let x = Math.max(0, gx - 2); x <= Math.min(GRID_W - 1, gx + 2); x++) {
    for (let z = Math.max(0, gz - 2); z <= Math.min(GRID_H - 1, gz + 2); z++) {
      if (Math.hypot(x - gx, z - gz) <= 2.6) {
        const t = S.tiles[x][z];
        t.smokeTimer = 0;
        t.smokeMesh.visible = false;
        if (t.unit) {
          if (t.unit.asleep) woke++;
          t.unit.asleep = false;
          if (t.unit.mesh.userData.sleepBadge) t.unit.mesh.userData.sleepBadge.visible = false;
          t.unit.hp = Math.min(t.unit.maxHp, t.unit.hp + 45);
        }
      }
    }
  }
  const pos = gridToWorld(gx, gz);
  sfx('star');
  spawnBurstCube(pos.x, 0.8, pos.z, '#ffd43b', 1.6);
  say(`✨ Cleansed Red-Smoke Fog & healed allies (${woke} woken)!`, 2.2);
  updatetileLightVisuals();
  updateHUD();
  return { ok: true, action: 'purified', woke };
}

function digOrMineAt(gx, gz) {
  const tile = S.tiles[gx]?.[gz];
  if (!tile) return { ok: false, reason: 'invalid' };
  if (tile.unit) {
    const u = tile.unit;
    const refundStar = Math.round((u.def.baseCost || 0) * 0.8);
    const refundOre = Math.round((u.def.oreCost || 0) * 0.8);
    S.starlight += refundStar;
    S.ore += refundOre;
    unitGroup.remove(u.mesh);
    S.units = S.units.filter((x) => x !== u);
    tile.unit = null;
    sfx('dig');
    spawnBurstCube(tile.x, 0.5, tile.z, '#ffd43b', 0.9);
    updatePowerNetwork();
    recomputeFlowField();
    updatetileLightVisuals();
    updateHUD();
    return { ok: true, action: 'refunded', refundStar, refundOre };
  }
  if (tile.hasOre) {
    tile.hasOre = false;
    if (tile.oreMesh) tile.oreMesh.visible = false;
    if (tile.oreKind === 'star') {
      S.starlight += 28;
      say('⛏️ Mined Starlight Vein! +28 🌟 (or leave intact for +60% SunnyFox output!)', 2.4);
    } else if (tile.oreKind === 'redstone') {
      S.ore += 24;
      say('⛏️ Mined Redstone Vein! +24 ⚙️ Ore!', 2.4);
    } else if (tile.oreKind === 'geode') {
      addMoonShards(4);
      S.starlight += 12;
      say('⛏️ Cracked Ancient Moon Geode! +4 🌙 Shards & +12 🌟!', 2.4);
    }
    sfx('star');
    spawnBurstCube(tile.x, 0.5, tile.z, '#ffd43b', 1.4);
    updateHUD();
    return { ok: true, action: 'mined_ore', kind: tile.oreKind };
  }
  return { ok: false, reason: 'nothing_to_dig' };
}

function refineShards() {
  if (!S.sandbox && (S.starlight < 35 || S.ore < 20)) {
    say('🔬 Shard Refinery requires 35 🌟 Starlight + 20 ⚙️ Redstone Ore -> +5 🌙 Shards!', 2.4);
    return { ok: false, reason: 'insufficient_resources' };
  }
  if (!S.sandbox) {
    S.starlight -= 35;
    S.ore -= 20;
  }
  addMoonShards(5);
  sfx('star');
  const pos = gridToWorld(ALTAR_GX, ALTAR_GZ);
  spawnBurstCube(pos.x, 1.6, pos.z, '#ffd43b', 1.6);
  say('🔬 Refined +5 🌙 Moon Shards at the Central Citadel Altar!', 2.2);
  updateHUD();
  return { ok: true, moonShards: S.moonShards };
}

function updatetileLightVisuals() {
  const moonUp = S.moonShards >= S.moonTarget;
  for (let gx = 0; gx < GRID_W; gx++) {
    for (let gz = 0; gz < GRID_H; gz++) {
      const t = S.tiles[gx][gz];
      const lit = isTileIlluminated(gx, gz, S.units, moonUp);
      t.ring.material.opacity = lit ? 0.16 : 0.0;
    }
  }
}

/* ============================================================ Multi-Portal Zombies & Red-Smoke Hazards */
function spawnZombieFromPortal(typeId = 'walker', dir = 'E') {
  let gx = GRID_W - 1;
  let gz = 6 + Math.floor(Math.random() * 2);
  if (dir === 'W') {
    gx = 0;
    gz = 5 + Math.floor(Math.random() * 4);
  } else if (dir === 'N') {
    gx = 9 + Math.floor(Math.random() * 4);
    gz = 0;
  } else if (dir === 'S') {
    gx = 9 + Math.floor(Math.random() * 4);
    gz = GRID_H - 1;
  } else {
    gx = GRID_W - 1;
    gz = 5 + Math.floor(Math.random() * 4);
  }
  return spawnZombie(typeId, gz, gx, dir);
}

function spawnZombie(typeId = 'walker', gz = 6, gx = GRID_W - 1, portalDir = 'E') {
  const def = ZOMBIE_TYPES[typeId] || ZOMBIE_TYPES.walker;
  const col = clamp(gx, 0, GRID_W - 1);
  const row = clamp(gz, 0, GRID_H - 1);
  const pos = gridToWorld(col, row);
  const mesh = buildVoxelZombie(def);
  const flyY = def.flying ? 1.15 : 0.0;
  mesh.position.set(pos.x, -0.9, pos.z);
  zombieGroup.add(mesh);

  const waveScale = 1 + (S.wave - 1) * 0.14;
  const scaledHp = Math.round(def.hp * waveScale);

  const z = {
    def,
    typeId: def.id,
    portalDir,
    gx: col,
    gz: row,
    x: pos.x,
    z: pos.z,
    flyY,
    emergeT: 0,
    hp: scaledHp,
    maxHp: scaledHp,
    vuln: 0,
    summonTimer: def.summonInterval || 0,
    smokeCastTimer: def.smokeCaster ? 5.5 : 0,
    mesh,
  };
  S.zombies.push(z);
  spawnBurstCube(pos.x, 0.2, pos.z, '#9775fa', 0.8);
  return z;
}

function triggerRedSmokeMeteor(centerGx, centerGz) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const x = clamp(centerGx + dx, 1, GRID_W - 2);
      const z = clamp(centerGz + dz, 1, GRID_H - 2);
      const t = S.tiles[x][z];
      if (t.isAltar || t.isCrypt) continue;
      // Check if protected by SunnyFox or Picky cleansing aura
      let protectedTile = false;
      for (const u of S.units) {
        if (!u.asleep && u.def?.purgeSmoke && Math.hypot(u.gx - x, u.gz - z) <= (u.def.lightRadius || u.def.healRadius || 3.2)) {
          protectedTile = true;
          break;
        }
      }
      if (!protectedTile) {
        t.smokeTimer = 14.0;
        t.smokeMesh.visible = true;
      }
    }
  }
}

function addMoonShards(n) {
  if (S.moonShards >= S.moonTarget) return;
  S.moonShards = clamp(S.moonShards + n, 0, S.moonTarget);
  if (S.moonShards >= S.moonTarget && S.screen === 'play') {
    triggerMoonRestoredFinale();
  }
}

function triggerMoonRestoredFinale() {
  S.moonVisible = true;
  S.catnapState = 'cute';
  if (moonMesh) {
    moonMesh.visible = true;
    moonMesh.position.set(1.5, 7.2, -7.5);
  }
  const { cute, night } = catnapRig.userData;
  cute.visible = true;
  cute.scale.setScalar(1.15);
  night.visible = false;

  scene.background.set('#1f1942');
  hemiLight.intensity = 1.05;
  dirLight.intensity = 1.65;

  for (const z of S.zombies) {
    spawnBurstCube(z.x, 0.7, z.z, '#ffd43b', 1.5);
    zombieGroup.remove(z.mesh);
  }
  S.zombies = [];
  updatetileLightVisuals();
  sfx('win');
  $('endTitle').textContent = '🌕 The Moon Is Restored!';
  $('endSub').textContent =
    'You forged 100 Moon Shards across the 22×14 Citadel! The Full Moon shines bright again and Nightmare CatNap transformed back into Cute CatNap!';
  $('victoryModal').classList.remove('hidden');
  updateHUD();
}

function spawnProjectile(fromUnit, targetZombie, atkDef, level, powerMult) {
  const isMounted = fromUnit.mounted && fromUnit.mounted.def === atkDef;
  const startY = (fromUnit.topY || 0) + (isMounted ? 1.55 : 0.75);
  const m = box(0.24, 0.24, 0.24, atkDef.color, fromUnit.x, startY, fromUnit.z, {
    emissive: atkDef.color,
    emissiveIntensity: 0.85,
  });
  projGroup.add(m);

  const lvMult = 1 + (level - 1) * 0.42;
  const towerMult = isMounted ? fromUnit.def.towerDmgBonus || 1.3 : 1.0;
  let dmg = Math.round(atkDef.atk * lvMult * towerMult * powerMult);
  if (atkDef.id === 'lunabat' && (targetZombie.def.flying || targetZombie.def.id === 'creeper')) {
    dmg = Math.round(dmg * 1.6);
  }

  S.projectiles.push({
    x: fromUnit.x,
    y: startY,
    z: fromUnit.z,
    target: targetZombie,
    def: atkDef,
    dmg,
    mesh: m,
  });
}

function applyDamageToZombie(z, rawDmg, atkDef) {
  let armor = z.def.armor || 0;
  if (atkDef?.armorMelt) armor *= 0.3; // DogDay Solar Mortar melts 70% of armor!
  const vulnMult = 1 + (z.vuln || 0);
  const dmg = Math.max(2, Math.round(rawDmg * (1 - armor) * vulnMult));
  z.hp -= dmg;
  if (atkDef?.vulnBonus) z.vuln = Math.max(z.vuln, atkDef.vulnBonus);
  if (atkDef?.knockback && !z.def.smokeCaster) {
    // Push zombie away from central Altar
    const awayX = z.x - gridToWorld(ALTAR_GX, ALTAR_GZ).x;
    const awayZ = z.z - gridToWorld(ALTAR_GX, ALTAR_GZ).z;
    const len = Math.hypot(awayX, awayZ) || 1;
    z.x += (awayX / len) * atkDef.knockback * TILE_SIZE * 0.35;
    z.z += (awayZ / len) * atkDef.knockback * TILE_SIZE * 0.35;
  }

  const ratio = clamp(z.hp / z.maxHp, 0, 1);
  z.mesh.userData.hpFill.scale.x = Math.max(0.01, ratio);

  if (z.hp <= 0 && !z.dead) {
    z.dead = true;
    const bal = computeBalanceState(S);
    S.starlight += z.def.rewardStar || 6;
    S.ore += z.def.rewardOre || 3;
    const shardGain = (z.def.rewardShard || 0) + (z.def.rewardShard > 0 ? bal.shardDropBonus : 0);
    if (shardGain > 0) addMoonShards(shardGain);
    spawnPickupOrb(z.x, z.z, shardGain > 0 ? '#b197fc' : '#ffd43b');
    spawnBurstCube(z.x, 0.6, z.z, atkDef?.color || '#51cf66', 1.1);
    zombieGroup.remove(z.mesh);
  }
}

function spawnPickupOrb(x, z, color = '#ffd43b') {
  const m = box(0.28, 0.28, 0.28, color, x, 0.55, z, {
    emissive: color,
    emissiveIntensity: 0.9,
  });
  fxGroup.add(m);
  S.orbs.push({ x, z, mesh: m, age: 0 });
}

function spawnBurstCube(x, y, z, color, speed = 1.0) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + Math.random() * 0.5;
    const m = box(0.14, 0.14, 0.14, color, x, y, z, {
      emissive: color,
      emissiveIntensity: 0.7,
    });
    fxGroup.add(m);
    S.particles.push({
      mesh: m,
      vx: Math.cos(a) * speed,
      vy: 1.4 + Math.random() * speed,
      vz: Math.sin(a) * speed,
      life: 0.55,
    });
  }
}

/* ============================================================ Simulation Loop */
function stepGameplay(rawDt) {
  const speedMap = { gentle: 0.6, normal: 1.0, fast: 1.45 };
  const dt = rawDt * (speedMap[S.speedMode] || 1.0);
  S.time += dt;

  if (altarMesh?.userData.crystal) {
    altarMesh.userData.crystal.rotation.y += dt * 1.3;
  }
  if (moonMesh && moonMesh.visible) {
    moonMesh.rotation.y += dt * 0.25;
  }
  skyClouds.forEach((c, i) => {
    c.position.x += dt * 0.16 * (i % 2 ? 1 : 0.7);
    if (c.position.x > 15) c.position.x = -15;
  });

  const bal = computeBalanceState(S);
  const powerMult = bal.harmony.powerMult;
  const moonUp = S.moonShards >= S.moonTarget;

  // Step Red-Smoke Tile Corruption & Sleep Curse
  for (let gx = 0; gx < GRID_W; gx++) {
    for (let gz = 0; gz < GRID_H; gz++) {
      const t = S.tiles[gx][gz];
      if (t.smokeTimer > 0) {
        t.smokeTimer -= dt;
        // SunnyFox or Picky aura purges smoke faster
        for (const u of S.units) {
          if (!u.asleep && u.def?.purgeSmoke && Math.hypot(u.gx - gx, u.gz - gz) <= (u.def.lightRadius || 3.2)) {
            t.smokeTimer = 0;
            break;
          }
        }
        if (t.smokeTimer <= 0) {
          t.smokeTimer = 0;
          t.smokeMesh.visible = false;
        }
      }
      if (t.unit && !t.unit.isStructure) {
        const corrupted = t.smokeTimer > 0;
        t.unit.asleep = corrupted;
        if (t.unit.mesh.userData.sleepBadge) {
          t.unit.mesh.userData.sleepBadge.visible = corrupted;
          if (corrupted) t.unit.mesh.userData.sleepBadge.rotation.y += dt * 3;
        }
      }
    }
  }

  // Nightmare CatNap periodic Red-Smoke Spore Storm (in Tactical / Nightmare)
  if (!S.sandbox && !moonUp && S.difficulty !== 'cozy') {
    S.smokeStormTimer -= dt;
    if (S.smokeStormTimer <= 0 && S.units.length > 0) {
      S.smokeStormTimer = S.difficulty === 'nightmare' ? 11.5 : 15.5;
      const targetUnit = S.units[Math.floor(Math.random() * S.units.length)];
      triggerRedSmokeMeteor(targetUnit.gx, targetUnit.gz);
      say('💤 Nightmare CatNap cast Red-Smoke Fog! Build SunnyFox Lanterns or tap ✨ Purify to wake sleeping Critters!', 2.8);
    }
  }

  // Passive economy & wave progression
  S.passiveTimer += dt;
  if (S.passiveTimer >= 3.0) {
    S.passiveTimer = 0;
    S.starlight += 3;
    S.ore += 1;
    if (bal.carePackageGift > 0 && S.carePackageCooldown <= 0) {
      S.starlight += bal.carePackageGift;
      S.carePackageCooldown = 16;
      say(`🎁 Cozy Care Package: +${bal.carePackageGift} 🌟 Starlight!`, 2.2);
    }
    updateHUD();
  }
  if (S.carePackageCooldown > 0) S.carePackageCooldown -= dt;

  // Wave Escalation Timer
  if (!S.sandbox && !moonUp) {
    S.waveTimer -= dt;
    if (S.waveTimer <= 0) {
      S.wave++;
      S.waveTimer = 24;
      const dirs = bal.activePortals;
      say(`⚠️ Wave ${S.wave} Siege! Portals Active: [${dirs.join(', ')}]`, 3.2);
      // Spawn a wave burst across active portals
      dirs.forEach((d) => {
        spawnZombieFromPortal('walker', d);
        if (S.wave >= 2) spawnZombieFromPortal('runner', d);
        if (S.wave >= 2 && d === 'E') spawnZombieFromPortal('creeper', d);
        if (S.wave >= 3 && (d === 'N' || d === 'W')) spawnZombieFromPortal('balloon', d);
        if (S.wave >= 4 && d === 'S') spawnZombieFromPortal('necromancer', d);
      });
      if (S.wave % 2 === 0) {
        spawnZombieFromPortal('nightmare_boss', dirs[0]);
      }
      updateHUD();
    }
  }

  // Step All Placed Critter Units & Structures
  for (const u of S.units) {
    if (u.mesh.userData.spinner) {
      u.mesh.userData.spinner.rotation.y += dt * 2.5;
      u.mesh.userData.spinner.rotation.z += dt * 2.2;
    }
    if (u.isStructure || u.asleep) continue;

    if (u.mesh.userData.critterGroup) {
      u.mesh.userData.critterGroup.position.y =
        (u.def.id === 'mikey' ? 0.92 : u.def.id === 'bobby' ? 0.66 : 0.22) +
        Math.sin(S.time * 3 + u.gx) * 0.03;
    }

    // Haste from nearby PoppyDash + Redstone Conduit Overclock
    let haste = u.powered ? 1.3 : 1.0;
    for (const other of S.units) {
      if (!other.asleep && other.def?.hasteRadius && Math.hypot(other.gx - u.gx, other.gz - u.gz) <= other.def.hasteRadius) {
        haste = Math.max(haste, (other.def.hasteMult || 1.35) * (u.powered ? 1.15 : 1.0));
      }
    }

    // 1. PRODUCE role (Starlight + Redstone Ore + Outer Geode Harvesting)
    if (u.def.role === 'produce') {
      u.prodTimer -= dt * haste;
      if (u.prodTimer <= 0) {
        u.prodTimer = u.def.prodInterval || 4.0;
        const lvMult = 1 + (u.level - 1) * 0.42;

        // Check resource vein proximity bonus (on or 1-tile adjacent)
        let onStarVein = false;
        let onRedstoneVein = false;
        let nearGeode = false;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            const nt = S.tiles[u.gx + dx]?.[u.gz + dz];
            if (!nt || !nt.hasOre) continue;
            if (nt.oreKind === 'star') onStarVein = true;
            if (nt.oreKind === 'redstone') onRedstoneVein = true;
            if (nt.oreKind === 'geode') nearGeode = true;
          }
        }

        const starMult = onStarVein && u.def.id === 'sunnyfox' ? 1.6 : 1.0;
        const oreMult = onRedstoneVein ? 2.0 : 1.0;

        const starGain = Math.round((u.def.prodAmount || 6) * lvMult * powerMult * starMult);
        const oreGain = Math.round((u.def.prodOre || 2) * lvMult * oreMult);
        S.starlight += starGain;
        S.ore += oreGain;
        if (nearGeode) {
          addMoonShards(bal.harmony.level >= 2 ? 3 : 2);
        }
        spawnPickupOrb(u.x, u.z, u.def.accent);
        updateHUD();
      }
      if (u.def.healPerSec) {
        for (const ally of S.units) {
          if (ally.hp < ally.maxHp && Math.hypot(ally.gx - u.gx, ally.gz - u.gz) <= u.def.healRadius) {
            ally.hp = Math.min(ally.maxHp, ally.hp + u.def.healPerSec * dt);
          }
        }
      }
    }

    // CraftyCorn Outer Moon Geode Harvester passive
    if (u.def.geodeHarvester) {
      u.geodeTimer = (u.geodeTimer || 5.5) - dt * haste;
      if (u.geodeTimer <= 0) {
        u.geodeTimer = 5.5;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            const nt = S.tiles[u.gx + dx]?.[u.gz + dz];
            if (nt?.hasOre && nt.oreKind === 'geode') {
              addMoonShards(2);
              spawnPickupOrb(u.x, u.z, '#b197fc');
              updateHUD();
              break;
            }
          }
        }
      }
    }

    // 2. ATTACK role (including High-Ground Cliff +30% range & Watchtower +45% range)
    const shooters = [];
    if (u.def.role === 'attack') shooters.push({ state: u, def: u.def, isMounted: false });
    if (u.mounted) shooters.push({ state: u.mounted, def: u.mounted.def, isMounted: true });

    for (const sh of shooters) {
      const lit = sh.def.nightVision || isTileIlluminated(u.gx, u.gz, S.units, moonUp);
      const fireSpeedMult = lit ? 1.0 : 0.72; // Unlit towers fire 28% slower!
      sh.state.cooldown -= dt * haste * fireSpeedMult;
      if (sh.state.cooldown <= 0 && S.zombies.length > 0) {
        const lightRangeMult = lit ? 1.0 : 0.65;
        const towerRangeMult = sh.isMounted ? u.def.towerRangeBonus || 1.45 : 1.0;
        const cliffMult = u.elevation > 0 ? 1.3 : 1.0;
        const maxRange = (sh.def.range || 4.5) * lightRangeMult * towerRangeMult * cliffMult * TILE_SIZE;
        const canHitAir = sh.def.antiAir || sh.isMounted;

        let bestZ = null;
        let bestDist = Infinity;
        for (const z of S.zombies) {
          if (z.dead) continue;
          if (z.def.flying && !canHitAir) continue; // Ground cannons cannot hit flying balloons unless mounted!
          const d = Math.hypot(z.x - u.x, z.z - u.z);
          if (d <= maxRange && d < bestDist) {
            bestDist = d;
            bestZ = z;
          }
        }
        if (bestZ) {
          sh.state.cooldown = sh.def.fireInterval || 1.0;
          spawnProjectile(u, bestZ, sh.def, sh.state.level, powerMult);
        }
      }
    }
  }

  // Step Projectiles
  for (let i = S.projectiles.length - 1; i >= 0; i--) {
    const p = S.projectiles[i];
    if (!p.target || p.target.dead) {
      projGroup.remove(p.mesh);
      S.projectiles.splice(i, 1);
      continue;
    }
    const targetY = p.target.flyY + 0.55;
    const dx = p.target.x - p.x;
    const dy = targetY - p.y;
    const dz = p.target.z - p.z;
    const dist = Math.hypot(dx, dz);
    const step = 9.2 * dt;
    if (dist <= step + 0.25) {
      if (p.def.splashRadius) {
        const rad = p.def.splashRadius * TILE_SIZE;
        for (const z of S.zombies) {
          if (!z.dead && !z.def.flying && Math.hypot(z.x - p.target.x, z.z - p.target.z) <= rad) {
            applyDamageToZombie(z, p.dmg, p.def);
          }
        }
      } else if (p.def.chainTargets) {
        const sorted = S.zombies
          .filter((z) => !z.dead && Math.hypot(z.x - p.target.x, z.z - p.target.z) <= 2.6 * TILE_SIZE)
          .slice(0, p.def.chainTargets);
        sorted.forEach((z) => applyDamageToZombie(z, p.dmg, p.def));
      } else {
        applyDamageToZombie(p.target, p.dmg, p.def);
      }
      projGroup.remove(p.mesh);
      S.projectiles.splice(i, 1);
    } else {
      p.x += (dx / dist) * step;
      p.y += (dy / Math.max(0.2, dist)) * step;
      p.z += (dz / dist) * step;
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.y += dt * 8;
    }
  }

  // Step Zombies (Flow-Field Mazing, Flying Balloons, TNT Creepers, Necromancers, Boss Smoke)
  const altarWorld = gridToWorld(ALTAR_GX, ALTAR_GZ);
  for (let i = S.zombies.length - 1; i >= 0; i--) {
    const z = S.zombies[i];
    if (z.dead) {
      S.zombies.splice(i, 1);
      continue;
    }
    if (z.emergeT < 1) {
      z.emergeT = Math.min(1, z.emergeT + dt * 1.4);
      z.mesh.position.y = -0.9 * (1 - z.emergeT) + z.flyY * z.emergeT;
      continue;
    }

    // Necromancer periodic summons
    if (z.def.summonInterval) {
      z.summonTimer -= dt;
      if (z.summonTimer <= 0) {
        z.summonTimer = z.def.summonInterval;
        const gPos = worldToGrid(z.x, z.z);
        spawnZombie('runner', gPos.gz, gPos.gx, z.portalDir);
      }
    }

    // Boss Smoke Caster
    if (z.def.smokeCaster) {
      z.smokeCastTimer -= dt;
      if (z.smokeCastTimer <= 0) {
        z.smokeCastTimer = 6.5;
        const gPos = worldToGrid(z.x, z.z);
        triggerRedSmokeMeteor(gPos.gx, gPos.gz);
      }
    }

    // Check Red-Smoke buff on zombie's current tile
    const curG = worldToGrid(z.x, z.z);
    const curTile = S.tiles[curG.gx]?.[curG.gz];
    if (curTile?.smokeTimer > 0) {
      z.hp = Math.min(z.maxHp, z.hp + 12 * dt);
    }

    // Slow Moat & Shield Aura check
    let speedMult = curTile?.smokeTimer > 0 ? 1.22 : 1.0;
    if (curTile?.isWater && !curTile.hasBridge && !z.def.flying) {
      speedMult *= 0.62; // wading through deep river
    }
    let dmgReduction = 1.0;
    for (const u of S.units) {
      if (u.asleep) continue;
      const distTiles = Math.hypot((z.x - u.x) / TILE_SIZE, (z.z - u.z) / TILE_SIZE);
      if (u.def?.slowRadius && distTiles <= u.def.slowRadius) {
        speedMult = Math.min(speedMult, u.def.slowFactor || 0.45);
        dmgReduction = 1 - (u.def.shieldAura || 0.3);
      }
    }

    // Check collision with a non-flying blocker unit/wall along path
    let blocker = null;
    if (!z.def.flying) {
      for (const u of S.units) {
        if (Math.hypot(u.x - z.x, u.z - z.z) < TILE_SIZE * 0.68) {
          blocker = u;
          break;
        }
      }
    }

    if (blocker) {
      // TNT Creeper Sapper explodes immediately on contact with any wall/unit!
      if (z.def.explosiveDmg) {
        sfx('boom');
        const rad = (z.def.explosiveRadius || 1.85) * TILE_SIZE;
        for (let j = S.units.length - 1; j >= 0; j--) {
          const u = S.units[j];
          if (Math.hypot(u.x - z.x, u.z - z.z) <= rad) {
            const resist = u.def?.blastResist || 0;
            u.hp -= z.def.explosiveDmg * (1 - resist);
            if (u.hp <= 0) destroyUnit(u);
          }
        }
        spawnBurstCube(z.x, 0.8, z.z, '#ff6b6b', 2.0);
        z.dead = true;
        zombieGroup.remove(z.mesh);
        S.zombies.splice(i, 1);
        recomputeFlowField();
        updateHUD();
        continue;
      }

      const wallMult = z.def.wallBreaker && (blocker.isStructure || blocker.def?.role === 'defend') ? 2.4 : 1.0;
      blocker.hp -= z.def.dps * wallMult * dmgReduction * dt;
      if (blocker.def?.thornsDmg) {
        applyDamageToZombie(z, blocker.def.thornsDmg * dt, blocker.def);
      }
      z.mesh.userData.armL.rotation.z = Math.sin(S.time * 10) * 0.35;
      z.mesh.userData.armR.rotation.z = -Math.sin(S.time * 10) * 0.35;

      if (blocker.hp <= 0) {
        destroyUnit(blocker);
      }
    } else {
      // Move toward Central Citadel Altar using Flow-Field (or direct flight if Flying Balloon)
      let dirX = altarWorld.x - z.x;
      let dirZ = altarWorld.z - z.z;
      const distToAltar = Math.hypot(dirX, dirZ) || 1;
      if (!z.def.flying && S.flowField[curG.gx]?.[curG.gz]) {
        const ff = S.flowField[curG.gx][curG.gz];
        dirX = ff.dx * 0.75 + (dirX / distToAltar) * 0.25;
        dirZ = ff.dz * 0.75 + (dirZ / distToAltar) * 0.25;
      }
      const norm = Math.hypot(dirX, dirZ) || 1;
      const move = z.def.speed * speedMult * TILE_SIZE * dt;
      z.x += (dirX / norm) * move;
      z.z += (dirZ / norm) * move;
      z.mesh.position.set(z.x, z.flyY, z.z);
      z.mesh.rotation.y = Math.atan2(-dirZ, -dirX);
      z.mesh.userData.legL.rotation.z = Math.sin(S.time * 6 + i) * 0.35;
      z.mesh.userData.legR.rotation.z = -Math.sin(S.time * 6 + i) * 0.35;

      if (distToAltar <= TILE_SIZE * 1.15) {
        const altarHit = z.def.id === 'nightmare_boss' ? 55 : z.def.explosiveDmg ? 45 : 22;
        S.baseHp = Math.max(S.difficulty === 'cozy' ? 40 : 0, S.baseHp - altarHit);
        spawnBurstCube(z.x, 0.8, z.z, '#fa5252', 1.3);
        zombieGroup.remove(z.mesh);
        S.zombies.splice(i, 1);
        if (S.baseHp <= 0 && S.difficulty !== 'cozy') {
          // Altar breached on Tactical/Nightmare: penalty of -15 Moon Shards & emergency rebuild!
          S.baseHp = 350;
          S.moonShards = Math.max(0, S.moonShards - 15);
          say('💥 Citadel Altar Breached! Lost 15 🌙 Moon Shards — fortify the gates!', 3.6);
        }
        updateHUD();
      }
    }
  }

  // Continuous Multi-Portal Trickle Spawns
  if (!S.sandbox && !moonUp) {
    S.spawnTimer -= dt;
    if (S.spawnTimer <= 0) {
      const baseWait = S.zombies.length > 12 ? 5.2 : 3.4;
      S.spawnTimer = baseWait * bal.spawnIntervalMult;
      const dirs = bal.activePortals;
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const pool =
        S.wave >= 4 || S.moonShards >= 55
          ? ['walker', 'runner', 'bucket', 'digger', 'creeper', 'balloon', 'necromancer']
          : S.wave >= 2 || S.moonShards >= 20
          ? ['walker', 'runner', 'bucket', 'digger', 'creeper', 'balloon']
          : ['walker', 'runner', 'bucket', 'digger'];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      spawnZombieFromPortal(pick, dir);
      updateHUD();
    }
  }

  // Step Orbs & Particles
  for (let i = S.orbs.length - 1; i >= 0; i--) {
    const o = S.orbs[i];
    o.age += rawDt;
    o.mesh.position.y = 0.45 + Math.sin(S.time * 4 + i) * 0.12;
    o.mesh.rotation.y += rawDt * 2.5;
    if (o.age >= 2.0) {
      fxGroup.remove(o.mesh);
      S.orbs.splice(i, 1);
    }
  }
  for (let i = S.particles.length - 1; i >= 0; i--) {
    const p = S.particles[i];
    p.life -= rawDt;
    p.mesh.position.x += p.vx * rawDt;
    p.mesh.position.y += p.vy * rawDt;
    p.mesh.position.z += p.vz * rawDt;
    p.vy -= 4.5 * rawDt;
    if (p.life <= 0) {
      fxGroup.remove(p.mesh);
      S.particles.splice(i, 1);
    }
  }
}

function destroyUnit(u) {
  if (u.def?.deathBlastDmg) {
    sfx('boom');
    for (const zz of S.zombies) {
      if (!zz.dead && Math.hypot(zz.x - u.x, zz.z - u.z) <= 2.3 * TILE_SIZE) {
        applyDamageToZombie(zz, u.def.deathBlastDmg, u.def);
      }
    }
  }
  unitGroup.remove(u.mesh);
  if (S.tiles[u.gx]?.[u.gz]) S.tiles[u.gx][u.gz].unit = null;
  S.units = S.units.filter((item) => item !== u);
  updatePowerNetwork();
  recomputeFlowField();
  updatetileLightVisuals();
}

/* ============================================================ Camera & Pointer Interaction */
function framePlayCamera() {
  const baseDist = S.camPreset === 'wide' ? 21.5 : 14.2;
  const dist = baseDist / S.camZoom;
  const x = Math.sin(S.camYaw) * dist * Math.cos(S.camPitch);
  const y = Math.sin(S.camPitch) * dist + 1.4;
  const z = Math.cos(S.camYaw) * dist * Math.cos(S.camPitch) + 1.1;
  camera.position.set(x, y, z);
  camera.lookAt(0, 0.1, -0.2);
}

function layout() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  if (S.screen === 'play') framePlayCamera();
}
window.addEventListener('resize', layout);

canvas.addEventListener(
  'wheel',
  (ev) => {
    if (S.screen !== 'play') return;
    ev.preventDefault();
    S.camZoom = clamp(S.camZoom - ev.deltaY * 0.001, 0.72, 1.65);
    framePlayCamera();
  },
  { passive: false }
);

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let dragState = null;

function pickTile(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const tileMeshes = [];
  for (let gx = 0; gx < GRID_W; gx++) {
    for (let gz = 0; gz < GRID_H; gz++) tileMeshes.push(S.tiles[gx][gz].mesh);
  }
  const hit = raycaster.intersectObjects(tileMeshes, false)[0];
  return hit ? hit.object.userData.tile : null;
}

canvas.addEventListener('pointerdown', (ev) => {
  if (S.screen === 'intro') return;
  initAudio();
  dragState = { x: ev.clientX, y: ev.clientY, lx: ev.clientX, ly: ev.clientY, moved: false };
});

canvas.addEventListener('pointermove', (ev) => {
  if (!dragState || S.screen !== 'play') return;
  if (Math.hypot(ev.clientX - dragState.x, ev.clientY - dragState.y) > 9) dragState.moved = true;
  if (dragState.moved) {
    const dx = ev.clientX - dragState.lx;
    const dy = ev.clientY - dragState.ly;
    S.camYaw = clamp(S.camYaw - dx * 0.005, -0.75, 0.75);
    S.camPitch = clamp(S.camPitch + dy * 0.004, 0.45, 1.15);
    framePlayCamera();
  }
  dragState.lx = ev.clientX;
  dragState.ly = ev.clientY;
});

canvas.addEventListener('pointerup', (ev) => {
  if (!dragState) return;
  const wasTap = !dragState.moved;
  dragState = null;
  if (!wasTap || S.screen !== 'play' || S.paused) return;
  const tile = pickTile(ev);
  if (!tile) return;
  handleTileAction(tile.gx, tile.gz);
});

function handleTileAction(gx, gz) {
  if (S.selectedTool === 'tool_dig') {
    return digOrMineAt(gx, gz);
  }
  if (S.selectedTool === 'tool_upgrade') {
    return upgradeUnitAt(gx, gz);
  }
  if (S.selectedTool === 'tool_wall') {
    return placeStructureAt(gx, gz, 'wall');
  }
  if (S.selectedTool === 'tool_conduit') {
    return placeStructureAt(gx, gz, 'conduit');
  }
  if (S.selectedTool === 'tool_purify') {
    return purifyAt(gx, gz);
  }
  return placeCritterUnit(gx, gz, S.selectedTool);
}

/* ============================================================ UI & HUD */
let sayTimeout = 0;
function say(text, secs = 2.8) {
  const b = $('bubble');
  b.textContent = text;
  b.classList.remove('hidden');
  clearTimeout(sayTimeout);
  sayTimeout = setTimeout(() => b.classList.add('hidden'), secs * 1000);
}

function buildDockUI() {
  const tabsEl = $('roleTabs');
  const roles = [
    ['all', '🌈 All'],
    ['produce', '⛏️ Produce (3)'],
    ['defend', '🛡️ Defend (3)'],
    ['attack', '⚔️ Attack (4)'],
    ['eng', '⚙️ Craft & Tools (5)'],
  ];
  tabsEl.innerHTML = '';
  for (const [id, label] of roles) {
    const b = document.createElement('button');
    b.className = 'rtab' + (S.roleFilter === id ? ' sel' : '');
    b.textContent = label;
    b.onclick = () => {
      initAudio();
      S.roleFilter = id;
      buildDockUI();
    };
    tabsEl.appendChild(b);
  }

  const bar = $('hotbar');
  bar.innerHTML = '';
  const roleBadge = { produce: '⛏️', defend: '🛡️', attack: '⚔️' };

  if (S.roleFilter !== 'eng') {
    const visibleUnits = UNITS.filter((u) => S.roleFilter === 'all' || u.role === S.roleFilter);
    for (const u of visibleUnits) {
      const card = document.createElement('button');
      card.className = `ucard role-${u.role}` + (S.selectedTool === u.id ? ' sel' : '');
      card.dataset.id = u.id;
      const cnt = countUnitType(u.id);
      const sCost = computeDynamicCost(u.id, cnt);
      const oCost = computeDynamicOreCost(u.id, cnt);
      card.innerHTML = `
        <span class="rbadge">${roleBadge[u.role]}</span>
        <img src="${u.icon}" alt="${u.name}">
        <b>${u.name}</b>
        <em class="cost">🌟${sCost} ⚙️${oCost}</em>
      `;
      card.onclick = () => {
        initAudio();
        S.selectedTool = u.id;
        updateInspector();
        buildDockUI();
      };
      bar.appendChild(card);
    }
  }

  if (S.roleFilter === 'all' || S.roleFilter === 'eng') {
    const tools = [
      { id: 'tool_wall', name: 'Wall/Bridge', icon: '🧱', sub: '⚙️ 12' },
      { id: 'tool_conduit', name: 'Conduit', icon: '⚡', sub: '⚙️ 14 (+30%)' },
      { id: 'tool_purify', name: 'Purify/Wake', icon: '✨', sub: '🌟 15' },
      { id: 'tool_upgrade', name: 'Upgrade', icon: '⬆️', sub: 'Lv.2..4' },
      { id: 'tool_dig', name: 'Mine/Move', icon: '⛏️', sub: '+Ore / 80%' },
    ];
    for (const t of tools) {
      const card = document.createElement('button');
      card.className = 'ucard toolCard' + (S.selectedTool === t.id ? ' sel' : '');
      card.dataset.id = t.id;
      card.innerHTML = `
        <div class="ticon">${t.icon}</div>
        <b>${t.name}</b>
        <em class="cost">${t.sub}</em>
      `;
      card.onclick = () => {
        initAudio();
        S.selectedTool = t.id;
        updateInspector();
        buildDockUI();
      };
      bar.appendChild(card);
    }
  }
  updateInspector();
}

function updateInspector() {
  const el = $('unitInfo');
  const toolDescriptions = {
    tool_wall:
      '🧱 Cobble Wall / Bridge (⚙️ 12): On land, builds a 540 HP Maze Wall to funnel zombies! On river water, builds a walkable Bridge!',
    tool_conduit:
      '⚡ Redstone Conduit Pylon (⚙️ 14): Overclocks all Critters within 2.3 tiles for +30% Fire Rate & Production!',
    tool_purify:
      '✨ Purify & Wake (🌟 15): Cleanses Nightmare CatNap Red-Smoke Fog in 2.6 tiles, wakes sleeping Critters (💤), and heals +45 HP!',
    tool_upgrade:
      '⬆️ Upgrade (🌟 + ⚙️): Tap any placed Critter to upgrade up to Awakened Level 4 (+48% power & HP per level)!',
    tool_dig:
      '⛏️ Mine / Move: Tap outer Resource Rocks for instant 🌟/⚙️/🌙, or tap a placed unit to refund 80% resources!',
  };
  if (toolDescriptions[S.selectedTool]) {
    el.textContent = toolDescriptions[S.selectedTool];
    return;
  }
  const def = UNIT_MAP[S.selectedTool];
  if (def) {
    const cnt = countUnitType(def.id);
    const sCost = computeDynamicCost(def.id, cnt);
    const oCost = computeDynamicOreCost(def.id, cnt);
    el.textContent = `${def.name} · ${def.title} (🌟 ${sCost} + ⚙️ ${oCost}): ${def.blurb}`;
  }
}

function updateHUD() {
  $('starVal').textContent = S.starlight;
  $('oreVal').textContent = S.ore;
  $('hpVal').textContent = Math.ceil(S.baseHp);
  $('shardText').textContent = `${S.moonShards} / ${S.moonTarget}`;
  $('shardFill').style.width = `${clamp((S.moonShards / S.moonTarget) * 100, 0, 100)}%`;

  const bal = computeBalanceState(S);
  $('portalBadge').textContent = `⛩️ W${S.wave} · ${bal.activePortals.join('')}`;
  $('harmonyBadge').textContent = `✨ Lv.${bal.harmony.level} (+${Math.round((bal.harmony.powerMult - 1) * 100)}%)`;
  $('harmonyBadge').title = bal.harmony.label;
  $('balanceBadge').textContent = `⚖️ P=${bal.pressureIndex} · ${bal.directorMode}`;

  document.querySelectorAll('#hotbar .ucard').forEach((c) => {
    const id = c.dataset.id;
    if (UNIT_MAP[id]) {
      const cnt = countUnitType(id);
      const costEl = c.querySelector('.cost');
      if (costEl) costEl.textContent = `🌟${computeDynamicCost(id, cnt)} ⚙️${computeDynamicOreCost(id, cnt)}`;
    }
  });
}

function bindTopBar() {
  $('startIntroBtn').onclick = () => resetGame(true);
  $('quickPlayBtn').onclick = () => resetGame(false);
  $('replayIntroBtn').onclick = () => startIntroCutscene();
  $('skipIntroBtn').onclick = () => finishIntroAndStartGame();

  $('pauseBtn').onclick = () => {
    if (S.screen !== 'play' && S.screen !== 'intro') return;
    S.paused = !S.paused;
    $('pauseBtn').textContent = S.paused ? '▶' : '⏸';
    playMusic(activeTrack);
  };
  $('stopBtn').onclick = () => {
    S.screen = 'title';
    S.paused = false;
    document.body.classList.add('titleScreen');
    document.body.classList.remove('inIntro');
    $('titleModal').classList.remove('hidden');
    $('cineBanner').classList.add('hidden');
    playMusic(null);
  };
  $('diffBtn').onclick = () => {
    const order = ['tactical', 'nightmare', 'cozy'];
    const labels = { tactical: '🔥 Tactical', nightmare: '💀 Nightmare', cozy: '🌱 Cozy' };
    S.difficulty = order[(order.indexOf(S.difficulty) + 1) % order.length];
    $('diffBtn').textContent = labels[S.difficulty];
    updateHUD();
  };
  $('camBtn').onclick = () => {
    S.camPreset = S.camPreset === 'wide' ? 'citadel' : 'wide';
    $('camBtn').textContent = S.camPreset === 'wide' ? '🗺️ Wide' : '🏰 Close';
    framePlayCamera();
  };
  $('speedBtn').onclick = () => {
    const order = ['normal', 'fast', 'gentle'];
    const labels = { normal: '🚶 1.0x', fast: '⚡ 1.5x', gentle: '🐌 0.6x' };
    S.speedMode = order[(order.indexOf(S.speedMode) + 1) % order.length];
    $('speedBtn').textContent = labels[S.speedMode];
  };
  $('refineBtn').onclick = () => {
    initAudio();
    if (S.screen !== 'play') return;
    refineShards();
  };
  $('modeBtn').onclick = () => {
    S.sandbox = !S.sandbox;
    $('modeBtn').textContent = S.sandbox ? '🧱 Sandbox' : '🌙 Rescue';
    if (S.sandbox) {
      S.starlight = Math.max(S.starlight, 999);
      S.ore = Math.max(S.ore, 999);
    }
    updateHUD();
  };
  $('spawnWaveBtn').onclick = () => {
    initAudio();
    if (S.screen !== 'play') return;
    S.wave++;
    const bal = computeBalanceState(S);
    bal.activePortals.forEach((d) => {
      spawnZombieFromPortal('walker', d);
      spawnZombieFromPortal('creeper', d);
      spawnZombieFromPortal('balloon', d);
    });
    S.starlight += 20;
    S.ore += 10;
    say(`⚔️ Triggered Wave ${S.wave} across [${bal.activePortals.join(', ')}] (+20 🌟 & +10 ⚙️)!`, 2.4);
    updateHUD();
  };
  $('musicBtn').onclick = () => {
    S.musicOn = !S.musicOn;
    $('musicBtn').classList.toggle('off', !S.musicOn);
    playMusic(activeTrack);
  };
  $('soundBtn').onclick = () => {
    S.soundOn = !S.soundOn;
    $('soundBtn').classList.toggle('off', !S.soundOn);
  };
  $('keepPlayingBtn').onclick = () => {
    $('victoryModal').classList.add('hidden');
    S.sandbox = true;
    $('modeBtn').textContent = '🧱 Sandbox';
  };
  $('playAgainBtn').onclick = () => {
    $('victoryModal').classList.add('hidden');
    resetGame(true);
  };
}

/* ============================================================ Main Render Loop & Test Hooks */
let lastTS = performance.now();
function animate(ts) {
  requestAnimationFrame(animate);
  const dt = clamp((ts - lastTS) / 1000, 0.001, 0.08);
  lastTS = ts;

  if (!S.paused) {
    if (S.screen === 'intro') {
      stepIntroCutscene(dt);
    } else if (S.screen === 'play') {
      stepGameplay(dt);
    }
  }
  renderer.render(scene, camera);
}

function init() {
  buildWorld();
  buildDockUI();
  bindTopBar();
  layout();
  startIntroCutscene();
  S.ready = true;
  requestAnimationFrame(animate);
}

window.__MOONCRAFT__ = {
  getState: () => ({
    ready: S.ready,
    screen: S.screen,
    gridW: GRID_W,
    gridH: GRID_H,
    totalTiles: GRID_W * GRID_H,
    difficulty: S.difficulty,
    introTime: Number(S.introTime.toFixed(2)),
    introPhase: S.introPhase,
    moonVisible: S.moonVisible,
    catnapState: S.catnapState,
    starlight: S.starlight,
    ore: S.ore,
    moonShards: S.moonShards,
    baseHp: S.baseHp,
    wave: S.wave,
    unitCount: S.units.length,
    zombieCount: S.zombies.length,
    cineZombieCount: S.cineZombies.length,
    cineCritterCount: S.cineCritters.length,
    balance: computeBalanceState(S),
  }),
  advanceIntro: (secs) => {
    const steps = Math.max(1, Math.round(secs / 0.1));
    for (let i = 0; i < steps; i++) {
      if (S.screen === 'intro') stepIntroCutscene(0.1);
    }
    renderer.render(scene, camera);
    return window.__MOONCRAFT__.getState();
  },
  skipIntro: () => {
    finishIntroAndStartGame();
    renderer.render(scene, camera);
    return window.__MOONCRAFT__.getState();
  },
  placeUnit: (gx, gz, unitId, free = false) => placeCritterUnit(gx, gz, unitId, free),
  placeStructure: (gx, gz, kind = 'wall', free = false) => placeStructureAt(gx, gz, kind, free),
  upgradeUnit: (gx, gz, free = false) => upgradeUnitAt(gx, gz, free),
  purify: (gx, gz, free = false) => purifyAt(gx, gz, free),
  triggerSmoke: (gx, gz) => triggerRedSmokeMeteor(gx, gz),
  refineShards: () => refineShards(),
  digTile: (gx, gz) => digOrMineAt(gx, gz),
  spawnZombie: (typeId, gz, gx, dir) => spawnZombie(typeId, gz, gx, dir),
  spawnFromPortal: (typeId, dir) => spawnZombieFromPortal(typeId, dir),
  addShards: (n) => {
    addMoonShards(n);
    updateHUD();
    renderer.render(scene, camera);
    return window.__MOONCRAFT__.getState();
  },
  stepSim: (secs = 1.0) => {
    const steps = Math.max(1, Math.round(secs / 0.05));
    for (let i = 0; i < steps; i++) stepGameplay(0.05);
    renderer.render(scene, camera);
    return window.__MOONCRAFT__.getState();
  },
};

init();
