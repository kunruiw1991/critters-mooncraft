// ============================================================================
// CRITTERCRAFT: MOONLESS NIGHT — TIGHT, MEANINGFUL 4-RESOURCE ECONOMY & PVZ WAVES
// - Zero passive resource inflation: resources ONLY come from Gatherer work cycles
//   (every 5.5s) on Resource Veins and clicked salvage orbs.
// - Tight opening bank (☀️ 60, 🪵 20, 🪨 20, 💎 0) with 1 starter SunnyFox:
//   every harvest matters and is immediately spent on tech progression, upgrades,
//   and escalating Moon Sanctuary Forging!
// ============================================================================

export const INITIAL_RESOURCES = {
  sun: 60,
  wood: 20,
  stone: 20,
  crystal: 0
};

export const RESOURCE_META = {
  sun:     { id: 'sun',     symbol: '☀️', color: '#ffd43b' },
  wood:    { id: 'wood',    symbol: '🪵', color: '#51cf66' },
  stone:   { id: 'stone',   symbol: '🪨', color: '#74c0fc' },
  crystal: { id: 'crystal', symbol: '💎', color: '#da77f2' }
};

// Moon Sanctuary Forge Recipe: Base cost (escalates +15% per forge so resources always have a high-value sink!)
export const MOON_FORGE_RECIPE = {
  cost: { sun: 35, wood: 20, stone: 20, crystal: 10 },
  shards: 5
};

// ==================== 10 CRITTERS IN 3-TIER TACTICAL HIERARCHY ====================
export const UNITS = [
  // -------------------- TIER 1: GATHERERS & SUPPORT --------------------
  // Gatherers produce full yield ONLY when placed on/adjacent to a matching Resource Vein (35% yield off-vein).
  {
    id: 'sunnyfox',
    tier: 1,
    role: 'produce',
    icon: 'icons/sunnyfox.jpg',
    portrait: 'icons/sunnyfox.jpg',
    fxIcon: '☀️',
    color: '#f59f00',
    accent: '#fff3bf',
    cost: { sun: 35, wood: 0, stone: 0, crystal: 0 },
    hp: 210,
    prod: { sun: 4, wood: 0, stone: 0, crystal: 0 },
    prodInterval: 5.5,
    veinBonusNode: 'sun',
    veinMult: 2.5, // +10 ☀️ every 5.5s on Sun Shrine Vein (only +4 off-vein!)
    atk: 9,
    fireInterval: 1.6,
    range: 2.5,
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
    cost: { sun: 35, wood: 10, stone: 0, crystal: 0 },
    hp: 220,
    prod: { sun: 0, wood: 3, stone: 0, crystal: 0 },
    prodInterval: 5.5,
    veinBonusNode: 'wood',
    veinMult: 2.7, // +8 🪵 every 5.5s on Forest Vein (only +3 off-vein!)
    hasteRadius: 2.6,
    hasteMult: 1.25,
    atk: 10,
    fireInterval: 1.5,
    range: 2.5,
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
    cost: { sun: 35, wood: 15, stone: 0, crystal: 0 },
    hp: 250,
    prod: { sun: 0, wood: 0, stone: 3, crystal: 0 },
    prodInterval: 5.5,
    veinBonusNode: 'stone',
    veinMult: 2.7, // +8 🪨 every 5.5s on Quarry Vein (only +3 off-vein!)
    healRadius: 2.8,
    healPerSec: 18,
    atk: 10,
    fireInterval: 1.5,
    range: 2.5,
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
    cost: { sun: 45, wood: 20, stone: 20, crystal: 0 },
    hp: 350,
    amphibious: true,
    prod: { sun: 0, wood: 0, stone: 0, crystal: 2 },
    prodInterval: 6.0,
    veinBonusNode: 'crystal',
    veinMult: 3.0, // +6 💎 every 6.0s on Crystal Vein or Water (only +2 off-vein!)
    slowRadius: 3.0,
    slowFactor: 0.50,
    atk: 16,
    fireInterval: 1.35,
    range: 3.4,
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
    cost: { sun: 35, wood: 0, stone: 20, crystal: 0 },
    hp: 820,
    thornsDmg: 24,
    blastResist: 0.65,
    atk: 24,
    fireInterval: 1.35,
    range: 2.1,
    splashRadius: 1.4,
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
    cost: { sun: 35, wood: 20, stone: 20, crystal: 0 },
    hp: 480,
    stackable: true,
    towerRangeBonus: 1.40,
    towerDmgBonus: 1.30,
    grantsAntiAir: true,
    atk: 20,
    fireInterval: 1.15,
    range: 4.4,
    antiAir: true,
    deathBlastDmg: 140
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
    cost: { sun: 45, wood: 25, stone: 0, crystal: 0 },
    hp: 230,
    atk: 35,
    fireInterval: 0.85,
    range: 4.9,
    pierce: 2,
    antiAir: true,
    bonusVsFlyerCreeper: 1.80
  },

  // -------------------- TIER 3: ARCANE & SIEGE SPECIALISTS (Require 💎 Crystal!) --------------------
  {
    id: 'dogday',
    tier: 3,
    role: 'attack',
    icon: 'icons/dogday.jpg',
    portrait: 'icons/dogday.jpg',
    fxIcon: '💥',
    color: '#fd7e14',
    accent: '#ffe8cc',
    cost: { sun: 65, wood: 0, stone: 40, crystal: 16 },
    hp: 310,
    atk: 70,
    fireInterval: 1.35,
    range: 5.0,
    splashRadius: 1.85,
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
    cost: { sun: 70, wood: 35, stone: 0, crystal: 18 },
    hp: 280,
    atk: 52,
    fireInterval: 1.0,
    range: 5.8,
    antiAir: true,
    vulnBonus: 0.35,
    shardWeaver: true,
    shardInterval: 7.5,
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
    cost: { sun: 65, wood: 25, stone: 25, crystal: 16 },
    hp: 300,
    atk: 44,
    fireInterval: 0.92,
    range: 4.8,
    chainTargets: 4,
    knockback: 0.40,
    antiAir: true
  }
];

// ==================== 7 DISTINCT ZOMBIE ARCHETYPES ====================
// Zombies are a threat, NOT a free resource pinata!
// Basic zombies drop 0 automatic resources and 0 free Moon Shards; only Elites/Bosses drop 1-3 shards.
export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    hp: 115,
    speed: 0.56,
    dps: 16,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, shard: 0 },
    scale: 0.92,
    shirtColor: '#4dabf7',
    skinColor: '#69db7c'
  },
  runner: {
    id: 'runner',
    hp: 95,
    speed: 0.90,
    dps: 16,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, shard: 0 },
    scale: 0.84,
    shirtColor: '#f783ac',
    skinColor: '#8ce99a'
  },
  bucket: {
    id: 'bucket',
    hp: 280,
    speed: 0.48,
    dps: 24,
    armor: 0.42,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, shard: 1 },
    scale: 1.15,
    shirtColor: '#868e96',
    skinColor: '#51cf66'
  },
  digger: {
    id: 'digger',
    hp: 190,
    speed: 0.58,
    dps: 26,
    wallBreaker: true,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, shard: 1 },
    scale: 1.04,
    shirtColor: '#f59f00',
    skinColor: '#69db7c'
  },
  creeper: {
    id: 'creeper',
    hp: 165,
    speed: 0.64,
    dps: 20,
    frontBurstDmg: 120,
    splashBurstDmg: 40,
    breachDmg: 2,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, shard: 1 },
    scale: 1.05,
    shirtColor: '#40c057',
    skinColor: '#37b24d'
  },
  balloon: {
    id: 'balloon',
    hp: 160,
    speed: 0.60,
    dps: 18,
    flying: true,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, shard: 1 },
    scale: 0.96,
    shirtColor: '#7950f2',
    skinColor: '#9775fa'
  },
  necromancer: {
    id: 'necromancer',
    hp: 300,
    speed: 0.44,
    dps: 22,
    armor: 0.25,
    healRadius: 2.8,
    healPerSec: 12,
    summonInterval: 9.5,
    breachDmg: 2,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, shard: 2 },
    scale: 1.20,
    shirtColor: '#3b1f7a',
    skinColor: '#b197fc'
  },
  nightmare_boss: {
    id: 'nightmare_boss',
    hp: 820,
    speed: 0.38,
    dps: 38,
    armor: 0.32,
    poppyAuraRadius: 2.2,
    poppyAuraDps: 8,
    breachDmg: 3,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, shard: 4 },
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
  // Stage 1: 14 x 8 — S-Bend Meadow
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
    // Only 1 starter SunnyFox on Sun Shrine — player must build their own economy!
    starterUnits: [
      { gx: 3, gz: 1, id: 'sunnyfox' }
    ]
  },

  // Stage 2: 14 x 8 — Twin-Bridge River Canyon
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
      { gx: 3, gz: 1, id: 'sunnyfox' }
    ]
  },

  // Stage 3: 15 x 8 — Central Moon Citadel
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
      { gx: 6, gz: 1, id: 'sunnyfox' }
    ]
  },

  // Stage 4: 16 x 8 — Three-Gate Star Fortress
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
      { gx: 6, gz: 1, id: 'sunnyfox' }
    ]
  },

  // Stage 5: 16 x 8 — Four-Gate Starlight Finale
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
      { gx: 6, gz: 1, id: 'sunnyfox' }
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

  const altarSet = new Set([
    `${midXLow},${midZLow}`,
    `${midXHigh},${midZLow}`,
    `${midXLow},${midZHigh}`,
    `${midXHigh},${midZHigh}`
  ]);

  const roadSet = buildRoadTilesFromRoutes(stage.routes || []);
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

// +22% cost scaling per existing copy of the same unit so players diversify & upgrade rather than spamming!
export function computeDynamicResourceCosts(def, existingCount = 0) {
  if (!def || !def.cost) return { sun: 0, wood: 0, stone: 0, crystal: 0 };
  const mult = existingCount <= 0 ? 1.0 : Math.pow(1.22, existingCount);
  const c = def.cost;
  return {
    sun: c.sun > 0 ? Math.round(c.sun * mult) : 0,
    wood: c.wood > 0 ? Math.round(c.wood * mult) : 0,
    stone: c.stone > 0 ? Math.round(c.stone * mult) : 0,
    crystal: c.crystal > 0 ? Math.round(c.crystal * mult) : 0
  };
}

// Cost to upgrade an existing placed Critter (Lv.1 -> Lv.2 -> Lv.3) — major resource sink!
export function computeUpgradeCost(def, currentLevel = 1) {
  const c = def?.cost || { sun: 35, wood: 15, stone: 15, crystal: 8 };
  const lvMult = currentLevel === 1 ? 0.90 : 1.45;
  return {
    sun: Math.max(25, Math.round((c.sun || 30) * lvMult)),
    wood: Math.round((c.wood || (def?.role === 'attack' ? 15 : 0)) * lvMult),
    stone: Math.round((c.stone || (def?.role === 'defend' ? 15 : 0)) * lvMult),
    crystal: Math.max(currentLevel === 1 ? 6 : 12, Math.round((c.crystal || 6) * lvMult))
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
