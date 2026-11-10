import * as THREE from 'three';
import { DoorSpec } from '../data/corridorData';

/**
 * Draws the custom vector emblem icon onto a 2D canvas context
 */
export function drawEmblemVectorIcon(
  ctx: CanvasRenderingContext2D,
  type: DoorSpec['emblemType'],
  cx: number,
  cy: number,
  radius: number,
  primaryColor: string,
  glowColor: string
) {
  ctx.save();
  ctx.strokeStyle = primaryColor;
  ctx.fillStyle = primaryColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 18;
  ctx.lineWidth = Math.max(3, radius * 0.09);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (type) {
    case 'garden': {
      // Botanical sprout with twin leaves and sun arc
      ctx.beginPath();
      ctx.moveTo(cx, cy + radius * 0.55);
      ctx.quadraticCurveTo(cx, cy - radius * 0.1, cx, cy - radius * 0.45);
      ctx.stroke();

      // Left leaf
      ctx.beginPath();
      ctx.moveTo(cx, cy + radius * 0.15);
      ctx.bezierCurveTo(
        cx - radius * 0.65,
        cy + radius * 0.1,
        cx - radius * 0.65,
        cy - radius * 0.5,
        cx - radius * 0.08,
        cy - radius * 0.35
      );
      ctx.closePath();
      ctx.fillStyle = primaryColor + '44';
      ctx.fill();
      ctx.stroke();

      // Right leaf
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 0.02);
      ctx.bezierCurveTo(
        cx + radius * 0.65,
        cy - radius * 0.08,
        cx + radius * 0.65,
        cy - radius * 0.65,
        cx + radius * 0.05,
        cy - radius * 0.5
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Soil arc
      ctx.beginPath();
      ctx.arc(cx, cy + radius * 0.68, radius * 0.45, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      break;
    }

    case 'energy': {
      // Solar rays ring + lightning bolt
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const r1 = radius * 0.62;
        const r2 = radius * 0.78;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
        ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
        ctx.stroke();
      }
      // Lightning bolt
      ctx.beginPath();
      ctx.moveTo(cx + radius * 0.1, cy - radius * 0.55);
      ctx.lineTo(cx - radius * 0.32, cy + radius * 0.05);
      ctx.lineTo(cx + radius * 0.04, cy + radius * 0.05);
      ctx.lineTo(cx - radius * 0.12, cy + radius * 0.58);
      ctx.lineTo(cx + radius * 0.34, cy - radius * 0.06);
      ctx.lineTo(cx - radius * 0.02, cy - radius * 0.06);
      ctx.closePath();
      ctx.fillStyle = primaryColor;
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'waste': {
      // 3-arrow circular recycling emblem
      for (let i = 0; i < 3; i++) {
        const startAngle = (i * Math.PI * 2) / 3 - Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2) / 3 - 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.52, startAngle, endAngle);
        ctx.stroke();

        // Arrowhead at endAngle
        const ax = cx + Math.cos(endAngle) * radius * 0.52;
        const ay = cy + Math.sin(endAngle) * radius * 0.52;
        const tangent = endAngle + Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(
          ax - Math.cos(tangent - 0.5) * radius * 0.22,
          ay - Math.sin(tangent - 0.5) * radius * 0.22
        );
        ctx.moveTo(ax, ay);
        ctx.lineTo(
          ax - Math.cos(tangent + 0.5) * radius * 0.22,
          ay - Math.sin(tangent + 0.5) * radius * 0.22
        );
        ctx.stroke();
      }
      break;
    }

    case 'water': {
      // Sculpted water droplet + conservation ripple waves
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 0.62);
      ctx.bezierCurveTo(
        cx + radius * 0.55,
        cy - radius * 0.05,
        cx + radius * 0.48,
        cy + radius * 0.52,
        cx,
        cy + radius * 0.52
      );
      ctx.bezierCurveTo(
        cx - radius * 0.48,
        cy + radius * 0.52,
        cx - radius * 0.55,
        cy - radius * 0.05,
        cx,
        cy - radius * 0.62
      );
      ctx.closePath();
      ctx.fillStyle = primaryColor + '44';
      ctx.fill();
      ctx.stroke();

      // Inner wave
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.26, cy + radius * 0.16);
      ctx.quadraticCurveTo(cx - radius * 0.1, cy + radius * 0.04, cx, cy + radius * 0.16);
      ctx.quadraticCurveTo(cx + radius * 0.1, cy + radius * 0.28, cx + radius * 0.26, cy + radius * 0.16);
      ctx.stroke();
      break;
    }

    case 'compost': {
      // Organic cycle ring + seedling + earth layers
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.58, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.58, Math.PI + 0.2, Math.PI * 2 - 0.2);
      ctx.stroke();

      // Center sprout
      ctx.beginPath();
      ctx.moveTo(cx, cy + radius * 0.35);
      ctx.lineTo(cx, cy - radius * 0.22);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(
        cx - radius * 0.18,
        cy - radius * 0.15,
        radius * 0.18,
        radius * 0.1,
        -0.5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = primaryColor;
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        cx + radius * 0.18,
        cy - radius * 0.22,
        radius * 0.18,
        radius * 0.1,
        0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
      break;
    }

    case 'principal': {
      // Executive star / school emblem
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `800 ${Math.round(radius * 0.58)}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ΔΝ', cx, cy + 2);
      break;
    }

    case 'secretariat-north':
    case 'secretariat-south': {
      ctx.beginPath();
      ctx.roundRect(cx - radius * 0.45, cy - radius * 0.38, radius * 0.9, radius * 0.76, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.25, cy - radius * 0.12);
      ctx.lineTo(cx + radius * 0.25, cy - radius * 0.12);
      ctx.moveTo(cx - radius * 0.25, cy + radius * 0.12);
      ctx.lineTo(cx + radius * 0.15, cy + radius * 0.12);
      ctx.stroke();
      break;
    }

    case 'wc': {
      ctx.font = `800 ${Math.round(radius * 0.62)}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('WC', cx, cy + 2);
      break;
    }

    case 'storage': {
      // Isometric box/crate icon
      ctx.beginPath();
      ctx.rect(cx - radius * 0.42, cy - radius * 0.35, radius * 0.84, radius * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.42, cy - radius * 0.08);
      ctx.lineTo(cx + radius * 0.42, cy - radius * 0.08);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Creates a glowing circular hologram emblem texture for the 3D medallion above each emblematic door
 */
export function createCircularEmblemTexture(
  door: DoorSpec,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // Deep radial cyber-eco background
  const grad = ctx.createRadialGradient(cx, cy, 16, cx, cy, size * 0.48);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.7, '#090d16');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.47, 0, Math.PI * 2);
  ctx.fill();

  // Outer glowing ring
  ctx.strokeStyle = door.accentHex;
  ctx.shadowColor = door.accentHex;
  ctx.shadowBlur = 24;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
  ctx.stroke();

  // Segmented digital tick ring
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = door.accentHex + 'aa';
  ctx.lineWidth = 3;
  for (let i = 0; i < 36; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 36);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.38);
    ctx.lineTo(0, -size * 0.41);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Draw the custom emblem icon in the center
  drawEmblemVectorIcon(ctx, door.emblemType, cx, cy - 12, size * 0.25, door.accentHex, door.accentHex);

  // Bottom badge number
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 32px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`0${door.number}`, cx, size * 0.81);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

/**
 * Creates the wide luminous digital transom sign above each door with its Greek title & emblem
 */
export function createDoorHeaderSignTexture(
  door: DoorSpec,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const width = 1024;
  const height = 320;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Dark slate digital glass background
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#090e1a');
  bg.addColorStop(0.5, '#0f172a');
  bg.addColorStop(1, '#090e1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle LED matrix grid lines
  ctx.strokeStyle = door.accentHex + '18';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Glowing border frame
  ctx.strokeStyle = door.accentHex;
  ctx.shadowColor = door.accentHex;
  ctx.shadowBlur = 20;
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  ctx.shadowBlur = 0;

  // Left emblem circle
  const iconCx = 148;
  const iconCy = height / 2;
  ctx.fillStyle = door.accentHex + '1f';
  ctx.beginPath();
  ctx.arc(iconCx, iconCy, 96, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = door.accentHex;
  ctx.lineWidth = 4;
  ctx.stroke();

  drawEmblemVectorIcon(ctx, door.emblemType, iconCx, iconCy, 82, door.accentHex, door.accentHex);

  // Category kicker
  ctx.fillStyle = door.accentHex;
  ctx.font = '700 26px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const kicker =
    door.category === 'eco-lab'
      ? `ΕΜΒΛΗΜΑΤΙΚΟ ΕΡΓΑΣΤΗΡΙΟ 0${door.number}`
      : `ΧΩΡΟΣ ΔΙΟΙΚΗΣΗΣ / ΥΠΟΣΤΗΡΙΞΗΣ • ΠΟΡΤΑ ${door.number}`;
  ctx.fillText(kicker, 280, 78);

  // Main Greek Title (auto-scaled so it never clips)
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = door.accentHex;
  ctx.shadowBlur = 14;
  const titleText = `“${door.title}”`;
  let fontSize = 54;
  ctx.font = `800 ${fontSize}px "Outfit", sans-serif`;
  while (ctx.measureText(titleText).width > width - 315 && fontSize > 32) {
    fontSize -= 2;
    ctx.font = `800 ${fontSize}px "Outfit", sans-serif`;
  }
  ctx.fillText(titleText, 280, 158);
  ctx.restore();

  // Subtitle
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 27px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(door.subtitle, 280, 236);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

/**
 * Dynamic Digital Countdown Chronometer Canvas Manager
 * Updates in real-time and stays razor-sharp in 3D space.
 */
export class ChronometerDisplayUpdater {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;
  private lastRenderedTenths = -1;
  private lastPausedState = false;

  constructor(maxAnisotropy: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1600;
    this.canvas.height = 560;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = maxAnisotropy;
    this.update(45 * 60, 45 * 60, false, true);
  }

  public update(
    remainingSeconds: number,
    totalSeconds: number,
    isPaused: boolean,
    force = false
  ) {
    const clamped = Math.max(0, remainingSeconds);
    const tenths = Math.floor((clamped % 1) * 10);
    const totalTenthsKey = Math.floor(clamped * 10);

    if (!force && totalTenthsKey === this.lastRenderedTenths && isPaused === this.lastPausedState) {
      return;
    }
    this.lastRenderedTenths = totalTenthsKey;
    this.lastPausedState = isPaused;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Deep obsidian LED board background
    ctx.fillStyle = '#040812';
    ctx.fillRect(0, 0, w, h);

    // Subtle LED pixel matrix pattern
    ctx.fillStyle = '#0b1528';
    for (let x = 20; x < w - 20; x += 20) {
      for (let y = 20; y < h - 20; y += 20) {
        ctx.fillRect(x, y, 4, 4);
      }
    }

    const isUrgent = clamped < 300; // under 5 mins
    const primaryAccent = isUrgent ? '#ef4444' : isPaused ? '#f59e0b' : '#10b981';
    const secondaryAccent = isUrgent ? '#f97316' : '#38bdf8';

    // Outer glowing stadium frame
    ctx.strokeStyle = primaryAccent;
    ctx.shadowColor = primaryAccent;
    ctx.shadowBlur = 24;
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.shadowBlur = 0;

    // Header bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(24, 24, w - 48, 84);

    ctx.fillStyle = secondaryAccent;
    ctx.font = '800 30px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('ΨΗΦΙΑΚΟ ΧΡΟΝΟΜΕΤΡΟ ΟΙΚΟΛΟΓΙΚΩΝ ΕΡΓΑΣΤΗΡΙΩΝ • ΑΝΤΙΣΤΡΟΦΗ ΜΕΤΡΗΣΗ', 54, 66);

    // Status tag on right of header
    ctx.fillStyle = primaryAccent;
    ctx.font = '700 28px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(isPaused ? '[ ΣΕ ΠΑΥΣΗ ]' : '[ ΕΝΕΡΓΗ ΜΕΤΡΗΣΗ ]', w - 54, 66);

    // Compute HH : MM : SS . d
    const wholeSecs = Math.floor(clamped);
    const hrs = Math.floor(wholeSecs / 3600);
    const mins = Math.floor((wholeSecs % 3600) / 60);
    const secs = wholeSecs % 60;

    const mmStr = String(mins + hrs * 60).padStart(2, '0');
    const ssStr = String(secs).padStart(2, '0');
    const dStr = String(tenths);

    // Ghost 88:88.8 background for authentic digital 7-segment feel
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 230px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.fillText('88:88.8', w / 2, 275);

    // Main Glowing Digital Countdown Numerals
    ctx.save();
    ctx.shadowColor = primaryAccent;
    ctx.shadowBlur = 34;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${mmStr}:${ssStr}`, w / 2 - 95, 275);

    // Tenths of a second in accent color
    ctx.font = '800 135px "JetBrains Mono", monospace';
    ctx.fillStyle = primaryAccent;
    ctx.fillText(`.${dStr}`, w / 2 + 375, 298);
    ctx.restore();

    // Progress bar at bottom
    const barX = 56;
    const barY = 432;
    const barW = w - 112;
    const barH = 26;
    const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, clamped / totalSeconds)) : 0;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barW, barH);

    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, '#10b981');
    barGrad.addColorStop(0.5, '#06b6d4');
    barGrad.addColorStop(1, primaryAccent);
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, barW * progress, barH);

    // Bottom 5 lab status indicators
    const labs = [
      { name: '1. Σχολικός Κήπος', color: '#10b981' },
      { name: '2. Μείωση Ενέργειας', color: '#f59e0b' },
      { name: '3. Χωρισμός Απορριμμάτων', color: '#f97316' },
      { name: '4. Εξοικονόμηση Νερού', color: '#06b6d4' },
      { name: '5. Κομποστοποίηση', color: '#84cc16' },
    ];
    ctx.font = '700 23px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    labs.forEach((lab, idx) => {
      const lx = barX + ((idx + 0.5) * barW) / labs.length;
      ctx.fillStyle = lab.color;
      ctx.fillText(lab.name, lx, 502);
    });

    this.texture.needsUpdate = true;
  }
}

/**
 * Creates a procedural school terrazzo tile floor texture & roughness map
 */
export function createTerrazzoFloorTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Warm architectural terrazzo base
  ctx.fillStyle = '#d6d9df';
  ctx.fillRect(0, 0, size, size);

  // Terrazzo mineral chips (deterministic pseudo-random)
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const chipColors = ['#94a3b8', '#cbd5e1', '#64748b', '#e2e8f0', '#475569', '#10b98133'];
  for (let i = 0; i < 3200; i++) {
    ctx.fillStyle = chipColors[Math.floor(rand() * chipColors.length)];
    const x = rand() * size;
    const y = rand() * size;
    const w = 2 + rand() * 8;
    const h = 2 + rand() * 6;
    ctx.fillRect(x, y, w, h);
  }

  // Subtle 4x4 tile grid seams
  ctx.strokeStyle = '#adb5bd';
  ctx.lineWidth = 3;
  const step = size / 4;
  for (let i = 0; i <= 4; i++) {
    const pos = i * step;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 18);
  map.anisotropy = maxAnisotropy;

  // Roughness map (polished tiles with matte grout seams)
  const rCanvas = document.createElement('canvas');
  rCanvas.width = 512;
  rCanvas.height = 512;
  const rCtx = rCanvas.getContext('2d')!;
  rCtx.fillStyle = '#383838'; // fairly glossy terrazzo
  rCtx.fillRect(0, 0, 512, 512);
  rCtx.strokeStyle = '#c0c0c0'; // matte grout lines
  rCtx.lineWidth = 4;
  const rStep = 512 / 4;
  for (let i = 0; i <= 4; i++) {
    const pos = i * rStep;
    rCtx.beginPath();
    rCtx.moveTo(pos, 0);
    rCtx.lineTo(pos, 512);
    rCtx.moveTo(0, pos);
    rCtx.lineTo(512, pos);
    rCtx.stroke();
  }

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 18);
  roughnessMap.anisotropy = maxAnisotropy;

  return { map, roughnessMap };
}

/**
 * Creates a detailed Greek School Bulletin Board (Πίνακας Ανακοινώσεων) texture
 */
export function createBulletinBoardTexture(
  boardTitle: string,
  accentColor: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 768;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Corkboard base
  ctx.fillStyle = '#b07d4f';
  ctx.fillRect(0, 0, w, h);

  // Cork texture speckles
  let s = 1337;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = rnd() > 0.5 ? '#96653b' : '#c89666';
    ctx.fillRect(rnd() * w, rnd() * h, 3, 3);
  }

  // Top Header Banner inside board
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(24, 20, w - 48, 58);
  ctx.fillStyle = accentColor;
  ctx.fillRect(24, 74, w - 48, 5);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(boardTitle, w / 2, 48);

  // Pinned Notice Cards
  const cards = [
    {
      x: 42,
      y: 102,
      cw: 210,
      ch: 170,
      bg: '#fef9c3',
      title: 'ΠΡΟΓΡΑΜΜΑ ΕΡΓΑΣΤΗΡΙΩΝ',
      lines: ['09:00 Σχολικός Κήπος', '10:30 Μείωση Ενέργειας', '12:00 Ανακύκλωση', '13:15 Κομποστοποίηση'],
      pin: '#ef4444',
    },
    {
      x: 278,
      y: 106,
      cw: 210,
      ch: 185,
      bg: '#ecfdf5',
      title: 'ΟΙΚΟΛΟΓΙΚΟΙ ΣΤΟΧΟΙ',
      lines: ['-30% Κατανάλωση Νερού', '-28% Ρεύμα LED', '100% Διαλογή Χαρτιού', 'Συμμετοχή όλων των τάξεων'],
      pin: '#10b981',
    },
    {
      x: 514,
      y: 100,
      cw: 210,
      ch: 175,
      bg: '#eff6ff',
      title: 'ΑΝΑΚΟΙΝΩΣΗ ΔΙΕΥΘΥΝΣΗΣ',
      lines: ['Εγγραφή ομάδων στη', 'Γραμματεία Ισογείου', 'έως την Παρασκευή.', 'Έπαθλο Πράσινης Τάξης!'],
      pin: '#3b82f6',
    },
    {
      x: 42,
      y: 298,
      cw: 330,
      ch: 180,
      bg: '#ffffff',
      title: 'ΕΒΔΟΜΑΔΙΑΙΑ ΔΡΑΣΗ ΚΗΠΟΥ & ΚΟΜΠΟΣΤ',
      lines: ['Φύτευση 40 νέων αρωματικών φυτών', 'και συλλογή ώριμου κομπόστ από', 'το 5ο Εργαστήριο Κομποστοποίησης.'],
      pin: '#f59e0b',
    },
    {
      x: 398,
      y: 302,
      cw: 326,
      ch: 176,
      bg: '#fff7ed',
      title: 'ΚΑΤΟΨΗ ΙΣΟΓΕΙΟΥ • 10 ΠΟΡΤΕΣ',
      lines: ['Δυτικά: 5 Εργαστήρια Περιβάλλοντος', 'Ανατολικά: Γραφείο Διευθυντή,', 'Γραμματείες, WC, Αποθήκες & Σκάλες'],
      pin: '#ec4899',
    },
  ];

  cards.forEach((c) => {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(c.x + 5, c.y + 6, c.cw, c.ch);

    ctx.fillStyle = c.bg;
    ctx.fillRect(c.x, c.y, c.cw, c.ch);

    // Pushpin
    ctx.fillStyle = c.pin;
    ctx.beginPath();
    ctx.arc(c.x + c.cw / 2, c.y + 14, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 16px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(c.title, c.x + 14, c.y + 42);

    ctx.fillStyle = '#334155';
    ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
    c.lines.forEach((line, i) => {
      ctx.fillText(line, c.x + 14, c.y + 72 + i * 24);
    });
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

/**
 * Creates a directional architectural sign for "Σκάλες για τους επάνω ορόφους" & "Κεντρικός Διάδρομος"
 */
export function createArchitecturalSignTexture(
  title: string,
  subtitle: string,
  accentHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 640;
  const h = 180;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  ctx.fillStyle = accentHex;
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(subtitle, w / 2, 54);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 36px "Outfit", sans-serif';
  ctx.fillText(title, w / 2, 114);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}
