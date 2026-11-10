import * as THREE from 'three';
import { DoorSpec } from '../data/corridorData';
import {
  createArchitecturalSignTexture,
  createBulletinBoardTexture,
  createCircularEmblemTexture,
  createDoorHeaderSignTexture,
} from './proceduralTextures';

export interface DoorRig {
  spec: DoorSpec;
  group: THREE.Group;
  hingeGroup: THREE.Group;
  emblemRing: THREE.Mesh;
  emissiveMaterials: THREE.MeshStandardMaterial[];
  hitbox: THREE.Mesh;
  targetOpenAngle: number;
  currentOpenAngle: number;
  isHovered: boolean;
}

/**
 * Shared radial contact shadow texture for grounding corridor props
 */
let _sharedShadowTexture: THREE.CanvasTexture | null = null;
export function getContactShadowTexture(): THREE.CanvasTexture {
  if (_sharedShadowTexture) return _sharedShadowTexture;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(2, 6, 23, 0.55)');
  grad.addColorStop(0.55, 'rgba(2, 6, 23, 0.22)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  _sharedShadowTexture = new THREE.CanvasTexture(canvas);
  return _sharedShadowTexture;
}

/**
 * Builds a complete 12-part interactive Door & Digital Emblem Portal assembly
 * Pivot is at bottom-center (Y = 0) flush with the floor, facing +Z in local space.
 */
export function createEmblematicDoorAssembly(
  spec: DoorSpec,
  maxAnisotropy: number,
  isSoftwareGl: boolean
): DoorRig {
  const group = new THREE.Group();
  group.position.set(spec.position[0], spec.position[1], spec.position[2]);
  group.rotation.y = spec.rotationY;

  const isEcoLab = spec.category === 'eco-lab';
  const doorWidth = isEcoLab ? 1.55 : 1.25;
  const doorHeight = isEcoLab ? 2.45 : 2.25;
  const frameDepth = 0.24;

  const accentColor = new THREE.Color(spec.accentHex);
  const emissiveMaterials: THREE.MeshStandardMaterial[] = [];

  // 1. Dark brushed aluminum architectural door frame (Left, Right, Top jambs)
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.32,
    metalness: 0.78,
  });

  const jambWidth = 0.14;
  const leftJamb = new THREE.Mesh(
    new THREE.BoxGeometry(jambWidth, doorHeight + jambWidth, frameDepth),
    frameMat
  );
  leftJamb.position.set(-doorWidth / 2 - jambWidth / 2, (doorHeight + jambWidth) / 2, 0);
  leftJamb.castShadow = !isSoftwareGl;
  leftJamb.receiveShadow = !isSoftwareGl;
  group.add(leftJamb);

  const rightJamb = new THREE.Mesh(
    new THREE.BoxGeometry(jambWidth, doorHeight + jambWidth, frameDepth),
    frameMat
  );
  rightJamb.position.set(doorWidth / 2 + jambWidth / 2, (doorHeight + jambWidth) / 2, 0);
  rightJamb.castShadow = !isSoftwareGl;
  rightJamb.receiveShadow = !isSoftwareGl;
  group.add(rightJamb);

  const topLintel = new THREE.Mesh(
    new THREE.BoxGeometry(doorWidth + jambWidth * 2 + 0.08, jambWidth * 1.2, frameDepth + 0.04),
    frameMat
  );
  topLintel.position.set(0, doorHeight + jambWidth * 0.6, 0);
  group.add(topLintel);

  // 2. Glowing LED vertical light strips flanking the door entrance
  const glowMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: isEcoLab ? 1.85 : 1.15,
    roughness: 0.2,
    metalness: 0.1,
  });
  emissiveMaterials.push(glowMat);

  const stripGeo = new THREE.CylinderGeometry(0.022, 0.022, doorHeight + 0.05, 12);
  const leftStrip = new THREE.Mesh(stripGeo, glowMat);
  leftStrip.position.set(-doorWidth / 2 - jambWidth - 0.03, doorHeight / 2, frameDepth * 0.45);
  group.add(leftStrip);

  const rightStrip = new THREE.Mesh(stripGeo, glowMat);
  rightStrip.position.set(doorWidth / 2 + jambWidth + 0.03, doorHeight / 2, frameDepth * 0.45);
  group.add(rightStrip);

  // 3. Interior Classroom / Room Diorama visible when door opens or through glass window
  const alcoveDepth = 1.65;
  const alcoveMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.BackSide,
  });
  const alcoveBox = new THREE.Mesh(
    new THREE.BoxGeometry(doorWidth + 0.6, doorHeight + 0.3, alcoveDepth),
    alcoveMat
  );
  alcoveBox.position.set(0, (doorHeight + 0.3) / 2, -alcoveDepth / 2 - 0.02);
  group.add(alcoveBox);

  // Interior backdrop wall illuminated with lab accent color + miniature circular student table (matching blueprint!)
  const interiorBackMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: accentColor,
    emissiveIntensity: 0.28,
    roughness: 0.6,
  });
  const interiorBack = new THREE.Mesh(
    new THREE.PlaneGeometry(doorWidth + 0.4, doorHeight),
    interiorBackMat
  );
  interiorBack.position.set(0, doorHeight / 2, -alcoveDepth + 0.05);
  group.add(interiorBack);

  if (isEcoLab) {
    // Add miniature round collaborative lab table inside the classroom alcove (just like the blueprint!)
    const tableGroup = new THREE.Group();
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.04, 20),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    tableTop.position.y = 0.74;
    const tablePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.18, 0.74, 12),
      frameMat
    );
    tablePedestal.position.y = 0.37;
    tableGroup.add(tableTop, tablePedestal);
    tableGroup.position.set(0, 0, -0.95);
    group.add(tableGroup);
  }

  // 4. Hinged Door Leaf Group (pivots at left edge of door opening)
  const hingeGroup = new THREE.Group();
  hingeGroup.position.set(-doorWidth / 2 + 0.02, 0, 0.04);
  group.add(hingeGroup);

  const leafMat = new THREE.MeshStandardMaterial({
    color: isEcoLab ? 0x1e293b : 0x334155,
    roughness: 0.42,
    metalness: 0.25,
  });
  const doorLeaf = new THREE.Mesh(
    new THREE.BoxGeometry(doorWidth - 0.04, doorHeight - 0.04, 0.065),
    leafMat
  );
  doorLeaf.position.set(doorWidth / 2 - 0.02, doorHeight / 2, 0);
  doorLeaf.castShadow = !isSoftwareGl;
  doorLeaf.receiveShadow = !isSoftwareGl;
  hingeGroup.add(doorLeaf);

  // Decorative color accent panel on door leaf
  const accentPanelMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.35,
    metalness: 0.3,
  });
  const accentStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, doorHeight - 0.24, 0.072),
    accentPanelMat
  );
  accentStripe.position.set(0.22, doorHeight / 2, 0);
  hingeGroup.add(accentStripe);

  // Stainless steel kickplate at bottom of door
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.88,
  });
  const kickplate = new THREE.Mesh(
    new THREE.BoxGeometry(doorWidth - 0.08, 0.26, 0.075),
    chromeMat
  );
  kickplate.position.set(doorWidth / 2 - 0.02, 0.15, 0);
  hingeGroup.add(kickplate);

  // Vision window on upper half of door leaf
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.38,
    roughness: 0.1,
    metalness: 0.1,
  });
  const visionWindow = new THREE.Mesh(
    new THREE.BoxGeometry(doorWidth * 0.46, 0.88, 0.078),
    glassMat
  );
  visionWindow.position.set(doorWidth * 0.56, doorHeight * 0.64, 0);
  hingeGroup.add(visionWindow);

  // Lever Handle Assembly (Escutcheon plate + spindle + ergonomic lever)
  const handleGroup = new THREE.Group();
  handleGroup.position.set(doorWidth - 0.18, 1.05, 0.045);
  const escutcheon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.015), chromeMat);
  const spindle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.06, 12).rotateX(Math.PI / 2),
    chromeMat
  );
  spindle.position.set(0, 0.03, 0.03);
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.024, 0.02), chromeMat);
  lever.position.set(-0.055, 0.03, 0.055);
  handleGroup.add(escutcheon, spindle, lever);
  hingeGroup.add(handleGroup);

  // 5. Luminous Digital Header Signboard above the door
  const signWidth = isEcoLab ? 2.45 : 1.75;
  const signHeight = isEcoLab ? 0.76 : 0.56;
  const signY = doorHeight + jambWidth + signHeight / 2 + 0.08;

  const signCasing = new THREE.Mesh(
    new THREE.BoxGeometry(signWidth + 0.08, signHeight + 0.08, 0.12),
    frameMat
  );
  signCasing.position.set(0, signY, 0.06);
  group.add(signCasing);

  const headerTex = createDoorHeaderSignTexture(spec, maxAnisotropy);
  const signFaceMat = new THREE.MeshStandardMaterial({
    map: headerTex,
    emissiveMap: headerTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.92,
    roughness: 0.2,
    metalness: 0.1,
  });
  const signFace = new THREE.Mesh(new THREE.PlaneGeometry(signWidth, signHeight), signFaceMat);
  signFace.position.set(0, signY, 0.125);
  group.add(signFace);

  // 6. Floating 3D Circular Digital Emblem Medallion crowning the portal
  const medallionRadius = isEcoLab ? 0.42 : 0.26;
  const medallionY = signY + signHeight / 2 + medallionRadius + 0.12;

  const emblemRing = new THREE.Mesh(
    new THREE.TorusGeometry(medallionRadius, 0.032, 16, 48),
    glowMat
  );
  emblemRing.position.set(0, medallionY, 0.14);
  group.add(emblemRing);

  const medallionTex = createCircularEmblemTexture(spec, maxAnisotropy);
  const medallionMat = new THREE.MeshStandardMaterial({
    map: medallionTex,
    emissiveMap: medallionTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.95,
    roughness: 0.18,
    metalness: 0.15,
  });
  const medallionDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(medallionRadius * 0.96, medallionRadius * 0.96, 0.05, 36).rotateX(
      Math.PI / 2
    ),
    medallionMat
  );
  medallionDisc.position.set(0, medallionY, 0.14);
  group.add(medallionDisc);

  // 7. Floor Threshold Glowing Welcome Bar (with polygonOffset to prevent Z-fighting)
  const thresholdMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 1.3,
    roughness: 0.3,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const thresholdBar = new THREE.Mesh(
    new THREE.PlaneGeometry(doorWidth + 0.4, 0.16).rotateX(-Math.PI / 2),
    thresholdMat
  );
  thresholdBar.position.set(0, 0.015, 0.22);
  group.add(thresholdBar);

  // 8. Invisible simplified proxy hitbox for fast raycasting (Layer 1 & default)
  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(signWidth + 0.2, medallionY + medallionRadius, 0.5),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.set(0, (medallionY + medallionRadius) / 2, 0.1);
  hitbox.userData = { doorId: spec.id, doorSpec: spec };
  group.add(hitbox);

  return {
    spec,
    group,
    hingeGroup,
    emblemRing,
    emissiveMaterials,
    hitbox,
    // Keep the 5 emblematic eco-lab doors slightly ajar by default so the glowing interior welcomes the viewer
    targetOpenAngle: isEcoLab ? 0.35 : 0,
    currentOpenAngle: isEcoLab ? 0.35 : 0,
    isHovered: false,
  };
}

/**
 * Builds the Monumental Digital Countdown Chronometer Gantry in the prime focal spot
 * above the 5 Emblematic Lab Doors + a 360° central suspended ceiling repeater.
 */
export function createCentralChronometerGantry(
  chronoTexture: THREE.CanvasTexture
): THREE.Group {
  const group = new THREE.Group();

  const casingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.28,
    metalness: 0.85,
  });
  const chromeStrutMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.22,
    metalness: 0.9,
  });
  const screenMat = new THREE.MeshStandardMaterial({
    map: chronoTexture,
    emissiveMap: chronoTexture,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 1.05,
    roughness: 0.15,
    metalness: 0.05,
  });
  const accentRimMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });

  // ============================================================================
  // A. PRIMARY HERO DIGITAL CHRONOMETER ABOVE THE CENTRAL EMBLEMATIC DOORS
  // Positioned at X = -3.65, Y = 4.52, Z = 0.0 facing +X (tilted slightly down toward viewer)
  // ============================================================================
  const heroBoardGroup = new THREE.Group();
  heroBoardGroup.position.set(-3.55, 4.55, 0.0);
  heroBoardGroup.rotation.y = Math.PI / 2;
  heroBoardGroup.rotation.x = 0.12; // subtle downward ergonomic tilt toward viewer

  const boardW = 5.4;
  const boardH = 1.88;

  const mainCasing = new THREE.Mesh(
    new THREE.BoxGeometry(boardW + 0.22, boardH + 0.22, 0.24),
    casingMat
  );
  heroBoardGroup.add(mainCasing);

  // Outer glowing emerald LED bezel
  const topRim = new THREE.Mesh(new THREE.BoxGeometry(boardW + 0.26, 0.05, 0.26), accentRimMat);
  topRim.position.y = boardH / 2 + 0.11;
  const bottomRim = new THREE.Mesh(new THREE.BoxGeometry(boardW + 0.26, 0.05, 0.26), accentRimMat);
  bottomRim.position.y = -boardH / 2 - 0.11;
  heroBoardGroup.add(topRim, bottomRim);

  // Screen plane
  const heroScreen = new THREE.Mesh(new THREE.PlaneGeometry(boardW, boardH), screenMat);
  heroScreen.position.z = 0.125;
  heroBoardGroup.add(heroScreen);

  // Architectural ceiling suspension struts & wall brackets
  for (const offsetX of [-2.1, 0, 2.1]) {
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 1.1, 12),
      chromeStrutMat
    );
    strut.position.set(offsetX, boardH / 2 + 0.45, -0.05);
    heroBoardGroup.add(strut);
  }

  group.add(heroBoardGroup);

  // ============================================================================
  // B. CENTRAL 360° SUSPENDED CEILING CHRONOMETER HUB (X = 0.4, Y = 4.65, Z = 0.0)
  // Visible when looking North or South down the corridor!
  // ============================================================================
  const ceilingHub = new THREE.Group();
  ceilingHub.position.set(0.4, 4.68, 0.0);

  const hubW = 3.2;
  const hubH = 1.12;
  const hubBox = new THREE.Mesh(
    new THREE.BoxGeometry(hubW + 0.16, hubH + 0.16, 0.36),
    casingMat
  );
  ceilingHub.add(hubBox);

  // South-facing screen (+Z)
  const southScreen = new THREE.Mesh(new THREE.PlaneGeometry(hubW, hubH), screenMat);
  southScreen.position.z = 0.185;
  ceilingHub.add(southScreen);

  // North-facing screen (-Z)
  const northScreen = new THREE.Mesh(new THREE.PlaneGeometry(hubW, hubH), screenMat);
  northScreen.rotation.y = Math.PI;
  northScreen.position.z = -0.185;
  ceilingHub.add(northScreen);

  // East-facing screen (+X, facing the main entrance & Principal's Office)
  const eastCasing = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, hubH + 0.14, 2.6),
    casingMat
  );
  eastCasing.position.x = 0.12;
  const eastScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.5, hubH * 0.92), screenMat);
  eastScreen.rotation.y = Math.PI / 2;
  eastScreen.position.x = 0.265;
  ceilingHub.add(eastCasing, eastScreen);

  // Suspension rods to ceiling
  for (const sx of [-1.2, 1.2]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 10), chromeStrutMat);
    rod.position.set(sx, hubH / 2 + 0.4, 0);
    ceilingHub.add(rod);
  }

  group.add(ceilingHub);

  return group;
}

/**
 * Builds a multi-part Bank of School Lockers (Ντουλάπες Μαθητών)
 * Grounded at Y = 0 with radial contact shadow.
 */
export function createLockerBank(
  position: [number, number, number],
  rotationY: number,
  columns = 6,
  accentHex = '#38bdf8'
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotationY;

  const colW = 0.38;
  const totalW = columns * colW;
  const height = 1.92;
  const depth = 0.48;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.45,
    metalness: 0.65,
  });
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.35,
    metalness: 0.55,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentHex),
    roughness: 0.3,
    metalness: 0.4,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.85,
  });

  // 1. Plinth base
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(totalW + 0.04, 0.1, depth - 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 })
  );
  plinth.position.set(0, 0.05, 0);
  group.add(plinth);

  // 2. Main cabinet carcass
  const carcass = new THREE.Mesh(new THREE.BoxGeometry(totalW, height - 0.1, depth), bodyMat);
  carcass.position.set(0, 0.1 + (height - 0.1) / 2, 0);
  group.add(carcass);

  // 3. Top sloped dust cap
  const topCap = new THREE.Mesh(
    new THREE.BoxGeometry(totalW + 0.04, 0.06, depth + 0.04),
    accentMat
  );
  topCap.position.set(0, height + 0.03, 0);
  group.add(topCap);

  // 4. Individual locker doors (2 tiers per column)
  for (let c = 0; c < columns; c++) {
    const x = -totalW / 2 + colW / 2 + c * colW;
    for (let tier = 0; tier < 2; tier++) {
      const doorH = (height - 0.18) / 2;
      const y = 0.14 + doorH / 2 + tier * (doorH + 0.02);

      const doorPanel = new THREE.Mesh(
        new THREE.BoxGeometry(colW - 0.03, doorH - 0.02, 0.025),
        doorMat
      );
      doorPanel.position.set(x, y, depth / 2 + 0.012);
      group.add(doorPanel);

      // Handle & lock plate
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.11, 0.03), handleMat);
      handle.position.set(x + colW * 0.32, y, depth / 2 + 0.03);
      group.add(handle);

      // Number tag
      const tag = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.03), accentMat);
      tag.position.set(x, y + doorH * 0.34, depth / 2 + 0.025);
      group.add(tag);
    }
  }

  // Contact shadow
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(totalW + 0.5, depth + 0.4).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.45,
    })
  );
  shadowPlane.position.set(0, 0.01, 0);
  group.add(shadowPlane);

  return group;
}

/**
 * Builds a multi-part School Bulletin / Announcement Board (Πίνακας Ανακοινώσεων)
 */
export function createBulletinBoardAssembly(
  position: [number, number, number],
  rotationY: number,
  title: string,
  accentHex: string,
  maxAnisotropy: number
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotationY;

  const boardW = 2.15;
  const boardH = 1.38;

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.28,
    metalness: 0.82,
  });

  // Outer aluminum frame
  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(boardW + 0.1, boardH + 0.1, 0.06),
    frameMat
  );
  group.add(backing);

  // Corkboard & pinned notices face
  const boardTex = createBulletinBoardTexture(title, accentHex, maxAnisotropy);
  const faceMat = new THREE.MeshStandardMaterial({
    map: boardTex,
    roughness: 0.65,
    metalness: 0.05,
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(boardW, boardH), faceMat);
  face.position.z = 0.035;
  group.add(face);

  // Bottom marker tray
  const tray = new THREE.Mesh(new THREE.BoxGeometry(boardW + 0.12, 0.04, 0.14), frameMat);
  tray.position.set(0, -boardH / 2 - 0.04, 0.05);
  group.add(tray);

  // Top gallery LED light bar
  const lightBar = new THREE.Mesh(
    new THREE.BoxGeometry(boardW * 0.7, 0.04, 0.12),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentHex),
      emissive: new THREE.Color(accentHex),
      emissiveIntensity: 1.1,
    })
  );
  lightBar.position.set(0, boardH / 2 + 0.08, 0.06);
  group.add(lightBar);

  return group;
}

/**
 * Builds a 4-stream School Eco-Recycling Station (Κάδοι Διαλογής Απορριμμάτων)
 */
export function createRecyclingStation(
  position: [number, number, number],
  rotationY: number
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotationY;

  const bins = [
    { color: 0x3b82f6, label: 'Χαρτί' },
    { color: 0xf59e0b, label: 'Πλαστικό' },
    { color: 0x06b6d4, label: 'Αλουμίνιο' },
    { color: 0x10b981, label: 'Κομπόστ' },
  ];

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.5,
  });

  bins.forEach((b, idx) => {
    const bx = (idx - 1.5) * 0.44;
    const binBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.76, 0.38), bodyMat);
    binBody.position.set(bx, 0.38, 0);
    group.add(binBody);

    const hoodMat = new THREE.MeshStandardMaterial({
      color: b.color,
      roughness: 0.3,
      metalness: 0.2,
    });
    const binHood = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.18, 16), hoodMat);
    binHood.position.set(bx, 0.85, 0);
    group.add(binHood);

    const frontBand = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.4), hoodMat);
    frontBand.position.set(bx, 0.58, 0);
    group.add(frontBand);
  });

  // Ground contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 0.7).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.45,
    })
  );
  shadow.position.y = 0.01;
  group.add(shadow);

  return group;
}

/**
 * Builds a Corridor Bench + Botanical Planter combo
 */
export function createCorridorBenchAndPlanter(
  position: [number, number, number],
  rotationY: number
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotationY;

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xb47b48,
    roughness: 0.55,
    metalness: 0.05,
  });
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.75,
  });

  // 3 Wooden slats for bench seat
  for (let s = -1; s <= 1; s++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.05, 0.14), woodMat);
    slat.position.set(0, 0.45, s * 0.16);
    group.add(slat);
  }

  // Steel support legs
  for (const lx of [-0.72, 0.72]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.43, 0.46), legMat);
    leg.position.set(lx, 0.215, 0);
    group.add(leg);
  }

  // Sculpted LatheGeometry Planter next to bench
  const planterGroup = new THREE.Group();
  planterGroup.position.set(1.25, 0, 0);

  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.24, 0.0),
    new THREE.Vector2(0.32, 0.35),
    new THREE.Vector2(0.34, 0.62),
    new THREE.Vector2(0.29, 0.65),
    new THREE.Vector2(0.27, 0.58),
  ];
  const potGeo = new THREE.LatheGeometry(points, 24);
  const potMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.1,
  });
  const pot = new THREE.Mesh(potGeo, potMat);
  planterGroup.add(pot);

  // Botanical foliage cluster (multi-part leaves)
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.45,
    metalness: 0.05,
  });
  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    const stem = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.65, 7),
      leafMat
    );
    stem.position.set(Math.cos(angle) * 0.12, 0.85 + (i % 2) * 0.1, Math.sin(angle) * 0.12);
    stem.rotation.z = Math.cos(angle) * 0.28;
    stem.rotation.x = Math.sin(angle) * 0.28;
    planterGroup.add(stem);
  }

  group.add(planterGroup);

  // Contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.9).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.42,
    })
  );
  shadow.position.set(0.3, 0.01, 0);
  group.add(shadow);

  return group;
}

/**
 * Builds the East Staircase to the Upper Floors ("Σκάλες για τους επάνω ορόφους")
 * matching the right-side stairwell in the attached floorplan!
 */
export function createStaircaseToUpperFloors(
  position: [number, number, number],
  maxAnisotropy: number
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  const stepMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.4,
    metalness: 0.15,
  });
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.25,
    metalness: 0.85,
  });

  // 10 ascending steps going East (+X)
  for (let i = 0; i < 10; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18 * (i + 1), 2.6), stepMat);
    step.position.set(0.2 + i * 0.34, (0.18 * (i + 1)) / 2, 0);
    group.add(step);
  }

  // Handrails & balusters
  for (const zSide of [-1.2, 1.2]) {
    const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 10), railMat);
    post1.position.set(0.2, 0.52, zSide);
    const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 10), railMat);
    post2.position.set(3.2, 2.32, zSide);
    group.add(post1, post2);

    const railBar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 3.55, 12), railMat);
    railBar.position.set(1.7, 1.48, zSide);
    railBar.rotation.z = -Math.atan2(3.0, 1.8);
    group.add(railBar);
  }

  // Overhead sign: "Σκάλες για τους επάνω ορόφους"
  const signTex = createArchitecturalSignTexture(
    '“Σκάλες για τους επάνω ορόφους”',
    'ΚΛΙΜΑΚΟΣΤΑΣΙΟ ΑΝΑΤΟΛΙΚΗΣ ΠΤΕΡΥΓΑΣ',
    '#38bdf8',
    maxAnisotropy
  );
  const signBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.7),
    new THREE.MeshStandardMaterial({
      map: signTex,
      emissiveMap: signTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.85,
    })
  );
  signBoard.rotation.y = -Math.PI / 2;
  signBoard.position.set(0.02, 3.25, 0);
  group.add(signBoard);

  return group;
}
