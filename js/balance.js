// CritterCraft: Moonless Night — 5 Progressive Stage Maps with Clear Sanctuary Roads,
// Tight 4-Resource Economy (Zero Surplus), 3-Star Unit Upgrades, and 8 Zombie Archetypes.

export const INITIAL_RESOURCES = {
  sun: 65,      // ☀️ Solar energy (core recruitment + upgrades + Moon Forge)
  wood: 25,     // 🪵 Timber (bridges, crossbows, watchtowers, prism lasers, upgrades)
  stone: 25,    // 🪨 Masonry (fortress walls, traps, watchtowers, siege mortars, upgrades)
  crystal: 10   // 💎 Starlight Crystal (Tier 3 arcane units, 2★/3★ upgrades, Moon Forge)
};

export const RESOURCE_META = {
  sun:     { id: 'sun',     symbol: '☀️', color: '#ffd43b' },
  wood:    { id: 'wood',    symbol: '🪵', color: '#51cf66' },
  stone:   { id: 'stone',   symbol: '🪨', color: '#74c0fc' },
  crystal: { id: 'crystal', symbol: '💎', color: '#da77f2' }
};

// ==================== 10 CRITTERS IN 3-TIER CRAFTING HIERARCHY ====================
export const UNITS = [
  // -------------------- TIER 1: GATHERERS (2.5x Output on Matching Map Veins!) --------------------
  {
    id: 'sunnyfox',
    tier: 1,
    role: 'produce',
    icon: 'icons/sunnyfox.jpg',
    color: '#f59f00',
    accent: '#fff3bf',
    cost: { sun: 25, wood: 0, stone: 0, crystal: 0 },
    hp: 220,
    prod: { sun: 8, wood: 0, stone: 0, crystal: 0 },
    prodInterval: 4.0,
    veinBonusNode: 'sun',
    veinMult: 2.25,
    lightRadius: 3.8
  },
  {
    id: 'poppydash',
    tier: 1,
    role: 'produce',
    icon: 'icons/poppydash.jpg',
    color: '#495057',
    accent: '#74c0fc',
    cost: { sun: 30, wood: 0, stone: 0, crystal: 0 },
    hp: 230,
    prod: { sun: 0, wood: 7, stone: 0, crystal: 0 },
    prodInterval: 4.2,
    veinBonusNode: 'wood',
    veinMult: 2.4,
    hasteRadius: 2.8,
    hasteMult: 1.30
  },
  {
    id: 'picky',
    tier: 1,
    role: 'produce',
    icon: 'icons/picky.jpg',
    color: '#f783ac',
    accent: '#ffdeeb',
    cost: { sun: 30, wood: 15, stone: 0, crystal: 0 },
    hp: 260,
    prod: { sun: 0, wood: 0, stone: 7, crystal: 0 },
    prodInterval: 4.2,
    veinBonusNode: 'stone',
    veinMult: 2.4,
    healRadius: 3.0,
    healPerSec: 18
  },

  // -------------------- TIER 2: BUILDERS, DEFENDERS & CORE ATTACKERS --------------------
  {
    id: 'bubba',
    tier: 2,
    role: 'defend',
    icon: 'icons/bubba.jpg',
    color: '#339af0',
    accent: '#d0ebff',
    cost: { sun: 35, wood: 15, stone: 15, crystal: 0 },
    hp: 420,
    amphibious: true,
    prod: { sun: 0, wood: 0, stone: 0, crystal: 5 },
    prodInterval: 4.5,
    veinBonusNode: 'crystal',
    veinMult: 2.4,
    slowRadius: 3.0,
    slowFactor: 0.50
  },
  {
    id: 'bobby',
    tier: 2,
    role: 'defend',
    icon: 'icons/bobby.jpg',
    color: '#e03131',
    accent: '#ffc9c9',
    cost: { sun: 15, wood: 0, stone: 25, crystal: 0 },
    hp: 920,
    thornsDmg: 20,
    blastResist: 0.55
  },
  {
    id: 'mikey',
    tier: 2,
    role: 'defend',
    icon: 'icons/mikey.jpg',
    color: '#37b24d',
    accent: '#b2f2bb',
    cost: { sun: 20, wood: 20, stone: 20, crystal: 0 },
    hp: 500,
    stackable: true,
    towerRangeBonus: 1.45,
    towerDmgBonus: 1.35,
    grantsAntiAir: true,
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
    hp: 230,
    atk: 36,
    fireInterval: 0.90,
    range: 5.4,
    pierce: 2,
    antiAir: true,
    bonusVsFlyerCreeper: 1.65
  },

  // -------------------- TIER 3: ARCANE & SIEGE SPECIALISTS (Consume ☀️ + 🪵/🪨 + 💎) --------------------
  {
    id: 'dogday',
    tier: 3,
    role: 'attack',
    icon: 'icons/dogday.jpg',
    color: '#fd7e14',
    accent: '#ffe8cc',
    cost: { sun: 45, wood: 0, stone: 30, crystal: 12 },
    hp: 290,
    atk: 60,
    fireInterval: 1.30,
    range: 5.0,
    splashRadius: 1.9,
    armorMelt: 0.70
  },
  {
    id: 'craftycorn',
    tier: 3,
    role: 'attack',
    icon: 'icons/craftycorn.jpg',
    color: '#22b8cf',
    accent: '#c5f6fa',
    cost: { sun: 45, wood: 25, stone: 0, crystal: 15 },
    hp: 230,
    atk: 46,
    fireInterval: 0.85,
    range: 6.6,
    antiAir: true,
    vulnBonus: 0.35,
    shardWeaver: true,
    shardYield: 2,
    shardInterval: 5.5
  },
  {
    id: 'kickin',
    tier: 3,
    role: 'attack',
    icon: 'icons/kickin.jpg',
    color: '#fab005',
    accent: '#fff9db',
    cost: { sun: 40, wood: 15, stone: 20, crystal: 15 },
    hp: 265,
    atk: 35,
    fireInterval: 0.92,
    range: 4.5,
    antiAir: true,
    chainTargets: 4,
    knockback: 0.70
  }
];

export const UNIT_MAP = Object.fromEntries(UNITS.map(u => [u.id, u]));

// ==================== 8 DISTINCT ZOMBIE ARCHETYPES ====================
export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    hp: 130,
    speed: 0.62,
    dps: 16,
    reward: { sun: 5, wood: 2, stone: 2, crystal: 0, shard: 1 },
    scale: 1.0,
    shirtColor: '#22b8cf',
    skinColor: '#69db7c'
  },
  runner: {
    id: 'runner',
    hp: 85,
    speed: 0.98,
    dps: 14,
    reward: { sun: 6, wood: 3, stone: 0, crystal: 0, shard: 1 },
    scale: 0.78,
    shirtColor: '#f783ac',
    skinColor: '#8ce99a'
  },
  bucket: {
    id: 'bucket',
    hp: 320,
    speed: 0.46,
    dps: 24,
    armor: 0.50,
    reward: { sun: 8, wood: 0, stone: 6, crystal: 2, shard: 2 },
    scale: 1.18,
    shirtColor: '#868e96',
    skinColor: '#51cf66'
  },
  digger: {
    id: 'digger',
    hp: 200,
    speed: 0.64,
    dps: 34,
    wallBreaker: true,
    reward: { sun: 7, wood: 2, stone: 5, crystal: 1, shard: 1 },
    scale: 1.05,
    shirtColor: '#f59f00',
    skinColor: '#69db7c'
  },
  creeper: {
    id: 'creeper',
    hp: 150,
    speed: 0.68,
    dps: 18,
    explosiveDmg: 170,
    explosiveRadius: 1.75,
    reward: { sun: 8, wood: 3, stone: 4, crystal: 2, shard: 2 },
    scale: 1.04,
    shirtColor: '#40c057',
    skinColor: '#37b24d'
  },
  balloon: {
    id: 'balloon',
    hp: 140,
    speed: 0.62,
    dps: 20,
    flying: true,
    reward: { sun: 8, wood: 4, stone: 0, crystal: 3, shard: 2 },
    scale: 0.96,
    shirtColor: '#7950f2',
    skinColor: '#9775fa'
  },
  necromancer: {
    id: 'necromancer',
    hp: 280,
    speed: 0.42,
    dps: 22,
    armor: 0.25,
    healRadius: 3.0,
    healPerSec: 14,
    summonInterval: 7.5,
    reward: { sun: 12, wood: 4, stone: 4, crystal: 4, shard: 3 },
    scale: 1.22,
    shirtColor: '#3b1f7a',
    skinColor: '#b197fc'
  },
  nightmare_boss: {
    id: 'nightmare_boss',
    hp: 820,
    speed: 0.36,
    dps: 40,
    armor: 0.35,
    reward: { sun: 25, wood: 12, stone: 12, crystal: 10, shard: 8 },
    scale: 1.58,
    shirtColor: '#5f3dc4',
    skinColor: '#9775fa'
  }
};

// ==================== 5 PROGRESSIVE STAGE MAPS (STAGES[0..4]) ====================
export const STAGES = [
  // Stage 1: 16 x 10 — Sunny Meadow Crossing (Sanctuary on West gx=1, Portal on East gx=15)
  {
    index: 0,
    stageNumber: 1,
    id: 'stage_1_meadow',
    gridW: 16,
    gridH: 10,
    altarGx: 1,
    altarGz: 4.5,
    moonTarget: 30,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger'],
    baseSpawnInterval: 4.2,
    waterTiles: ['9,0', '9,1', '9,2', '9,7', '9,8', '9,9'],
    highCliffs: ['7,3', '7,6'],
    resourceNodes: [
      { gx: 3, gz: 2, kind: 'sun' },
      { gx: 3, gz: 7, kind: 'wood' },
      { gx: 5, gz: 2, kind: 'stone' },
      { gx: 5, gz: 7, kind: 'crystal' },
      { gx: 8, gz: 1, kind: 'wood' },
      { gx: 8, gz: 8, kind: 'stone' }
    ],
    starterUnits: [
      { gx: 3, gz: 2, id: 'sunnyfox' },
      { gx: 6, gz: 4, id: 'bobby' },
      { gx: 5, gz: 5, id: 'lunabat' }
    ]
  },

  // Stage 2: 18 x 10 — Twin-Bridge River Canyon (Sanctuary on West gx=1, Twin East Portals)
  {
    index: 1,
    stageNumber: 2,
    id: 'stage_2_canyon',
    gridW: 18,
    gridH: 10,
    altarGx: 1,
    altarGz: 4.5,
    moonTarget: 45,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper'],
    baseSpawnInterval: 3.8,
    waterTiles: [
      '7,0', '7,1', '7,4', '7,5', '7,8', '7,9',
      '12,0', '12,1', '12,4', '12,5', '12,8', '12,9'
    ],
    highCliffs: ['6,3', '6,6', '10,3', '10,6'],
    resourceNodes: [
      { gx: 3, gz: 1, kind: 'sun' },
      { gx: 3, gz: 8, kind: 'wood' },
      { gx: 5, gz: 1, kind: 'stone' },
      { gx: 5, gz: 8, kind: 'crystal' },
      { gx: 9, gz: 2, kind: 'wood' },
      { gx: 9, gz: 7, kind: 'stone' },
      { gx: 11, gz: 4, kind: 'crystal' }
    ],
    starterUnits: [
      { gx: 3, gz: 1, id: 'sunnyfox' },
      { gx: 6, gz: 2, id: 'bobby' },
      { gx: 6, gz: 7, id: 'bobby' },
      { gx: 5, gz: 3, id: 'lunabat' }
    ]
  },

  // Stage 3: 20 x 12 — Central Moon Citadel (Sanctuary at Center 9.5, 5.5; Portals E & W)
  {
    index: 2,
    stageNumber: 3,
    id: 'stage_3_highlands',
    gridW: 20,
    gridH: 12,
    altarGx: 9.5,
    altarGz: 5.5,
    moonTarget: 60,
    portals: ['E', 'W'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon'],
    baseSpawnInterval: 3.5,
    waterTiles: [
      '5,1', '5,2', '5,3', '5,8', '5,9', '5,10',
      '14,1', '14,2', '14,3', '14,8', '14,9', '14,10'
    ],
    highCliffs: ['7,4', '12,4', '7,7', '12,7'],
    resourceNodes: [
      { gx: 8, gz: 3, kind: 'sun' },
      { gx: 11, gz: 3, kind: 'wood' },
      { gx: 8, gz: 8, kind: 'stone' },
      { gx: 11, gz: 8, kind: 'crystal' },
      { gx: 4, gz: 5, kind: 'wood' },
      { gx: 15, gz: 6, kind: 'stone' },
      { gx: 9, gz: 1, kind: 'crystal' },
      { gx: 10, gz: 10, kind: 'sun' }
    ],
    starterUnits: [
      { gx: 8, gz: 3, id: 'sunnyfox' },
      { gx: 11, gz: 3, id: 'poppydash' },
      { gx: 12, gz: 5, id: 'bobby' },
      { gx: 7, gz: 5, id: 'bobby' },
      { gx: 11, gz: 5, id: 'lunabat' }
    ]
  },

  // Stage 4: 22 x 12 — Three-Gate Moat Fortress (Sanctuary at Center 10.5, 5.5; Portals E, W, N)
  {
    index: 3,
    stageNumber: 4,
    id: 'stage_4_labyrinth',
    gridW: 22,
    gridH: 12,
    altarGx: 10.5,
    altarGz: 5.5,
    moonTarget: 80,
    portals: ['E', 'W', 'N'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon', 'necromancer'],
    baseSpawnInterval: 3.3,
    waterTiles: [
      '6,2', '6,3', '6,8', '6,9',
      '15,2', '15,3', '15,8', '15,9',
      '8,9', '9,9', '12,9', '13,9'
    ],
    highCliffs: ['8,4', '13,4', '8,7', '13,7', '9,2', '12,2'],
    resourceNodes: [
      { gx: 9, gz: 3, kind: 'sun' },
      { gx: 12, gz: 3, kind: 'wood' },
      { gx: 9, gz: 8, kind: 'stone' },
      { gx: 12, gz: 8, kind: 'crystal' },
      { gx: 5, gz: 4, kind: 'wood' },
      { gx: 16, gz: 4, kind: 'stone' },
      { gx: 5, gz: 7, kind: 'crystal' },
      { gx: 16, gz: 7, kind: 'sun' }
    ],
    starterUnits: [
      { gx: 9, gz: 3, id: 'sunnyfox' },
      { gx: 12, gz: 3, id: 'poppydash' },
      { gx: 9, gz: 8, id: 'picky' },
      { gx: 13, gz: 5, id: 'bobby' },
      { gx: 8, gz: 5, id: 'bobby' },
      { gx: 12, gz: 5, id: 'lunabat' }
    ]
  },

  // Stage 5: 22 x 14 — Four-Gate Starlight Finale (Sanctuary at Center 10.5, 6.5; Portals E, W, N, S)
  {
    index: 4,
    stageNumber: 5,
    id: 'stage_5_citadel',
    gridW: 22,
    gridH: 14,
    altarGx: 10.5,
    altarGz: 6.5,
    moonTarget: 100,
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
    baseSpawnInterval: 3.0,
    waterTiles: [
      '5,2', '5,3', '5,4', '5,9', '5,10', '5,11',
      '16,2', '16,3', '16,4', '16,9', '16,10', '16,11'
    ],
    highCliffs: ['8,4', '13,4', '8,9', '13,9', '9,2', '12,2', '9,11', '12,11'],
    resourceNodes: [
      { gx: 9, gz: 4, kind: 'sun' },
      { gx: 12, gz: 4, kind: 'wood' },
      { gx: 9, gz: 9, kind: 'stone' },
      { gx: 12, gz: 9, kind: 'crystal' },
      { gx: 6, gz: 3, kind: 'wood' },
      { gx: 15, gz: 3, kind: 'stone' },
      { gx: 6, gz: 10, kind: 'crystal' },
      { gx: 15, gz: 10, kind: 'sun' }
    ],
    starterUnits: [
      { gx: 9, gz: 4, id: 'sunnyfox' },
      { gx: 12, gz: 4, id: 'poppydash' },
      { gx: 9, gz: 9, id: 'picky' },
      { gx: 13, gz: 6, id: 'bobby' },
      { gx: 8, gz: 6, id: 'bobby' },
      { gx: 12, gz: 6, id: 'lunabat' }
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

  // Compute cobbled road tiles connecting each active Portal to the Moon Sanctuary
  const roadSet = new Set();
  if (stage.portals.includes('E')) {
    for (let x = midXHigh + 1; x < stage.gridW - 1; x++) {
      roadSet.add(`${x},${midZLow}`);
      roadSet.add(`${x},${midZHigh}`);
    }
  }
  if (stage.portals.includes('W')) {
    for (let x = 1; x < midXLow; x++) {
      roadSet.add(`${x},${midZLow}`);
      roadSet.add(`${x},${midZHigh}`);
    }
  }
  if (stage.portals.includes('N')) {
    for (let z = 1; z < midZLow; z++) {
      roadSet.add(`${midXLow},${z}`);
      roadSet.add(`${midXHigh},${z}`);
    }
  }
  if (stage.portals.includes('S')) {
    for (let z = midZHigh + 1; z < stage.gridH - 1; z++) {
      roadSet.add(`${midXLow},${z}`);
      roadSet.add(`${midXHigh},${z}`);
    }
  }

  function getPortalDir(gx, gz) {
    if (gx === stage.gridW - 1 && (gz === midZLow || gz === midZHigh) && stage.portals.includes('E')) return 'E';
    if (gx === 0 && (gz === midZLow || gz === midZHigh) && stage.portals.includes('W')) return 'W';
    if (gz === 0 && (gx === midXLow || gx === midXHigh) && stage.portals.includes('N')) return 'N';
    if (gz === stage.gridH - 1 && (gx === midXLow || gx === midXHigh) && stage.portals.includes('S')) return 'S';
    return null;
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

// Progressive cost scaling (+15% per duplicate unit on the board) so resources stay tight and meaningful
export function computeDynamicResourceCosts(def, existingCount = 0) {
  if (!def || !def.cost) return { sun: 0, wood: 0, stone: 0, crystal: 0 };
  const mult = existingCount <= 0 ? 1.0 : Math.pow(1.15, existingCount);
  const c = def.cost;
  return {
    sun: c.sun > 0 ? Math.round(c.sun * mult) : 0,
    wood: c.wood > 0 ? Math.round(c.wood * mult) : 0,
    stone: c.stone > 0 ? Math.round(c.stone * mult) : 0,
    crystal: c.crystal > 0 ? Math.round(c.crystal * mult) : 0
  };
}

// Cost to upgrade an existing placed Critter (Lv.1 -> Lv.2 -> Lv.3) — active sink for all 4 resources!
export function computeUpgradeCost(def, currentLevel = 1) {
  const c = def?.cost || { sun: 25, wood: 10, stone: 10, crystal: 5 };
  const lvMult = currentLevel === 1 ? 0.85 : 1.35;
  return {
    sun: Math.max(15, Math.round((c.sun || 20) * lvMult)),
    wood: Math.round((c.wood || (def?.role === 'attack' ? 12 : 0)) * lvMult),
    stone: Math.round((c.stone || (def?.role === 'defend' ? 12 : 0)) * lvMult),
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
    const lvMult = 1 + ((u.level || 1) - 1) * 0.5;
    if (u.def?.role === 'attack') {
      defensePower += ((u.def.atk || 35) / (u.def.fireInterval || 1.0)) * lvMult;
    } else if (u.def?.role === 'defend') {
      defensePower += ((u.hp || 400) / 30) * lvMult;
    }
  }
  const threat = (18 + wave * 9 + moonShards * 0.5) * (0.85 + stageIndex * 0.12);
  const pressureIndex = Number((threat / Math.max(25, defensePower)).toFixed(2));
  const spawnIntervalMult = pressureIndex > 1.35 ? 1.12 : (pressureIndex < 0.75 ? 0.88 : 1.0);
  return {
    stageIndex,
    moonTarget: stageCfg.moonTarget,
    pressureIndex,
    spawnIntervalMult
  };
}
