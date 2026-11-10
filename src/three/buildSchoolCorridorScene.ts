import * as THREE from 'three';
import { CORRIDOR_DOORS } from '../data/corridorData';
import {
  createBulletinBoardAssembly,
  createCentralChronometerGantry,
  createCorridorBenchAndPlanter,
  createEmblematicDoorAssembly,
  createLockerBank,
  createRecyclingStation,
  createStaircaseToUpperFloors,
  DoorRig,
} from './corridorProps';
import {
  ChronometerDisplayUpdater,
  createArchitecturalSignTexture,
  createTerrazzoFloorTextures,
} from './proceduralTextures';

export interface CorridorSceneContext {
  doorRigs: DoorRig[];
  hitboxes: THREE.Object3D[];
  chronoUpdater: ChronometerDisplayUpdater;
  dispose: () => void;
}

export function buildSchoolCorridorScene(
  scene: THREE.Scene,
  maxAnisotropy: number,
  isSoftwareGl: boolean
): CorridorSceneContext {
  const disposableGeometries: THREE.BufferGeometry[] = [];
  const disposableMaterials: THREE.Material[] = [];
  const disposableTextures: THREE.Texture[] = [];

  // ============================================================================
  // 1. STUDIO LIGHTING RIG (Warm Key + Cool Hemisphere Fill + Ceiling Point Lights)
  // ============================================================================
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.15);
  hemiLight.position.set(0, 6.0, 0);
  scene.add(hemiLight);

  // Warm sunlight streaming from the East glazed courtyard windows toward the 5 Emblematic Lab Doors
  const sunKeyLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
  sunKeyLight.position.set(9.5, 7.2, 2.5);
  sunKeyLight.target.position.set(-4.5, 1.5, 0);
  sunKeyLight.castShadow = !isSoftwareGl;
  if (!isSoftwareGl) {
    sunKeyLight.shadow.mapSize.width = 2048;
    sunKeyLight.shadow.mapSize.height = 2048;
    sunKeyLight.shadow.camera.near = 0.5;
    sunKeyLight.shadow.camera.far = 28;
    sunKeyLight.shadow.camera.left = -22;
    sunKeyLight.shadow.camera.right = 22;
    sunKeyLight.shadow.camera.top = 10;
    sunKeyLight.shadow.camera.bottom = -10;
    sunKeyLight.shadow.bias = -0.0005;
    sunKeyLight.shadow.normalBias = 0.02;
  }
  scene.add(sunKeyLight);
  scene.add(sunKeyLight.target);

  // Corridor ceiling accent lights along the Z axis
  for (const zPos of [-15.2, -7.6, 0, 7.6, 15.2]) {
    const pt = new THREE.PointLight(0xf8fafc, 14, 15, 1.6);
    pt.position.set(0.0, 4.9, zPos);
    scene.add(pt);
  }

  // ============================================================================
  // 2. POLISHED TERRAZZO FLOOR & COLOR-CODED ECO-LAB GUIDE LINES
  // ============================================================================
  const { map: floorMap, roughnessMap: floorRough } = createTerrazzoFloorTextures(maxAnisotropy);
  disposableTextures.push(floorMap, floorRough);

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorMap,
    roughnessMap: floorRough,
    roughness: 0.35,
    metalness: 0.08,
  });
  const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(12.5, 46.0).rotateX(-Math.PI / 2),
    floorMat
  );
  floorMesh.receiveShadow = !isSoftwareGl;
  scene.add(floorMesh);

  // Subtle colored guide strips on the floor leading to the 5 Emblematic Lab Doors
  CORRIDOR_DOORS.filter((d) => d.category === 'eco-lab').forEach((lab) => {
    const stripMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(lab.accentHex),
      emissive: new THREE.Color(lab.accentHex),
      emissiveIntensity: 0.45,
      roughness: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const guideLine = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 0.12).rotateX(-Math.PI / 2),
      stripMat
    );
    guideLine.position.set(-2.3, 0.014, lab.position[2]);
    scene.add(guideLine);
  });

  // ============================================================================
  // 3. ARCHITECTURAL WALLS, PILASTERS & PRINCIPAL'S 45° CHAMFERED ENCLOSURE
  // ============================================================================
  const wallHeight = 5.6;
  const upperWallMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.72,
    metalness: 0.08,
  });
  const wainscotMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
    metalness: 0.2,
  });
  const pilasterMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.45,
    metalness: 0.35,
  });

  // A. West Wall (behind the 5 Emblematic Lab Doors, X = -4.64)
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.24, wallHeight, 45.0), upperWallMat);
  westWall.position.set(-4.68, wallHeight / 2, 0);
  westWall.receiveShadow = !isSoftwareGl;
  scene.add(westWall);

  const westWainscot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.35, 45.0), wainscotMat);
  westWainscot.position.set(-4.66, 0.675, 0);
  scene.add(westWainscot);

  // Structural Pilasters framing the 5 Emblematic Lab Bays along the West Wall
  for (const zPilaster of [-19.0, -11.4, -3.8, 3.8, 11.4, 19.0]) {
    const pilaster = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, wallHeight, 0.44),
      pilasterMat
    );
    pilaster.position.set(-4.52, wallHeight / 2, zPilaster);
    pilaster.castShadow = !isSoftwareGl;
    pilaster.receiveShadow = !isSoftwareGl;
    scene.add(pilaster);
  }

  // B. North End Wall (Z = -21.95) & South End Wall (Z = +21.95)
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(9.6, wallHeight, 0.24), upperWallMat);
  northWall.position.set(0, wallHeight / 2, -21.95);
  scene.add(northWall);

  const southWall = new THREE.Mesh(new THREE.BoxGeometry(9.6, wallHeight, 0.24), upperWallMat);
  southWall.position.set(0, wallHeight / 2, 21.95);
  scene.add(southWall);

  // C. East Wall Segments (X = +4.68) with Glazed Courtyard Window Bay & Staircase Opening
  const eastWallNorth = new THREE.Mesh(new THREE.BoxGeometry(0.24, wallHeight, 20.5), upperWallMat);
  eastWallNorth.position.set(4.68, wallHeight / 2, -12.0);
  scene.add(eastWallNorth);

  const eastWallSouth = new THREE.Mesh(new THREE.BoxGeometry(0.24, wallHeight, 16.5), upperWallMat);
  eastWallSouth.position.set(4.68, wallHeight / 2, 14.0);
  scene.add(eastWallSouth);

  // Glazed Main Courtyard Window Wall at X = +4.65, Z ∈ [-1.8, +5.8] (matching the double doors on right of blueprint)
  const glassFrameMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.8,
  });
  const courtyardGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(7.6, 4.2),
    new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.42,
      roughness: 0.1,
    })
  );
  courtyardGlass.rotation.y = -Math.PI / 2;
  courtyardGlass.position.set(4.62, 2.3, 2.0);
  scene.add(courtyardGlass);

  for (let m = -1.8; m <= 5.8; m += 1.9) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.4, 0.12), glassFrameMat);
    mullion.position.set(4.6, 2.3, m);
    scene.add(mullion);
  }

  // D. Principal's Office ("Γραφείο Διευθυντή") Projecting Enclosure with 45° Chamfered Entrance!
  // Matches the blueprint where the Principal's office juts into the upper-east side of the central corridor
  const principalNorthWall = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, wallHeight, 0.22),
    upperWallMat
  );
  principalNorthWall.position.set(2.55, wallHeight / 2, -9.6);
  scene.add(principalNorthWall);

  const principalWestWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, wallHeight, 3.8),
    upperWallMat
  );
  principalWestWall.position.set(0.55, wallHeight / 2, -7.7);
  scene.add(principalWestWall);

  // The 45° diagonal wall where Door #6 ("Γραφείο Διευθυντή") sits
  const diagLength = 3.15;
  const principalDiagWall = new THREE.Mesh(
    new THREE.BoxGeometry(diagLength, wallHeight, 0.22),
    upperWallMat
  );
  principalDiagWall.position.set(1.65, wallHeight / 2, -4.65);
  principalDiagWall.rotation.y = -Math.PI * 0.75;
  scene.add(principalDiagWall);

  const principalSouthWall = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, wallHeight, 0.22),
    upperWallMat
  );
  principalSouthWall.position.set(3.65, wallHeight / 2, -3.55);
  scene.add(principalSouthWall);

  // "Κεντρικός Διάδρομος" Architectural Banner Sign on the East Wall
  const corridorSignTex = createArchitecturalSignTexture(
    '“Κεντρικός Διάδρομος” • Ισόγειο',
    'ΣΧΟΛΙΚΟ ΣΥΓΚΡΟΤΗΜΑ 5 ΟΙΚΟΛΟΓΙΚΩΝ ΕΡΓΑΣΤΗΡΙΩΝ',
    '#10b981',
    maxAnisotropy
  );
  const corridorSignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.88),
    new THREE.MeshStandardMaterial({
      map: corridorSignTex,
      emissiveMap: corridorSignTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.85,
    })
  );
  corridorSignMesh.rotation.y = -Math.PI / 2;
  corridorSignMesh.position.set(4.52, 4.15, 2.0);
  scene.add(corridorSignMesh);

  // ============================================================================
  // 4. CEILING & INSTANCED ACOUSTIC BAFFLES (> 40 INSTANCES via InstancedMesh)
  // ============================================================================
  const ceilingMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(12.5, 46.0).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.85 })
  );
  ceilingMesh.position.y = wallHeight;
  scene.add(ceilingMesh);

  const baffleCount = 44;
  const baffleGeo = new THREE.BoxGeometry(7.8, 0.22, 0.08);
  const baffleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.55,
    metalness: 0.35,
  });
  const baffleInstanced = new THREE.InstancedMesh(baffleGeo, baffleMat, baffleCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < baffleCount; i++) {
    const z = -21.0 + i * 0.98;
    dummy.position.set(-0.3, wallHeight - 0.14, z);
    dummy.scale.set(1, 1 + (i % 3) * 0.08, 1);
    dummy.updateMatrix();
    baffleInstanced.setMatrixAt(i, dummy.matrix);
  }
  baffleInstanced.instanceMatrix.needsUpdate = true;
  baffleInstanced.computeBoundingSphere();
  scene.add(baffleInstanced);

  // ============================================================================
  // 5. ALL 10 INTERACTIVE DOORS WITH GLOWING DIGITAL EMBLEMS
  // ============================================================================
  const doorRigs: DoorRig[] = [];
  const hitboxes: THREE.Object3D[] = [];

  CORRIDOR_DOORS.forEach((doorSpec) => {
    const rig = createEmblematicDoorAssembly(doorSpec, maxAnisotropy, isSoftwareGl);
    scene.add(rig.group);
    doorRigs.push(rig);
    hitboxes.push(rig.hitbox);
  });

  // ============================================================================
  // 6. MONUMENTAL DIGITAL COUNTDOWN CHRONOMETER GANTRY (PRIME FOCAL POINT)
  // ============================================================================
  const chronoUpdater = new ChronometerDisplayUpdater(maxAnisotropy);
  const chronoGantry = createCentralChronometerGantry(chronoUpdater.texture);
  scene.add(chronoGantry);

  // ============================================================================
  // 7. BULLETIN BOARDS (ΠΙΝΑΚΕΣ ΑΝΑΚΟΙΝΩΣΕΩΝ), LOCKERS (ΝΤΟΥΛΑΠΕΣ), RECYCLING & STAIRS
  // ============================================================================
  // 4 Bulletin Boards mounted between the 5 Emblematic Lab Doors on the West Wall
  const westBulletinSpecs = [
    { z: -11.4, title: 'ΠΙΝΑΚΑΣ ΑΝΑΚΟΙΝΩΣΕΩΝ • ΚΗΠΟΣ & ΕΝΕΡΓΕΙΑ', color: '#10b981' },
    { z: -3.8, title: 'ΠΙΝΑΚΑΣ ΑΝΑΚΟΙΝΩΣΕΩΝ • ΔΡΑΣΕΙΣ ΑΝΑΚΥΚΛΩΣΗΣ', color: '#f59e0b' },
    { z: 3.8, title: 'ΠΙΝΑΚΑΣ ΑΝΑΚΟΙΝΩΣΕΩΝ • ΕΞΟΙΚΟΝΟΜΗΣΗ ΝΕΡΟΥ', color: '#06b6d4' },
    { z: 11.4, title: 'ΠΙΝΑΚΑΣ ΑΝΑΚΟΙΝΩΣΕΩΝ • ΚΟΜΠΟΣΤΟΠΟΙΗΣΗ', color: '#84cc16' },
  ];
  westBulletinSpecs.forEach((b) => {
    const board = createBulletinBoardAssembly(
      [-4.3, 1.82, b.z],
      Math.PI / 2,
      b.title,
      b.color,
      maxAnisotropy
    );
    scene.add(board);
  });

  // Central East Bulletin Board next to the Courtyard Windows
  const eastBoard = createBulletinBoardAssembly(
    [4.48, 1.82, -1.8],
    -Math.PI / 2,
    'ΚΕΝΤΡΙΚΟΣ ΠΙΝΑΚΑΣ ΑΝΑΚΟΙΝΩΣΕΩΝ ΣΧΟΛΕΙΟΥ',
    '#38bdf8',
    maxAnisotropy
  );
  scene.add(eastBoard);

  // Student Locker Banks (Ντουλάπες Μαθητών) along the East Wall & Principal's Wall
  const lockerBank1 = createLockerBank([4.22, 0, -18.2], -Math.PI / 2, 7, '#10b981');
  const lockerBank2 = createLockerBank([4.22, 0, 7.6], -Math.PI / 2, 7, '#06b6d4');
  const lockerBank3 = createLockerBank([4.22, 0, 17.2], -Math.PI / 2, 7, '#f59e0b');
  const lockerBank4 = createLockerBank([0.22, 0, -7.7], -Math.PI / 2, 5, '#38bdf8');
  scene.add(lockerBank1, lockerBank2, lockerBank3, lockerBank4);

  // Eco-Recycling Stations along the corridor
  const recyclingNorth = createRecyclingStation([3.85, 0, -11.4], -Math.PI / 2);
  const recyclingSouth = createRecyclingStation([3.85, 0, 14.2], -Math.PI / 2);
  scene.add(recyclingNorth, recyclingSouth);

  // Corridor Benches & Botanical Planters
  const benchCenter = createCorridorBenchAndPlanter([3.55, 0, 2.2], -Math.PI / 2);
  const benchNorth = createCorridorBenchAndPlanter([-3.45, 0, -19.8], 0);
  const benchSouth = createCorridorBenchAndPlanter([-3.45, 0, 19.8], Math.PI);
  scene.add(benchCenter, benchNorth, benchSouth);

  // East Staircase to the Upper Floors ("Σκάλες για τους επάνω ορόφους")
  const staircase = createStaircaseToUpperFloors([4.45, 0, 11.2], maxAnisotropy);
  scene.add(staircase);

  return {
    doorRigs,
    hitboxes,
    chronoUpdater,
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
      chronoUpdater.texture.dispose();
    },
  };
}
