// CritterCraft: Moonless Night — Main 3D Voxel Game & 10-Second Opening Cinematics.
import {
  UNITS,
  UNIT_MAP,
  ZOMBIE_TYPES,
  computeDynamicCost,
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
  buildCritterUnitMesh,
  buildVoxelZombie,
} from './voxel_models.js';

const THREE = window.THREE;
const $ = (id) => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ============================================================ Grid Constants */
const GRID_W = 14;
const GRID_H = 8;
const TILE_SIZE = 1.15;
const gridToWorld = (gx, gz) => ({
  x: (gx - (GRID_W - 1) / 2) * TILE_SIZE,
  z: (gz - (GRID_H - 1) / 2) * TILE_SIZE,
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
scene.fog = new THREE.FogExp2('#140f2d', 0.018);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);

const hemiLight = new THREE.HemisphereLight('#c5b8ff', '#261c4a', 0.85);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight('#fff3bf', 1.55);
dirLight.position.set(8, 16, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.left = -12;
dirLight.shadow.camera.right = 12;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
scene.add(dirLight);

const altarLight = new THREE.PointLight('#ffd43b', 2.2, 8.5);
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
  speedMode: 'gentle', // 'gentle' (0.55x 5yo default) | 'normal' (1.0x) | 'freeze_bg' (0.55x + no bg motion)
  musicOn: true,
  soundOn: true,
  roleFilter: 'all',
  selectedTool: 'sunnyfox', // unit id or 'tool_wall' | 'tool_upgrade' | 'tool_dig'

  // 10-second opening cutscene state
  introTime: 0,
  introPhase: 0, // 1: transform (0-3.2s), 2: rocket & moon gone (3.2-6.8s), 3: zombies & critters rally (6.8-10s)
  moonVisible: true,
  catnapState: 'cute', // 'cute' | 'nightmare'

  // Gameplay economy & objective
  starlight: 120,
  blocks: 6,
  moonShards: 0,
  moonTarget: 100,
  baseHp: 500,
  baseMaxHp: 500,
  wave: 1,
  time: 0,
  spawnTimer: 2.5,
  passiveTimer: 0,
  carePackageCooldown: 0,

  // Entities
  tiles: [], // 2D [gx][gz]
  units: [],
  zombies: [],
  projectiles: [],
  orbs: [], // floating starlight/shard pickups
  particles: [],
  cineZombies: [],
  cineCritters: [],

  // Camera orbit
  camYaw: 0,
  camPitch: 0.68,
  camZoom: 1.0,
  ready: false,
};

/* ============================================================ Audio (MP3 + WebAudio SFX) */
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

/* ============================================================ Voxel World & Cutscene Setup */
const grassTex = makeBlockTexture('#37b24d', '#2b8a3e');
const darkGrassTex = makeBlockTexture('#2b8a3e', '#237032');
const cryptTex = makeBlockTexture('#495057', '#5f3dc4', true);
const waterTex = makeBlockTexture('#1c7ed6', '#339af0');

let moonMesh = null;
let catnapRig = null;
let altarMesh = null;
const pineTrees = [];
const skyClouds = [];

function buildWorld() {
  tileGroup.clear();
  cineGroup.clear();
  pineTrees.length = 0;
  skyClouds.length = 0;
  S.tiles = [];

  // Build 14x8 Voxel Grid
  for (let gx = 0; gx < GRID_W; gx++) {
    S.tiles[gx] = [];
    for (let gz = 0; gz < GRID_H; gz++) {
      const { x, z } = gridToWorld(gx, gz);
      const isCrypt = gx === GRID_W - 1;
      const isAltar = gx <= 1 && (gz === 3 || gz === 4);
      const isWater = (gx === 7 && (gz === 1 || gz === 6)) || (gx === 8 && gz === 1);
      const hasOre = !isCrypt && !isAltar && !isWater && ((gx === 3 && gz === 1) || (gx === 5 && gz === 6) || (gx === 9 && gz === 2) || (gx === 10 && gz === 5));

      const mat = new THREE.MeshStandardMaterial({
        map: isCrypt ? cryptTex : isWater ? waterTex : (gx + gz) % 2 === 0 ? grassTex : darkGrassTex,
        roughness: isWater ? 0.25 : 0.82,
      });
      const blockH = isWater ? 0.32 : 0.44;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(TILE_SIZE * 0.98, blockH, TILE_SIZE * 0.98), mat);
      mesh.position.set(x, -blockH / 2, z);
      mesh.receiveShadow = true;
      tileGroup.add(mesh);

      // Lit/Fog ring indicator on top of tile
      const ring = box(TILE_SIZE * 0.9, 0.02, TILE_SIZE * 0.9, '#ffd43b', x, 0.01, z, {
        transparent: true,
        opacity: 0.0,
        emissive: '#ffd43b',
        emissiveIntensity: 0.4,
      });
      tileGroup.add(ring);

      let oreMesh = null;
      if (hasOre) {
        oreMesh = new THREE.Group();
        oreMesh.position.set(x, 0, z);
        oreMesh.add(box(0.62, 0.48, 0.62, '#495057', 0, 0.24, 0));
        oreMesh.add(box(0.28, 0.28, 0.28, '#ffd43b', -0.12, 0.46, 0.1, { emissive: '#fcc419', emissiveIntensity: 0.85 }));
        oreMesh.add(box(0.22, 0.24, 0.22, '#74c0fc', 0.16, 0.42, -0.12, { emissive: '#339af0', emissiveIntensity: 0.75 }));
        tileGroup.add(oreMesh);
      }

      const tile = { gx, gz, x, z, isCrypt, isAltar, isWater, hasOre, oreMesh, mesh, ring, unit: null };
      mesh.userData.tile = tile;
      S.tiles[gx][gz] = tile;
    }
  }

  // Base Moon Altar at left (gx = 0.6, gz = 3.5)
  const altarPos = gridToWorld(0.6, 3.5);
  altarMesh = buildMoonAltar();
  altarMesh.position.set(altarPos.x, 0, altarPos.z);
  tileGroup.add(altarMesh);
  altarLight.position.set(altarPos.x, 2.2, altarPos.z);

  // Surrounding Voxel Hills & Swaying Blocky Pine Trees
  for (let i = 0; i < 18; i++) {
    const side = i < 9 ? -1 : 1;
    const tx = -8.5 + (i % 9) * 2.1 + (i % 2) * 0.3;
    const tz = side * (GRID_H * TILE_SIZE * 0.5 + 1.35 + (i % 3) * 0.6);
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);
    tree.add(box(0.7, 0.35, 0.7, '#2b8a3e', 0, -0.17, 0));
    tree.add(box(0.28, 0.75, 0.28, '#5c3c1e', 0, 0.38, 0));
    tree.add(box(0.88, 0.62, 0.88, '#2f9e44', 0, 0.92, 0));
    tree.add(box(0.62, 0.55, 0.62, '#37b24d', 0, 1.38, 0));
    tree.add(box(0.36, 0.42, 0.36, '#40c057', 0, 1.76, 0));
    tileGroup.add(tree);
    pineTrees.push(tree);
  }

  // Slow Drifting Voxel Night Clouds
  for (let i = 0; i < 5; i++) {
    const cl = box(2.2 + (i % 2) * 0.8, 0.38, 1.1, '#2b2354', -9 + i * 4.5, 6.2 + (i % 2) * 0.7, -5.8 - (i % 3) * 0.8, {
      transparent: true,
      opacity: 0.65,
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

  // Reset cutscene actors
  clearGameplayEntities();
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

  // Clear temporary intro zombies & critters
  S.cineZombies.forEach((z) => cineGroup.remove(z));
  S.cineCritters.forEach((c) => cineGroup.remove(c));
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

  // Update timer badge
  const rem = Math.max(0, 10.0 - t).toFixed(1);
  $('cineTimer').textContent = `${rem}s`;

  // Sway trees in the night wind (gentle, child-safe)
  pineTrees.forEach((tr, i) => {
    tr.rotation.z = Math.sin(t * 2.1 + i) * 0.05;
  });

  // ---- PHASE 1 (0.0s -> 3.2s): Cute CatNap transforms into Nightmare CatNap ----
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
      // Morph at t = 1.6s..3.2s
      const p = clamp((t - 1.6) / 1.2, 0, 1);
      cute.visible = p < 0.45;
      cute.scale.setScalar(1 + p * 0.4);
      night.visible = true;
      S.catnapState = 'nightmare';
      night.scale.setScalar(0.35 + 0.65 * p);
      smokeGroup.rotation.y = t * 2.4;
    }
  }
  // ---- PHASE 2 (3.2s -> 6.8s): Nightmare CatNap launches Rocket -> Moon vanishes! ----
  else if (t < 6.8) {
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

    // At t >= 5.7s, rocket hits Moon -> Moon shatters & disappears!
    if (t >= 5.7 && S.moonVisible) {
      S.moonVisible = false;
      moonMesh.visible = false;
      rocket.visible = false;
      sfx('boom');
      // Darker moonless sky
      scene.background.set('#0b081c');
      hemiLight.intensity = 0.42;
      dirLight.intensity = 0.55;
      // Spawn glowing shatter shards
      for (let i = 0; i < 18; i++) {
        spawnBurstCube(1.5, 6.4, -5.5, i % 2 ? '#ffd43b' : '#b197fc', 2.4);
      }
      updateCineText(
        'Phase 2 / 3 · The Moon Is Gone! 🌑',
        'Poof! The Moon shattered into Moon Shards across the valley, plunging Playcare into Moonless Night!'
      );
    }
  }
  // ---- PHASE 3 (6.8s -> 10.0s): Zombies Emerge on Ground & Smiling Critters Rally! ----
  else if (t < 10.0) {
    if (S.introPhase !== 3) {
      S.introPhase = 3;
      sfx('place');
      updateCineText(
        'Phase 3 / 3 · Zombies Emerge & Smiling Critters Rally! 🧟‍♂️✨',
        'Zombies rise from the ground — and lots of Smiling Critters hop in to build, defend, and restore the Moon!'
      );
      // Spawn 5 emerging cutscene zombies on the right side
      const zTypes = ['walker', 'runner', 'bucket', 'digger', 'walker'];
      zTypes.forEach((zt, idx) => {
        const zm = buildVoxelZombie(ZOMBIE_TYPES[zt]);
        const pos = gridToWorld(11.5 + (idx % 2) * 1.1, 1.2 + idx * 1.3);
        zm.position.set(pos.x, -1.2, pos.z);
        cineGroup.add(zm);
        S.cineZombies.push(zm);
      });
      // Spawn 8 Smiling Critters rallying on the left/center
      const cIds = ['sunnyfox', 'lunabat', 'poppydash', 'bobby', 'bubba', 'dogday', 'craftycorn', 'kickin'];
      cIds.forEach((cid, idx) => {
        const cm = buildCritterUnitMesh(UNIT_MAP[cid]);
        const pos = gridToWorld(2.2 + (idx % 3) * 1.35, 1.0 + Math.floor(idx / 3) * 2.2);
        cm.position.set(pos.x, 3.2 + idx * 0.35, pos.z);
        cineGroup.add(cm);
        S.cineCritters.push({ mesh: cm, targetY: 0, delay: idx * 0.12 });
      });
    }

    // Camera pulls back to wide isometric battlefield view
    const k = clamp((t - 6.8) / 3.0, 0, 1);
    camera.position.set(0, 5.5 + k * 5.2, 6.2 + k * 5.6);
    camera.lookAt(0, 0.4, -0.5);

    // Zombies rise out of the ground (-1.2 -> 0)
    const zRise = clamp((t - 6.9) / 1.4, 0, 1);
    S.cineZombies.forEach((zm, i) => {
      zm.position.y = -1.2 + zRise * 1.2;
      zm.rotation.y = Math.sin(t * 4 + i) * 0.15;
    });

    // Smiling Critters drop in & bounce cheerfully
    S.cineCritters.forEach((c, i) => {
      const ck = clamp((t - 7.1 - c.delay) / 0.9, 0, 1);
      c.mesh.position.y = (1 - ck) * 3.2 + Math.abs(Math.sin(t * 6 + i)) * 0.12;
    });
  } else {
    // 10.0s reached -> Start the game!
    finishIntroAndStartGame();
  }
}

function finishIntroAndStartGame() {
  // Clean up cutscene temporary actors
  S.cineZombies.forEach((z) => cineGroup.remove(z));
  S.cineCritters.forEach((c) => cineGroup.remove(c.mesh));
  S.cineZombies = [];
  S.cineCritters = [];

  // Keep Nightmare CatNap watching from the far north hill until the Moon is restored
  const { cute, night, rocket } = catnapRig.userData;
  cute.visible = false;
  night.visible = true;
  night.scale.setScalar(1);
  rocket.visible = false;
  S.catnapState = 'nightmare';
  S.moonVisible = false;
  if (moonMesh) moonMesh.visible = false;
  scene.background.set('#0e0a24');
  hemiLight.intensity = 0.52;
  dirLight.intensity = 0.72;

  S.screen = 'play';
  document.body.classList.remove('inIntro', 'titleScreen');
  $('cineBanner').classList.add('hidden');
  $('titleModal').classList.add('hidden');

  // Populate starter Critters & emerging opening Zombies if fresh game
  if (S.units.length === 0) {
    setupStarterVillage();
  }
  framePlayCamera();
  playMusic('village');
  say('The Moon is gone! Build SunnyFox Lanterns, Bobby Walls & LunaBat Towers to collect 100 Moon Shards!', 4.2);
  updateHUD();
}

/* ============================================================ Gameplay Setup & Building */
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
      if (S.tiles[gx] && S.tiles[gx][gz]) S.tiles[gx][gz].unit = null;
    }
  }
}

function resetGame(playIntro = false) {
  clearGameplayEntities();
  S.starlight = 125;
  S.blocks = 6;
  S.moonShards = 0;
  S.baseHp = 500;
  S.baseMaxHp = 500;
  S.wave = 1;
  S.spawnTimer = 2.0;
  // Restore mined ores
  for (let gx = 0; gx < GRID_W; gx++) {
    for (let gz = 0; gz < GRID_H; gz++) {
      const t = S.tiles[gx][gz];
      if (t.oreMesh) {
        t.hasOre = true;
        t.oreMesh.visible = true;
      }
    }
  }
  if (playIntro) {
    startIntroCutscene();
  } else {
    finishIntroAndStartGame();
  }
}

function setupStarterVillage() {
  // Starter squad representing all 3 functional roles (Produce, Defend, Attack) + High-Ground Watchtower
  placeCritterUnit(2, 3, 'sunnyfox', true); // Produce + Lantern Light
  placeCritterUnit(2, 5, 'poppydash', true); // Produce + Popcorn Haste
  placeCritterUnit(6, 3, 'bobby', true); // Defend Wall
  placeCritterUnit(6, 5, 'bubba', true); // Defend Slow Moat
  placeCritterUnit(4, 3, 'lunabat', true); // Attack Pierce
  placeCritterUnit(4, 5, 'dogday', true); // Attack Splash
  placeCritterUnit(5, 2, 'mikey', true); // Defend Watchtower
  placeCritterUnit(5, 2, 'craftycorn', true); // Stacked Sniper on Watchtower!

  // Spawn 3 initial zombies emerging on the right so combat starts immediately
  spawnZombie('walker', 3);
  spawnZombie('runner', 5);
  spawnZombie('bucket', 2);
}

function countUnitType(unitId) {
  let n = 0;
  for (const u of S.units) {
    if (u.def.id === unitId) n++;
    if (u.mounted && u.mounted.def.id === unitId) n++;
  }
  return n;
}

function placeCritterUnit(gx, gz, unitId, free = false) {
  if (gx < 0 || gx >= GRID_W || gz < 0 || gz >= GRID_H) return { ok: false, reason: 'out_of_bounds' };
  const tile = S.tiles[gx][gz];
  if (tile.isCrypt || tile.isAltar) return { ok: false, reason: 'reserved_tile' };
  if (tile.isWater && unitId !== 'bubba') return { ok: false, reason: 'water_tile' };

  const def = UNIT_MAP[unitId];
  if (!def) return { ok: false, reason: 'unknown_unit' };

  // Check if tile has an existing unit:
  // Case A: Tile has a Mikey & JJ Watchtower (`stackable`) and we are placing an Attack Critter on top!
  if (tile.unit && tile.unit.def.stackable && !tile.unit.mounted && def.role === 'attack') {
    const cost = free ? 0 : computeDynamicCost(unitId, countUnitType(unitId));
    if (!free && !S.sandbox && S.starlight < cost) {
      say(`Need ${cost} 🌟 Starlight!`, 1.8);
      return { ok: false, reason: 'no_starlight' };
    }
    if (!free && !S.sandbox) S.starlight -= cost;
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
    spawnBurstCube(tile.x, 1.4, tile.z, def.color, 1.2);
    updatetileLightVisuals();
    updateHUD();
    return { ok: true, action: 'mounted', unit: tile.unit };
  }

  // Case B: Tile already has the SAME unit -> Upgrade it!
  if (tile.unit && tile.unit.def.id === unitId) {
    return upgradeUnitAt(gx, gz, free);
  }

  if (tile.unit) return { ok: false, reason: 'occupied' };

  const cost = free ? 0 : computeDynamicCost(unitId, countUnitType(unitId));
  if (!free && !S.sandbox && S.starlight < cost) {
    say(`Need ${cost} 🌟 Starlight for ${def.name}!`, 1.8);
    return { ok: false, reason: 'no_starlight' };
  }
  if (!free && !S.sandbox) S.starlight -= cost;

  // If tile had a crystal ore, auto-harvest a bonus when building on it
  if (tile.hasOre) {
    tile.hasOre = false;
    if (tile.oreMesh) tile.oreMesh.visible = false;
    if (!free) {
      S.starlight += 15;
      addMoonShards(2);
    }
  }

  const mesh = buildCritterUnitMesh(def);
  mesh.position.set(tile.x, 0, tile.z);
  unitGroup.add(mesh);

  const unit = {
    gx,
    gz,
    x: tile.x,
    z: tile.z,
    def,
    level: 1,
    hp: def.hp,
    maxHp: def.hp,
    cooldown: 0.5,
    prodTimer: def.prodInterval ? def.prodInterval * 0.6 : 0,
    mesh,
    mounted: null,
  };
  tile.unit = unit;
  S.units.push(unit);
  if (!free) {
    sfx('place');
    spawnBurstCube(tile.x, 0.7, tile.z, def.color, 1.0);
  }
  updatetileLightVisuals();
  updateHUD();
  return { ok: true, action: 'placed', unit };
}

function upgradeUnitAt(gx, gz, free = false) {
  const tile = S.tiles[gx]?.[gz];
  if (!tile || !tile.unit) return { ok: false, reason: 'empty' };
  const u = tile.unit;
  if (u.level >= 3) {
    say(`${u.def.name} is already MAX Level 3! ⭐`, 1.6);
    return { ok: false, reason: 'max_level' };
  }
  const upCost = free ? 0 : Math.round(u.def.baseCost * 0.85 * u.level);
  if (!free && !S.sandbox && S.starlight < upCost) {
    say(`Need ${upCost} 🌟 to upgrade ${u.def.name}!`, 1.8);
    return { ok: false, reason: 'no_starlight' };
  }
  if (!free && !S.sandbox) S.starlight -= upCost;
  u.level++;
  u.maxHp = Math.round(u.def.hp * (1 + (u.level - 1) * 0.45));
  u.hp = u.maxHp;
  if (u.mounted) u.mounted.level = u.level;
  if (u.mesh.userData.crown) u.mesh.userData.crown.visible = true;
  u.mesh.scale.setScalar(1 + (u.level - 1) * 0.1);
  sfx('star');
  spawnBurstCube(u.x, 1.2, u.z, '#ffd43b', 1.3);
  updateHUD();
  return { ok: true, action: 'upgraded', level: u.level };
}

function digOrMineAt(gx, gz) {
  const tile = S.tiles[gx]?.[gz];
  if (!tile) return { ok: false, reason: 'invalid' };
  if (tile.unit) {
    const u = tile.unit;
    const refund = Math.round(u.def.baseCost * 0.8);
    S.starlight += refund;
    unitGroup.remove(u.mesh);
    S.units = S.units.filter((x) => x !== u);
    tile.unit = null;
    sfx('dig');
    spawnBurstCube(tile.x, 0.5, tile.z, '#ffd43b', 0.9);
    updatetileLightVisuals();
    updateHUD();
    return { ok: true, action: 'refunded', refund };
  }
  if (tile.hasOre) {
    tile.hasOre = false;
    if (tile.oreMesh) tile.oreMesh.visible = false;
    S.starlight += 22;
    addMoonShards(4);
    sfx('star');
    spawnBurstCube(tile.x, 0.5, tile.z, '#ffd43b', 1.4);
    say('Mined Starlight Ore! +22 🌟 & +4 🌙 Moon Shards!', 2.2);
    updateHUD();
    return { ok: true, action: 'mined_ore' };
  }
  return { ok: false, reason: 'nothing_to_dig' };
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

/* ============================================================ Zombies & Combat */
function spawnZombie(typeId = 'walker', gz = Math.floor(Math.random() * GRID_H)) {
  const def = ZOMBIE_TYPES[typeId] || ZOMBIE_TYPES.walker;
  const row = clamp(gz, 0, GRID_H - 1);
  const pos = gridToWorld(GRID_W - 0.8, row);
  const mesh = buildVoxelZombie(def);
  mesh.position.set(pos.x, -0.9, pos.z); // starts underground and emerges!
  zombieGroup.add(mesh);

  const z = {
    def,
    typeId: def.id,
    gx: GRID_W - 0.8,
    gz: row,
    x: pos.x,
    z: pos.z,
    emergeT: 0, // 0 -> 1 emergence animation from ground
    hp: def.hp,
    maxHp: def.hp,
    vuln: 0, // CraftyCorn rainbow vulnerability bonus
    slowTimer: 0,
    mesh,
  };
  S.zombies.push(z);
  spawnBurstCube(pos.x, 0.15, pos.z, '#69db7c', 0.8);
  return z;
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
    moonMesh.position.set(1.5, 6.4, -5.5);
  }
  const { cute, night } = catnapRig.userData;
  cute.visible = true;
  cute.scale.setScalar(1.15);
  night.visible = false;

  // Bright warm moonlit sky restored
  scene.background.set('#1f1942');
  hemiLight.intensity = 1.05;
  dirLight.intensity = 1.65;

  // Pop all remaining zombies into golden flowers/stars
  for (const z of S.zombies) {
    spawnBurstCube(z.x, 0.7, z.z, '#ffd43b', 1.5);
    zombieGroup.remove(z.mesh);
  }
  S.zombies = [];
  updatetileLightVisuals();
  sfx('win');
  say('Hooray! The Full Moon is back and CatNap is cute again! 🌕💜', 5.0);
  $('victoryModal').classList.remove('hidden');
  updateHUD();
}

function spawnProjectile(fromUnit, targetZombie, atkDef, level, powerMult) {
  const isMounted = fromUnit.mounted && fromUnit.mounted.def === atkDef;
  const startY = isMounted ? 1.55 : 0.75;
  const m = box(0.24, 0.24, 0.24, atkDef.color, fromUnit.x, startY, fromUnit.z, {
    emissive: atkDef.color,
    emissiveIntensity: 0.85,
  });
  projGroup.add(m);

  const lvMult = 1 + (level - 1) * 0.4;
  const towerMult = isMounted ? fromUnit.def.towerDmgBonus || 1.25 : 1.0;
  const dmg = Math.round(atkDef.atk * lvMult * towerMult * powerMult);

  S.projectiles.push({
    x: fromUnit.x,
    y: startY,
    z: fromUnit.z,
    target: targetZombie,
    def: atkDef,
    dmg,
    mesh: m,
    pierceLeft: (atkDef.pierce || 1) - 1,
    hitSet: new Set(),
  });
}

function applyDamageToZombie(z, rawDmg, atkDef) {
  const armor = z.def.armor || 0;
  const vulnMult = 1 + (z.vuln || 0);
  const dmg = Math.max(2, Math.round(rawDmg * (1 - armor) * vulnMult));
  z.hp -= dmg;
  if (atkDef?.vulnBonus) z.vuln = Math.max(z.vuln, atkDef.vulnBonus);
  if (atkDef?.knockback) {
    z.x = Math.min(gridToWorld(GRID_W - 0.6, 0).x, z.x + atkDef.knockback * TILE_SIZE * 0.35);
  }
  // Update overhead HP bar
  const ratio = clamp(z.hp / z.maxHp, 0, 1);
  z.mesh.userData.hpFill.scale.x = Math.max(0.01, ratio);

  if (z.hp <= 0 && !z.dead) {
    z.dead = true;
    const bal = computeBalanceState(S);
    const starGain = z.def.rewardStar;
    const shardGain = z.def.rewardShard + (atkDef?.shardBonus || 0) + bal.shardDropBonus;
    S.starlight += starGain;
    addMoonShards(shardGain);
    spawnPickupOrb(z.x, z.z, '#ffd43b');
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

/* ============================================================ Simulation Step */
function stepGameplay(rawDt) {
  const speedFactor = S.speedMode === 'normal' ? 1.0 : 0.58; // 5yo gentle default!
  const dt = rawDt * speedFactor;
  S.time += dt;

  // Rotate Altar Crystal & Moon
  if (altarMesh?.userData.crystal) {
    altarMesh.userData.crystal.rotation.y += dt * 1.2;
  }
  if (moonMesh && moonMesh.visible) {
    moonMesh.rotation.y += dt * 0.25;
  }
  if (S.speedMode !== 'freeze_bg') {
    skyClouds.forEach((c, i) => {
      c.position.x += dt * 0.18 * (i % 2 ? 1 : 0.7);
      if (c.position.x > 11) c.position.x = -11;
    });
  }

  const bal = computeBalanceState(S);
  const powerMult = bal.harmony.powerMult;
  const moonUp = S.moonShards >= S.moonTarget;

  // Passive Starlight trickle & Adaptive Care Package Assist
  S.passiveTimer += dt;
  if (S.passiveTimer >= 2.5) {
    S.passiveTimer = 0;
    S.starlight += 4;
    if (bal.carePackageGift > 0 && S.carePackageCooldown <= 0) {
      S.starlight += bal.carePackageGift;
      S.carePackageCooldown = 14;
      say(`🎁 Care Package from SunnyFox: +${bal.carePackageGift} 🌟 Starlight!`, 2.4);
    }
    updateHUD();
  }
  if (S.carePackageCooldown > 0) S.carePackageCooldown -= dt;

  // Step All Placed Critter Units (Produce, Defend, Attack + Mounted Watchtower Attackers)
  for (const u of S.units) {
    // Gentle idle bob
    if (u.mesh.userData.critterGroup) {
      u.mesh.userData.critterGroup.position.y =
        (u.def.id === 'mikey' ? 0.92 : u.def.id === 'bobby' ? 0.66 : 0.22) +
        Math.sin(S.time * 3 + u.gx) * 0.03;
    }
    if (u.mesh.userData.spinner) {
      u.mesh.userData.spinner.rotation.z += dt * 2.2;
    }

    // Check if boosted by nearby PoppyDash Popcorn Windmill
    let haste = 1.0;
    for (const other of S.units) {
      if (other.def.hasteRadius && Math.hypot(other.gx - u.gx, other.gz - u.gz) <= other.def.hasteRadius) {
        haste = Math.max(haste, other.def.hasteMult || 1.35);
      }
    }

    // 1. PRODUCE role
    if (u.def.role === 'produce') {
      u.prodTimer -= dt * haste;
      if (u.prodTimer <= 0) {
        u.prodTimer = u.def.prodInterval || 4.0;
        const lvMult = 1 + (u.level - 1) * 0.4;
        const gain = Math.round((u.def.prodAmount || 8) * lvMult * powerMult);
        S.starlight += gain;
        addMoonShards(1);
        spawnPickupOrb(u.x, u.z, u.def.accent);
        updateHUD();
      }
      // PickyPiggy Heal Aura
      if (u.def.healPerSec) {
        for (const ally of S.units) {
          if (ally.hp < ally.maxHp && Math.hypot(ally.gx - u.gx, ally.gz - u.gz) <= u.def.healRadius) {
            ally.hp = Math.min(ally.maxHp, ally.hp + u.def.healPerSec * dt);
          }
        }
      }
    }

    // 2. ATTACK role (or Mounted Attack Critter on Mikey & JJ Watchtower)
    const shooters = [];
    if (u.def.role === 'attack') shooters.push({ state: u, def: u.def, isMounted: false });
    if (u.mounted) shooters.push({ state: u.mounted, def: u.mounted.def, isMounted: true });

    for (const sh of shooters) {
      sh.state.cooldown -= dt * haste;
      if (sh.state.cooldown <= 0 && S.zombies.length > 0) {
        const lit = isTileIlluminated(u.gx, u.gz, S.units, moonUp);
        const lightMult = lit ? 1.0 : 0.7; // Night Fog penalty if unlit!
        const towerMult = sh.isMounted ? u.def.towerRangeBonus || 1.4 : 1.0;
        const maxRange = (sh.def.range || 4.2) * lightMult * towerMult * TILE_SIZE;

        // Find closest zombie in range
        let bestZ = null;
        let bestDist = Infinity;
        for (const z of S.zombies) {
          if (z.dead) continue;
          const d = Math.hypot(z.x - u.x, z.z - u.z);
          if (d <= maxRange && d < bestDist) {
            bestDist = d;
            bestZ = z;
          }
        }
        if (bestZ) {
          sh.state.cooldown = sh.def.fireInterval || 1.1;
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
    const dx = p.target.x - p.x;
    const dz = p.target.z - p.z;
    const dist = Math.hypot(dx, dz);
    const step = 8.5 * dt;
    if (dist <= step + 0.25) {
      // Hit!
      if (p.def.splashRadius) {
        const rad = p.def.splashRadius * TILE_SIZE;
        for (const z of S.zombies) {
          if (!z.dead && Math.hypot(z.x - p.target.x, z.z - p.target.z) <= rad) {
            applyDamageToZombie(z, p.dmg, p.def);
          }
        }
      } else if (p.def.chainTargets) {
        const sorted = S.zombies
          .filter((z) => !z.dead && Math.hypot(z.x - p.target.x, z.z - p.target.z) <= 2.4 * TILE_SIZE)
          .slice(0, p.def.chainTargets);
        sorted.forEach((z) => applyDamageToZombie(z, p.dmg, p.def));
      } else {
        applyDamageToZombie(p.target, p.dmg, p.def);
      }

      projGroup.remove(p.mesh);
      S.projectiles.splice(i, 1);
    } else {
      p.x += (dx / dist) * step;
      p.z += (dz / dist) * step;
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.y += dt * 8;
    }
  }

  // Step Zombies (Emergence, Slow Moats, Wall Blocking, Altar Attack)
  for (let i = S.zombies.length - 1; i >= 0; i--) {
    const z = S.zombies[i];
    if (z.dead) {
      S.zombies.splice(i, 1);
      continue;
    }
    if (z.emergeT < 1) {
      z.emergeT = Math.min(1, z.emergeT + dt * 1.4);
      z.mesh.position.y = -0.9 * (1 - z.emergeT);
      continue;
    }

    // Check Bubba Slow Moat or SunnyFox Lantern warmth
    let speedMult = 1.0;
    let dmgReduction = 1.0;
    for (const u of S.units) {
      const distTiles = Math.hypot((z.x - u.x) / TILE_SIZE, (z.z - u.z) / TILE_SIZE);
      if (u.def.slowRadius && distTiles <= u.def.slowRadius) {
        speedMult = Math.min(speedMult, u.def.slowFactor || 0.5);
        dmgReduction = 1 - (u.def.shieldAura || 0.25);
      }
      if (u.def.lightRadius && distTiles <= u.def.lightRadius) {
        speedMult = Math.min(speedMult, 0.85);
      }
    }

    // Check if blocked by a Critter Unit in the same or adjacent front tile
    let blocker = null;
    for (const u of S.units) {
      if (Math.abs(u.z - z.z) < TILE_SIZE * 0.58 && z.x >= u.x && z.x - u.x < TILE_SIZE * 0.78) {
        blocker = u;
        break;
      }
    }

    if (blocker) {
      // Chew on the unit / wall
      const zDmg = z.def.dps * dmgReduction * dt;
      blocker.hp -= zDmg;
      if (blocker.def.thornsDmg) {
        applyDamageToZombie(z, blocker.def.thornsDmg * dt, blocker.def);
      }
      z.mesh.userData.armL.rotation.z = Math.sin(S.time * 10) * 0.35;
      z.mesh.userData.armR.rotation.z = -Math.sin(S.time * 10) * 0.35;

      if (blocker.hp <= 0) {
        // If Mikey & JJ Watchtower breaks, trigger mini-TNT blast!
        if (blocker.def.deathBlastDmg) {
          sfx('boom');
          for (const zz of S.zombies) {
            if (!zz.dead && Math.hypot(zz.x - blocker.x, zz.z - blocker.z) <= 2.2 * TILE_SIZE) {
              applyDamageToZombie(zz, blocker.def.deathBlastDmg, blocker.def);
            }
          }
        }
        unitGroup.remove(blocker.mesh);
        S.tiles[blocker.gx][blocker.gz].unit = null;
        S.units = S.units.filter((u) => u !== blocker);
        updatetileLightVisuals();
      }
    } else {
      // Walk west toward the Moon Altar
      const move = z.def.speed * speedMult * TILE_SIZE * dt;
      z.x -= move;
      z.mesh.position.set(z.x, 0, z.z);
      z.mesh.userData.legL.rotation.z = Math.sin(S.time * 6 + i) * 0.35;
      z.mesh.userData.legR.rotation.z = -Math.sin(S.time * 6 + i) * 0.35;

      const altarX = gridToWorld(1.1, z.gz).x;
      if (z.x <= altarX) {
        // Reached Moon Altar: deal gentle damage & pop!
        S.baseHp = Math.max(50, S.baseHp - 18); // never hard-game-over for 5yo; SunnyFox repairs!
        spawnBurstCube(z.x, 0.7, z.z, '#fa5252', 1.1);
        zombieGroup.remove(z.mesh);
        S.zombies.splice(i, 1);
        updateHUD();
      }
    }
  }

  // Auto-Spawn Zombie Waves (paced by Adaptive Director)
  if (!S.sandbox && !moonUp) {
    S.spawnTimer -= dt;
    if (S.spawnTimer <= 0) {
      const baseWait = S.zombies.length > 6 ? 6.5 : 4.4;
      S.spawnTimer = baseWait * bal.spawnIntervalMult;
      const pool =
        S.moonShards > 70
          ? ['walker', 'runner', 'bucket', 'digger', 'nightmare_boss']
          : S.moonShards > 35
          ? ['walker', 'runner', 'bucket', 'digger']
          : ['walker', 'runner', 'bucket'];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      spawnZombie(pick, Math.floor(Math.random() * GRID_H));
      updateHUD();
    }
  }

  // Step Floating Pickup Orbs & Particles
  for (let i = S.orbs.length - 1; i >= 0; i--) {
    const o = S.orbs[i];
    o.age += rawDt;
    o.mesh.position.y = 0.45 + Math.sin(S.time * 4 + i) * 0.12;
    o.mesh.rotation.y += rawDt * 2.5;
    if (o.age >= 2.2) {
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

/* ============================================================ Camera & Pointer Interaction */
function framePlayCamera() {
  const dist = 13.2 / S.camZoom;
  const x = Math.sin(S.camYaw) * dist * Math.cos(S.camPitch);
  const y = Math.sin(S.camPitch) * dist + 1.2;
  const z = Math.cos(S.camYaw) * dist * Math.cos(S.camPitch) + 0.8;
  camera.position.set(x, y, z);
  camera.lookAt(0, 0.2, -0.3);
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
    S.camYaw = clamp(S.camYaw - dx * 0.005, -0.55, 0.55);
    S.camPitch = clamp(S.camPitch + dy * 0.004, 0.42, 1.05);
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
    digOrMineAt(gx, gz);
  } else if (S.selectedTool === 'tool_upgrade') {
    upgradeUnitAt(gx, gz);
  } else {
    placeCritterUnit(gx, gz, S.selectedTool);
  }
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
    ['all', '🌈 All (10)'],
    ['produce', '⛏️ Produce (3)'],
    ['defend', '🛡️ Defend (3)'],
    ['attack', '⚔️ Attack (4)'],
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

  const visibleUnits = UNITS.filter((u) => S.roleFilter === 'all' || u.role === S.roleFilter);
  for (const u of visibleUnits) {
    const card = document.createElement('button');
    card.className = `ucard role-${u.role}` + (S.selectedTool === u.id ? ' sel' : '');
    card.dataset.id = u.id;
    const cost = computeDynamicCost(u.id, countUnitType(u.id));
    card.innerHTML = `
      <span class="rbadge">${roleBadge[u.role]}</span>
      <img src="${u.icon}" alt="${u.name}">
      <b>${u.name}</b>
      <em class="cost">🌟 ${cost}</em>
    `;
    card.onclick = () => {
      initAudio();
      S.selectedTool = u.id;
      updateInspector();
      buildDockUI();
    };
    bar.appendChild(card);
  }

  // Voxel Utility Tools (Upgrade & Dig/Mine)
  const tools = [
    { id: 'tool_upgrade', name: 'Upgrade', icon: '⬆️', sub: 'Lv.2 / Lv.3' },
    { id: 'tool_dig', name: 'Mine / Move', icon: '⛏️', sub: '+🌟 Ore / 80%' },
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
  updateInspector();
}

function updateInspector() {
  const el = $('unitInfo');
  if (S.selectedTool === 'tool_upgrade') {
    el.textContent = '⬆️ Tap any placed Critter on the board to upgrade it to Star Lv.2 / Lv.3 (+40% power & HP)!';
    return;
  }
  if (S.selectedTool === 'tool_dig') {
    el.textContent = '⛏️ Tap glowing Crystal Rocks to mine +22 🌟 & +4 🌙 Shards, or tap a unit to refund 80% 🌟!';
    return;
  }
  const def = UNIT_MAP[S.selectedTool];
  if (def) {
    const cost = computeDynamicCost(def.id, countUnitType(def.id));
    el.textContent = `${def.name} · ${def.title} (🌟 ${cost}): ${def.blurb}`;
  }
}

function updateHUD() {
  $('starVal').textContent = S.starlight;
  $('hpVal').textContent = `${Math.ceil(S.baseHp)}/${S.baseMaxHp}`;
  $('shardText').textContent = `${S.moonShards} / ${S.moonTarget}`;
  $('shardFill').style.width = `${clamp((S.moonShards / S.moonTarget) * 100, 0, 100)}%`;

  const bal = computeBalanceState(S);
  $('harmonyBadge').textContent = `✨ Lv.${bal.harmony.level} (${Math.round((bal.harmony.powerMult - 1) * 100)}%)`;
  $('harmonyBadge').title = bal.harmony.label;
  $('balanceBadge').textContent = `⚖️ P=${bal.pressureIndex} · ${bal.directorMode}`;

  // Update dynamic costs on hotbar cards without rebuilding DOM
  document.querySelectorAll('#hotbar .ucard').forEach((c) => {
    const id = c.dataset.id;
    if (UNIT_MAP[id]) {
      const costEl = c.querySelector('.cost');
      if (costEl) costEl.textContent = `🌟 ${computeDynamicCost(id, countUnitType(id))}`;
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
  $('speedBtn').onclick = () => {
    const order = ['gentle', 'normal', 'freeze_bg'];
    const labels = { gentle: '🐌 Gentle', normal: '🚶 Normal', freeze_bg: '⏸ Calm BG' };
    S.speedMode = order[(order.indexOf(S.speedMode) + 1) % order.length];
    $('speedBtn').textContent = labels[S.speedMode];
  };
  $('modeBtn').onclick = () => {
    S.sandbox = !S.sandbox;
    $('modeBtn').textContent = S.sandbox ? '🧱 Sandbox' : '🌙 Rescue';
    if (S.sandbox) S.starlight = Math.max(S.starlight, 999);
    updateHUD();
  };
  $('spawnWaveBtn').onclick = () => {
    initAudio();
    if (S.screen !== 'play') return;
    ['walker', 'runner', 'bucket'].forEach((t, i) => spawnZombie(t, (i * 2 + 1) % GRID_H));
    S.starlight += 25;
    say('Spawned a Zombie Wave + 25 🌟 bonus Starlight!', 2.2);
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

/* ============================================================ Main Animation Loop */
let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (!S.paused) {
    if (S.screen === 'title') {
      camera.position.set(Math.sin(now * 0.0003) * 4, 7.5, 11.5);
      camera.lookAt(0, 1.0, -1.5);
    } else if (S.screen === 'intro') {
      stepIntroCutscene(dt);
    } else if (S.screen === 'play') {
      stepGameplay(dt);
    }
  }
  renderer.render(scene, camera);
}

/* ============================================================ Deterministic Test Hooks */
window.__MOONCRAFT__ = {
  S,
  UNITS,
  ZOMBIE_TYPES,
  startIntro: () => startIntroCutscene(),
  skipIntro: () => finishIntroAndStartGame(),
  stepIntro: (sec) => {
    const steps = Math.ceil(sec / 0.05);
    for (let i = 0; i < steps && S.screen === 'intro'; i++) stepIntroCutscene(0.05);
    renderer.render(scene, camera);
    return {
      screen: S.screen,
      introTime: Number(S.introTime.toFixed(2)),
      introPhase: S.introPhase,
      catnapState: S.catnapState,
      moonVisible: S.moonVisible,
      cineZombies: S.cineZombies.length,
      cineCritters: S.cineCritters.length,
    };
  },
  place: (gx, gz, id, free = false) => placeCritterUnit(gx, gz, id, free),
  upgrade: (gx, gz, free = false) => upgradeUnitAt(gx, gz, free),
  dig: (gx, gz) => digOrMineAt(gx, gz),
  spawnZombie: (typeId, gz) => spawnZombie(typeId, gz),
  tick: (n = 60) => {
    for (let i = 0; i < n; i++) stepGameplay(1 / 30);
    renderer.render(scene, camera);
    return computeBalanceState(S);
  },
  addShards: (n) => {
    addMoonShards(n);
    renderer.render(scene, camera);
    return { moonShards: S.moonShards, moonVisible: S.moonVisible, catnapState: S.catnapState };
  },
  balance: () => computeBalanceState(S),
  lit: (gx, gz) => isTileIlluminated(gx, gz, S.units, S.moonShards >= S.moonTarget),
};

/* ============================================================ Boot */
buildWorld();
buildDockUI();
bindTopBar();
layout();
S.ready = true;
// Automatically start the 10-second opening animation on launch, while keeping Title reachable via ⏹
startIntroCutscene();
requestAnimationFrame(animate);
