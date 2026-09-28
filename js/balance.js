// CritterCraft: Moonless Night — 5 Progressive Stage Maps with Winding Cobblestone Roads,
// Zero Dead Angles (360° All-Unit Combat & Full-Board Range), Tight 4-Resource Economy,
// 3-Star Unit Upgrades, and 8 Distinct Zombie Archetypes.

export const INITIAL_RESOURCES = {
  sun: 85,      // ☀️ Solar energy (core recruitment + upgrades + Moon Forge)
  wood: 35,     // 🪵 Timber (bridges, crossbows, watchtowers, prism lasers, upgrades)
  stone: 35,    // 🪨 Masonry (fortress walls, traps, watchtowers, siege mortars, upgrades)
  crystal: 15   // 💎 Starlight Crystal (Tier 3 arcane units, 2★/3★ upgrades, Moon Forge)
};

export const RESOURCE_META = {
  sun:     { id: 'sun',     symbol: '☀️', color: '#ffd43b' },
  wood:    { id: 'wood',    symbol: '🪵', color: '#51cf66' },
  stone:   { id: 'stone',   symbol: '🪨', color: '#74c0fc' },
  crystal: { id: 'crystal', symbol: '💎', color: '#da77f2' }
};

// ==================== 10 CRITTERS IN 3-TIER CRAFTING HIERARCHY ====================
// Every single Critter has BOTH an economic/defensive role AND a 360° combat attack
// with generous range and anti-air capability so there are ZERO firing dead angles!
export const UNITS = [
  // -------------------- TIER 1: GATHERER-GUARDIANS (2.4x Output on Veins + Self-Defense Shots!) --------------------
  {
    id: 'sunnyfox',
    tier: 1,
    role: 'produce',
    icon: 'icons/sunnyfox.jpg',
    color: '#f59f00',
    accent: '#fff3bf',
    cost: { sun: 25, wood: 0, stone: 0, crystal: 0 },
    hp: 260,
    prod: { sun: 10, wood: 0, stone: 0, crystal: 0 },
    prodInterval: 3.6,
    veinBonusNode: 'sun',
    veinMult: 2.25,
    atk: 22,
    fireInterval: 1.45,
    range: 7.2,
    antiAir: true,
    lightRadius: 4.0
  },
  {
    id: 'poppydash',
    tier: 1,
    role: 'produce',
    icon: 'icons/poppydash.jpg',
    color: '#495057',
    accent: '#74c0fc',
    cost: { sun: 30, wood: 0, stone: 0, crystal: 0 },
    hp: 270,
    prod: { sun: 0, wood: 8, stone: 0, crystal: 0 },
    prodInterval: 3.8,
    veinBonusNode: 'wood',
    veinMult: 2.4,
    hasteRadius: 3.2,
    hasteMult: 1.30,
    atk: 25,
    fireInterval: 1.35,
    range: 7.2,
    antiAir: true,
    knockback: 0.35
  },
  {
    id: 'picky',
    tier: 1,
    role: 'produce',
    icon: 'icons/picky.jpg',
    color: '#f783ac',
    accent: '#ffdeeb',
    cost: { sun: 30, wood: 15, stone: 0, crystal: 0 },
    hp: 300,
    prod: { sun: 0, wood: 0, stone: 8, crystal: 0 },
    prodInterval: 3.8,
    veinBonusNode: 'stone',
    veinMult: 2.4,
    healRadius: 3.5,
    healPerSec: 22,
    atk: 28,
    fireInterval: 1.50,
    range: 7.0,
    splashRadius: 1.2,
    antiAir: true
  },

  // -------------------- TIER 2: BUILDERS, DEFENDERS & SNIPERS --------------------
  {
    id: 'bubba',
    tier: 2,
    role: 'defend',
    icon: 'icons/bubba.jpg',
    color: '#339af0',
    accent: '#d0ebff',
    cost: { sun: 35, wood: 15, stone: 15, crystal: 0 },
    hp: 480,
    amphibious: true,
    prod: { sun: 0, wood: 0, stone: 0, crystal: 6 },
    prodInterval: 4.0,
    veinBonusNode: 'crystal',
    veinMult: 2.4,
    slowRadius: 3.8,
    slowFactor: 0.50,
    atk: 32,
    fireInterval: 1.25,
    range: 8.0,
    antiAir: true
  },
  {
    id: 'bobby',
    tier: 2,
    role: 'defend',
    icon: 'icons/bobby.jpg',
    color: '#e03131',
    accent: '#ffc9c9',
    cost: { sun: 20, wood: 0, stone: 25, crystal: 0 },
    hp: 1100,
    thornsDmg: 28,
    blastResist: 0.65,
    atk: 42,
    fireInterval: 1.55,
    range: 3.6,
    splashRadius: 2.2,
    antiAir: true
  },
  {
    id: 'mikey',
    tier: 2,
    role: 'defend',
    icon: 'icons/mikey.jpg',
    color: '#37b24d',
    accent: '#b2f2bb',
    cost: { sun: 20, wood: 20, stone: 20, crystal: 0 },
    hp: 620,
    stackable: true,
    towerRangeBonus: 1.45,
    towerDmgBonus: 1.35,
    grantsAntiAir: true,
    atk: 36,
    fireInterval: 1.10,
    range: 9.2,
    antiAir: true,
    deathBlastDmg: 160
  },
  {
    id: 'lunabat',
    tier: 2,
    role: 'attack',
    icon: 'icons/lunabat.jpg',
    color: '#7950f2',
    accent: '#e5dbff',
    cost: { sun: 35, wood: 25, stone: 0, crystal: 0 },
    hp: 280,
    atk: 46,
    fireInterval: 0.82,
    range: 10.5,
    pierce: 2,
    antiAir: true,
    bonusVsFlyerCreeper: 1.75
  },

  // -------------------- TIER 3: ARCANE & SIEGE SPECIALISTS (Full-Board Coverage!) --------------------
  {
    id: 'dogday',
    tier: 3,
    role: 'attack',
    icon: 'icons/dogday.jpg',
    color: '#fd7e14',
    accent: '#ffe8cc',
    cost: { sun: 45, wood: 0, stone: 30, crystal: 12 },
    hp: 340,
    atk: 72,
    fireInterval: 1.18,
    range: 9.8,
    splashRadius: 2.1,
    armorMelt: 0.70,
    antiAir: true
  },
  {
    id: 'craftycorn',
    tier: 3,
    role: 'attack',
    icon: 'icons/craftycorn.jpg',
    color: '#22b8cf',
    accent: '#c5f6fa',
    cost: { sun: 45, wood: 25, stone: 0, crystal: 15 },
    hp: 290,
    atk: 56,
    fireInterval: 0.78,
    range: 11.8,
    antiAir: true,
    vulnBonus: 0.35,
    shardWeaver: true,
    shardYield: 2,
    shardInterval: 5.0
  },
  {
    id: 'kickin',
    tier: 3,
    role: 'attack',
    icon: 'icons/kickin.jpg',
    color: '#fab005',
    accent: '#fff9db',
    cost: { sun: 40, wood: 15, stone: 20, crystal: 15 },
    hp: 320,
    atk: 48,
    fireInterval: 0.86,
    range: 9.0,
    antiAir: true,
    chainTargets: 5,
    knockback: 0.55
  }
];

export const UNIT_MAP = Object.fromEntries(UNITS.map(u => [u.id, u]));

// ==================== 8 DISTINCT ZOMBIE ARCHETYPES ====================
export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    hp: 115,
    speed: 0.58,
    dps: 14,
    reward: { sun: 6, wood: 3, stone: 3, crystal: 0, shard: 1 },
    scale: 1.0,
    shirtColor: '#22b8cf',
    skinColor: '#69db7c'
  },
  runner: {
    id: 'runner',
    hp: 80,
    speed: 0.88,
    dps: 12,
    reward: { sun: 7, wood: 3, stone: 2, crystal: 0, shard: 1 },
    scale: 0.82,
    shirtColor: '#f783ac',
    skinColor: '#8ce99a'
  },
  bucket: {
    id: 'bucket',
    hp: 270,
    speed: 0.45,
    dps: 20,
    armor: 0.40,
    reward: { sun: 10, wood: 3, stone: 6, crystal: 2, shard: 2 },
    scale: 1.16,
    shirtColor: '#868e96',
    skinColor: '#51cf66'
  },
  digger: {
    id: 'digger',
    hp: 175,
    speed: 0.58,
    dps: 24,
    wallBreaker: true,
    reward: { sun: 8, wood: 3, stone: 6, crystal: 2, shard: 1 },
    scale: 1.04,
    shirtColor: '#f59f00',
    skinColor: '#69db7c'
  },
  creeper: {
    id: 'creeper',
    hp: 135,
    speed: 0.60,
    dps: 18,
    // Damages only the single frontline blocker it touches (never wipes surrounding towers!)
    frontBurstDmg: 75,
    reward: { sun: 12, wood: 4, stone: 4, crystal: 3, shard: 2 },
    scale: 1.04,
    shirtColor: '#40c057',
    skinColor: '#37b24d'
  },
  balloon: {
    id: 'balloon',
    hp: 125,
    speed: 0.56,
    dps: 16,
    flying: true,
    reward: { sun: 10, wood: 4, stone: 2, crystal: 3, shard: 2 },
    scale: 0.96,
    shirtColor: '#7950f2',
    skinColor: '#9775fa'
  },
  necromancer: {
    id: 'necromancer',
    hp: 240,
    speed: 0.42,
    dps: 18,
    armor: 0.20,
    healRadius: 2.8,
    healPerSec: 10,
    summonInterval: 9.5,
    reward: { sun: 14, wood: 5, stone: 5, crystal: 5, shard: 3 },
    scale: 1.20,
    shirtColor: '#3b1f7a',
    skinColor: '#b197fc'
  },
  nightmare_boss: {
    id: 'nightmare_boss',
    hp: 680,
    speed: 0.36,
    dps: 32,
    armor: 0.25,
    reward: { sun: 30, wood: 15, stone: 15, crystal: 12, shard: 8 },
    scale: 1.52,
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

// ==================== 5 PROGRESSIVE STAGE MAPS (COMPACT, ZERO DEAD ANGLES, WINDING ROADS) ====================
export const STAGES = [
  // Stage 1: 14 x 8 — Sunny S-Bend Meadow (Sanctuary on West gx=1,gz=3.5; Winding S-Road from East gx=13)
  {
    index: 0,
    stageNumber: 1,
    id: 'stage_1_meadow',
    gridW: 14,
    gridH: 8,
    altarGx: 1,
    altarGz: 3.5,
    moonTarget: 28,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger'],
    baseSpawnInterval: 5.5,
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
      { gx: 11, gz: 1, kind: 'wood' },
      { gx: 11, gz: 6, kind: 'stone' }
    ],
    starterUnits: [
      { gx: 3, gz: 1, id: 'sunnyfox' },
      { gx: 3, gz: 6, id: 'poppydash' },
      { gx: 6, gz: 3, id: 'bobby' },
      { gx: 5, gz: 2, id: 'lunabat' },
      { gx: 7, gz: 4, id: 'dogday' }
    ]
  },

  // Stage 2: 14 x 8 — Twin-Bridge River Canyon (Sanctuary on West gx=1,gz=3.5; Twin Winding Loops)
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
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper'],
    baseSpawnInterval: 5.2,
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
      { gx: 5, gz: 1, id: 'picky' },
      { gx: 5, gz: 3, id: 'bobby' },
      { gx: 5, gz: 4, id: 'bobby' },
      { gx: 6, gz: 2, id: 'lunabat' },
      { gx: 6, gz: 5, id: 'craftycorn' }
    ]
  },

  // Stage 3: 15 x 8 — Central Moon Citadel (Sanctuary at Center 7, 3.5; Winding Roads from E & W)
  {
    index: 2,
    stageNumber: 3,
    id: 'stage_3_highlands',
    gridW: 15,
    gridH: 8,
    altarGx: 7,
    altarGz: 3.5,
    moonTarget: 55,
    portals: ['E', 'W'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon'],
    baseSpawnInterval: 5.0,
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
      { gx: 8, gz: 1, id: 'poppydash' },
      { gx: 9, gz: 4, id: 'bobby' },
      { gx: 5, gz: 3, id: 'bobby' },
      { gx: 9, gz: 2, id: 'lunabat' },
      { gx: 5, gz: 5, id: 'dogday' }
    ]
  },

  // Stage 4: 16 x 8 — Three-Gate Star Fortress (Sanctuary at 7.5, 3.5; Portals E, W, N)
  {
    index: 3,
    stageNumber: 4,
    id: 'stage_4_labyrinth',
    gridW: 16,
    gridH: 8,
    altarGx: 7.5,
    altarGz: 3.5,
    moonTarget: 70,
    portals: ['E', 'W', 'N'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon', 'necromancer'],
    baseSpawnInterval: 4.8,
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
      { gx: 9, gz: 1, id: 'poppydash' },
      { gx: 6, gz: 6, id: 'picky' },
      { gx: 9, gz: 4, id: 'bobby' },
      { gx: 6, gz: 3, id: 'bobby' },
      { gx: 10, gz: 2, id: 'craftycorn' },
      { gx: 5, gz: 5, id: 'kickin' }
    ]
  },

  // Stage 5: 16 x 8 — Four-Gate Starlight Finale (Sanctuary at 7.5, 3.5; Portals E, W, N, S)
  {
    index: 4,
    stageNumber: 5,
    id: 'stage_5_citadel',
    gridW: 16,
    gridH: 8,
    altarGx: 7.5,
    altarGz: 3.5,
    moonTarget: 90,
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
    baseSpawnInterval: 4.6,
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
      { gx: 9, gz: 1, id: 'poppydash' },
      { gx: 6, gz: 6, id: 'picky' },
      { gx: 9, gz: 6, id: 'bubba' },
      { gx: 9, gz: 3, id: 'bobby' },
      { gx: 6, gz: 4, id: 'bobby' },
      { gx: 10, gz: 2, id: 'craftycorn' },
      { gx: 5, gz: 5, id: 'dogday' }
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

// Progressive cost scaling (+12% per duplicate unit on the board)
export function computeDynamicResourceCosts(def, existingCount = 0) {
  if (!def || !def.cost) return { sun: 0, wood: 0, stone: 0, crystal: 0 };
  const mult = existingCount <= 0 ? 1.0 : Math.pow(1.12, existingCount);
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
  const c = def?.cost || { sun: 25, wood: 10, stone: 10, crystal: 5 };
  const lvMult = currentLevel === 1 ? 0.80 : 1.25;
  return {
    sun: Math.max(15, Math.round((c.sun || 20) * lvMult)),
    wood: Math.round((c.wood || (def?.role === 'attack' ? 10 : 0)) * lvMult),
    stone: Math.round((c.stone || (def?.role === 'defend' ? 10 : 0)) * lvMult),
    crystal: Math.max(currentLevel === 1 ? 3 : 6, Math.round((c.crystal || 3) * lvMult))
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
  let defensePower = 30;
  for (const u of placedUnits) {
    const lvMult = 1 + ((u.level || 1) - 1) * 0.5;
    if (u.def?.atk) {
      defensePower += ((u.def.atk || 30) / (u.def.fireInterval || 1.2)) * lvMult;
    } else if (u.def?.role === 'defend') {
      defensePower += ((u.hp || 400) / 30) * lvMult;
    }
  }
  const threat = (16 + wave * 7 + moonShards * 0.4) * (0.85 + stageIndex * 0.10);
  const pressureIndex = Number((threat / Math.max(30, defensePower)).toFixed(2));
  const spawnIntervalMult = pressureIndex > 1.25 ? 1.20 : (pressureIndex < 0.70 ? 0.90 : 1.0);
  return {
    stageIndex,
    moonTarget: stageCfg.moonTarget,
    pressureIndex,
    spawnIntervalMult
  };
}
