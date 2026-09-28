// CritterCraft: Moonless Night — 5 Progressive Stage Maps, 4-Resource Layered Economy,
// 10 Distinct Critter Functions, 8 Counter-Archetype Zombies & Mathematical Balance Engine.

export const GRID_W = 22;
export const GRID_H = 14;
export const ALTAR_GX = 10.5;
export const ALTAR_GZ = 6.5;

// ==================== 4 LAYERED PRODUCTION MATERIALS ====================
export const INITIAL_RESOURCES = {
  sun: 110,     // ☀️ Sun (Tier 1 core energy & light currency)
  wood: 35,     // 🪵 Wood (Tier 1->2 lumber for bridges, crossbows, condensers & prism looms)
  stone: 30,    // 🪨 Stone (Tier 1->2 masonry for fortress walls, watchtowers & siege mortars)
  crystal: 15,  // 💎 Crystal (Tier 2->3 arcane reagent for solar mortars, prism lasers & tesla strikers)
};

export const RESOURCE_META = {
  sun: { id: 'sun', symbol: '☀️', color: '#ffd43b' },
  wood: { id: 'wood', symbol: '🪵', color: '#c08552' },
  stone: { id: 'stone', symbol: '🪨', color: '#adb5bd' },
  crystal: { id: 'crystal', symbol: '💎', color: '#66d9e8' },
};

export const STRUCTURES = {
  wall: {
    id: 'wall',
    hp: 560,
    cost: { sun: 0, wood: 0, stone: 10, crystal: 0 },
    bridgeCost: { sun: 0, wood: 10, stone: 0, crystal: 0 },
  },
  conduit: {
    id: 'conduit',
    hp: 280,
    cost: { sun: 15, wood: 0, stone: 10, crystal: 5 },
    radius: 2.4,
    powerBoost: 1.30,
  },
};

// ==================== 10 CRITTERS IN 3-TIER CRAFTING HIERARCHY ====================
export const UNITS = [
  // -------------------- TIER 1: GATHERERS (Bootstrap Economy, Light, Haste & Healing) --------------------
  {
    id: 'sunnyfox',
    name: 'SunnyFox',
    tier: 1,
    role: 'produce',
    icon: 'icons/sunnyfox.jpg',
    color: '#f59f00',
    accent: '#fff3bf',
    cost: { sun: 20, wood: 0, stone: 0, crystal: 0 },
    baseCost: 20,
    hp: 210,
    prod: { sun: 10, wood: 0, stone: 0, crystal: 0 },
    prodInterval: 3.8,
    veinBonusNode: 'sun',
    veinMult: 1.6,
    lightRadius: 3.8,
    purgeSmoke: true,
  },
  {
    id: 'poppydash',
    name: 'PoppyDash',
    tier: 1,
    role: 'produce',
    icon: 'icons/poppydash.jpg',
    color: '#495057',
    accent: '#ffd43b',
    cost: { sun: 25, wood: 0, stone: 0, crystal: 0 },
    baseCost: 25,
    hp: 230,
    prod: { sun: 4, wood: 8, stone: 0, crystal: 0 },
    prodInterval: 4.0,
    veinBonusNode: 'wood',
    veinMult: 2.0,
    hasteRadius: 2.8,
    hasteMult: 1.30,
  },
  {
    id: 'picky',
    name: 'PickyPiggy',
    tier: 1,
    role: 'produce',
    icon: 'icons/picky.jpg',
    color: '#f783ac',
    accent: '#ffdeeb',
    cost: { sun: 25, wood: 10, stone: 0, crystal: 0 },
    baseCost: 25,
    hp: 260,
    prod: { sun: 4, wood: 0, stone: 8, crystal: 0 },
    prodInterval: 4.0,
    veinBonusNode: 'stone',
    veinMult: 2.0,
    healRadius: 3.0,
    healPerSec: 18,
    purgeSmoke: true,
  },

  // -------------------- TIER 2: BUILDERS, DEFENDERS & CORE ATTACKERS (Cost ☀️ + 🪵/🪨) --------------------
  {
    id: 'bubba',
    name: 'Bubba',
    tier: 2,
    role: 'defend',
    icon: 'icons/bubba.jpg',
    color: '#339af0',
    accent: '#d0ebff',
    cost: { sun: 30, wood: 15, stone: 0, crystal: 0 },
    baseCost: 30,
    hp: 440,
    amphibious: true,
    prod: { sun: 0, wood: 0, stone: 0, crystal: 6 },
    prodInterval: 4.4,
    veinBonusNode: 'crystal',
    waterBonusMult: 2.0,
    veinMult: 2.0,
    slowRadius: 3.0,
    slowFactor: 0.50,
    shieldAura: 0.30,
  },
  {
    id: 'bobby',
    name: 'Bobby BearHug',
    tier: 2,
    role: 'defend',
    icon: 'icons/bobby.jpg',
    color: '#e03131',
    accent: '#ffc9c9',
    cost: { sun: 15, wood: 0, stone: 15, crystal: 0 },
    baseCost: 15,
    hp: 900,
    tauntRadius: 2.6,
    thornsDmg: 18,
    blastResist: 0.50,
  },
  {
    id: 'mikey',
    name: 'Mikey & JJ',
    tier: 2,
    role: 'defend',
    icon: 'icons/mikey.jpg',
    color: '#37b24d',
    accent: '#b2f2bb',
    cost: { sun: 20, wood: 15, stone: 15, crystal: 0 },
    baseCost: 20,
    hp: 480,
    stackable: true,
    towerRangeBonus: 1.45,
    towerDmgBonus: 1.30,
    grantsAntiAir: true,
    deathBlastDmg: 150,
  },
  {
    id: 'lunabat',
    name: 'LunaBat',
    tier: 2,
    role: 'attack',
    icon: 'icons/lunabat.jpg',
    color: '#7950f2',
    accent: '#e5dbff',
    cost: { sun: 35, wood: 20, stone: 0, crystal: 0 },
    baseCost: 35,
    hp: 225,
    atk: 34,
    fireInterval: 0.92,
    range: 5.2,
    pierce: 2,
    antiAir: true,
    bonusVsFlyerCreeper: 1.60,
    nightVision: true,
    lightRadius: 2.0,
  },

  // -------------------- TIER 3: ARCANE & SIEGE SPECIALISTS (Cost ☀️ + 🪨/🪵 + 💎) --------------------
  {
    id: 'dogday',
    name: 'DogDay',
    tier: 3,
    role: 'attack',
    icon: 'icons/dogday.jpg',
    color: '#fd7e14',
    accent: '#ffe8cc',
    cost: { sun: 45, wood: 0, stone: 25, crystal: 10 },
    baseCost: 45,
    hp: 285,
    atk: 56,
    fireInterval: 1.35,
    range: 4.9,
    splashRadius: 1.9,
    armorMelt: 0.70,
    lightRadius: 2.5,
  },
  {
    id: 'craftycorn',
    name: 'CraftyCorn',
    tier: 3,
    role: 'attack',
    icon: 'icons/craftycorn.jpg',
    color: '#22b8cf',
    accent: '#c5f6fa',
    cost: { sun: 45, wood: 15, stone: 0, crystal: 15 },
    baseCost: 45,
    hp: 220,
    atk: 44,
    fireInterval: 0.88,
    range: 6.5,
    antiAir: true,
    vulnBonus: 0.35,
    shardWeaver: true,
    shardYield: 2,
    shardInterval: 5.5,
    geodeHarvester: true,
  },
  {
    id: 'kickin',
    name: 'Kickin & Hoppy',
    tier: 3,
    role: 'attack',
    icon: 'icons/kickin.jpg',
    color: '#fab005',
    accent: '#fff9db',
    cost: { sun: 40, wood: 0, stone: 15, crystal: 15 },
    baseCost: 40,
    hp: 255,
    atk: 32,
    fireInterval: 0.95,
    range: 4.3,
    antiAir: true,
    chainTargets: 4,
    knockback: 0.70,
  },
];

export const UNIT_MAP = Object.fromEntries(UNITS.map((u) => [u.id, u]));

// ==================== 8 DISTINCT COUNTER-ARCHETYPE ZOMBIES ====================
export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    hp: 135,
    speed: 0.48,
    dps: 16,
    reward: { sun: 6, wood: 2, stone: 2, crystal: 0, shard: 0 },
    scale: 1.0,
    shirtColor: '#22b8cf',
    skinColor: '#69db7c',
  },
  runner: {
    id: 'runner',
    hp: 88,
    speed: 0.82,
    dps: 14,
    reward: { sun: 7, wood: 3, stone: 1, crystal: 0, shard: 0 },
    scale: 0.78,
    shirtColor: '#f783ac',
    skinColor: '#8ce99a',
  },
  bucket: {
    id: 'bucket',
    hp: 340,
    speed: 0.36,
    dps: 24,
    armor: 0.55,
    reward: { sun: 12, wood: 3, stone: 6, crystal: 2, shard: 2 },
    scale: 1.18,
    shirtColor: '#868e96',
    skinColor: '#51cf66',
  },
  digger: {
    id: 'digger',
    hp: 210,
    speed: 0.54,
    dps: 38,
    wallBreaker: true,
    reward: { sun: 10, wood: 3, stone: 6, crystal: 1, shard: 1 },
    scale: 1.05,
    shirtColor: '#f59f00',
    skinColor: '#69db7c',
  },
  creeper: {
    id: 'creeper',
    hp: 155,
    speed: 0.58,
    dps: 18,
    explosiveDmg: 175,
    explosiveRadius: 1.85,
    reward: { sun: 13, wood: 4, stone: 5, crystal: 3, shard: 2 },
    scale: 1.04,
    shirtColor: '#40c057',
    skinColor: '#37b24d',
  },
  balloon: {
    id: 'balloon',
    hp: 145,
    speed: 0.52,
    dps: 20,
    flying: true,
    reward: { sun: 13, wood: 5, stone: 2, crystal: 3, shard: 2 },
    scale: 0.96,
    shirtColor: '#7950f2',
    skinColor: '#9775fa',
  },
  necromancer: {
    id: 'necromancer',
    hp: 290,
    speed: 0.32,
    dps: 22,
    armor: 0.25,
    healRadius: 3.2,
    healPerSec: 15,
    summonInterval: 7.5,
    reward: { sun: 18, wood: 5, stone: 5, crystal: 5, shard: 4 },
    scale: 1.22,
    shirtColor: '#3b1f7a',
    skinColor: '#b197fc',
  },
  nightmare_boss: {
    id: 'nightmare_boss',
    hp: 880,
    speed: 0.28,
    dps: 42,
    armor: 0.40,
    smokeCaster: true,
    reward: { sun: 40, wood: 15, stone: 15, crystal: 12, shard: 10 },
    scale: 1.58,
    shirtColor: '#5f3dc4',
    skinColor: '#9775fa',
  },
};

// ==================== 5 PROGRESSIVE STAGE MAPS (STAGES[0..4]) ====================
export const STAGES = [
  // Stage 1: 16 x 10 — Sunny Meadow Crossing
  {
    index: 0,
    stageNumber: 1,
    id: 'stage_1_meadow',
    gridW: 16,
    gridH: 10,
    altarGx: 7.5,
    altarGz: 4.5,
    altarTiles: ['7,4', '8,4', '7,5', '8,5'],
    moonTarget: 30,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger'],
    catnapSmokeEnabled: false,
    catnapSmokeInterval: 0,
    baseSpawnInterval: 4.6,
    waterTiles: ['11,1', '11,2', '11,3', '11,6', '11,7', '11,8'],
    highCliffs: ['9,3', '9,6'],
    resourceNodes: [
      { gx: 5, gz: 2, kind: 'wood' },
      { gx: 5, gz: 7, kind: 'stone' },
      { gx: 9, gz: 2, kind: 'sun' },
      { gx: 10, gz: 7, kind: 'crystal' },
    ],
    starterUnits: [
      { gx: 6, gz: 4, id: 'sunnyfox' },
      { gx: 6, gz: 2, id: 'poppydash' },
      { gx: 10, gz: 4, id: 'bobby' },
      { gx: 9, gz: 4, id: 'lunabat' },
    ],
  },

  // Stage 2: 18 x 10 — Twin-River Canyon
  {
    index: 1,
    stageNumber: 2,
    id: 'stage_2_canyon',
    gridW: 18,
    gridH: 10,
    altarGx: 8.5,
    altarGz: 4.5,
    altarTiles: ['8,4', '9,4', '8,5', '9,5'],
    moonTarget: 45,
    portals: ['E', 'W'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper'],
    catnapSmokeEnabled: false,
    catnapSmokeInterval: 0,
    baseSpawnInterval: 4.1,
    waterTiles: [
      '4,1', '4,2', '4,3', '4,6', '4,7', '4,8',
      '13,1', '13,2', '13,3', '13,6', '13,7', '13,8',
    ],
    highCliffs: ['6,3', '11,3', '6,6', '11,6'],
    resourceNodes: [
      { gx: 6, gz: 2, kind: 'wood' },
      { gx: 11, gz: 2, kind: 'wood' },
      { gx: 6, gz: 7, kind: 'stone' },
      { gx: 11, gz: 7, kind: 'stone' },
      { gx: 3, gz: 4, kind: 'crystal' },
      { gx: 14, gz: 5, kind: 'crystal' },
    ],
    starterUnits: [
      { gx: 7, gz: 4, id: 'sunnyfox' },
      { gx: 7, gz: 2, id: 'poppydash' },
      { gx: 10, gz: 5, id: 'bobby' },
      { gx: 11, gz: 3, id: 'lunabat' },
    ],
  },

  // Stage 3: 20 x 12 — Crystal Highlands
  {
    index: 2,
    stageNumber: 3,
    id: 'stage_3_highlands',
    gridW: 20,
    gridH: 12,
    altarGx: 9.5,
    altarGz: 5.5,
    altarTiles: ['9,5', '10,5', '9,6', '10,6'],
    moonTarget: 65,
    portals: ['E', 'W', 'N'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon'],
    catnapSmokeEnabled: true,
    catnapSmokeInterval: 18.0,
    baseSpawnInterval: 3.7,
    waterTiles: [
      '5,2', '5,3', '5,4', '5,7', '5,8', '5,9',
      '14,2', '14,3', '14,4', '14,7', '14,8', '14,9',
      '8,2', '11,2',
    ],
    highCliffs: ['7,4', '12,4', '7,7', '12,7', '8,3', '11,3'],
    resourceNodes: [
      { gx: 6, gz: 3, kind: 'wood' },
      { gx: 13, gz: 3, kind: 'wood' },
      { gx: 6, gz: 8, kind: 'stone' },
      { gx: 13, gz: 8, kind: 'stone' },
      { gx: 9, gz: 2, kind: 'crystal' },
      { gx: 10, gz: 9, kind: 'crystal' },
      { gx: 3, gz: 2, kind: 'sun' },
      { gx: 16, gz: 9, kind: 'crystal' },
    ],
    starterUnits: [
      { gx: 8, gz: 5, id: 'sunnyfox' },
      { gx: 7, gz: 3, id: 'poppydash' },
      { gx: 7, gz: 8, id: 'picky' },
      { gx: 12, gz: 5, id: 'bobby' },
      { gx: 11, gz: 3, id: 'lunabat' },
    ],
  },

  // Stage 4: 22 x 12 — Four-Gate Island Labyrinth
  {
    index: 3,
    stageNumber: 4,
    id: 'stage_4_labyrinth',
    gridW: 22,
    gridH: 12,
    altarGx: 10.5,
    altarGz: 5.5,
    altarTiles: ['10,5', '11,5', '10,6', '11,6'],
    moonTarget: 80,
    portals: ['E', 'W', 'N', 'S'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon', 'necromancer'],
    catnapSmokeEnabled: true,
    catnapSmokeInterval: 14.5,
    baseSpawnInterval: 3.4,
    waterTiles: [
      '7,3', '7,4', '7,7', '7,8',
      '14,3', '14,4', '14,7', '14,8',
      '8,2', '9,2', '12,2', '13,2',
      '8,9', '9,9', '12,9', '13,9',
    ],
    highCliffs: [
      '8,4', '13,4', '8,7', '13,7',
      '5,4', '16,4', '5,7', '16,7',
    ],
    resourceNodes: [
      { gx: 9, gz: 3, kind: 'wood' },
      { gx: 12, gz: 8, kind: 'wood' },
      { gx: 4, gz: 2, kind: 'wood' },
      { gx: 9, gz: 8, kind: 'stone' },
      { gx: 12, gz: 3, kind: 'stone' },
      { gx: 17, gz: 9, kind: 'stone' },
      { gx: 6, gz: 5, kind: 'crystal' },
      { gx: 15, gz: 6, kind: 'crystal' },
      { gx: 3, gz: 9, kind: 'crystal' },
      { gx: 18, gz: 2, kind: 'sun' },
    ],
    starterUnits: [
      { gx: 9, gz: 5, id: 'sunnyfox' },
      { gx: 9, gz: 4, id: 'poppydash' },
      { gx: 9, gz: 7, id: 'picky' },
      { gx: 13, gz: 5, id: 'bobby' },
      { gx: 12, gz: 5, id: 'lunabat' },
    ],
  },

  // Stage 5: 22 x 14 — Starlight Citadel Finale
  {
    index: 4,
    stageNumber: 5,
    id: 'stage_5_citadel',
    gridW: 22,
    gridH: 14,
    altarGx: 10.5,
    altarGz: 6.5,
    altarTiles: ['10,6', '11,6', '10,7', '11,7'],
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
      'nightmare_boss',
    ],
    catnapSmokeEnabled: true,
    catnapSmokeInterval: 11.5,
    baseSpawnInterval: 3.1,
    waterTiles: [
      '5,2', '5,3', '5,4', '5,9', '5,10', '5,11',
      '16,2', '16,3', '16,4', '16,9', '16,10', '16,11',
      '8,2', '13,2', '8,11', '13,11',
    ],
    highCliffs: [
      '8,4', '13,4', '8,9', '13,9',
      '4,5', '17,5', '4,8', '17,8',
      '10,4', '11,9',
    ],
    resourceNodes: [
      { gx: 6, gz: 3, kind: 'wood' },
      { gx: 15, gz: 3, kind: 'wood' },
      { gx: 6, gz: 10, kind: 'sun' },
      { gx: 15, gz: 10, kind: 'sun' },
      { gx: 7, gz: 6, kind: 'stone' },
      { gx: 14, gz: 7, kind: 'stone' },
      { gx: 10, gz: 3, kind: 'stone' },
      { gx: 11, gz: 10, kind: 'wood' },
      { gx: 3, gz: 2, kind: 'crystal' },
      { gx: 18, gz: 2, kind: 'crystal' },
      { gx: 3, gz: 11, kind: 'crystal' },
      { gx: 18, gz: 11, kind: 'crystal' },
    ],
    starterUnits: [
      { gx: 9, gz: 5, id: 'sunnyfox' },
      { gx: 10, gz: 4, id: 'poppydash' },
      { gx: 8, gz: 6, id: 'picky' },
      { gx: 13, gz: 6, id: 'bobby' },
      { gx: 12, gz: 6, id: 'lunabat' },
      { gx: 8, gz: 7, id: 'mikey' },
    ],
  },
];

export function getStageConfig(stageIndex = 0) {
  const idx = Math.max(0, Math.min(STAGES.length - 1, Number(stageIndex) || 0));
  const stage = STAGES[idx];
  const waterSet = new Set(stage.waterTiles);
  const cliffSet = new Set(stage.highCliffs);
  const altarSet = new Set(stage.altarTiles);
  const nodeMap = new Map(stage.resourceNodes.map((n) => [`${n.gx},${n.gz}`, n]));

  const midXLow = Math.floor((stage.gridW - 1) / 2);
  const midXHigh = midXLow + 1;
  const midZLow = Math.floor((stage.gridH - 1) / 2);
  const midZHigh = midZLow + 1;

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
    nodeMap,
    midXLow,
    midXHigh,
    midZLow,
    midZHigh,
    getPortalDir,
    initialResources: { ...INITIAL_RESOURCES },
  };
}

export function computeDynamicResourceCosts(unitId, existingCount = 0) {
  const def = UNIT_MAP[unitId];
  if (!def) return { sun: 20, wood: 0, stone: 0, crystal: 0 };
  const mult = existingCount <= 0 ? 1.0 : Math.pow(1.12, existingCount);
  const c = def.cost || { sun: def.baseCost || 20, wood: 0, stone: 0, crystal: 0 };
  return {
    sun: c.sun > 0 ? Math.round(c.sun * mult) : 0,
    wood: c.wood > 0 ? Math.round(c.wood * mult) : 0,
    stone: c.stone > 0 ? Math.round(c.stone * mult) : 0,
    crystal: c.crystal > 0 ? Math.round(c.crystal * mult) : 0,
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

export function formatCostBadge(costObj) {
  if (!costObj) return '';
  const parts = [];
  if (costObj.sun > 0) parts.push(`☀️${costObj.sun}`);
  if (costObj.wood > 0) parts.push(`🪵${costObj.wood}`);
  if (costObj.stone > 0) parts.push(`🪨${costObj.stone}`);
  if (costObj.crystal > 0) parts.push(`💎${costObj.crystal}`);
  return parts.slice(0, 2).join(' ');
}

export function computeHarmonyState(placedUnits = []) {
  const roles = new Set();
  const tiers = new Set();
  const ids = new Set();
  for (const u of placedUnits) {
    if (!u.def || u.isStructure) continue;
    roles.add(u.def.role);
    if (u.def.tier) tiers.add(u.def.tier);
    ids.add(u.def.id);
    if (u.mounted?.def) {
      roles.add(u.mounted.def.role);
      if (u.mounted.def.tier) tiers.add(u.mounted.def.tier);
      ids.add(u.mounted.def.id);
    }
  }
  const hasAll3Roles = roles.size >= 3;
  let level = 0;
  if (hasAll3Roles && tiers.size >= 3 && ids.size >= 6) level = 3;
  else if (hasAll3Roles && ids.size >= 4) level = 2;
  else if (roles.size >= 2 && ids.size >= 2) level = 1;

  const mults = [1.0, 1.15, 1.30, 1.48];
  return {
    level,
    rolesCount: roles.size,
    tiersCount: tiers.size,
    uniqueCritters: ids.size,
    powerMult: mults[level],
  };
}

export function isTileIlluminated(
  gx,
  gz,
  placedUnits = [],
  moonRestored = false,
  altarGx = ALTAR_GX,
  altarGz = ALTAR_GZ
) {
  if (moonRestored) return true;
  if (Math.hypot(gx - altarGx, gz - altarGz) <= 3.6) return true;
  for (const u of placedUnits) {
    if (u.asleep) continue;
    const r = u.def?.lightRadius || (u.mounted && u.mounted.def?.lightRadius) || 0;
    if (r > 0) {
      const bonus = ((u.level || 1) - 1) * 0.35;
      if (Math.hypot(gx - u.gx, gz - u.gz) <= r + bonus + 0.15) return true;
    }
  }
  return false;
}

export function computeBalanceState({
  placedUnits,
  units,
  zombies = [],
  stageIndex = 0,
  moonShards = 0,
  wave = 1,
  difficulty = 'tactical',
  baseHp = 600,
  baseMaxHp = 600,
}) {
  const stageCfg = getStageConfig(stageIndex);
  const unitList = placedUnits || units || [];
  const harmony = computeHarmonyState(unitList);

  let sunRate = 2.0;
  let woodRate = 0.4;
  let stoneRate = 0.4;
  let crystalRate = 0.2;
  let shardRate = 0.0;
  let defensePower = 18;
  let antiAirPower = 0;
  let armorMeltPower = 0;
  let sleepingCount = 0;

  for (const u of unitList) {
    if (u.asleep) {
      sleepingCount++;
      continue;
    }
    if (u.isStructure) {
      defensePower += (u.hp || 400) / 45;
      continue;
    }
    const lvMult = 1 + ((u.level || 1) - 1) * 0.42;
    const condBoost = u.powered ? 1.30 : 1.0;
    const prod = u.def?.prod;
    const interval = u.def?.prodInterval || 4.0;

    if (prod) {
      const veinBoost = u.onVein ? (u.def.veinMult || 2.0) : 1.0;
      sunRate += ((prod.sun || 0) / interval) * lvMult * harmony.powerMult * condBoost;
      woodRate += ((prod.wood || 0) / interval) * lvMult * condBoost * (u.def.veinBonusNode === 'wood' ? veinBoost : 1);
      stoneRate += ((prod.stone || 0) / interval) * lvMult * condBoost * (u.def.veinBonusNode === 'stone' ? veinBoost : 1);
      crystalRate += ((prod.crystal || 0) / interval) * lvMult * condBoost * (u.def.veinBonusNode === 'crystal' ? veinBoost : 1);
    }

    if (u.def?.shardWeaver) {
      shardRate += (u.def.shardYield || 2) / (u.def.shardInterval || 5.5);
    }

    if (u.def?.role === 'produce') {
      defensePower += 6 * lvMult;
    } else if (u.def?.role === 'defend') {
      defensePower += ((u.hp || u.def.hp) / 30) * lvMult;
      if (u.mounted?.def) {
        const mLv = 1 + ((u.mounted.level || 1) - 1) * 0.42;
        const dps =
          (u.mounted.def.atk / u.mounted.def.fireInterval) *
          (u.def.towerDmgBonus || 1.30) *
          mLv *
          harmony.powerMult *
          condBoost;
        defensePower += dps;
        antiAirPower += dps;
        if (u.mounted.def.armorMelt) armorMeltPower += dps;
      }
    } else if (u.def?.role === 'attack') {
      const lit =
        u.def.nightVision ||
        isTileIlluminated(u.gx, u.gz, unitList, moonShards >= stageCfg.moonTarget, stageCfg.altarGx, stageCfg.altarGz);
      const lightFactor = lit ? 1.0 : 0.68;
      const dps = (u.def.atk / u.def.fireInterval) * lvMult * harmony.powerMult * lightFactor * condBoost;
      defensePower += dps;
      if (u.def.antiAir) antiAirPower += dps;
      if (u.def.armorMelt) armorMeltPower += dps;
    }
  }

  const stageScale = 0.82 + stageIndex * 0.12;
  const diffMult = difficulty === 'nightmare' ? 1.32 : difficulty === 'tactical' ? 1.08 : 0.74;
  let zombieThreat = (15 + wave * 8.2 + moonShards * 0.55) * stageScale * diffMult;
  for (const z of zombies) {
    zombieThreat += (z.hp * 0.15 + (z.def?.dps || 16) * 1.1);
  }

  const economyRate = sunRate + woodRate * 0.8 + stoneRate * 0.8 + crystalRate * 1.1;
  const effectiveCap = Math.max(24, defensePower + economyRate * 3.8);
  const pressureIndex = Number((zombieThreat / effectiveCap).toFixed(2));

  let spawnIntervalMult = difficulty === 'nightmare' ? 0.80 : difficulty === 'tactical' ? 0.94 : 1.25;
  let shardDropBonus = 0;
  if (pressureIndex > 1.35) {
    spawnIntervalMult *= 1.08;
  } else if (pressureIndex < 0.78 && unitList.length >= 5) {
    spawnIntervalMult *= 0.88;
    shardDropBonus = 1;
  }

  return {
    stageIndex: stageCfg.index,
    moonTarget: stageCfg.moonTarget,
    harmony,
    rates: {
      sun: Number(sunRate.toFixed(1)),
      wood: Number(woodRate.toFixed(1)),
      stone: Number(stoneRate.toFixed(1)),
      crystal: Number(crystalRate.toFixed(1)),
      shard: Number(shardRate.toFixed(2)),
    },
    economyRate: Number(economyRate.toFixed(1)),
    defensePower: Math.round(defensePower),
    antiAirPower: Math.round(antiAirPower),
    armorMeltPower: Math.round(armorMeltPower),
    sleepingCount,
    zombieThreat: Math.round(zombieThreat),
    pressureIndex,
    spawnIntervalMult,
    shardDropBonus,
    activePortals: [...stageCfg.portals],
  };
}
