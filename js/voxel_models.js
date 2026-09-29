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
    // Cozy Golden Sun Shrine Pedestal + Floating Sun Orb & Flower Petals
    const ped1 = vox(0.64, 0.12, 0.64, 0xfff3bf, 0, 0.06, 0);
    const ped2 = vox(0.48, 0.14, 0.48, 0xffe066, 0, 0.18, 0);
    g.add(ped1, ped2);
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + 0.35;
      const petal = vox(0.16, 0.24, 0.16, 0xffd43b, Math.cos(ang) * 0.18, 0.30, Math.sin(ang) * 0.18, {
        emissive: 0xf59f00,
        emissiveIntensity: 0.55
      });
      petal.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.22;
      g.add(petal);
    }
    const sunOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 20, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfff9db,
        emissive: 0xffd43b,
        emissiveIntensity: 0.9,
        roughness: 0.2
      })
    );
    sunOrb.position.set(0, 0.46, 0);
    g.add(sunOrb);
  } else if (kind === 'wood' || kind === 'wood_grove') {
    // Lush Multi-Puff Diorama Tree + Cozy Bush & Timber Logs (Pinterest Toy Style!)
    const log1 = vox(0.44, 0.13, 0.15, 0xb5651d, -0.14, 0.07, 0.22);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.15, 0.48, 12),
      new THREE.MeshStandardMaterial({ color: 0x9c5a25, roughness: 0.7 })
    );
    trunk.position.set(0, 0.24, 0);
    trunk.castShadow = true;

    const puffMat1 = new THREE.MeshStandardMaterial({ color: 0x74c69d, roughness: 0.55 });
    const puffMat2 = new THREE.MeshStandardMaterial({ color: 0x95d5b2, roughness: 0.5 });
    const puffMain = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), puffMat1);
    puffMain.position.set(0, 0.56, 0);
    puffMain.scale.set(1.08, 0.92, 1.08);
    puffMain.castShadow = true;

    const puffTop = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), puffMat2);
    puffTop.position.set(0.06, 0.78, -0.04);
    puffTop.castShadow = true;

    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), puffMat2);
    bush.position.set(0.24, 0.14, 0.18);
    const flower = vox(0.08, 0.08, 0.08, 0xff8787, 0.28, 0.26, 0.22, { emissive: 0xff8787, emissiveIntensity: 0.3 });
    g.add(log1, trunk, puffMain, puffTop, bush, flower);
  } else if (kind === 'stone' || kind === 'stone_vein') {
    // Sculpted 3D Masonry Brick Pallet & Terracotta Bricks (砖)
    const pallet = vox(0.64, 0.08, 0.64, 0xd4a373, 0, 0.04, 0);
    const row1A = vox(0.28, 0.16, 0.48, 0xd9480f, -0.15, 0.16, 0);
    const row1B = vox(0.28, 0.16, 0.48, 0xe8590c, 0.15, 0.16, 0);
    const mortar = vox(0.58, 0.04, 0.46, 0xfff3d6, 0, 0.25, 0);
    const row2 = vox(0.46, 0.16, 0.34, 0xf76707, 0, 0.34, 0, { emissive: 0xd9480f, emissiveIntensity: 0.2 });
    const stud1 = vox(0.12, 0.06, 0.12, 0xff922b, -0.11, 0.45, 0);
    const stud2 = vox(0.12, 0.06, 0.12, 0xff922b, 0.11, 0.45, 0);
    g.add(pallet, row1A, row1B, mortar, row2, stud1, stud2);
  } else {
    // 'crystal' / 'crystal_vein' — Cozy Pedestal + Sparkling Cyan-Blue Diamond Cluster (钻石)
    const stump = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.30, 0.14, 14),
      new THREE.MeshStandardMaterial({ color: 0x748ffc, roughness: 0.45 })
    );
    stump.position.set(0, 0.07, 0);
    g.add(stump);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x66d9e8,
      emissive: 0x22b8cf,
      emissiveIntensity: 0.75,
      roughness: 0.18,
      metalness: 0.35
    });
    const centerGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), gemMat);
    centerGem.position.set(0, 0.36, 0);
    centerGem.scale.set(0.95, 1.35, 0.95);
    g.add(centerGem);
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + 0.4;
      const sideGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), gemMat);
      sideGem.position.set(Math.cos(ang) * 0.18, 0.24, Math.sin(ang) * 0.18);
      sideGem.rotation.z = Math.cos(ang) * 0.32;
      sideGem.rotation.x = Math.sin(ang) * 0.32;
      g.add(sideGem);
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

  // Sculpted cylindrical Toy Figurine Coin Base (Amiibo / Clash Mini style)
  const pedMat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0.08 });
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.45, 0.14, 24), pedMat);
  ped.position.set(0, 0.07, 0);
  ped.castShadow = true;
  ped.receiveShadow = true;
  const rimMat = new THREE.MeshStandardMaterial({
    color: acc,
    emissive: acc,
    emissiveIntensity: 0.28,
    roughness: 0.32,
    metalness: 0.25
  });
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.045, 24), rimMat);
  rim.position.set(0, 0.145, 0);
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
  } else if (def.id === 'starlight_cannon') {
    // Tier 4 Advanced Apex Building: Starlight Orbital Cannon (星辉巨炮)
    torso.visible = false;
    belly.visible = false;
    head.visible = false;
    const basePlinth = vox(0.92, 0.20, 0.92, 0xfff3bf, 0, 0.10, 0);
    const midRing = vox(0.76, 0.24, 0.76, 0x5f3dc4, 0, 0.30, 0, { emissive: 0x3b096c, emissiveIntensity: 0.45 });
    const goldTrim = vox(0.82, 0.08, 0.82, 0xffd43b, 0, 0.44, 0, { emissive: 0xf59f00, emissiveIntensity: 0.65, metalness: 0.6 });
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0x7950f2, emissive: 0x5f3dc4, emissiveIntensity: 0.5, metalness: 0.4, roughness: 0.25 })
    );
    dome.position.set(0, 0.56, 0);
    const barrelL = vox(0.14, 0.16, 0.68, 0xffd43b, -0.16, 0.66, 0.22, { emissive: 0xfcc419, emissiveIntensity: 0.75, metalness: 0.6 });
    const barrelR = vox(0.14, 0.16, 0.68, 0xffd43b, 0.16, 0.66, 0.22, { emissive: 0xfcc419, emissiveIntensity: 0.75, metalness: 0.6 });
    const coreBeam = vox(0.18, 0.18, 0.74, 0xda77f2, 0, 0.68, 0.25, { emissive: 0xf72585, emissiveIntensity: 0.95 });
    barrelL.rotation.x = -0.25;
    barrelR.rotation.x = -0.25;
    coreBeam.rotation.x = -0.25;
    const rotor = new THREE.Group();
    rotor.position.set(0, 1.02, 0);
    const starCoreGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xae3ec9, emissiveIntensity: 0.95, roughness: 0.15 })
    );
    rotor.add(starCoreGem);
    g.userData.rotor = rotor;
    prop.add(basePlinth, midRing, goldTrim, dome, barrelL, barrelR, coreBeam, rotor);
  } else if (def.id === 'moon_obelisk') {
    // Tier 4 Advanced Apex Building: Lunar Sanctuary Obelisk (月神方尖碑)
    torso.visible = false;
    belly.visible = false;
    head.visible = false;
    const step1 = vox(0.94, 0.16, 0.94, 0xfff3d6, 0, 0.08, 0);
    const step2 = vox(0.76, 0.16, 0.76, 0xffd43b, 0, 0.24, 0, { emissive: 0xf59f00, emissiveIntensity: 0.4 });
    const obeliskShaft = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.96, 4),
      new THREE.MeshStandardMaterial({ color: 0x22b8cf, emissive: 0x1098ad, emissiveIntensity: 0.65, metalness: 0.35, roughness: 0.2 })
    );
    obeliskShaft.position.set(0, 0.76, 0);
    obeliskShaft.rotation.y = Math.PI / 4;
    for (const sx of [-0.34, 0.34]) {
      for (const sz of [-0.34, 0.34]) {
        prop.add(vox(0.10, 0.42, 0.10, 0xda77f2, sx, 0.36, sz, { emissive: 0xae3ec9, emissiveIntensity: 0.8 }));
      }
    }
    const rotor = new THREE.Group();
    rotor.position.set(0, 1.30, 0);
    const crescent = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.055, 16, 32, Math.PI * 1.45),
      new THREE.MeshStandardMaterial({ color: 0xfff9db, emissive: 0xffd43b, emissiveIntensity: 0.95, metalness: 0.5, roughness: 0.2 })
    );
    crescent.rotation.z = Math.PI * 0.3;
    rotor.add(crescent);
    g.userData.rotor = rotor;
    prop.add(step1, step2, obeliskShaft, rotor);
  }
  g.add(prop);

  // Floating 3D Upgrade Stars above the Critter (Lv.1 -> Lv.2 -> Lv.3)
  const starRow = new THREE.Group();
  starRow.position.set(0, def.isApexBuilding ? 1.52 : 1.15, 0);
  const starMeshes = [];
  for (let i = 0; i < 3; i++) {
    const sm = vox(0.13, 0.13, 0.06, 0xffd43b, (i - 1) * 0.18, 0, 0, {
      emissive: 0xfcc419,
      emissiveIntensity: 0.9
    });
    sm.rotation.z = Math.PI / 4;
    sm.visible = i === 0;
    starRow.add(sm);
    starMeshes.push(sm);
  }
  g.add(starRow);

  g.userData = {
    head,
    prop,
    rotor: g.userData.rotor,
    starRow,
    setStarLevel(lv = 1) {
      for (let i = 0; i < 3; i++) {
        starMeshes[i].visible = i < lv;
      }
      const sc = 1 + (lv - 1) * 0.18;
      g.scale.setScalar(sc);
    }
  };
  return g;
}

// ============================================================================
// GIANT 3D MOON SANCTUARY CASTLE & REBUILD CRADLE (CLEAR VISUAL GOAL ON BOARD!)
// ============================================================================
export function buildMoonSanctuaryMesh() {
  const g = new THREE.Group();

  // Warm Creamy-Ivory Fairytale Castle Keep & Golden Trim (Pinterest Toy Diorama Style!)
  const basePlinth = vox(1.92, 0.22, 1.92, 0xf3d5a5, 0, 0.11, 0);
  const keepWall = vox(1.38, 0.72, 1.38, 0xfff3d6, 0, 0.56, 0);
  const keepRoofRim = vox(1.48, 0.14, 1.48, 0xfcc419, 0, 0.96, 0, { emissive: 0xf59f00, emissiveIntensity: 0.25 });
  const gateArch = vox(0.16, 0.46, 0.48, 0x845ef7, 0.66, 0.42, 0, { emissive: 0x5f3dc4, emissiveIntensity: 0.35 });
  g.add(basePlinth, keepWall, keepRoofRim, gateArch);

  const turretWallMat = new THREE.MeshStandardMaterial({ color: 0xffe8b6, roughness: 0.45 });
  const turretRoofMat = new THREE.MeshStandardMaterial({
    color: 0xffc024,
    emissive: 0xe67700,
    emissiveIntensity: 0.3,
    roughness: 0.35
  });

  // 4 Cylindrical Corner Turrets with Golden Conical Roofs
  for (const sx of [-0.68, 0.68]) {
    for (const sz of [-0.68, 0.68]) {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.88, 18), turretWallMat);
      cyl.position.set(sx, 0.56, sz);
      cyl.castShadow = true;

      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.46, 18), turretRoofMat);
      cone.position.set(sx, 1.22, sz);
      cone.castShadow = true;

      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), turretRoofMat);
      finial.position.set(sx, 1.48, sz);
      g.add(cyl, cone, finial);
    }
  }

  // Hollow Golden-Silver Cradle Ring holding the Rebuilding 3D Moon above the Castle
  const cradleRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.66, 0.068, 20, 48),
    new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xd9480f,
      emissiveIntensity: 0.35,
      metalness: 0.55,
      roughness: 0.28
    })
  );
  cradleRing.position.set(0, 1.78, 0);
  g.add(cradleRing);

  // The Rebuilding 3D Golden Moon Sphere inside the Cradle (scales 0.22 -> 1.04 as Shards are collected!)
  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xfff9db,
    emissive: 0xffd43b,
    emissiveIntensity: 0.95,
    roughness: 0.22
  });
  const moonCore = new THREE.Mesh(new THREE.SphereGeometry(0.60, 40, 32), moonMat);
  moonCore.position.set(0, 1.78, 0);
  moonCore.scale.setScalar(0.22);
  g.add(moonCore);

  // 5 Orbiting Star Progress Crystals (light up at 20%, 40%, 60%, 80%, 100%)
  const starRing = new THREE.Group();
  starRing.position.set(0, 1.78, 0);
  const progressStars = [];
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const stMat = new THREE.MeshStandardMaterial({
      color: 0x845ef7,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.3
    });
    const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), stMat);
    st.position.set(Math.cos(ang) * 0.90, Math.sin(ang) * 0.90, 0.12);
    starRing.add(st);
    progressStars.push(st);
  }
  g.add(starRing);

  // Overhead 3D Sanctuary Hearts (5 Big Ruby Hearts)
  const heartRow = new THREE.Group();
  heartRow.position.set(0, 2.82, 0);
  const hearts = [];
  for (let i = 0; i < 5; i++) {
    const hm = vox(0.20, 0.20, 0.08, 0xff4d6d, (i - 2) * 0.28, 0, 0, {
      emissive: 0xff1e42,
      emissiveIntensity: 0.75
    });
    heartRow.add(hm);
    hearts.push(hm);
  }
  g.add(heartRow);

  g.userData = {
    moonCore,
    cradleRing,
    starRing,
    updateSanctuary(hp, maxHp, moonRatio) {
      const r = Math.max(0, Math.min(1, moonRatio));
      moonCore.scale.setScalar(0.22 + r * 0.82);
      moonMat.emissiveIntensity = 0.55 + r * 0.65;

      const litStars = Math.floor(r * 5 + 0.001);
      for (let i = 0; i < 5; i++) {
        const active = i < litStars;
        progressStars[i].material.color.setHex(active ? 0xffd43b : 0x845ef7);
        progressStars[i].material.emissive.setHex(active ? 0xfcc419 : 0x000000);
        progressStars[i].material.emissiveIntensity = active ? 0.95 : 0;
        progressStars[i].scale.setScalar(active ? 1.2 : 0.8);
      }

      const hpRatio = Math.max(0, hp / Math.max(1, maxHp));
      const activeHearts = Math.ceil(hpRatio * 5);
      for (let i = 0; i < 5; i++) {
        hearts[i].visible = i < activeHearts;
      }
    }
  };
  return g;
}

// ============================================================================
// OVERHEAD 3D NON-TEXT HEART & SHIELD BADGES FOR ZOMBIES
// ============================================================================
function createOverheadStatusRow(def) {
  const row = new THREE.Group();
  const isBoss = def.id === 'nightmare_boss' || def.id === 'abyss_dragon' || def.isElite;
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

  // Non-text 3D Ability / Rare Star Core Drop Emblem above the hearts
  let abilityIcon = null;
  if (def.reward?.core > 0 || def.isElite) {
    // Glowing Purple-Gold Rare Star Core Octahedron Badge above Tough Elite Monsters!
    abilityIcon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshStandardMaterial({
        color: 0xffd43b,
        emissive: 0xae3ec9,
        emissiveIntensity: 0.95,
        roughness: 0.15
      })
    );
    abilityIcon.position.set(0, 0.21, 0);
    row.add(abilityIcon);
  } else if (def.armor > 0) {
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
// 11 VISUALLY & FUNCTIONALLY DISTINCT 3D VOXEL ZOMBIES & TOUGH ELITES
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
  const eyeColor = (def.id === 'nightmare_boss' || def.id === 'abyss_dragon') ? 0xffbe0b : (def.isElite ? 0xda77f2 : 0xff2a55);
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

  // 8. IRON GOLEM (铁甲巨像 — Wave 3+ Tough Elite, drops +2 🔮 Star Cores):
  if (def.id === 'iron_golem') {
    const pauldronL = vox(0.24, 0.22, 0.26, 0x495057, 0, 0.58, -0.26, { metalness: 0.8, roughness: 0.2 });
    const pauldronR = vox(0.24, 0.22, 0.26, 0x495057, 0, 0.58, 0.26, { metalness: 0.8, roughness: 0.2 });
    const coreGem = vox(0.14, 0.20, 0.20, 0x22b8cf, -0.18, 0.46, 0, { emissive: 0x66d9e8, emissiveIntensity: 0.95 });
    const helmHornL = vox(0.10, 0.24, 0.10, 0xffd43b, 0, 1.02, -0.16, { emissive: 0xf59f00, emissiveIntensity: 0.6 });
    const helmHornR = vox(0.10, 0.24, 0.10, 0xffd43b, 0, 1.02, 0.16, { emissive: 0xf59f00, emissiveIntensity: 0.6 });
    pickaxeGroup = new THREE.Group();
    pickaxeGroup.position.set(-0.32, 0.54, -0.26);
    const shaft = vox(0.08, 0.54, 0.08, 0x8d5524, 0, 0.18, 0);
    const hammerHead = vox(0.38, 0.20, 0.22, 0xced4da, 0, 0.44, 0, { metalness: 0.85, emissive: 0x7950f2, emissiveIntensity: 0.35 });
    pickaxeGroup.add(shaft, hammerHead);
    g.add(pauldronL, pauldronR, coreGem, helmHornL, helmHornR, pickaxeGroup);
  }

  // 9. CRYSTAL BEHEMOTH (晶簇巨兽 — Wave 4+ Tough Elite, drops +3 🔮 Star Cores):
  if (def.id === 'crystal_behemoth') {
    const spire1 = vox(0.18, 0.52, 0.18, 0xda77f2, 0.12, 0.86, 0, { emissive: 0xae3ec9, emissiveIntensity: 0.9 });
    const spire2 = vox(0.14, 0.42, 0.14, 0x74c0fc, 0.08, 0.76, -0.20, { emissive: 0x22b8cf, emissiveIntensity: 0.85 });
    const spire3 = vox(0.14, 0.42, 0.14, 0xffd43b, 0.08, 0.76, 0.20, { emissive: 0xfcc419, emissiveIntensity: 0.85 });
    spire1.rotation.z = -0.28;
    spire2.rotation.x = -0.32;
    spire3.rotation.x = 0.32;
    shamanRing = new THREE.Group();
    shamanRing.position.set(0, 0.62, 0);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      shamanRing.add(vox(0.14, 0.18, 0.14, 0xffe066, Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46, {
        emissive: 0xda77f2,
        emissiveIntensity: 0.95
      }));
    }
    g.add(spire1, spire2, spire3, shamanRing);
  }

  // 10. ABYSS DRAGON (暗月魔龙王 — Wave 5+ Flying Boss Elite, drops +4 🔮 Star Cores):
  if (def.id === 'abyss_dragon') {
    balloonRig = new THREE.Group();
    const wingL = vox(0.24, 0.44, 0.68, 0x5f3dc4, 0.08, 0.72, -0.46, { emissive: 0x3b096c, emissiveIntensity: 0.65 });
    const wingR = vox(0.24, 0.44, 0.68, 0x5f3dc4, 0.08, 0.72, 0.46, { emissive: 0x3b096c, emissiveIntensity: 0.65 });
    const hornL = vox(0.12, 0.38, 0.12, 0xffd43b, -0.06, 1.12, -0.16, { emissive: 0xf59f00, emissiveIntensity: 0.85 });
    const hornR = vox(0.12, 0.38, 0.12, 0xffd43b, -0.06, 1.12, 0.16, { emissive: 0xf59f00, emissiveIntensity: 0.85 });
    balloonRig.add(wingL, wingR, hornL, hornR);
    bossOrbs = new THREE.Group();
    bossOrbs.position.set(0, 0.74, 0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      bossOrbs.add(vox(0.14, 0.14, 0.14, 0xda77f2, Math.cos(a) * 0.52, Math.sin(a * 2) * 0.10, Math.sin(a) * 0.52, {
        emissive: 0xffbe0b,
        emissiveIntensity: 0.95
      }));
    }
    g.add(balloonRig, bossOrbs);
  }

  // Overhead 3D Heart & Ability Status Bar
  const status = createOverheadStatusRow(def);
  status.row.position.set(0, def.id === 'balloon' ? 2.30 : (def.isElite ? 1.42 : 1.26), 0);
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
      if (status.abilityIcon && def.armor > 0 && !def.isElite) {
        status.abilityIcon.visible = armor > 0;
      }
    }
  };
  return g;
}
