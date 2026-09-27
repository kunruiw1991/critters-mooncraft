// CritterCraft: Moonless Night — 3D Minecraft Voxel Models & Cutscene Rigs.
const THREE = window.THREE;
const TAU = Math.PI * 2;

const matCache = new Map();
export function vMat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.08,
    emissive: opts.emissive || '#000000',
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1,
  });
  matCache.set(key, m);
  return m;
}

export function box(w, h, d, color, x = 0, y = 0, z = 0, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), vMat(color, opts));
  m.position.set(x, y, z);
  m.castShadow = !opts.transparent;
  m.receiveShadow = true;
  return m;
}

/** Procedural pixelated voxel block texture */
export function makeBlockTexture(baseHex, accentHex, speckled = false) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  g.fillStyle = baseHex;
  g.fillRect(0, 0, 32, 32);
  for (let y = 0; y < 32; y += 4) {
    for (let x = 0; x < 32; x += 4) {
      if (((x + y) % 8 === 0) || (speckled && ((x * 7 + y * 13) % 5 === 0))) {
        g.fillStyle = accentHex;
        g.fillRect(x, y, 4, 4);
      }
    }
  }
  g.strokeStyle = 'rgba(0,0,0,0.16)';
  g.lineWidth = 2;
  g.strokeRect(1, 1, 30, 30);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** 3D Voxel Full Moon + Shatter Shards for the 10-second Opening & Finale */
export function buildVoxelMoon() {
  const g = new THREE.Group();
  const core = box(2.3, 2.3, 2.3, '#fff3bf', 0, 0, 0, {
    emissive: '#ffd43b',
    emissiveIntensity: 0.75,
    roughness: 0.3,
  });
  g.add(core);
  // Voxel craters
  g.add(box(0.55, 0.55, 0.12, '#fcc419', -0.45, 0.35, 1.16, { emissive: '#f59f00', emissiveIntensity: 0.4 }));
  g.add(box(0.42, 0.42, 0.12, '#fcc419', 0.5, -0.4, 1.16, { emissive: '#f59f00', emissiveIntensity: 0.4 }));
  g.add(box(0.32, 0.32, 0.12, '#fcc419', 0.2, 0.55, 1.16, { emissive: '#f59f00', emissiveIntensity: 0.4 }));
  // Outer glow shell
  const halo = box(2.85, 2.85, 2.85, '#fff9db', 0, 0, 0, {
    emissive: '#ffe066',
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.25,
  });
  g.add(halo);
  return g;
}

/**
 * Builds the 10s Opening Cutscene Rig:
 * - cuteCatNap (purple voxel plush cat with golden crescent pendant)
 * - nightmareCatNap (tall dark-violet skeletal-voxel Nightmare CatNap with glowing white crescent eyes & purple smoke)
 * - rocket (Red-Smoke Voxel Rocket on launchpad)
 */
export function buildCatNapCutsceneRig() {
  const root = new THREE.Group();

  // --- Cute CatNap ---
  const cute = new THREE.Group();
  cute.add(box(0.62, 0.62, 0.46, '#7950f2', 0, 0.48, 0)); // torso
  cute.add(box(0.42, 0.44, 0.06, '#d0bfff', 0, 0.46, 0.22)); // belly
  cute.add(box(0.18, 0.18, 0.08, '#ffd43b', 0, 0.52, 0.26, { emissive: '#ffd43b', emissiveIntensity: 0.6 })); // moon pendant
  const cHead = new THREE.Group();
  cHead.position.set(0, 1.04, 0);
  cHead.add(box(0.76, 0.64, 0.62, '#845ef7', 0, 0, 0));
  cHead.add(box(0.22, 0.26, 0.18, '#7950f2', -0.24, 0.42, 0)); // left ear
  cHead.add(box(0.22, 0.26, 0.18, '#7950f2', 0.24, 0.42, 0)); // right ear
  cHead.add(box(0.46, 0.2, 0.08, '#1a1426', 0, -0.1, 0.3)); // cute grin
  cHead.add(box(0.14, 0.14, 0.08, '#1a1426', -0.16, 0.08, 0.3));
  cHead.add(box(0.14, 0.14, 0.08, '#1a1426', 0.16, 0.08, 0.3));
  cHead.add(box(0.05, 0.05, 0.09, '#ffffff', -0.14, 0.11, 0.31));
  cHead.add(box(0.05, 0.05, 0.09, '#ffffff', 0.18, 0.11, 0.31));
  cute.add(cHead);
  cute.add(box(0.22, 0.36, 0.22, '#6741d9', -0.18, 0.18, 0));
  cute.add(box(0.22, 0.36, 0.22, '#6741d9', 0.18, 0.18, 0));
  root.add(cute);

  // --- Nightmare CatNap (taller, eerie-cool voxel silhouette, child-safe cartoon boss look) ---
  const night = new THREE.Group();
  night.visible = false;
  night.add(box(0.82, 1.15, 0.52, '#3b1f7a', 0, 0.95, 0, { emissive: '#5f3dc4', emissiveIntensity: 0.35 }));
  // Rib/spine voxel stripes
  for (let i = 0; i < 3; i++) {
    night.add(box(0.66, 0.08, 0.56, '#9775fa', 0, 0.68 + i * 0.22, 0, { emissive: '#7950f2', emissiveIntensity: 0.4 }));
  }
  const nHead = new THREE.Group();
  nHead.position.set(0, 1.85, 0.08);
  nHead.add(box(0.95, 0.78, 0.74, '#2b145c', 0, 0, 0));
  nHead.add(box(0.26, 0.44, 0.2, '#3b1f7a', -0.32, 0.55, 0));
  nHead.add(box(0.26, 0.44, 0.2, '#3b1f7a', 0.32, 0.55, 0));
  // Glowing white crescent eyes & wide cavern grin
  nHead.add(box(0.2, 0.18, 0.08, '#ffffff', -0.22, 0.1, 0.36, { emissive: '#ffffff', emissiveIntensity: 0.95 }));
  nHead.add(box(0.2, 0.18, 0.08, '#ffffff', 0.22, 0.1, 0.36, { emissive: '#ffffff', emissiveIntensity: 0.95 }));
  nHead.add(box(0.68, 0.28, 0.08, '#0b0714', 0, -0.16, 0.36));
  night.add(nHead);
  // Long voxel claws & legs
  night.add(box(0.22, 0.85, 0.22, '#2b145c', -0.56, 0.95, 0.18));
  night.add(box(0.22, 0.85, 0.22, '#2b145c', 0.56, 0.95, 0.18));
  night.add(box(0.26, 0.55, 0.26, '#2b145c', -0.24, 0.28, 0));
  night.add(box(0.26, 0.55, 0.26, '#2b145c', 0.24, 0.28, 0));
  // Swirling purple dream-smoke cubes
  const smokeGroup = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const sc = box(0.24, 0.24, 0.24, '#b197fc', Math.cos((i / 8) * TAU) * 0.8, 0.4 + (i % 3) * 0.45, Math.sin((i / 8) * TAU) * 0.8, {
      emissive: '#9775fa',
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.72,
    });
    smokeGroup.add(sc);
  }
  night.add(smokeGroup);
  root.add(night);

  // --- Voxel Rocket & Launchpad ---
  const pad = box(1.2, 0.16, 1.2, '#495057', 1.35, 0.08, 0);
  root.add(pad);
  const rocket = new THREE.Group();
  rocket.position.set(1.35, 0.16, 0);
  rocket.add(box(0.48, 0.95, 0.48, '#f03e3e', 0, 0.55, 0, { emissive: '#c92a2a', emissiveIntensity: 0.25 }));
  rocket.add(box(0.52, 0.22, 0.52, '#ffffff', 0, 0.55, 0));
  rocket.add(box(0.34, 0.34, 0.34, '#ffd43b', 0, 1.18, 0, { emissive: '#fcc419', emissiveIntensity: 0.5 }));
  // 4 voxel fins
  rocket.add(box(0.14, 0.32, 0.22, '#c92a2a', -0.3, 0.22, 0));
  rocket.add(box(0.14, 0.32, 0.22, '#c92a2a', 0.3, 0.22, 0));
  rocket.add(box(0.22, 0.32, 0.14, '#c92a2a', 0, 0.22, -0.3));
  rocket.add(box(0.22, 0.32, 0.14, '#c92a2a', 0, 0.22, 0.3));
  // Rocket flame core
  const flame = box(0.36, 0.42, 0.36, '#ffd43b', 0, -0.1, 0, {
    emissive: '#ff922b',
    emissiveIntensity: 0.95,
  });
  flame.visible = false;
  rocket.add(flame);
  root.add(rocket);

  root.userData = { cute, night, smokeGroup, rocket, flame };
  return root;
}

/** Builds the Base Moon Altar (left side of the battlefield) */
export function buildMoonAltar() {
  const g = new THREE.Group();
  g.add(box(1.8, 0.3, 1.8, '#495057', 0, 0.15, 0));
  g.add(box(1.35, 0.35, 1.35, '#868e96', 0, 0.47, 0));
  // Four glowing corner pillars
  for (const [dx, dz] of [[-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]]) {
    g.add(box(0.24, 1.15, 0.24, '#adb5bd', dx, 0.72, dz));
    g.add(box(0.28, 0.24, 0.28, '#ffd43b', dx, 1.38, dz, { emissive: '#fcc419', emissiveIntensity: 0.7 }));
  }
  // Floating central Moon Crystal Heart
  const crystal = box(0.58, 0.58, 0.58, '#7950f2', 0, 1.35, 0, {
    emissive: '#ffd43b',
    emissiveIntensity: 0.75,
  });
  crystal.rotation.set(Math.PI / 4, Math.PI / 4, 0);
  g.add(crystal);
  g.userData.crystal = crystal;
  return g;
}

/** Builds a 3D Minecraft Voxel Smiling Critter Unit + its functional structure */
export function buildCritterUnitMesh(def) {
  const g = new THREE.Group();
  const c = def.color;
  const ac = def.accent;

  // Voxel Pedestal / Block Foundation
  if (def.id === 'mikey') {
    // Tall Cobblestone Watchtower + mini TNT block
    g.add(box(0.88, 0.82, 0.88, '#868e96', 0, 0.41, 0));
    g.add(box(0.94, 0.16, 0.94, '#495057', 0, 0.86, 0));
    // Red TNT band at base
    g.add(box(0.42, 0.32, 0.42, '#f03e3e', 0.22, 0.22, 0.26));
    g.add(box(0.44, 0.1, 0.44, '#ffffff', 0.22, 0.22, 0.26));
  } else if (def.id === 'bobby') {
    // Heavy Obsidian Hug-Wall
    g.add(box(0.92, 0.72, 0.92, '#3b2854', 0, 0.36, 0));
    g.add(box(0.45, 0.38, 0.1, '#ff6b6b', 0, 0.42, 0.46, { emissive: '#fa5252', emissiveIntensity: 0.45 }));
  } else if (def.id === 'bubba') {
    // Water Moat + translucent Bubble Dome
    g.add(box(0.94, 0.2, 0.94, '#1c7ed6', 0, 0.1, 0, { emissive: '#339af0', emissiveIntensity: 0.35 }));
    const dome = box(0.96, 0.95, 0.96, '#74c0fc', 0, 0.55, 0, {
      transparent: true,
      opacity: 0.24,
      emissive: '#4dabf7',
      emissiveIntensity: 0.3,
    });
    g.add(dome);
  } else {
    g.add(box(0.82, 0.22, 0.82, ac, 0, 0.11, 0));
  }

  // Critter Figure Group
  const ch = new THREE.Group();
  const baseY = def.id === 'mikey' ? 0.92 : def.id === 'bobby' ? 0.66 : 0.22;
  ch.position.y = baseY;

  // Body & Belly
  ch.add(box(0.46, 0.42, 0.34, c, 0, 0.28, 0));
  ch.add(box(0.3, 0.28, 0.05, ac, 0, 0.27, 0.17));
  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.66, 0);
  head.add(box(0.54, 0.46, 0.46, c, 0, 0, 0));
  // Ears
  head.add(box(0.16, 0.18, 0.14, c, -0.18, 0.3, 0));
  head.add(box(0.16, 0.18, 0.14, c, 0.18, 0.3, 0));
  // Smiling Critter eyes & grin
  head.add(box(0.1, 0.1, 0.05, '#1a1426', -0.12, 0.05, 0.23));
  head.add(box(0.1, 0.1, 0.05, '#1a1426', 0.12, 0.05, 0.23));
  head.add(box(0.32, 0.13, 0.05, '#1a1426', 0, -0.09, 0.23));
  ch.add(head);

  // Functional Prop per Critter
  const prop = new THREE.Group();
  if (def.id === 'sunnyfox') {
    // Glowing Golden Lantern Forge
    prop.add(box(0.28, 0.36, 0.28, '#ffd43b', 0.32, 0.42, 0.18, {
      emissive: '#fcc419',
      emissiveIntensity: 0.85,
    }));
  } else if (def.id === 'poppydash') {
    // Spinning Golden Popcorn Windmill Blades
    const blades = new THREE.Group();
    blades.position.set(0, 0.85, -0.22);
    blades.add(box(0.85, 0.12, 0.08, '#ffd43b', 0, 0, 0, { emissive: '#f59f00', emissiveIntensity: 0.35 }));
    blades.add(box(0.12, 0.85, 0.08, '#ffd43b', 0, 0, 0, { emissive: '#f59f00', emissiveIntensity: 0.35 }));
    prop.add(blades);
    g.userData.spinner = blades;
  } else if (def.id === 'picky') {
    // Berry & Apple Crate
    prop.add(box(0.26, 0.24, 0.26, '#ff6b6b', -0.32, 0.24, 0.18, { emissive: '#fa5252', emissiveIntensity: 0.35 }));
  } else if (def.id === 'lunabat') {
    // Crescent Moon-Star Crossbow
    prop.add(box(0.52, 0.1, 0.26, '#ffd43b', 0, 0.35, 0.28, { emissive: '#ffd43b', emissiveIntensity: 0.6 }));
  } else if (def.id === 'dogday') {
    // Solar Cannon Barrel
    prop.add(box(0.26, 0.26, 0.42, '#ff922b', 0, 0.34, 0.3, { emissive: '#fd7e14', emissiveIntensity: 0.5 }));
  } else if (def.id === 'craftycorn') {
    // Rainbow Crystal Spire
    prop.add(box(0.2, 0.45, 0.2, '#66d9e8', 0, 1.05, 0, { emissive: '#22b8cf', emissiveIntensity: 0.75 }));
  } else if (def.id === 'kickin') {
    // Thunder Tesla Coil
    prop.add(box(0.22, 0.38, 0.22, '#ffe066', 0, 1.02, 0, { emissive: '#fab005', emissiveIntensity: 0.8 }));
  }
  ch.add(prop);
  g.add(ch);

  // Upgrade Star Crown (hidden at Lv.1, shown at Lv.2+)
  const crown = box(0.28, 0.16, 0.28, '#ffd43b', 0, baseY + 1.08, 0, {
    emissive: '#fcc419',
    emissiveIntensity: 0.85,
  });
  crown.visible = false;
  g.add(crown);

  g.userData.critterGroup = ch;
  g.userData.head = head;
  g.userData.crown = crown;
  return g;
}

/** Builds a 3D Minecraft Blocky Zombie */
export function buildVoxelZombie(def) {
  const g = new THREE.Group();
  const s = def.scale || 1;
  g.scale.setScalar(s);

  // Legs
  const legL = box(0.18, 0.38, 0.18, '#364fc7', -0.11, 0.19, 0);
  const legR = box(0.18, 0.38, 0.18, '#364fc7', 0.11, 0.19, 0);
  g.add(legL, legR);
  // Torso
  g.add(box(0.44, 0.46, 0.28, def.shirtColor, 0, 0.58, 0));
  // Outstretched zombie arms (pointing west toward the Moon Altar)
  const armL = box(0.42, 0.16, 0.16, def.skinColor, -0.2, 0.68, -0.22);
  const armR = box(0.42, 0.16, 0.16, def.skinColor, -0.2, 0.68, 0.22);
  g.add(armL, armR);
  // Blocky green zombie head
  const head = box(0.44, 0.44, 0.44, def.skinColor, 0, 1.04, 0);
  g.add(head);
  // Eyes facing -X (west)
  g.add(box(0.05, 0.09, 0.1, '#1a1426', -0.23, 1.06, -0.1));
  g.add(box(0.05, 0.09, 0.1, '#1a1426', -0.23, 1.06, 0.1));

  if (def.id === 'bucket') {
    // Silver Iron Bucket Helmet
    g.add(box(0.5, 0.32, 0.5, '#adb5bd', 0, 1.24, 0, { metalness: 0.6, roughness: 0.3 }));
  } else if (def.id === 'digger') {
    // Golden Hardhat + Pickaxe
    g.add(box(0.48, 0.18, 0.48, '#fcc419', 0, 1.26, 0));
    g.add(box(0.1, 0.42, 0.1, '#868e96', -0.4, 0.8, 0.24));
  } else if (def.id === 'nightmare_boss') {
    // Purple Nightmare Crown & glowing eyes
    g.add(box(0.52, 0.24, 0.52, '#5f3dc4', 0, 1.3, 0, { emissive: '#7950f2', emissiveIntensity: 0.8 }));
  }

  // Overhead HP Bar
  const hpBg = box(0.62, 0.08, 0.08, '#212529', 0, 1.48, 0);
  const hpFill = box(0.6, 0.09, 0.09, '#51cf66', 0, 1.48, 0, { emissive: '#40c057', emissiveIntensity: 0.4 });
  g.add(hpBg, hpFill);

  g.userData = { legL, legR, armL, armR, hpFill };
  return g;
}
