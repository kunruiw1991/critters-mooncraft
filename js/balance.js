// ============================================================================
// CRITTERCRAFT: MOONLESS NIGHT — BALANCED, FUN & ACCESSIBLE GAMEPLAY CONFIG
// Designed for smooth PvZ-style progressive waves:
// - Casual / Kid Play (placing a few gatherers & defenders) feels rewarding and winnable!
// - AFK (doing nothing) survives early scouting Wave 1-2 via starter guard + castle beam, then loses in Wave 3-4.
// - Strategic Play (veins + upgrades + Moon Forge) clears stages fast with 3 Stars!
// ============================================================================

export const INITIAL_RESOURCES = {
  sun: 150,
  wood: 80,
  stone: 80,
  crystal: 25
};

export const RESOURCE_META = {
  sun:     { id: 'sun',     symbol: '☀️', color: '#ffd43b' },
  wood:    { id: 'wood',    symbol: '🪵', color: '#51cf66' },
  stone:   { id: 'stone',   symbol: '🪨', color: '#74c0fc' },
  crystal: { id: 'crystal', symbol: '💎', color: '#da77f2' }
};

// Moon Sanctuary Forge Recipe: Convert all 4 resources into +6 Moon Shards + Starlight Shockwave!
export const MOON_FORGE_RECIPE = {
  cost: { sun: 20, wood: 10, stone: 10, crystal: 5 },
  shards: 6
};

// ==================== 10 CRITTERS IN 3-TIER TACTICAL HIERARCHY ====================
export const UNITS = [
  // -------------------- TIER 1: GATHERERS & SUPPORT --------------------
  {
    id: 'sunnyfox',
    tier: 1,
    role: 'produce',
    icon: 'icons/sunnyfox.jpg',
    portrait: 'icons/sunnyfox.jpg',
    fxIcon: '☀️',
    color: '#f59f00',
    accent: '#fff3bf',
    cost: { sun: 30, wood: 0, stone: 0, crystal: 0 },
    hp: 250,
    prod: { sun: 14, wood: 0, stone: 0, crystal: 0 },
    prodInterval: 3.5,
    veinBonusNode: 'sun',
    veinMult: 1.75,
    atk: 14,
    fireInterval: 1.4,
    range: 3.2,
    antiAir: false,
    lightRadius: 3.5
  },
  {
    id: 'poppydash',
    tier: 1,
    role: 'produce',
    icon: 'icons/poppydash.jpg',
    portrait: 'icons/poppydash.jpg',
    fxIcon: '🪵',
    color: '#495057',
    accent: '#74c0fc',
    cost: { sun: 30, wood: 10, stone: 0, crystal: 0 },
    hp: 260,
    prod: { sun: 0, wood: 10, stone: 0, crystal: 0 },
    prodInterval: 3.5,
    veinBonusNode: 'wood',
    veinMult: 1.75,
    hasteRadius: 2.8,
    hasteMult: 1.30,
    atk: 15,
    fireInterval: 1.35,
    range: 3.2,
    antiAir: false,
    knockback: 0.15
  },
  {
    id: 'picky',
    tier: 1,
    role: 'produce',
    icon: 'icons/picky.jpg',
    portrait: 'icons/picky.jpg',
    fxIcon: '🪨',
    color: '#f783ac',
    accent: '#ffdeeb',
    cost: { sun: 30, wood: 0, stone: 10, crystal: 0 },
    hp: 290,
    prod: { sun: 0, wood: 0, stone: 10, crystal: 0 },
    prodInterval: 3.5,
    veinBonusNode: 'stone',
    veinMult: 1.75,
    healRadius: 3.0,
    healPerSec: 24,
    atk: 15,
    fireInterval: 1.4,
    range: 3.0,
    splashRadius: 0.8,
    antiAir: false
  },

  // -------------------- TIER 2: CRYSTAL MINER, DEFENDERS & ARCHER --------------------
  {
    id: 'bubba',
    tier: 2,
    role: 'defend',
    icon: 'icons/bubba.jpg',
    portrait: 'icons/bubba.jpg',
    fxIcon: '💎',
    color: '#339af0',
    accent: '#d0ebff',
    cost: { sun: 35, wood: 10, stone: 10, crystal: 0 },
    hp: 380,
    amphibious: true,
    prod: { sun: 0, wood: 0, stone: 0, crystal: 8 },
    prodInterval: 3.6,
    veinBonusNode: 'crystal',
    veinMult: 1.75,
    slowRadius: 3.2,
    slowFactor: 0.50,
    atk: 20,
    fireInterval: 1.25,
    range: 3.6,
    antiAir: true
  },
  {
    id: 'bobby',
    tier: 2,
    role: 'defend',
    icon: 'icons/bobby.jpg',
    portrait: 'icons/bobby.jpg',
    fxIcon: '🧱',
    color: '#e03131',
    accent: '#ffc9c9',
    cost: { sun: 25, wood: 0, stone: 20, crystal: 0 },
    hp: 920,
    thornsDmg: 30,
    blastResist: 0.70,
    atk: 30,
    fireInterval: 1.3,
    range: 2.3,
    splashRadius: 1.5,
    antiAir: false
  },
  {
    id: 'mikey',
    tier: 2,
    role: 'defend',
    icon: 'icons/mikey.jpg',
    portrait: 'icons/mikey.jpg',
    fxIcon: '🗼',
    color: '#37b24d',
    accent: '#b2f2bb',
    cost: { sun: 25, wood: 15, stone: 15, crystal: 0 },
    hp: 540,
    stackable: true,
    towerRangeBonus: 1.40,
    towerDmgBonus: 1.30,
    grantsAntiAir: true,
    atk: 24,
    fireInterval: 1.1,
    range: 4.6,
    antiAir: true,
    deathBlastDmg: 150
  },
  {
    id: 'lunabat',
    tier: 2,
    role: 'attack',
    icon: 'icons/lunabat.jpg',
    portrait: 'icons/lunabat.jpg',
    fxIcon: '🏹',
    color: '#7950f2',
    accent: '#e5dbff',
    cost: { sun: 35, wood: 20, stone: 0, crystal: 0 },
    hp: 260,
    atk: 38,
    fireInterval: 0.78,
    range: 5.2,
    pierce: 2,
    antiAir: true,
    bonusVsFlyerCreeper: 1.80
  },

  // -------------------- TIER 3: ARCANE & SIEGE SPECIALISTS --------------------
  {
    id: 'dogday',
    tier: 3,
    role: 'attack',
    icon: 'icons/dogday.jpg',
    portrait: 'icons/dogday.jpg',
    fxIcon: '💥',
    color: '#fd7e14',
    accent: '#ffe8cc',
    cost: { sun: 45, wood: 0, stone: 25, crystal: 10 },
    hp: 340,
    atk: 74,
    fireInterval: 1.30,
    range: 5.2,
    splashRadius: 1.9,
    armorMelt: 0.80,
    antiAir: true
  },
  {
    id: 'craftycorn',
    tier: 3,
    role: 'attack',
    icon: 'icons/craftycorn.jpg',
    portrait: 'icons/craftycorn.jpg',
    fxIcon: '🌈',
    color: '#22b8cf',
    accent: '#c5f6fa',
    cost: { sun: 50, wood: 20, stone: 0, crystal: 10 },
    hp: 300,
    atk: 54,
    fireInterval: 0.95,
    range: 6.0,
    antiAir: true,
    vulnBonus: 0.35,
    shardWeaver: true,
    shardInterval: 6.0,
    shardYield: 2
  },
  {
    id: 'kickin',
    tier: 3,
    role: 'attack',
    icon: 'icons/kickin.jpg',
    portrait: 'icons/kickin.jpg',
    fxIcon: '⚡',
    color: '#fcc419',
    accent: '#fff9db',
    cost: { sun: 45, wood: 15, stone: 15, crystal: 10 },
    hp: 320,
    atk: 46,
    fireInterval: 0.88,
    range: 5.0,
    chainTargets: 4,
    knockback: 0.42,
    antiAir: true
  }
];

// ==================== 7 DISTINCT ZOMBIE ARCHETYPES (FAIR, READABLE STATS) ====================
export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    hp: 115,
    speed: 0.56,
    dps: 16,
    breachDmg: 1,
    reward: { sun: 10, wood: 4, stone: 4, crystal: 1, shard: 1 },
    scale: 0.92,
    shirtColor: '#4dabf7',
    skinColor: '#69db7c'
  },
  runner: {
    id: 'runner',
    hp: 90,
    speed: 0.92,
    dps: 16,
    breachDmg: 1,
    reward: { sun: 10, wood: 4, stone: 4, crystal: 1, shard: 1 },
    scale: 0.84,
    shirtColor: '#f783ac',
    skinColor: '#8ce99a'
  },
  bucket: {
    id: 'bucket',
    hp: 260,
    speed: 0.48,
    dps: 22,
    armor: 0.36,
    breachDmg: 1,
    reward: { sun: 14, wood: 6, stone: 8, crystal: 3, shard: 2 },
    scale: 1.15,
    shirtColor: '#868e96',
    skinColor: '#51cf66'
  },
  digger: {
    id: 'digger',
    hp: 180,
    speed: 0.58,
    dps: 26,
    wallBreaker: true,
    breachDmg: 1,
    reward: { sun: 12, wood: 5, stone: 7, crystal: 2, shard: 2 },
    scale: 1.04,
    shirtColor: '#f59f00',
    skinColor: '#69db7c'
  },
  creeper: {
    id: 'creeper',
    hp: 155,
    speed: 0.64,
    dps: 20,
    frontBurstDmg: 110,
    splashBurstDmg: 35,
    breachDmg: 2,
    reward: { sun: 15, wood: 6, stone: 6, crystal: 4, shard: 2 },
    scale: 1.05,
    shirtColor: '#40c057',
    skinColor: '#37b24d'
  },
  balloon: {
    id: 'balloon',
    hp: 150,
    speed: 0.60,
    dps: 18,
    flying: true,
    breachDmg: 1,
    reward: { sun: 14, wood: 6, stone: 5, crystal: 4, shard: 2 },
    scale: 0.96,
    shirtColor: '#7950f2',
    skinColor: '#9775fa'
  },
  necromancer: {
    id: 'necromancer',
    hp: 280,
    speed: 0.44,
    dps: 22,
    armor: 0.20,
    healRadius: 2.8,
    healPerSec: 12,
    summonInterval: 9.5,
    breachDmg: 2,
    reward: { sun: 18, wood: 8, stone: 8, crystal: 6, shard: 3 },
    scale: 1.20,
    shirtColor: '#3b1f7a',
    skinColor: '#b197fc'
  },
  nightmare_boss: {
    id: 'nightmare_boss',
    hp: 750,
    speed: 0.38,
    dps: 36,
    armor: 0.28,
    poppyAuraRadius: 2.2,
    poppyAuraDps: 6,
    breachDmg: 3,
    reward: { sun: 35, wood: 18, stone: 18, crystal: 15, shard: 6 },
    scale: 1.50,
    shirtColor: '#5f3dc4',
    skinColor: '#9775fa'
  }
};

// Helper to rasterize a sequence of (gx, gz) waypoints into a set of road tile keys
function buildRoadTilesFromRoutes(routes = []) {
  const set = new Set();
  for (const route of routes) {
    for (let i = 0; i < route.length - 1; i++) {
      let [x0, z0] = route[i];
      const [x1, z1] = route[i + 1];
      set.add(`${Math.round(x0)},${Math.round(z0)}`);
      while (x0 !== x1 || z0 !== z1) {
        if (x0 !== x1) x0 += Math.sign(x1 - x0);
        else if (z0 !== z1) z0 += Math.sign(z1 - z0);
        set.add(`${Math.round(x0)},${Math.round(z0)}`);
      }
    }
  }
  return set;
}

// ==================== 5 ESCALATING STAGE MAPS ====================
export const STAGES = [
  // Stage 1: 14 x 8 — S-Bend Meadow (Welcoming opening stage; no flyers/bosses in early waves!)
  {
    index: 0,
    stageNumber: 1,
    id: 'stage_1_meadow',
    gridW: 14,
    gridH: 8,
    altarGx: 1,
    altarGz: 3.5,
    moonTarget: 30,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper'],
    baseSpawnInterval: 4.5,
    routes: [
      [[13, 2], [10, 2], [10, 5], [6, 5], [6, 3], [2, 3]],
      [[13, 5], [10, 5], [6, 5], [6, 4], [2, 4]]
    ],
    waterTiles: ['8,0', '8,1', '8,6', '8,7'],
    highCliffs: ['8,3', '5,2'],
    resourceNodes: [
      { gx: 3, gz: 1, kind: 'sun' },
      { gx: 3, gz: 6, kind: 'wood' },
      { gx: 5, gz: 1, kind: 'stone' },
      { gx: 5, gz: 6, kind: 'crystal' },
      { gx: 11, gz: 1, kind: 'sun' },
      { gx: 11, gz: 6, kind: 'stone' }
    ],
    // Friendly starter economy: 1 SunnyFox on Sun Shrine + 1 PoppyDash on Forest Vein!
    starterUnits: [
      { gx: 3, gz: 1, id: 'sunnyfox' },
      { gx: 3, gz: 6, id: 'poppydash' }
    ]
  },

  // Stage 2: 14 x 8 — Twin-Bridge River Canyon (Introduces Balloon Flyers in Wave 3+)
  {
    index: 1,
    stageNumber: 2,
    id: 'stage_2_canyon',
    gridW: 14,
    gridH: 8,
    altarGx: 1,
    altarGz: 3.5,
    moonTarget: 40,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon'],
    baseSpawnInterval: 4.2,
    routes: [
      [[13, 1], [9, 1], [9, 3], [5, 3], [2, 3]],
      [[13, 6], [9, 6], [9, 4], [5, 4], [2, 4]]
    ],
    waterTiles: ['7,0', '7,1', '7,2', '7,5', '7,6', '7,7'],
    highCliffs: ['6,2', '6,5', '10,3', '10,4'],
    resourceNodes: [
      { gx: 3, gz: 1, kind: 'sun' },
      { gx: 3, gz: 6, kind: 'wood' },
      { gx: 5, gz: 1, kind: 'stone' },
      { gx: 5, gz: 6, kind: 'crystal' },
      { gx: 11, gz: 3, kind: 'sun' },
      { gx: 11, gz: 4, kind: 'crystal' }
    ],
    starterUnits: [
      { gx: 3, gz: 1, id: 'sunnyfox' },
      { gx: 3, gz: 6, id: 'poppydash' }
    ]
  },

  // Stage 3: 15 x 8 — Central Moon Citadel (Two-Front Assault from East & West!)
  {
    index: 2,
    stageNumber: 3,
    id: 'stage_3_highlands',
    gridW: 15,
    gridH: 8,
    altarGx: 7,
    altarGz: 3.5,
    moonTarget: 50,
    portals: ['E', 'W'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon', 'necromancer'],
    baseSpawnInterval: 4.0,
    routes: [
      [[14, 2], [11, 2], [11, 4], [8, 4]],
      [[0, 5], [3, 5], [3, 3], [6, 3]]
    ],
    waterTiles: ['4,0', '4,1', '10,6', '10,7'],
    highCliffs: ['5,2', '9,5', '5,5', '9,2'],
    resourceNodes: [
      { gx: 6, gz: 1, kind: 'sun' },
      { gx: 8, gz: 1, kind: 'wood' },
      { gx: 6, gz: 6, kind: 'stone' },
      { gx: 8, gz: 6, kind: 'crystal' },
      { gx: 2, gz: 2, kind: 'sun' },
      { gx: 12, gz: 5, kind: 'crystal' }
    ],
    starterUnits: [
      { gx: 6, gz: 1, id: 'sunnyfox' },
      { gx: 8, gz: 1, id: 'poppydash' }
    ]
  },

  // Stage 4: 16 x 8 — Three-Gate Star Fortress (Portals E, W, N + Nightmare Boss in Wave 4+)
  {
    index: 3,
    stageNumber: 4,
    id: 'stage_4_labyrinth',
    gridW: 16,
    gridH: 8,
    altarGx: 7.5,
    altarGz: 3.5,
    moonTarget: 65,
    portals: ['E', 'W', 'N'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon', 'necromancer', 'nightmare_boss'],
    baseSpawnInterval: 3.8,
    routes: [
      [[15, 3], [12, 3], [12, 4], [9, 4]],
      [[0, 4], [3, 4], [3, 3], [6, 3]],
      [[7, 0], [7, 2]]
    ],
    waterTiles: ['4,0', '4,1', '11,6', '11,7'],
    highCliffs: ['5,2', '10,2', '5,5', '10,5'],
    resourceNodes: [
      { gx: 6, gz: 1, kind: 'sun' },
      { gx: 9, gz: 1, kind: 'wood' },
      { gx: 6, gz: 6, kind: 'stone' },
      { gx: 9, gz: 6, kind: 'crystal' },
      { gx: 2, gz: 6, kind: 'wood' },
      { gx: 13, gz: 1, kind: 'stone' }
    ],
    starterUnits: [
      { gx: 6, gz: 1, id: 'sunnyfox' },
      { gx: 9, gz: 1, id: 'poppydash' }
    ]
  },

  // Stage 5: 16 x 8 — Four-Gate Starlight Finale (All 4 Cardinal Portals E, W, N, S!)
  {
    index: 4,
    stageNumber: 5,
    id: 'stage_5_citadel',
    gridW: 16,
    gridH: 8,
    altarGx: 7.5,
    altarGz: 3.5,
    moonTarget: 80,
    portals: ['E', 'W', 'N', 'S'],
    zombiePool: [
      'walker',
      'runner',
      'digger',
      'bucket',
      'creeper',
      'balloon',
      'necromancer',
      'nightmare_boss'
    ],
    baseSpawnInterval: 3.6,
    routes: [
      [[15, 3], [11, 3], [9, 3]],
      [[0, 4], [4, 4], [6, 4]],
      [[7, 0], [7, 2]],
      [[8, 7], [8, 5]]
    ],
    waterTiles: ['3,0', '3,1', '12,0', '12,1', '3,6', '3,7', '12,6', '12,7'],
    highCliffs: ['5,2', '10,2', '5,5', '10,5'],
    resourceNodes: [
      { gx: 6, gz: 1, kind: 'sun' },
      { gx: 9, gz: 1, kind: 'wood' },
      { gx: 6, gz: 6, kind: 'stone' },
      { gx: 9, gz: 6, kind: 'crystal' },
      { gx: 1, gz: 1, kind: 'sun' },
      { gx: 14, gz: 6, kind: 'crystal' }
    ],
    starterUnits: [
      { gx: 6, gz: 1, id: 'sunnyfox' },
      { gx: 9, gz: 1, id: 'poppydash' }
    ]
  }
];

export function getStageConfig(stageIndex = 0) {
  const idx = Math.max(0, Math.min(STAGES.length - 1, Number(stageIndex) || 0));
  const stage = STAGES[idx];
  const waterSet = new Set(stage.waterTiles);
  const cliffSet = new Set(stage.highCliffs);
  const nodeMap = new Map(stage.resourceNodes.map(n => [`${n.gx},${n.gz}`, n]));

  const midXLow = Math.floor(stage.altarGx);
  const midXHigh = Math.ceil(stage.altarGx);
  const midZLow = Math.floor(stage.altarGz);
  const midZHigh = Math.ceil(stage.altarGz);

  // Sanctuary footprint (2x2 around altarGx, altarGz)
  const altarSet = new Set([
    `${midXLow},${midZLow}`,
    `${midXHigh},${midZLow}`,
    `${midXLow},${midZHigh}`,
    `${midXHigh},${midZHigh}`
  ]);

  const roadSet = buildRoadTilesFromRoutes(stage.routes || []);

  // Portal start coordinates from routes
  const portalSet = new Set((stage.routes || []).map(r => `${r[0][0]},${r[0][1]}`));

  function getPortalDir(gx, gz) {
    const key = `${gx},${gz}`;
    if (!portalSet.has(key)) return null;
    if (gx === stage.gridW - 1) return 'E';
    if (gx === 0) return 'W';
    if (gz === 0) return 'N';
    if (gz === stage.gridH - 1) return 'S';
    return 'E';
  }

  return {
    ...stage,
    waterSet,
    cliffSet,
    altarSet,
    roadSet,
    nodeMap,
    midXLow,
    midXHigh,
    midZLow,
    midZHigh,
    getPortalDir,
    initialResources: { ...INITIAL_RESOURCES }
  };
}

// Gentle duplicate cost scaling (+8% after the 2nd copy of the same unit)
export function computeDynamicResourceCosts(def, existingCount = 0) {
  if (!def || !def.cost) return { sun: 0, wood: 0, stone: 0, crystal: 0 };
  const extraCopies = Math.max(0, existingCount - 1);
  const mult = extraCopies <= 0 ? 1.0 : Math.pow(1.08, extraCopies);
  const c = def.cost;
  return {
    sun: c.sun > 0 ? Math.round(c.sun * mult) : 0,
    wood: c.wood > 0 ? Math.round(c.wood * mult) : 0,
    stone: c.stone > 0 ? Math.round(c.stone * mult) : 0,
    crystal: c.crystal > 0 ? Math.round(c.crystal * mult) : 0
  };
}

// Cost to upgrade an existing placed Critter (Lv.1 -> Lv.2 -> Lv.3)
export function computeUpgradeCost(def, currentLevel = 1) {
  const c = def?.cost || { sun: 30, wood: 15, stone: 15, crystal: 8 };
  const lvMult = currentLevel === 1 ? 0.75 : 1.15;
  return {
    sun: Math.max(15, Math.round((c.sun || 25) * lvMult)),
    wood: Math.round((c.wood || (def?.role === 'attack' ? 10 : 0)) * lvMult),
    stone: Math.round((c.stone || (def?.role === 'defend' ? 10 : 0)) * lvMult),
    crystal: Math.max(currentLevel === 1 ? 4 : 8, Math.round((c.crystal || 4) * lvMult))
  };
}

export function canAffordCost(resources, costObj) {
  if (!resources || !costObj) return false;
  return (
    (resources.sun ?? 0) >= (costObj.sun || 0) &&
    (resources.wood ?? 0) >= (costObj.wood || 0) &&
    (resources.stone ?? 0) >= (costObj.stone || 0) &&
    (resources.crystal ?? 0) >= (costObj.crystal || 0)
  );
}

export function deductCost(resources, costObj) {
  if (!resources || !costObj) return;
  resources.sun = Math.max(0, (resources.sun || 0) - (costObj.sun || 0));
  resources.wood = Math.max(0, (resources.wood || 0) - (costObj.wood || 0));
  resources.stone = Math.max(0, (resources.stone || 0) - (costObj.stone || 0));
  resources.crystal = Math.max(0, (resources.crystal || 0) - (costObj.crystal || 0));
}

export function computeBalanceState({
  placedUnits = [],
  zombies = [],
  stageIndex = 0,
  moonShards = 0,
  wave = 1
}) {
  const stageCfg = getStageConfig(stageIndex);
  let defensePower = 20;
  for (const u of placedUnits) {
    const lvMult = 1 + ((u.level || 1) - 1) * 0.45;
    if (u.def?.atk) {
      defensePower += ((u.def.atk || 15) / (u.def.fireInterval || 1.4)) * lvMult;
    }
    if (u.def?.role === 'defend') {
      defensePower += ((u.hp || 350) / 35) * lvMult;
    }
  }
  const moonRage = 1 + (moonShards / Math.max(1, stageCfg.moonTarget)) * 0.35;
  const threat = (18 + wave * 9 + stageIndex * 10) * moonRage;
  const pressureIndex = Number((threat / Math.max(20, defensePower)).toFixed(2));
  const spawnIntervalMult = Math.max(0.75, Math.min(1.15, 1 / Math.sqrt(moonRage)));
  return {
    stageIndex,
    moonTarget: stageCfg.moonTarget,
    pressureIndex,
    spawnIntervalMult
  };
}
