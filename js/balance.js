// CritterCraft: Moonless Night — Deep Strategic Unit Catalog, 8 Zombie Archetypes & 6-Pillar Balance Engine.
// Board: 22 x 14 Multi-Biome Citadel Valley (Central Altar at [10..11, 6..7], 4 Cardinal Invasion Portals N/E/S/W).

export const GRID_W = 22;
export const GRID_H = 14;
export const ALTAR_GX = 10.5;
export const ALTAR_GZ = 6.5;

export const UNITS = [
  // ==================== PRODUCE (Dual-Resource Economy, Light, Cleansing & Geode Refining) ====================
  {
    id: 'sunnyfox',
    name: 'SunnyFox',
    title: 'Lantern Sun-Forge',
    role: 'produce',
    icon: 'icons/sunnyfox.jpg',
    color: '#f59f00',
    accent: '#fff3bf',
    baseCost: 30,
    oreCost: 5,
    hp: 210,
    prodAmount: 11,
    prodOre: 2,
    prodInterval: 4.2,
    lightRadius: 3.8,
    purgeSmoke: true,
    blurb: '+11 🌟 & +2 ⚙️/4.2s (+60% on Crystal Vein). Lights 3.8-tile Lantern Aura & burns away CatNap Red-Smoke!',
  },
  {
    id: 'poppydash',
    name: 'PoppyDash',
    title: 'Redstone Windmill Quarry',
    role: 'produce',
    icon: 'icons/poppydash.jpg',
    color: '#495057',
    accent: '#ffd43b',
    baseCost: 35,
    oreCost: 10,
    hp: 230,
    prodAmount: 6,
    prodOre: 9,
    prodInterval: 4.0,
    hasteRadius: 2.8,
    hasteMult: 1.35,
    blurb: 'Primary Ore Extractor: +9 ⚙️ Ore & +6 🌟/4s (2x ⚙️ on Redstone Vein!) + gives allies +35% attack speed.',
  },
  {
    id: 'picky',
    name: 'PickyPiggy',
    title: 'Berry Smelter & Healer',
    role: 'produce',
    icon: 'icons/picky.jpg',
    color: '#f783ac',
    accent: '#ffdeeb',
    baseCost: 40,
    oreCost: 12,
    hp: 260,
    prodAmount: 8,
    prodOre: 5,
    prodInterval: 4.2,
    healRadius: 3.0,
    healPerSec: 18,
    purgeSmoke: true,
    blurb: '+8 🌟 & +5 ⚙️/4.2s. Heals walls/allies (+18 HP/s in 3 tiles) & wakes critters from Nightmare Sleep!',
  },

  // ==================== DEFEND (Maze Fortifications, Cryo Moats & High-Ground Watchtowers) ====================
  {
    id: 'bobby',
    name: 'Bobby BearHug',
    title: 'Obsidian Bastion Wall',
    role: 'defend',
    icon: 'icons/bobby.jpg',
    color: '#e03131',
    accent: '#ffc9c9',
    baseCost: 25,
    oreCost: 14,
    hp: 850,
    tauntRadius: 2.6,
    thornsDmg: 16,
    blastResist: 0.5, // takes 50% less damage from TNT Creepers
    blurb: '850 HP Obsidian Fortress. Blocks paths, reflects 16 thorns DPS & resists 50% TNT Creeper blast!',
  },
  {
    id: 'bubba',
    name: 'Bubba',
    title: 'Cryo Moat & Shield Dome',
    role: 'defend',
    icon: 'icons/bubba.jpg',
    color: '#339af0',
    accent: '#d0ebff',
    baseCost: 35,
    oreCost: 12,
    hp: 420,
    amphibious: true, // can be placed on river water OR land
    slowRadius: 3.1,
    slowFactor: 0.45,
    shieldAura: 0.30,
    blurb: 'Can build on Water or Land! Chills enemies (-55% speed in 3.1 tiles) & shields allies (-30% dmg taken).',
  },
  {
    id: 'mikey',
    name: 'Mikey & JJ',
    title: 'Redstone Watchtower',
    role: 'defend',
    icon: 'icons/mikey.jpg',
    color: '#37b24d',
    accent: '#b2f2bb',
    baseCost: 30,
    oreCost: 16,
    hp: 460,
    stackable: true,
    towerRangeBonus: 1.45,
    towerDmgBonus: 1.30,
    deathBlastDmg: 140,
    blurb: 'Stack ANY Attack Critter ON TOP for +45% Range, +30% Damage & Anti-Air sight! Detonates TNT if broken.',
  },

  // ==================== ATTACK (Anti-Air Pierce, Anti-Armor Solar Splash, Prism Sniper & Tesla Knockback) ====================
  {
    id: 'lunabat',
    name: 'LunaBat',
    title: 'Moon-Star Anti-Air Crossbow',
    role: 'attack',
    icon: 'icons/lunabat.jpg',
    color: '#7950f2',
    accent: '#e5dbff',
    baseCost: 45,
    oreCost: 10,
    hp: 220,
    atk: 34,
    fireInterval: 0.95,
    range: 5.2,
    pierce: 2,
    antiAir: true,
    nightVision: true, // immune to Moonless Night fog penalty
    lightRadius: 2.0,
    blurb: '[Night-Vision + Anti-Air] Pierces 2 targets (5.2 range). Deals 1.6x damage to Flying Balloons & Creepers!',
  },
  {
    id: 'dogday',
    name: 'DogDay',
    title: 'Solar Siege Mortar',
    role: 'attack',
    icon: 'icons/dogday.jpg',
    color: '#fd7e14',
    accent: '#ffe8cc',
    baseCost: 60,
    oreCost: 22,
    hp: 280,
    atk: 54,
    fireInterval: 1.40,
    range: 4.8,
    splashRadius: 1.85,
    armorMelt: true, // ignores 70% of Bucket/Boss armor
    lightRadius: 2.4,
    blurb: '[Armor-Melting AoE] Heavy Solar Mortar (1.85-tile splash). Ignores 70% of Iron-Bucket & Boss armor!',
  },
  {
    id: 'craftycorn',
    name: 'CraftyCorn',
    title: 'Prism Sniper & Geode Loom',
    role: 'attack',
    icon: 'icons/craftycorn.jpg',
    color: '#22b8cf',
    accent: '#c5f6fa',
    baseCost: 55,
    oreCost: 18,
    hp: 215,
    atk: 42,
    fireInterval: 0.90,
    range: 6.4,
    antiAir: true,
    vulnBonus: 0.35,
    geodeHarvester: true,
    blurb: '[6.4-Range Sniper + Anti-Air] Marks enemies (+35% dmg taken) & harvests Moon Shards from nearby Moon Geodes!',
  },
  {
    id: 'kickin',
    name: 'Kickin & Hoppy',
    title: 'Tesla Piston Striker',
    role: 'attack',
    icon: 'icons/kickin.jpg',
    color: '#fab005',
    accent: '#fff9db',
    baseCost: 50,
    oreCost: 16,
    hp: 250,
    atk: 30,
    fireInterval: 1.0,
    range: 4.2,
    antiAir: true,
    chainTargets: 4,
    knockback: 0.70,
    blurb: '[4-Target Chain + Knockback] Zaps 4 ground/air zombies & knocks Creepers/Miners backward!',
  },
];

export const UNIT_MAP = Object.fromEntries(UNITS.map((u) => [u.id, u]));

// 8 Distinct Counter-Archetype Zombies
export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    name: 'Blockhead Walker',
    hp: 135,
    speed: 0.48,
    dps: 16,
    rewardStar: 7,
    rewardOre: 3,
    rewardShard: 0,
    scale: 1.0,
    shirtColor: '#22b8cf',
    skinColor: '#69db7c',
  },
  runner: {
    id: 'runner',
    name: 'Baby Hopper Runner',
    hp: 88,
    speed: 0.82,
    dps: 14,
    rewardStar: 8,
    rewardOre: 3,
    rewardShard: 0,
    scale: 0.78,
    shirtColor: '#f783ac',
    skinColor: '#8ce99a',
  },
  bucket: {
    id: 'bucket',
    name: 'Iron-Bucket Juggernaut',
    hp: 340,
    speed: 0.36,
    dps: 24,
    armor: 0.55,
    rewardStar: 14,
    rewardOre: 7,
    rewardShard: 2,
    scale: 1.15,
    shirtColor: '#868e96',
    skinColor: '#51cf66',
  },
  digger: {
    id: 'digger',
    name: 'Pickaxe Breach Miner',
    hp: 210,
    speed: 0.54,
    dps: 38, // 2.4x structure damage
    wallBreaker: true,
    rewardStar: 12,
    rewardOre: 8,
    rewardShard: 1,
    scale: 1.04,
    shirtColor: '#f59f00',
    skinColor: '#69db7c',
  },
  creeper: {
    id: 'creeper',
    name: 'TNT Creeper Sapper',
    hp: 155,
    speed: 0.58,
    dps: 18,
    explosiveDmg: 175,
    explosiveRadius: 1.85,
    rewardStar: 15,
    rewardOre: 9,
    rewardShard: 2,
    scale: 1.02,
    shirtColor: '#40c057',
    skinColor: '#37b24d',
  },
  balloon: {
    id: 'balloon',
    name: 'Phantom Balloon Floater',
    hp: 145,
    speed: 0.52,
    dps: 20,
    flying: true, // ignores walls & water, requires antiAir
    rewardStar: 14,
    rewardOre: 6,
    rewardShard: 2,
    scale: 0.96,
    shirtColor: '#7950f2',
    skinColor: '#9775fa',
  },
  necromancer: {
    id: 'necromancer',
    name: 'Dark-Robe Summoner',
    hp: 290,
    speed: 0.32,
    dps: 22,
    armor: 0.25,
    summonInterval: 7.5,
    rewardStar: 20,
    rewardOre: 10,
    rewardShard: 4,
    scale: 1.18,
    shirtColor: '#3b1f7a',
    skinColor: '#b197fc',
  },
  nightmare_boss: {
    id: 'nightmare_boss',
    name: 'Nightmare Smoke Goliath',
    hp: 880,
    speed: 0.28,
    dps: 42,
    armor: 0.40,
    smokeCaster: true,
    rewardStar: 40,
    rewardOre: 22,
    rewardShard: 12,
    scale: 1.52,
    shirtColor: '#5f3dc4',
    skinColor: '#9775fa',
  },
};

/**
 * Pillar 1: Dual-Resource Anti-Spam Dynamic Cost Scaling
 * Each duplicate of the same unit increases both Starlight & Ore cost by +18%.
 */
export function computeDynamicCost(unitId, existingCount = 0) {
  const def = UNIT_MAP[unitId];
  if (!def) return 25;
  return Math.round(def.baseCost * Math.pow(1.18, existingCount));
}

export function computeDynamicOreCost(unitId, existingCount = 0) {
  const def = UNIT_MAP[unitId];
  if (!def) return 10;
  return Math.round((def.oreCost || 8) * Math.pow(1.16, existingCount));
}

/**
 * Pillar 2: Critter Harmony & Tech Synergy State
 */
export function computeHarmonyState(placedUnits) {
  const roles = new Set();
  const ids = new Set();
  for (const u of placedUnits) {
    if (!u.def || u.isStructure) continue;
    roles.add(u.def.role);
    ids.add(u.def.id);
    if (u.mounted) {
      roles.add(u.mounted.def.role);
      ids.add(u.mounted.def.id);
    }
  }
  const hasAll3Roles = roles.size >= 3;
  let level = 0;
  if (hasAll3Roles && ids.size >= 7) level = 3;
  else if (hasAll3Roles && ids.size >= 5) level = 2;
  else if (roles.size >= 2 && ids.size >= 3) level = 1;

  const mults = [1.0, 1.15, 1.30, 1.48];
  const labels = [
    'Harmony Lv.0 (Combine Produce + Defend + Attack!)',
    'Harmony Lv.1 (+15% All Critter Power)',
    'Harmony Lv.2 (+30% Power & +1 Geode Shard Yield)',
    'Harmony Lv.3 MAX (+48% Power + Overclock Aura!)',
  ];
  return {
    level,
    rolesCount: roles.size,
    uniqueCritters: ids.size,
    powerMult: mults[level],
    label: labels[level],
  };
}

/**
 * Pillar 3: Moonless Night Fog & Lantern Illumination across the 22x14 Valley
 * Unlit tiles suffer -35% range AND -25% attack speed unless illuminated by Altar or Lanterns.
 */
export function isTileIlluminated(gx, gz, placedUnits, moonRestored = false) {
  if (moonRestored) return true;
  // Central Moon Altar at (ALTAR_GX, ALTAR_GZ) illuminates a 3.6-tile citadel radius
  if (Math.hypot(gx - ALTAR_GX, gz - ALTAR_GZ) <= 3.6) return true;
  for (const u of placedUnits) {
    if (u.asleep) continue;
    const r = u.def?.lightRadius || (u.mounted && u.mounted.def?.lightRadius) || 0;
    if (r > 0) {
      const bonus = (u.level - 1) * 0.35;
      if (Math.hypot(gx - u.gx, gz - u.gz) <= r + bonus + 0.15) return true;
    }
  }
  return false;
}

/**
 * Pillar 4: Real-Time Balance State, Multi-Portal Wave Scaling & Adaptive Flow Director
 */
export function computeBalanceState({
  placedUnits,
  units,
  zombies = [],
  starlight = 0,
  ore = 0,
  moonShards = 0,
  wave = 1,
  difficulty = 'tactical',
  baseHp = 600,
  baseMaxHp = 600,
}) {
  const unitList = placedUnits || units || [];
  const harmony = computeHarmonyState(unitList);
  let economyRate = 1.8;
  let oreRate = 0.8;
  let defensePower = 16;
  let antiAirPower = 0;
  let sleepingCount = 0;

  for (const u of unitList) {
    if (u.asleep) {
      sleepingCount++;
      continue;
    }
    if (u.isStructure) {
      defensePower += u.hp / 45;
      continue;
    }
    const lvMult = 1 + (u.level - 1) * 0.42;
    const condBoost = u.powered ? 1.30 : 1.0;
    if (u.def.role === 'produce') {
      economyRate += ((u.def.prodAmount || 8) / (u.def.prodInterval || 4)) * lvMult * harmony.powerMult * condBoost;
      oreRate += ((u.def.prodOre || 2) / (u.def.prodInterval || 4)) * lvMult * condBoost;
      defensePower += 5 * lvMult;
    } else if (u.def.role === 'defend') {
      defensePower += (u.hp / 32) * lvMult;
      if (u.mounted) {
        const mLv = 1 + (u.mounted.level - 1) * 0.42;
        const dps = (u.mounted.def.atk / u.mounted.def.fireInterval) * 1.38 * mLv * harmony.powerMult * condBoost;
        defensePower += dps;
        antiAirPower += dps;
      }
    } else if (u.def.role === 'attack') {
      const lit = u.def.nightVision || isTileIlluminated(u.gx, u.gz, unitList, moonShards >= 100);
      const lightFactor = lit ? 1.0 : 0.65;
      const dps = (u.def.atk / u.def.fireInterval) * lvMult * harmony.powerMult * lightFactor * condBoost;
      defensePower += dps;
      if (u.def.antiAir) antiAirPower += dps;
    }
  }

  const diffMult = difficulty === 'nightmare' ? 1.35 : difficulty === 'tactical' ? 1.12 : 0.75;
  let zombieThreat = (18 + wave * 9 + moonShards * 0.65) * diffMult;
  for (const z of zombies) {
    zombieThreat += (z.hp * 0.16 + z.def.dps * 1.15);
  }

  const effectiveCap = Math.max(22, defensePower + economyRate * 4.2 + oreRate * 3.5);
  const pressureIndex = Number((zombieThreat / effectiveCap).toFixed(2));

  let directorMode = '⚔️ Tactical Flow';
  let spawnIntervalMult = difficulty === 'nightmare' ? 0.78 : difficulty === 'tactical' ? 0.92 : 1.25;
  let carePackageGift = 0;
  let shardDropBonus = 0;

  if (difficulty === 'cozy' && (pressureIndex > 1.25 || baseHp < baseMaxHp * 0.5)) {
    directorMode = '🎁 Cozy Assist';
    spawnIntervalMult = 1.4;
    carePackageGift = 20;
  } else if (pressureIndex > 1.35) {
    directorMode = '🔥 Siege Alert!';
  } else if (pressureIndex < 0.78 && unitList.length >= 6) {
    directorMode = '👑 Dominant (+Shards)';
    spawnIntervalMult *= 0.88;
    shardDropBonus = 1;
  }

  // Determine active cardinal invasion portals based on wave & shards
  const activePortals = ['E'];
  if (wave >= 2 || moonShards >= 15) activePortals.push('W');
  if (wave >= 3 || moonShards >= 35) activePortals.push('N');
  if (wave >= 4 || moonShards >= 55) activePortals.push('S');

  return {
    harmony,
    economyRate: Number(economyRate.toFixed(1)),
    oreRate: Number(oreRate.toFixed(1)),
    defensePower: Math.round(defensePower),
    antiAirPower: Math.round(antiAirPower),
    sleepingCount,
    zombieThreat: Math.round(zombieThreat),
    pressureIndex,
    directorMode,
    spawnIntervalMult,
    carePackageGift,
    shardDropBonus,
    activePortals,
  };
}
