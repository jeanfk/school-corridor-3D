/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ChevronDown,
  ChevronUp,
  Compass,
  DoorClosed,
  DoorOpen,
  Map,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Timer,
} from 'lucide-react';
import {
  CAMERA_PRESETS,
  CameraPreset,
  CORRIDOR_DOORS,
  DoorSpec,
} from './data/corridorData';
import { buildSchoolCorridorScene, CorridorSceneContext } from './three/buildSchoolCorridorScene';
import { FloorplanModal } from './components/FloorplanModal';

// Module-scope reusable scratch vectors to ensure zero GC allocations in the render loop
const _desiredCamPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _mouseNDC = new THREE.Vector2();
const _forwardVec = new THREE.Vector3();

type DockTab = 'eco-labs' | 'admin-doors' | 'camera-timer' | 'inspector';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // UI State
  const [selectedDoor, setSelectedDoor] = useState<DoorSpec>(CORRIDOR_DOORS[2]); // Default center door: Χωρισμός Απορριμμάτων
  const [hoveredDoorTitle, setHoveredDoorTitle] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>('panoramic-center');
  const [activeTab, setActiveTab] = useState<DockTab>('eco-labs');
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isFloorplanOpen, setIsFloorplanOpen] = useState<boolean>(false);
  const [isAutoRotate360, setIsAutoRotate360] = useState<boolean>(false);
  const [allDoorsOpen, setAllDoorsOpen] = useState<boolean>(false);
  const [openDoorIds, setOpenDoorIds] = useState<Record<string, boolean>>({
    'lab-garden': true,
    'lab-energy': true,
    'lab-waste': true,
    'lab-water': true,
    'lab-compost': true,
  });

  // Countdown Chronometer State (Default 45:00 = 2700s school eco-mission countdown)
  const [totalCountdownSec, setTotalCountdownSec] = useState<number>(45 * 60);
  const [displayRemainingSec, setDisplayRemainingSec] = useState<number>(45 * 60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Mutable refs accessed inside the Three.js animation loop without re-mounting WebGL
  const timerStateRef = useRef({
    remaining: 45 * 60,
    total: 45 * 60,
    paused: false,
  });
  const cameraTransitionRef = useRef<{
    active: boolean;
    pos: [number, number, number];
    target: [number, number, number];
  }>({
    active: false,
    pos: CAMERA_PRESETS[0].position,
    target: CAMERA_PRESETS[0].target,
  });
  const autoRotateRef = useRef<boolean>(false);
  const openDoorIdsRef = useRef<Record<string, boolean>>(openDoorIds);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Sync React state to refs for the 60fps loop
  useEffect(() => {
    autoRotateRef.current = isAutoRotate360;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate360;
    }
  }, [isAutoRotate360]);

  useEffect(() => {
    openDoorIdsRef.current = openDoorIds;
  }, [openDoorIds]);

  // Keyboard shortcut 'H' for collapsing/expanding the bottom dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H' || e.key === 'η' || e.key === 'Η') {
        if (document.activeElement?.tagName !== 'INPUT') {
          setIsDockCollapsed((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Trigger smooth camera transition to a door
  const handleFocusDoor = useCallback((door: DoorSpec) => {
    setSelectedDoor(door);
    setActivePresetId('');
    setIsAutoRotate360(false);
    cameraTransitionRef.current = {
      active: true,
      pos: door.cameraPos,
      target: door.cameraTarget,
    };
  }, []);

  // Trigger smooth camera transition to a preset
  const handleSelectPreset = useCallback((preset: CameraPreset) => {
    setActivePresetId(preset.id);
    setIsAutoRotate360(false);
    cameraTransitionRef.current = {
      active: true,
      pos: preset.position,
      target: preset.target,
    };
  }, []);

  // Rotate camera 360° horizontally around current standing spot
  const handleRotateHorizontalBy = useCallback((angleRad: number) => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;

    _forwardVec.subVectors(ctrl.target, cam.position);
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const nx = _forwardVec.x * cos - _forwardVec.z * sin;
    const nz = _forwardVec.x * sin + _forwardVec.z * cos;

    cameraTransitionRef.current = {
      active: true,
      pos: [cam.position.x, cam.position.y, cam.position.z],
      target: [cam.position.x + nx, ctrl.target.y, cam.position.z + nz],
    };
  }, []);

  // Toggle individual door open/closed
  const handleToggleDoorLeaf = useCallback((doorId: string) => {
    setOpenDoorIds((prev) => ({
      ...prev,
      [doorId]: !prev[doorId],
    }));
  }, []);

  // Toggle all 10 doors open/closed
  const handleToggleAllDoors = useCallback(() => {
    const nextState = !allDoorsOpen;
    setAllDoorsOpen(nextState);
    const updated: Record<string, boolean> = {};
    CORRIDOR_DOORS.forEach((d) => {
      updated[d.id] = nextState;
    });
    setOpenDoorIds(updated);
  }, [allDoorsOpen]);

  // Countdown Timer Controls
  const handleSetTimerDuration = useCallback((minutes: number) => {
    const secs = minutes * 60;
    timerStateRef.current.total = secs;
    timerStateRef.current.remaining = secs;
    timerStateRef.current.paused = false;
    setTotalCountdownSec(secs);
    setDisplayRemainingSec(secs);
    setIsTimerPaused(false);
  }, []);

  const handleToggleTimerPause = useCallback(() => {
    const nextPaused = !timerStateRef.current.paused;
    timerStateRef.current.paused = nextPaused;
    setIsTimerPaused(nextPaused);
  }, []);

  // ============================================================================
  // THREE.JS INITIALIZATION & HARDWARE/SOFTWARE WEBGL RENDER LOOP
  // ============================================================================
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer configuration
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Scene, Atmospheric Fog, and RoomEnvironment PMREM
    const scene = new THREE.Scene();
    const bgHex = 0x090e1a;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.018);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Camera & OrbitControls (360° panoramic rotation around the corridor)
    const camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / container.clientHeight,
      0.15,
      85
    );
    const initialPreset = CAMERA_PRESETS[0];
    camera.position.set(...initialPreset.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...initialPreset.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.8;
    controls.minDistance = 0.5;
    controls.maxDistance = 24.0;
    controls.maxPolarAngle = Math.PI * 0.54; // prevent going below the terrazzo floor
    controls.minPolarAngle = Math.PI * 0.22;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.1;
    controls.update();
    controlsRef.current = controls;

    // Cancel scripted camera transition when user manually drags/zooms
    const onControlStart = () => {
      cameraTransitionRef.current.active = false;
    };
    controls.addEventListener('start', onControlStart);

    // 5. Build the entire 3D School Corridor from the floorplan
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const corridorCtx: CorridorSceneContext = buildSchoolCorridorScene(
      scene,
      maxAnisotropy,
      isSoftwareGl
    );

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 6. Raycasting for interactive door selection & hover
    const raycaster = new THREE.Raycaster();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverCheck = 0;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore drag gestures

      const rect = renderer.domElement.getBoundingClientRect();
      _mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_mouseNDC, camera);
      const hits = raycaster.intersectObjects(corridorCtx.hitboxes, false);
      if (hits.length > 0) {
        const spec = hits[0].object.userData.doorSpec as DoorSpec | undefined;
        if (spec) {
          setSelectedDoor(spec);
          setActiveTab('inspector');
          cameraTransitionRef.current = {
            active: true,
            pos: spec.cameraPos,
            target: spec.cameraTarget,
          };
          // Also toggle the door open when clicked
          setOpenDoorIds((prev) => ({
            ...prev,
            [spec.id]: !prev[spec.id],
          }));
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 60) return; // Throttle to ~16fps
      lastHoverCheck = now;

      const rect = renderer.domElement.getBoundingClientRect();
      _mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(_mouseNDC, camera);
      const hits = raycaster.intersectObjects(corridorCtx.hitboxes, false);

      let hoveredId: string | null = null;
      let hoveredTitle: string | null = null;
      if (hits.length > 0) {
        const spec = hits[0].object.userData.doorSpec as DoorSpec | undefined;
        if (spec) {
          hoveredId = spec.id;
          hoveredTitle = `${spec.number}. “${spec.title}”`;
        }
      }

      corridorCtx.doorRigs.forEach((rig) => {
        rig.isHovered = rig.spec.id === hoveredId;
      });
      renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'grab';
      setHoveredDoorTitle(hoveredTitle);
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    domElem.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('pointermove', onPointerMove);

    // 7. Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 8. Paced Render Loop with gl.fenceSync for Software WebGL safety
    let frameId = 0;
    let isDisposed = false;
    let lastTimestamp = performance.now();
    let lastReactTimerSync = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      // A. Advance the Digital Countdown Chronometer
      const tState = timerStateRef.current;
      if (!tState.paused && tState.remaining > 0) {
        tState.remaining = Math.max(0, tState.remaining - dt);
      }
      corridorCtx.chronoUpdater.update(tState.remaining, tState.total, tState.paused);

      // Sync React HUD timer readout ~4 times per second
      if (now - lastReactTimerSync > 250) {
        lastReactTimerSync = now;
        setDisplayRemainingSec(Math.ceil(tState.remaining));
      }

      // B. Smoothly damp camera transitions
      const trans = cameraTransitionRef.current;
      if (trans.active) {
        _desiredCamPos.set(trans.pos[0], trans.pos[1], trans.pos[2]);
        _desiredTarget.set(trans.target[0], trans.target[1], trans.target[2]);

        const dampFactor = 1 - Math.exp(-5.5 * dt);
        camera.position.lerp(_desiredCamPos, dampFactor);
        controls.target.lerp(_desiredTarget, dampFactor);

        if (
          camera.position.distanceToSquared(_desiredCamPos) < 0.002 &&
          controls.target.distanceToSquared(_desiredTarget) < 0.002
        ) {
          camera.position.copy(_desiredCamPos);
          controls.target.copy(_desiredTarget);
          trans.active = false;
        }
      }

      // C. Animate the 10 Doors (smoothly swing open/close + rotate digital emblem rings)
      const openMap = openDoorIdsRef.current;
      for (let i = 0; i < corridorCtx.doorRigs.length; i++) {
        const rig = corridorCtx.doorRigs[i];
        const isOpen = Boolean(openMap[rig.spec.id]);
        rig.targetOpenAngle = isOpen ? 1.18 : 0.0;
        rig.currentOpenAngle = THREE.MathUtils.damp(
          rig.currentOpenAngle,
          rig.targetOpenAngle,
          6.0,
          dt
        );
        rig.hingeGroup.rotation.y = rig.currentOpenAngle;

        // Subtle rotation of the 3D circular emblem ring
        rig.emblemRing.rotation.z += dt * (rig.isHovered ? 1.2 : 0.25);
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      domElem.removeEventListener('pointerdown', onPointerDown);
      domElem.removeEventListener('pointerup', onPointerUp);
      domElem.removeEventListener('pointermove', onPointerMove);
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      corridorCtx.dispose();
      renderer.dispose();
    };
  }, []);

  // Format MM:SS for Top HUD mirror
  const formattedCountdown = (() => {
    const mins = Math.floor(displayRemainingSec / 60);
    const secs = displayRemainingSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  })();

  const isSelectedDoorOpen = Boolean(openDoorIds[selectedDoor.id]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* ==================================================================== */}
      {/* 1. TOP BAR CONTRACT (3 Zones separated by gap-8, solid surface)      */}
      {/* ==================================================================== */}
      <header className="relative z-20 flex items-center justify-between gap-8 border-b border-slate-800/90 bg-slate-950/95 px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleSelectPreset(CAMERA_PRESETS[0]);
          }}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Οικολογικό Σχολείο 360°
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleSelectPreset(CAMERA_PRESETS[0])}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Κεντρική Άποψη
          </button>
          <button
            onClick={() => {
              setActiveTab('eco-labs');
              setIsDockCollapsed(false);
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            5 Εργαστήρια
          </button>
          <button
            onClick={() => {
              setActiveTab('admin-doors');
              setIsDockCollapsed(false);
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Διοίκηση & Χώροι
          </button>
          <button
            onClick={() => handleSelectPreset(CAMERA_PRESETS[3])}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Χρονόμετρο ({formattedCountdown})
          </button>
          <button
            onClick={() => setIsFloorplanOpen(true)}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Κάτοψη Ισογείου
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAutoRotate360((prev) => !prev)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              isAutoRotate360
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isAutoRotate360 ? 'Παύση Περιστροφής 360°' : 'Περιστροφή 360°'}
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. ISOLATED FULL-VIEWPORT WEBGL CANVAS CONTAINER                     */}
      {/* ==================================================================== */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 z-0 h-full w-full"
        aria-label="Διαδραστική 3D σκηνή σχολικού διαδρόμου 360 μοιρών"
      />

      {/* Subtle Hover Tooltip for 3D Door Raycasting */}
      {hoveredDoorTitle && (
        <div className="pointer-events-none fixed top-20 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-950/95 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
          Κλικ για μετάβαση & άνοιγμα: <span className="text-emerald-400">{hoveredDoorTitle}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK (Zero Viewport Occlusion) */}
      {/* ==================================================================== */}
      <div
        style={{
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 'min(960px, 95vw)',
        }}
        className="fixed z-20 w-full transition-transform duration-200 ease-out"
      >
        {/* Collapse / Expand Toggle Tab on Top Edge of Dock */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsDockCollapsed((prev) => !prev)}
            className="flex items-center gap-2 rounded-t-xl border border-b-0 border-slate-700/90 bg-slate-950/95 px-4 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:text-white whitespace-nowrap shrink-0"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Εμφάνιση Ελέγχων 3D Διαδρόμου (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                <span>Απόκρυψη Ελέγχων (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Surface (Solid dark surface — no backdrop-filter over WebGL) */}
        {!isDockCollapsed && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl">
            {/* Top Row inside Dock: Segmented Tab Bar + Quick 360° & Timer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              {/* Segmented Controls */}
              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-900 p-1">
                <button
                  onClick={() => setActiveTab('eco-labs')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'eco-labs'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  5 Εμβληματικές Πόρτες
                </button>
                <button
                  onClick={() => setActiveTab('admin-doors')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'admin-doors'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  5 Πλαϊνές Πόρτες ({'Γραφεία / WC / Αποθήκη'})
                </button>
                <button
                  onClick={() => setActiveTab('camera-timer')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'camera-timer'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Κάμερα 360° & Χρονόμετρο
                </button>
                <button
                  onClick={() => setActiveTab('inspector')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'inspector'
                      ? 'bg-slate-100 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Επιλεγμένη: “{selectedDoor.title}”
                </button>
              </div>

              {/* Right Quick Actions: 360° Spin Left/Right + Floorplan Map */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRotateHorizontalBy(Math.PI / 3)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
                  title="Περιστροφή αριστερά 60°"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
                  <span>-60°</span>
                </button>
                <button
                  onClick={() => handleRotateHorizontalBy(-Math.PI / 3)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
                  title="Περιστροφή δεξιά 60°"
                >
                  <span>+60°</span>
                  <RotateCw className="h-3.5 w-3.5 text-emerald-400" />
                </button>
                <button
                  onClick={() => setIsFloorplanOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-sky-300 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <Map className="h-3.5 w-3.5" />
                  <span>Κάτοψη</span>
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* TAB 1: 5 EMBLEMATIC ECO-LAB DOORS (Μπροστά)                    */}
            {/* ============================================================== */}
            {activeTab === 'eco-labs' && (
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {CORRIDOR_DOORS.filter((d) => d.category === 'eco-lab').map((door) => {
                  const isSelected = selectedDoor.id === door.id;
                  return (
                    <button
                      key={door.id}
                      onClick={() => handleFocusDoor(door)}
                      className={`group flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-emerald-400 bg-slate-900 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-mono-tabular text-xs font-bold"
                          style={{ color: door.accentHex }}
                        >
                          ΕΡΓΑΣΤΗΡΙΟ 0{door.number}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {openDoorIds[door.id] ? 'Ανοικτή' : 'Κλειστή'}
                        </span>
                      </div>
                      <div className="mt-1.5 font-display text-xs font-bold leading-snug text-white">
                        “{door.title}”
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: 5 ADMIN & SUPPORT DOORS (Στα Πλάγια)                    */}
            {/* ============================================================== */}
            {activeTab === 'admin-doors' && (
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {CORRIDOR_DOORS.filter((d) => d.category === 'admin-support').map((door) => {
                  const isSelected = selectedDoor.id === door.id;
                  return (
                    <button
                      key={door.id}
                      onClick={() => handleFocusDoor(door)}
                      className={`group flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-sky-400 bg-slate-900 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-mono-tabular text-xs font-bold"
                          style={{ color: door.accentHex }}
                        >
                          ΠΟΡΤΑ {door.number}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {openDoorIds[door.id] ? 'Ανοικτή' : 'Κλειστή'}
                        </span>
                      </div>
                      <div className="mt-1.5 font-display text-xs font-bold leading-snug text-white">
                        “{door.title}”
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: CAMERA PRESETS & DIGITAL COUNTDOWN CHRONOMETER          */}
            {/* ============================================================== */}
            {activeTab === 'camera-timer' && (
              <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                {/* Left: 6 Corridor Viewpoint Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {CAMERA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        activePresetId === preset.id
                          ? 'border-emerald-400 bg-emerald-500/20 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <Compass className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{preset.shortLabel}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleToggleAllDoors}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    {allDoorsOpen ? (
                      <DoorClosed className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <DoorOpen className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>{allDoorsOpen ? 'Κλείσιμο Όλων (10)' : 'Άνοιγμα Όλων (10)'}</span>
                  </button>
                </div>

                {/* Right: Countdown Chronometer Controls */}
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 shrink-0">
                  <Timer className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-mono-tabular text-sm font-bold text-white">
                    {formattedCountdown}
                  </span>
                  <button
                    onClick={handleToggleTimerPause}
                    className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap shrink-0"
                  >
                    {isTimerPaused ? (
                      <>
                        <Play className="h-3 w-3 text-emerald-400" />
                        <span>Συνέχεια</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3 text-amber-400" />
                        <span>Παύση</span>
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-1 text-xs">
                    {[15, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleSetTimerDuration(mins)}
                        className={`rounded px-2 py-1 font-mono-tabular transition-colors whitespace-nowrap shrink-0 ${
                          totalCountdownSec === mins * 60
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {mins}&apos;
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: SELECTED DOOR INSPECTOR (Clean unboxed metadata)        */}
            {/* ============================================================== */}
            {activeTab === 'inspector' && (
              <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span
                      className="font-mono-tabular font-bold"
                      style={{ color: selectedDoor.accentHex }}
                    >
                      Πόρτα {selectedDoor.number} από 10
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedDoor.subtitle}</span>
                    {selectedDoor.metrics.map((m) => (
                      <React.Fragment key={m.label}>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-300">
                          {m.label}: <strong className="font-mono-tabular text-white">{m.value}</strong>
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-white">
                    “{selectedDoor.title}”
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-300 line-clamp-2">
                    {selectedDoor.description}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleToggleDoorLeaf(selectedDoor.id)}
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    {isSelectedDoorOpen ? (
                      <>
                        <DoorClosed className="h-4 w-4 text-amber-400" />
                        <span>Κλείσιμο Πόρτας</span>
                      </>
                    ) : (
                      <>
                        <DoorOpen className="h-4 w-4 text-emerald-400" />
                        <span>Άνοιγμα Πόρτας</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleSelectPreset(CAMERA_PRESETS[0])}
                    className="rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400 whitespace-nowrap shrink-0"
                  >
                    Επιστροφή στο Κέντρο 360°
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. INTERACTIVE FLOORPLAN BLUEPRINT MODAL                             */}
      {/* ==================================================================== */}
      <FloorplanModal
        isOpen={isFloorplanOpen}
        onClose={() => setIsFloorplanOpen(false)}
        selectedDoorId={selectedDoor.id}
        onSelectDoor={(door) => {
          handleFocusDoor(door);
          setActiveTab('inspector');
        }}
      />
    </div>
  );
}
