import * as THREE from "three";

/**
 * Placeholder camera app shown on the display during the "Controle da Câmera" section.
 * It loops an 8 s choreography: a press on the Camera Control, a slide from 1× to 5×, a second press and a slide back.
 * A video can replace the drawing later (see `showcase.cameraVideo`); the glow on the button follows the same clock,
 * so the video should press at 0.9 s and 4.9 s and zoom 1→5× (1.2–3.0 s) and 5→1× (5.2–7.0 s).
 */
export const CAMERA_LOOP = 8;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function cameraTimeline(time: number) {
  const c = ((time % CAMERA_LOOP) + CAMERA_LOOP) % CAMERA_LOOP;
  const log5 = Math.log2(5);
  const up = smooth(1.2, 3.0, c);
  const down = smooth(5.2, 7.0, c);
  const zoom = 2 ** (log5 * (c < 4 ? up : 1 - down));
  const glow = c < 4 ? smooth(0.85, 1.15, c) * (1 - smooth(3.2, 3.7, c)) : smooth(4.85, 5.15, c) * (1 - smooth(7.2, 7.7, c));
  const since = c < 4 ? c - 0.9 : c - 4.9;
  const ripple = since >= 0 && since < 0.7 ? since / 0.7 : -1;
  return { zoom, glow, ripple };
}

const W = 660;
const H = 1434;
/** Height of the Camera Control on the screen (0 = top), measured from the model. */
const CONTROL_V = 0.646;
const STOPS = [0.5, 1, 2, 5, 8];
const FONT = "-apple-system, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";

function fmt(z: number) {
  const r = Math.round(z * 10) / 10;
  return (Number.isInteger(r) ? r.toFixed(0) : r.toFixed(1).replace(".", ",")) + "×";
}

/** A dusk landscape with details far away, so zooming in reveals something. Drawn once at 2× for crisp zoom. */
function paintScene() {
  const k = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * k;
  canvas.height = H * k;
  const g = canvas.getContext("2d")!;
  g.scale(k, k);
  const horizon = H * 0.5;

  const sky = g.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#1b2140");
  sky.addColorStop(0.45, "#5a4a78");
  sky.addColorStop(0.78, "#e08a5a");
  sky.addColorStop(1, "#ffc46b");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, horizon + 2);

  const sun = g.createRadialGradient(W * 0.5, horizon - 40, 4, W * 0.5, horizon - 40, 260);
  sun.addColorStop(0, "rgba(255,246,214,1)");
  sun.addColorStop(0.12, "rgba(255,222,150,0.95)");
  sun.addColorStop(0.4, "rgba(255,170,80,0.35)");
  sun.addColorStop(1, "rgba(255,140,60,0)");
  g.fillStyle = sun;
  g.fillRect(0, 0, W, horizon + 40);
  g.fillStyle = "#fff4d8";
  g.beginPath();
  g.arc(W * 0.5, horizon - 40, 30, 0, Math.PI * 2);
  g.fill();

  // Thin clouds.
  g.fillStyle = "rgba(255,200,170,0.22)";
  for (const [x, y, w] of [[90, 330, 220], [380, 270, 260], [210, 470, 180], [470, 520, 140]]) {
    g.beginPath();
    g.ellipse(x, y, w / 2, 7, 0, 0, Math.PI * 2);
    g.fill();
  }

  // Far ridge with a tiny lighthouse on it, right under the sun: the reward for zooming in.
  const ridge = (color: string, base: number, amp: number, freq: number, phase: number) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) g.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(x * freq + phase)) - amp * 0.4 * Math.sin(x * freq * 2.7 + phase * 2));
    g.lineTo(W, H);
    g.fill();
  };
  ridge("#7a4f62", horizon + 10, 26, 0.012, 1.2);
  const lx = W * 0.5 + 6;
  const ly = horizon - 4;
  g.fillStyle = "#3a2534";
  g.fillRect(lx - 3, ly - 22, 6, 22);
  g.fillRect(lx - 5, ly - 26, 10, 4);
  g.fillStyle = "#fff1b8";
  g.fillRect(lx - 2.5, ly - 31, 5, 5);
  // Two birds near the sun.
  g.strokeStyle = "rgba(40,24,36,0.9)";
  g.lineWidth = 1.4;
  for (const [x, y, s] of [[W * 0.5 - 30, horizon - 92, 6], [W * 0.5 - 14, horizon - 100, 4.5]]) {
    g.beginPath();
    g.moveTo(x - s, y);
    g.quadraticCurveTo(x - s / 2, y - s * 0.6, x, y);
    g.quadraticCurveTo(x + s / 2, y - s * 0.6, x + s, y);
    g.stroke();
  }

  ridge("#4b2f45", horizon + 70, 70, 0.008, 3.1);
  ridge("#2a1b2a", horizon + 190, 110, 0.006, 0.4);
  // Water reflection band.
  const sea = g.createLinearGradient(0, horizon + 230, 0, H);
  sea.addColorStop(0, "#3b2433");
  sea.addColorStop(1, "#0e0a10");
  g.fillStyle = sea;
  g.fillRect(0, horizon + 230, W, H);
  g.fillStyle = "rgba(255,200,120,0.25)";
  for (let i = 0; i < 18; i++) {
    const y = horizon + 250 + i * 22;
    const w = 120 - i * 5;
    g.fillRect(W * 0.5 - w / 2 + Math.sin(i * 1.7) * 14, y, w, 3);
  }
  return canvas;
}

export class CameraScreen {
  readonly canvas = document.createElement("canvas");
  readonly texture: THREE.CanvasTexture;
  private g: CanvasRenderingContext2D;
  private scene = paintScene();

  constructor() {
    this.canvas.width = W;
    this.canvas.height = H;
    this.g = this.canvas.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.anisotropy = 4;
    this.texture.generateMipmaps = false;
    this.texture.minFilter = THREE.LinearFilter;
  }

  draw(zoom: number, dial: number) {
    const g = this.g;
    g.clearRect(0, 0, W, H);

    // Viewfinder: crop the pre-rendered scene around the sun.
    const cx = W * 0.5;
    const cy = H * 0.47;
    const sw = (W * 2) / zoom;
    const sh = (H * 2) / zoom;
    g.drawImage(this.scene, cx * 2 - sw * 0.5, cy * 2 - sh * (cy / H), sw, sh, 0, 0, W, H);

    // Top bar.
    g.fillStyle = "rgba(0,0,0,0.55)";
    g.fillRect(0, 0, W, 150);
    g.fillStyle = "rgba(255,255,255,0.9)";
    this.pill(52, 104, 46, 46, 23, "rgba(255,255,255,0.14)");
    g.fillStyle = "#ffd60a";
    g.beginPath();
    g.moveTo(80, 112); g.lineTo(68, 130); g.lineTo(76, 130); g.lineTo(72, 146); g.lineTo(86, 126); g.lineTo(78, 126);
    g.closePath();
    g.fill();
    this.pill(W - 98, 104, 46, 46, 23, "rgba(255,255,255,0.14)");
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(W - 75, 127, 10, 0, Math.PI * 2);
    g.stroke();

    // Bottom controls.
    const bottom = g.createLinearGradient(0, H - 330, 0, H);
    bottom.addColorStop(0, "rgba(0,0,0,0)");
    bottom.addColorStop(0.25, "rgba(0,0,0,0.6)");
    bottom.addColorStop(1, "rgba(0,0,0,0.85)");
    g.fillStyle = bottom;
    g.fillRect(0, H - 330, W, 330);

    // Zoom pills (hidden while the Camera Control dial is up).
    g.globalAlpha = 1 - dial;
    const active = STOPS.reduce((best, stop) => (Math.abs(Math.log(stop / zoom)) < Math.abs(Math.log(best / zoom)) ? stop : best), 1);
    const px = W / 2 - (STOPS.length - 1) * 33;
    this.pill(px - 40, H - 352, (STOPS.length - 1) * 66 + 80, 64, 32, "rgba(0,0,0,0.38)");
    STOPS.forEach((stop, i) => {
      const x = px + i * 66;
      const on = stop === active;
      g.fillStyle = on ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.12)";
      g.beginPath();
      g.arc(x, H - 320, on ? 26 : 20, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = on ? "#ffd60a" : "rgba(255,255,255,0.92)";
      g.font = (on ? "700 21px " : "600 18px ") + FONT;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(on ? fmt(zoom) : String(stop).replace(".", ","), x, H - 319);
    });
    g.globalAlpha = 1;

    g.font = "600 22px " + FONT;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const modes = ["VÍDEO", "FOTO", "RETRATO"];
    modes.forEach((mode, i) => {
      g.fillStyle = i === 1 ? "#ffd60a" : "rgba(255,255,255,0.88)";
      g.fillText(mode, W / 2 + (i - 1) * 140, H - 236);
    });

    // Shutter.
    g.strokeStyle = "#fff";
    g.lineWidth = 7;
    g.beginPath();
    g.arc(W / 2, H - 140, 58, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(W / 2, H - 140, 47, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.2)";
    this.pill(84, H - 175, 70, 70, 14, "rgba(180,140,110,0.85)");
    g.beginPath();
    g.arc(W - 118, H - 140, 34, 0, Math.PI * 2);
    g.fill();

    if (dial > 0.001) this.drawDial(zoom, dial);
    this.texture.needsUpdate = true;
  }

  /** The Camera Control overlay: a curved zoom scale along the right edge, centred on the button. */
  private drawDial(zoom: number, dial: number) {
    const g = this.g;
    const cy = H * CONTROL_V;
    const edge = W - 10;
    const k = 300; // px per doubling
    const span = 300;
    const R = 520;
    const curve = (dy: number) => R - Math.sqrt(Math.max(0, R * R - dy * dy));
    const current = Math.log2(zoom);
    g.save();
    g.globalAlpha = dial;

    const shade = g.createLinearGradient(W - 220, 0, W, 0);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = shade;
    g.fillRect(W - 220, cy - span - 40, 220, span * 2 + 80);

    for (let v = -1; v <= 3.0001; v += 0.1) {
      const dy = (v - current) * k;
      if (Math.abs(dy) > span) continue;
      const fade = 1 - Math.abs(dy) / span;
      const major = STOPS.some((stop) => Math.abs(Math.log2(stop) - v) < 0.02);
      const x = edge - 28 - curve(dy);
      g.strokeStyle = `rgba(255,255,255,${(major ? 0.95 : 0.45) * fade})`;
      g.lineWidth = major ? 3 : 2;
      g.beginPath();
      g.moveTo(x, cy + dy);
      g.lineTo(x - (major ? 26 : 14), cy + dy);
      g.stroke();
    }
    g.font = "600 20px " + FONT;
    g.textAlign = "right";
    g.textBaseline = "middle";
    for (const stop of STOPS) {
      const dy = (Math.log2(stop) - current) * k;
      if (Math.abs(dy) > span - 20 || Math.abs(dy) < 34) continue;
      g.fillStyle = `rgba(255,255,255,${0.9 * (1 - Math.abs(dy) / span)})`;
      g.fillText(String(stop).replace(".", ","), edge - 66 - curve(dy), cy + dy);
    }
    // Indicator and value.
    g.strokeStyle = "#ffd60a";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(edge - 10, cy);
    g.lineTo(edge - 64, cy);
    g.stroke();
    g.fillStyle = "#ffd60a";
    g.font = "700 30px " + FONT;
    g.fillText(fmt(zoom), edge - 76, cy);
    g.font = "600 15px " + FONT;
    g.fillStyle = "rgba(255,255,255,0.75)";
    g.fillText("ZOOM", edge - 76, cy - 34);
    g.restore();
  }

  private pill(x: number, y: number, w: number, h: number, r: number, fill: string) {
    const g = this.g;
    g.fillStyle = fill;
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    g.fill();
  }

  dispose() {
    this.texture.dispose();
  }
}
