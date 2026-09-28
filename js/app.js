const THREE = window.THREE;
import {
  INITIAL_RESOURCES,
  UNITS,
  ZOMBIE_TYPES,
  STAGES,
  getStageConfig,
  computeDynamicResourceCosts,
  computeUpgradeCost,
  canAffordCost,
  deductCost,
  computeBalanceState
} from './balance.js';
import {
  vox,
  buildHighResMoon,
  buildHighResCutsceneRig,
  buildHighResCameoCritter,
  buildHighResCameoZombie,
  buildResourceNodeMesh,
  buildCritterUnitMesh,
  buildMoonSanctuaryMesh,
  buildVoxelZombie
} from './voxel_models.js';
import { initIntroMovieCanvas, renderIntroMovieFrame } from './cutscene_hd.js';
import { sound } from './audio.js';
import { UI_SVGS, miniResSVG } from './ui_icons.js';

// Pure visual role & effect badges for 10 Critters + Upgrade Star Tool + Terraform/Reclaim Tools
const ROLE_ICONS = {
  sunnyfox:   { roleIcon: '⛏️', fxIcon: '☀️' },
  poppydash:  { roleIcon: '⛏️', fxIcon: '🪵' },
  picky:      { roleIcon: '⛏️', fxIcon: '🪨' },
  bubba:      { roleIcon: '⛏️', fxIcon: '💎' },
  bobby:      { roleIcon: '🛡️', fxIcon: '🧱' },
  mikey:      { roleIcon: '🛡️', fxIcon: '🗼' },
  lunabat:    { roleIcon: '⚔️', fxIcon: '🏹' },
  dogday:     { roleIcon: '⚔️', fxIcon: '💥' },
  craftycorn: { roleIcon: '⚔️', fxIcon: '🌈' },
  kickin:     { roleIcon: '⚔️', fxIcon: '⚡' }
};

export const CRITTER_UNITS = [
  ...UNITS.map(u => ({
    ...u,
    portrait: u.icon,
    roleIcon: ROLE_ICONS[u.id]?.roleIcon || '✨',
    fxIcon: ROLE_ICONS[u.id]?.fxIcon || '✨'
  })),
  {
    id: 'upgrade_star',
    tier: 0,
    role: 'upgrade',
    toolSvg: UI_SVGS.tool_upgrade,
    emoji: '⭐',
    roleIcon: '⭐',
    fxIcon: '🔼',
    color: '#ffd43b',
    accent: '#fff3bf',
    cost: { sun: 20, wood: 10, stone: 10, crystal: 5 }
  },
  {
    id: 'bridge',
    tier: 0,
    role: 'terraform',
    toolSvg: UI_SVGS.tool_bridge,
    emoji: '🌊',
    roleIcon: '🧰',
    fxIcon: '🌊',
    color: '#bc6c25',
    accent: '#dda15e',
    cost: { sun: 0, wood: 15, stone: 0, crystal: 0 }
  },
  {
    id: 'spike_trap',
    tier: 0,
    role: 'terraform',
    toolSvg: UI_SVGS.tool_spike,
    emoji: '💥',
    roleIcon: '🧰',
    fxIcon: '💥',
    color: '#ced4da',
    accent: '#ff6b6b',
    cost: { sun: 0, wood: 10, stone: 15, crystal: 0 },
    hp: 260,
    dmg: 32
  },
  {
    id: 'shovel',
    tier: 0,
    role: 'tool',
    toolSvg: UI_SVGS.tool_shovel,
    emoji: '♻️',
    roleIcon: '♻️',
    fxIcon: '☀️',
    color: '#ffd166',
    accent: '#ffffff',
    cost: { sun: 0, wood: 0, stone: 0, crystal: 0 }
  }
];

// ============================================================================
// SUNLIT PINTEREST 3D TOY DIORAMA SCENE + ALPHA RENDERER
// ============================================================================
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 180);
camera.position.set(0, 15.0, 16.0);
camera.lookAt(0, 0, 0.5);

const hemiLight = new THREE.HemisphereLight(0xfff8e7, 0xd4a373, 1.26);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfff5d6, 1.46);
dirLight.position.set(11, 24, 14);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -18;
dirLight.shadow.camera.right = 18;
dirLight.shadow.camera.top = 15;
dirLight.shadow.camera.bottom = -15;
scene.add(dirLight);

// ============================================================================
// STARFIELD DOME + HIGH-RES SCULPTED MOON
// ============================================================================
const skyGroup = new THREE.Group();
scene.add(skyGroup);

const starGeo = new THREE.BufferGeometry();
const starCount = 320;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 90;
  starPos[i * 3 + 1] = 8 + Math.random() * 32;
  starPos[i * 3 + 2] = -14 - Math.random() * 35;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starPoints = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xfff9db, size: 0.35, transparent: true, opacity: 0.9 })
);
skyGroup.add(starPoints);

const moonGroup = buildHighResMoon(THREE);
moonGroup.position.set(2.6, 4.7, -0.2);
scene.add(moonGroup);

function setMoonRestoreProgress(ratio) {
  const r = Math.max(0, Math.min(1, ratio));
  if (r <= 0.02) {
    moonGroup.visible = false;
  } else {
    moonGroup.visible = true;
    moonGroup.scale.setScalar(0.25 + r * 0.75);
  }
  if (S.sanctuaryMesh) {
    S.sanctuaryMesh.userData.updateSanctuary(S.hp, S.maxHp, r);
  }
}

// ============================================================================
// HIGH-RES NON-BLOCKY 10S OPENING CUTSCENE DIORAMA
// ============================================================================
const cineGroup = buildHighResCutsceneRig(THREE);
const cineData = cineGroup.userData;
scene.add(cineGroup);

const cameoGroup = new THREE.Group();
cineGroup.add(cameoGroup);

const cameoCritterDefs = UNITS.slice(0, 5);
const cameoCritters = [];
for (let i = 0; i < cameoCritterDefs.length; i++) {
  const c = buildHighResCameoCritter(cameoCritterDefs[i], THREE);
  c.position.set(-3.8 - i * 0.95, -3.5, -1.2 + (i % 2) * 1.2);
  cameoGroup.add(c);
  cameoCritters.push({
    mesh: c,
    targetX: -2.4 - i * 0.88,
    targetZ: -0.8 + (i % 2) * 1.15,
    phase: i * 0.8
  });
}

const cameoZombieDefs = [
  ZOMBIE_TYPES.walker,
  ZOMBIE_TYPES.runner,
  ZOMBIE_TYPES.bucket,
  ZOMBIE_TYPES.balloon,
  ZOMBIE_TYPES.nightmare_boss
];
const cameoZombies = [];
for (let i = 0; i < cameoZombieDefs.length; i++) {
  const z = buildHighResCameoZombie(cameoZombieDefs[i], THREE);
  z.position.set(3.8 + i * 0.95, -3.5, -1.2 + (i % 2) * 1.2);
  cameoGroup.add(z);
  cameoZombies.push({
    mesh: z,
    targetX: 2.4 + i * 0.88,
    targetZ: -0.8 + (i % 2) * 1.15,
    phase: i * 0.9
  });
}

// ============================================================================
// MINECRAFT VOXEL BATTLEFIELD GROUPS
// ============================================================================
const worldGroup = new THREE.Group();
scene.add(worldGroup);

const tileGroup = new THREE.Group();
const unitGroup = new THREE.Group();
const zombieGroup = new THREE.Group();
const projGroup = new THREE.Group();
const fxGroup = new THREE.Group();
worldGroup.add(tileGroup, unitGroup, zombieGroup, projGroup, fxGroup);

const cursorMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1.04, 0.14, 1.04),
  new THREE.MeshBasicMaterial({ color: 0xffe066, wireframe: true })
);
cursorMesh.visible = false;
worldGroup.add(cursorMesh);

// Preload Critter portrait textures
const texLoader = new THREE.TextureLoader();
const portraitTexMap = new Map();
for (const u of CRITTER_UNITS) {
  if (u.portrait) {
    const t = texLoader.load(u.portrait);
    t.colorSpace = THREE.SRGBColorSpace;
    portraitTexMap.set(u.id, t);
  }
}

// ============================================================================
// GAME STATE & 5-STAGE MAP LOADER WITH 3D MOON SANCTUARY + STONE ROADS
// ============================================================================
const S = {
  phase: 'cutscene', // 'cutscene' | 'playing' | 'victory' | 'defeat'
  cineTime: 0,
  moonExploded: false,
  paused: false,
  sandbox: false,
  zoomOut: false,
  camMode: 0,
  camYaw: 0,
  stageIndex: 0,
  clearedStages: new Set(),
  cols: 14,
  rows: 8,
  stageCfg: null,
  sanctuaryGx: 1,
  sanctuaryGz: 3.5,
  sanctuaryWorld: { x: 0, z: 0 },
  sanctuaryMesh: null,
  sanctuaryShake: 0,
  sanctuaryFireTimer: 0,
  res: { ...INITIAL_RESOURCES },
  hp: 15,
  maxHp: 15,
  moonShards: 0,
  moonGoal: 28,
  wave: 1,
  waveTimer: 6.5,
  spawnQueue: [],
  spawnCooldown: 0,
  selectedTool: 'sunnyfox',
  units: [],
  zombies: [],
  projectiles: [],
  particles: [],
  orbs: [],
  roadMarkers: []
};

let tiles = [];
const tilePickMeshes = [];

export function gridToWorld(gx, gz) {
  return {
    x: (gx - (S.cols - 1) / 2) * 1.0,
    z: (gz - (S.rows - 1) / 2) * 1.0
  };
}

function clearGroup(grp) {
  while (grp.children.length > 0) {
    grp.remove(grp.children[0]);
  }
}

export function buildStageWorld(stageIdx) {
  S.stageIndex = Math.max(0, Math.min(STAGES.length - 1, stageIdx));
  const cfg = getStageConfig(S.stageIndex);
  S.stageCfg = cfg;
  S.cols = cfg.gridW;
  S.rows = cfg.gridH;
  S.moonGoal = cfg.moonTarget;
  S.sanctuaryGx = cfg.altarGx;
  S.sanctuaryGz = cfg.altarGz;
  S.sanctuaryWorld = gridToWorld(cfg.altarGx, cfg.altarGz);
  S.hp = S.maxHp;

  clearGroup(tileGroup);
  clearGroup(unitGroup);
  clearGroup(zombieGroup);
  clearGroup(projGroup);
  clearGroup(fxGroup);
  tilePickMeshes.length = 0;
  tiles = [];
  S.units = [];
  S.zombies = [];
  S.projectiles = [];
  S.particles = [];
  S.orbs = [];
  S.roadMarkers = [];
  S.spawnQueue = [];

  // --------------------------------------------------------------------------
  // CHUNKY 3D FLOATING TOY ISLAND DIORAMA PEDESTAL (Pinterest Reference Style!)
  // --------------------------------------------------------------------------
  const islandPedestal = new THREE.Group();
  const islW = S.cols + 0.56;
  const islD = S.rows + 0.56;
  // Upper warm terracotta-peach clay rim
  islandPedestal.add(vox(islW, 0.34, islD, 0xe8a56f, 0, -0.17, 0));
  // Middle lavender-slate cliff slab (matching Pinterest floating island cliff!)
  islandPedestal.add(vox(islW - 0.36, 0.68, islD - 0.36, 0x9b86d4, 0, -0.68, 0));
  // Lower tapered deep-violet cliff base
  islandPedestal.add(vox(islW - 1.15, 0.56, islD - 1.15, 0x7c66b8, 0, -1.30, 0));
  // Cute protruding cliff rock studs on the front face
  for (let rx = -Math.floor(S.cols / 3); rx <= Math.floor(S.cols / 3); rx += 2) {
    islandPedestal.add(vox(0.45, 0.28, 0.22, 0xb5a2e8, rx * 1.3, -0.62, islD * 0.5 - 0.12));
  }
  tileGroup.add(islandPedestal);

  for (let gx = 0; gx < S.cols; gx++) {
    tiles[gx] = [];
    for (let gz = 0; gz < S.rows; gz++) {
      const key = `${gx},${gz}`;
      let type = 'grass';
      let height = 0.28;
      const pDir = cfg.getPortalDir(gx, gz);

      if (cfg.altarSet.has(key)) {
        type = 'sanctuary';
        height = 0.36;
      } else if (pDir) {
        type = 'corrupted';
        height = 0.32;
      } else if (cfg.waterSet.has(key)) {
        type = 'water';
        height = 0.16;
      } else if (cfg.cliffSet.has(key)) {
        type = 'cliff';
        height = 0.62;
      } else if (cfg.nodeMap.has(key)) {
        type = cfg.nodeMap.get(key).kind; // 'sun' | 'wood' | 'stone' | 'crystal'
        height = 0.32;
      } else if (cfg.roadSet.has(key)) {
        type = 'road';
        height = 0.29;
      }

      const wpos = gridToWorld(gx, gz);
      const tGroup = new THREE.Group();
      tGroup.position.set(wpos.x, 0, wpos.z);

      const dirt = vox(0.99, 0.28, 0.99, 0xd48c5c, 0, -0.14, 0);
      tGroup.add(dirt);

      // Warm Sage-Pistachio Meadow Greens & Pastel-Lilac Cobblestones (Pinterest Palette!)
      let topColor = (gx + gz) % 2 === 0 ? 0xb7e486 : 0xa3d973;
      let bevelColor = (gx + gz) % 2 === 0 ? 0xc5ed98 : 0xb2e284;
      let topOpts = { roughness: 0.55 };
      if (type === 'sanctuary') {
        topColor = (gx + gz) % 2 === 0 ? 0xffe899 : 0xffd966;
        bevelColor = 0xfff3bf;
        topOpts = { emissive: 0xf59f00, emissiveIntensity: 0.25 };
      } else if (type === 'corrupted') {
        topColor = (gx + gz) % 2 === 0 ? 0x7950f2 : 0x6741d9;
        bevelColor = 0x9775fa;
        topOpts = { emissive: 0x3b096c, emissiveIntensity: 0.35 };
      } else if (type === 'road') {
        topColor = (gx + gz) % 2 === 0 ? 0xd8c6ff : 0xcbb2ff;
        bevelColor = (gx + gz) % 2 === 0 ? 0xe5dbff : 0xdac7ff;
        topOpts = { emissive: 0x7950f2, emissiveIntensity: 0.10, roughness: 0.45 };
      } else if (type === 'water') {
        topColor = 0x56b8ff;
        bevelColor = 0x82ccff;
        topOpts = { emissive: 0x228be6, emissiveIntensity: 0.32, roughness: 0.16 };
      } else if (type === 'cliff') {
        topColor = 0xb5e48c;
        bevelColor = 0xc9f2a3;
      } else if (type === 'sun') {
        topColor = 0xc5ed98;
        bevelColor = 0xd8f5b0;
      } else if (type === 'wood') {
        topColor = 0x95d5b2;
        bevelColor = 0xb7e4c7;
      } else if (type === 'stone') {
        topColor = 0xadb5bd;
        bevelColor = 0xced4da;
      } else if (type === 'crystal') {
        topColor = 0xcbb2ff;
        bevelColor = 0xe5dbff;
      }

      const topBlock = vox(0.98, height, 0.98, topColor, 0, height / 2, 0, topOpts);
      topBlock.userData = { gx, gz };
      tGroup.add(topBlock);
      tilePickMeshes.push(topBlock);

      // Soft Molded Toy Bevel Cap on every tile
      if (type !== 'water') {
        const cap = vox(0.88, 0.035, 0.88, bevelColor, 0, height + 0.017, 0, topOpts);
        tGroup.add(cap);
      }

      // Cute Tiny 3D Wildflowers & Grass Tufts on empty meadow tiles
      if (type === 'grass' && ((gx * 7 + gz * 13) % 5 === 0)) {
        const tuft = vox(0.08, 0.11, 0.08, 0x74c69d, -0.26, height + 0.07, -0.24);
        const flCol = (gx + gz) % 3 === 0 ? 0xff8787 : ((gx + gz) % 3 === 1 ? 0xffe066 : 0xe599f7);
        const blossom = vox(0.09, 0.07, 0.09, flCol, 0.26, height + 0.06, 0.24, { emissive: flCol, emissiveIntensity: 0.25 });
        tGroup.add(tuft, blossom);
      }

      // Glowing starlight cobblestone inlays on road tiles leading to the Moon Sanctuary
      if (type === 'road' && (gx + gz) % 2 === 0) {
        const marker = vox(0.22, 0.045, 0.22, 0xfff3bf, 0, height + 0.035, 0, {
          emissive: 0xffd43b,
          emissiveIntensity: 0.7
        });
        tGroup.add(marker);
        S.roadMarkers.push({ mesh: marker, gx, gz });
      }

      let nodeMesh = null;
      if (type === 'sun' || type === 'wood' || type === 'stone' || type === 'crystal') {
        nodeMesh = buildResourceNodeMesh(type);
        nodeMesh.position.y = height + 0.02;
        tGroup.add(nodeMesh);
      }

      tileGroup.add(tGroup);
      tiles[gx][gz] = {
        gx,
        gz,
        type,
        baseType: type,
        height,
        group: tGroup,
        topBlock,
        nodeMesh,
        hasBridge: false,
        unit: null,
        stackedUnit: null
      };
    }
  }

  // Place the Giant 3D Moon Sanctuary Castle & Rebuild Cradle at (altarGx, altarGz)!
  // Disable raycast interception on the Castle mesh so adjacent tiles have ZERO click dead angles!
  const sanctuaryMesh = buildMoonSanctuaryMesh();
  sanctuaryMesh.position.set(S.sanctuaryWorld.x, 0.36, S.sanctuaryWorld.z);
  sanctuaryMesh.traverse(child => {
    child.raycast = () => {};
  });
  sanctuaryMesh.userData.updateSanctuary(S.hp, S.maxHp, S.moonShards / Math.max(1, S.moonGoal));
  tileGroup.add(sanctuaryMesh);
  S.sanctuaryMesh = sanctuaryMesh;

  // Spawn 3D Portal Arches at the start of every winding route
  const seenPortals = new Set();
  for (const route of (cfg.routes || [])) {
    const [pgx, pgz] = route[0];
    const pKey = `${pgx},${pgz}`;
    if (seenPortals.has(pKey)) continue;
    seenPortals.add(pKey);

    const wp = gridToWorld(pgx, pgz);
    const portal = new THREE.Group();
    portal.position.set(wp.x, 0.32, wp.z);
    portal.rotation.y = (pgz === 0 || pgz === S.rows - 1) ? Math.PI / 2 : 0;
    portal.add(vox(0.24, 1.35, 0.24, 0x5f3dc4, 0, 0.68, -0.42));
    portal.add(vox(0.24, 1.35, 0.24, 0x5f3dc4, 0, 0.68, 0.42));
    portal.add(vox(0.30, 0.26, 1.14, 0x7950f2, 0, 1.38, 0, { emissive: 0x9775fa, emissiveIntensity: 0.6 }));
    portal.add(vox(0.08, 1.12, 0.66, 0xda77f2, 0, 0.65, 0, { emissive: 0xf72585, emissiveIntensity: 0.9, opacity: 0.78 }));
    tileGroup.add(portal);
  }

  // Place Stage Starter Critters
  for (const st of (cfg.starterUnits || [])) {
    placeUnitOnTile(st.gx, st.gz, st.id, true);
  }

  // Spawn initial zombie along the winding portal road so the action and goal are immediately clear!
  spawnZombie('walker');

  updateCameraFraming();
  updateStageButtons();
  updateTopHUD();
}

function updateCameraFraming() {
  if (S.phase === 'cutscene') return;
  const scaleFactor = Math.max(1, S.cols / 14.5);
  let camY = 12.2 * scaleFactor;
  let camDist = 11.8 * scaleFactor;
  if (S.camMode === 1 || S.zoomOut) {
    // High Tactical Overview (zero perspective occlusion)
    camY = 15.8 * scaleFactor;
    camDist = 9.2 * scaleFactor;
  } else if (S.camMode === 2) {
    // Angled Isometric Diorama View
    camY = 11.6 * scaleFactor;
    camDist = 12.4 * scaleFactor;
  }
  const yaw = S.camYaw + (S.camMode === 2 ? 0.26 : 0);
  camera.position.set(
    Math.sin(yaw) * camDist,
    camY,
    Math.cos(yaw) * camDist
  );
  // Look slightly below board center so the entire island sits well above #bottomDock!
  camera.lookAt(0, -1.05, 0.85);
}

// ============================================================================
// PINTEREST 3D GLOSSY SVG HUD & COLLECTIBLE TOY SHELF RENDERING
// ============================================================================
const sunCountEl = document.getElementById('sunCount');
const woodCountEl = document.getElementById('woodCount');
const stoneCountEl = document.getElementById('stoneCount');
const crystalCountEl = document.getElementById('crystalCount');
const hpCountEl = document.getElementById('hpCount');
const moonBarFillEl = document.getElementById('moonBarFill');
const moonShardTextEl = document.getElementById('moonShardText');
const unitInfoEl = document.getElementById('unitInfo');
const bubbleEl = document.getElementById('bubble');
const hotbarEl = document.getElementById('hotbar');

// Inject custom 3D-shaded SVG icons into the Top Claymorphic HUD slots
function initTopHudSVGs() {
  const setSlot = (id, svg) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = svg;
  };
  setSlot('sunSvgSlot', UI_SVGS.sun);
  setSlot('woodSvgSlot', UI_SVGS.wood);
  setSlot('stoneSvgSlot', UI_SVGS.stone);
  setSlot('crystalSvgSlot', UI_SVGS.crystal);
  setSlot('heartSvgSlot', UI_SVGS.heart);
  setSlot('crescentSvgSlot', UI_SVGS.crescentShrine);
  setSlot('forgeSvgSlot', UI_SVGS.forgeMoon);
  setSlot('waveBtn', UI_SVGS.ctrl_wave);
  setSlot('sandboxBtn', UI_SVGS.ctrl_sandbox);
  setSlot('camZoomBtn', UI_SVGS.ctrl_zoom);
  setSlot('replayCineBtn', UI_SVGS.ctrl_cutscene);
  setSlot('pauseBtn', UI_SVGS.ctrl_pause);
  setSlot('musicBtn', UI_SVGS.ctrl_music);
  setSlot('sfxBtn', UI_SVGS.ctrl_sfx);
}
initTopHudSVGs();

let bubbleTimer = 0;
function showBubble(iconSequence, dur = 2.0) {
  bubbleEl.textContent = iconSequence;
  bubbleEl.classList.remove('hidden');
  bubbleTimer = dur;
}

function getEffectiveUnitCost(def) {
  if (!def) return { sun: 0, wood: 0, stone: 0, crystal: 0 };
  if (def.role === 'tool' || def.role === 'terraform' || def.role === 'upgrade') {
    return def.cost || { sun: 0, wood: 0, stone: 0, crystal: 0 };
  }
  const existingCount = S.units.filter(u => u.id === def.id).length;
  return computeDynamicResourceCosts(def, existingCount);
}

function checkAfford(cost = {}) {
  if (S.sandbox) return true;
  return canAffordCost(S.res, cost);
}

function spendCost(cost = {}) {
  if (S.sandbox) return;
  deductCost(S.res, cost);
}

function formatCostPipsHTML(cost = {}, maxPips = 4) {
  const entries = [
    ['sun', cost.sun || 0],
    ['wood', cost.wood || 0],
    ['stone', cost.stone || 0],
    ['crystal', cost.crystal || 0]
  ].filter(([, val]) => val > 0);

  if (entries.length === 0) {
    return `<span class="cost-pip">✨0</span>`;
  }
  const shown = entries.slice(0, maxPips);
  return shown
    .map(([k, val]) => `<span class="cost-pip">${miniResSVG(k)}${val}</span>`)
    .join('');
}

function getFxBadgeHTML(u) {
  if (u.prod?.sun > 0) return miniResSVG('sun');
  if (u.prod?.wood > 0) return miniResSVG('wood');
  if (u.prod?.stone > 0) return miniResSVG('stone');
  if (u.prod?.crystal > 0) return miniResSVG('crystal');
  return u.fxIcon || '✨';
}

function updateRecipePill(def) {
  if (!def) return;
  const effCost = getEffectiveUnitCost(def);
  const thumbHTML = def.portrait
    ? `<img src="${def.portrait}" alt="" class="recipe-thumb" />`
    : `<span class="recipe-chip">${def.toolSvg || UI_SVGS.tool_upgrade}</span>`;

  let outputIcons = '';
  if (def.prod) {
    const out = [];
    if (def.prod.sun > 0) out.push(`+${miniResSVG('sun')}${def.prod.sun}`);
    if (def.prod.wood > 0) out.push(`+${miniResSVG('wood')}${def.prod.wood}`);
    if (def.prod.stone > 0) out.push(`+${miniResSVG('stone')}${def.prod.stone}`);
    if (def.prod.crystal > 0) out.push(`+${miniResSVG('crystal')}${def.prod.crystal}`);
    outputIcons = `<span class="recipe-chip">${out.join(' ')}</span>`;
  } else if (def.atk || def.dmg) {
    outputIcons = `<span class="recipe-chip">${def.fxIcon || '⚔️'} ${def.atk || def.dmg}</span>`;
  } else if (def.hp && def.role === 'defend') {
    outputIcons = `<span class="recipe-chip">🛡️ ${def.hp}</span>`;
  } else if (def.role === 'upgrade') {
    outputIcons = `<span class="recipe-chip">⭐ ➔ ⭐⭐ ➔ ⭐⭐⭐</span>`;
  } else {
    outputIcons = `<span class="recipe-chip">${def.fxIcon || '✨'}</span>`;
  }

  unitInfoEl.innerHTML = `
    ${thumbHTML}
    <span class="recipe-arrow">➔</span>
    ${outputIcons}
    <span class="recipe-arrow">│</span>
    <span class="cost-row">${formatCostPipsHTML(effCost, 4)}</span>
  `;
}

function getCardRoleClass(u) {
  if (u.role === 'produce') return 'role-produce';
  if (u.role === 'defend') return 'role-defend';
  if (u.role === 'attack') return 'role-attack';
  return 'role-utility';
}

function buildHotbar() {
  hotbarEl.innerHTML = '';
  for (const u of CRITTER_UNITS) {
    const card = document.createElement('button');
    card.className = `ucard ${getCardRoleClass(u)} tier-${u.tier ?? 1}` + (S.selectedTool === u.id ? ' active' : '');
    card.dataset.id = u.id;

    const visual = u.portrait
      ? `<img src="${u.portrait}" alt="" />`
      : `<div class="tool-svg-wrap">${u.toolSvg || UI_SVGS.tool_upgrade}</div>`;

    const starCount = Math.max(1, Math.min(3, u.tier || 1));
    const starsStr = '⭐'.repeat(starCount);

    card.innerHTML = `
      <div class="ucard-frame">
        <span class="fx-badge">${getFxBadgeHTML(u)}</span>
        ${visual}
        <span class="ucard-stars">${starsStr}</span>
      </div>
      <div class="cost-row">${formatCostPipsHTML(getEffectiveUnitCost(u), 2)}</div>
    `;

    card.addEventListener('click', () => {
      sound.click();
      S.selectedTool = u.id;
      document.querySelectorAll('.ucard').forEach(el => el.classList.toggle('active', el.dataset.id === u.id));
      updateRecipePill(u);
    });
    hotbarEl.appendChild(card);
  }
  updateRecipePill(CRITTER_UNITS.find(u => u.id === S.selectedTool));
}
buildHotbar();

function updateStageButtons() {
  document.querySelectorAll('.stage-btn').forEach(btn => {
    const idx = Number(btn.dataset.stage);
    btn.classList.toggle('active', idx === S.stageIndex);
    btn.classList.toggle('cleared', S.clearedStages.has(idx));
    btn.textContent = S.clearedStages.has(idx) ? `${idx + 1}★` : `${idx + 1}`;
  });
}

function updateTopHUD() {
  sunCountEl.textContent = S.sandbox ? '∞' : Math.floor(S.res.sun);
  woodCountEl.textContent = S.sandbox ? '∞' : Math.floor(S.res.wood);
  stoneCountEl.textContent = S.sandbox ? '∞' : Math.floor(S.res.stone);
  crystalCountEl.textContent = S.sandbox ? '∞' : Math.floor(S.res.crystal);
  hpCountEl.textContent = S.hp;

  const pct = Math.min(100, (S.moonShards / Math.max(1, S.moonGoal)) * 100);
  moonBarFillEl.style.width = `${pct.toFixed(1)}%`;
  moonShardTextEl.textContent = `${S.moonShards}/${S.moonGoal}`;

  if (S.sanctuaryMesh) {
    S.sanctuaryMesh.userData.updateSanctuary(S.hp, S.maxHp, S.moonShards / Math.max(1, S.moonGoal));
  }

  document.querySelectorAll('.ucard').forEach(el => {
    const def = CRITTER_UNITS.find(u => u.id === el.dataset.id);
    if (def) {
      const effCost = getEffectiveUnitCost(def);
      const costRow = el.querySelector('.cost-row');
      if (costRow) costRow.innerHTML = formatCostPipsHTML(effCost, 2);
      el.classList.toggle('locked', !checkAfford(effCost));
    }
  });
  updateRecipePill(CRITTER_UNITS.find(u => u.id === S.selectedTool));
}

// ============================================================================
// 10-SECOND OPENING CUTSCENE DIRECTOR (NON-BLOCKY 3D -> MINECRAFT VOXELS)
// ============================================================================
const cineBannerEl = document.getElementById('cineBanner');
const cineProgressFillEl = document.getElementById('cineProgressFill');
const cineStep1El = document.getElementById('cineStep1');
const cineStep2El = document.getElementById('cineStep2');
const cineStep3El = document.getElementById('cineStep3');

initIntroMovieCanvas();

export function startOpeningCutscene() {
  S.phase = 'cutscene';
  S.cineTime = 0;
  S.moonExploded = false;
  document.body.classList.add('inIntro');
  scene.background = new THREE.Color(0x0d0822);
  skyGroup.visible = true;

  tileGroup.visible = false;
  unitGroup.visible = false;
  zombieGroup.visible = false;
  projGroup.visible = false;
  fxGroup.visible = false;

  cineGroup.visible = true;
  moonGroup.visible = true;
  moonGroup.scale.setScalar(1);
  moonGroup.position.set(2.6, 4.7, -0.2);

  cineData.cute.visible = true;
  cineData.night.visible = false;
  cineData.rocket.visible = false;
  cineData.flame.visible = false;
  cineData.shardGroup.visible = false;

  cineBannerEl.classList.remove('hidden');
  renderIntroMovieFrame(0);
}

function updateOpeningCutscene(dt) {
  S.cineTime += dt;
  const t = S.cineTime;
  const pct = Math.min(100, (t / 10.0) * 100);
  cineProgressFillEl.style.width = `${pct}%`;

  cineStep1El.classList.toggle('active', t < 2.65);
  cineStep2El.classList.toggle('active', t >= 2.65 && t < 7.55);
  cineStep3El.classList.toggle('active', t >= 7.55);

  // Render the 60 FPS Full-Screen High-Resolution 2.5D Pixar/Storybook Opening Movie!
  renderIntroMovieFrame(t);

  // Synchronize audio cues & scene state
  if (t >= 2.65 && cineData.cute.visible) {
    cineData.cute.visible = false;
    cineData.night.visible = true;
    cineData.rocket.visible = true;
    sound.roar();
  }
  if (t >= 5.25 && !S.moonExploded) {
    S.moonExploded = true;
    cineData.rocket.visible = false;
    moonGroup.visible = false;
    cineData.shardGroup.visible = true;
    sound.explosion();
  }
  if (t >= 10.0) {
    finishCutscene();
  }
}

export function finishCutscene() {
  S.phase = 'playing';
  document.body.classList.remove('inIntro');
  scene.background = null;
  skyGroup.visible = false;
  cineGroup.visible = false;
  cineBannerEl.classList.add('hidden');

  tileGroup.visible = true;
  unitGroup.visible = true;
  zombieGroup.visible = true;
  projGroup.visible = true;
  fxGroup.visible = true;

  moonGroup.position.set(0, 9.2, -11.5);
  setMoonRestoreProgress(S.moonShards / Math.max(1, S.moonGoal));
  updateCameraFraming();
  sound.startMusic();
  showBubble('🧟⛩️ ➔ 🛡️⚔️ ➔ 🌕✨', 1.1);
}

// ============================================================================
// MINECRAFT VOXEL BUILDING, 3-STAR UPGRADING & TERRAFORMING
// ============================================================================
function spawnBurst(x, y, z, color, count = 6) {
  const n = Math.min(8, count);
  for (let i = 0; i < n; i++) {
    const m = vox(0.11, 0.11, 0.11, color, x, y, z, { emissive: color, emissiveIntensity: 0.65 });
    fxGroup.add(m);
    S.particles.push({
      mesh: m,
      vx: (Math.random() - 0.5) * 2.6,
      vy: 1.4 + Math.random() * 1.8,
      vz: (Math.random() - 0.5) * 2.6,
      gravity: 7.5,
      life: 0.38 + Math.random() * 0.18
    });
  }
}

// Gentle single rising sparkle when a Gatherer produces resources (zero explosion clutter!)
function spawnSoftSparkle(x, y, z, color) {
  const m = vox(0.16, 0.16, 0.16, color, x, y, z, { emissive: color, emissiveIntensity: 0.9 });
  fxGroup.add(m);
  S.particles.push({
    mesh: m,
    vx: 0,
    vy: 1.35,
    vz: 0,
    gravity: 0,
    life: 0.55
  });
}

// Upgrade an existing placed Critter (Lv.1 -> Lv.2 -> Lv.3) — major sink for all 4 resources!
export function tryUpgradeUnit(u) {
  if (!u || u.isTrap || (u.level || 1) >= 3) {
    showBubble('⭐⭐⭐ ✨', 1.2);
    return false;
  }
  const upCost = computeUpgradeCost(u.def, u.level || 1);
  if (!checkAfford(upCost)) {
    showBubble('⬆️⭐ ☀️🪵🪨💎 ❌', 1.5);
    return false;
  }
  spendCost(upCost);
  u.level = (u.level || 1) + 1;
  u.maxHp = Math.round(u.def.hp * (1 + (u.level - 1) * 0.45));
  u.hp = u.maxHp;
  if (u.mesh.userData.setStarLevel) {
    u.mesh.userData.setStarLevel(u.level);
  }
  const wp = gridToWorld(u.gx, u.gz);
  spawnBurst(wp.x, 1.1, wp.z, 0xffd43b, 8);
  sound.shard();
  showBubble(u.level === 2 ? '⬆️ ⭐⭐ ✨' : '⬆️ ⭐⭐⭐ ✨', 1.4);
  updateTopHUD();
  return true;
}

// All-Resource & Surplus-Resource Moon Sanctuary Forge (No resource is ever stuck in surplus!)
export function forgeMoonAtSanctuary() {
  if (S.sandbox) {
    addMoonShards(6);
    sound.shard();
    spawnBurst(S.sanctuaryWorld.x, 1.6, S.sanctuaryWorld.z, 0xffd43b, 8);
    showBubble('🏰 ➕6 🌕 ✨', 1.3);
    return true;
  }

  // Mode 1: Balanced 4-resource Moon Forge bundle (☀️ 20 + 🪵 10 + 🪨 10 + 💎 5 -> +6 🌕)
  const bundleCost = { sun: 20, wood: 10, stone: 10, crystal: 5 };
  if (checkAfford(bundleCost)) {
    spendCost(bundleCost);
    addMoonShards(6);
    sound.shard();
    spawnBurst(S.sanctuaryWorld.x, 1.6, S.sanctuaryWorld.z, 0xffd43b, 8);
    showBubble('☀️🪵🪨💎 ➔ +6 🌕', 1.4);
    return true;
  }

  // Mode 2: Surplus-Resource Converter! If ANY single resource has >= 35, convert 35 of it into +4 🌕!
  const entries = [
    ['crystal', '💎'],
    ['stone', '🪨'],
    ['wood', '🪵'],
    ['sun', '☀️']
  ].sort((a, b) => (S.res[b[0]] || 0) - (S.res[a[0]] || 0));

  const [bestKey, bestIcon] = entries[0];
  if ((S.res[bestKey] || 0) >= 35) {
    S.res[bestKey] -= 35;
    addMoonShards(4);
    sound.shard();
    spawnBurst(S.sanctuaryWorld.x, 1.6, S.sanctuaryWorld.z, 0xffd43b, 8);
    showBubble(`${bestIcon}35 ➔ +4 🌕`, 1.4);
    updateTopHUD();
    return true;
  }

  showBubble('☀️20 🪵10 🪨10 💎5 ❌', 1.4);
  return false;
}

export function placeUnitOnTile(gx, gz, toolId, free = false) {
  if (gx < 0 || gx >= S.cols || gz < 0 || gz >= S.rows) return false;
  const tile = tiles[gx][gz];
  const def = CRITTER_UNITS.find(u => u.id === toolId);
  if (!def) return false;

  // Clicking on the 3D Moon Sanctuary tiles triggers the Moon Forge!
  if (tile.type === 'sanctuary' && !free) {
    return forgeMoonAtSanctuary();
  }

  // 1. Shovel Reclaim Tool — 100% Full Refund so repositioning units has ZERO penalty!
  if (def.role === 'tool') {
    const target = tile.stackedUnit || tile.unit;
    if (!target) return false;
    if (!S.sandbox) {
      S.res.sun += Math.round(target.def.cost?.sun || 15);
      S.res.wood += Math.round(target.def.cost?.wood || 0);
      S.res.stone += Math.round(target.def.cost?.stone || 0);
      S.res.crystal += Math.round(target.def.cost?.crystal || 0);
    }
    removeUnit(target);
    sound.place();
    showBubble('♻️ 100% ✨', 1.1);
    updateTopHUD();
    return true;
  }

  // 2. Explicit Upgrade Tool (`upgrade_star`)
  if (def.role === 'upgrade') {
    const target = tile.stackedUnit || tile.unit;
    if (!target) {
      showBubble('⬆️⭐ ➔ 🐱', 1.1);
      return false;
    }
    return tryUpgradeUnit(target);
  }

  // 3. Terraform Tools: Bridge & Spike Trap
  if (def.role === 'terraform') {
    const effCost = getEffectiveUnitCost(def);
    if (!free && !checkAfford(effCost)) {
      showBubble('🪵🪨 ❌', 1.2);
      return false;
    }
    if (def.id === 'bridge') {
      if (tile.type !== 'water' || tile.hasBridge) {
        showBubble('🌊 ➔ 🌉', 1.2);
        return false;
      }
      if (!free) spendCost(effCost);
      tile.hasBridge = true;
      tile.height = 0.30;
      const bridgeMesh = vox(0.94, 0.12, 0.94, 0xbc6c25, 0, 0.24, 0);
      tile.group.add(bridgeMesh);
      sound.place();
      updateTopHUD();
      return true;
    }
    if (def.id === 'spike_trap') {
      if ((tile.type === 'water' && !tile.hasBridge) || tile.unit) return false;
      if (!free) spendCost(effCost);
      const trap = new THREE.Group();
      for (let sx = -1; sx <= 1; sx += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          trap.add(vox(0.12, 0.18, 0.12, 0xe9ecef, sx * 0.2, 0.09, sz * 0.2, { metalness: 0.7 }));
        }
      }
      const wpos = gridToWorld(gx, gz);
      trap.position.set(wpos.x, tile.height, wpos.z);
      unitGroup.add(trap);
      const uObj = { id: 'spike_trap', def, gx, gz, hp: def.hp, maxHp: def.hp, mesh: trap, timer: 0, isTrap: true };
      tile.unit = uObj;
      S.units.push(uObj);
      sound.place();
      updateTopHUD();
      return true;
    }
  }

  // 4. Water check (Bubba is amphibious and can build directly on water!)
  if (tile.type === 'water' && !tile.hasBridge && !def.amphibious) {
    showBubble('🌊 ❌ ➔ 🌉 / 🐘', 1.4);
    return false;
  }

  // 5. Corrupted zombie portal or Sanctuary check
  if (tile.type === 'corrupted' || (tile.type === 'sanctuary' && !free)) {
    showBubble('🧟 ❌', 1.2);
    return false;
  }

  // 6. Stacking on Mikey's Watchtower OR Tapping an Existing Unit to Upgrade It (`⭐1 -> ⭐2 -> ⭐3`)!
  let stackingOnTower = false;
  if (tile.unit) {
    if (tile.unit.def.stackable && !tile.stackedUnit && def.id !== 'mikey') {
      stackingOnTower = true;
    } else if (!free) {
      return tryUpgradeUnit(tile.stackedUnit || tile.unit);
    } else {
      return false;
    }
  }

  const effCost = getEffectiveUnitCost(def);
  if (!free && !checkAfford(effCost)) {
    showBubble('☀️🪵🪨💎 ❌', 1.3);
    return false;
  }
  if (!free) spendCost(effCost);

  // If this tile has a 3D resource prop (tree, boulder, sun shrine, crystal), slide it neatly to the back corner so it never clips into the Critter!
  if (tile.nodeMesh && !stackingOnTower) {
    tile.nodeMesh.position.set(-0.29, tile.height + 0.02, -0.29);
    tile.nodeMesh.scale.setScalar(0.55);
  }

  const mesh = buildCritterUnitMesh(def, portraitTexMap.get(def.id));
  const wpos = gridToWorld(gx, gz);
  const yBase = stackingOnTower ? tile.height + 0.66 : tile.height;
  mesh.position.set(wpos.x, yBase, wpos.z);
  unitGroup.add(mesh);

  // Check if placed on OR adjacent to matching resource vein
  let nearVein = tile.baseType === def.veinBonusNode;
  if (!nearVein && def.veinBonusNode) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (tiles[gx + dx]?.[gz + dz]?.baseType === def.veinBonusNode) {
          nearVein = true;
        }
      }
    }
  }

  const unitObj = {
    id: def.id,
    def,
    gx,
    gz,
    level: 1,
    hp: def.hp,
    maxHp: def.hp,
    mesh,
    prodTimer: Math.random() * 1.2,
    atkTimer: Math.random() * 0.4,
    stacked: stackingOnTower,
    onHighGround: stackingOnTower || tile.type === 'cliff',
    onVein: nearVein
  };

  if (stackingOnTower) {
    tile.stackedUnit = unitObj;
    showBubble('🗼 ➕ ⚔️ ✨', 1.4);
  } else {
    tile.unit = unitObj;
  }

  S.units.push(unitObj);
  spawnSoftSparkle(wpos.x, yBase + 0.55, wpos.z, def.accent);
  if (!free) sound.place();
  updateTopHUD();
  return true;
}

function removeUnit(u) {
  unitGroup.remove(u.mesh);
  S.units = S.units.filter(item => item !== u);
  const t = tiles[u.gx]?.[u.gz];
  if (t) {
    if (t.stackedUnit === u) t.stackedUnit = null;
    else if (t.unit === u) {
      if (t.stackedUnit) {
        t.stackedUnit.mesh.position.y = t.height;
        t.stackedUnit.stacked = false;
        t.unit = t.stackedUnit;
        t.stackedUnit = null;
      } else {
        t.unit = null;
        if (t.nodeMesh) {
          t.nodeMesh.position.set(0, t.height + 0.02, 0);
          t.nodeMesh.scale.setScalar(1.0);
        }
      }
    }
  }
}

// ============================================================================
// ZOMBIE SPAWNING ON WINDING COBBLESTONE ROADS & CONTROLLED WAVE PACING
// ============================================================================
export function spawnZombie(typeId, customPos = null) {
  const def = ZOMBIE_TYPES[typeId] || ZOMBIE_TYPES.walker;
  const mesh = buildVoxelZombie(def);

  const cfg = S.stageCfg;
  const routes = cfg?.routes || [[[S.cols - 1, Math.floor(S.rows / 2)], [1, Math.floor(S.rows / 2)]]];
  const chosenRoute = routes[Math.floor(Math.random() * routes.length)];

  let gx = chosenRoute[0][0];
  let gz = chosenRoute[0][1];
  let wpIndex = 1;

  if (customPos) {
    gx = customPos.gx;
    gz = customPos.gz;
    wpIndex = chosenRoute.length; // March straight toward Sanctuary from custom test position
  }

  const wpos = gridToWorld(gx, gz);
  const yPos = def.flying ? 1.18 : 0.30;
  mesh.position.set(wpos.x, yPos, wpos.z);
  zombieGroup.add(mesh);

  const hpScale = 1 + (S.wave - 1) * 0.06 + S.stageIndex * 0.05;
  const maxHp = Math.round(def.hp * hpScale);

  const zObj = {
    def,
    mesh,
    gx,
    gz,
    x: wpos.x,
    y: yPos,
    z: wpos.z,
    route: chosenRoute,
    wpIndex,
    hp: maxHp,
    maxHp,
    armor: def.armor || 0,
    speed: def.speed,
    atkTimer: 0,
    specialTimer: 3.5,
    slowTimer: 0,
    markTimer: 0,
    walkPhase: Math.random() * 6.28
  };
  mesh.userData.updateHearts(zObj.hp, zObj.maxHp, zObj.armor);
  S.zombies.push(zObj);
}

function triggerNextWave() {
  const bal = computeBalanceState({
    placedUnits: S.units,
    zombies: S.zombies,
    stageIndex: S.stageIndex,
    moonShards: S.moonShards,
    wave: S.wave
  });
  const pool = S.stageCfg?.zombiePool || ['walker', 'runner', 'digger'];
  const count = Math.min(8, 3 + Math.floor(S.wave * 0.8) + S.stageIndex);

  for (let i = 0; i < count; i++) {
    const zType = (S.wave % 3 === 0 && i === count - 1 && pool.includes('nightmare_boss'))
      ? 'nightmare_boss'
      : pool[(S.wave + i) % pool.length];
    S.spawnQueue.push(zType);
  }
  showBubble(`🧟⛩️ ${S.wave} ➔ 🌕✨`, 1.3);
  S.wave++;
  S.waveTimer = 22.0 * (bal.spawnIntervalMult || 1.0);
}

// ============================================================================
// COLLECTIBLE ORBS, MOON SHARDS & VICTORY / DEFEAT STATES
// ============================================================================
function spawnCollectibleOrb(x, z, kind = 'sun', amount = 8) {
  const colorMap = {
    sun: 0xffe066,
    wood: 0x51cf66,
    stone: 0x74c0fc,
    crystal: 0xda77f2,
    moon: 0xfff3bf
  };
  const col = colorMap[kind] || 0xffe066;
  const mesh = vox(0.26, 0.26, 0.26, col, x, 0.72, z, { emissive: col, emissiveIntensity: 0.9 });
  fxGroup.add(mesh);
  S.orbs.push({ mesh, x, z, kind, amount, age: 0 });
}

function collectOrb(orb) {
  fxGroup.remove(orb.mesh);
  S.orbs = S.orbs.filter(o => o !== orb);
  if (orb.kind === 'moon') {
    addMoonShards(orb.amount);
    sound.shard();
  } else {
    S.res[orb.kind] = (S.res[orb.kind] || 0) + orb.amount;
    sound.sun();
    updateTopHUD();
  }
}

export function addMoonShards(n) {
  if (S.phase === 'victory') return;
  S.moonShards = Math.min(S.moonGoal, S.moonShards + n);
  const progress = S.moonShards / Math.max(1, S.moonGoal);
  setMoonRestoreProgress(progress);

  updateTopHUD();

  if (S.moonShards >= S.moonGoal) {
    S.phase = 'victory';
    S.clearedStages.add(S.stageIndex);
    updateStageButtons();
    sound.victory();
    const curIco = `${S.stageIndex + 1}`;
    const nextIco = S.stageIndex < STAGES.length - 1 ? `${S.stageIndex + 2}` : '🏆';
    document.querySelector('.modal-stars').textContent = '⭐ ⭐ ⭐';
    document.getElementById('modalStageBadge').textContent =
      S.stageIndex < STAGES.length - 1 ? `${curIco} 🌕 ➔ ${nextIco}` : `${curIco} 🏆 🌕`;
    document.getElementById('victoryModal').classList.remove('hidden');
  }
}

function triggerDefeat() {
  if (S.phase === 'defeat' || S.phase === 'victory') return;
  S.phase = 'defeat';
  sound.explosion();
  const curIco = `${S.stageIndex + 1}`;
  document.querySelector('.modal-stars').textContent = '💔 🧟 💔';
  document.getElementById('modalStageBadge').textContent = `${curIco} 💔 ➔ 🔄`;
  document.getElementById('victoryModal').classList.remove('hidden');
}

// ============================================================================
// MAIN SIMULATION LOOP (ALL-UNIT 360° COMBAT + WINDING ROAD PATHING)
// ============================================================================
function updateGameplay(dt) {
  if (S.paused) return;

  // Steady solar income + active Critter gatherers
  S.res.sun += 0.65 * dt;

  // Animate road markers pulsing toward the 3D Moon Sanctuary
  const nowSec = performance.now() * 0.004;
  for (let i = 0; i < S.roadMarkers.length; i++) {
    const rm = S.roadMarkers[i];
    const pulse = 0.8 + Math.sin(nowSec - rm.gx * 0.5) * 0.22;
    rm.mesh.scale.set(pulse, 1, pulse);
  }

  // Rotate the 3D Moon Sanctuary's star ring & fire its Golden Starlight Guardian Beam!
  const sancX = S.sanctuaryWorld.x;
  const sancZ = S.sanctuaryWorld.z;
  if (S.sanctuaryMesh) {
    S.sanctuaryMesh.userData.starRing.rotation.z += dt * 0.65;
    S.sanctuaryMesh.userData.moonCore.rotation.y += dt * 0.8;
    if (S.sanctuaryShake > 0) {
      S.sanctuaryShake = Math.max(0, S.sanctuaryShake - dt * 4);
      S.sanctuaryMesh.position.x = sancX + (Math.random() - 0.5) * S.sanctuaryShake * 0.16;
      S.sanctuaryMesh.position.z = sancZ + (Math.random() - 0.5) * S.sanctuaryShake * 0.16;
    } else {
      S.sanctuaryMesh.position.set(sancX, 0.36, sancZ);
    }

    // Sanctuary Guardian Beam zaps any zombie that gets within 3.8 tiles of the Castle!
    S.sanctuaryFireTimer += dt;
    if (S.sanctuaryFireTimer >= 1.4 && S.zombies.length > 0) {
      let nearestZ = null;
      let nearestDist = 3.8;
      for (const z of S.zombies) {
        const d = Math.hypot(z.x - sancX, z.z - sancZ);
        if (d <= nearestDist) {
          nearestDist = d;
          nearestZ = z;
        }
      }
      if (nearestZ) {
        S.sanctuaryFireTimer = 0;
        const pMesh = vox(0.22, 0.22, 0.22, 0xffd43b, sancX, 1.85, sancZ, {
          emissive: 0xffe066,
          emissiveIntensity: 1.0
        });
        projGroup.add(pMesh);
        S.projectiles.push({
          mesh: pMesh,
          x: sancX,
          y: 1.85,
          z: sancZ,
          target: nearestZ,
          dmg: 58,
          splash: 1.1,
          meltsArmor: true,
          marksTarget: false,
          chainCount: 0,
          knockback: 0.45,
          flyerBonus: 1.2,
          color: 0xffd43b
        });
      }
    }
  }

  // Calm, controlled wave pacing: advance early if wave is cleared (after 3.5s breather)
  if (S.zombies.length === 0 && S.spawnQueue.length === 0) {
    S.waveTimer = Math.min(S.waveTimer, 3.5);
  }
  S.waveTimer -= dt;
  if (S.waveTimer <= 0) triggerNextWave();

  const maxActiveZombies = 8 + S.stageIndex;
  if (S.spawnQueue.length > 0 && S.zombies.length < maxActiveZombies) {
    S.spawnCooldown -= dt;
    if (S.spawnCooldown <= 0) {
      spawnZombie(S.spawnQueue.shift());
      S.spawnCooldown = 1.35;
    }
  }

  // Update All Placed Critter Units (360° Combat + 4-Resource Production!)
  for (let i = S.units.length - 1; i >= 0; i--) {
    const u = S.units[i];
    const wpos = gridToWorld(u.gx, u.gz);
    const tile = tiles[u.gx]?.[u.gz];
    const lvMult = 1 + ((u.level || 1) - 1) * 0.50;

    if (u.mesh.userData.rotor) {
      u.mesh.userData.rotor.rotation.z += dt * 4.5;
    }

    let haste = 1.0;
    for (const ally of S.units) {
      if (ally.def.hasteRadius && Math.hypot(ally.gx - u.gx, ally.gz - u.gz) <= ally.def.hasteRadius) {
        haste = ally.def.hasteMult || 1.3;
        break;
      }
    }
    u.prodTimer = (u.prodTimer || 0) + dt * haste;
    u.atkTimer = (u.atkTimer || 0) + dt * haste;

    // 1. Spike Trap damage
    if (u.isTrap) {
      for (const z of S.zombies) {
        if (!z.def.flying && Math.hypot(z.x - wpos.x, z.z - wpos.z) < 0.62) {
          z.hp -= u.def.dmg * dt;
          z.mesh.userData.updateHearts(z.hp, z.maxHp, z.armor);
        }
      }
      continue;
    }

    // 2. 4-Resource Production (with single gentle rising sparkle instead of noisy cube bursts!)
    if (u.def.prod && u.prodTimer >= (u.def.prodInterval || 3.8)) {
      u.prodTimer = 0;
      const p = u.def.prod;
      const veinBoost = u.onVein ? (u.def.veinMult || 2.25) : 1.0;

      if (p.sun > 0) {
        S.res.sun += Math.round(p.sun * veinBoost * lvMult);
        spawnSoftSparkle(wpos.x, 0.95, wpos.z, 0xffe066);
      }
      if (p.wood > 0) {
        S.res.wood += Math.round(p.wood * veinBoost * lvMult);
        spawnSoftSparkle(wpos.x, 0.95, wpos.z, 0x51cf66);
      }
      if (p.stone > 0) {
        S.res.stone += Math.round(p.stone * veinBoost * lvMult);
        spawnSoftSparkle(wpos.x, 0.95, wpos.z, 0x74c0fc);
      }
      if (p.crystal > 0) {
        const wBoost = (u.onVein || tile?.baseType === 'water') ? (u.def.veinMult || 2.4) : 1.0;
        S.res.crystal += Math.round(p.crystal * wBoost * lvMult);
        spawnSoftSparkle(wpos.x, 0.95, wpos.z, 0xda77f2);
      }
      updateTopHUD();
    }

    // 3. PickyPiggy Healing Aura (+22 HP/s)
    if (u.def.healRadius) {
      for (const ally of S.units) {
        if (ally.hp < ally.maxHp && Math.hypot(ally.gx - u.gx, ally.gz - u.gz) <= u.def.healRadius) {
          ally.hp = Math.min(ally.maxHp, ally.hp + (u.def.healPerSec || 22) * lvMult * dt);
        }
      }
    }

    // 4. Bubba Cryo Slow Dome (50% slow)
    if (u.def.slowRadius) {
      for (const z of S.zombies) {
        if (Math.hypot(z.gx - u.gx, z.gz - u.gz) <= u.def.slowRadius) {
          z.slowTimer = 0.7;
        }
      }
    }

    // 5. CraftyCorn Moon Shard Weaving (+2 🌕 every 5.0s)
    if (u.def.shardWeaver) {
      u.moonTimer = (u.moonTimer || 0) + dt;
      if (u.moonTimer >= (u.def.shardInterval || 5.0)) {
        u.moonTimer = 0;
        addMoonShards(Math.round((u.def.shardYield || 2) * lvMult));
        spawnSoftSparkle(wpos.x, 1.15, wpos.z, 0xfff3bf);
      }
    }

    // 6. 360° Zero-Dead-Angle Combat for ALL 10 Critters!
    if (u.def.atk > 0 && u.atkTimer >= (u.def.fireInterval || 1.2)) {
      const rangeBonus = u.stacked ? 1.45 : (u.onHighGround ? 1.25 : 1.0);
      const dmgBonus = (u.stacked ? 1.35 : (u.onHighGround ? 1.15 : 1.0)) * lvMult;
      const effRange = (u.def.range || 7.0) * rangeBonus;

      let target = null;
      let bestScore = Infinity;
      for (const z of S.zombies) {
        const d = Math.hypot(z.gx - u.gx, z.gz - u.gz);
        if (d <= effRange) {
          // Prioritize zombies closest to the Moon Sanctuary Castle!
          const dSanc = Math.hypot(z.x - sancX, z.z - sancZ);
          if (dSanc < bestScore) {
            bestScore = dSanc;
            target = z;
          }
        }
      }

      if (target) {
        u.atkTimer = 0;
        // Smooth 360° turret rotation toward target zombie (zero directional dead angle!)
        u.mesh.rotation.y = Math.atan2(target.x - wpos.x, target.z - wpos.z);

        sound.shoot();
        const pColor = u.def.accent || 0xffe066;
        const pMesh = vox(0.18, 0.18, 0.18, pColor, wpos.x, u.mesh.position.y + 0.55, wpos.z, {
          emissive: pColor,
          emissiveIntensity: 0.95
        });
        projGroup.add(pMesh);
        S.projectiles.push({
          mesh: pMesh,
          x: wpos.x,
          y: u.mesh.position.y + 0.55,
          z: wpos.z,
          target,
          dmg: (u.def.atk || 32) * dmgBonus,
          splash: u.def.splashRadius || 0,
          meltsArmor: (u.def.armorMelt || 0) > 0,
          marksTarget: (u.def.vulnBonus || 0) > 0,
          chainCount: u.def.chainTargets || 0,
          knockback: u.def.knockback || 0,
          flyerBonus: u.def.bonusVsFlyerCreeper || 1.0,
          color: pColor
        });
      }
    }
  }

  // Update Projectiles
  for (let i = S.projectiles.length - 1; i >= 0; i--) {
    const p = S.projectiles[i];
    if (!S.zombies.includes(p.target)) {
      projGroup.remove(p.mesh);
      S.projectiles.splice(i, 1);
      continue;
    }
    const dx = p.target.x - p.x;
    const dy = (p.target.y + 0.45) - p.y;
    const dz = p.target.z - p.z;
    const dist = Math.hypot(dx, dy, dz);
    const step = 13.5 * dt;

    if (dist <= step + 0.22) {
      applyProjectileHit(p, p.target);
      projGroup.remove(p.mesh);
      S.projectiles.splice(i, 1);
    } else {
      p.x += (dx / dist) * step;
      p.y += (dy / dist) * step;
      p.z += (dz / dist) * step;
      p.mesh.position.set(p.x, p.y, p.z);
    }
  }

  // Update Zombies — Follow Winding Cobblestone Road Waypoints to the 3D Moon Sanctuary!
  for (let i = S.zombies.length - 1; i >= 0; i--) {
    const z = S.zombies[i];

    if (z.hp <= 0) {
      spawnBurst(z.x, z.y + 0.4, z.z, z.def.skinColor || '#69db7c', 5);
      const rw = z.def.reward || {};
      addMoonShards(rw.shard > 0 ? rw.shard : 1);
      if (rw.sun) S.res.sun += rw.sun;
      if (rw.wood) S.res.wood += rw.wood;
      if (rw.stone) S.res.stone += rw.stone;
      if (rw.crystal) S.res.crystal += rw.crystal;
      if (Math.random() < 0.35) {
        const kinds = ['sun', 'wood', 'stone', 'crystal'];
        const k = kinds[Math.floor(Math.random() * kinds.length)];
        spawnCollectibleOrb(z.x, z.z, k, 6);
      }
      zombieGroup.remove(z.mesh);
      S.zombies.splice(i, 1);
      updateTopHUD();
      continue;
    }

    z.walkPhase += dt * 7.5;
    if (z.mesh.userData.legL) {
      z.mesh.userData.legL.rotation.z = Math.sin(z.walkPhase) * 0.45;
      z.mesh.userData.legR.rotation.z = -Math.sin(z.walkPhase) * 0.45;
    }
    if (z.mesh.userData.pickaxeGroup) {
      z.mesh.userData.pickaxeGroup.rotation.z = Math.sin(z.walkPhase * 1.6) * 0.65;
    }
    if (z.mesh.userData.tntBelt) {
      const pulse = 1 + Math.sin(z.walkPhase * 2.5) * 0.10;
      z.mesh.userData.tntBelt.scale.setScalar(pulse);
    }
    if (z.mesh.userData.balloonRig) {
      z.mesh.position.y = 1.18 + Math.sin(z.walkPhase * 0.6) * 0.12;
    }
    if (z.mesh.userData.shamanRing) {
      z.mesh.userData.shamanRing.rotation.y += dt * 2.4;
    }
    if (z.mesh.userData.bossOrbs) {
      z.mesh.userData.bossOrbs.rotation.y -= dt * 2.8;
    }

    // Necromancer / Shaman Special: Heal nearby zombies
    if (z.def.healPerSec) {
      for (const other of S.zombies) {
        if (other.hp < other.maxHp && Math.hypot(other.gx - z.gx, other.gz - z.gz) <= (z.def.healRadius || 2.8)) {
          other.hp = Math.min(other.maxHp, other.hp + z.def.healPerSec * dt);
          other.mesh.userData.updateHearts(other.hp, other.maxHp, other.armor);
        }
      }
      z.specialTimer -= dt;
      if (z.specialTimer <= 0 && S.zombies.length < maxActiveZombies) {
        z.specialTimer = z.def.summonInterval || 9.5;
        spawnZombie('runner', { gx: z.gx, gz: z.gz });
      }
    }

    if (z.slowTimer > 0) z.slowTimer -= dt;
    if (z.markTimer > 0) z.markTimer -= dt;

    // 1. Check if zombie has reached the 3D Moon Sanctuary Castle!
    const distToSanctuary = Math.hypot(sancX - z.x, sancZ - z.z);
    if (distToSanctuary <= 1.25) {
      S.hp = Math.max(0, S.hp - 1);
      S.sanctuaryShake = 0.5;
      spawnBurst(sancX, 1.1, sancZ, 0xff4d6d, 6);
      zombieGroup.remove(z.mesh);
      S.zombies.splice(i, 1);
      updateTopHUD();
      if (S.hp <= 0) {
        triggerDefeat();
        return;
      }
      continue;
    }

    // 2. Check if a blocking Critter or Wall is directly in front of the zombie
    let blocker = null;
    if (!z.def.flying) {
      let bestBlockDist = 0.72;
      for (const u of S.units) {
        if (u.isTrap) continue;
        const dUnit = Math.hypot(u.gx - z.gx, u.gz - z.gz);
        if (dUnit < bestBlockDist) {
          bestBlockDist = dUnit;
          blocker = u;
        }
      }
    }

    if (blocker) {
      // Creeper deals single-target front burst to the blocker only (never wipes surrounding towers!)
      if (z.def.frontBurstDmg) {
        const resist = blocker.def.blastResist || 0;
        blocker.hp -= z.def.frontBurstDmg * (1 - resist);
        if (blocker.hp <= 0) removeUnit(blocker);
        spawnBurst(z.x, z.y + 0.4, z.z, 0xff922b, 6);
        zombieGroup.remove(z.mesh);
        S.zombies.splice(i, 1);
        continue;
      }

      z.atkTimer += dt;
      if (z.mesh.userData.armL) {
        z.mesh.userData.armL.rotation.z = Math.sin(z.walkPhase * 2) * 0.55;
        z.mesh.userData.armR.rotation.z = -Math.sin(z.walkPhase * 2) * 0.55;
      }
      if (z.atkTimer >= 0.80) {
        z.atkTimer = 0;
        const wallMult = z.def.wallBreaker ? 1.8 : 1.0;
        blocker.hp -= (z.def.dps || 15) * wallMult;

        if (blocker.def.thornsDmg) {
          z.hp -= blocker.def.thornsDmg;
          z.mesh.userData.updateHearts(z.hp, z.maxHp, z.armor);
        }
        if (blocker.hp <= 0) {
          if (blocker.def.deathBlastDmg) {
            for (const zz of S.zombies) {
              if (Math.hypot(zz.gx - blocker.gx, zz.gz - blocker.gz) <= 1.8) {
                zz.hp -= blocker.def.deathBlastDmg;
                zz.mesh.userData.updateHearts(zz.hp, zz.maxHp, zz.armor);
              }
            }
          }
          removeUnit(blocker);
        }
      }
    } else {
      // 3. Follow Winding Cobblestone Road Waypoints toward the 3D Moon Sanctuary Castle!
      let targetWorldX = sancX;
      let targetWorldZ = sancZ;
      if (!z.def.flying && z.route && z.wpIndex < z.route.length) {
        const [wpGx, wpGz] = z.route[z.wpIndex];
        const wpWorld = gridToWorld(wpGx, wpGz);
        if (Math.hypot(wpWorld.x - z.x, wpWorld.z - z.z) <= 0.28) {
          z.wpIndex++;
        } else {
          targetWorldX = wpWorld.x;
          targetWorldZ = wpWorld.z;
        }
      }

      const slowMult = z.slowTimer > 0 ? 0.5 : 1.0;
      const dx = targetWorldX - z.x;
      const dz = targetWorldZ - z.z;
      const d = Math.hypot(dx, dz) || 1;
      const move = z.speed * slowMult * dt;

      z.x += (dx / d) * move;
      z.z += (dz / d) * move;
      z.gx = (z.x / 1.0) + (S.cols - 1) / 2;
      z.gz = (z.z / 1.0) + (S.rows - 1) / 2;
      z.mesh.position.x = z.x;
      z.mesh.position.z = z.z;
      z.mesh.rotation.y = Math.atan2(dz, -dx);
    }
  }

  // Update Collectible Orbs (auto-collect after 2.4s)
  for (let i = S.orbs.length - 1; i >= 0; i--) {
    const o = S.orbs[i];
    o.age += dt;
    o.mesh.rotation.y += dt * 3.2;
    o.mesh.position.y = 0.68 + Math.sin(o.age * 5) * 0.14;
    if (o.age >= 2.4) {
      collectOrb(o);
    }
  }

  // Update Particles
  for (let i = S.particles.length - 1; i >= 0; i--) {
    const pt = S.particles[i];
    pt.life -= dt;
    if (pt.life <= 0) {
      fxGroup.remove(pt.mesh);
      S.particles.splice(i, 1);
    } else {
      pt.vy -= (pt.gravity ?? 7.5) * dt;
      pt.mesh.position.x += pt.vx * dt;
      pt.mesh.position.y += pt.vy * dt;
      pt.mesh.position.z += pt.vz * dt;
    }
  }
}

function applyProjectileHit(p, target) {
  const hitZombie = (z, dmg) => {
    if (p.meltsArmor && z.armor > 0) {
      z.armor = Math.max(0, z.armor * 0.3);
    }
    if (p.marksTarget) {
      z.markTimer = 4.0;
    }
    let finalDmg = dmg * (1 - (z.armor || 0));
    if (z.markTimer > 0) finalDmg *= 1.35;
    if ((z.def.flying || z.def.frontBurstDmg) && p.flyerBonus > 1) {
      finalDmg *= p.flyerBonus;
    }
    z.hp -= finalDmg;
    if (p.knockback > 0) {
      const dx = z.x - S.sanctuaryWorld.x;
      const dz = z.z - S.sanctuaryWorld.z;
      const d = Math.hypot(dx, dz) || 1;
      z.x += (dx / d) * p.knockback * 0.32;
      z.z += (dz / d) * p.knockback * 0.32;
      z.gx = (z.x / 1.0) + (S.cols - 1) / 2;
      z.gz = (z.z / 1.0) + (S.rows - 1) / 2;
      z.mesh.position.x = z.x;
      z.mesh.position.z = z.z;
    }
    z.mesh.userData.updateHearts(z.hp, z.maxHp, z.armor);
  };

  hitZombie(target, p.dmg);
  spawnBurst(target.x, target.y + 0.4, target.z, p.color, 3);

  if (p.splash > 0) {
    for (const z of S.zombies) {
      if (z !== target && Math.hypot(z.x - target.x, z.z - target.z) <= p.splash) {
        hitZombie(z, p.dmg * 0.75);
      }
    }
  }

  if (p.chainCount > 0) {
    let chained = 0;
    for (const z of S.zombies) {
      if (z !== target && chained < p.chainCount && Math.hypot(z.x - target.x, z.z - target.z) <= 3.0) {
        hitZombie(z, p.dmg * 0.80);
        chained++;
      }
    }
  }
}

// ============================================================================
// POINTER, CAMERA ORBIT & BUTTON INTERACTIONS (ZERO DEAD ANGLES!)
// ============================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isOrbitDragging = false;
let orbitLastX = 0;

function updatePointerRay(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
}

canvas.addEventListener('contextmenu', e => e.preventDefault());

canvas.addEventListener('pointermove', e => {
  if (S.phase !== 'playing') return;
  if (isOrbitDragging) {
    const dx = e.clientX - orbitLastX;
    orbitLastX = e.clientX;
    S.camYaw = Math.max(-0.65, Math.min(0.65, S.camYaw - dx * 0.005));
    updateCameraFraming();
    return;
  }
  updatePointerRay(e);
  const hits = raycaster.intersectObjects(tilePickMeshes, false);
  if (hits.length > 0) {
    const { gx, gz } = hits[0].object.userData;
    const t = tiles[gx]?.[gz];
    if (t) {
      const wp = gridToWorld(gx, gz);
      cursorMesh.position.set(wp.x, t.height + 0.08, wp.z);
      cursorMesh.visible = true;
    }
  } else {
    cursorMesh.visible = false;
  }
});

window.addEventListener('pointerup', () => {
  isOrbitDragging = false;
});

window.addEventListener('keydown', e => {
  if (S.phase !== 'playing') return;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    S.camYaw = Math.max(-0.65, S.camYaw - 0.12);
    updateCameraFraming();
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    S.camYaw = Math.min(0.65, S.camYaw + 0.12);
    updateCameraFraming();
  }
});

canvas.addEventListener('pointerdown', e => {
  if (S.phase === 'cutscene') return;
  if (e.button === 2) {
    isOrbitDragging = true;
    orbitLastX = e.clientX;
    return;
  }
  updatePointerRay(e);

  for (const o of S.orbs) {
    if (raycaster.intersectObject(o.mesh, true).length > 0) {
      collectOrb(o);
      return;
    }
  }

  const hits = raycaster.intersectObjects(tilePickMeshes, false);
  if (hits.length > 0) {
    const { gx, gz } = hits[0].object.userData;
    placeUnitOnTile(gx, gz, S.selectedTool, false);
  }
});

// Top HUD & Modal Buttons
document.getElementById('skipCineBtn').addEventListener('click', () => {
  sound.click();
  finishCutscene();
});

document.getElementById('replayCineBtn').addEventListener('click', () => {
  sound.click();
  startOpeningCutscene();
});

document.getElementById('pauseBtn').addEventListener('click', e => {
  sound.click();
  S.paused = !S.paused;
  e.currentTarget.innerHTML = S.paused ? UI_SVGS.ctrl_play : UI_SVGS.ctrl_pause;
});

document.getElementById('camZoomBtn').addEventListener('click', e => {
  sound.click();
  S.camMode = (S.camMode + 1) % 3;
  S.zoomOut = S.camMode === 1;
  S.camYaw = 0;
  e.currentTarget.classList.toggle('active', S.camMode > 0);
  updateCameraFraming();
});

document.getElementById('waveBtn').addEventListener('click', () => {
  sound.click();
  if (S.phase === 'cutscene') finishCutscene();
  triggerNextWave();
});

document.getElementById('sandboxBtn').addEventListener('click', e => {
  sound.click();
  S.sandbox = !S.sandbox;
  e.currentTarget.classList.toggle('active', S.sandbox);
  showBubble(S.sandbox ? '🧱 ∞ ✨' : '🧱 🎯', 1.3);
  updateTopHUD();
});

document.getElementById('craftMoonBtn').addEventListener('click', () => {
  sound.click();
  forgeMoonAtSanctuary();
});

document.getElementById('musicBtn').addEventListener('click', e => {
  const on = sound.toggleMusic();
  e.currentTarget.classList.toggle('active', on);
});

document.getElementById('sfxBtn').addEventListener('click', e => {
  const on = sound.toggleSfx();
  e.currentTarget.classList.toggle('active', on);
});

// 5-Stage Map Selector Buttons
document.querySelectorAll('.stage-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    sound.click();
    const idx = Number(btn.dataset.stage);
    S.res = { ...INITIAL_RESOURCES };
    S.moonShards = 0;
    S.wave = 1;
    S.phase = 'playing';
    buildStageWorld(idx);
    showBubble(`${btn.textContent} 🏰🌕 ✨`, 1.4);
  });
});

// Victory / Defeat Modal Buttons
document.getElementById('nextStageBtn').addEventListener('click', () => {
  sound.click();
  document.getElementById('victoryModal').classList.add('hidden');
  const nextIdx = S.phase === 'defeat' ? S.stageIndex : (S.stageIndex + 1) % STAGES.length;
  S.res = { ...INITIAL_RESOURCES };
  S.moonShards = 0;
  S.wave = 1;
  S.phase = 'playing';
  buildStageWorld(nextIdx);
});

document.getElementById('continueBtn').addEventListener('click', () => {
  sound.click();
  document.getElementById('victoryModal').classList.add('hidden');
  if (S.hp <= 0) S.hp = S.maxHp;
  S.phase = 'playing';
  updateTopHUD();
});

document.getElementById('restartBtn').addEventListener('click', () => {
  sound.click();
  document.getElementById('victoryModal').classList.add('hidden');
  S.res = { ...INITIAL_RESOURCES };
  S.moonShards = 0;
  S.wave = 1;
  buildStageWorld(S.stageIndex);
  startOpeningCutscene();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================================
// INITIALIZE STAGE 1 + START HIGH-RES 10S OPENING CUTSCENE
// ============================================================================
buildStageWorld(0);
startOpeningCutscene();

let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (bubbleTimer > 0) {
    bubbleTimer -= dt;
    if (bubbleTimer <= 0) bubbleEl.classList.add('hidden');
  }

  if (S.phase === 'cutscene') {
    updateOpeningCutscene(dt);
  } else if (S.phase === 'playing') {
    updateGameplay(dt);
  }

  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// Expose automated verification hooks for headless PRM testing
window.__MOONCRAFT__ = {
  S,
  STAGES,
  CRITTER_UNITS,
  ZOMBIE_TYPES,
  cineGroup,
  tileGroup,
  placeUnitOnTile,
  tryUpgradeUnit,
  forgeMoonAtSanctuary,
  spawnZombie,
  finishCutscene,
  startOpeningCutscene,
  buildStageWorld,
  addMoonShards,
  advanceCutscene(sec) {
    const steps = Math.ceil(sec / 0.04);
    for (let i = 0; i < steps; i++) {
      if (S.phase === 'cutscene') updateOpeningCutscene(0.04);
    }
    renderer.render(scene, camera);
  },
  stepSim(sec) {
    const steps = Math.ceil(sec / 0.04);
    for (let i = 0; i < steps; i++) {
      updateGameplay(0.04);
    }
    renderer.render(scene, camera);
  }
};
