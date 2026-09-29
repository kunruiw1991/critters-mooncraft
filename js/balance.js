// ============================================================================
// CRITTERCRAFT: MOONLESS NIGHT — TIGHT, MEANINGFUL 4-RESOURCE ECONOMY & PVZ WAVES
// - Zero passive resource inflation: resources ONLY come from Gatherer work cycles
//   (every 5.5s) on Resource Veins and clicked salvage orbs.
// - Tight opening bank (☀️ 60, 🪵 20, 🪨 20, 💎 0) with 1 starter SunnyFox:
//   every harvest matters and is immediately spent on tech progression, upgrades,
//   and escalating Moon Sanctuary Forging!
// ============================================================================

export const INITIAL_RESOURCES = {
  sun: 75,
  wood: 45,
  stone: 35,
  crystal: 0,
  core: 0
};

export const RESOURCE_META = {
  sun:     { id: 'sun',     symbol: '☀️', color: '#ffd43b' },
  wood:    { id: 'wood',    symbol: '🪵', color: '#51cf66' },
  stone:   { id: 'stone',   symbol: '🧱', color: '#f76707' },
  crystal: { id: 'crystal', symbol: '💎', color: '#22b8cf' },
  core:    { id: 'core',    symbol: '🔮', color: '#ae3ec9' }
};

// Moon Sanctuary Forge Recipe: Base cost (escalates +15% per forge so resources always have a high-value sink!)
export const MOON_FORGE_RECIPE = {
  cost: { sun: 30, wood: 25, stone: 25, crystal: 8 },
  shards: 6
};

// ==================== 10 CRITTERS IN 3-TIER TACTICAL HIERARCHY ====================
// 3-Arm Consensus Orthogonal 4-Resource Cost Matrix:
// - 8 Buttons Use ☀️ Sun (61.5%):
//   SunnyFox (☀️25 🪵15), PoppyDash (☀️30 pure Sun!), Picky (☀️25 🪵20),
//   Bubba (☀️35 🧱30, 🪵0!), LunaBat (☀️35 🪵25, 🧱0!),
//   DogDay (☀️55 🧱55 💎12, 🪵0!), Kickin (☀️50 🪵45 💎12, 🧱0!), Upgrade (☀️20 🪵25 🧱30)
// - 5 Buttons Are SUN-FREE (☀️0, 38.5% — spend Wood & Brick even when ☀️ == 0!):
//   Bobby (🪵25 🧱30), Mikey (🪵30 🧱30), CraftyCorn (🪵50 🧱45 💎14), Bridge (🪵25), SpikeTrap (🪵15 🧱20)
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
    // Uses Sun + Wood (☀️12 🪵15, 🧱0 — initial Sun cost halved!) to expand Sun Shrine production
    cost: { sun: 12, wood: 15, stone: 0, crystal: 0 },
    hp: 220,
    prod: { sun: 5, wood: 0, stone: 0, crystal: 0 },
    prodInterval: 5.2,
    veinBonusNode: 'sun',
    veinMult: 2.4, // +12 ☀️ every 5.2s on Sun Shrine Vein
    atk: 9,
    fireInterval: 1.7,
    range: 2.3,
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
    // Pure Sun sink (☀️30, 🪵0 🧱0) to expand Wood Gatherer Skunk!
    cost: { sun: 30, wood: 0, stone: 0, crystal: 0 },
    hp: 230,
    prod: { sun: 0, wood: 4, stone: 0, crystal: 0 },
    prodInterval: 5.2,
    veinBonusNode: 'wood',
    veinMult: 2.5, // +10 🪵 every 5.2s on Forest Vein
    hasteRadius: 2.8,
    hasteMult: 1.25,
    atk: 9,
    fireInterval: 1.7,
    range: 2.3,
    antiAir: false,
    knockback: 0.12
  },
  {
    id: 'picky',
    tier: 1,
    role: 'produce',
    icon: 'icons/picky.jpg',
    portrait: 'icons/picky.jpg',
    fxIcon: '🧱',
    color: '#f783ac',
    accent: '#ffdeeb',
    // Uses Sun + Wood (☀️25 🪵20, 🧱0) to start Brick Quarry production + AoE Healing!
    cost: { sun: 25, wood: 20, stone: 0, crystal: 0 },
    hp: 260,
    prod: { sun: 0, wood: 0, stone: 4, crystal: 0 },
    prodInterval: 5.2,
    veinBonusNode: 'stone',
    veinMult: 2.5, // +10 🧱 every 5.2s on Brick Quarry Vein
    healRadius: 3.0,
    healPerSec: 18,
    atk: 11,
    fireInterval: 1.5,
    range: 2.6,
    splashRadius: 0.85,
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
    // WOOD-FREE! Uses Sun + Brick (☀️35 🧱30, 🪵0) to mine Diamonds & slow zombies!
    cost: { sun: 35, wood: 0, stone: 30, crystal: 0 },
    hp: 360,
    amphibious: true,
    prod: { sun: 0, wood: 0, stone: 0, crystal: 2 },
    prodInterval: 5.6,
    veinBonusNode: 'crystal',
    veinMult: 3.0, // +6 💎 every 5.6s on Crystal Vein or Water
    slowRadius: 3.2,
    slowFactor: 0.48,
    atk: 18,
    fireInterval: 1.3,
    range: 3.6,
    antiAir: true
  },
  {
    id: 'bobby',
    tier: 2,
    role: 'defend',
    icon: 'icons/bobby.jpg',
    portrait: 'icons/bobby.jpg',
    fxIcon: '🛡️',
    color: '#e03131',
    accent: '#ffc9c9',
    // SUN-FREE! Pure Wood + Brick (🪵25 🧱30, ☀️0) frontline shield wall!
    cost: { sun: 0, wood: 25, stone: 30, crystal: 0 },
    hp: 860,
    thornsDmg: 26,
    blastResist: 0.65,
    atk: 25,
    fireInterval: 1.3,
    range: 2.2,
    splashRadius: 1.45,
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
    // SUN-FREE! Pure Wood + Brick (🪵30 🧱30, ☀️0) stackable watchtower!
    cost: { sun: 0, wood: 30, stone: 30, crystal: 0 },
    hp: 500,
    stackable: true,
    towerRangeBonus: 1.40,
    towerDmgBonus: 1.30,
    grantsAntiAir: true,
    atk: 22,
    fireInterval: 1.1,
    range: 4.6,
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
    // BRICK-FREE! Uses Sun + Wood (☀️35 🪵25, 🧱0) fast crossbow ballista!
    cost: { sun: 35, wood: 25, stone: 0, crystal: 0 },
    hp: 250,
    atk: 36,
    fireInterval: 0.82,
    range: 5.2,
    pierce: 2,
    antiAir: true,
    bonusVsFlyerCreeper: 1.80
  },

  // -------------------- TIER 3: HIGH-TIER SYMMETRIC TRIANGLE TOWERS --------------------
  {
    id: 'dogday',
    tier: 3,
    role: 'attack',
    icon: 'icons/dogday.jpg',
    portrait: 'icons/dogday.jpg',
    fxIcon: '💥',
    color: '#fd7e14',
    accent: '#ffe8cc',
    // WOOD-FREE! Heavy Sun + Heavy Brick + Diamond Mortar (☀️55 🧱55 💎12, 🪵0)
    cost: { sun: 55, wood: 0, stone: 55, crystal: 12 },
    hp: 330,
    atk: 74,
    fireInterval: 1.3,
    range: 5.4,
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
    // SUN-FREE Tier-3 Tower! Heavy Wood + Heavy Brick + Diamond (🪵50 🧱45 💎14, ☀️0)!
    cost: { sun: 0, wood: 50, stone: 45, crystal: 14 },
    hp: 300,
    atk: 54,
    fireInterval: 0.96,
    range: 6.0,
    antiAir: true,
    vulnBonus: 0.35,
    shardWeaver: true,
    shardInterval: 7.2,
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
    // BRICK-FREE! Heavy Sun + Heavy Wood + Diamond Tesla Coil (☀️50 🪵45 💎12, 🧱0)
    cost: { sun: 50, wood: 45, stone: 0, crystal: 12, core: 0 },
    hp: 320,
    atk: 46,
    fireInterval: 0.88,
    range: 5.0,
    chainTargets: 4,
    knockback: 0.40,
    antiAir: true
  },

  // -------------------- TIER 4: ADVANCED APEX BUILDINGS (BUILT WITH RARE 🔮 STAR CORES DROPPED BY TOUGH MONSTERS) --------------------
  {
    id: 'starlight_cannon',
    tier: 4,
    role: 'attack',
    isApexBuilding: true,
    fxIcon: '🛸',
    color: '#7950f2',
    accent: '#ffd43b',
    nameEn: 'Starlight Cannon',
    nameZh: '星辉巨炮',
    // Built with Sun + Brick + 2 Rare Star Cores (☀️60 🧱50 🔮2) dropped by Tough Elite Monsters!
    cost: { sun: 60, wood: 0, stone: 50, crystal: 0, core: 2 },
    hp: 680,
    atk: 145,
    fireInterval: 1.35,
    range: 7.6,
    splashRadius: 2.25,
    armorMelt: 0.90,
    antiAir: true
  },
  {
    id: 'moon_obelisk',
    tier: 4,
    role: 'attack',
    isApexBuilding: true,
    fxIcon: '🏛️',
    color: '#22b8cf',
    accent: '#fff3bf',
    nameEn: 'Lunar Obelisk',
    nameZh: '月神方尖碑',
    // SUN-FREE Apex Wonder! Built with Wood + Diamond + 3 Rare Star Cores (🪵55 💎16 🔮3)!
    cost: { sun: 0, wood: 55, stone: 0, crystal: 16, core: 3 },
    hp: 780,
    atk: 92,
    fireInterval: 0.95,
    range: 6.6,
    chainTargets: 5,
    antiAir: true,
    healRadius: 4.0,
    healPerSec: 32,
    hasteRadius: 4.0,
    hasteMult: 1.35,
    shardWeaver: true,
    shardInterval: 4.8,
    shardYield: 3
  }
];

// ==================== 11 DISTINCT ZOMBIE & TOUGH LATE-WAVE ELITE ARCHETYPES ====================
// Tough late-wave monsters (Wave 3+: iron_golem, necromancer, crystal_behemoth, nightmare_boss, abyss_dragon)
// drop Rare 🔮 Star Cores (`reward.core`) upon defeat to unlock Tier 4 Advanced Apex Buildings!
export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    nameEn: 'Walker Zombie',
    nameZh: '普通僵尸',
    hp: 110,
    speed: 0.42,
    dps: 15,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0, shard: 0 },
    scale: 0.92,
    shirtColor: '#4dabf7',
    skinColor: '#69db7c'
  },
  runner: {
    id: 'runner',
    nameEn: 'Sprinter Zombie',
    nameZh: '疾跑僵尸',
    hp: 90,
    speed: 0.68,
    dps: 15,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0, shard: 0 },
    scale: 0.84,
    shirtColor: '#f783ac',
    skinColor: '#8ce99a'
  },
  bucket: {
    id: 'bucket',
    nameEn: 'Iron Buckethead',
    nameZh: '铁桶僵尸',
    hp: 260,
    speed: 0.36,
    dps: 22,
    armor: 0.40,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0, shard: 1 },
    scale: 1.15,
    shirtColor: '#868e96',
    skinColor: '#51cf66'
  },
  digger: {
    id: 'digger',
    nameEn: 'Miner Digger',
    nameZh: '矿工僵尸',
    hp: 180,
    speed: 0.45,
    dps: 24,
    wallBreaker: true,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0, shard: 1 },
    scale: 1.04,
    shirtColor: '#f59f00',
    skinColor: '#69db7c'
  },
  creeper: {
    id: 'creeper',
    nameEn: 'TNT Creeper',
    nameZh: '苦力怕炸弹怪',
    hp: 155,
    speed: 0.50,
    dps: 18,
    frontBurstDmg: 110,
    splashBurstDmg: 35,
    breachDmg: 2,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0, shard: 1 },
    scale: 1.05,
    shirtColor: '#40c057',
    skinColor: '#37b24d'
  },
  balloon: {
    id: 'balloon',
    nameEn: 'Sky Balloon',
    nameZh: '气球僵尸',
    hp: 150,
    speed: 0.46,
    dps: 16,
    flying: true,
    breachDmg: 1,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0, shard: 1 },
    scale: 0.96,
    shirtColor: '#7950f2',
    skinColor: '#9775fa'
  },
  // -------------------- TOUGH LATE-WAVE ELITES (DROP RARE 🔮 STAR CORES!) --------------------
  iron_golem: {
    id: 'iron_golem',
    nameEn: 'Iron Juggernaut',
    nameZh: '铁甲巨像 (掉🔮星核)',
    isElite: true,
    hp: 460,
    speed: 0.30,
    dps: 28,
    armor: 0.45,
    wallBreaker: true,
    breachDmg: 2,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, core: 2, shard: 2 },
    scale: 1.34,
    shirtColor: '#343a40',
    skinColor: '#adb5bd'
  },
  necromancer: {
    id: 'necromancer',
    nameEn: 'Dark Necromancer',
    nameZh: '暗影死灵巫师 (掉🔮星核)',
    isElite: true,
    hp: 340,
    speed: 0.34,
    dps: 20,
    armor: 0.25,
    healRadius: 2.8,
    healPerSec: 10,
    summonInterval: 10.5,
    breachDmg: 2,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 0, core: 2, shard: 2 },
    scale: 1.22,
    shirtColor: '#3b1f7a',
    skinColor: '#b197fc'
  },
  crystal_behemoth: {
    id: 'crystal_behemoth',
    nameEn: 'Crystal Behemoth',
    nameZh: '晶簇巨兽 (掉🔮星核)',
    isElite: true,
    hp: 650,
    speed: 0.28,
    dps: 30,
    armor: 0.35,
    healRadius: 2.5,
    healPerSec: 12,
    rangedAtk: 22,
    rangedRange: 3.2,
    breachDmg: 2,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 6, core: 3, shard: 3 },
    scale: 1.44,
    shirtColor: '#6741d9',
    skinColor: '#da77f2'
  },
  nightmare_boss: {
    id: 'nightmare_boss',
    nameEn: 'Nightmare Goliath',
    nameZh: '噩梦巨魔王 (掉🔮星核)',
    isElite: true,
    hp: 760,
    speed: 0.28,
    dps: 34,
    armor: 0.30,
    poppyAuraRadius: 2.2,
    poppyAuraDps: 7,
    breachDmg: 3,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 8, core: 3, shard: 4 },
    scale: 1.50,
    shirtColor: '#5f3dc4',
    skinColor: '#9775fa'
  },
  abyss_dragon: {
    id: 'abyss_dragon',
    nameEn: 'Void Mech-Dragon',
    nameZh: '暗月魔龙王 (掉🔮星核)',
    isElite: true,
    hp: 890,
    speed: 0.26,
    dps: 36,
    armor: 0.35,
    flying: true,
    rangedAtk: 28,
    rangedRange: 3.6,
    poppyAuraRadius: 2.3,
    poppyAuraDps: 8,
    breachDmg: 3,
    reward: { sun: 0, wood: 0, stone: 0, crystal: 12, core: 4, shard: 5 },
    scale: 1.56,
    shirtColor: '#240046',
    skinColor: '#fcc419'
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

// ==================== 5 EXPANDED STAGE MAPS (18x12 TO 22x14, LONG WINDING ROADS, ZERO DEAD ANGLES) ====================
export const STAGES = [
  // Stage 1: 18 x 12 (216 tiles!) — S-Bend Sunlit Meadow (20-22 tile winding paths)
  {
    index: 0,
    stageNumber: 1,
    id: 'stage_1_meadow',
    gridW: 18,
    gridH: 12,
    altarGx: 2.5,
    altarGz: 5.5,
    moonTarget: 30,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'iron_golem', 'crystal_behemoth'],
    baseSpawnInterval: 5.2,
    routes: [
      [[17, 2], [13, 2], [13, 9], [8, 9], [8, 4], [4, 4], [4, 5]],
      [[17, 9], [13, 9], [13, 4], [8, 4], [8, 7], [4, 7], [4, 6]]
    ],
    waterTiles: ['10,0', '10,1', '10,10', '10,11'],
    highCliffs: ['11,5', '11,6', '6,3', '6,8'],
    resourceNodes: [
      { gx: 1, gz: 2, kind: 'sun' },
      { gx: 1, gz: 9, kind: 'wood' },
      { gx: 5, gz: 1, kind: 'stone' },
      { gx: 5, gz: 10, kind: 'crystal' },
      { gx: 15, gz: 1, kind: 'sun' },
      { gx: 15, gz: 10, kind: 'stone' }
    ],
    starterUnits: [
      { gx: 1, gz: 2, id: 'sunnyfox' },
      { gx: 1, gz: 9, id: 'poppydash' }
    ]
  },

  // Stage 2: 18 x 12 (216 tiles!) — Twin-Bridge River Canyon (21-tile serpentine paths)
  {
    index: 1,
    stageNumber: 2,
    id: 'stage_2_canyon',
    gridW: 18,
    gridH: 12,
    altarGx: 2.5,
    altarGz: 5.5,
    moonTarget: 40,
    portals: ['E'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon', 'iron_golem', 'crystal_behemoth'],
    baseSpawnInterval: 4.8,
    routes: [
      [[17, 1], [12, 1], [12, 4], [7, 4], [7, 2], [4, 2], [4, 5]],
      [[17, 10], [12, 10], [12, 7], [7, 7], [7, 9], [4, 9], [4, 6]]
    ],
    waterTiles: ['9,0', '9,1', '9,2', '9,5', '9,6', '9,9', '9,10', '9,11'],
    highCliffs: ['6,5', '6,6', '11,2', '11,9'],
    resourceNodes: [
      { gx: 1, gz: 2, kind: 'sun' },
      { gx: 1, gz: 9, kind: 'wood' },
      { gx: 5, gz: 0, kind: 'stone' },
      { gx: 5, gz: 11, kind: 'crystal' },
      { gx: 14, gz: 5, kind: 'sun' },
      { gx: 14, gz: 6, kind: 'stone' }
    ],
    starterUnits: [
      { gx: 1, gz: 2, id: 'sunnyfox' },
      { gx: 1, gz: 9, id: 'poppydash' }
    ]
  },

  // Stage 3: 20 x 12 (240 tiles!) — Central Moon Citadel (19-tile East & West serpentine loops)
  {
    index: 2,
    stageNumber: 3,
    id: 'stage_3_highlands',
    gridW: 20,
    gridH: 12,
    altarGx: 9.5,
    altarGz: 5.5,
    moonTarget: 50,
    portals: ['E', 'W'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon', 'iron_golem', 'necromancer', 'crystal_behemoth'],
    baseSpawnInterval: 4.6,
    routes: [
      [[19, 2], [15, 2], [15, 9], [12, 9], [12, 6], [11, 6]],
      [[0, 9], [4, 9], [4, 2], [7, 2], [7, 5], [8, 5]]
    ],
    waterTiles: ['6,0', '6,1', '13,10', '13,11'],
    highCliffs: ['6,7', '13,4', '3,5', '16,6'],
    resourceNodes: [
      { gx: 8, gz: 1, kind: 'sun' },
      { gx: 11, gz: 1, kind: 'wood' },
      { gx: 8, gz: 10, kind: 'stone' },
      { gx: 11, gz: 10, kind: 'crystal' },
      { gx: 2, gz: 1, kind: 'stone' },
      { gx: 17, gz: 10, kind: 'crystal' }
    ],
    starterUnits: [
      { gx: 8, gz: 1, id: 'sunnyfox' },
      { gx: 11, gz: 1, id: 'poppydash' }
    ]
  },

  // Stage 4: 22 x 14 (308 tiles!) — Three-Gate Star Fortress
  // North portal at [10, 0] winds 16 tiles across the wide upper-west meadow ([10,0]->[10,2]->[5,2]->[5,6]->[9,6]),
  // approaching the Moon Sanctuary from the West side with ZERO blind spot behind the Castle and 20+ open buildable tiles!
  {
    index: 3,
    stageNumber: 4,
    id: 'stage_4_labyrinth',
    gridW: 22,
    gridH: 14,
    altarGx: 10.5,
    altarGz: 6.5,
    moonTarget: 65,
    portals: ['E', 'W', 'N'],
    zombiePool: ['walker', 'runner', 'digger', 'bucket', 'creeper', 'balloon', 'iron_golem', 'necromancer', 'crystal_behemoth', 'nightmare_boss', 'abyss_dragon'],
    baseSpawnInterval: 4.5,
    routes: [
      [[21, 3], [17, 3], [17, 10], [14, 10], [14, 7], [12, 7]],
      [[0, 10], [4, 10], [4, 11], [8, 11], [8, 7], [9, 7]],
      [[10, 0], [10, 2], [5, 2], [5, 6], [9, 6]]
    ],
    waterTiles: ['2,0', '2,1', '19,12', '19,13'],
    highCliffs: ['7,4', '15,5', '6,9', '15,9'],
    resourceNodes: [
      { gx: 13, gz: 2, kind: 'sun' },
      { gx: 13, gz: 4, kind: 'wood' },
      { gx: 10, gz: 10, kind: 'stone' },
      { gx: 12, gz: 10, kind: 'crystal' },
      { gx: 2, gz: 5, kind: 'wood' },
      { gx: 19, gz: 2, kind: 'stone' }
    ],
    starterUnits: [
      { gx: 13, gz: 2, id: 'sunnyfox' },
      { gx: 13, gz: 4, id: 'poppydash' }
    ]
  },

  // Stage 5: 22 x 14 (308 tiles!) — Four-Gate Starlight Finale
  // All 4 portals (N, S, E, W) follow 16-tile serpentine paths that enter the Sanctuary from the East/West sides!
  {
    index: 4,
    stageNumber: 5,
    id: 'stage_5_citadel',
    gridW: 22,
    gridH: 14,
    altarGx: 10.5,
    altarGz: 6.5,
    moonTarget: 80,
    portals: ['E', 'W', 'N', 'S'],
    zombiePool: [
      'walker',
      'runner',
      'digger',
      'bucket',
      'creeper',
      'balloon',
      'iron_golem',
      'necromancer',
      'crystal_behemoth',
      'nightmare_boss',
      'abyss_dragon'
    ],
    baseSpawnInterval: 4.4,
    routes: [
      [[21, 9], [18, 9], [18, 11], [14, 11], [14, 7], [12, 7]],
      [[0, 4], [3, 4], [3, 2], [7, 2], [7, 6], [9, 6]],
      [[10, 0], [10, 2], [16, 2], [16, 6], [12, 6]],
      [[11, 13], [11, 11], [5, 11], [5, 7], [9, 7]]
    ],
    waterTiles: ['2,0', '2,1', '19,0', '19,1', '2,12', '2,13', '19,12', '19,13'],
    highCliffs: ['6,4', '14,4', '7,9', '15,9'],
    resourceNodes: [
      { gx: 9, gz: 4, kind: 'sun' },
      { gx: 12, gz: 4, kind: 'wood' },
      { gx: 9, gz: 9, kind: 'stone' },
      { gx: 12, gz: 9, kind: 'crystal' },
      { gx: 2, gz: 8, kind: 'stone' },
      { gx: 19, gz: 5, kind: 'crystal' }
    ],
    starterUnits: [
      { gx: 9, gz: 4, id: 'sunnyfox' },
      { gx: 12, gz: 4, id: 'poppydash' }
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

// +18% cost scaling per existing copy of the same unit + +20% per Heat level (1 + 0.20 * heat)!
export function computeDynamicResourceCosts(def, existingCount = 0, heat = 0) {
  if (!def || !def.cost) return { sun: 0, wood: 0, stone: 0, crystal: 0, core: 0 };
  const copyMult = existingCount <= 0 ? 1.0 : Math.pow(1.18, existingCount);
  const heatMult = 1 + Math.max(0, Number(heat) || 0) * 0.20;
  const mult = copyMult * heatMult;
  const c = def.cost;
  return {
    sun: c.sun > 0 ? Math.round(c.sun * mult) : 0,
    wood: c.wood > 0 ? Math.round(c.wood * mult) : 0,
    stone: c.stone > 0 ? Math.round(c.stone * mult) : 0,
    crystal: c.crystal > 0 ? Math.round(c.crystal * mult) : 0,
    core: c.core > 0 ? Math.max(1, Math.round(c.core * mult)) : 0
  };
}

// Universal Balanced 3-Resource Upgrade Cost (Lv.1 -> Lv.2 -> Lv.3): Sun + Wood + Brick (☀️20 🪵25 🧱30, +20% per Heat level)!
export const UPGRADE_COST = {
  sun: 20,
  wood: 25,
  stone: 30,
  crystal: 0,
  core: 0
};

export function computeUpgradeCost(def = null, currentLevel = 1, heat = 0) {
  const heatMult = 1 + Math.max(0, Number(heat) || 0) * 0.20;
  return {
    sun: UPGRADE_COST.sun > 0 ? Math.round(UPGRADE_COST.sun * heatMult) : 0,
    wood: UPGRADE_COST.wood > 0 ? Math.round(UPGRADE_COST.wood * heatMult) : 0,
    stone: UPGRADE_COST.stone > 0 ? Math.round(UPGRADE_COST.stone * heatMult) : 0,
    crystal: (UPGRADE_COST.crystal || 0) > 0 ? Math.round(UPGRADE_COST.crystal * heatMult) : 0,
    core: (UPGRADE_COST.core || 0) > 0 ? Math.round(UPGRADE_COST.core * heatMult) : 0
  };
}

export function canAffordCost(resources, costObj) {
  if (!resources || !costObj) return false;
  return (
    (resources.sun ?? 0) >= (costObj.sun || 0) &&
    (resources.wood ?? 0) >= (costObj.wood || 0) &&
    (resources.stone ?? 0) >= (costObj.stone || 0) &&
    (resources.crystal ?? 0) >= (costObj.crystal || 0) &&
    (resources.core ?? 0) >= (costObj.core || 0)
  );
}

export function deductCost(resources, costObj) {
  if (!resources || !costObj) return;
  resources.sun = Math.max(0, (resources.sun || 0) - (costObj.sun || 0));
  resources.wood = Math.max(0, (resources.wood || 0) - (costObj.wood || 0));
  resources.stone = Math.max(0, (resources.stone || 0) - (costObj.stone || 0));
  resources.crystal = Math.max(0, (resources.crystal || 0) - (costObj.crystal || 0));
  resources.core = Math.max(0, (resources.core || 0) - (costObj.core || 0));
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
