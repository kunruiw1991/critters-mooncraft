// CritterCraft: Moonless Night — Unit Catalog & 5-Pillar Balance State Engine.
// Roles: 'produce' (economy + light/buffs), 'defend' (walls, moats, high-ground watchtowers), 'attack' (ranged/AoE/pierce/beam).

export const UNITS = [
  // ==================== PRODUCE (Economy, Light & Support) ====================
  {
    id: 'sunnyfox',
    name: 'SunnyFox',
    title: 'Lantern Sun-Forge',
    role: 'produce',
    icon: 'icons/sunnyfox.jpg',
    color: '#f59f00',
    accent: '#fff3bf',
    baseCost: 25,
    hp: 180,
    prodAmount: 9,
    prodInterval: 4.0,
    lightRadius: 3.4,
    blurb: 'Produces +9 🌟/4s & lights a 3.4-tile Lantern Aura (removes Night Fog & slows zombies).',
  },
  {
    id: 'poppydash',
    name: 'PoppyDash',
    title: 'Popcorn Windmill',
    role: 'produce',
    icon: 'icons/poppydash.jpg',
    color: '#495057',
    accent: '#ffd43b',
    baseCost: 35,
    hp: 200,
    prodAmount: 11,
    prodInterval: 4.2,
    hasteRadius: 2.5,
    hasteMult: 1.35,
    blurb: 'Produces +11 🌟/4.2s & feeds buttered popcorn to nearby critters (+35% speed).',
  },
  {
    id: 'picky',
    name: 'PickyPiggy',
    title: 'Berry Heal Orchard',
    role: 'produce',
    icon: 'icons/picky.jpg',
    color: '#f783ac',
    accent: '#ffdeeb',
    baseCost: 30,
    hp: 220,
    prodAmount: 7,
    prodInterval: 4.0,
    healRadius: 2.4,
    healPerSec: 14,
    blurb: 'Produces +7 🌟/4s & heals nearby friendly critters and walls (+14 HP/s).',
  },

  // ==================== DEFEND (Voxel Walls, Moats & Watchtowers) ====================
  {
    id: 'bobby',
    name: 'Bobby BearHug',
    title: 'Obsidian Hug-Wall',
    role: 'defend',
    icon: 'icons/bobby.jpg',
    color: '#e03131',
    accent: '#ffc9c9',
    baseCost: 20,
    hp: 680,
    tauntRadius: 2.4,
    thornsDmg: 10,
    blurb: '680 HP voxel fortress block. Attracts zombies & reflects 10 cuddle-damage.',
  },
  {
    id: 'bubba',
    name: 'Bubba',
    title: 'Bubble Moat Dome',
    role: 'defend',
    icon: 'icons/bubba.jpg',
    color: '#339af0',
    accent: '#d0ebff',
    baseCost: 30,
    hp: 360,
    slowRadius: 2.8,
    slowFactor: 0.48,
    shieldAura: 0.25,
    blurb: 'Chills zombies in a 2.8-tile water moat (-52% speed) & cuts damage to allies by 25%.',
  },
  {
    id: 'mikey',
    name: 'Mikey & JJ',
    title: 'Watchtower + TNT',
    role: 'defend',
    icon: 'icons/mikey.jpg',
    color: '#37b24d',
    accent: '#b2f2bb',
    baseCost: 25,
    hp: 340,
    stackable: true,
    towerRangeBonus: 1.4,
    towerDmgBonus: 1.25,
    deathBlastDmg: 95,
    blurb: 'Voxel Watchtower: place ANY Attack Critter ON TOP for +40% range & +25% damage!',
  },

  // ==================== ATTACK (Pierce, Splash, Beam & Chain) ====================
  {
    id: 'lunabat',
    name: 'LunaBat',
    title: 'Moon-Star Crossbow',
    role: 'attack',
    icon: 'icons/lunabat.jpg',
    color: '#7950f2',
    accent: '#e5dbff',
    baseCost: 40,
    hp: 210,
    atk: 30,
    fireInterval: 1.05,
    range: 4.6,
    pierce: 2,
    lightRadius: 1.8,
    shardBonus: 1,
    blurb: 'Fires piercing Crescent Moon-Stars (hits 2 zombies) & harvests bonus Moon Shards.',
  },
  {
    id: 'dogday',
    name: 'DogDay',
    title: 'Solar Splash Cannon',
    role: 'attack',
    icon: 'icons/dogday.jpg',
    color: '#fd7e14',
    accent: '#ffe8cc',
    baseCost: 55,
    hp: 250,
    atk: 44,
    fireInterval: 1.45,
    range: 4.2,
    splashRadius: 1.65,
    lightRadius: 2.2,
    blurb: 'Launches AoE Sunburst orbs that splash zombie swarms & burn away Nightmare fog.',
  },
  {
    id: 'craftycorn',
    name: 'CraftyCorn',
    title: 'Rainbow Prism Beam',
    role: 'attack',
    icon: 'icons/craftycorn.jpg',
    color: '#22b8cf',
    accent: '#c5f6fa',
    baseCost: 50,
    hp: 195,
    atk: 36,
    fireInterval: 0.95,
    range: 5.8,
    vulnBonus: 0.30,
    blurb: 'Long-range sniper beam. Paints zombies so they take +30% damage from all critters.',
  },
  {
    id: 'kickin',
    name: 'Kickin & Hoppy',
    title: 'Thunder Bolt Striker',
    role: 'attack',
    icon: 'icons/kickin.jpg',
    color: '#fab005',
    accent: '#fff9db',
    baseCost: 45,
    hp: 230,
    atk: 25,
    fireInterval: 1.1,
    range: 3.8,
    chainTargets: 3,
    knockback: 0.55,
    blurb: 'Zaps up to 3 zombies with chain lightning & knocks front-line zombies backward!',
  },
];

export const UNIT_MAP = Object.fromEntries(UNITS.map((u) => [u.id, u]));

export const ZOMBIE_TYPES = {
  walker: {
    id: 'walker',
    name: 'Blockhead Zombie',
    hp: 95,
    speed: 0.42,
    dps: 14,
    rewardStar: 8,
    rewardShard: 3,
    scale: 1.0,
    shirtColor: '#22b8cf',
    skinColor: '#69db7c',
  },
  runner: {
    id: 'runner',
    name: 'Baby Hopper Zombie',
    hp: 62,
    speed: 0.68,
    dps: 11,
    rewardStar: 9,
    rewardShard: 3,
    scale: 0.76,
    shirtColor: '#f783ac',
    skinColor: '#8ce99a',
  },
  bucket: {
    id: 'bucket',
    name: 'Iron-Bucket Zombie',
    hp: 210,
    speed: 0.32,
    dps: 18,
    armor: 0.35,
    rewardStar: 14,
    rewardShard: 5,
    scale: 1.12,
    shirtColor: '#868e96',
    skinColor: '#51cf66',
  },
  digger: {
    id: 'digger',
    name: 'Pickaxe Miner Zombie',
    hp: 135,
    speed: 0.46,
    dps: 24, // extra damage vs walls
    rewardStar: 12,
    rewardShard: 4,
    scale: 1.02,
    shirtColor: '#f59f00',
    skinColor: '#69db7c',
  },
  nightmare_boss: {
    id: 'nightmare_boss',
    name: 'Nightmare Smoke Goliath',
    hp: 460,
    speed: 0.26,
    dps: 28,
    armor: 0.25,
    rewardStar: 30,
    rewardShard: 12,
    scale: 1.45,
    shirtColor: '#5f3dc4',
    skinColor: '#9775fa',
  },
};

/**
 * Pillar 1: Anti-Spam Diminishing Returns Cost
 * Each duplicate of the same unit increases its cost by +15%, encouraging diverse critter villages.
 */
export function computeDynamicCost(unitId, existingCount = 0) {
  const def = UNIT_MAP[unitId];
  if (!def) return 25;
  return Math.round(def.baseCost * Math.pow(1.15, existingCount));
}

/**
 * Pillar 2: Critter Harmony Synergy State
 * Rewards combining Produce + Defend + Attack roles and diverse critters.
 */
export function computeHarmonyState(placedUnits) {
  const roles = new Set();
  const ids = new Set();
  for (const u of placedUnits) {
    roles.add(u.def.role);
    ids.add(u.def.id);
    if (u.mounted) {
      roles.add(u.mounted.def.role);
      ids.add(u.mounted.def.id);
    }
  }
  const hasAll3Roles = roles.size >= 3;
  let level = 0;
  if (hasAll3Roles && ids.size >= 6) level = 3;
  else if (hasAll3Roles && ids.size >= 4) level = 2;
  else if (roles.size >= 2 && ids.size >= 3) level = 1;

  const mults = [1.0, 1.15, 1.30, 1.45];
  const labels = [
    'Harmony Lv.0 (Build Produce + Defend + Attack!)',
    'Harmony Lv.1 (+15% Critter Power)',
    'Harmony Lv.2 (+30% Critter Power)',
    'Harmony Lv.3 MAX (+45% Power + Star Aura!)',
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
 * Pillar 3: Moonless Darkness & Lantern Illumination
 * In Moonless Night, tiles outside Lantern / Altar light suffer -30% range ("Night Fog").
 */
export function isTileIlluminated(gx, gz, placedUnits, moonRestored = false) {
  if (moonRestored) return true;
  // Base Moon Altar at (1, 4) illuminates a 3.2-tile radius
  if (Math.hypot(gx - 1.2, gz - 4.0) <= 3.2) return true;
  for (const u of placedUnits) {
    const r = u.def.lightRadius || (u.mounted && u.mounted.def.lightRadius) || 0;
    if (r > 0 && Math.hypot(gx - u.gx, gz - u.gz) <= r + 0.15) return true;
  }
  return false;
}

/**
 * Pillar 4: Real-Time Mathematical Balance State & Adaptive Flow Director
 * Keeps Pressure Index P = ZombieThreat / (DefensePower + 0.8 * EconomyRate) in [0.75, 1.15].
 */
export function computeBalanceState({ placedUnits, zombies, starlight, moonShards, baseHp, baseMaxHp }) {
  const harmony = computeHarmonyState(placedUnits);
  let economyRate = 2.5; // baseline passive starlight/sec
  let defensePower = 18; // baseline altar guard power

  for (const u of placedUnits) {
    const lvMult = 1 + (u.level - 1) * 0.4;
    if (u.def.role === 'produce') {
      economyRate += ((u.def.prodAmount || 8) / (u.def.prodInterval || 4)) * lvMult * harmony.powerMult;
      defensePower += 6 * lvMult;
    } else if (u.def.role === 'defend') {
      defensePower += (u.hp / 28) * lvMult;
      if (u.mounted) {
        const mLv = 1 + (u.mounted.level - 1) * 0.4;
        defensePower += (u.mounted.def.atk / u.mounted.def.fireInterval) * 1.35 * mLv * harmony.powerMult;
      }
    } else if (u.def.role === 'attack') {
      const lit = isTileIlluminated(u.gx, u.gz, placedUnits, moonShards >= 100);
      const lightFactor = lit ? 1.0 : 0.72;
      defensePower += (u.def.atk / u.def.fireInterval) * lvMult * harmony.powerMult * lightFactor;
    }
  }

  let zombieThreat = 12 + moonShards * 0.55;
  for (const z of zombies) {
    zombieThreat += (z.hp * 0.18 + z.def.dps * 1.1);
  }

  const effectiveCap = Math.max(20, defensePower + economyRate * 5.5);
  const pressureIndex = Number((zombieThreat / effectiveCap).toFixed(2));

  // Adaptive Director output
  let directorMode = 'Flow Sweet-Spot';
  let spawnIntervalMult = 1.0;
  let carePackageGift = 0;
  let shardDropBonus = 0;

  if (pressureIndex > 1.22 || baseHp < baseMaxHp * 0.55) {
    directorMode = ' Care-Package Assist';
    spawnIntervalMult = 1.35; // slow down spawns gently
    carePackageGift = 18;
  } else if (pressureIndex < 0.72 && placedUnits.length >= 5) {
    directorMode = '🔥 Heroic Bonus Shards';
    spawnIntervalMult = 0.86;
    shardDropBonus = 1;
  }

  return {
    harmony,
    economyRate: Number(economyRate.toFixed(1)),
    defensePower: Math.round(defensePower),
    zombieThreat: Math.round(zombieThreat),
    pressureIndex,
    directorMode,
    spawnIntervalMult,
    carePackageGift,
    shardDropBonus,
  };
}
