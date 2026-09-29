const THREE = window.THREE;
import {
  INITIAL_RESOURCES,
  UNITS,
  ZOMBIE_TYPES,
  STAGE_FINAL_BOSSES,
  STAGES,
  UPGRADE_COST,
  getStageConfig,
  getEnemyHeatMultiplier,
  getBuildHeatMultiplier,
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
import {
  initIntroMovieCanvas,
  renderIntroMovieFrame,
  renderVictoryMovieFrame,
  renderGrandFinaleMovieFrame
} from './cutscene_hd.js';
import { sound } from './audio.js';
import { UI_SVGS, miniResSVG } from './ui_icons.js';

// Pure visual role & effect badges for 10 Critters + 2 Tier-4 Apex Buildings + Upgrade Star Tool + Terraform/Reclaim Tools
const ROLE_ICONS = {
  sunnyfox:         { roleIcon: '⛏️', fxIcon: '☀️' },
  poppydash:        { roleIcon: '⛏️', fxIcon: '🪵' },
  picky:            { roleIcon: '⛏️', fxIcon: '🧱' },
  bubba:            { roleIcon: '⛏️', fxIcon: '💎' },
  bobby:            { roleIcon: '🛡️', fxIcon: '🛡️' },
  mikey:            { roleIcon: '🛡️', fxIcon: '🗼' },
  lunabat:          { roleIcon: '⚔️', fxIcon: '🏹' },
  dogday:           { roleIcon: '⚔️', fxIcon: '💥' },
  craftycorn:       { roleIcon: '⚔️', fxIcon: '🌈' },
  kickin:           { roleIcon: '⚔️', fxIcon: '⚡' },
  starlight_cannon: { roleIcon: '🛸', fxIcon: '🛸', toolSvg: UI_SVGS.bld_cannon },
  moon_obelisk:     { roleIcon: '🏛️', fxIcon: '🌕', toolSvg: UI_SVGS.bld_obelisk }
};

export const CRITTER_UNITS = [
  ...UNITS.map(u => ({
    ...u,
    portrait: u.icon || null,
    toolSvg: ROLE_ICONS[u.id]?.toolSvg || null,
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
    cost: { ...UPGRADE_COST }
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
    cost: { sun: 0, wood: 25, stone: 0, crystal: 0, core: 0 }
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
    cost: { sun: 0, wood: 15, stone: 20, crystal: 0, core: 0 },
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
    cost: { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0 }
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
  camPitch: 0,
  camZoom: 1.0,
  camPanX: 0,
  camPanZ: 0,
  stageIndex: 0,
  clearedStages: new Set(),
  cols: 18,
  rows: 12,
  stageCfg: null,
  sanctuaryGx: 2.5,
  sanctuaryGz: 5.5,
  sanctuaryWorld: { x: 0, z: 0 },
  sanctuaryMesh: null,
  sanctuaryShake: 0,
  sanctuaryFireTimer: 0,
  forgeCount: 0,
  heat: 0, // Heat level (0..10): each +1 Heat increases Monster HP & ATK by +20% and Building Material Costs by +20%
  res: { ...INITIAL_RESOURCES },
  hp: 12,
  maxHp: 12,
  moonShards: 0,
  moonGoal: 30,
  totalWaves: 5,
  carryoverStars: 0,
  starBonusMult: 1.0,
  endlessMode: false,
  wave: 0,
  waveTimer: 18.0,
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

export function buildStageWorld(stageIdx, applyStarCarryover = false) {
  S.stageIndex = Math.max(0, Math.min(STAGES.length - 1, stageIdx));
  const cfg = getStageConfig(S.stageIndex);
  S.stageCfg = cfg;
  S.cols = cfg.gridW;
  S.rows = cfg.gridH;
  S.moonGoal = cfg.moonTarget;
  S.totalWaves = 5;
  S.endlessMode = false;
  S.sanctuaryGx = cfg.altarGx;
  S.sanctuaryGz = cfg.altarGz;
  S.sanctuaryWorld = gridToWorld(cfg.altarGx, cfg.altarGz);

  // Apply Star/Moon Carryover Bonus from previous stage clear!
  if (applyStarCarryover && (S.carryoverStars || 0) > 0) {
    const stars = Math.max(0, Math.floor(S.carryoverStars || 0));
    S.starBonusMult = 1 + Math.round(stars * 0.5) / 100; // +1% Critter ATK & Gatherer Yield per 2 Stars!
    S.res.sun = (S.res.sun || 0) + stars * 2;
    S.res.wood = (S.res.wood || 0) + stars * 1;
    S.res.stone = (S.res.stone || 0) + stars * 1;
    const bonusHp = Math.floor(stars / 10);
    S.maxHp = 12 + bonusHp;
    S.hp = S.maxHp;
  } else {
    if (!applyStarCarryover) {
      S.carryoverStars = 0;
      S.starBonusMult = 1.0;
    }
    S.maxHp = 12 + Math.floor((S.carryoverStars || 0) / 10);
    S.hp = S.maxHp;
  }

  S.wave = 0;
  S.waveTimer = 18.0; // Generous 18s opening prep before Wave 1!
  S.spawnCooldown = 0;
  S.forgeCount = 0;
  S.camPanX = 0;
  S.camPanZ = 0;
  S.camYaw = 0;
  S.camPitch = 0;
  S.camZoom = 1.0;
  document.getElementById('victoryModal')?.classList.add('hidden');

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
  islandPedestal.traverse(child => {
    child.raycast = () => {};
  });
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
      dirt.raycast = () => {};
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
        cap.raycast = () => {};
        tGroup.add(cap);
      }

      // Cute Tiny 3D Wildflowers & Grass Tufts on empty meadow tiles
      if (type === 'grass' && ((gx * 7 + gz * 13) % 5 === 0)) {
        const tuft = vox(0.08, 0.11, 0.08, 0x74c69d, -0.26, height + 0.07, -0.24);
        const flCol = (gx + gz) % 3 === 0 ? 0xff8787 : ((gx + gz) % 3 === 1 ? 0xffe066 : 0xe599f7);
        const blossom = vox(0.09, 0.07, 0.09, flCol, 0.26, height + 0.06, 0.24, { emissive: flCol, emissiveIntensity: 0.25 });
        tuft.raycast = () => {};
        blossom.raycast = () => {};
        tGroup.add(tuft, blossom);
      }

      // Glowing starlight cobblestone inlays on road tiles leading to the Moon Sanctuary
      if (type === 'road' && (gx + gz) % 2 === 0) {
        const marker = vox(0.22, 0.045, 0.22, 0xfff3bf, 0, height + 0.035, 0, {
          emissive: 0xffd43b,
          emissiveIntensity: 0.7
        });
        marker.raycast = () => {};
        tGroup.add(marker);
        S.roadMarkers.push({ mesh: marker, gx, gz });
      }

      let nodeMesh = null;
      if (type === 'sun' || type === 'wood' || type === 'stone' || type === 'crystal') {
        nodeMesh = buildResourceNodeMesh(type);
        nodeMesh.position.y = height + 0.02;
        nodeMesh.traverse(child => {
          child.raycast = () => {};
        });
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
        veinCharges: (type === 'sun' || type === 'wood' || type === 'stone' || type === 'crystal') ? 10 : 0,
        hasBridge: false,
        unit: null,
        stackedUnit: null
      };
    }
  }

  // Place the 3D Moon Sanctuary Castle & Rebuild Cradle at (altarGx, altarGz)!
  // Compact 0.84x scale + disabled raycast so adjacent tiles have ZERO visual or click dead angles!
  const sanctuaryMesh = buildMoonSanctuaryMesh();
  sanctuaryMesh.scale.setScalar(0.84);
  sanctuaryMesh.position.set(S.sanctuaryWorld.x, 0.36, S.sanctuaryWorld.z);
  sanctuaryMesh.traverse(child => {
    child.raycast = () => {};
  });
  sanctuaryMesh.userData.updateSanctuary(S.hp, S.maxHp, S.moonShards / Math.max(1, S.moonGoal));
  tileGroup.add(sanctuaryMesh);
  S.sanctuaryMesh = sanctuaryMesh;

  // Spawn 3D Portal Arches at the start of every winding route (raycast disabled so they never block tile clicks!)
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
    portal.traverse(child => {
      child.raycast = () => {};
    });
    tileGroup.add(portal);
  }

  // Place Stage Starter Critters (SunnyFox + PoppyDash Skunk)
  for (const st of (cfg.starterUnits || [])) {
    placeUnitOnTile(st.gx, st.gz, st.id, true);
  }

  updateCameraFraming();
  updateStageButtons();
  updateTopHUD();
}

function updateCameraFraming() {
  if (S.phase === 'cutscene') return;
  const baseScale = Math.max(1.05, Math.max(S.cols / 15.2, S.rows / 9.2));
  const zoomMult = Math.max(0.55, Math.min(1.45, S.camZoom || 1.0));
  const scaleFactor = baseScale * zoomMult;

  let camY = (13.4 + (S.camPitch || 0) * 4.5) * scaleFactor;
  let camDist = (11.8 - (S.camPitch || 0) * 3.0) * scaleFactor;
  if (S.camMode === 1 || S.zoomOut) {
    // High Tactical Overview (zero perspective occlusion)
    camY = 17.0 * scaleFactor;
    camDist = 8.4 * scaleFactor;
  } else if (S.camMode === 2) {
    // Angled Isometric Diorama View
    camY = 12.6 * scaleFactor;
    camDist = 12.4 * scaleFactor;
  }
  const yaw = (S.camYaw || 0) + (S.camMode === 2 ? 0.28 : 0);
  const panX = S.camPanX || 0;
  const panZ = S.camPanZ || 0;

  camera.position.set(
    panX + Math.sin(yaw) * camDist,
    camY,
    panZ + Math.cos(yaw) * camDist
  );
  // Look at panned target so the entire island (including North portals at z=0) sits cleanly between #topBar and #bottomDock!
  camera.lookAt(panX, -0.85, panZ + 0.45);
}

// ============================================================================
// PINTEREST 3D GLOSSY SVG HUD & COLLECTIBLE TOY SHELF RENDERING
// ============================================================================
const sunCountEl = document.getElementById('sunCount');
const woodCountEl = document.getElementById('woodCount');
const stoneCountEl = document.getElementById('stoneCount');
const crystalCountEl = document.getElementById('crystalCount');
const coreCountEl = document.getElementById('coreCount');
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
  setSlot('coreSvgSlot', UI_SVGS.core);
  setSlot('heartSvgSlot', UI_SVGS.heart);
  setSlot('crescentSvgSlot', UI_SVGS.crescentShrine);
  setSlot('forgeSvgSlot', UI_SVGS.forgeMoon);
  setSlot('waveBtn', UI_SVGS.ctrl_wave);
  setSlot('saveGameBtn', UI_SVGS.ctrl_save);
  setSlot('openMenuBtn', UI_SVGS.ctrl_menu);
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

const heatHudCountEl = document.getElementById('heatHudCount');

export function getHeatMultiplier() {
  return getEnemyHeatMultiplier(S.heat);
}

export function getBuildCostHeatMultiplier() {
  return getBuildHeatMultiplier(S.heat);
}

export function getEffectiveUnitCost(def) {
  if (!def) return { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0 };
  const heat = Math.max(0, Number(S.heat) || 0);
  if (def.role === 'tool') {
    return { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0 };
  }
  if (def.role === 'upgrade') {
    return computeUpgradeCost(def, 1, heat);
  }
  if (def.role === 'terraform') {
    return computeDynamicResourceCosts(def, 0, heat);
  }
  const starterCount = (S.stageCfg?.starterUnits || []).filter(s => s.id === def.id).length;
  const activeCopies = S.units.filter(u => u.id === def.id).length;
  const existingCount = Math.max(0, activeCopies - starterCount);
  const cost = computeDynamicResourceCosts(def, existingCount, heat);
  // Anti-softlock safeguard only when the board has 0 units AND bank is critically depleted (< 12 Sun & < 15 Wood)
  if (S.units.length === 0 && (S.res.sun || 0) < 12 && (S.res.wood || 0) < 15) {
    if (existingCount === 0 && def.id === 'sunnyfox') {
      cost.sun = Math.min(cost.sun, Math.max(0, Math.floor(S.res.sun || 0)));
      cost.wood = Math.min(cost.wood, Math.max(0, Math.floor(S.res.wood || 0)));
    } else if (existingCount === 0 && def.id === 'poppydash') {
      cost.sun = Math.min(cost.sun, Math.max(0, Math.floor(S.res.sun || 0)));
    }
  }
  return cost;
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
    ['crystal', cost.crystal || 0],
    ['core', cost.core || 0]
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
  if ((u.cost?.core || 0) > 0) return miniResSVG('core');
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
    const extra = def.shardWeaver ? ` +${def.shardYield || 1}🌕` : '';
    outputIcons = `<span class="recipe-chip">${def.fxIcon || '⚔️'} ${def.atk || def.dmg}${extra}</span>`;
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

    const starCount = Math.max(1, Math.min(4, u.tier || 1));
    const starsStr = '⭐'.repeat(starCount);

    card.innerHTML = `
      <div class="ucard-frame">
        <span class="fx-badge">${getFxBadgeHTML(u)}</span>
        ${visual}
        <span class="ucard-stars">${starsStr}</span>
      </div>
      <div class="cost-row">${formatCostPipsHTML(getEffectiveUnitCost(u), 4)}</div>
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
  sunCountEl.textContent = S.sandbox ? '∞' : Math.floor(S.res.sun || 0);
  woodCountEl.textContent = S.sandbox ? '∞' : Math.floor(S.res.wood || 0);
  stoneCountEl.textContent = S.sandbox ? '∞' : Math.floor(S.res.stone || 0);
  crystalCountEl.textContent = S.sandbox ? '∞' : Math.floor(S.res.crystal || 0);
  if (coreCountEl) {
    coreCountEl.textContent = S.sandbox ? '∞' : Math.floor(S.res.core || 0);
  }
  if (heatHudCountEl) {
    heatHudCountEl.textContent = Math.max(0, Math.floor(S.heat || 0));
  }
  hpCountEl.textContent = S.hp;

  const pct = Math.min(100, (S.moonShards / Math.max(1, S.moonGoal)) * 100);
  moonBarFillEl.style.width = `${pct.toFixed(1)}%`;
  const liveBonusPct = Math.round(((S.starBonusMult || 1) * (1 + (S.moonShards || 0) * 0.005) - 1) * 100);
  moonShardTextEl.textContent = `${S.moonShards}/${S.moonGoal}${liveBonusPct > 0 ? ` (+${liveBonusPct}%)` : ''}`;

  if (S.sanctuaryMesh) {
    S.sanctuaryMesh.userData.updateSanctuary(S.hp, S.maxHp, Math.min(1, S.moonShards / Math.max(1, S.moonGoal)));
  }

  document.querySelectorAll('.ucard').forEach(el => {
    const def = CRITTER_UNITS.find(u => u.id === el.dataset.id);
    if (def) {
      const effCost = getEffectiveUnitCost(def);
      const costRow = el.querySelector('.cost-row');
      if (costRow) costRow.innerHTML = formatCostPipsHTML(effCost, 4);
      let canUse = checkAfford(effCost);
      if (def.role === 'upgrade') {
        canUse = canUse && S.units.some(u => !u.isTrap && (u.level || 1) < 3);
      }
      el.classList.toggle('locked', !canUse);
    }
  });
  updateRecipePill(CRITTER_UNITS.find(u => u.id === S.selectedTool));
}

// ============================================================================
// 10-SECOND OPENING CUTSCENE & 6-SECOND STAGE-CLEAR MOON REPAIR ANIMATION
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
  document.getElementById('mainMenuModal')?.classList.add('hidden');
  document.getElementById('victoryModal')?.classList.add('hidden');
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

  cineStep1El.textContent = '🐱🌙';
  cineStep2El.textContent = '😈🚀🌕';
  cineStep3El.textContent = '💥🧟🐾';
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
  if (S.phase === 'victory_cutscene') {
    finishVictoryCutscene();
    return;
  }
  S.phase = 'playing';
  document.body.classList.remove('inIntro');
  document.getElementById('mainMenuModal')?.classList.add('hidden');
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
  setMoonRestoreProgress(Math.min(1, S.moonShards / Math.max(1, S.moonGoal)));
  updateCameraFraming();
  sound.startMusic();
  showBubble('🧟⛩️ ➔ 🛡️⚔️ ➔ 🌕✨', 1.1);
}

// Stage-Clear Victory Animation (Stages 1–4: 6.0s Moon Repair) & Stage-5 All-Clear Grand Finale (10.0s Mid-Autumn Festival!)
export function startVictoryCutscene(forceGrandFinale = false) {
  S.phase = 'victory_cutscene';
  S.victoryTime = 0;
  S.isGrandFinale = Boolean(forceGrandFinale || S.stageIndex >= STAGES.length - 1);
  S.carryoverStars = Math.max(S.carryoverStars || 0, S.moonShards || 0);
  S.clearedStages.add(S.stageIndex);
  updateStageButtons();
  sound.victory();

  document.getElementById('victoryModal')?.classList.add('hidden');
  document.getElementById('mainMenuModal')?.classList.add('hidden');
  document.body.classList.add('inIntro');

  if (S.isGrandFinale) {
    cineStep1El.textContent = '✨🐱💜';
    cineStep2El.textContent = '🐱🤲🌕';
    cineStep3El.textContent = '🏮🦊🌕🥮';
    cineProgressFillEl.style.width = '0%';
    cineBannerEl.classList.remove('hidden');
    renderGrandFinaleMovieFrame(0);
  } else {
    cineStep1El.textContent = '🛠️🌕';
    cineStep2El.textContent = '✨🦊🦨🐷';
    cineStep3El.textContent = '🎉🌕';
    cineProgressFillEl.style.width = '0%';
    cineBannerEl.classList.remove('hidden');
    renderVictoryMovieFrame(0, S.stageIndex);
  }
}

export function startGrandFinaleCutscene() {
  startVictoryCutscene(true);
}

function updateVictoryCutscene(dt) {
  S.victoryTime = (S.victoryTime || 0) + dt;
  const t = S.victoryTime;

  if (S.isGrandFinale) {
    const duration = 10.0;
    const pct = Math.min(100, (t / duration) * 100);
    cineProgressFillEl.style.width = `${pct}%`;

    cineStep1El.classList.toggle('active', t < 3.4);
    cineStep2El.classList.toggle('active', t >= 3.4 && t < 6.6);
    cineStep3El.classList.toggle('active', t >= 6.6);

    renderGrandFinaleMovieFrame(t);

    if (t >= duration) {
      finishVictoryCutscene();
    }
  } else {
    const duration = 6.0;
    const pct = Math.min(100, (t / duration) * 100);
    cineProgressFillEl.style.width = `${pct}%`;

    cineStep1El.classList.toggle('active', t < 1.8);
    cineStep2El.classList.toggle('active', t >= 1.8 && t < 4.1);
    cineStep3El.classList.toggle('active', t >= 4.1);

    renderVictoryMovieFrame(t, S.stageIndex);

    if (t >= duration) {
      finishVictoryCutscene();
    }
  }
}

export function finishVictoryCutscene() {
  S.phase = 'victory';
  document.body.classList.remove('inIntro');
  cineBannerEl.classList.add('hidden');

  tileGroup.visible = true;
  unitGroup.visible = true;
  zombieGroup.visible = true;
  projGroup.visible = true;
  fxGroup.visible = true;
  setMoonRestoreProgress(1.0);

  const curIco = `${S.stageIndex + 1}`;
  const isFinalStage = Boolean(S.isGrandFinale || S.stageIndex >= STAGES.length - 1);
  const nextIco = !isFinalStage ? `${S.stageIndex + 2}` : '🏆';
  const stars = Math.max(0, Math.floor(S.carryoverStars || S.moonShards || 0));
  const nextBonusPct = Math.round(stars * 0.5);
  const nextSun = stars * 2;
  const nextWood = stars * 1;
  const nextStone = stars * 1;
  const nextHp = Math.floor(stars / 10);

  const starsEl = document.querySelector('.modal-stars');
  if (starsEl) {
    starsEl.textContent = isFinalStage ? '🏮 🌕 🥮' : '⭐ ⭐ ⭐';
  }
  const titleEl = document.getElementById('modalTitleBadge');
  if (titleEl) {
    titleEl.textContent = isFinalStage
      ? '🏮 HAPPY MID-AUTUMN FESTIVAL! · 萌宠提灯笼在月亮上欢度中秋节！'
      : '🌕 CRITTERS REPAIRED THE MOON! · 萌宠补月大成功！';
  }
  const stageBadgeEl = document.getElementById('modalStageBadge');
  if (stageBadgeEl) {
    stageBadgeEl.textContent = !isFinalStage
      ? `STAGE ${curIco} ➔ ${nextIco} · 🌟${stars}星继承: +${nextBonusPct}%攻/产 +☀️${nextSun} +🪵${nextWood} +🧱${nextStone}${nextHp > 0 ? ` +❤️${nextHp}` : ''}`
      : `STAGE ${curIco} 🏆 ALL 5 STAGES CLEAR · 五关全通圆满中秋！`;
  }

  const nextBtn = document.getElementById('nextStageBtn');
  if (nextBtn) {
    nextBtn.textContent = !isFinalStage
      ? '▶️ Next Stage · 下一关'
      : '🌟 Play Again · 重新开始';
  }
  const replayBtn = document.getElementById('replayVictoryAnimBtn');
  if (replayBtn) {
    replayBtn.classList.remove('hidden');
    replayBtn.textContent = isFinalStage
      ? '🏮 Finale Anim · 重播中秋动画'
      : '🎬 Moon Anim · 补月动画';
  }
  const contBtn = document.getElementById('continueBtn');
  if (contBtn) {
    contBtn.textContent = '🏰 Endless · 继续建造';
  }

  document.getElementById('victoryModal').classList.remove('hidden');
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

// Upgrade an existing placed Critter (Lv.1 -> Lv.2 -> Lv.3) — major sink for all 4 resources (+20% per Heat level)!
export function tryUpgradeUnit(u) {
  if (!u || u.isTrap || (u.level || 1) >= 3) {
    showBubble('⭐⭐⭐ ✨', 1.2);
    return false;
  }
  const upCost = computeUpgradeCost(u.def, u.level || 1, S.heat || 0);
  if (!checkAfford(upCost)) {
    showBubble('⬆️⭐ ☀️🪵🧱💎 ❌', 1.5);
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

// Moon Sanctuary Forge: Escalates by +15% per forge (+20% per Heat level) so gathered resources always have a high-value sink!
export function forgeMoonAtSanctuary() {
  if (S.sandbox) {
    addMoonShards(6);
    sound.shard();
    spawnBurst(S.sanctuaryWorld.x, 1.6, S.sanctuaryWorld.z, 0xffd43b, 8);
    showBubble('🏰 ➕6 🌕 ✨', 1.3);
    return true;
  }

  const forgeMult = Math.pow(1.15, S.forgeCount || 0) * getHeatMultiplier();
  // Mode 1: Balanced 4-resource Moon Forge bundle (☀️ 30 + 🪵 25 + 🧱 25 + 💎 8 * 1.15^N * heatMult -> +6 🌕)
  const bundleCost = {
    sun: Math.round(30 * forgeMult),
    wood: Math.round(25 * forgeMult),
    stone: Math.round(25 * forgeMult),
    crystal: Math.round(8 * forgeMult)
  };
  if (checkAfford(bundleCost)) {
    spendCost(bundleCost);
    S.forgeCount = (S.forgeCount || 0) + 1;
    addMoonShards(6);
    sound.shard();
    spawnBurst(S.sanctuaryWorld.x, 1.6, S.sanctuaryWorld.z, 0xffd43b, 8);
    for (const z of S.zombies) {
      if (Math.hypot(z.x - S.sanctuaryWorld.x, z.z - S.sanctuaryWorld.z) <= 3.5) {
        z.hp -= 80;
        z.mesh.userData.updateHearts(z.hp, z.maxHp, z.armor);
      }
    }
    showBubble('☀️🪵🧱💎 ➔ +6 🌕 ✨', 1.4);
    updateTopHUD();
    return true;
  }

  // Mode 2: Surplus-Resource Converter! Spend 45 (* 1.15^N * heatMult) of any single resource -> +4 🌕
  const singleCost = Math.round(45 * Math.pow(1.15, S.forgeCount || 0) * getHeatMultiplier());
  const entries = [
    ['crystal', '💎'],
    ['stone', '🧱'],
    ['wood', '🪵'],
    ['sun', '☀️']
  ].sort((a, b) => (S.res[b[0]] || 0) - (S.res[a[0]] || 0));

  const [bestKey, bestIcon] = entries[0];
  if ((S.res[bestKey] || 0) >= singleCost) {
    S.res[bestKey] -= singleCost;
    S.forgeCount = (S.forgeCount || 0) + 1;
    addMoonShards(4);
    sound.shard();
    spawnBurst(S.sanctuaryWorld.x, 1.6, S.sanctuaryWorld.z, 0xffd43b, 8);
    showBubble(`${bestIcon}${singleCost} ➔ +4 🌕 ✨`, 1.4);
    updateTopHUD();
    return true;
  }

  showBubble(`☀️${bundleCost.sun} 🪵${bundleCost.wood} 🧱${bundleCost.stone} 💎${bundleCost.crystal} ❌`, 1.4);
  return false;
}

export function placeUnitOnTile(gx, gz, toolId, free = false) {
  if (gx < 0 || gx >= S.cols || gz < 0 || gz >= S.rows) return false;
  let tile = tiles[gx][gz];
  const def = CRITTER_UNITS.find(u => u.id === toolId);
  if (!def) return false;

  // If the player clicks on a Sanctuary or Portal tile while holding a buildable Critter,
  // automatically snap to the nearest empty buildable tile within 2.2 tiles so there are ZERO placement dead angles!
  const isBuildableCritter = def.role === 'produce' || def.role === 'defend' || def.role === 'attack';
  if (!free && isBuildableCritter && (tile.type === 'sanctuary' || tile.type === 'corrupted')) {
    let bestTile = null;
    let bestDist = 2.25;
    for (let tx = 0; tx < S.cols; tx++) {
      for (let tz = 0; tz < S.rows; tz++) {
        const cand = tiles[tx]?.[tz];
        if (!cand) continue;
        if (cand.type === 'sanctuary' || cand.type === 'corrupted') continue;
        if (cand.type === 'water' && !cand.hasBridge && !def.amphibious) continue;
        if (cand.unit && !(cand.unit.def.stackable && !cand.stackedUnit && def.id !== 'mikey')) continue;
        const d = Math.hypot(tx - gx, tz - gz);
        if (d < bestDist) {
          bestDist = d;
          bestTile = cand;
        }
      }
    }
    if (bestTile) {
      gx = bestTile.gx;
      gz = bestTile.gz;
      tile = bestTile;
    } else if (tile.type === 'sanctuary') {
      return forgeMoonAtSanctuary();
    }
  } else if (tile.type === 'sanctuary' && !free) {
    return forgeMoonAtSanctuary();
  }

  // 1. Shovel Reclaim Tool — 75% refund scaled by remaining HP% (cannot cheese free heals on dying units!)
  if (def.role === 'tool') {
    const target = tile.stackedUnit || tile.unit;
    if (!target) return false;
    if (!S.sandbox) {
      const hpRatio = Math.max(0, Math.min(1, (target.hp || 1) / Math.max(1, target.maxHp || 1)));
      const refundMult = hpRatio < 0.35 ? 0 : 0.75 * hpRatio;
      S.res.sun += Math.round((target.def.cost?.sun || 0) * refundMult);
      S.res.wood += Math.round((target.def.cost?.wood || 0) * refundMult);
      S.res.stone += Math.round((target.def.cost?.stone || 0) * refundMult);
      S.res.crystal += Math.round((target.def.cost?.crystal || 0) * refundMult);
      S.res.core = (S.res.core || 0) + Math.round((target.def.cost?.core || 0) * refundMult);
    }
    removeUnit(target);
    sound.place();
    showBubble('♻️ ✨', 1.1);
    updateTopHUD();
    return true;
  }

  // 2. Explicit Upgrade Tool (`upgrade_star`) — also snaps to nearest upgradable Critter within 1.45 tiles if clicked slightly off-center!
  if (def.role === 'upgrade') {
    let target = tile.stackedUnit || tile.unit;
    if (!target || target.isTrap) {
      let bestDist = 1.45;
      for (const u of S.units) {
        if (u.isTrap) continue;
        const d = Math.hypot(u.gx - gx, u.gz - gz);
        if (d <= bestDist) {
          bestDist = d;
          target = u;
        }
      }
    }
    if (!target || target.isTrap) {
      showBubble('⬆️⭐ ➔ 🐱', 1.1);
      return false;
    }
    return tryUpgradeUnit(target);
  }

  // 3. Terraform Tools: Bridge & Spike Trap
  if (def.role === 'terraform') {
    const effCost = getEffectiveUnitCost(def);
    if (!free && !checkAfford(effCost)) {
      showBubble('🪵🧱 ❌', 1.2);
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

  // 6. Stacking on Mikey's Watchtower OR Tapping Matching Unit / Upgrade Tool to Upgrade It (`⭐1 -> ⭐2 -> ⭐3`)!
  let stackingOnTower = false;
  if (tile.unit) {
    if (tile.unit.def.stackable && !tile.stackedUnit && def.id !== 'mikey') {
      stackingOnTower = true;
    } else if (!free && (def.id === 'upgrade_star' || tile.unit.id === def.id || tile.stackedUnit?.id === def.id)) {
      return tryUpgradeUnit(tile.stackedUnit || tile.unit);
    } else {
      return false;
    }
  }

  const effCost = getEffectiveUnitCost(def);
  if (!free && !checkAfford(effCost)) {
    showBubble((effCost.core || 0) > 0 ? '🔮☀️🪵🧱💎 ❌' : '☀️🪵🧱💎 ❌', 1.3);
    return false;
  }
  if (!free) spendCost(effCost);

  // If this tile has a 3D resource prop (tree, boulder, sun shrine, crystal), slide it neatly to the back corner so it never clips into the Critter!
  if (tile.nodeMesh && !stackingOnTower) {
    tile.nodeMesh.position.set(-0.29, tile.height + 0.02, -0.29);
    tile.nodeMesh.scale.setScalar(0.55);
  }

  const mesh = buildCritterUnitMesh(def, portraitTexMap.get(def.id));
  mesh.traverse(child => {
    child.userData.gx = gx;
    child.userData.gz = gz;
  });
  const wpos = gridToWorld(gx, gz);
  const yBase = stackingOnTower ? tile.height + 0.66 : tile.height;
  mesh.position.set(wpos.x, yBase, wpos.z);
  unitGroup.add(mesh);

  // Resource Vein check: +75% bonus when placed on OR adjacent (<= 1.5 tiles) to matching Resource Vein (or Water for Bubba)!
  let nearVein =
    tile.baseType === def.veinBonusNode ||
    (def.id === 'bubba' && tile.baseType === 'water');
  if (!nearVein && def.veinBonusNode) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const nt = tiles[gx + dx]?.[gz + dz];
        if (nt && (nt.baseType === def.veinBonusNode || (def.id === 'bubba' && nt.baseType === 'water'))) {
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
    prodTimer: Math.random() * 0.8,
    atkTimer: Math.random() * 0.3,
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

export function removeUnit(u) {
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
  updateTopHUD();
}

// ============================================================================
// ZOMBIE SPAWNING ON WINDING COBBLESTONE ROADS & PROGRESSIVE PVZ-STYLE WAVES
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
    wpIndex = chosenRoute.length;
  }

  const wpos = gridToWorld(gx, gz);
  const yPos = def.flying ? 1.18 : 0.30;
  mesh.position.set(wpos.x, yPos, wpos.z);
  zombieGroup.add(mesh);

  // Gentle +10% HP per wave and +10% per stage, multiplied by +20% per Heat level (1 + 0.20 * S.heat)!
  const waveIdx = Math.max(1, S.wave);
  const baseWaveStageMult = 1 + (waveIdx - 1) * 0.10 + S.stageIndex * 0.10;
  const heatMult = getHeatMultiplier();
  const maxHp = Math.round(def.hp * baseWaveStageMult * heatMult);

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
    baseWaveStageMult,
    heatMult,
    hp: maxHp,
    maxHp,
    dps: Math.round((def.dps || 22) * heatMult),
    rangedAtk: def.rangedAtk ? Math.round(def.rangedAtk * heatMult) : 0,
    frontBurstDmg: def.frontBurstDmg ? Math.round(def.frontBurstDmg * heatMult) : 0,
    splashBurstDmg: def.splashBurstDmg ? Math.round(def.splashBurstDmg * heatMult) : 0,
    poppyAuraDps: def.poppyAuraDps ? Number((def.poppyAuraDps * heatMult).toFixed(2)) : 0,
    armor: def.armor || 0,
    speed: def.speed * (1 + Math.min(0.12, (waveIdx - 1) * 0.015)),
    atkTimer: 0,
    rangedTimer: 0.9,
    specialTimer: 5.5,
    slowTimer: 0,
    markTimer: 0,
    walkPhase: Math.random() * 6.28
  };
  mesh.userData.updateHearts(zObj.hp, zObj.maxHp, zObj.armor);
  S.zombies.push(zObj);
}

function triggerNextWave() {
  const totalW = S.totalWaves || 5;
  if (!S.endlessMode && S.wave >= totalW) {
    showBubble(`👑 Final Wave ${totalW}/${totalW} Active! · 决战第${totalW}波进行中！`, 1.4);
    return;
  }

  // Increment wave FIRST so S.wave (1, 2, 3...) is the exact current wave on the field!
  S.wave++;
  const w = S.wave;

  const bal = computeBalanceState({
    placedUnits: S.units,
    zombies: S.zombies,
    stageIndex: S.stageIndex,
    moonShards: S.moonShards,
    wave: w
  });
  const stagePool = S.stageCfg?.zombiePool || ['walker', 'runner', 'digger', 'bucket', 'creeper', 'iron_golem', 'crystal_behemoth'];

  // PvZ-Style Progressive 5-Wave Gating + Stage-Final Tough Nightmare Critter Boss:
  // Wave 1: ONLY slow walkers (3 zombies) so player can build economy & first towers calmly!
  // Wave 2: Walkers + 1 Runner (4 zombies)
  // Wave 3: Walkers + Runners + Digger + 1 Iron Golem Elite (铁甲巨像 — drops +2 🔮 Star Cores!)
  // Wave 4: Walkers + Buckethead + Iron Golem + Crystal Behemoth (晶簇巨兽 — drops +3 🔮 Star Cores!)
  // Wave 5: Full stage vanguard + Elites + STAGE-FINAL TOUGH NIGHTMARE CRITTER BOSS (Nightmare DogDay / Bobby / Picky / Crafty / CatNap)!
  let count = Math.min(9, 2 + w + Math.floor(S.stageIndex * 0.8));
  if (w === 1) count = 3;
  else if (w === 2) count = 4;

  for (let i = 0; i < count; i++) {
    let zType = 'walker';
    if (w === 1) {
      zType = 'walker';
    } else if (w === 2) {
      zType = i === count - 1 ? 'runner' : 'walker';
    } else if (w === 3) {
      if (i === count - 1) zType = 'iron_golem';
      else if (i === count - 2 && stagePool.includes('digger')) zType = 'digger';
      else if (i % 2 === 1) zType = 'runner';
      else zType = 'walker';
    } else if (w === 4) {
      if (i === count - 1) zType = 'crystal_behemoth';
      else if (i === count - 2) zType = 'iron_golem';
      else if (i === count - 3 && stagePool.includes('bucket')) zType = 'bucket';
      else if (i % 2 === 1) zType = 'runner';
      else zType = 'walker';
    } else {
      zType = stagePool[(w + i) % stagePool.length];
      if (i === count - 1) {
        zType = (w >= 6 || S.stageIndex >= 2) ? 'abyss_dragon' : 'nightmare_boss';
      } else if (i === count - 2) {
        zType = w % 2 === 0 ? 'crystal_behemoth' : 'iron_golem';
      }
    }
    S.spawnQueue.push(zType);
  }

  if (w === totalW) {
    const stageBossId = STAGE_FINAL_BOSSES[S.stageIndex] || 'nightmare_catnap';
    S.spawnQueue.push(stageBossId);
    const bossDef = ZOMBIE_TYPES[stageBossId];
    sound.roar();
    showBubble(`👑 FINAL WAVE ${w}/${totalW}: ${bossDef?.name || 'Nightmare Boss'} · ${bossDef?.cn || '终局梦魇领主'} 降临！`, 2.6);
  } else {
    const eliteAlert = w >= 3 ? ' ⚠️🔮 ELITE!' : '';
    showBubble(`🧟⛩️ Wave ${w}/${totalW}${eliteAlert} ➔ 🌕✨`, 1.5);
  }
  S.waveTimer = 18.0 * (bal.spawnIntervalMult || 1.0);
  updateTopHUD();
  saveGameState(true);
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
    core: 0xf783ac,
    moon: 0xfff3bf
  };
  const col = colorMap[kind] || 0xffe066;
  const sz = kind === 'core' ? 0.34 : 0.26;
  const mesh = vox(sz, sz, sz, col, x, 0.76, z, { emissive: col, emissiveIntensity: 0.95 });
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
    if (orb.kind === 'core') {
      sound.shard();
      showBubble(`🔮 +${orb.amount} Star Core · 星核!`, 1.5);
    } else {
      sound.sun();
    }
    updateTopHUD();
  }
}

// Accumulates Star/Moon energy without ending the stage early!
// Extra stars boost current Critter ATK (+0.5% per star) and carry over as Next-Stage Bonus Effects!
export function addMoonShards(n) {
  if (S.phase === 'victory' || S.phase === 'victory_cutscene' || S.phase === 'defeat') return;
  S.moonShards = Math.max(0, (S.moonShards || 0) + n);
  const progress = Math.min(1, S.moonShards / Math.max(1, S.moonGoal));
  setMoonRestoreProgress(progress);
  updateTopHUD();
}

function triggerDefeat() {
  if (S.phase === 'defeat' || S.phase === 'victory' || S.phase === 'victory_cutscene') return;
  S.phase = 'defeat';
  sound.explosion();
  const curIco = `${S.stageIndex + 1}`;
  const starsEl = document.querySelector('.modal-stars');
  if (starsEl) {
    starsEl.textContent = '💔 🧟 💔';
  }
  const titleEl = document.getElementById('modalTitleBadge');
  if (titleEl) {
    titleEl.textContent = '💔 SANCTUARY BREACHED! · 圣殿失守，请再试一次！';
  }
  const stageBadgeEl = document.getElementById('modalStageBadge');
  if (stageBadgeEl) {
    stageBadgeEl.textContent = `STAGE ${curIco} 💔 ➔ 🔄 · 第 ${curIco} 关重试`;
  }
  const nextBtn = document.getElementById('nextStageBtn');
  if (nextBtn) {
    nextBtn.textContent = '🔄 Retry Stage · 重玩本关';
  }
  const replayBtn = document.getElementById('replayVictoryAnimBtn');
  if (replayBtn) {
    replayBtn.classList.add('hidden');
  }
  const contBtn = document.getElementById('continueBtn');
  if (contBtn) {
    contBtn.textContent = '🛡️ Continue · 原地继续';
  }
  document.getElementById('victoryModal').classList.remove('hidden');
}

// ============================================================================
// MAIN SIMULATION LOOP (PVZ-STYLE WAVE PACING, AUTO-ORBS & GUARDIAN BEAM)
// ============================================================================
function updateGameplay(dt) {
  if (S.paused || S.phase !== 'playing') return;

  // ZERO passive resource trickle — resources ONLY come from Gatherer harvest cycles on Veins!

  // Animate road markers pulsing toward the 3D Moon Sanctuary
  const nowSec = performance.now() * 0.004;
  for (let i = 0; i < S.roadMarkers.length; i++) {
    const rm = S.roadMarkers[i];
    const pulse = 0.8 + Math.sin(nowSec - rm.gx * 0.5) * 0.22;
    rm.mesh.scale.set(pulse, 1, pulse);
  }

  // Rotate the 3D Moon Sanctuary's star ring + Last-Ditch Guardian Beam at the Castle Steps!
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
  }

  // Sanctuary Guardian Beam: zaps leaked zombies right at the Castle steps (within 2.8 tiles every 2.8s)
  S.sanctuaryFireTimer = (S.sanctuaryFireTimer || 0) + dt;
  if (S.sanctuaryFireTimer >= 2.8 && S.zombies.length > 0) {
    let closeZ = null;
    let bestD = 2.8;
    for (const z of S.zombies) {
      const d = Math.hypot(z.x - sancX, z.z - sancZ);
      if (d <= bestD) {
        bestD = d;
        closeZ = z;
      }
    }
    if (closeZ) {
      S.sanctuaryFireTimer = 0;
      const beamMesh = vox(0.20, 0.20, 0.20, 0xffe066, sancX, 1.35, sancZ, {
        emissive: 0xffd43b,
        emissiveIntensity: 0.95
      });
      projGroup.add(beamMesh);
      S.projectiles.push({
        mesh: beamMesh,
        x: sancX,
        y: 1.35,
        z: sancZ,
        target: closeZ,
        dmg: 26,
        splash: 0,
        meltsArmor: false,
        marksTarget: false,
        chainCount: 0,
        knockback: 0.15,
        flyerBonus: 1.0,
        color: 0xffe066
      });
    }
  }

  // Wave Pacing & Stage Victory Check:
  // - Stage ONLY ends in Victory after all 5 fixed waves + the Stage-Final Nightmare Critter Boss are spawned & defeated!
  const totalW = S.totalWaves || 5;
  if (S.spawnQueue.length === 0) {
    if (S.zombies.length === 0) {
      if (!S.endlessMode && S.wave >= totalW) {
        S.carryoverStars = Math.max(S.carryoverStars || 0, S.moonShards || 0);
        S.clearedStages.add(S.stageIndex);
        saveGameState(true);
        startVictoryCutscene();
        return;
      }
      if (S.wave > 0) {
        S.waveTimer = Math.min(S.waveTimer, 7.5);
      }
      S.waveTimer -= dt;
      if (S.waveTimer <= 0 && (S.endlessMode || S.wave < totalW)) {
        triggerNextWave();
      }
    } else if (S.zombies.length <= 1 && (S.endlessMode || S.wave < totalW)) {
      S.waveTimer -= dt * 0.22;
      if (S.waveTimer <= 0) {
        triggerNextWave();
      }
    }
  }

  const maxActiveZombies = 10 + S.stageIndex * 2;
  if (S.spawnQueue.length > 0 && S.zombies.length < maxActiveZombies) {
    S.spawnCooldown -= dt;
    if (S.spawnCooldown <= 0) {
      spawnZombie(S.spawnQueue.shift());
      S.spawnCooldown = 1.65;
    }
  }

  // Live Star/Moon Empowerment: Next-Stage Carryover Multiplier * (1 + 0.5% per current Star)!
  const starPowerMult = (S.starBonusMult || 1.0) * (1 + (S.moonShards || 0) * 0.005);

  // Update All Placed Critter Units
  for (let i = S.units.length - 1; i >= 0; i--) {
    const u = S.units[i];
    if (u.hp <= 0) {
      removeUnit(u);
      continue;
    }
    const wpos = gridToWorld(u.gx, u.gz);
    const tile = tiles[u.gx]?.[u.gz];
    const lvMult = 1 + ((u.level || 1) - 1) * 0.45;

    if (u.mesh.userData.rotor) {
      u.mesh.userData.rotor.rotation.z += dt * 4.5;
    }

    let haste = 1.0;
    for (const ally of S.units) {
      if (ally.def.hasteRadius && Math.hypot(ally.gx - u.gx, ally.gz - u.gz) <= ally.def.hasteRadius) {
        haste = ally.def.hasteMult || 1.25;
        break;
      }
    }
    // Check if slowed by Nightmare Boss Poppy-Gas Aura
    for (const z of S.zombies) {
      if (z.def.poppyAuraRadius && Math.hypot(z.gx - u.gx, z.gz - u.gz) <= z.def.poppyAuraRadius) {
        haste *= 0.65;
        break;
      }
    }

    u.prodTimer = (u.prodTimer || 0) + dt * haste;
    u.atkTimer = (u.atkTimer || 0) + dt * haste;

    // 1. Spike Trap damage (takes wear-and-tear durability damage as it shreds enemies!)
    if (u.isTrap) {
      for (const z of S.zombies) {
        if (!z.def.flying && Math.hypot(z.x - wpos.x, z.z - wpos.z) < 0.62) {
          z.hp -= u.def.dmg * dt;
          z.mesh.userData.updateHearts(z.hp, z.maxHp, z.armor);
          u.hp -= 18 * dt;
        }
      }
      if (u.hp <= 0) removeUnit(u);
      continue;
    }

    // 2. Depletable 4-Resource Production (10 full harvests per Vein tile before Vein depletes, boosted by Star Carryover!)
    if (u.def.prod && u.prodTimer >= (u.def.prodInterval || 5.5)) {
      u.prodTimer = 0;
      const p = u.def.prod;
      let veinActive = false;
      if (u.onVein && tile) {
        if (tile.baseType === 'water' && u.id === 'bubba') {
          veinActive = true;
        } else if ((tile.veinCharges ?? 0) > 0) {
          tile.veinCharges--;
          veinActive = true;
          if (tile.nodeMesh) {
            if (tile.veinCharges <= 0) {
              tile.nodeMesh.visible = false;
            } else {
              tile.nodeMesh.scale.setScalar(0.28 + 0.30 * (tile.veinCharges / 10));
            }
          }
        }
      }
      const veinBoost = (veinActive ? (u.def.veinMult || 2.5) : 1.0) * (S.starBonusMult || 1.0);

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
        S.res.crystal += Math.round(p.crystal * veinBoost * lvMult);
        spawnSoftSparkle(wpos.x, 0.95, wpos.z, 0xda77f2);
      }
      updateTopHUD();
    }

    // 3. PickyPiggy / Lunar Obelisk Healing Aura
    if (u.def.healRadius) {
      for (const ally of S.units) {
        if (ally.hp < ally.maxHp && Math.hypot(ally.gx - u.gx, ally.gz - u.gz) <= u.def.healRadius) {
          ally.hp = Math.min(ally.maxHp, ally.hp + (u.def.healPerSec || 18) * lvMult * dt);
        }
      }
    }

    // 4. Bubba Cryo Slow Dome (48% slow)
    if (u.def.slowRadius) {
      for (const z of S.zombies) {
        if (Math.hypot(z.gx - u.gx, z.gz - u.gz) <= u.def.slowRadius) {
          z.slowTimer = 0.7;
        }
      }
    }

    // 5. CraftyCorn / Lunar Obelisk Moon Shard Weaving (only weaves while wave combat is active!)
    if (u.def.shardWeaver && (S.zombies.length > 0 || S.spawnQueue.length > 0)) {
      u.moonTimer = (u.moonTimer || 0) + dt;
      if (u.moonTimer >= (u.def.shardInterval || 12.0)) {
        u.moonTimer = 0;
        addMoonShards(Math.round((u.def.shardYield || 1) * lvMult));
        spawnSoftSparkle(wpos.x, 1.15, wpos.z, 0xfff3bf);
      }
    }

    // 6. 360° Turret Combat (Strict Range & Anti-Air Enforcement + Star Empowerment!)
    if (u.def.atk > 0 && u.atkTimer >= (u.def.fireInterval || 1.2)) {
      const rangeBonus = u.stacked ? 1.40 : (u.onHighGround ? 1.28 : 1.0);
      const dmgBonus = (u.stacked ? 1.28 : (u.onHighGround ? 1.18 : 1.0)) * lvMult * starPowerMult;
      const effRange = (u.def.range || 3.5) * rangeBonus;
      const canHitAir = Boolean(u.def.antiAir || u.stacked || u.onHighGround);

      let target = null;
      let bestScore = Infinity;
      for (const z of S.zombies) {
        if (z.def.flying && !canHitAir) continue;
        const d = Math.hypot(z.gx - u.gx, z.gz - u.gz);
        if (d <= effRange) {
          const dSanc = Math.hypot(z.x - sancX, z.z - sancZ);
          if (dSanc < bestScore) {
            bestScore = dSanc;
            target = z;
          }
        }
      }

      if (target) {
        u.atkTimer = 0;
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
          dmg: (u.def.atk || 20) * dmgBonus,
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

  // Helper: Off-road gatherers & towers on grass/vein/cliff tiles are IMMUNE to road zombie collision/splash/aura!
  // Only Bobby BearHug (Frontline Taunt Shield Tank) or units explicitly placed on road/bridge tiles engage in frontline melee/counter-fire.
  const isFrontlineTargetable = u => {
    if (!u || u.isTrap) return false;
    if (u.id === 'bobby') return true;
    const ut = tiles[u.gx]?.[u.gz];
    return Boolean(ut && (ut.type === 'road' || ut.hasBridge));
  };

  // Update Zombies — Follow Winding Cobblestone Road + Execute Ranged & Aura Counter-Attacks!
  for (let i = S.zombies.length - 1; i >= 0; i--) {
    const z = S.zombies[i];

    if (z.hp <= 0) {
      spawnBurst(z.x, z.y + 0.4, z.z, z.def.skinColor || '#69db7c', 5);
      const rw = z.def.reward || {};
      // Guaranteed Rare 🔮 Star Core drop from Late-Wave Tough Elite Monsters & Final Bosses!
      if ((rw.core || 0) > 0) {
        spawnCollectibleOrb(z.x, z.z, 'core', rw.core);
      }
      if (rw.shard > 0) {
        addMoonShards(rw.shard);
      }
      if (z.def.isStageBoss) {
        showBubble(`🏆 Defeated ${z.def.name} · 击败${z.def.cn}! +${rw.shard || 8}🌕 +${rw.core || 5}🔮`, 2.2);
      }
      // Regular zombies have a 20% chance to drop a +4 salvage orb
      if (Math.random() < 0.20) {
        const kinds = ['sun', 'wood', 'stone', 'crystal'];
        const k = kinds[Math.floor(Math.random() * kinds.length)];
        spawnCollectibleOrb(z.x, z.z, k, 4);
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
    if (z.mesh.userData.golemCore) {
      z.mesh.userData.golemCore.rotation.y += dt * 3.2;
      z.mesh.userData.golemCore.rotation.x += dt * 2.1;
    }
    if (z.mesh.userData.behemothSpire) {
      z.mesh.userData.behemothSpire.rotation.y -= dt * 2.2;
    }
    if (z.mesh.userData.dragonWings) {
      z.mesh.position.y = 1.18 + Math.sin(z.walkPhase * 0.8) * 0.16;
      z.mesh.userData.dragonWings.scale.y = 0.85 + Math.sin(z.walkPhase * 1.8) * 0.22;
    }

    // Necromancer / Shaman / Nightmare Boss Special: Heal nearby zombies & summon runners
    if (z.def.healPerSec) {
      for (const other of S.zombies) {
        if (other.hp < other.maxHp && Math.hypot(other.gx - z.gx, other.gz - z.gz) <= (z.def.healRadius || 3.0)) {
          other.hp = Math.min(other.maxHp, other.hp + z.def.healPerSec * dt);
          other.mesh.userData.updateHearts(other.hp, other.maxHp, other.armor);
        }
      }
      z.specialTimer -= dt;
      if (z.specialTimer <= 0 && S.zombies.length < maxActiveZombies) {
        z.specialTimer = z.def.summonInterval || 7.5;
        spawnZombie('runner', { gx: z.gx, gz: z.gz });
      }
    }

    // Nightmare Boss Special: Crimson Poppy-Gas Aura damages frontline blockers only (never deletes off-road buildings!)
    const effPoppyDps = z.poppyAuraDps ?? z.def.poppyAuraDps ?? 0;
    if (z.def.poppyAuraRadius && effPoppyDps > 0) {
      for (let ui = S.units.length - 1; ui >= 0; ui--) {
        const u = S.units[ui];
        if (isFrontlineTargetable(u) && Math.hypot(u.gx - z.gx, u.gz - z.gz) <= z.def.poppyAuraRadius) {
          u.hp -= effPoppyDps * dt;
          if (u.hp <= 0) removeUnit(u);
        }
      }
    }

    // Zombie Ranged Counter-Attack (targets Bobby BearHug or frontline road/bridge units — never snipes off-road gatherers!)
    const effRangedAtk = z.rangedAtk ?? z.def.rangedAtk ?? 0;
    if (effRangedAtk > 0 && z.def.rangedRange) {
      z.rangedTimer = (z.rangedTimer || 0) + dt;
      if (z.rangedTimer >= 1.65) {
        let bestTarget = null;
        let bestScore = Infinity;
        for (const u of S.units) {
          if (!isFrontlineTargetable(u)) continue;
          const distU = Math.hypot(u.gx - z.gx, u.gz - z.gz);
          if (distU <= z.def.rangedRange) {
            const score = (u.id === 'bobby' ? -10 : 0) + distU;
            if (score < bestScore) {
              bestScore = score;
              bestTarget = u;
            }
          }
        }
        if (bestTarget) {
          z.rangedTimer = 0;
          const uw = gridToWorld(bestTarget.gx, bestTarget.gz);
          spawnSoftSparkle(uw.x, 0.75, uw.z, 0xff4d6d);
          bestTarget.hp -= effRangedAtk;
          if (bestTarget.hp <= 0) removeUnit(bestTarget);
        }
      }
    }

    if (z.slowTimer > 0) z.slowTimer -= dt;
    if (z.markTimer > 0) z.markTimer -= dt;

    // 1. Check if zombie has breached the 3D Moon Sanctuary Castle!
    const distToSanctuary = Math.hypot(sancX - z.x, sancZ - z.z);
    if (distToSanctuary <= 1.28) {
      const breach = z.def.breachDmg || 1;
      S.hp = Math.max(0, S.hp - breach);
      S.sanctuaryShake = 0.65;
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

    // 2. Check if a frontline blocking Critter (Bobby BearHug or road/bridge unit) is in front of the zombie
    let blocker = null;
    if (!z.def.flying) {
      let bestBlockDist = 0.78;
      for (const u of S.units) {
        if (!isFrontlineTargetable(u)) continue;
        // Bobby BearHug has a wider taunt/intercept radius (1.15 tiles) so he can guard the road from adjacent tiles!
        const interceptRadius = u.id === 'bobby' ? 1.15 : 0.68;
        const dUnit = Math.hypot(u.gx - z.gx, u.gz - z.gz);
        if (dUnit <= interceptRadius && dUnit < bestBlockDist + (u.id === 'bobby' ? 0.45 : 0)) {
          bestBlockDist = dUnit;
          blocker = u;
        }
      }
    }

    if (blocker) {
      // Creeper detonates on frontline contact (Bobby's 60% blastResist counters it; never splashes off-road buildings!)
      const effFrontBurst = z.frontBurstDmg ?? z.def.frontBurstDmg ?? 0;
      const effSplashBurst = z.splashBurstDmg ?? z.def.splashBurstDmg ?? 0;
      if (effFrontBurst > 0) {
        const resist = blocker.def.blastResist || 0;
        blocker.hp -= effFrontBurst * (1 - resist);
        if (blocker.hp <= 0) removeUnit(blocker);
        if (effSplashBurst > 0) {
          for (let ui = S.units.length - 1; ui >= 0; ui--) {
            const otherU = S.units[ui];
            if (otherU !== blocker && isFrontlineTargetable(otherU) && Math.hypot(otherU.gx - z.gx, otherU.gz - z.gz) <= 1.25) {
              otherU.hp -= effSplashBurst * (1 - (otherU.def.blastResist || 0));
              if (otherU.hp <= 0) removeUnit(otherU);
            }
          }
        }
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
      if (z.atkTimer >= 0.75) {
        z.atkTimer = 0;
        const wallMult = z.def.wallBreaker ? 2.2 : 1.0;
        const effDps = z.dps ?? z.def.dps ?? 22;
        blocker.hp -= effDps * wallMult;

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

      const slowMult = z.slowTimer > 0 ? 0.52 : 1.0;
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

  // Update Collectible Orbs: auto-collect after 1.4s so players never lose drops!
  for (let i = S.orbs.length - 1; i >= 0; i--) {
    const o = S.orbs[i];
    o.age += dt;
    o.mesh.rotation.y += dt * 3.2;
    o.mesh.position.y = 0.68 + Math.sin(o.age * 5) * 0.14;
    if (o.age >= 1.4) {
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
    // Strict Road-Aligned Knockback: push zombies strictly backward toward their previous road waypoint!
    // NEVER push zombies sideways off the road into player gatherers or towers!
    if (p.knockback > 0 && !z.def.flying && z.route && z.route.length >= 2) {
      const prevIdx = Math.max(0, Math.min(z.route.length - 1, (z.wpIndex || 1) - 1));
      const [prevGx, prevGz] = z.route[prevIdx];
      const prevWorld = gridToWorld(prevGx, prevGz);
      const bdx = prevWorld.x - z.x;
      const bdz = prevWorld.z - z.z;
      const bd = Math.hypot(bdx, bdz);
      if (bd > 0.04) {
        const kbResist = z.def.isStageBoss ? 0.25 : 1.0;
        const pushDist = Math.min(bd, p.knockback * 0.28 * kbResist);
        z.x += (bdx / bd) * pushDist;
        z.z += (bdz / bd) * pushDist;
        z.gx = (z.x / 1.0) + (S.cols - 1) / 2;
        z.gz = (z.z / 1.0) + (S.rows - 1) / 2;
        z.mesh.position.x = z.x;
        z.mesh.position.z = z.z;
      }
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
// POINTER, DRAG-TO-PAN CAMERA, ORBIT ROTATION, WHEEL ZOOM & TAP-TO-BUILD
// ============================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isOrbitDragging = false;
let isPanDragging = false;
let isLeftPointerDown = false;
let didDragCamera = false;
let pointerDownX = 0;
let pointerDownY = 0;
let panStartX = 0;
let panStartZ = 0;
let orbitLastX = 0;
let orbitLastY = 0;

function updatePointerRay(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches?.[0] || e.changedTouches?.[0];
  const cx = touch ? touch.clientX : e.clientX;
  const cy = touch ? touch.clientY : e.clientY;
  mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
}

canvas.addEventListener('contextmenu', e => e.preventDefault());

function clampCameraPan() {
  const maxPanX = Math.max(4, S.cols * 0.45);
  const maxPanZ = Math.max(3, S.rows * 0.45);
  S.camPanX = Math.max(-maxPanX, Math.min(maxPanX, S.camPanX || 0));
  S.camPanZ = Math.max(-maxPanZ, Math.min(maxPanZ, S.camPanZ || 0));
}

function pickBoardCoords() {
  // When using Upgrade or Shovel (or clicking directly on a placed Critter's 3D head/body),
  // check 3D unit meshes FIRST so isometric clicks on a Critter's head never pass through to the tile behind it!
  if (S.selectedTool === 'upgrade_star' || S.selectedTool === 'shovel') {
    const unitHits = raycaster.intersectObjects(unitGroup.children, true);
    for (const h of unitHits) {
      if (h.object?.userData?.gx !== undefined) {
        return { gx: h.object.userData.gx, gz: h.object.userData.gz };
      }
    }
  }
  const hits = raycaster.intersectObjects(tilePickMeshes, false);
  if (hits.length > 0) {
    return hits[0].object.userData;
  }
  const unitHitsFallback = raycaster.intersectObjects(unitGroup.children, true);
  for (const h of unitHitsFallback) {
    if (h.object?.userData?.gx !== undefined) {
      return { gx: h.object.userData.gx, gz: h.object.userData.gz };
    }
  }
  return null;
}

canvas.addEventListener('pointerdown', e => {
  if (S.phase === 'cutscene') return;
  if (e.button === 2 || e.button === 1 || (e.button === 0 && e.shiftKey)) {
    isOrbitDragging = true;
    orbitLastX = e.clientX;
    orbitLastY = e.clientY;
    canvas.style.cursor = 'grabbing';
    return;
  }
  if (e.button === 0) {
    isLeftPointerDown = true;
    isPanDragging = false;
    didDragCamera = false;
    pointerDownX = e.clientX;
    pointerDownY = e.clientY;
    panStartX = S.camPanX || 0;
    panStartZ = S.camPanZ || 0;
  }
});

canvas.addEventListener('pointermove', e => {
  if (S.phase !== 'playing') return;
  if (isOrbitDragging) {
    const dx = e.clientX - orbitLastX;
    const dy = e.clientY - orbitLastY;
    orbitLastX = e.clientX;
    orbitLastY = e.clientY;
    S.camYaw = Math.max(-1.25, Math.min(1.25, (S.camYaw || 0) - dx * 0.006));
    S.camPitch = Math.max(-0.35, Math.min(0.45, (S.camPitch || 0) + dy * 0.004));
    updateCameraFraming();
    return;
  }

  if (isLeftPointerDown) {
    const dx = e.clientX - pointerDownX;
    const dy = e.clientY - pointerDownY;
    if (!isPanDragging && Math.hypot(dx, dy) > 6) {
      isPanDragging = true;
      didDragCamera = true;
      canvas.style.cursor = 'grabbing';
      cursorMesh.visible = false;
    }
    if (isPanDragging) {
      // Convert screen drag (dx, dy) into world-plane pan aligned with current camera yaw & zoom!
      const panSpeed = 0.024 * Math.max(0.7, S.camZoom || 1.0);
      const yaw = (S.camYaw || 0) + (S.camMode === 2 ? 0.28 : 0);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const localRightX = -dx * panSpeed;
      const localForwardZ = -dy * panSpeed * 1.15;
      S.camPanX = panStartX + localRightX * cosY + localForwardZ * sinY;
      S.camPanZ = panStartZ - localRightX * sinY + localForwardZ * cosY;
      clampCameraPan();
      updateCameraFraming();
      return;
    }
  }

  updatePointerRay(e);
  const picked = pickBoardCoords();
  if (picked) {
    const { gx, gz } = picked;
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

window.addEventListener('pointerup', e => {
  if (isOrbitDragging) {
    isOrbitDragging = false;
    canvas.style.cursor = '';
    return;
  }
  if (!isLeftPointerDown) return;
  isLeftPointerDown = false;
  isPanDragging = false;
  canvas.style.cursor = '';

  if (S.phase === 'cutscene') return;

  // If the user dragged the camera (> 6px), finish the pan without placing a unit!
  if (didDragCamera) {
    didDragCamera = false;
    return;
  }

  // Otherwise, treat it as a clean tap/click to collect an orb or place/upgrade a Critter!
  updatePointerRay(e);

  for (const o of S.orbs) {
    if (raycaster.intersectObject(o.mesh, true).length > 0) {
      collectOrb(o);
      return;
    }
  }

  const picked = pickBoardCoords();
  if (picked) {
    placeUnitOnTile(picked.gx, picked.gz, S.selectedTool, false);
  }
});

// Mouse Wheel & Trackpad Pinch/Scroll to Zoom & Pan Smoothly
canvas.addEventListener(
  'wheel',
  e => {
    if (S.phase !== 'playing') return;
    e.preventDefault();
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2 && !e.ctrlKey) {
      S.camPanX = (S.camPanX || 0) + e.deltaX * 0.015;
      clampCameraPan();
    } else {
      const zoomDelta = e.deltaY * 0.0012;
      S.camZoom = Math.max(0.55, Math.min(1.45, (S.camZoom || 1.0) + zoomDelta));
    }
    updateCameraFraming();
  },
  { passive: false }
);

window.addEventListener('keydown', e => {
  if (S.phase !== 'playing') return;
  const step = 1.1;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    S.camPanX = (S.camPanX || 0) - step;
    clampCameraPan();
    updateCameraFraming();
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    S.camPanX = (S.camPanX || 0) + step;
    clampCameraPan();
    updateCameraFraming();
  } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    S.camPanZ = (S.camPanZ || 0) - step;
    clampCameraPan();
    updateCameraFraming();
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    S.camPanZ = (S.camPanZ || 0) + step;
    clampCameraPan();
    updateCameraFraming();
  } else if (e.key === 'q' || e.key === 'Q') {
    S.camYaw = Math.max(-1.25, (S.camYaw || 0) - 0.14);
    updateCameraFraming();
  } else if (e.key === 'e' || e.key === 'E') {
    S.camYaw = Math.min(1.25, (S.camYaw || 0) + 0.14);
    updateCameraFraming();
  }
});

// ============================================================================
// BILINGUAL MAIN MENU (NEW GAME / LOAD SAVE / HEAT SLIDER) & SAVE SYSTEM (中英双语存档与热度系统)
// ============================================================================
const SAVE_STORAGE_KEY = 'mooncraft_save_v1';

export function refreshHeatSliderUI() {
  const h = Math.max(0, Math.min(10, Math.round(Number(S.heat) || 0)));
  const enemyMult = getEnemyHeatMultiplier(h);
  const buildMult = getBuildHeatMultiplier(h);
  const enemyBonusPct = Math.round((enemyMult - 1) * 100);
  const buildBonusPct = Math.round((buildMult - 1) * 100);
  const enemyMultStr = enemyMult.toFixed(1);
  const buildMultStr = buildMult.toFixed(1);

  const sliderEl = document.getElementById('heatSlider');
  if (sliderEl && Number(sliderEl.value) !== h) {
    sliderEl.value = String(h);
  }

  const badgeEl = document.getElementById('heatValueBadge');
  if (badgeEl) {
    const tierLabel =
      h === 0
        ? '标准难度'
        : h <= 3
        ? '升温挑战'
        : h <= 6
        ? '高热炼狱'
        : '暗月绝境 (建筑已封顶)';
    badgeEl.textContent =
      h <= 6
        ? `🔥 HEAT ${h} (+${enemyBonusPct}%) · ${tierLabel}`
        : `🔥 HEAT ${h} (🧟+${enemyBonusPct}% / 🧱+${buildBonusPct}% CAP) · ${tierLabel}`;
  }

  const monsterPill = document.getElementById('heatMonsterModPill');
  if (monsterPill) {
    monsterPill.innerHTML = `🧟 Enemy HP &amp; ATK: <b>+${enemyBonusPct}%</b> (${enemyMultStr}x)`;
  }

  const buildPill = document.getElementById('heatBuildModPill');
  if (buildPill) {
    const capTag = h >= 6 ? ' <small>· CAPPED 已封顶</small>' : '';
    buildPill.innerHTML = `🧱 Building Cost: <b>+${buildBonusPct}%</b> (${buildMultStr}x)${capTag}`;
  }

  if (heatHudCountEl) {
    heatHudCountEl.textContent = String(h);
  }
}

export function setHeatLevel(newHeat, silent = true) {
  const h = Math.max(0, Math.min(10, Math.round(Number(newHeat) || 0)));
  S.heat = h;
  const newHeatMult = getHeatMultiplier();

  // Immediately rescale any active monsters on the board so changing Heat in the Main Menu applies right away!
  for (const z of S.zombies) {
    const hpRatio = z.maxHp > 0 ? Math.max(0, Math.min(1, z.hp / z.maxHp)) : 1;
    const baseWaveStageMult = z.baseWaveStageMult || (1 + Math.max(0, S.wave - 1) * 0.10 + S.stageIndex * 0.10);
    z.heatMult = newHeatMult;
    z.maxHp = Math.round(z.def.hp * baseWaveStageMult * newHeatMult);
    z.hp = Math.max(1, Math.round(z.maxHp * hpRatio));
    z.dps = Math.round((z.def.dps || 22) * newHeatMult);
    z.rangedAtk = z.def.rangedAtk ? Math.round(z.def.rangedAtk * newHeatMult) : 0;
    z.frontBurstDmg = z.def.frontBurstDmg ? Math.round(z.def.frontBurstDmg * newHeatMult) : 0;
    z.splashBurstDmg = z.def.splashBurstDmg ? Math.round(z.def.splashBurstDmg * newHeatMult) : 0;
    z.poppyAuraDps = z.def.poppyAuraDps ? Number((z.def.poppyAuraDps * newHeatMult).toFixed(2)) : 0;
    if (z.mesh?.userData?.updateHearts) {
      z.mesh.userData.updateHearts(z.hp, z.maxHp, z.armor);
    }
  }

  refreshHeatSliderUI();
  updateTopHUD();

  if (!silent) {
    const enemyBonusPct = Math.round((getEnemyHeatMultiplier(h) - 1) * 100);
    const buildBonusPct = Math.round((getBuildHeatMultiplier(h) - 1) * 100);
    const capNote = h > 6 ? ' (CAP)' : '';
    showBubble(`🔥 Heat ${h}: 🧟 HP/ATK +${enemyBonusPct}% · 🧱 Cost +${buildBonusPct}%${capNote}`, 1.5);
  }
  return h;
}

export function hasSavedGame() {
  try {
    return Boolean(localStorage.getItem(SAVE_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function refreshMainMenuUI() {
  refreshHeatSliderUI();
  const statusEl = document.getElementById('menuSaveStatus');
  const loadBtn = document.getElementById('menuLoadGameBtn');
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) {
      if (statusEl) statusEl.textContent = '📂 No Save Data Found · 暂无存档记录（点击新游戏开始）';
      if (loadBtn) loadBtn.disabled = true;
      return;
    }
    const data = JSON.parse(raw);
    const stg = (data.stageIndex ?? 0) + 1;
    const wv = data.wave ?? 0;
    const ht = data.heat ?? 0;
    const sh = data.moonShards ?? 0;
    const goal = data.moonGoal ?? 30;
    const r = data.res || {};
    if (statusEl) {
      statusEl.textContent =
        `📂 Saved: Stage ${stg} (Wave ${wv} · 🔥Heat ${ht}) · 🌕${sh}/${goal} · ☀️${Math.floor(r.sun || 0)} 🪵${Math.floor(r.wood || 0)} 🧱${Math.floor(r.stone || 0)} 💎${Math.floor(r.crystal || 0)} 🔮${Math.floor(r.core || 0)} | 已存：第${stg}关 第${wv}波 (🔥热度${ht})`;
    }
    if (loadBtn) loadBtn.disabled = false;
  } catch {
    if (statusEl) statusEl.textContent = '📂 Save Slot Ready · 存档槽位就绪';
  }
}

export function saveGameState(silent = false) {
  try {
    const bridges = [];
    for (let gx = 0; gx < S.cols; gx++) {
      for (let gz = 0; gz < S.rows; gz++) {
        if (tiles[gx]?.[gz]?.hasBridge) {
          bridges.push([gx, gz]);
        }
      }
    }
    const unitsData = S.units.map(u => ({
      id: u.id,
      gx: u.gx,
      gz: u.gz,
      level: u.level || 1,
      hp: Math.round(u.hp || u.maxHp || 100),
      maxHp: Math.round(u.maxHp || 100),
      stacked: Boolean(u.stacked),
      isTrap: Boolean(u.isTrap)
    }));
    const payload = {
      version: 1,
      timestamp: Date.now(),
      stageIndex: S.stageIndex,
      wave: S.wave,
      heat: S.heat || 0,
      moonShards: S.moonShards,
      moonGoal: S.moonGoal,
      carryoverStars: S.carryoverStars || 0,
      starBonusMult: S.starBonusMult || 1.0,
      hp: S.hp,
      maxHp: S.maxHp,
      forgeCount: S.forgeCount || 0,
      res: { ...S.res },
      clearedStages: Array.from(S.clearedStages),
      bridges,
      units: unitsData
    };
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    refreshMainMenuUI();
    if (!silent) {
      sound.shard();
      showBubble('💾 Game Saved! · 进度已保存！', 1.6);
    }
    return true;
  } catch {
    return false;
  }
}

export function loadSavedGame() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) {
      showBubble('📂 No Save Found · 暂无存档！', 1.5);
      return false;
    }
    const data = JSON.parse(raw);
    if (S.phase === 'cutscene' || S.phase === 'victory_cutscene') {
      finishCutscene();
    }
    document.getElementById('mainMenuModal')?.classList.add('hidden');
    document.getElementById('victoryModal')?.classList.add('hidden');
    S.paused = false;
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) pauseBtn.innerHTML = UI_SVGS.ctrl_pause;

    S.clearedStages = new Set(Array.isArray(data.clearedStages) ? data.clearedStages : []);
    S.heat = Math.max(0, Math.min(10, Math.round(Number(data.heat) || 0)));
    S.carryoverStars = Math.max(0, Number(data.carryoverStars) || 0);
    S.starBonusMult = Math.max(1.0, Number(data.starBonusMult) || (1 + Math.round(S.carryoverStars * 0.5) / 100));
    buildStageWorld(data.stageIndex ?? 0, false);
    S.carryoverStars = Math.max(0, Number(data.carryoverStars) || 0);
    S.starBonusMult = Math.max(1.0, Number(data.starBonusMult) || (1 + Math.round(S.carryoverStars * 0.5) / 100));

    // Clear default starter units so we can restore the exact saved board units
    for (const u of [...S.units]) {
      removeUnit(u);
    }

    // Restore bridges first
    for (const [bgx, bgz] of (data.bridges || [])) {
      placeUnitOnTile(bgx, bgz, 'bridge', true);
    }

    // Restore base units first, then stacked units on top of Mikey watchtowers
    const savedUnits = Array.isArray(data.units) ? data.units : [];
    const baseUnits = savedUnits.filter(u => !u.stacked);
    const stackedUnits = savedUnits.filter(u => u.stacked);
    for (const item of [...baseUnits, ...stackedUnits]) {
      const ok = placeUnitOnTile(item.gx, item.gz, item.id, true);
      if (ok) {
        const tile = tiles[item.gx]?.[item.gz];
        const placed = item.stacked ? tile?.stackedUnit : tile?.unit;
        if (placed) {
          placed.level = item.level || 1;
          placed.maxHp = item.maxHp || placed.maxHp;
          placed.hp = Math.min(placed.maxHp, Math.max(1, item.hp || placed.maxHp));
          if (placed.mesh?.userData?.setStarLevel) {
            placed.mesh.userData.setStarLevel(placed.level);
          }
        }
      }
    }

    S.res = { ...INITIAL_RESOURCES, ...(data.res || {}) };
    S.moonShards = Math.max(0, data.moonShards ?? 0);
    S.wave = data.wave ?? 0;
    S.maxHp = Math.max(12, data.maxHp ?? 12);
    S.hp = Math.max(1, Math.min(S.maxHp, data.hp ?? S.maxHp));
    S.forgeCount = data.forgeCount ?? 0;
    S.phase = 'playing';

    setHeatLevel(S.heat, true);
    setMoonRestoreProgress(Math.min(1, S.moonShards / Math.max(1, S.moonGoal)));
    updateStageButtons();
    updateTopHUD();
    sound.shard();
    showBubble(`📂 Loaded Stage ${S.stageIndex + 1} (🔥Heat ${S.heat}) · 已读取第 ${S.stageIndex + 1} 关存档！`, 1.8);
    return true;
  } catch {
    showBubble('📂 Load Failed · 读取存档失败', 1.5);
    return false;
  }
}

export function startNewGame(stageIdx = 0) {
  if (S.phase === 'cutscene' || S.phase === 'victory_cutscene') {
    finishCutscene();
  }
  document.getElementById('mainMenuModal')?.classList.add('hidden');
  document.getElementById('victoryModal')?.classList.add('hidden');
  S.paused = false;
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) pauseBtn.innerHTML = UI_SVGS.ctrl_pause;

  S.carryoverStars = 0;
  S.starBonusMult = 1.0;
  S.res = { ...INITIAL_RESOURCES };
  S.moonShards = 0;
  S.wave = 0;
  S.phase = 'playing';
  buildStageWorld(stageIdx, false);
  setHeatLevel(S.heat, true);
  if (!hasSavedGame()) {
    saveGameState(true);
  }
  const pct = Math.round((getEnemyHeatMultiplier(S.heat) - 1) * 100);
  showBubble(
    S.heat > 0
      ? `🌟 New Game (🔥Heat ${S.heat}: +${pct}%) · 新游戏开始！`
      : '🌟 New Game Started! · 新游戏开始！',
    1.6
  );
}

export function openMainMenu() {
  refreshMainMenuUI();
  S.paused = true;
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) pauseBtn.innerHTML = UI_SVGS.ctrl_play;
  document.getElementById('mainMenuModal')?.classList.remove('hidden');
}

export function closeMainMenu() {
  document.getElementById('mainMenuModal')?.classList.add('hidden');
  S.paused = false;
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) pauseBtn.innerHTML = UI_SVGS.ctrl_pause;
  if (S.phase === 'cutscene') {
    finishCutscene();
  }
}

// Top HUD & Modal Buttons
document.getElementById('skipCineBtn').addEventListener('click', () => {
  sound.click();
  finishCutscene();
});

document.getElementById('replayCineBtn').addEventListener('click', () => {
  sound.click();
  startOpeningCutscene();
});

document.getElementById('saveGameBtn')?.addEventListener('click', () => {
  sound.click();
  saveGameState(false);
});

document.getElementById('openMenuBtn')?.addEventListener('click', () => {
  sound.click();
  openMainMenu();
});

document.getElementById('heatHudBadge')?.addEventListener('click', () => {
  sound.click();
  openMainMenu();
});

document.getElementById('heatSlider')?.addEventListener('input', e => {
  sound.click();
  setHeatLevel(Number(e.target.value), false);
});

document.getElementById('heatMinusBtn')?.addEventListener('click', () => {
  sound.click();
  setHeatLevel((S.heat || 0) - 1, false);
});

document.getElementById('heatPlusBtn')?.addEventListener('click', () => {
  sound.click();
  setHeatLevel((S.heat || 0) + 1, false);
});

document.getElementById('menuNewGameBtn')?.addEventListener('click', () => {
  sound.click();
  startNewGame(0);
});

document.getElementById('menuLoadGameBtn')?.addEventListener('click', () => {
  sound.click();
  loadSavedGame();
});

document.getElementById('menuResumeBtn')?.addEventListener('click', () => {
  sound.click();
  closeMainMenu();
});

document.getElementById('menuIntroBtn')?.addEventListener('click', () => {
  sound.click();
  document.getElementById('mainMenuModal')?.classList.add('hidden');
  S.paused = false;
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
  S.camPitch = 0;
  S.camPanX = 0;
  S.camPanZ = 0;
  S.camZoom = 1.0;
  e.currentTarget.classList.toggle('active', S.camMode > 0);
  updateCameraFraming();
});

document.getElementById('waveBtn').addEventListener('click', () => {
  sound.click();
  if (S.phase === 'cutscene' || S.phase === 'victory_cutscene') finishCutscene();
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
    S.wave = 0;
    S.phase = 'playing';
    buildStageWorld(idx, false);
    showBubble(`${btn.textContent} 🏰🌕 ✨`, 1.4);
  });
});

// Victory / Defeat Modal Buttons (Next Stage converts accumulated Stars into Next-Stage Bonus Effect!)
document.getElementById('nextStageBtn').addEventListener('click', () => {
  sound.click();
  document.getElementById('victoryModal').classList.add('hidden');
  const isRetry = S.phase === 'defeat';
  const isAllClearRestart = !isRetry && Boolean(S.isGrandFinale || S.stageIndex >= STAGES.length - 1);
  const nextIdx = isRetry ? S.stageIndex : (S.stageIndex + 1) % STAGES.length;
  const applyCarryover = !isRetry && !isAllClearRestart;
  if (applyCarryover) {
    S.carryoverStars = Math.max(S.carryoverStars || 0, S.moonShards || 0);
  } else {
    S.carryoverStars = 0;
    S.starBonusMult = 1.0;
  }
  S.res = { ...INITIAL_RESOURCES };
  S.moonShards = 0;
  S.wave = 0;
  S.phase = 'playing';
  buildStageWorld(nextIdx, applyCarryover);
  if (applyCarryover && (S.carryoverStars || 0) > 0) {
    const stars = Math.floor(S.carryoverStars);
    const atkPct = Math.round((S.starBonusMult - 1) * 100);
    const bonusHp = Math.floor(stars / 10);
    showBubble(
      `🌟 Star Bonus (${stars}🌕): +${atkPct}% ATK/Yield · +☀️${stars * 2} +🪵${stars} +🧱${stars}${bonusHp > 0 ? ` +❤️${bonusHp}` : ''} | 星辉继承加成！`,
      2.6
    );
  }
  saveGameState(true);
});

document.getElementById('replayVictoryAnimBtn')?.addEventListener('click', () => {
  sound.click();
  startVictoryCutscene(Boolean(S.isGrandFinale || S.stageIndex >= STAGES.length - 1));
});

document.getElementById('menuFinaleBtn')?.addEventListener('click', () => {
  sound.click();
  document.getElementById('mainMenuModal')?.classList.add('hidden');
  S.paused = false;
  startGrandFinaleCutscene();
});

document.getElementById('continueBtn').addEventListener('click', () => {
  sound.click();
  document.getElementById('victoryModal').classList.add('hidden');
  if (S.hp <= 0) S.hp = S.maxHp;
  if (S.wave >= (S.totalWaves || 5)) {
    S.endlessMode = true;
  }
  S.phase = 'playing';
  updateTopHUD();
});

document.getElementById('openMenuFromModalBtn')?.addEventListener('click', () => {
  sound.click();
  document.getElementById('victoryModal').classList.add('hidden');
  openMainMenu();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================================
// INITIALIZE STAGE 1 + START HIGH-RES 10S OPENING CUTSCENE + REFRESH SAVE MENU
// ============================================================================
buildStageWorld(0);
refreshMainMenuUI();
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
  } else if (S.phase === 'victory_cutscene') {
    updateVictoryCutscene(dt);
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
  STAGE_FINAL_BOSSES,
  CRITTER_UNITS,
  ZOMBIE_TYPES,
  cineGroup,
  tileGroup,
  placeUnitOnTile,
  tryUpgradeUnit,
  forgeMoonAtSanctuary,
  spawnZombie,
  triggerNextWave,
  finishCutscene,
  startOpeningCutscene,
  startVictoryCutscene,
  startGrandFinaleCutscene,
  finishVictoryCutscene,
  triggerDefeat,
  openMainMenu,
  closeMainMenu,
  startNewGame,
  saveGameState,
  loadSavedGame,
  setHeatLevel,
  getHeatMultiplier,
  getEnemyHeatMultiplier,
  getBuildHeatMultiplier,
  getBuildCostHeatMultiplier,
  getEffectiveUnitCost,
  buildStageWorld,
  addMoonShards,
  advanceCutscene(sec) {
    const steps = Math.ceil(sec / 0.04);
    for (let i = 0; i < steps; i++) {
      if (S.phase === 'cutscene') updateOpeningCutscene(0.04);
      else if (S.phase === 'victory_cutscene') updateVictoryCutscene(0.04);
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
