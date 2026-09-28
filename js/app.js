const THREE = window.THREE;
import {
  INITIAL_RESOURCES,
  UNITS,
  ZOMBIE_TYPES,
  STAGES,
  getStageConfig,
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
  buildVoxelZombie
} from './voxel_models.js';
import { sound } from './audio.js';

// Enrich Critter units with pure visual role & effect badges + 4 Minecraft Terraform/Reclaim tools
const ROLE_ICONS = {
  sunnyfox:   { roleIcon: '⛏️', fxIcon: '☀️' },
  poppydash:  { roleIcon: '⛏️', fxIcon: '🪵' },
  picky:      { roleIcon: '⛏️', fxIcon: '🪨' },
  bubba:      { roleIcon: '🛡️', fxIcon: '💎' },
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
    id: 'bridge',
    tier: 0,
    role: 'terraform',
    emoji: '🌉',
    roleIcon: '🧰',
    fxIcon: '🌊',
    color: '#bc6c25',
    accent: '#dda15e',
    cost: { sun: 10, wood: 10, stone: 0, crystal: 0 }
  },
  {
    id: 'cliff_block',
    tier: 0,
    role: 'terraform',
    emoji: '⛰️',
    roleIcon: '🧰',
    fxIcon: '🔼',
    color: '#adb5bd',
    accent: '#dee2e6',
    cost: { sun: 10, wood: 0, stone: 15, crystal: 0 }
  },
  {
    id: 'spike_trap',
    tier: 0,
    role: 'terraform',
    emoji: '⚙️',
    roleIcon: '🧰',
    fxIcon: '💥',
    color: '#ced4da',
    accent: '#ff6b6b',
    cost: { sun: 10, wood: 5, stone: 10, crystal: 0 },
    hp: 240,
    dmg: 28
  },
  {
    id: 'shovel',
    tier: 0,
    role: 'tool',
    emoji: '⛏️',
    roleIcon: '♻️',
    fxIcon: '☀️',
    color: '#ffd166',
    accent: '#ffffff',
    cost: { sun: 0, wood: 0, stone: 0, crystal: 0 }
  }
];

export const ZOMBIE_LIST = Object.values(ZOMBIE_TYPES);

// ============================================================================
// BRIGHT TWILIGHT & SKY SCENE + RENDERER
// ============================================================================
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.24;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2b4c7e);
scene.fog = new THREE.FogExp2(0x2b4c7e, 0.011);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 180);
camera.position.set(0, 15.5, 16.5);
camera.lookAt(0, 0, 0.5);

const hemiLight = new THREE.HemisphereLight(0xd0ebff, 0x3b6998, 1.08);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfff3bf, 1.38);
dirLight.position.set(10, 22, 12);
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
// GAME STATE & 5-STAGE MAP LOADER
// ============================================================================
const S = {
  phase: 'cutscene', // 'cutscene' | 'playing' | 'victory'
  cineTime: 0,
  moonExploded: false,
  paused: false,
  sandbox: false,
  zoomOut: false,
  stageIndex: 0,
  clearedStages: new Set(),
  cols: 16,
  rows: 10,
  stageCfg: null,
  res: { ...INITIAL_RESOURCES },
  hp: 25,
  maxHp: 25,
  moonShards: 0,
  moonGoal: 30,
  wave: 1,
  waveTimer: 7,
  spawnQueue: [],
  spawnCooldown: 0,
  selectedTool: 'sunnyfox',
  units: [],
  zombies: [],
  projectiles: [],
  particles: [],
  orbs: []
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

  for (let gx = 0; gx < S.cols; gx++) {
    tiles[gx] = [];
    for (let gz = 0; gz < S.rows; gz++) {
      const key = `${gx},${gz}`;
      let type = 'grass';
      let height = 0.28;
      const pDir = cfg.getPortalDir(gx, gz);

      if (gx === 0 && !pDir) {
        type = 'sanctuary';
        height = 0.34;
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
      }

      const wpos = gridToWorld(gx, gz);
      const tGroup = new THREE.Group();
      tGroup.position.set(wpos.x, 0, wpos.z);

      const dirt = vox(0.98, 0.28, 0.98, 0x795548, 0, -0.14, 0);
      tGroup.add(dirt);

      let topColor = (gx + gz) % 2 === 0 ? 0x51cf66 : 0x40c057;
      let topOpts = {};
      if (type === 'sanctuary') {
        topColor = (gx + gz) % 2 === 0 ? 0xffe066 : 0xffd43b;
        topOpts = { emissive: 0xf59f00, emissiveIntensity: 0.25 };
      } else if (type === 'corrupted') {
        topColor = (gx + gz) % 2 === 0 ? 0x5f3dc4 : 0x4c2a85;
        topOpts = { emissive: 0x3b096c, emissiveIntensity: 0.32 };
      } else if (type === 'water') {
        topColor = 0x339af0;
        topOpts = { emissive: 0x1c7ed6, emissiveIntensity: 0.35, roughness: 0.18 };
      } else if (type === 'cliff') {
        topColor = 0xadb5bd;
      } else if (type === 'sun') {
        topColor = 0x94d82d;
      } else if (type === 'wood') {
        topColor = 0x2f9e44;
      } else if (type === 'stone') {
        topColor = 0x868e96;
      } else if (type === 'crystal') {
        topColor = 0x7950f2;
      }

      const topBlock = vox(0.96, height, 0.96, topColor, 0, height / 2, 0, topOpts);
      topBlock.userData = { gx, gz };
      tGroup.add(topBlock);
      tilePickMeshes.push(topBlock);

      let nodeMesh = null;
      if (type === 'sun' || type === 'wood' || type === 'stone' || type === 'crystal') {
        nodeMesh = buildResourceNodeMesh(type);
        nodeMesh.position.y = height;
        tGroup.add(nodeMesh);
      }

      if (type === 'sanctuary' && gz % 2 === 1) {
        const lantern = vox(0.24, 0.38, 0.24, 0xffe066, -0.22, height + 0.19, 0, {
          emissive: 0xffb703,
          emissiveIntensity: 0.9
        });
        tGroup.add(lantern);
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
        stackedUnit: null,
        lit: gx <= 5
      };
    }
  }

  // Spawn 3D Portal Arches for active stage portals
  const portalCoords = [];
  if (cfg.portals.includes('E')) {
    portalCoords.push({ gx: S.cols - 1, gz: cfg.midZLow, rotY: 0 });
  }
  if (cfg.portals.includes('W')) {
    portalCoords.push({ gx: 1, gz: cfg.midZLow, rotY: 0 });
  }
  if (cfg.portals.includes('N')) {
    portalCoords.push({ gx: cfg.midXLow, gz: 0, rotY: Math.PI / 2 });
  }
  if (cfg.portals.includes('S')) {
    portalCoords.push({ gx: cfg.midXLow, gz: S.rows - 1, rotY: Math.PI / 2 });
  }

  for (const p of portalCoords) {
    const wp = gridToWorld(p.gx, p.gz);
    const portal = new THREE.Group();
    portal.position.set(wp.x, 0.32, wp.z);
    portal.rotation.y = p.rotY;
    portal.add(vox(0.22, 1.35, 0.22, 0x3b096c, 0, 0.68, -0.42));
    portal.add(vox(0.22, 1.35, 0.22, 0x3b096c, 0, 0.68, 0.42));
    portal.add(vox(0.26, 0.24, 1.12, 0x5f3dc4, 0, 1.38, 0, { emissive: 0x7950f2, emissiveIntensity: 0.6 }));
    portal.add(vox(0.08, 1.12, 0.66, 0xb5179e, 0, 0.65, 0, { emissive: 0xf72585, emissiveIntensity: 0.9, opacity: 0.78 }));
    tileGroup.add(portal);
  }

  // Place Stage Starter Critters
  for (const st of (cfg.starterUnits || [])) {
    placeUnitOnTile(st.gx, st.gz, st.id, true);
  }

  updateCameraFraming();
  updateStageButtons();
  updateTopHUD();
}

function updateCameraFraming() {
  if (S.phase === 'cutscene') return;
  const scaleFactor = Math.max(1, S.cols / 16.5);
  if (S.zoomOut) {
    camera.position.set(0, 18.0 * scaleFactor, 17.0 * scaleFactor);
  } else {
    camera.position.set(0, 14.2 * scaleFactor, 14.5 * scaleFactor);
  }
  camera.lookAt(0, 0, 0.4);
}

// ============================================================================
// 100% ZERO-TEXT UI & HOTBAR RENDERING
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

let bubbleTimer = 0;
function showBubble(iconSequence, dur = 2.0) {
  bubbleEl.textContent = iconSequence;
  bubbleEl.classList.remove('hidden');
  bubbleTimer = dur;
}

function checkAfford(cost = {}) {
  if (S.sandbox) return true;
  return canAffordCost(S.res, cost);
}

function spendCost(cost = {}) {
  if (S.sandbox) return;
  deductCost(S.res, cost);
}

function formatCostPipsHTML(cost = {}) {
  const parts = [];
  if (cost.sun > 0) parts.push(`<span class="cost-pip">☀️${cost.sun}</span>`);
  if (cost.wood > 0) parts.push(`<span class="cost-pip">🪵${cost.wood}</span>`);
  if (cost.stone > 0) parts.push(`<span class="cost-pip">🪨${cost.stone}</span>`);
  if (cost.crystal > 0) parts.push(`<span class="cost-pip">💎${cost.crystal}</span>`);
  if (parts.length === 0) parts.push(`<span class="cost-pip">✨0</span>`);
  return parts.join('');
}

function updateRecipePill(def) {
  if (!def) return;
  const thumbHTML = def.portrait
    ? `<img src="${def.portrait}" alt="" class="recipe-thumb" />`
    : `<span class="recipe-chip">${def.emoji || '🧰'}</span>`;

  let outputIcons = `${def.roleIcon || '✨'} ${def.fxIcon || '✨'}`;
  if (def.prod) {
    const out = [];
    if (def.prod.sun > 0) out.push(`+☀️${def.prod.sun}`);
    if (def.prod.wood > 0) out.push(`+🪵${def.prod.wood}`);
    if (def.prod.stone > 0) out.push(`+🪨${def.prod.stone}`);
    if (def.prod.crystal > 0) out.push(`+💎${def.prod.crystal}`);
    outputIcons += ` <span class="recipe-chip">${out.join(' ')}</span>`;
  } else if (def.atk || def.dmg) {
    outputIcons += ` <span class="recipe-chip">⚔️${def.atk || def.dmg}</span>`;
  } else if (def.hp && def.role === 'defend') {
    outputIcons += ` <span class="recipe-chip">🛡️${def.hp}</span>`;
  }

  unitInfoEl.innerHTML = `
    ${thumbHTML}
    <span class="recipe-arrow">➔</span>
    <span>${outputIcons}</span>
    <span class="recipe-arrow">│</span>
    <span class="cost-row">${formatCostPipsHTML(def.cost)}</span>
  `;
}

function buildHotbar() {
  hotbarEl.innerHTML = '';
  for (const u of CRITTER_UNITS) {
    const card = document.createElement('button');
    card.className = `ucard tier-${u.tier ?? 1}` + (S.selectedTool === u.id ? ' active' : '');
    card.dataset.id = u.id;

    const visual = u.portrait
      ? `<img src="${u.portrait}" alt="" />`
      : `<div class="tool-emoji">${u.emoji || '🧰'}</div>`;

    card.innerHTML = `
      <span class="role-badge">${u.roleIcon || '✨'}</span>
      <span class="fx-badge">${u.fxIcon || '✨'}</span>
      ${visual}
      <div class="cost-row">${formatCostPipsHTML(u.cost)}</div>
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
  const stageNumerals = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
  document.querySelectorAll('.stage-btn').forEach(btn => {
    const idx = Number(btn.dataset.stage);
    btn.classList.toggle('active', idx === S.stageIndex);
    btn.classList.toggle('cleared', S.clearedStages.has(idx));
    btn.textContent = S.clearedStages.has(idx) ? `${stageNumerals[idx]}⭐` : stageNumerals[idx];
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

  document.querySelectorAll('.ucard').forEach(el => {
    const def = CRITTER_UNITS.find(u => u.id === el.dataset.id);
    if (def) {
      el.classList.toggle('locked', !checkAfford(def.cost));
    }
  });
}

// ============================================================================
// 10-SECOND OPENING CUTSCENE DIRECTOR (NON-BLOCKY 3D -> MINECRAFT VOXELS)
// ============================================================================
const cineBannerEl = document.getElementById('cineBanner');
const cineProgressFillEl = document.getElementById('cineProgressFill');
const cineStep1El = document.getElementById('cineStep1');
const cineStep2El = document.getElementById('cineStep2');
const cineStep3El = document.getElementById('cineStep3');

export function startOpeningCutscene() {
  S.phase = 'cutscene';
  S.cineTime = 0;
  S.moonExploded = false;
  document.body.classList.add('inIntro');

  // Hide Minecraft voxel world during the 10s cutscene so ONLY High-Res Non-Blocky 3D is visible!
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
  cineData.cute.scale.setScalar(1);
  cineData.cute.position.set(0, 0, 0);
  cineData.cute.rotation.set(0, 0, 0);

  cineData.night.visible = false;
  cineData.night.scale.setScalar(0.01);
  cineData.night.position.set(0, 0, 0);

  cineData.rocket.visible = false;
  cineData.rocket.position.set(1.35, 0.16, 0);
  cineData.rocket.rotation.set(0, 0, 0.16);
  cineData.flame.visible = false;
  cineData.shardGroup.visible = false;

  cameoCritters.forEach(c => { c.mesh.position.y = -3.5; });
  cameoZombies.forEach(z => { z.mesh.position.y = -3.5; });

  cineBannerEl.classList.remove('hidden');
}

function updateOpeningCutscene(dt) {
  S.cineTime += dt;
  const t = S.cineTime;
  const pct = Math.min(100, (t / 10.0) * 100);
  cineProgressFillEl.style.width = `${pct}%`;

  // Update 3-Step Visual Picture Pill (Zero Text)
  cineStep1El.classList.toggle('active', t < 3.2);
  cineStep2El.classList.toggle('active', t >= 3.2 && t < 6.8);
  cineStep3El.classList.toggle('active', t >= 6.8);

  if (t < 3.2) {
    // Phase 1 (0.0s - 3.2s): High-Res Cute CatNap under the glowing Full Moon
    camera.position.set(Math.sin(t * 0.5) * 1.1, 2.8, 7.6 - t * 0.28);
    camera.lookAt(0.6, 1.8, -0.2);
    cineData.cute.position.y = Math.abs(Math.sin(t * 3.5)) * 0.15;
    cineData.cute.rotation.y = Math.sin(t * 2.2) * 0.24;

    if (t > 2.1) {
      const p = (t - 2.1) / 1.1;
      cineData.cute.rotation.y += dt * 12;
      cineData.cute.scale.setScalar(Math.max(0.1, 1 - p * 0.85));
    }
  } else if (t < 6.8) {
    // Phase 2 (3.2s - 6.8s): High-Res Nightmare CatNap + Sleek Rocket Launch -> Moon Shatters!
    if (cineData.cute.visible) {
      cineData.cute.visible = false;
      cineData.night.visible = true;
      cineData.rocket.visible = true;
      cineData.flame.visible = true;
      sound.roar();
    }
    const p = Math.min(1, (t - 3.2) / 0.7);
    cineData.night.scale.setScalar(p * 1.08);
    cineData.night.rotation.y = Math.sin(t * 3) * 0.16;
    if (cineData.smokeGroup) {
      cineData.smokeGroup.rotation.y += dt * 2.5;
    }

    if (t >= 3.7 && t < 5.75) {
      const rp = (t - 3.7) / 2.05;
      const ease = rp * rp;
      cineData.rocket.position.lerpVectors(
        new THREE.Vector3(1.35, 0.16, 0),
        moonGroup.position,
        ease
      );
      camera.position.set(0.5, 2.8 + rp * 1.5, 8.2);
      camera.lookAt(
        cineData.rocket.position.x * 0.55,
        1.6 + rp * 2.2,
        0
      );
    } else if (t >= 5.75) {
      if (!S.moonExploded) {
        S.moonExploded = true;
        cineData.rocket.visible = false;
        moonGroup.visible = false;
        cineData.shardGroup.visible = true;
        sound.explosion();
      }
      const elapsed = Math.min(3.5, t - 5.75);
      for (let i = 0; i < cineData.shards.length; i++) {
        const sh = cineData.shards[i];
        sh.mesh.position.set(
          sh.vx * elapsed,
          sh.vy * elapsed - 1.5 * elapsed * elapsed,
          sh.vz * elapsed
        );
        sh.mesh.rotation.x += dt * 4;
        sh.mesh.rotation.y += dt * 5;
      }
      const shake = Math.max(0, 1 - (t - 5.75)) * 0.32;
      camera.position.set(
        0.5 + (Math.random() - 0.5) * shake,
        4.2,
        8.6 + (Math.random() - 0.5) * shake
      );
      camera.lookAt(0.8, 3.2, -0.2);
    }
  } else if (t < 10.0) {
    // Phase 3 (6.8s - 10.0s): Smooth High-Res Zombies & Smiling Critters Rise on Storybook Hill
    const p = Math.min(1, (t - 6.8) / 2.2);
    camera.position.lerpVectors(new THREE.Vector3(0.5, 4.2, 8.6), new THREE.Vector3(0, 5.2, 10.2), p);
    camera.lookAt(0, 0.9, -0.4);

    cineData.night.position.y = (t - 6.8) * 0.9;
    cineData.night.scale.setScalar(Math.max(0.01, 1.08 - p * 0.9));

    cameoCritters.forEach((c, idx) => {
      const cp = Math.min(1, Math.max(0, (t - 6.9 - idx * 0.14) / 0.75));
      c.mesh.position.set(c.targetX, -1.2 + cp * 1.15 + Math.abs(Math.sin(t * 5 + c.phase)) * 0.12, c.targetZ);
      c.mesh.rotation.y = 0.42;
    });

    cameoZombies.forEach((z, idx) => {
      const zp = Math.min(1, Math.max(0, (t - 6.9 - idx * 0.14) / 0.75));
      z.mesh.position.set(z.targetX, -1.2 + zp * 1.15 + Math.abs(Math.sin(t * 4.5 + z.phase)) * 0.10, z.targetZ);
      z.mesh.rotation.y = -0.42;
    });
  } else {
    finishCutscene();
  }
}

export function finishCutscene() {
  S.phase = 'playing';
  document.body.classList.remove('inIntro');
  cineGroup.visible = false;
  cineBannerEl.classList.add('hidden');

  // Reveal the Minecraft-style Voxel Battlefield!
  tileGroup.visible = true;
  unitGroup.visible = true;
  zombieGroup.visible = true;
  projGroup.visible = true;
  fxGroup.visible = true;

  moonGroup.position.set(0, 9.2, -11.5);
  setMoonRestoreProgress(S.moonShards / Math.max(1, S.moonGoal));
  updateCameraFraming();
  sound.startMusic();
  showBubble('⛏️☀️🪵🪨💎 ➔ 🛡️⚔️ ➔ 🌕', 3.2);
}

// ============================================================================
// MINECRAFT VOXEL BUILDING, STACKING & TERRAFORMING
// ============================================================================
function spawnBurst(x, y, z, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const m = vox(0.12, 0.12, 0.12, color, x, y, z, { emissive: color, emissiveIntensity: 0.65 });
    fxGroup.add(m);
    S.particles.push({
      mesh: m,
      vx: (Math.random() - 0.5) * 3.8,
      vy: 1.8 + Math.random() * 2.8,
      vz: (Math.random() - 0.5) * 3.8,
      life: 0.48 + Math.random() * 0.25
    });
  }
}

export function placeUnitOnTile(gx, gz, toolId, free = false) {
  if (gx < 0 || gx >= S.cols || gz < 0 || gz >= S.rows) return false;
  const tile = tiles[gx][gz];
  const def = CRITTER_UNITS.find(u => u.id === toolId);
  if (!def) return false;

  // 1. Shovel Reclaim Tool
  if (def.role === 'tool') {
    const target = tile.stackedUnit || tile.unit;
    if (!target) return false;
    if (!S.sandbox) {
      S.res.sun += Math.round((target.def.cost?.sun || 10) * 0.5);
      S.res.wood += Math.round((target.def.cost?.wood || 0) * 0.5);
      S.res.stone += Math.round((target.def.cost?.stone || 0) * 0.5);
      S.res.crystal += Math.round((target.def.cost?.crystal || 0) * 0.5);
    }
    removeUnit(target);
    sound.place();
    showBubble('⛏️ ♻️ ✨', 1.2);
    updateTopHUD();
    return true;
  }

  // 2. Terraform Tools: Bridge, High-Ground Cliff, Spike Trap
  if (def.role === 'terraform') {
    if (!free && !checkAfford(def.cost)) {
      showBubble('☀️🪵🪨 ❌', 1.4);
      return false;
    }
    if (def.id === 'bridge') {
      if (tile.type !== 'water' || tile.hasBridge) {
        showBubble('🌊 ➔ 🌉', 1.4);
        return false;
      }
      if (!free) spendCost(def.cost);
      tile.hasBridge = true;
      tile.height = 0.30;
      const bridgeMesh = vox(0.94, 0.12, 0.94, 0xbc6c25, 0, 0.24, 0);
      tile.group.add(bridgeMesh);
      sound.place();
      updateTopHUD();
      return true;
    }
    if (def.id === 'cliff_block') {
      if (tile.type === 'water' || tile.type === 'cliff' || tile.unit) return false;
      if (!free) spendCost(def.cost);
      tile.type = 'cliff';
      tile.height = 0.62;
      const cliffCap = vox(0.94, 0.32, 0.94, 0xced4da, 0, 0.46, 0);
      tile.group.add(cliffCap);
      sound.place();
      updateTopHUD();
      return true;
    }
    if (def.id === 'spike_trap') {
      if ((tile.type === 'water' && !tile.hasBridge) || tile.unit) return false;
      if (!free) spendCost(def.cost);
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

  // 3. Water check (Bubba is amphibious and can build directly on water!)
  if (tile.type === 'water' && !tile.hasBridge && !def.amphibious) {
    showBubble('🌊 ❌ ➔ 🌉 / 🐘', 1.6);
    return false;
  }

  // 4. Corrupted zombie portal tile check
  if (tile.type === 'corrupted') {
    showBubble('🧟 ❌', 1.4);
    return false;
  }

  // 5. Stacking on Mikey's Watchtower
  let stackingOnTower = false;
  if (tile.unit) {
    if (tile.unit.def.stackable && !tile.stackedUnit && def.role === 'attack') {
      stackingOnTower = true;
    } else {
      showBubble('🧱 ❌', 1.2);
      return false;
    }
  }

  if (!free && !checkAfford(def.cost)) {
    showBubble('☀️🪵🪨💎 ❌', 1.5);
    return false;
  }
  if (!free) spendCost(def.cost);

  const mesh = buildCritterUnitMesh(def, portraitTexMap.get(def.id));
  const wpos = gridToWorld(gx, gz);
  const yBase = stackingOnTower ? tile.height + 0.66 : tile.height;
  mesh.position.set(wpos.x, yBase, wpos.z);
  unitGroup.add(mesh);

  const unitObj = {
    id: def.id,
    def,
    gx,
    gz,
    hp: def.hp,
    maxHp: def.hp,
    mesh,
    timer: Math.random() * 1.2,
    stacked: stackingOnTower,
    onHighGround: stackingOnTower || tile.type === 'cliff',
    onVein: tile.baseType === def.veinBonusNode
  };

  if (stackingOnTower) {
    tile.stackedUnit = unitObj;
    showBubble('🗼 ➕ ⚔️ ✨', 1.6);
  } else {
    tile.unit = unitObj;
  }

  S.units.push(unitObj);
  spawnBurst(wpos.x, yBase + 0.4, wpos.z, def.accent, 10);
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
      }
    }
  }
}

// ============================================================================
// ZOMBIE SPAWNING (MULTI-PORTAL) & WAVE SYSTEM
// ============================================================================
export function spawnZombie(typeId, customPos = null) {
  const def = ZOMBIE_TYPES[typeId] || ZOMBIE_TYPES.walker;
  const mesh = buildVoxelZombie(def);

  let gz = Math.floor(Math.random() * S.rows);
  let gx = S.cols - 0.6;

  if (customPos) {
    gx = customPos.gx;
    gz = customPos.gz;
  } else {
    const portals = S.stageCfg?.portals || ['E'];
    const dir = portals[Math.floor(Math.random() * portals.length)];
    if (dir === 'E') {
      gx = S.cols - 0.6;
      gz = Math.floor(Math.random() * S.rows);
    } else if (dir === 'W') {
      gx = 1.2;
      gz = Math.random() < 0.5 ? 1 : S.rows - 2;
    } else if (dir === 'N') {
      gx = Math.floor(S.cols * 0.55) + (Math.random() - 0.5) * 2;
      gz = 0.2;
    } else if (dir === 'S') {
      gx = Math.floor(S.cols * 0.55) + (Math.random() - 0.5) * 2;
      gz = S.rows - 1.2;
    }
  }

  const wpos = gridToWorld(gx, gz);
  const yPos = def.flying ? 1.18 : 0.30;
  mesh.position.set(wpos.x, yPos, wpos.z);
  zombieGroup.add(mesh);

  const hpScale = 1 + (S.wave - 1) * 0.08 + S.stageIndex * 0.06;
  const maxHp = Math.round(def.hp * hpScale);

  const zObj = {
    def,
    mesh,
    gx,
    gz,
    x: wpos.x,
    y: yPos,
    z: wpos.z,
    hp: maxHp,
    maxHp,
    armor: def.armor || 0,
    speed: def.speed,
    atkTimer: 0,
    specialTimer: 2.5,
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
  const count = Math.min(14, 3 + S.wave + S.stageIndex);

  for (let i = 0; i < count; i++) {
    const zType = (S.wave % 3 === 0 && i === count - 1 && pool.includes('nightmare_boss'))
      ? 'nightmare_boss'
      : pool[(S.wave + i) % pool.length];
    S.spawnQueue.push(zType);
  }
  const waveIcons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  const wIco = waveIcons[(S.wave - 1) % waveIcons.length] || '🔥';
  showBubble(`🧟⚡ ${wIco}`, 2.0);
  S.wave++;
  S.waveTimer = (S.stageCfg?.baseSpawnInterval || 4.2) * 3.2 * (bal.spawnIntervalMult || 1.0);
}

// ============================================================================
// COLLECTIBLE ORBS & MOON SHARDS
// ============================================================================
function spawnCollectibleOrb(x, z, kind = 'sun', amount = 12) {
  const colorMap = {
    sun: 0xffe066,
    wood: 0x51cf66,
    stone: 0x74c0fc,
    crystal: 0xda77f2,
    moon: 0xfff3bf
  };
  const col = colorMap[kind] || 0xffe066;
  const mesh = vox(0.28, 0.28, 0.28, col, x, 0.75, z, { emissive: col, emissiveIntensity: 0.9 });
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

  // Sky brightens from twilight blue (#2b4c7e) to cheerful sky blue (#5c9ce6) as Moon is restored!
  const bg = new THREE.Color(0x2b4c7e).lerp(new THREE.Color(0x5c9ce6), progress);
  scene.background.copy(bg);
  scene.fog.color.copy(bg);

  updateTopHUD();

  if (S.moonShards >= S.moonGoal) {
    S.phase = 'victory';
    S.clearedStages.add(S.stageIndex);
    updateStageButtons();
    sound.victory();
    const stageNums = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    const curIco = stageNums[S.stageIndex] || '1️⃣';
    const nextIco = stageNums[Math.min(STAGES.length - 1, S.stageIndex + 1)] || '🏆';
    document.getElementById('modalStageBadge').textContent =
      S.stageIndex < STAGES.length - 1 ? `${curIco} ⭐ ➔ ${nextIco}` : `${curIco} 🏆 🌕`;
    document.getElementById('victoryModal').classList.remove('hidden');
  }
}

// ============================================================================
// MAIN SIMULATION LOOP (4-RESOURCE PRODUCTION, COMBAT, 8 ZOMBIE AI BEHAVIORS)
// ============================================================================
function updateGameplay(dt) {
  if (S.paused) return;

  // Passive solar trickle
  S.res.sun += 2.2 * dt;

  // Wave timer & spawn queue
  S.waveTimer -= dt;
  if (S.waveTimer <= 0) triggerNextWave();

  if (S.spawnQueue.length > 0) {
    S.spawnCooldown -= dt;
    if (S.spawnCooldown <= 0) {
      spawnZombie(S.spawnQueue.shift());
      S.spawnCooldown = 0.85;
    }
  }

  // Update Units
  for (let i = S.units.length - 1; i >= 0; i--) {
    const u = S.units[i];
    const wpos = gridToWorld(u.gx, u.gz);
    const tile = tiles[u.gx]?.[u.gz];

    if (u.mesh.userData.head) {
      u.mesh.userData.head.rotation.y = Math.sin(performance.now() * 0.003 + u.gx) * 0.16;
    }
    if (u.mesh.userData.rotor) {
      u.mesh.userData.rotor.rotation.z += dt * 4.5;
    }

    // Check PoppyDash haste aura (+30% speed)
    let haste = 1.0;
    for (const ally of S.units) {
      if (ally.def.hasteRadius && Math.hypot(ally.gx - u.gx, ally.gz - u.gz) <= ally.def.hasteRadius) {
        haste = ally.def.hasteMult || 1.3;
        break;
      }
    }
    u.timer += dt * haste;

    // 1. Spike Trap damage
    if (u.isTrap) {
      for (const z of S.zombies) {
        if (!z.def.flying && Math.hypot(z.x - wpos.x, z.z - wpos.z) < 0.55) {
          z.hp -= u.def.dmg * dt;
          z.mesh.userData.updateHearts(z.hp, z.maxHp, z.armor);
        }
      }
      continue;
    }

    // 2. 4-Resource Production (SunnyFox, PoppyDash, PickyPiggy, Bubba)
    if (u.def.prod && u.timer >= (u.def.prodInterval || 4.0)) {
      u.timer = 0;
      const p = u.def.prod;
      if (p.sun > 0) {
        const mult = tile?.baseType === 'sun' ? (u.def.veinMult || 1.6) : 1;
        S.res.sun += p.sun * mult;
        spawnBurst(wpos.x, 0.9, wpos.z, 0xffe066, 5);
      }
      if (p.wood > 0) {
        const mult = tile?.baseType === 'wood' ? (u.def.veinMult || 2.0) : 1;
        S.res.wood += p.wood * mult;
        spawnBurst(wpos.x, 0.9, wpos.z, 0x51cf66, 5);
      }
      if (p.stone > 0) {
        const mult = tile?.baseType === 'stone' ? (u.def.veinMult || 2.0) : 1;
        S.res.stone += p.stone * mult;
        spawnBurst(wpos.x, 0.9, wpos.z, 0x74c0fc, 5);
      }
      if (p.crystal > 0) {
        const mult = (tile?.baseType === 'crystal' || tile?.baseType === 'water') ? (u.def.veinMult || 2.0) : 1;
        S.res.crystal += p.crystal * mult;
        spawnBurst(wpos.x, 0.9, wpos.z, 0xda77f2, 5);
      }
      updateTopHUD();
    }

    // 3. PickyPiggy Healing Aura (+18 HP/s)
    if (u.def.healRadius) {
      for (const ally of S.units) {
        if (ally.hp < ally.maxHp && Math.hypot(ally.gx - u.gx, ally.gz - u.gz) <= u.def.healRadius) {
          ally.hp = Math.min(ally.maxHp, ally.hp + (u.def.healPerSec || 18) * dt);
        }
      }
    }

    // 4. Bubba Cryo Slow Dome (50% slow)
    if (u.def.slowRadius) {
      for (const z of S.zombies) {
        if (Math.hypot(z.gx - u.gx, z.gz - u.gz) <= u.def.slowRadius) {
          z.slowTimer = 0.6;
        }
      }
    }

    // 5. CraftyCorn Moon Shard Weaving (+2 🌕 every 5.5s)
    if (u.def.shardWeaver) {
      u.moonTimer = (u.moonTimer || 0) + dt;
      if (u.moonTimer >= (u.def.shardInterval || 5.5)) {
        u.moonTimer = 0;
        addMoonShards(u.def.shardYield || 2);
        spawnBurst(wpos.x, 1.1, wpos.z, 0xfff3bf, 8);
      }
    }

    // 6. Ranged / Area Attackers (LunaBat, DogDay, CraftyCorn, KickinChicken)
    if (u.def.role === 'attack' && u.timer >= (u.def.fireInterval || 1.1)) {
      const rangeBonus = u.stacked ? 1.45 : (u.onHighGround ? 1.25 : 1.0);
      const dmgBonus = u.stacked ? 1.30 : (u.onHighGround ? 1.15 : 1.0);
      const effRange = (u.def.range || 4.5) * rangeBonus;
      const canHitAir = u.def.antiAir || u.stacked;

      let target = null;
      let bestDist = Infinity;
      for (const z of S.zombies) {
        if (z.def.flying && !canHitAir) continue;
        const d = Math.hypot(z.gx - u.gx, z.gz - u.gz);
        if (d <= effRange && d < bestDist) {
          bestDist = d;
          target = z;
        }
      }

      if (target) {
        u.timer = 0;
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
          dmg: (u.def.atk || 34) * dmgBonus,
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
    const step = 11.5 * dt;

    if (dist <= step + 0.2) {
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

  // Update Zombies (8 Distinct Archetype Mechanics)
  const leftEdgeX = gridToWorld(0, 0).x - 0.35;
  for (let i = S.zombies.length - 1; i >= 0; i--) {
    const z = S.zombies[i];

    if (z.hp <= 0) {
      spawnBurst(z.x, z.y + 0.4, z.z, z.def.skinColor || '#69db7c', 12);
      const rw = z.def.reward || {};
      addMoonShards(rw.shard > 0 ? rw.shard : 1);
      if (rw.sun) S.res.sun += rw.sun;
      if (rw.wood) S.res.wood += rw.wood;
      if (rw.stone) S.res.stone += rw.stone;
      if (rw.crystal) S.res.crystal += rw.crystal;
      if (Math.random() < 0.45) {
        const kinds = ['sun', 'wood', 'stone', 'crystal'];
        const k = kinds[Math.floor(Math.random() * kinds.length)];
        spawnCollectibleOrb(z.x, z.z, k, k === 'sun' ? 10 : 5);
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
      const pulse = 1 + Math.sin(z.walkPhase * 2.5) * 0.12;
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

    // Necromancer / Shaman Special: Heal nearby zombies + summon runner
    if (z.def.healPerSec) {
      for (const other of S.zombies) {
        if (other.hp < other.maxHp && Math.hypot(other.gx - z.gx, other.gz - z.gz) <= (z.def.healRadius || 3.0)) {
          other.hp = Math.min(other.maxHp, other.hp + z.def.healPerSec * dt);
          other.mesh.userData.updateHearts(other.hp, other.maxHp, other.armor);
        }
      }
      z.specialTimer -= dt;
      if (z.specialTimer <= 0 && S.zombies.length < 28) {
        z.specialTimer = z.def.summonInterval || 7.5;
        spawnZombie('runner', { gx: Math.min(S.cols - 1, z.gx + 0.4), gz: z.gz });
        spawnBurst(z.x, z.y + 0.6, z.z, 0x51cf66, 8);
      }
    }

    if (z.slowTimer > 0) z.slowTimer -= dt;
    if (z.markTimer > 0) z.markTimer -= dt;

    // Check blocking unit in front of zombie
    let blocker = null;
    if (!z.def.flying) {
      for (const u of S.units) {
        if (u.isTrap) continue;
        if (Math.abs(u.gz - z.gz) < 0.55 && Math.abs(u.gx - z.gx) < 0.62) {
          blocker = u;
          break;
        }
      }
    }

    if (blocker) {
      // TNT Creeper explodes immediately on contact!
      if (z.def.explosiveDmg) {
        sound.explosion();
        spawnBurst(z.x, z.y + 0.5, z.z, 0xff2a2a, 20);
        for (let ui = S.units.length - 1; ui >= 0; ui--) {
          const u = S.units[ui];
          if (Math.hypot(u.gx - z.gx, u.gz - z.gz) <= (z.def.explosiveRadius || 1.85)) {
            const resist = u.def.blastResist || 0;
            u.hp -= z.def.explosiveDmg * (1 - resist);
            if (u.hp <= 0) removeUnit(u);
          }
        }
        zombieGroup.remove(z.mesh);
        S.zombies.splice(i, 1);
        continue;
      }

      z.atkTimer += dt;
      if (z.atkTimer >= 0.85) {
        z.atkTimer = 0;
        const wallMult = z.def.wallBreaker ? 2.5 : 1.0;
        blocker.hp -= (z.def.dps || 18) * wallMult;
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
      // Move toward Critter Sanctuary (gx = 0)
      const slowMult = z.slowTimer > 0 ? 0.5 : 1.0;
      const targetW = gridToWorld(0, Math.min(S.rows - 1, Math.max(0, Math.round(z.gz))));
      const dx = targetW.x - z.x;
      const dz = targetW.z - z.z;
      const d = Math.hypot(dx, dz) || 1;
      const move = z.speed * slowMult * dt;
      z.x += (dx / d) * move;
      z.z += (dz / d) * move * 0.35;
      z.gx = (z.x / 1.0) + (S.cols - 1) / 2;
      z.gz = (z.z / 1.0) + (S.rows - 1) / 2;
      z.mesh.position.x = z.x;
      z.mesh.position.z = z.z;

      if (z.x <= leftEdgeX) {
        S.hp = Math.max(1, S.hp - 1);
        showBubble('❤️ -1 ⚠️', 1.2);
        zombieGroup.remove(z.mesh);
        S.zombies.splice(i, 1);
        updateTopHUD();
      }
    }
  }

  // Update Collectible Orbs (auto-collect after 3.2s so pre-readers never miss drops)
  for (let i = S.orbs.length - 1; i >= 0; i--) {
    const o = S.orbs[i];
    o.age += dt;
    o.mesh.rotation.y += dt * 3.2;
    o.mesh.position.y = 0.68 + Math.sin(o.age * 5) * 0.14;
    if (o.age >= 3.2) {
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
      pt.vy -= 9.5 * dt;
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
    if ((z.def.flying || z.def.explosiveDmg) && p.flyerBonus > 1) {
      finalDmg *= p.flyerBonus;
    }
    z.hp -= finalDmg;
    if (p.knockback > 0) {
      z.x += p.knockback * 0.38;
      z.gx = (z.x / 1.0) + (S.cols - 1) / 2;
      z.mesh.position.x = z.x;
    }
    z.mesh.userData.updateHearts(z.hp, z.maxHp, z.armor);
  };

  hitZombie(target, p.dmg);
  spawnBurst(target.x, target.y + 0.4, target.z, p.color, 6);

  if (p.splash > 0) {
    for (const z of S.zombies) {
      if (z !== target && Math.hypot(z.x - target.x, z.z - target.z) <= p.splash) {
        hitZombie(z, p.dmg * 0.7);
      }
    }
  }

  if (p.chainCount > 0) {
    let chained = 0;
    for (const z of S.zombies) {
      if (z !== target && chained < p.chainCount && Math.hypot(z.x - target.x, z.z - target.z) <= 2.6) {
        hitZombie(z, p.dmg * 0.75);
        chained++;
      }
    }
  }
}

// ============================================================================
// POINTER & BUTTON INTERACTIONS
// ============================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updatePointerRay(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
}

canvas.addEventListener('pointermove', e => {
  if (S.phase !== 'playing') return;
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

canvas.addEventListener('pointerdown', e => {
  if (S.phase === 'cutscene') return;
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
  e.currentTarget.textContent = S.paused ? '▶️' : '⏸';
});

document.getElementById('camZoomBtn').addEventListener('click', e => {
  sound.click();
  S.zoomOut = !S.zoomOut;
  e.currentTarget.classList.toggle('active', S.zoomOut);
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
  showBubble(S.sandbox ? '🧱 ∞ ✨' : '🧱 🎯', 1.5);
  updateTopHUD();
});

document.getElementById('craftMoonBtn').addEventListener('click', () => {
  sound.click();
  if (S.sandbox || (S.res.sun >= 30 && S.res.crystal >= 10)) {
    if (!S.sandbox) {
      S.res.sun -= 30;
      S.res.crystal -= 10;
    }
    addMoonShards(5);
    sound.shard();
    showBubble('☀️💎 ➔ +5 🌕', 1.6);
  } else {
    showBubble('☀️30 💎10 ❌', 1.6);
  }
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
    buildStageWorld(idx);
    if (S.phase === 'cutscene') finishCutscene();
    showBubble(`${btn.textContent} 🗺️ ✨`, 1.8);
  });
});

// Victory Modal Buttons
document.getElementById('nextStageBtn').addEventListener('click', () => {
  sound.click();
  document.getElementById('victoryModal').classList.add('hidden');
  const nextIdx = (S.stageIndex + 1) % STAGES.length;
  S.res = { ...INITIAL_RESOURCES };
  S.moonShards = 0;
  S.wave = 1;
  S.phase = 'playing';
  buildStageWorld(nextIdx);
});

document.getElementById('continueBtn').addEventListener('click', () => {
  sound.click();
  document.getElementById('victoryModal').classList.add('hidden');
  S.phase = 'playing';
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
