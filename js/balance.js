// CritterCraft: Moonless Night — Tactical 4-Resource Economy, Role-Specialized Critters,
// Counter-Based Zombie Roster, Winding Cobblestone Roads, and 5 Escalating Stage Maps.

export const INITIAL_RESOURCES = {
  sun: 75,      // ☀️ Solar energy (enough for 1 Defender/Archer + 1 Gatherer; must harvest Sun Veins!)
  wood: 30,     // 🪵 Timber (enough for 1 early Archer/Miner; must build PoppyDash on Forest Veins!)
  stone: 30,    // 🪨 Masonry (enough for 1 early Bobby Wall; must build PickyPiggy on Quarries!)
  crystal: 0    // 💎 Starlight Crystal (starts at 0! Must build Bubba on Crystal/Water Veins!)
};

export const RESOURCE_META = {
  sun:     { id: 'sun',     symbol: '☀️', color: '#ffd43b' },
  wood:    { id: 'wood',    symbol: '🪵', color: '#51cf66' },
  stone:   { id: 'stone',   symbol: '🪨', color: '#74c0fc' },
  crystal: { id: 'crystal', symbol: '💎', color: '#da77f2' }
};

// ==================== 10 CRITTERS IN 3-TIER TACTICAL HIERARCHY ====================
// Strict Role Separation:
// - Tier 1 Gatherers produce 2.5x resources when placed on matching Resource Veins (1x off-vein),
//   have fragile HP (165-210), and only a tiny close-range self-defense poke (range 2.0-2.2, ground-only).
// - Tier 2 Defenders & Crossbows hold the road, mine Crystal, build Watchtowers, and counter Flyers/Creepers.
// - Tier 3 Arcane & Siege Specialists require Crystal (💎) and counter Heavy Armor, Swarms, and Bosses.
export const UNITS = [
  // -------------------- TIER 1: RESOURCE GATHERERS & SUPPORT --------------------
  {
    id: 'sunnyfox',
    tier: 1,
    role: 'produce',
    icon: 'icons/sunnyfox.jpg',
    color: '#f59f00',
    accent: '#fff3bf',
    cost: { sun: 25, wood: 0, stone: 0, crystal: 0 },
    hp: 165,
    prod: { sun: 6, wood: 0, stone: 0, crystal: 0 },
    prodInterval: 3.8,
    veinBonusNode: 'sun',
    veinMult: 2.5, // +15 ☀️ on Sun Shrine Vein vs +6 ☀️ on plain grass!
    atk: 6,
    fireInterval: 1.90,
    range: 2.0,
    antiAir: false,
    lightRadius: 3.5
  },
  {
    id: 'poppydash',
    tier: 1,
    role: 'produce',
    icon: 'icons/poppydash.jpg',
    color: '#495057',
    accent: '#74c0fc',
    cost: { sun: 25, wood: 0, stone: 0, crystal: 0 },
    hp: 175,
    prod: { sun: 0, wood: 5, stone: 0, crystal: 0 },
    prodInterval: 4.0,
    veinBonusNode: 'wood',
    veinMult: 2.4, // +12 🪵 on Forest Vein vs +5 🪵 off-vein!
    hasteRadius: 2.4,
    hasteMult: 1.25,
    atk: 7,
    fireInterval: 1.80,
    range: 2.1,
    antiAir: false,
    knockback: 0.15
  },
  {
    id: 'picky',
    tier: 1,
    role: 'produce',
    icon: 'icons/picky.jpg',
    color: '#f783ac',
    accent: '#ffdeeb',
    cost: { sun: 30, wood: 10, stone: 0, crystal: 0 },
    hp: 210,
    prod: { sun: 0, wood: 0, stone: 5, crystal: 0 },
    prodInterval: 4.0,
    veinBonusNode: 'stone',
    veinMult: 2.4, // +12 🪨 on Quarry Vein vs +5 🪨 off-vein!
    healRadius: 2.8,
    healPerSec: 20,
    atk: 9,
    fireInterval: 1.80,
    range: 2.2,
    splashRadius: 0.8,
    antiAir: false
  },

  // -------------------- TIER 2: DEFENDERS, CRYSTAL MINER & ANTI-AIR --------------------
  {
    id: 'bubba',
    tier: 2,
    role: 'defend',
    icon: 'icons/bubba.jpg',
    color: '#339af0',
    accent: '#d0ebff',
    cost: { sun: 35, wood: 15, stone: 15, crystal: 0 },
    hp: 360,
    amphibious: true,
    prod: { sun: 0, wood: 0, stone: 0, crystal: 4 },
    prodInterval: 4.2,
    veinBonusNode: 'crystal',
    veinMult: 2.5, // +10 💎 on Crystal Vein or Water tile vs +4 💎 off-vein!
    slowRadius: 3.0,
    slowFactor: 0.50,
    atk: 18,
    fireInterval: 1.35,
    range: 3.4,
    antiAir: false
  },
  {
    id: 'bobby',
    tier: 2,
    role: 'defend',
    icon: 'icons/bobby.jpg',
    color: '#e03131',
    accent: '#ffc9c9',
    cost: { sun: 25, wood: 0, stone: 25, crystal: 0 },
    hp: 780,
    thornsDmg: 22,
    blastResist: 0.65,
    atk: 28,
    fireInterval: 1.40,
    range: 2.1,
    splashRadius: 1.5,
    antiAir: false
  },
  {
    id: 'mikey',
    tier: 2,
    role: 'defend',
    icon: 'icons/mikey.jpg',
    color: '#37b24d',
    accent: '#b2f2bb',
    cost: { sun: 25, wood: 20, stone: 20, crystal: 0 },
    hp: 460,
    stackable: true,
    towerRangeBonus: 1.40,
    towerDmgBonus: 1.30,
    grantsAntiAir: true,
    atk: 20,
    fireInterval: 1.15,
    range: 4.3,
    antiAir: true,
    deathBlastDmg: 150
  },
  {
    id: 'lunabat',
    tier: 2,
    role: 'attack',
    icon: 'icons/lunabat.jpg',
    color: '#7950f2',
    accent: '#e5dbff',
    cost: { sun: 40, wood: 25, stone: 0, crystal: 0 },
    hp: 175,
    atk: 31,
    fireInterval: 0.92,
    range: 4.7,
    pierce: 2,
    antiAir: true,
    bonusVsFlyerCreeper: 1.85
  },

  // -------------------- TIER 3: ARCANE & SIEGE SPECIALISTS (Require 💎 Crystal!) --------------------
  {
    id: 'dogday',
    tier: 3,
    role: 'attack',
    icon: 'icons/dogday.jpg',
    color: '#fd7e14',
    accent: '#ffe8cc',
    cost: { sun: 50, wood: 0, stone: 30, crystal: 12 },
    hp: 250,
    atk: 66,
    fireInterval: 1.38,
    range: 4.9,
    splashRadius: 1.80,
    armorMelt: 0.78,
    antiAir: false // Ground mortar unless stacked on Mikey Watchtower!
  },
  {
    id: 'craftycorn',
    tier: 3,
    role: 'attack',
    icon: 'icons/craftycorn.jpg',
    color: '#22b8cf',
    accent: '#c5f6fa',
    cost: { sun: 55, wood: 25, stone: 0, crystal: 14 },
    hp: 210,
    atk: 48,
    fireInterval: 0.94,
    range: 5.8,
    antiAir: true,
    vulnBonus: 0.35,
    shardWeaver: true,
    shardYield: 2,
    shardInterval: 7.0
  },
  {
    id: 'kickin',
    tier: 3,
    role: 'attack',
    icon: 'icons/kickin.jpg',
    color: '#fab005',
    accent: '#fff9db',
    cost: { sun: 45, wood: 20, stone: 20, crystal: 14 },
    hp: 240,
    atk: 40,
    fireInterval: 1.00,
    range: 4.6,
    antiAir: true,
    chainTargets: 4,
    knockback: 0.38
  }
];

export const UNIT_MAP = Object.fromEntries(UNITS.map(u => [u.id, u]));

// ==================== 8 DISTINCT COUNTER-BASED ZOMBIE ARCHETYPES ====================
export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    hp: 205,
    speed: 0.65,
    dps: 24,
    breachDmg: 1,
    reward: { sun: 6, wood: 2, stone: 2, crystal: 0, shard: 0 },
    scale: 1.0,
    shirtColor: '#22b8cf',
    skinColor: '#69db7c'
  },
  runner: {
    id: 'runner',
    hp: 160,
    speed: 1.18,
    dps: 22,
    breachDmg: 1,
    reward: { sun: 7, wood: 3, stone: 2, crystal: 0, shard: 0 },
    scale: 0.84,
    shirtColor: '#f783ac',
    skinColor: '#8ce99a'
  },
  bucket: {
    id: 'bucket',
    hp: 580,
    speed: 0.54,
    dps: 36,
    armor: 0.68, // 68% damage reduction! Non-mortar towers barely scratch it until DogDay melts its armor!
    breachDmg: 2,
    reward: { sun: 10, wood: 4, stone: 6, crystal: 2, shard: 1 },
    scale: 1.18,
    shirtColor: '#868e96',
    skinColor: '#51cf66'
  },
  digger: {
    id: 'digger',
    hp: 310,
    speed: 0.68,
    dps: 38,
    wallBreaker: true,
    rangedAtk: 20,      // Hurls pickaxes at nearby towers within 2.8 tiles! Fragile archers without Picky/Bobby get sniped!
    rangedRange: 2.8,
    breachDmg: 1,
    reward: { sun: 8, wood: 3, stone: 5, crystal: 1, shard: 1 },
    scale: 1.05,
    shirtColor: '#f59f00',
    skinColor: '#69db7c'
  },
  creeper: {
    id: 'creeper',
    hp: 270,
    speed: 0.78,
    dps: 26,
    frontBurstDmg: 260, // Devastates fragile towers unless absorbed by Bobby BearHug (65% blast resist) or sniped by LunaBat!
    splashBurstDmg: 95,
    breachDmg: 2,
    reward: { sun: 12, wood: 4, stone: 4, crystal: 3, shard: 1 },
    scale: 1.06,
    shirtColor: '#40c057',
    skinColor: '#37b24d'
  },
  balloon: {
    id: 'balloon',
    hp: 280,
    speed: 0.72,
    dps: 28,
    flying: true,       // Flies over ground blockers & traps! Requires LunaBat, Mikey, CraftyCorn, or Kickin!
    rangedAtk: 18,
    rangedRange: 2.6,
    breachDmg: 2,
    reward: { sun: 10, wood: 4, stone: 3, crystal: 3, shard: 1 },
    scale: 0.98,
    shirtColor: '#7950f2',
    skinColor: '#9775fa'
  },
  necromancer: {
    id: 'necromancer',
    hp: 510,
    speed: 0.48,
    dps: 28,
    armor: 0.32,
    healRadius: 3.0,
    healPerSec: 24,
    summonInterval: 7.5,
    rangedAtk: 22,
    rangedRange: 3.4,
    breachDmg: 2,
    reward: { sun: 14, wood: 5, stone: 5, crystal: 5, shard: 2 },
    scale: 1.22,
    shirtColor: '#3b1f7a',
    skinColor: '#b197fc'
  },
  nightmare_boss: {
    id: 'nightmare_boss',
    hp: 1750,
    speed: 0.42,
    dps: 58,
    armor: 0.45,
    poppyAuraRadius: 2.8, // Emits crimson poppy-gas aura that slows nearby towers by 35% and deals 18 DPS!
    poppyAuraDps: 18,
    breachDmg: 3,
    reward: { sun: 28, wood: 14, stone: 14, crystal: 12, shard: 5 },
    scale: 1.54,
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

// ==================== 5 ESCALATING STAGE MAPS (NO FREE PRE-BUILT ARMIES!) ====================
export const STAGES = [
  // Stage 1: 14 x 8 — S-Bend Meadow (Must harvest veins & build defense from scratch!)
  {
    index: 0,
    stageNumber: 1,
    id: 'stage_1_meadow',
    gridW: 14,
    gridH: 8,
    altarGx: 1,
    altarGz: 3.5,
    moonTarget: 35,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon'],
    baseSpawnInterval: 4.2,
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
    // Only 1 starter SunnyFox on a Sun Vein — player must build their own army!
    starterUnits: [
      { gx: 3, gz: 1, id: 'sunnyfox' }
    ]
  },

  // Stage 2: 14 x 8 — Twin-Bridge River Canyon (Flyers & Creepers join early!)
  {
    index: 1,
    stageNumber: 2,
    id: 'stage_2_canyon',
    gridW: 14,
    gridH: 8,
    altarGx: 1,
    altarGz: 3.5,
    moonTarget: 45,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon'],
    baseSpawnInterval: 3.8,
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

  // Stage 3: 15 x 8 — Central Moon Citadel (Two-Front Assault from East & West!)
  {
    index: 2,
    stageNumber: 3,
    id: 'stage_3_highlands',
    gridW: 15,
    gridH: 8,
    altarGx: 7,
    altarGz: 3.5,
    moonTarget: 60,
    portals: ['E', 'W'],
    zombiePool: ['runner', 'digger', 'bucket', 'creeper', 'balloon', 'necromancer'],
    baseSpawnInterval: 3.5,
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

  // Stage 4: 16 x 8 — Three-Gate Star Fortress (Portals E, W, N + Nightmare Bosses!)
  {
    index: 3,
    stageNumber: 4,
    id: 'stage_4_labyrinth',
    gridW: 16,
    gridH: 8,
    altarGx: 7.5,
    altarGz: 3.5,
    moonTarget: 75,
    portals: ['E', 'W', 'N'],
    zombiePool: ['runner', 'digger', 'bucket', 'creeper', 'balloon', 'necromancer', 'nightmare_boss'],
    baseSpawnInterval: 3.2,
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

  // Stage 5: 16 x 8 — Four-Gate Starlight Finale (All 4 Cardinal Portals E, W, N, S!)
  {
    index: 4,
    stageNumber: 5,
    id: 'stage_5_citadel',
    gridW: 16,
    gridH: 8,
    altarGx: 7.5,
    altarGz: 3.5,
    moonTarget: 95,
    portals: ['E', 'W', 'N', 'S'],
    zombiePool: [
      'runner',
      'digger',
      'bucket',
      'creeper',
      'balloon',
      'necromancer',
      'nightmare_boss'
    ],
    baseSpawnInterval: 2.9,
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

// Progressive cost scaling (+18% per duplicate unit on the board to prevent single-unit spam!)
export function computeDynamicResourceCosts(def, existingCount = 0) {
  if (!def || !def.cost) return { sun: 0, wood: 0, stone: 0, crystal: 0 };
  const mult = existingCount <= 0 ? 1.0 : Math.pow(1.18, existingCount);
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
  const lvMult = currentLevel === 1 ? 0.90 : 1.45;
  return {
    sun: Math.max(20, Math.round((c.sun || 25) * lvMult)),
    wood: Math.round((c.wood || (def?.role === 'attack' ? 15 : 0)) * lvMult),
    stone: Math.round((c.stone || (def?.role === 'defend' ? 15 : 0)) * lvMult),
    crystal: Math.max(currentLevel === 1 ? 5 : 10, Math.round((c.crystal || 5) * lvMult))
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
  let defensePower = 15;
  for (const u of placedUnits) {
    const lvMult = 1 + ((u.level || 1) - 1) * 0.45;
    if (u.def?.atk) {
      defensePower += ((u.def.atk || 15) / (u.def.fireInterval || 1.4)) * lvMult;
    }
    if (u.def?.role === 'defend') {
      defensePower += ((u.hp || 350) / 35) * lvMult;
    }
  }
  // Threat scales sharply with wave AND with Moon Restoration progress (the closer the Moon is to restored, the harder CatNap attacks!)
  const moonRage = 1 + (moonShards / Math.max(1, stageCfg.moonTarget)) * 0.65;
  const threat = (24 + wave * 12 + stageIndex * 14) * moonRage;
  const pressureIndex = Number((threat / Math.max(20, defensePower)).toFixed(2));
  const spawnIntervalMult = Math.max(0.55, Math.min(1.05, 1 / Math.sqrt(moonRage)));
  return {
    stageIndex,
    moonTarget: stageCfg.moonTarget,
    pressureIndex,
    spawnIntervalMult
  };
}
