const THREE = window.THREE;
export {
  buildHighResMoon,
  buildHighResCutsceneRig,
  buildHighResCameoCritter,
  buildHighResCameoZombie
} from './cutscene_hd.js';

const boxGeoCache = new Map();
function getBox(w, h, d) {
  const key = `${w.toFixed(3)}_${h.toFixed(3)}_${d.toFixed(3)}`;
  if (!boxGeoCache.has(key)) boxGeoCache.set(key, new THREE.BoxGeometry(w, h, d));
  return boxGeoCache.get(key);
}

const matCache = new Map();
export function getMat(color, opts = {}) {
  const key = `${color}_${opts.emissive || 0}_${opts.emissiveIntensity || 0}_${opts.roughness || 0.55}_${opts.metalness || 0.08}_${opts.opacity || 1}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.55,
      metalness: opts.metalness ?? 0.08,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0,
      transparent: (opts.opacity ?? 1) < 1,
      opacity: opts.opacity ?? 1
    }));
  }
  return matCache.get(key);
}

export function vox(w, h, d, color, x = 0, y = 0, z = 0, opts = {}) {
  const m = new THREE.Mesh(getBox(w, h, d), getMat(color, opts));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ============================================================================
// 4-RESOURCE MINECRAFT VEIN NODES ('sun' | 'wood' | 'stone' | 'crystal')
// ============================================================================
export function buildResourceNodeMesh(kind) {
  const g = new THREE.Group();
  if (kind === 'sun' || kind === 'sun_vein') {
    // Golden Solar Crystal Cluster
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + 0.35;
      const h = 0.28 + (i % 2) * 0.12;
      const shard = vox(0.16, h, 0.16, 0xffd43b, Math.cos(ang) * 0.16, h * 0.5, Math.sin(ang) * 0.16, {
        emissive: 0xf59f00,
        emissiveIntensity: 0.55
      });
      shard.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.18;
      g.add(shard);
    }
    const core = vox(0.20, 0.42, 0.20, 0xfff3bf, 0, 0.21, 0, {
      emissive: 0xffec99,
      emissiveIntensity: 0.75
    });
    g.add(core);
  } else if (kind === 'wood' || kind === 'wood_grove') {
    // Minecraft Mini Oak Tree + Timber Log Pile
    const log1 = vox(0.50, 0.15, 0.16, 0x8b5a2b, 0, 0.08, -0.10);
    const log2 = vox(0.50, 0.15, 0.16, 0x8b5a2b, 0, 0.08, 0.10);
    const trunk = vox(0.18, 0.42, 0.18, 0x795548, 0, 0.21, 0);
    const crown1 = vox(0.52, 0.24, 0.52, 0x40c057, 0, 0.44, 0, { emissive: 0x2b8a3e, emissiveIntensity: 0.18 });
    const crown2 = vox(0.34, 0.18, 0.34, 0x69db7c, 0, 0.60, 0);
    g.add(log1, log2, trunk, crown1, crown2);
  } else if (kind === 'stone' || kind === 'stone_vein') {
    // Silver-Grey Quarry Boulder with Iron Ore flecks
    const b1 = vox(0.54, 0.24, 0.50, 0x868e96, 0, 0.12, 0, { metalness: 0.25, roughness: 0.45 });
    const b2 = vox(0.38, 0.24, 0.38, 0xadb5bd, -0.05, 0.30, 0.04, { metalness: 0.35, roughness: 0.35 });
    const ore1 = vox(0.14, 0.14, 0.14, 0x74c0fc, 0.16, 0.24, 0.15, { emissive: 0x339af0, emissiveIntensity: 0.35 });
    const ore2 = vox(0.12, 0.12, 0.12, 0xdee2e6, -0.16, 0.20, -0.15, { metalness: 0.5 });
    g.add(b1, b2, ore1, ore2);
  } else {
    // 'crystal' / 'crystal_vein' — Glowing Amethyst & Cyan Starlight Geode
    const base = vox(0.52, 0.14, 0.52, 0x5f3dc4, 0, 0.07, 0);
    g.add(base);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const dist = i === 0 ? 0 : 0.15;
      const h = i === 0 ? 0.48 : 0.32;
      const col = i % 2 === 0 ? 0xda77f2 : 0x66d9e8;
      const sp = vox(0.14, h, 0.14, col, Math.cos(ang) * dist, h * 0.5 + 0.08, Math.sin(ang) * dist, {
        emissive: col,
        emissiveIntensity: 0.68
      });
      if (i > 0) {
        sp.rotation.z = Math.cos(ang) * 0.24;
        sp.rotation.x = Math.sin(ang) * 0.24;
      }
      g.add(sp);
    }
  }
  return g;
}

// ============================================================================
// CRITTER MINECRAFT VOXEL BUILDABLE UNITS
// ============================================================================
export function buildCritterUnitMesh(def, portraitTex) {
  const g = new THREE.Group();
  const c = def.color;
  const acc = def.accent;

  // Base pedestal block
  const ped = vox(0.76, 0.14, 0.76, c, 0, 0.07, 0);
  const rim = vox(0.82, 0.05, 0.82, acc, 0, 0.14, 0, { emissive: acc, emissiveIntensity: 0.25 });
  g.add(ped, rim);

  // Voxel Critter Body & Head
  const torso = vox(0.42, 0.34, 0.30, c, 0, 0.31, 0);
  const belly = vox(0.28, 0.24, 0.04, 0xfffdf5, 0, 0.30, 0.15);
  const head = new THREE.Group();
  head.position.set(0, 0.64, 0);
  const headBox = vox(0.48, 0.42, 0.42, c, 0, 0, 0);
  head.add(headBox);

  // Portrait face plate on front & back so unit is recognizable from any camera angle
  if (portraitTex) {
    const faceMat = new THREE.MeshBasicMaterial({ map: portraitTex });
    const faceFront = new THREE.Mesh(getBox(0.40, 0.36, 0.02), faceMat);
    faceFront.position.set(0, 0, 0.215);
    const faceBack = new THREE.Mesh(getBox(0.40, 0.36, 0.02), faceMat);
    faceBack.position.set(0, 0, -0.215);
    head.add(faceFront, faceBack);
  }

  // Ears
  const earL = vox(0.14, 0.18, 0.12, c, -0.16, 0.27, 0);
  const earR = vox(0.14, 0.18, 0.12, c, 0.16, 0.27, 0);
  head.add(earL, earR);
  g.add(torso, belly, head);

  // Role-specific 3D Voxel Props
  const prop = new THREE.Group();
  if (def.id === 'sunnyfox') {
    // Glowing Lantern Staff + Solar Halo
    const pole = vox(0.06, 0.66, 0.06, 0x8b5a2b, 0.28, 0.42, 0.14);
    const lantern = vox(0.22, 0.26, 0.22, 0xffe066, 0.28, 0.72, 0.14, { emissive: 0xffb703, emissiveIntensity: 0.95 });
    prop.add(pole, lantern);
  } else if (def.id === 'poppydash') {
    // Spinning Windmill Sails + Wood Logs
    const mast = vox(0.10, 0.55, 0.10, 0x8d5524, -0.26, 0.42, 0);
    const rotor = new THREE.Group();
    rotor.position.set(-0.26, 0.68, 0.10);
    rotor.add(vox(0.56, 0.08, 0.04, 0xfff3bf, 0, 0, 0, { emissive: 0x74c0fc, emissiveIntensity: 0.3 }));
    rotor.add(vox(0.08, 0.56, 0.04, 0x74c0fc, 0, 0, 0, { emissive: 0x74c0fc, emissiveIntensity: 0.3 }));
    prop.add(mast, rotor);
    g.userData.rotor = rotor;
  } else if (def.id === 'picky') {
    // Stone Quarry Pickaxe + Healing Heart Totem
    const heart = vox(0.22, 0.22, 0.12, 0xff6b8b, -0.26, 0.66, 0.14, { emissive: 0xff4d6d, emissiveIntensity: 0.65 });
    const anvil = vox(0.24, 0.18, 0.20, 0xadb5bd, 0.26, 0.24, 0.16, { metalness: 0.5 });
    prop.add(heart, anvil);
  } else if (def.id === 'bubba') {
    // Cryo-Crystal Condenser Prism
    const prism = vox(0.24, 0.38, 0.24, 0x66d9e8, 0.28, 0.56, 0.14, { emissive: 0x22b8cf, emissiveIntensity: 0.8 });
    prop.add(prism);
  } else if (def.id === 'bobby') {
    // Heavy crenellated stone-and-ruby fortress wall
    const wall = vox(0.92, 0.52, 0.24, 0xe63946, 0, 0.32, 0.28);
    const trim = vox(0.96, 0.12, 0.28, 0xffccd5, 0, 0.58, 0.28);
    const shield = vox(0.32, 0.32, 0.08, 0xffd166, 0, 0.34, 0.41, { emissive: 0xffb703, emissiveIntensity: 0.45 });
    prop.add(wall, trim, shield);
  } else if (def.id === 'mikey') {
    // Tall Bastion Watchtower platform
    const tower = vox(0.84, 0.60, 0.84, 0x457b9d, 0, 0.30, 0);
    const deck = vox(0.92, 0.10, 0.92, 0xa8dadc, 0, 0.62, 0);
    head.position.y = 0.92;
    torso.position.y = 0.68;
    prop.add(tower, deck);
  } else if (def.id === 'lunabat') {
    // Twin Bat Wings + Starlight Crossbow
    const wingL = vox(0.28, 0.28, 0.06, 0x9d4edd, -0.32, 0.42, -0.08);
    const wingR = vox(0.28, 0.28, 0.06, 0x9d4edd, 0.32, 0.42, -0.08);
    const bow = vox(0.36, 0.08, 0.28, 0xffe066, 0, 0.46, 0.26, { emissive: 0xffe066, emissiveIntensity: 0.5 });
    prop.add(wingL, wingR, bow);
  } else if (def.id === 'dogday') {
    // Solar Mortar Cannon
    const barrel = vox(0.24, 0.24, 0.46, 0xff7b00, 0.26, 0.48, 0.20, { emissive: 0xff9e00, emissiveIntensity: 0.45 });
    barrel.rotation.x = -0.35;
    prop.add(barrel);
  } else if (def.id === 'craftycorn') {
    // Unicorn Horn + Rainbow Crystal Spire
    const horn = vox(0.10, 0.30, 0.10, 0xffd166, 0, 0.94, 0.14, { emissive: 0xffe066, emissiveIntensity: 0.85 });
    const crystal = vox(0.20, 0.44, 0.20, 0xf72585, -0.28, 0.56, 0.12, { emissive: 0x7209b7, emissiveIntensity: 0.7 });
    prop.add(horn, crystal);
  } else if (def.id === 'kickin') {
    // Dual Tesla Coils
    const coilL = vox(0.14, 0.46, 0.14, 0xffe600, -0.28, 0.52, 0.14, { emissive: 0xffe600, emissiveIntensity: 0.8 });
    const coilR = vox(0.14, 0.46, 0.14, 0xffe600, 0.28, 0.52, 0.14, { emissive: 0xffe600, emissiveIntensity: 0.8 });
    prop.add(coilL, coilR);
  }
  g.add(prop);
  g.userData.head = head;
  g.userData.prop = prop;
  return g;
}

// ============================================================================
// OVERHEAD 3D NON-TEXT HEART & SHIELD BADGES FOR ZOMBIES
// ============================================================================
function createOverheadStatusRow(def) {
  const row = new THREE.Group();
  const isBoss = def.id === 'nightmare_boss';
  const isHealer = def.id === 'necromancer' || def.id === 'healer_shaman';
  const isTank = def.id === 'bucket' || def.id === 'shield_knight';
  const heartCount = isBoss ? 5 : (isTank || isHealer ? 4 : (def.id === 'runner' ? 1 : (def.id === 'walker' ? 2 : 3)));

  const hearts = [];
  const spacing = 0.15;
  const startX = -((heartCount - 1) * spacing) * 0.5;

  for (let i = 0; i < heartCount; i++) {
    const h = vox(0.11, 0.11, 0.05, 0xff4d6d, startX + i * spacing, 0, 0, {
      emissive: 0xff2a55,
      emissiveIntensity: 0.55
    });
    row.add(h);
    hearts.push(h);
  }

  // Non-text 3D Ability Emblem above the hearts
  let abilityIcon = null;
  if (def.armor > 0) {
    abilityIcon = vox(0.16, 0.16, 0.06, 0x74c0fc, 0, 0.17, 0, {
      emissive: 0x339af0,
      emissiveIntensity: 0.65,
      metalness: 0.6
    });
    row.add(abilityIcon);
  } else if (def.explosiveDmg || def.explodes) {
    abilityIcon = vox(0.15, 0.15, 0.08, 0xff2a2a, 0, 0.17, 0, {
      emissive: 0xff5500,
      emissiveIntensity: 0.85
    });
    row.add(abilityIcon);
  } else if (def.healPerSec || def.healsZombies) {
    const vBar = vox(0.06, 0.18, 0.06, 0x51cf66, 0, 0.17, 0, { emissive: 0x37b24d, emissiveIntensity: 0.8 });
    const hBar = vox(0.18, 0.06, 0.06, 0x51cf66, 0, 0.17, 0, { emissive: 0x37b24d, emissiveIntensity: 0.8 });
    abilityIcon = new THREE.Group();
    abilityIcon.add(vBar, hBar);
    row.add(abilityIcon);
  } else if (isBoss) {
    abilityIcon = vox(0.22, 0.14, 0.08, 0xffd43b, 0, 0.19, 0, {
      emissive: 0xf59f00,
      emissiveIntensity: 0.9
    });
    row.add(abilityIcon);
  }

  return { row, hearts, abilityIcon };
}

// ============================================================================
// 8 VISUALLY & FUNCTIONALLY DISTINCT 3D VOXEL ZOMBIES
// ============================================================================
export function buildVoxelZombie(def) {
  const g = new THREE.Group();
  const s = def.scale || 1.0;
  g.scale.setScalar(s);

  const skinCol = def.skinColor || def.color || '#69db7c';
  const shirtCol = def.shirtColor || def.shirt || '#22b8cf';

  const legL = vox(0.14, 0.28, 0.14, 0x3b4252, -0.09, 0.14, 0);
  const legR = vox(0.14, 0.28, 0.14, 0x3b4252, 0.09, 0.14, 0);
  const torso = vox(0.34, 0.34, 0.20, shirtCol, 0, 0.44, 0);
  const head = vox(0.34, 0.34, 0.34, skinCol, 0, 0.78, 0);

  // Glowing zombie eyes facing toward the Critter base (-X)
  const eyeColor = def.id === 'nightmare_boss' ? 0xffbe0b : (def.id === 'necromancer' ? 0xda77f2 : 0xff2a55);
  const eyeL = vox(0.05, 0.06, 0.07, eyeColor, -0.18, 0.80, -0.08, { emissive: eyeColor, emissiveIntensity: 0.95 });
  const eyeR = vox(0.05, 0.06, 0.07, eyeColor, -0.18, 0.80, 0.08, { emissive: eyeColor, emissiveIntensity: 0.95 });

  // Outstretched zombie arms
  const armL = vox(0.28, 0.11, 0.11, skinCol, -0.20, 0.52, -0.22);
  const armR = vox(0.28, 0.11, 0.11, skinCol, -0.20, 0.52, 0.22);
  g.add(legL, legR, torso, head, eyeL, eyeR, armL, armR);

  let shieldMesh = null;
  let pickaxeGroup = null;
  let tntBelt = null;
  let balloonRig = null;
  let shamanRing = null;
  let bossOrbs = null;

  // 1. RUNNER: Forward speed lean + neon magenta headband + sprint shoes
  if (def.id === 'runner') {
    torso.rotation.z = 0.26;
    head.position.x = -0.08;
    const band = vox(0.37, 0.08, 0.37, 0xff2a85, -0.08, 0.88, 0, { emissive: 0xff2a85, emissiveIntensity: 0.7 });
    const tail1 = vox(0.22, 0.06, 0.06, 0xff2a85, 0.18, 0.88, -0.08, { emissive: 0xff2a85, emissiveIntensity: 0.5 });
    const shoeL = vox(0.18, 0.08, 0.16, 0xffe600, -0.09, 0.04, 0);
    const shoeR = vox(0.18, 0.08, 0.16, 0xffe600, 0.09, 0.04, 0);
    g.add(band, tail1, shoeL, shoeR);
  }

  // 2. BUCKET / SHIELD KNIGHT: Heavy Iron Greathelm + Front 3D Tower Shield
  if (def.id === 'bucket' || def.id === 'shield_knight') {
    const helm = vox(0.39, 0.30, 0.39, 0xced4da, 0, 0.94, 0, { metalness: 0.75, roughness: 0.25 });
    const visor = vox(0.06, 0.06, 0.28, 0x212529, -0.20, 0.88, 0);
    const plume = vox(0.14, 0.18, 0.10, 0x339af0, 0.04, 1.14, 0, { emissive: 0x1c7ed6, emissiveIntensity: 0.4 });
    shieldMesh = new THREE.Group();
    shieldMesh.position.set(-0.34, 0.48, 0);
    const plate = vox(0.08, 0.62, 0.48, 0xadb5bd, 0, 0, 0, { metalness: 0.8, roughness: 0.2 });
    const trim = vox(0.10, 0.66, 0.52, 0x4dabf7, 0.01, 0, 0, { emissive: 0x228be6, emissiveIntensity: 0.35 });
    const boss = vox(0.12, 0.18, 0.18, 0xffd43b, -0.03, 0, 0, { emissive: 0xf59f00, emissiveIntensity: 0.5 });
    shieldMesh.add(trim, plate, boss);
    g.add(helm, visor, plume, shieldMesh);
  }

  // 3. DIGGER: Yellow Miner Hardhat + Glowing Headlamp + Swinging 3D Pickaxe
  if (def.id === 'digger') {
    const hatBrim = vox(0.42, 0.06, 0.42, 0xffd43b, 0, 0.93, 0);
    const hatDome = vox(0.36, 0.16, 0.36, 0xfcc419, 0, 1.02, 0);
    const lamp = vox(0.08, 0.10, 0.12, 0xfff9db, -0.20, 0.99, 0, { emissive: 0xffe066, emissiveIntensity: 1.0 });
    pickaxeGroup = new THREE.Group();
    pickaxeGroup.position.set(-0.30, 0.54, -0.24);
    const handle = vox(0.06, 0.42, 0.06, 0x8d5524, 0, 0.14, 0);
    const headBlade = vox(0.32, 0.08, 0.08, 0xdee2e6, 0, 0.34, 0, { metalness: 0.75 });
    pickaxeGroup.add(handle, headBlade);
    g.add(hatBrim, hatDome, lamp, pickaxeGroup);
  }

  // 4. CREEPER: Authentic 4-Legged Bright-Green Minecraft Creeper + Flashing Red-White TNT Belt
  if (def.id === 'creeper') {
    legL.visible = false;
    legR.visible = false;
    armL.visible = false;
    armR.visible = false;
    torso.scale.set(0.82, 1.25, 0.95);
    const cLeg1 = vox(0.15, 0.22, 0.15, 0x40c057, -0.14, 0.11, -0.12);
    const cLeg2 = vox(0.15, 0.22, 0.15, 0x40c057, 0.14, 0.11, -0.12);
    const cLeg3 = vox(0.15, 0.22, 0.15, 0x40c057, -0.14, 0.11, 0.12);
    const cLeg4 = vox(0.15, 0.22, 0.15, 0x40c057, 0.14, 0.11, 0.12);
    tntBelt = new THREE.Group();
    tntBelt.position.set(0, 0.44, 0);
    const tntRed = vox(0.42, 0.22, 0.40, 0xff2a2a, 0, 0, 0, { emissive: 0xff0000, emissiveIntensity: 0.65 });
    const tntBand = vox(0.44, 0.08, 0.42, 0xffffff, 0, 0, 0, { emissive: 0xffffff, emissiveIntensity: 0.4 });
    const fuse = vox(0.06, 0.18, 0.06, 0xffe066, 0, 0.60, 0, { emissive: 0xffaa00, emissiveIntensity: 1.0 });
    tntBelt.add(tntRed, tntBand, fuse);
    g.add(cLeg1, cLeg2, cLeg3, cLeg4, tntBelt);
  }

  // 5. BALLOON: Suspended beneath a Giant Striped Red-and-Gold Hot-Air Balloon
  if (def.id === 'balloon') {
    balloonRig = new THREE.Group();
    const ropeL = vox(0.03, 0.56, 0.03, 0xfff3bf, 0, 1.15, -0.12);
    const ropeR = vox(0.03, 0.56, 0.03, 0xfff3bf, 0, 1.15, 0.12);
    const envMain = vox(0.68, 0.68, 0.68, 0xff4d6d, 0, 1.66, 0, { emissive: 0xc9184a, emissiveIntensity: 0.35 });
    const envStripe = vox(0.72, 0.22, 0.72, 0xffd43b, 0, 1.66, 0, { emissive: 0xf59f00, emissiveIntensity: 0.45 });
    const envTop = vox(0.46, 0.16, 0.46, 0xff758f, 0, 2.04, 0);
    balloonRig.add(ropeL, ropeR, envMain, envStripe, envTop);
    g.add(balloonRig);
  }

  // 6. NECROMANCER / HEALER SHAMAN: Horned Mystic Crown + Healing Staff + Orbiting Crystal Ring
  if (def.id === 'necromancer' || def.id === 'healer_shaman') {
    const robe = vox(0.40, 0.50, 0.28, 0x5f3dc4, 0, 0.32, 0, { emissive: 0x3b28cc, emissiveIntensity: 0.28 });
    const crown = vox(0.38, 0.14, 0.38, 0xffd43b, 0, 0.99, 0, { emissive: 0xf59f00, emissiveIntensity: 0.5 });
    const hornL = vox(0.08, 0.22, 0.08, 0xda77f2, 0, 1.12, -0.14, { emissive: 0xae3ec9, emissiveIntensity: 0.7 });
    const hornR = vox(0.08, 0.22, 0.08, 0xda77f2, 0, 1.12, 0.14, { emissive: 0xae3ec9, emissiveIntensity: 0.7 });
    const staff = vox(0.06, 0.88, 0.06, 0x8d5524, -0.28, 0.50, -0.24);
    const orb = vox(0.18, 0.18, 0.18, 0x51cf66, -0.28, 0.96, -0.24, { emissive: 0x40c057, emissiveIntensity: 0.95 });

    shamanRing = new THREE.Group();
    shamanRing.position.set(0, 0.55, 0);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      shamanRing.add(vox(0.10, 0.14, 0.10, 0x69db7c, Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42, {
        emissive: 0x37b24d,
        emissiveIntensity: 0.85
      }));
    }
    g.add(robe, crown, hornL, hornR, staff, orb, shamanRing);
  }

  // 7. NIGHTMARE BOSS: Giant Horned Goliath + Glowing Core + Cape + Orbiting Red-Smoke Orbs
  if (def.id === 'nightmare_boss') {
    const hornL = vox(0.12, 0.34, 0.12, 0xae3ec9, -0.04, 1.08, -0.16, { emissive: 0x7950f2, emissiveIntensity: 0.65 });
    const hornR = vox(0.12, 0.34, 0.12, 0xae3ec9, -0.04, 1.08, 0.16, { emissive: 0x7950f2, emissiveIntensity: 0.65 });
    const core = vox(0.14, 0.20, 0.20, 0xff2a55, -0.18, 0.46, 0, { emissive: 0xff0044, emissiveIntensity: 1.0 });
    const cape = vox(0.08, 0.62, 0.44, 0x3b096c, 0.18, 0.44, 0, { emissive: 0x240046, emissiveIntensity: 0.5 });

    bossOrbs = new THREE.Group();
    bossOrbs.position.set(0, 0.68, 0);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      bossOrbs.add(vox(0.14, 0.14, 0.14, 0xff4d6d, Math.cos(a) * 0.48, Math.sin(a * 2) * 0.08, Math.sin(a) * 0.48, {
        emissive: 0xff0055,
        emissiveIntensity: 0.95
      }));
    }
    g.add(hornL, hornR, core, cape, bossOrbs);
  }

  // Overhead 3D Heart & Ability Status Bar
  const status = createOverheadStatusRow(def);
  status.row.position.set(0, def.id === 'balloon' ? 2.30 : 1.26, 0);
  g.add(status.row);

  g.userData = {
    legL,
    legR,
    armL,
    armR,
    head,
    torso,
    shieldMesh,
    pickaxeGroup,
    tntBelt,
    balloonRig,
    shamanRing,
    bossOrbs,
    statusRow: status.row,
    updateHearts(hp, maxHp, armor = 0) {
      const ratio = Math.max(0, hp / Math.max(1, maxHp));
      const activeCount = Math.ceil(ratio * status.hearts.length);
      for (let i = 0; i < status.hearts.length; i++) {
        status.hearts[i].visible = i < activeCount;
      }
      if (shieldMesh) {
        shieldMesh.visible = armor > 0;
      }
      if (status.abilityIcon && def.armor > 0) {
        status.abilityIcon.visible = armor > 0;
      }
    }
  };
  return g;
}
