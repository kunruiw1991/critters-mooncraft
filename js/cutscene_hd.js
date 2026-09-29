// CritterCraft: Moonless Night — High-Resolution Non-Blocky 3D Plush & Storybook 10s Opening Cinematics.
// Strictly uses smooth curved 3D primitives (SphereGeometry, CapsuleGeometry, CylinderGeometry,
// TorusGeometry, ConeGeometry, RingGeometry, OctahedronGeometry, CatmullRomCurve3 + TubeGeometry).
// ZERO BoxGeometry voxels are used in this module.

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const hdMatCache = new Map();
export function hdMat(THREE, color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (hdMatCache.has(key)) return hdMatCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.52,
    metalness: opts.metalness ?? 0.06,
    emissive: opts.emissive || '#000000',
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1,
    side: opts.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
  });
  hdMatCache.set(key, m);
  return m;
}

/** Smooth high-resolution procedural lunar surface texture (LinearFilter, zero pixelation) */
export function makeSmoothMoonTexture(THREE = window.THREE) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');

  const baseGrad = ctx.createLinearGradient(0, 0, 0, 256);
  baseGrad.addColorStop(0, '#fff9db');
  baseGrad.addColorStop(0.5, '#fff3bf');
  baseGrad.addColorStop(1, '#ffec99');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 512, 256);

  const craters = [
    [140, 95, 48, 'rgba(245, 159, 0, 0.22)'],
    [290, 130, 62, 'rgba(240, 140, 0, 0.18)'],
    [380, 78, 36, 'rgba(245, 159, 0, 0.24)'],
    [210, 175, 40, 'rgba(230, 119, 0, 0.20)'],
    [90, 170, 28, 'rgba(245, 159, 0, 0.25)'],
    [445, 165, 32, 'rgba(245, 159, 0, 0.22)'],
  ];
  for (const [cx, cy, r, col] of craters) {
    const rg = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
    rg.addColorStop(0, col);
    rg.addColorStop(0.75, 'rgba(252, 196, 25, 0.12)');
    rg.addColorStop(0.92, 'rgba(255, 249, 219, 0.35)');
    rg.addColorStop(1, 'rgba(255, 243, 191, 0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** High-Res 3D Sculpted Full Moon (SphereGeometry 64x48 + sculpted crater rims + golden corona) */
export function buildHighResMoon(THREE = window.THREE) {
  const g = new THREE.Group();
  const moonTex = makeSmoothMoonTexture(THREE);

  const coreMat = new THREE.MeshStandardMaterial({
    map: moonTex,
    color: '#fff9db',
    emissive: '#ffd43b',
    emissiveIntensity: 0.72,
    roughness: 0.32,
    metalness: 0.04,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(2.2, 64, 48), coreMat);
  g.add(core);

  const craterSpecs = [
    [-0.65, 0.45, 1.98, 0.36, -0.32, 0.22],
    [0.72, -0.38, 1.96, 0.44, 0.25, 0.34],
    [0.18, 0.88, 1.94, 0.26, -0.42, -0.1],
    [-0.35, -0.72, 1.97, 0.3, 0.38, -0.18],
  ];
  for (const [x, y, z, r, rx, ry] of craterSpecs) {
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(r, r * 0.18, 20, 48),
      hdMat(THREE, '#fcc419', { emissive: '#f59f00', emissiveIntensity: 0.48, roughness: 0.4 })
    );
    rim.position.set(x, y, z);
    rim.rotation.set(rx, ry, 0);
    g.add(rim);
  }

  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.52, 48, 36),
    hdMat(THREE, '#fff3bf', {
      emissive: '#ffd43b',
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.26,
    })
  );
  g.add(innerGlow);

  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.95, 48, 36),
    hdMat(THREE, '#fff9db', {
      emissive: '#ffe066',
      emissiveIntensity: 0.38,
      transparent: true,
      opacity: 0.14,
    })
  );
  g.add(outerGlow);

  const coronaRing = new THREE.Mesh(
    new THREE.RingGeometry(2.45, 3.35, 64),
    hdMat(THREE, '#ffe066', {
      emissive: '#ffd43b',
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.32,
      doubleSided: true,
    })
  );
  g.add(coronaRing);

  core.onBeforeRender = () => {
    const now = performance.now() * 0.001;
    const pulse = 1 + Math.sin(now * 2.2) * 0.035;
    innerGlow.scale.setScalar(pulse);
    outerGlow.scale.setScalar(1 + Math.cos(now * 1.6) * 0.05);
    coronaRing.rotation.z = now * 0.25;
  };

  g.userData = { core, innerGlow, outerGlow, coronaRing };
  return g;
}

/** High-Res Smooth 3D Cute CatNap (Plush spheres, capsules, curved ears, dual catchlights, S-curved tail) */
export function buildHighResCuteCatNap(THREE = window.THREE) {
  const cute = new THREE.Group();

  const plushPurple = hdMat(THREE, '#845ef7', { roughness: 0.52, metalness: 0.04 });
  const deepPurple = hdMat(THREE, '#6741d9', { roughness: 0.56, metalness: 0.05 });
  const bellyLavender = hdMat(THREE, '#e5dbff', { roughness: 0.58, metalness: 0.02 });
  const earPink = hdMat(THREE, '#faa2c1', { roughness: 0.5, emissive: '#f783ac', emissiveIntensity: 0.15 });
  const eyeBlack = hdMat(THREE, '#120d1d', { roughness: 0.12, metalness: 0.25 });
  const catchWhite = hdMat(THREE, '#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.95, roughness: 0.05 });
  const goldMoonMat = hdMat(THREE, '#ffd43b', {
    emissive: '#fcc419',
    emissiveIntensity: 0.75,
    metalness: 0.55,
    roughness: 0.2,
  });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.31, 0.34, 24, 36), plushPurple);
  torso.position.set(0, 0.52, 0);
  torso.castShadow = true;
  cute.add(torso);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.26, 36, 28), bellyLavender);
  belly.scale.set(0.92, 1.12, 0.42);
  belly.position.set(0, 0.5, 0.22);
  cute.add(belly);

  const zipperLine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.36, 20),
    hdMat(THREE, '#dee2e6', { metalness: 0.7, roughness: 0.25 })
  );
  zipperLine.position.set(0, 0.52, 0.32);
  cute.add(zipperLine);

  const crescentGroup = new THREE.Group();
  crescentGroup.position.set(0, 0.56, 0.35);
  const crescentArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.105, 0.034, 24, 48, Math.PI * 1.42),
    goldMoonMat
  );
  crescentArc.rotation.z = Math.PI * 0.32;
  crescentGroup.add(crescentArc);
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.012, 16, 28), goldMoonMat);
  bail.position.set(0, 0.12, 0);
  crescentGroup.add(bail);
  cute.add(crescentGroup);

  const cHead = new THREE.Group();
  cHead.position.set(0, 1.08, 0.02);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.42, 48, 36), plushPurple);
  headSphere.scale.set(1.12, 0.96, 0.98);
  headSphere.castShadow = true;
  cHead.add(headSphere);

  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.21, 36, 28), plushPurple);
    cheek.scale.set(1.15, 0.88, 0.95);
    cheek.position.set(side * 0.25, -0.08, 0.16);
    cHead.add(cheek);

    const blush = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 24, 18),
      hdMat(THREE, '#ff8787', { emissive: '#fa5252', emissiveIntensity: 0.35, transparent: true, opacity: 0.65 })
    );
    blush.scale.set(1.2, 0.7, 0.35);
    blush.position.set(side * 0.31, -0.05, 0.34);
    cHead.add(blush);

    const earGroup = new THREE.Group();
    earGroup.position.set(side * 0.28, 0.34, -0.02);
    earGroup.rotation.z = -side * 0.28;
    earGroup.rotation.x = 0.1;

    const outerEar = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 36), deepPurple);
    outerEar.position.y = 0.14;
    earGroup.add(outerEar);

    const earTip = new THREE.Mesh(new THREE.SphereGeometry(0.042, 24, 18), deepPurple);
    earTip.position.y = 0.3;
    earGroup.add(earTip);

    const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.24, 32), earPink);
    innerEar.position.set(0, 0.12, 0.045);
    earGroup.add(innerEar);
    cHead.add(earGroup);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.088, 32, 24), eyeBlack);
    eye.scale.set(1.0, 1.12, 0.65);
    eye.position.set(side * 0.16, 0.08, 0.37);
    cHead.add(eye);

    const catch1 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 20, 16), catchWhite);
    catch1.position.set(side * 0.14, 0.115, 0.425);
    cHead.add(catch1);

    const catch2 = new THREE.Mesh(new THREE.SphereGeometry(0.015, 16, 12), catchWhite);
    catch2.position.set(side * 0.185, 0.055, 0.422);
    cHead.add(catch2);

    const browCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.08, 0.21, 0.36),
      new THREE.Vector3(side * 0.16, 0.245, 0.37),
      new THREE.Vector3(side * 0.24, 0.205, 0.34),
    ]);
    const brow = new THREE.Mesh(new THREE.TubeGeometry(browCurve, 24, 0.016, 12, false), deepPurple);
    cHead.add(brow);
  }

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.042, 24, 18), earPink);
  nose.scale.set(1.25, 0.85, 0.75);
  nose.position.set(0, 0.0, 0.42);
  cHead.add(nose);

  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.24, -0.04, 0.34),
    new THREE.Vector3(-0.14, -0.15, 0.38),
    new THREE.Vector3(0.0, -0.18, 0.4),
    new THREE.Vector3(0.14, -0.15, 0.38),
    new THREE.Vector3(0.24, -0.04, 0.34),
  ]);
  const smileRim = new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 36, 0.022, 16, false), eyeBlack);
  cHead.add(smileRim);

  const smileInner = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 24), eyeBlack);
  smileInner.scale.set(1.25, 0.62, 0.35);
  smileInner.position.set(0, -0.11, 0.35);
  cHead.add(smileInner);

  cute.add(cHead);

  for (const side of [-1, 1]) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.34, 0.62, 0.04);
    armGroup.rotation.z = side * 0.35;
    armGroup.rotation.x = -0.25;

    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.24, 16, 28), plushPurple);
    arm.position.y = -0.1;
    armGroup.add(arm);

    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.11, 28, 22), deepPurple);
    paw.position.y = -0.24;
    armGroup.add(paw);

    for (let b = -1; b <= 1; b++) {
      const bean = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), earPink);
      bean.position.set(b * 0.042, -0.26, 0.085);
      armGroup.add(bean);
    }
    cute.add(armGroup);

    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.22, 16, 28), deepPurple);
    leg.position.set(side * 0.17, 0.19, 0);
    cute.add(leg);

    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 28, 22), deepPurple);
    foot.scale.set(1.0, 0.72, 1.35);
    foot.position.set(side * 0.17, 0.08, 0.06);
    cute.add(foot);
  }

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.32, -0.26),
    new THREE.Vector3(0.18, 0.42, -0.48),
    new THREE.Vector3(-0.14, 0.72, -0.62),
    new THREE.Vector3(0.22, 1.02, -0.54),
    new THREE.Vector3(0.32, 1.18, -0.38),
  ]);
  const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 48, 0.068, 24, false), plushPurple);
  cute.add(tailMesh);

  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.078, 24, 20), deepPurple);
  tailTip.position.set(0.32, 1.18, -0.38);
  cute.add(tailTip);

  cute.userData = { cHead, crescentGroup, tailMesh };
  return cute;
}

/** High-Res Smooth 3D Nightmare CatNap (Sleek sculpted silhouette + vortex dream-mist rings) */
export function buildHighResNightmareCatNap(THREE = window.THREE) {
  const night = new THREE.Group();
  night.visible = false;

  const darkVelvet = hdMat(THREE, '#3b1f7a', {
    roughness: 0.42,
    metalness: 0.15,
    emissive: '#5f3dc4',
    emissiveIntensity: 0.32,
  });
  const ribGlowMat = hdMat(THREE, '#b197fc', {
    emissive: '#7950f2',
    emissiveIntensity: 0.7,
    roughness: 0.3,
  });
  const eyeGlow = hdMat(THREE, '#ffffff', {
    emissive: '#ffffff',
    emissiveIntensity: 1.0,
    roughness: 0.05,
  });
  const redMistMat = hdMat(THREE, '#ff6b6b', {
    emissive: '#f03e3e',
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.75,
  });
  const purpleMistMat = hdMat(THREE, '#d0bfff', {
    emissive: '#9775fa',
    emissiveIntensity: 0.75,
    transparent: true,
    opacity: 0.68,
  });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.86, 24, 36), darkVelvet);
  torso.position.set(0, 1.05, 0);
  torso.rotation.x = 0.08;
  night.add(torso);

  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(0.33 - i * 0.015, 0.036, 20, 48),
      ribGlowMat
    );
    rib.position.set(0, 0.72 + i * 0.22, 0.02);
    rib.rotation.x = Math.PI / 2 + 0.1;
    night.add(rib);
  }

  const coreCrescent = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.042, 20, 48, Math.PI * 1.45),
    hdMat(THREE, '#ffd43b', { emissive: '#fcc419', emissiveIntensity: 0.9 })
  );
  coreCrescent.position.set(0, 1.18, 0.35);
  coreCrescent.rotation.z = Math.PI * 0.3;
  night.add(coreCrescent);

  const nHead = new THREE.Group();
  nHead.position.set(0, 1.92, 0.1);

  const headGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.48, 48, 36), darkVelvet);
  headGlobe.scale.set(1.16, 0.94, 0.96);
  nHead.add(headGlobe);

  for (const side of [-1, 1]) {
    const earGroup = new THREE.Group();
    earGroup.position.set(side * 0.34, 0.38, -0.02);
    earGroup.rotation.z = -side * 0.22;

    const earCone = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.56, 36), darkVelvet);
    earCone.position.y = 0.24;
    earGroup.add(earCone);

    const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.4, 32), ribGlowMat);
    innerEar.position.set(0, 0.2, 0.045);
    earGroup.add(innerEar);
    nHead.add(earGroup);

    const eyeSocket = new THREE.Mesh(
      new THREE.SphereGeometry(0.125, 32, 24),
      hdMat(THREE, '#120924', { roughness: 0.2 })
    );
    eyeSocket.scale.set(1.15, 0.95, 0.55);
    eyeSocket.position.set(side * 0.21, 0.1, 0.38);
    nHead.add(eyeSocket);

    const eyeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.095, 32, 24), eyeGlow);
    eyeOrb.scale.set(1.1, 0.85, 0.6);
    eyeOrb.position.set(side * 0.21, 0.1, 0.42);
    nHead.add(eyeOrb);

    const browCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.06, 0.16, 0.41),
      new THREE.Vector3(side * 0.21, 0.25, 0.42),
      new THREE.Vector3(side * 0.35, 0.22, 0.36),
    ]);
    nHead.add(new THREE.Mesh(new THREE.TubeGeometry(browCurve, 24, 0.024, 14, false), ribGlowMat));
  }

  const mawInner = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 36, 28),
    hdMat(THREE, '#120924', { roughness: 0.9 })
  );
  mawInner.scale.set(1.38, 0.68, 0.42);
  mawInner.position.set(0, -0.14, 0.36);
  nHead.add(mawInner);

  const grinCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.36, -0.02, 0.32),
    new THREE.Vector3(-0.2, -0.22, 0.41),
    new THREE.Vector3(0, -0.26, 0.43),
    new THREE.Vector3(0.2, -0.22, 0.41),
    new THREE.Vector3(0.36, -0.02, 0.32),
  ]);
  nHead.add(new THREE.Mesh(new THREE.TubeGeometry(grinCurve, 40, 0.026, 16, false), ribGlowMat));

  const mawMist = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 18), redMistMat);
  mawMist.position.set(0, -0.15, 0.42);
  nHead.add(mawMist);

  night.add(nHead);

  for (const side of [-1, 1]) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.48, 1.38, 0.08);
    armGroup.rotation.z = side * 0.22;
    armGroup.rotation.x = -0.35;

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.62, 16, 28), darkVelvet);
    upperArm.position.y = -0.32;
    armGroup.add(upperArm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 20), darkVelvet);
    hand.position.y = -0.68;
    armGroup.add(hand);

    for (let c = -1; c <= 1; c++) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.18, 16), ribGlowMat);
      claw.position.set(c * 0.05, -0.8, 0.05);
      claw.rotation.x = Math.PI * 0.85;
      armGroup.add(claw);
    }
    night.add(armGroup);

    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.48, 16, 28), darkVelvet);
    leg.position.set(side * 0.24, 0.34, 0);
    night.add(leg);

    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 20), darkVelvet);
    paw.scale.set(1.0, 0.65, 1.45);
    paw.position.set(side * 0.24, 0.08, 0.08);
    night.add(paw);
  }

  const nTailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.55, -0.28),
    new THREE.Vector3(-0.35, 0.85, -0.68),
    new THREE.Vector3(0.32, 1.35, -0.82),
    new THREE.Vector3(-0.22, 1.88, -0.65),
    new THREE.Vector3(0.18, 2.25, -0.35),
  ]);
  night.add(new THREE.Mesh(new THREE.TubeGeometry(nTailCurve, 64, 0.065, 24, false), darkVelvet));

  const smokeGroup = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * TAU;
    const rad = 0.78 + (i % 3) * 0.16;
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.16 + (i % 3) * 0.045, 28, 22),
      i % 3 === 0 ? redMistMat : purpleMistMat
    );
    puff.position.set(Math.cos(angle) * rad, 0.35 + (i % 4) * 0.42, Math.sin(angle) * rad);
    smokeGroup.add(puff);
  }

  const vortexRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.04, 20, 64), purpleMistMat);
  vortexRing1.position.y = 0.55;
  vortexRing1.rotation.x = Math.PI / 2 + 0.22;
  smokeGroup.add(vortexRing1);

  const vortexRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.035, 20, 64), redMistMat);
  vortexRing2.position.y = 1.25;
  vortexRing2.rotation.x = Math.PI / 2 - 0.25;
  smokeGroup.add(vortexRing2);

  night.add(smokeGroup);
  night.userData = { nHead, smokeGroup };
  return { night, smokeGroup };
}

/** High-Res Sleek Space Rocket (Cone nosecone, polished cylinder fuselage, porthole, curved fins) */
export function buildHighResRocket(THREE = window.THREE) {
  const padGroup = new THREE.Group();
  const padBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.78, 0.14, 48),
    hdMat(THREE, '#495057', { metalness: 0.45, roughness: 0.4 })
  );
  padBase.position.set(1.35, 0.07, 0);
  padGroup.add(padBase);

  const padRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.032, 20, 48),
    hdMat(THREE, '#ffd43b', { emissive: '#fcc419', emissiveIntensity: 0.7 })
  );
  padRing.position.set(1.35, 0.15, 0);
  padRing.rotation.x = Math.PI / 2;
  padGroup.add(padRing);

  const rocket = new THREE.Group();
  rocket.position.set(1.35, 0.16, 0);

  const redHull = hdMat(THREE, '#ff6b6b', {
    emissive: '#f03e3e',
    emissiveIntensity: 0.3,
    metalness: 0.35,
    roughness: 0.22,
  });
  const pearlBand = hdMat(THREE, '#ffffff', { metalness: 0.3, roughness: 0.18 });
  const goldNose = hdMat(THREE, '#ffd43b', {
    emissive: '#fcc419',
    emissiveIntensity: 0.6,
    metalness: 0.5,
    roughness: 0.2,
  });

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.88, 48), redHull);
  fuselage.position.y = 0.54;
  rocket.add(fuselage);

  const midStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.268, 0.275, 0.22, 48), pearlBand);
  midStripe.position.y = 0.54;
  rocket.add(midStripe);

  const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.245, 0.46, 48), goldNose);
  noseCone.position.y = 1.21;
  rocket.add(noseCone);

  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 24, 18), goldNose);
  noseTip.position.y = 1.44;
  rocket.add(noseTip);

  const portholeRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.105, 0.024, 20, 36),
    hdMat(THREE, '#adb5bd', { metalness: 0.75, roughness: 0.2 })
  );
  portholeRim.position.set(0, 0.68, 0.25);
  rocket.add(portholeRim);

  const portholeGlass = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 28, 22),
    hdMat(THREE, '#74c0fc', { emissive: '#339af0', emissiveIntensity: 0.75, roughness: 0.08 })
  );
  portholeGlass.scale.set(1, 1, 0.45);
  portholeGlass.position.set(0, 0.68, 0.245);
  rocket.add(portholeGlass);

  for (let i = 0; i < 4; i++) {
    const finGroup = new THREE.Group();
    finGroup.rotation.y = (i / 4) * TAU;
    const finCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.24, 0.42, 0),
      new THREE.Vector3(0.38, 0.24, 0),
      new THREE.Vector3(0.42, 0.05, 0),
    ]);
    const finMesh = new THREE.Mesh(new THREE.TubeGeometry(finCurve, 24, 0.048, 16, false), redHull);
    finMesh.scale.set(1.0, 1.0, 0.42);
    finGroup.add(finMesh);
    rocket.add(finGroup);
  }

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.2, 0.16, 36),
    hdMat(THREE, '#343a40', { metalness: 0.7, roughness: 0.3 })
  );
  nozzle.position.y = 0.06;
  rocket.add(nozzle);

  const flame = new THREE.Group();
  flame.visible = false;

  const outerPlume = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.72, 36),
    hdMat(THREE, '#ff922b', {
      emissive: '#f76707',
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.82,
    })
  );
  outerPlume.rotation.x = Math.PI;
  outerPlume.position.y = -0.34;
  flame.add(outerPlume);

  const innerCorePlume = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.48, 32),
    hdMat(THREE, '#fff3bf', {
      emissive: '#ffd43b',
      emissiveIntensity: 1.0,
    })
  );
  innerCorePlume.rotation.x = Math.PI;
  innerCorePlume.position.y = -0.22;
  flame.add(innerCorePlume);

  const shockRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.028, 16, 36),
    hdMat(THREE, '#ffd43b', { emissive: '#ff922b', emissiveIntensity: 0.9, transparent: true, opacity: 0.75 })
  );
  shockRing.rotation.x = Math.PI / 2;
  shockRing.position.y = -0.18;
  flame.add(shockRing);

  outerPlume.onBeforeRender = () => {
    const now = performance.now() * 0.001;
    flame.scale.y = 0.9 + Math.sin(now * 28) * 0.18;
    shockRing.scale.setScalar(0.9 + Math.cos(now * 22) * 0.15);
  };

  rocket.add(flame);
  return { padGroup, rocket, flame };
}

/** Smooth Rolling Storybook Hill for the 10s Opening */
export function buildHighResStorybookHill(THREE = window.THREE) {
  const hillGroup = new THREE.Group();

  const mainHill = new THREE.Mesh(
    new THREE.SphereGeometry(5.2, 64, 48),
    hdMat(THREE, '#40c057', { roughness: 0.72 })
  );
  mainHill.scale.set(1.65, 0.28, 1.15);
  mainHill.position.set(1.0, -1.42, -0.2);
  mainHill.receiveShadow = true;
  hillGroup.add(mainHill);

  const valleyMeadow = new THREE.Mesh(
    new THREE.SphereGeometry(12.5, 64, 48),
    hdMat(THREE, '#37b24d', { roughness: 0.76 })
  );
  valleyMeadow.scale.set(1.55, 0.12, 1.15);
  valleyMeadow.position.set(1.2, -1.45, 5.2);
  valleyMeadow.receiveShadow = true;
  hillGroup.add(valleyMeadow);

  const treeCoords = [
    [-3.2, -0.1, -1.4, 1.05],
    [-2.4, -0.08, 0.9, 0.88],
    [4.4, -0.12, -1.1, 1.12],
    [3.6, -0.1, 1.2, 0.92],
  ];
  for (const [tx, ty, tz, ts] of treeCoords) {
    const tr = new THREE.Group();
    tr.position.set(tx, ty, tz);
    tr.scale.setScalar(ts);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.16, 0.55, 24),
      hdMat(THREE, '#8c5a32', { roughness: 0.78 })
    );
    trunk.position.y = 0.25;
    tr.add(trunk);
    for (let layer = 0; layer < 3; layer++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.54 - layer * 0.11, 0.62 - layer * 0.08, 32),
        hdMat(THREE, layer % 2 === 0 ? '#37b24d' : '#51cf66', { roughness: 0.65 })
      );
      cone.position.y = 0.68 + layer * 0.36;
      tr.add(cone);
    }
    hillGroup.add(tr);
  }

  return hillGroup;
}

/** Smooth Non-Blocky Plush Critter Cameo for Phase 3 (6.8s - 10.0s) */
export function buildHighResCameoCritter(def, THREE = window.THREE) {
  const g = new THREE.Group();
  const c = def?.color || '#f59f00';
  const ac = def?.accent || '#fff3bf';

  const bodyMat = hdMat(THREE, c, { roughness: 0.52 });
  const accentMat = hdMat(THREE, ac, { roughness: 0.48, emissive: ac, emissiveIntensity: 0.22 });
  const eyeMat = hdMat(THREE, '#1a1426', { roughness: 0.15 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.18, 36), accentMat);
  base.position.y = 0.09;
  g.add(base);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.22, 16, 28), bodyMat);
  torso.position.y = 0.42;
  g.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 36, 28), bodyMat);
  head.position.y = 0.82;
  g.add(head);

  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 24), bodyMat);
    ear.position.set(side * 0.18, 1.08, 0);
    ear.rotation.z = -side * 0.25;
    g.add(ear);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 20, 16), eyeMat);
    eye.position.set(side * 0.1, 0.85, 0.25);
    g.add(eye);
  }

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.018, 16, 32, Math.PI),
    eyeMat
  );
  smile.position.set(0, 0.78, 0.26);
  smile.rotation.x = Math.PI;
  g.add(smile);

  return g;
}

/** Smooth Non-Blocky Storybook Zombie Cameo for Phase 3 (6.8s - 10.0s) */
export function buildHighResCameoZombie(def, THREE = window.THREE) {
  const g = new THREE.Group();
  const s = def?.scale || 1.0;
  g.scale.setScalar(s);

  const skinMat = hdMat(THREE, def?.skinColor || '#69db7c', { roughness: 0.58 });
  const shirtMat = hdMat(THREE, def?.shirtColor || '#22b8cf', { roughness: 0.62 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.28, 16, 28), shirtMat);
  torso.position.y = 0.56;
  g.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 36, 28), skinMat);
  head.position.y = 1.02;
  g.add(head);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.24, 14, 24), hdMat(THREE, '#364fc7'));
    leg.position.set(side * 0.11, 0.2, 0);
    g.add(leg);

    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.26, 14, 24), skinMat);
    arm.position.set(-0.2, 0.68, side * 0.22);
    arm.rotation.z = Math.PI / 2;
    g.add(arm);
  }

  if (def?.id === 'balloon') {
    const balloon = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 36, 28),
      hdMat(THREE, '#f03e3e', { emissive: '#e03131', emissiveIntensity: 0.45 })
    );
    balloon.scale.set(1, 1.18, 1);
    balloon.position.y = 1.82;
    g.add(balloon);
  }

  return g;
}

/** Complete High-Res Cutscene Rig */
export function buildHighResCutsceneRig(THREE = window.THREE) {
  const root = new THREE.Group();

  const hillGroup = buildHighResStorybookHill(THREE);
  root.add(hillGroup);

  const cute = buildHighResCuteCatNap(THREE);
  root.add(cute);

  const { night, smokeGroup } = buildHighResNightmareCatNap(THREE);
  root.add(night);

  const { padGroup, rocket, flame } = buildHighResRocket(THREE);
  root.add(padGroup);
  root.add(rocket);

  // 24 Smooth 3D Star-Shard Crystals (OctahedronGeometry + ConeGeometry)
  const shardGroup = new THREE.Group();
  shardGroup.position.set(2.6, 4.7, -0.2);
  shardGroup.visible = false;
  const shards = [];
  for (let i = 0; i < 24; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / 24);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const isGold = i % 2 === 0;
    const shardMesh = new THREE.Mesh(
      i % 3 === 0 ? new THREE.OctahedronGeometry(0.22, 1) : new THREE.ConeGeometry(0.14, 0.38, 24),
      hdMat(THREE, isGold ? '#ffd43b' : '#b197fc', {
        emissive: isGold ? '#fcc419' : '#7950f2',
        emissiveIntensity: 0.92,
        roughness: 0.18,
      })
    );
    shardGroup.add(shardMesh);
    shards.push({
      mesh: shardMesh,
      vx: Math.sin(phi) * Math.cos(theta) * 2.8,
      vy: Math.cos(phi) * 2.4 + 0.8,
      vz: Math.sin(phi) * Math.sin(theta) * 2.8,
    });
  }
  root.add(shardGroup);

  let burstStartMs = 0;
  const driverMesh = night.children[0];
  if (driverMesh) {
    driverMesh.onBeforeRender = () => {
      const now = performance.now() * 0.001;
      const inIntro = document.body.classList.contains('inIntro');
      hillGroup.visible = inIntro;

      if (inIntro && !rocket.visible && !cute.visible) {
        if (!shardGroup.visible) {
          shardGroup.visible = true;
          burstStartMs = performance.now();
        }
        const elapsed = clamp((performance.now() - burstStartMs) / 1000, 0, 3.5);
        for (let i = 0; i < shards.length; i++) {
          const sh = shards[i];
          sh.mesh.position.set(
            sh.vx * elapsed,
            sh.vy * elapsed - 1.6 * elapsed * elapsed,
            sh.vz * elapsed
          );
          sh.mesh.rotation.x = now * 3 + i;
          sh.mesh.rotation.y = now * 4 + i;
          const fade = clamp(1 - elapsed / 2.8, 0.01, 1);
          sh.mesh.scale.setScalar(fade);
        }
      } else {
        shardGroup.visible = false;
        burstStartMs = 0;
      }
    };
  }

  root.userData = {
    cute,
    night,
    smokeGroup,
    rocket,
    flame,
    hillGroup,
    shardGroup,
    shards,
  };
  return root;
}

export const buildHighResCutsceneWorld = buildHighResCutsceneRig;

// ============================================================================
// 60 FPS FULL-SCREEN HIGH-RESOLUTION 2.5D PIXAR/STORYBOOK OPENING MOVIE ENGINE
// ============================================================================
const movieState = {
  canvas: null,
  ctx: null,
  images: [],
  loaded: [false, false, false, false],
  critterPortraits: {},
  fireflies: [],
  smokePuffs: [],
  shards: [],
  rocketTrail: []
};

export function initIntroMovieCanvas() {
  const canvas = document.getElementById('introMovieCanvas');
  if (!canvas) return;
  movieState.canvas = canvas;
  movieState.ctx = canvas.getContext('2d');

  const urls = [
    'assets/intro/act1.jpg',
    'assets/intro/act2.jpg',
    'assets/intro/act3.jpg',
    'assets/intro/act4.jpg'
  ];
  movieState.images = urls.map((u, idx) => {
    const img = new Image();
    img.onload = () => {
      movieState.loaded[idx] = true;
    };
    img.src = u;
    return img;
  });

  const portraitMap = {
    SunnyFox: 'icons/sunnyfox.jpg',
    PoppyDash: 'icons/poppydash.jpg',
    PickyPiggy: 'icons/picky.jpg',
    DogDay: 'icons/dogday.jpg',
    CraftyCorn: 'icons/craftycorn.jpg',
    BobbyBear: 'icons/bobby.jpg'
  };
  for (const [k, src] of Object.entries(portraitMap)) {
    const pImg = new Image();
    pImg.src = src;
    movieState.critterPortraits[k] = pImg;
  }

  // Pre-seed 36 glowing fireflies / starlight motes
  movieState.fireflies = Array.from({ length: 36 }, (_, i) => ({
    x: (i * 0.173) % 1,
    y: 0.15 + ((i * 0.29) % 0.78),
    r: 2.2 + (i % 4) * 1.3,
    speedX: (i % 2 === 0 ? 1 : -1) * (0.015 + (i % 5) * 0.004),
    speedY: -0.012 - (i % 4) * 0.004,
    phase: i * 0.7,
    hue: i % 3 === 0 ? '#a9e34b' : (i % 3 === 1 ? '#ffe066' : '#74c0fc')
  }));

  // Pre-seed 28 crimson poppy-gas smoke puffs for Act 2
  movieState.smokePuffs = Array.from({ length: 28 }, (_, i) => ({
    x: 0.18 + ((i * 0.09) % 0.48),
    y: 0.45 + ((i * 0.13) % 0.52),
    r: 36 + (i % 5) * 20,
    phase: i * 0.5
  }));

  // Pre-seed 44 golden moon shards for Act 3 & Act 4
  movieState.shards = Array.from({ length: 44 }, (_, i) => {
    const ang = (i / 44) * TAU + (i % 3) * 0.12;
    const spd = 0.22 + (i % 7) * 0.065;
    return {
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd * 0.78 + 0.12,
      size: 7 + (i % 4) * 4.5,
      rotSpeed: (i % 2 === 0 ? 1 : -1) * (2.5 + (i % 4)),
      isCrescent: i % 3 === 0
    };
  });
}

function drawCoverImage(ctx, img, w, h, zoom = 1.0, panX = 0, panY = 0, shakeX = 0, shakeY = 0, alpha = 1.0) {
  if (!img || !img.complete || !img.naturalWidth) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const baseScale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * baseScale;
  const dh = ih * baseScale;
  const dx = (w - dw) * 0.5 + panX * w + shakeX;
  const dy = (h - dh) * 0.5 + panY * h + shakeY;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawLightningBolt(ctx, x1, y1, x2, y2, color, width, seed) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowColor = '#da77f2';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const segs = 7;
  for (let i = 1; i < segs; i++) {
    const f = i / segs;
    const jitter = Math.sin(seed * 13.7 + i * 5.3) * 28;
    ctx.lineTo(x1 + (x2 - x1) * f + jitter, y1 + (y2 - y1) * f + jitter * 0.4);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function renderIntroMovieFrame(t) {
  if (!movieState.canvas) initIntroMovieCanvas();
  const { canvas, ctx, images } = movieState;
  if (!canvas || !ctx) return;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d0822';
  ctx.fillRect(0, 0, w, h);

  // --------------------------------------------------------------------------
  // ACT 1 (0.0s - 2.5s): Cute CatNap on Moonlit Firefly Hilltop -> Storm Brews
  // --------------------------------------------------------------------------
  if (t < 2.65) {
    const p = clamp(t / 2.5, 0, 1);
    const zoom = 1.02 + p * 0.08;
    const panX = -0.015 + p * 0.025;
    const panY = 0.01 - p * 0.02;
    drawCoverImage(ctx, images[0], w, h, zoom, panX, panY, 0, 0, 1.0);

    // Pulsing Golden Moon Corona in upper right
    const moonX = w * 0.655;
    const moonY = h * 0.285;
    const pulseR = Math.min(w, h) * (0.24 + Math.sin(t * 3.8) * 0.02);
    const mg = ctx.createRadialGradient(moonX, moonY, pulseR * 0.15, moonX, moonY, pulseR);
    mg.addColorStop(0, 'rgba(255, 249, 219, 0.35)');
    mg.addColorStop(0.5, 'rgba(255, 212, 59, 0.16)');
    mg.addColorStop(1, 'rgba(255, 212, 59, 0)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(moonX, moonY, pulseR, 0, TAU);
    ctx.fill();

    // Animated Fireflies drifting around Cute CatNap
    for (const ff of movieState.fireflies) {
      const fx = ((ff.x + ff.speedX * t + 1) % 1) * w;
      const fy = ((ff.y + ff.speedY * t + 1) % 1) * h;
      const glow = 0.45 + 0.55 * Math.sin(t * 5.2 + ff.phase);
      ctx.save();
      ctx.globalAlpha = glow;
      ctx.fillStyle = ff.hue;
      ctx.shadowColor = ff.hue;
      ctx.shadowBlur = 14 * dpr;
      ctx.beginPath();
      ctx.arc(fx, fy, ff.r * dpr, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // At t = 1.95s..2.65s: Crimson Poppy Smoke & Purple Transformation Cross-Dissolve!
    if (t > 1.95) {
      const tp = clamp((t - 1.95) / 0.70, 0, 1);
      drawCoverImage(ctx, images[1], w, h, 1.06, 0, 0, Math.sin(t * 42) * 5 * dpr * tp, Math.cos(t * 48) * 5 * dpr * tp, tp);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const flashG = ctx.createRadialGradient(w * 0.36, h * 0.44, 10, w * 0.36, h * 0.44, w * 0.42);
      flashG.addColorStop(0, `rgba(229, 153, 247, ${tp * 0.48})`);
      flashG.addColorStop(0.5, `rgba(224, 49, 49, ${tp * 0.28})`);
      flashG.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flashG;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }
  // --------------------------------------------------------------------------
  // ACT 2 (2.65s - 5.25s): Nightmare CatNap Launches Rocket at the Full Moon!
  // --------------------------------------------------------------------------
  else if (t < 5.25) {
    const p = clamp((t - 2.65) / 2.6, 0, 1);
    const shake = (t > 3.2 ? 5.5 : 2.2) * dpr;
    const sx = Math.sin(t * 44) * shake;
    const sy = Math.cos(t * 51) * shake;
    drawCoverImage(ctx, images[1], w, h, 1.02 + p * 0.08, -p * 0.018, p * 0.012, sx, sy, 1.0);

    // Animated Swirling Crimson Poppy-Gas Smoke Clouds (soft radial screen blend)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const sp of movieState.smokePuffs) {
      const px = (sp.x + Math.sin(t * 1.8 + sp.phase) * 0.03) * w;
      const py = (sp.y - ((t - 2.65) * 0.06 + sp.phase * 0.04) % 0.28) * h;
      const rad = sp.r * dpr * (0.9 + 0.2 * Math.sin(t * 3 + sp.phase));
      const sg = ctx.createRadialGradient(px, py, rad * 0.1, px, py, rad);
      sg.addColorStop(0, 'rgba(255, 107, 107, 0.22)');
      sg.addColorStop(0.6, 'rgba(190, 75, 219, 0.10)');
      sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, TAU);
      ctx.fill();
    }

    // Dynamic Muzzle & Rocket Exhaust Bloom traveling along the rocket path
    const rp = clamp((t - 2.85) / 2.2, 0, 1);
    const flareX = w * (0.54 + rp * 0.26);
    const flareY = h * (0.37 - rp * 0.20);
    const flareR = Math.min(w, h) * (0.18 + 0.04 * Math.sin(t * 28));
    const fg = ctx.createRadialGradient(flareX, flareY, flareR * 0.05, flareX, flareY, flareR);
    fg.addColorStop(0, 'rgba(255, 249, 219, 0.68)');
    fg.addColorStop(0.35, 'rgba(255, 146, 43, 0.36)');
    fg.addColorStop(0.7, 'rgba(240, 62, 62, 0.14)');
    fg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(flareX, flareY, flareR, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Pre-impact lunar flash at t = 4.95s..5.25s
    if (t > 4.95) {
      const fp = clamp((t - 4.95) / 0.30, 0, 1);
      drawCoverImage(ctx, images[2], w, h, 1.0, 0, 0, 0, 0, fp * 0.65);
      ctx.fillStyle = `rgba(255, 249, 219, ${fp * 0.65})`;
      ctx.fillRect(0, 0, w, h);
    }
  }
  // --------------------------------------------------------------------------
  // ACT 3 (5.25s - 7.55s): The Moon Shatters in a Golden Cosmic Shockwave!
  // --------------------------------------------------------------------------
  else if (t < 7.55) {
    const elapsed = t - 5.25;
    const p = clamp(elapsed / 2.3, 0, 1);
    const shake = Math.max(0, (1 - p * 1.2) * 10 * dpr);
    const sx = Math.sin(t * 55) * shake;
    const sy = Math.cos(t * 50) * shake;

    drawCoverImage(ctx, images[2], w, h, 1.0 + p * 0.10, 0, p * 0.018, sx, sy, 1.0);

    // Soft Additive Solar/Lunar Core Bloom & Drifting Sparkles
    const cx = w * 0.50;
    const cy = h * 0.38;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const coreR = Math.min(w, h) * (0.32 + p * 0.18);
    const cg = ctx.createRadialGradient(cx, cy, coreR * 0.05, cx, cy, coreR);
    cg.addColorStop(0, `rgba(255, 255, 240, ${0.55 * (1 - p * 0.4)})`);
    cg.addColorStop(0.4, `rgba(255, 212, 59, ${0.28 * (1 - p * 0.3)})`);
    cg.addColorStop(0.75, `rgba(218, 119, 242, ${0.14 * (1 - p * 0.2)})`);
    cg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, w, h);

    // Subtle glowing star-dust motes radiating outward
    for (let i = 0; i < 28; i++) {
      const sh = movieState.shards[i];
      const sxPos = cx + sh.vx * elapsed * w * 0.48;
      const syPos = cy + (sh.vy * elapsed + 0.09 * elapsed * elapsed) * h * 0.48;
      const moteR = (2.2 + (i % 3) * 1.4) * dpr;
      const mg = ctx.createRadialGradient(sxPos, syPos, 0, sxPos, syPos, moteR * 3.2);
      mg.addColorStop(0, 'rgba(255, 249, 219, 0.92)');
      mg.addColorStop(0.4, 'rgba(255, 212, 59, 0.45)');
      mg.addColorStop(1, 'rgba(255, 212, 59, 0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(sxPos, syPos, moteR * 3.2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Impact flash fade-out at start of Act 3
    if (elapsed < 0.30) {
      ctx.fillStyle = `rgba(255, 249, 219, ${(1 - elapsed / 0.30) * 0.65})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Smooth cross-dissolve into Act 4 at t = 7.10s..7.55s
    if (t > 7.10) {
      const dp = clamp((t - 7.10) / 0.45, 0, 1);
      drawCoverImage(ctx, images[3], w, h, 1.02, 0, 0, 0, 0, dp);
    }
  }
  // --------------------------------------------------------------------------
  // ACT 4 (7.55s - 10.0s): Zombies Emerge & Smiling Critters Squad Charges In!
  // --------------------------------------------------------------------------
  else {
    const elapsed = t - 7.55;
    const p = clamp(elapsed / 2.45, 0, 1);
    drawCoverImage(ctx, images[3], w, h, 1.02 + p * 0.07, p * 0.015, -p * 0.01, 0, 0, 1.0);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    // Glowing Golden Hero Aura around the Smiling Critters on the left
    const heroGlow = ctx.createRadialGradient(w * 0.28, h * 0.56, 20, w * 0.28, h * 0.56, w * 0.28);
    heroGlow.addColorStop(0, `rgba(255, 212, 59, ${0.22 + Math.sin(t * 5) * 0.06})`);
    heroGlow.addColorStop(1, 'rgba(255, 212, 59, 0)');
    ctx.fillStyle = heroGlow;
    ctx.fillRect(0, 0, w, h);

    // Pulsing Purple Zombie Portal Glow on the bottom right
    const portalGlow = ctx.createRadialGradient(w * 0.80, h * 0.78, 15, w * 0.80, h * 0.78, w * 0.24);
    portalGlow.addColorStop(0, `rgba(218, 119, 242, ${0.26 + Math.cos(t * 6) * 0.08})`);
    portalGlow.addColorStop(1, 'rgba(121, 80, 242, 0)');
    ctx.fillStyle = portalGlow;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// ============================================================================
// 6.0-SECOND STAGE-CLEAR VICTORY MOVIE: CRITTERS REPAIRING THE MOON (萌宠补月动画)
// ============================================================================
export function renderVictoryMovieFrame(t, stageIndex = 0) {
  if (!movieState.canvas) initIntroMovieCanvas();
  const { canvas, ctx, images } = movieState;
  if (!canvas || !ctx) return;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  const pTotal = clamp(t / 6.0, 0, 1);
  const pGather = clamp(t / 2.0, 0, 1);
  const pWeld = clamp((t - 1.5) / 2.6, 0, 1);
  const pCeleb = clamp((t - 4.0) / 2.0, 0, 1);

  // 1. Sky Backdrop: transitions from deep night to warm golden-starlight dawn as the Moon is healed
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  if (pWeld < 1) {
    skyGrad.addColorStop(0, '#120b2e');
    skyGrad.addColorStop(0.55, '#251854');
    skyGrad.addColorStop(1, '#3b256e');
  } else {
    skyGrad.addColorStop(0, '#18285c');
    skyGrad.addColorStop(0.52, '#304c89');
    skyGrad.addColorStop(1, '#5e4b8b');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle blended storybook background from Act 1 hilltop
  if (images[0] && images[0].complete) {
    drawCoverImage(ctx, images[0], w, h, 1.04 + pTotal * 0.04, 0, 0.02, 0, 0, 0.28 + pCeleb * 0.22);
  }

  // Twinkling starfield
  for (let i = 0; i < 42; i++) {
    const sx = ((i * 0.193 + 0.07) % 1) * w;
    const sy = ((i * 0.137 + 0.03) % 0.62) * h;
    const tw = 0.4 + 0.6 * Math.sin(t * 5.0 + i * 1.3);
    ctx.fillStyle = i % 3 === 0 ? '#fff9db' : '#ffd43b';
    ctx.globalAlpha = tw * 0.85;
    ctx.beginPath();
    ctx.arc(sx, sy, (1.5 + (i % 3) * 0.9) * dpr, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  const moonCx = w * 0.5;
  const moonCy = h * 0.31;
  const moonR = Math.min(w, h) * 0.155;

  // 2. Cozy Green Storybook Hilltop Silhouette at Bottom
  ctx.save();
  const hillGrad = ctx.createLinearGradient(0, h * 0.66, 0, h);
  hillGrad.addColorStop(0, '#51cf66');
  hillGrad.addColorStop(0.45, '#37b24d');
  hillGrad.addColorStop(1, '#2b8a3e');
  ctx.fillStyle = hillGrad;
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.96, w * 0.68, h * 0.27, 0, Math.PI, TAU);
  ctx.fill();
  ctx.restore();

  // 3. Six Hero Critters on the Hilltop Channeling Repair Beams to the Moon!
  const critterRoster = [
    { name: 'SunnyFox', emoji: '🦊', color: '#ffd43b', beam: '#ffe066', xFrac: 0.20, yFrac: 0.76 },
    { name: 'PoppyDash', emoji: '🦨', color: '#51cf66', beam: '#8ce99a', xFrac: 0.32, yFrac: 0.72 },
    { name: 'PickyPiggy', emoji: '🐷', color: '#ff8787', beam: '#ffc9c9', xFrac: 0.44, yFrac: 0.70 },
    { name: 'DogDay', emoji: '🐶', color: '#ff922b', beam: '#ffd8a8', xFrac: 0.56, yFrac: 0.70 },
    { name: 'CraftyCorn', emoji: '🦄', color: '#da77f2', beam: '#eebefa', xFrac: 0.68, yFrac: 0.72 },
    { name: 'BobbyBear', emoji: '🐻', color: '#74c0fc', beam: '#a5d8ff', xFrac: 0.80, yFrac: 0.76 }
  ];

  // Draw Starlight Welding Beams from each Critter to the Moon during t = 0.4s .. 4.6s
  if (t >= 0.35 && t <= 4.85) {
    const beamAlpha = t < 1.0 ? (t - 0.35) / 0.65 : (t > 4.2 ? 1 - (t - 4.2) / 0.65 : 1.0);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < critterRoster.length; i++) {
      const c = critterRoster[i];
      const cx = w * c.xFrac;
      const cy = h * c.yFrac - Math.abs(Math.sin(t * 6 + i)) * 12 * dpr;
      const targetX = moonCx + Math.cos(i * 1.05 + t * 2.2) * moonR * 0.38 * (1 - pWeld * 0.7);
      const targetY = moonCy + Math.sin(i * 1.05 + t * 2.2) * moonR * 0.38 * (1 - pWeld * 0.7);

      ctx.strokeStyle = c.beam;
      ctx.lineWidth = (5.5 + Math.sin(t * 14 + i) * 2.0) * dpr;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 18 * dpr;
      ctx.globalAlpha = clamp(beamAlpha, 0, 1) * 0.85;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 18 * dpr);
      const ctrlX = (cx + targetX) * 0.5 + Math.sin(t * 5 + i) * 26 * dpr;
      const ctrlY = (cy + targetY) * 0.5 - 35 * dpr;
      ctx.quadraticCurveTo(ctrlX, ctrlY, targetX, targetY);
      ctx.stroke();

      // Traveling golden starlight shards along the beam
      for (let s = 0; s < 3; s++) {
        const u = ((t * 1.35 + s * 0.33 + i * 0.15) % 1);
        const bx = (1 - u) * (1 - u) * cx + 2 * (1 - u) * u * ctrlX + u * u * targetX;
        const by = (1 - u) * (1 - u) * (cy - 18 * dpr) + 2 * (1 - u) * u * ctrlY + u * u * targetY;
        ctx.fillStyle = '#fff9db';
        ctx.beginPath();
        ctx.arc(bx, by, 4.5 * dpr, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 4. The Shattered Moon Fragments Re-Assembling & Welding into a Smiling Full Golden Moon!
  ctx.save();
  // Outer Golden Lunar Halo (grows as Moon is repaired)
  const haloR = moonR * (1.55 + pWeld * 0.85 + Math.sin(t * 4) * 0.06);
  const haloGrad = ctx.createRadialGradient(moonCx, moonCy, moonR * 0.25, moonCx, moonCy, haloR);
  haloGrad.addColorStop(0, `rgba(255, 249, 219, ${0.45 + pWeld * 0.35})`);
  haloGrad.addColorStop(0.5, `rgba(255, 212, 59, ${0.22 + pWeld * 0.22})`);
  haloGrad.addColorStop(1, 'rgba(255, 212, 59, 0)');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(moonCx, moonCy, haloR, 0, TAU);
  ctx.fill();

  // 6 Wedge Sectors of the Moon that converge from scattered positions to (0, 0) as pWeld -> 1.0!
  const easeWeld = pWeld < 0.5 ? 4 * pWeld * pWeld * pWeld : 1 - Math.pow(-2 * pWeld + 2, 3) / 2;
  const sepDist = (1 - easeWeld) * moonR * 0.95;
  const sectors = 6;
  for (let s = 0; s < sectors; s++) {
    const a0 = (s / sectors) * TAU;
    const a1 = ((s + 1) / sectors) * TAU + 0.03;
    const midA = (a0 + a1) * 0.5;
    const ox = Math.cos(midA) * sepDist;
    const oy = Math.sin(midA) * sepDist;
    const rotJitter = (1 - easeWeld) * Math.sin(s * 2.1) * 0.24;

    ctx.save();
    ctx.translate(moonCx + ox, moonCy + oy);
    ctx.rotate(rotJitter);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, moonR, a0, a1);
    ctx.closePath();

    const mGrad = ctx.createRadialGradient(-moonR * 0.25, -moonR * 0.25, moonR * 0.1, 0, 0, moonR);
    mGrad.addColorStop(0, '#fff9db');
    mGrad.addColorStop(0.55, '#ffe066');
    mGrad.addColorStop(1, '#f59f00');
    ctx.fillStyle = mGrad;
    ctx.fill();

    if (pWeld < 0.96) {
      ctx.strokeStyle = '#fff3bf';
      ctx.lineWidth = 2.5 * dpr;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Golden Welding Seam Glow while fragments lock together (t = 1.5s .. 4.1s)
  if (pWeld > 0.05 && pWeld < 0.98) {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#ffd43b';
    ctx.shadowBlur = 16 * dpr;
    ctx.lineWidth = (1 - Math.abs(pWeld - 0.55) * 1.6) * 5 * dpr;
    for (let s = 0; s < sectors; s++) {
      const ang = (s / sectors) * TAU;
      ctx.beginPath();
      ctx.moveTo(moonCx, moonCy);
      ctx.lineTo(moonCx + Math.cos(ang) * moonR, moonCy + Math.sin(ang) * moonR);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Cute Smiling Face on the Repaired Full Moon once pWeld >= 0.75!
  if (pWeld >= 0.75) {
    const faceAlpha = clamp((pWeld - 0.75) / 0.22, 0, 1);
    ctx.save();
    ctx.globalAlpha = faceAlpha;
    // Rosy Cheeks
    ctx.fillStyle = 'rgba(255, 107, 107, 0.48)';
    ctx.beginPath();
    ctx.ellipse(moonCx - moonR * 0.42, moonCy + moonR * 0.10, moonR * 0.14, moonR * 0.09, 0, 0, TAU);
    ctx.ellipse(moonCx + moonR * 0.42, moonCy + moonR * 0.10, moonR * 0.14, moonR * 0.09, 0, 0, TAU);
    ctx.fill();

    // Happy Curved Eyes (^ ^)
    ctx.strokeStyle = '#5a3821';
    ctx.lineWidth = 5 * dpr;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(moonCx + side * moonR * 0.30, moonCy - moonR * 0.08, moonR * 0.13, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }

    // Warm Joyful Smile
    ctx.beginPath();
    ctx.arc(moonCx, moonCy + moonR * 0.06, moonR * 0.26, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // 5. Draw the 6 Critters Cheering & Jumping on the Hilltop (with Circular Plush Portraits!)
  for (let i = 0; i < critterRoster.length; i++) {
    const c = critterRoster[i];
    const bounce = Math.abs(Math.sin(t * (pCeleb > 0 ? 9.5 : 5.5) + i * 0.9)) * (pCeleb > 0 ? 24 : 10) * dpr;
    const cx = w * c.xFrac;
    const cy = h * c.yFrac - bounce;
    const rad = 32 * dpr;

    ctx.save();
    // Glowing character medallion body
    ctx.fillStyle = c.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4 * dpr;
    ctx.shadowColor = c.color;
    ctx.shadowBlur = 16 * dpr;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Circular clipped portrait image (or emoji fallback)
    const pImg = movieState.critterPortraits?.[c.name];
    if (pImg && pImg.complete && pImg.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rad - 3 * dpr, 0, TAU);
      ctx.clip();
      ctx.shadowBlur = 0;
      ctx.drawImage(pImg, cx - rad, cy - rad, rad * 2, rad * 2);
      ctx.restore();
    } else {
      ctx.shadowBlur = 0;
      ctx.font = `${Math.round(28 * dpr)}px "Fredoka", "Nunito", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.emoji, cx, cy + 2 * dpr);
    }

    // Little wrench/hammer/star above each Critter
    const toolIco = pCeleb > 0 ? '🎉' : (i % 2 === 0 ? '🔨' : '✨');
    ctx.shadowBlur = 0;
    ctx.font = `${Math.round(20 * dpr)}px "Fredoka", "Nunito", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(toolIco, cx + rad * 0.78, cy - rad * 0.82);
    ctx.restore();
  }

  // 6. Celebration Fireworks & Bilingual Caption Banner (t >= 3.8s)
  if (t >= 3.8) {
    const fwColors = ['#ffd43b', '#ff6b6b', '#69db7c', '#74c0fc', '#da77f2'];
    for (let f = 0; f < 5; f++) {
      const fwStart = 3.8 + f * 0.35;
      if (t < fwStart) continue;
      const fp = clamp((t - fwStart) / 1.1, 0, 1);
      const fx = w * (0.16 + f * 0.17);
      const fy = h * (0.22 + (f % 2) * 0.14);
      const col = fwColors[f % fwColors.length];
      ctx.save();
      ctx.globalAlpha = 1 - fp * 0.85;
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 12 * dpr;
      for (let sp = 0; sp < 12; sp++) {
        const ang = (sp / 12) * TAU;
        const dist = fp * 72 * dpr;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(ang) * dist, fy + Math.sin(ang) * dist, (4.5 - fp * 2.5) * dpr, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // 7. Bilingual Story Caption Pill at Top of Victory Cutscene
  ctx.save();
  const pillW = Math.min(w * 0.86, 620 * dpr);
  const pillH = 54 * dpr;
  const pillX = (w - pillW) * 0.5;
  const pillY = 24 * dpr;
  ctx.fillStyle = 'rgba(255, 251, 240, 0.94)';
  ctx.strokeStyle = '#fcc419';
  ctx.lineWidth = 3.5 * dpr;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 27 * dpr);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#5a3821';
  ctx.font = `900 ${Math.round(18 * dpr)}px "Fredoka", "Nunito", "PingFang SC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let caption = '🛠️ Critters Gathering Moon Shards · 萌宠收集月之碎片...';
  if (t >= 1.8 && t < 4.1) {
    caption = '✨ Critters Repairing the Moon Together! · 萌宠同心协力修补月亮！';
  } else if (t >= 4.1) {
    caption = `🌕 Stage ${stageIndex + 1} Moon Repaired! · 第 ${stageIndex + 1} 关萌宠补月大成功！`;
  }
  ctx.fillText(caption, w * 0.5, pillY + pillH * 0.5);
  ctx.restore();
}


