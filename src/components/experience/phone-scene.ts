import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Finish } from "@/data/site";
import { CAMERA_LOOP, CameraScreen, cameraTimeline } from "./camera-screen";

/** Everything the scroll timeline animates. Positions are in viewport units (-1..1), `h` is phone height / viewport height. */
export type StageState = {
  x: number;
  y: number;
  h: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Focus point in model space (model height = 1). The phone rotates and zooms around it. */
  fx: number;
  fy: number;
  screen: number;
  halo: number;
  haloSize: number;
  float: number;
  interact: number;
  /** 0..1: the display shows the camera app and the Camera Control lights up when pressed. */
  cam: number;
};

export type Pose = Partial<StageState>;

const FOV = 26;
const BACK_LOGO = { mask: "/3d/apple-logo-mask.png", top: 0.6098, height: 0.1337, aspect: 827 / 1024 };
const DIST = 7;
const HALO_Z = -2.6;
const TAU = Math.PI * 2;

const passVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const noise = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
`;

/**
 * Molten amber halo behind the phone: a soft core, one continuous ring with layered falloff and a slow
 * shimmer travelling around it. Noise is sampled on the unit circle (no atan seam), there are no hard
 * rays or concentric stripes, and the output is dithered so the long gradients never band.
 */
const haloFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  ${noise}
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) { v += amp * noise(p); p = p * 2.03 + 17.1; amp *= 0.5; }
    return v;
  }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    vec2 dir = p / max(r, 1e-4);
    float t = uTime;

    // Seamless angular fields: the direction vector wraps around without a discontinuity.
    float wobble = fbm(dir * 1.4 + vec2(t * 0.045, -t * 0.035));
    float shimmer = fbm(dir * 2.2 + vec2(-t * 0.07, t * 0.05) + 4.0);
    float haze = fbm(dir * 2.8 + vec2(r * 1.6 - t * 0.06, t * 0.03) + 9.0);

    float ringR = 0.5 + 0.022 * (wobble - 0.5);
    float d = r - ringR;
    float hot = exp(-d * d * 5200.0);
    float ring = exp(-d * d * 950.0);
    float glow = exp(-d * d * 95.0);
    float bloom = exp(-d * d * 14.0);
    float core = exp(-r * r * 4.6);

    float live = 0.62 + 0.38 * smoothstep(0.32, 0.72, shimmer);
    float mist = smoothstep(0.35, 0.75, haze) * smoothstep(0.98, 0.52, r) * smoothstep(0.2, 0.5, r);

    vec3 ember = vec3(0.6, 0.23, 0.03);
    vec3 amber = vec3(1.0, 0.55, 0.12);
    vec3 gold = vec3(1.0, 0.82, 0.48);
    vec3 col = ember * core * 0.5
      + ember * bloom * 0.22
      + amber * glow * 0.36 * live
      + gold * ring * 0.62 * live
      + vec3(1.0, 0.93, 0.78) * hot * 0.32 * live
      + amber * mist * 0.05;
    col *= smoothstep(1.0, 0.66, r) * uIntensity;
    col += (hash(gl_FragCoord.xy + fract(t * 7.0) * 113.0) - 0.5) / 255.0;
    gl_FragColor = vec4(max(col, 0.0), 0.0);
  }
`;

/** Living wallpaper for the display, in the brand palette. */
const screenFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uBright;
  uniform sampler2D uCam;
  uniform float uCamMix;
  vec3 blob(vec2 uv, vec2 c, float r, vec3 col) {
    vec2 d = (uv - c) * vec2(1.0, 2.17);
    return col * exp(-dot(d, d) / (r * r));
  }
  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.16;
    vec3 col = vec3(0.01, 0.01, 0.018);
    col += blob(uv, vec2(0.28 + 0.12 * sin(t), 0.8 + 0.05 * cos(t * 1.3)), 0.62, vec3(1.0, 0.55, 0.1) * 0.95);
    col += blob(uv, vec2(0.78 + 0.1 * cos(t * 0.8), 0.52 + 0.07 * sin(t * 1.1)), 0.52, vec3(0.92, 0.28, 0.06) * 0.75);
    col += blob(uv, vec2(0.32 + 0.14 * sin(t * 0.7 + 2.0), 0.24 + 0.06 * cos(t)), 0.66, vec3(0.16, 0.2, 0.62) * 0.9);
    col += blob(uv, vec2(0.82, 0.08 + 0.05 * sin(t * 1.7)), 0.42, vec3(1.0, 0.8, 0.38) * 0.55);
    col = 1.0 - exp(-col * 1.55);
    float vign = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(1.4, 1.0)));
    col *= mix(0.55, 1.0, vign) * uBright;
    if (uCamMix > 0.001) {
      // The display UVs run top (v = 0) to bottom; canvas textures are flipped.
      vec3 cam = texture2D(uCam, vec2(uv.x, 1.0 - uv.y)).rgb;
      col = mix(col, cam * min(uBright, 1.15), uCamMix);
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

const dustVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixel;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.06 + aSeed * 0.08) + 4.0, 8.0) - 4.0;
    p.x += sin(uTime * 0.3 + aSeed * 30.0) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.0 + aSeed * 2.6) * uPixel * (7.0 / -mv.z);
    vAlpha = (0.25 + 0.75 * fract(aSeed * 13.7)) * smoothstep(4.0, 2.4, abs(p.y));
  }
`;

const dustFragment = /* glsl */ `
  varying float vAlpha;
  uniform float uIntensity;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha * uIntensity;
    gl_FragColor = vec4(vec3(1.0, 0.78, 0.45) * a, 0.0);
  }
`;

type FinishKey = "frame" | "polished" | "glass" | "ring";

export class PhoneScene {
  readonly state: StageState = { x: 0.42, y: 0, h: 0.8, yaw: -0.5, pitch: 0.08, roll: -0.1, fx: 0, fy: 0, screen: 1, halo: 1, haloSize: 1.2, float: 1, interact: 1, cam: 0 };
  /** Offsets used by the entrance animation. */
  readonly intro = { yaw: 0, y: 0, scale: 1 };
  onProject?: (x: number, y: number) => void;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  private root = new THREE.Group();
  private pivot = new THREE.Group();
  private halo: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private dust: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  // The display, the black panel and the Dynamic Island share one plane in the model: offsets keep them from fighting.
  private screenMaterial = new THREE.ShaderMaterial({
    vertexShader: passVertex,
    fragmentShader: screenFragment,
    uniforms: { uTime: { value: 0 }, uBright: { value: 1 }, uCam: { value: null as THREE.Texture | null }, uCamMix: { value: 0 } },
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4,
  });
  private finishMaterials: Record<FinishKey, THREE.MeshPhysicalMaterial[]> = { frame: [], polished: [], glass: [], ring: [] };
  private finishTargets: Record<FinishKey, THREE.Color> = {
    frame: new THREE.Color("#c9cacd"), polished: new THREE.Color("#eceded"), glass: new THREE.Color("#d7d8db"), ring: new THREE.Color("#d9dadd"),
  };
  private envTarget?: THREE.WebGLRenderTarget;
  private cameraScreen?: CameraScreen;
  private cameraVideo?: HTMLVideoElement;
  private videoTexture?: THREE.VideoTexture;
  private videoBlocked = false;
  private controlMaterial?: THREE.MeshPhysicalMaterial;
  private controlGlow?: THREE.Sprite;
  private controlRipple?: THREE.Sprite;
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  private drag = { active: false, yaw: 0, velocity: 0, idle: 0, lastX: 0, lastT: 0 };
  private lastProjection = { x: -1, y: -1 };
  private loaded = false;
  private elapsed = 0;

  constructor(canvas: HTMLCanvasElement, pixelRatio: number) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.02;

    this.camera.position.set(0, 0, DIST);
    this.scene.add(this.camera);
    this.root.add(this.pivot);
    this.scene.add(this.root);

    const key = new THREE.DirectionalLight(0xfff3e0, 1.4);
    key.position.set(-3, 4, 6);
    const rim = new THREE.DirectionalLight(0xffc77a, 0.6);
    rim.position.set(5, 1.5, -4);
    const fill = new THREE.DirectionalLight(0xdfe6ff, 0.45);
    fill.position.set(4, -2, 5);
    this.scene.add(key, rim, fill);

    this.halo = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader: passVertex,
        fragmentShader: haloFragment,
        uniforms: { uTime: { value: 0 }, uIntensity: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        premultipliedAlpha: true,
      }),
    );
    this.halo.renderOrder = -1;
    this.scene.add(this.halo);

    const count = 240;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 0.5;
      seeds[i] = Math.random();
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    dustGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    this.dust = new THREE.Points(dustGeometry, new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: { uTime: { value: 0 }, uPixel: { value: pixelRatio }, uIntensity: { value: 0.9 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      premultipliedAlpha: true,
    }));
    this.scene.add(this.dust);

    this.buildEnvironment();
  }

  /** Studio reflections: white softboxes plus amber strips that echo the halo, so the metal picks up the brand gold. */
  private buildEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = new THREE.Scene();
    const disposables: { dispose: () => void }[] = [];
    const room = new THREE.BoxGeometry(24, 24, 24);
    const roomMaterial = new THREE.MeshBasicMaterial({ color: 0x1c1c20, side: THREE.BackSide });
    env.add(new THREE.Mesh(room, roomMaterial));
    disposables.push(room, roomMaterial);
    const panel = (w: number, h: number, color: string, intensity: number, position: [number, number, number]) => {
      const geometry = new THREE.PlaneGeometry(w, h);
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.lookAt(0, 0, 0);
      env.add(mesh);
      disposables.push(geometry, material);
    };
    panel(14, 5, "#ffffff", 2.6, [0, 10, 1]);
    panel(8, 7, "#ffffff", 1.6, [-4, 2, 10]);
    panel(2.4, 16, "#ffb347", 1.7, [-10, 0, 1]);
    panel(2.5, 16, "#ffffff", 1.9, [10, 0, -1]);
    panel(12, 3, "#ff9a2e", 0.9, [0, -7, -7]);
    panel(6, 6, "#e6ecff", 0.9, [6, -3, 8]);
    // Tall side softboxes so the aluminium edges catch light from every angle of the turntable.
    panel(5, 18, "#ffffff", 1.4, [-8, 0, -6]);
    panel(5, 18, "#fff4e6", 1.2, [8, 0, 6]);
    panel(10, 10, "#ffffff", 0.7, [0, 2, -11]);
    panel(15, 8, "#ffffff", 1.05, [1.5, 1, 11]);
    panel(16, 7, "#fff8ee", 0.75, [0, -10, 4]);
    this.envTarget = pmrem.fromScene(env, 0.03);
    this.scene.environment = this.envTarget.texture;
    pmrem.dispose();
    disposables.forEach((item) => item.dispose());
  }

  async load(url: string, decoderPath: string) {
    const draco = new DRACOLoader();
    draco.setDecoderPath(decoderPath);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    const gltf = await loader.loadAsync(url);
    draco.dispose();

    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const unit = 1 / size.y;
    model.scale.setScalar(unit);
    model.position.copy(center).multiplyScalar(-unit);

    const cache = new Map<string, THREE.Material>();
    model.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const source = mesh.material as THREE.MeshStandardMaterial;
      const name = source.name || "";
      let material = cache.get(name);
      if (!material) {
        material = this.materialFor(name, source);
        cache.set(name, material);
      }
      mesh.material = material;
      if (name.startsWith("Vidro Frontal") || name.startsWith("Safira (Lente)")) mesh.renderOrder = 2;
    });
    this.pivot.add(model);
    this.addControlLight(model);
    await this.addBackLogo(model);
    // Compile every shader before the first visible frame so the entrance does not stutter.
    try {
      await this.renderer.compileAsync(this.scene, this.camera);
    } catch {
      // Older drivers without parallel compile simply compile on first render.
    }
    this.loaded = true;
  }

  private materialFor(name: string, source: THREE.MeshStandardMaterial): THREE.Material {
    const physical = (params: THREE.MeshPhysicalMaterialParameters, finish?: FinishKey) => {
      const material = new THREE.MeshPhysicalMaterial(params);
      if (finish) {
        material.color.copy(this.finishTargets[finish]);
        this.finishMaterials[finish].push(material);
      }
      return material;
    };
    if (name.startsWith("Aluminio Acetinado")) return physical({ metalness: 1, roughness: 0.34, envMapIntensity: 1.15 }, "frame");
    if (name.startsWith("Aluminio Polido")) return physical({ metalness: 1, roughness: 0.1, envMapIntensity: 1.3 }, "polished");
    if (name.startsWith("Anel da Lente")) return physical({ metalness: 1, roughness: 0.08, envMapIntensity: 1.4 }, "ring");
    if (name.startsWith("Vidro Traseiro")) return physical({ metalness: 0, roughness: 0.58, clearcoat: 0.22, clearcoatRoughness: 0.62, sheen: 0.35, sheenRoughness: 0.75, sheenColor: new THREE.Color(0xffffff), envMapIntensity: 1.05 }, "glass");
    if (name.startsWith("Janela de Antena")) return physical({ metalness: 0, roughness: 0.5, envMapIntensity: 0.9 }, "glass");
    if (name.startsWith("Vidro Frontal") || name.startsWith("Safira (Lente)")) {
      // Glass only adds its reflections on top of what is underneath.
      return new THREE.MeshPhysicalMaterial({
        color: 0x000000, metalness: 0, roughness: 0.03, envMapIntensity: 1.6, specularIntensity: 1,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
    }
    if (name.startsWith("Tela")) return this.screenMaterial;
    if (name.startsWith("Elemento Optico")) {
      return new THREE.MeshPhysicalMaterial({ color: 0x030308, metalness: 0, roughness: 0.04, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [180, 420], envMapIntensity: 1.6 });
    }
    if (name.startsWith("Safira do Controle")) {
      this.controlMaterial = new THREE.MeshPhysicalMaterial({ color: 0x5d5e63, metalness: 0.85, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.3, emissive: 0xffb54a, emissiveIntensity: 0 });
      return this.controlMaterial;
    }
    if (name.startsWith("Difusor do Flash")) return new THREE.MeshPhysicalMaterial({ color: 0xf1ece0, roughness: 0.38, sheen: 0.4, envMapIntensity: 0.8 });
    if (name.startsWith("Dynamic Island") || name.startsWith("Lente Camera Frontal")) {
      source.polygonOffset = true;
      source.polygonOffsetFactor = -2;
      source.polygonOffsetUnits = name.startsWith("Lente") ? -12 : -8;
    }
    source.envMapIntensity = 1;
    return source;
  }

  /**
   * Logo on the back glass, traced from the reference render (public/3d/apple-logo-mask.png).
   * Measured on the reference: centred horizontally, its centre 61.0% down from the top of the phone,
   * 13.37% of the phone height tall. The mask has 4 px of padding on each side, hence the small factors below.
   */
  private async addBackLogo(model: THREE.Object3D) {
    let glass: THREE.Mesh | undefined;
    model.traverse((object) => {
      if (!glass && (object as THREE.Mesh).isMesh && object.name.replace(/_/g, " ").startsWith("Vidro Traseiro")) glass = object as THREE.Mesh;
    });
    if (!glass) return;
    let mask: THREE.Texture;
    try {
      mask = await new THREE.TextureLoader().loadAsync(BACK_LOGO.mask);
    } catch {
      return;
    }
    mask.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    mask.colorSpace = THREE.NoColorSpace;

    model.updateMatrixWorld(true);
    const height = BACK_LOGO.height * (1024 / 1016);
    const width = height * BACK_LOGO.aspect;
    const centerY = 0.5 - BACK_LOGO.top;
    // Find the glass surface under the logo (the back faces -Z).
    const ray = new THREE.Raycaster(new THREE.Vector3(0, centerY, -5), new THREE.Vector3(0, 0, 1));
    const hit = ray.intersectObject(glass, false)[0];
    const localHit = hit ? this.pivot.worldToLocal(hit.point.clone()) : new THREE.Vector3(0, centerY, new THREE.Box3().setFromObject(glass).min.z);

    const material = new THREE.MeshPhysicalMaterial({
      alphaMap: mask,
      transparent: true,
      depthWrite: false,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.25,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
    });
    // The logo takes the polished-edge tone of each finish, like the real one.
    material.color.copy(this.finishTargets.polished);
    this.finishMaterials.polished.push(material);

    const logo = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    logo.name = "Logo Traseira";
    logo.rotation.y = Math.PI;
    logo.position.set(0, centerY, localHit.z - 0.0005);
    logo.renderOrder = 1;
    this.pivot.add(logo);
  }

  /** Soft light that leaks out of the Camera Control while a finger slides on it, plus a ripple on each press. */
  private addControlLight(model: THREE.Object3D) {
    let control: THREE.Object3D | undefined;
    model.traverse((object) => {
      // GLTFLoader turns spaces in node names into underscores.
      const name = object.name.replace(/_/g, " ");
      if (!control && name.startsWith("Controle da Camera") && name.includes("Safira")) control = object;
    });
    if (!control) return;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(control);
    const center = this.pivot.worldToLocal(box.getCenter(new THREE.Vector3()));
    const size = box.getSize(new THREE.Vector3()).multiplyScalar(1 / this.pivot.matrixWorld.getMaxScaleOnAxis());
    const length = Math.max(size.x, size.y, size.z);

    const radial = (stops: [number, string][]) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      const g = canvas.getContext("2d")!;
      const gradient = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      stops.forEach(([at, color]) => gradient.addColorStop(at, color));
      g.fillStyle = gradient;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(canvas);
    };
    const sprite = (map: THREE.Texture) => {
      const material = new THREE.SpriteMaterial({ map, color: 0xffc46a, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
      const item = new THREE.Sprite(material);
      item.renderOrder = 3;
      // A hair outside the side rail.
      item.position.copy(center).add(new THREE.Vector3(Math.sign(center.x || 1) * 0.006, 0, 0));
      this.pivot.add(item);
      return item;
    };
    this.controlGlow = sprite(radial([[0, "rgba(255,255,255,1)"], [0.18, "rgba(255,226,170,0.85)"], [0.45, "rgba(255,170,70,0.28)"], [1, "rgba(255,140,40,0)"]]));
    this.controlGlow.scale.set(length * 1.25, length * 2.1, 1);
    this.controlRipple = sprite(radial([[0, "rgba(255,200,120,0)"], [0.72, "rgba(255,200,120,0)"], [0.86, "rgba(255,230,180,0.9)"], [1, "rgba(255,200,120,0)"]]));
    this.controlRipple.userData.base = length;
  }

  /** Swap the drawn camera app for a recorded video. It should follow the CAMERA_LOOP choreography. */
  setCameraVideo(src: string) {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    this.cameraVideo = video;
    this.videoTexture = texture;
  }

  setFinish(finish: Finish) {
    this.finishTargets.frame.set(finish.frame);
    this.finishTargets.polished.set(finish.polished);
    this.finishTargets.glass.set(finish.glass);
    this.finishTargets.ring.set(finish.ring);
  }

  /** A quick turn that celebrates a finish change. */
  spin(amount = TAU) {
    this.drag.velocity += amount * 2.6;
    this.drag.idle = 0;
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  dragStart(x: number) {
    this.drag.active = true;
    this.drag.lastX = x;
    this.drag.lastT = performance.now();
    this.drag.velocity = 0;
  }

  dragMove(x: number) {
    if (!this.drag.active) return;
    const now = performance.now();
    const delta = (x - this.drag.lastX) * 0.011;
    const dt = Math.max(0.008, (now - this.drag.lastT) / 1000);
    this.drag.yaw += delta;
    this.drag.velocity = delta / dt;
    this.drag.lastX = x;
    this.drag.lastT = now;
    this.drag.idle = 0;
  }

  dragEnd() {
    this.drag.active = false;
  }

  setSize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  get isLoaded() {
    return this.loaded;
  }

  render(dt: number) {
    this.elapsed += dt;
    const t = this.elapsed;
    const s = this.state;
    const ease = (rate: number) => 1 - Math.exp(-dt * rate);

    // Drag inertia, then a calm return to the scripted pose.
    if (!this.drag.active) {
      this.drag.yaw += this.drag.velocity * dt;
      this.drag.velocity *= Math.exp(-dt * 3.2);
      this.drag.idle += dt;
      if (this.drag.idle > 2.4 && Math.abs(this.drag.velocity) < 0.3) {
        const home = Math.round(this.drag.yaw / TAU) * TAU;
        this.drag.yaw += (home - this.drag.yaw) * ease(1.8);
      }
    }
    this.pointer.sx += (this.pointer.x - this.pointer.sx) * ease(3.5);
    this.pointer.sy += (this.pointer.y - this.pointer.sy) * ease(3.5);

    const visibleHeight = 2 * DIST * Math.tan((FOV * Math.PI) / 360);
    const visibleWidth = visibleHeight * this.camera.aspect;
    const scale = s.h * visibleHeight * this.intro.scale;
    const bob = Math.sin(t * 0.9) * 0.014 * s.float;

    this.root.position.set((s.x * visibleWidth) / 2, ((s.y + bob + this.intro.y) * visibleHeight) / 2, 0);
    this.root.scale.setScalar(scale);
    this.root.rotation.set(
      s.pitch - this.pointer.sy * 0.12 * s.interact + Math.sin(t * 0.7) * 0.02 * s.float,
      s.yaw + this.drag.yaw + this.intro.yaw + this.pointer.sx * 0.24 * s.interact,
      s.roll + Math.sin(t * 0.55) * 0.014 * s.float,
      "XZY",
    );
    this.pivot.position.set(-s.fx, -s.fy, 0);

    const depth = (DIST - HALO_Z) / DIST;
    this.halo.position.set(this.root.position.x * depth, this.root.position.y * depth, HALO_Z);
    const haloScale = s.h * visibleHeight * s.haloSize * depth * (0.96 + Math.sin(t * 0.8) * 0.02);
    this.halo.scale.set(haloScale, haloScale, 1);
    this.halo.material.uniforms.uTime.value = t;
    this.halo.material.uniforms.uIntensity.value = s.halo;
    this.dust.material.uniforms.uTime.value = t;
    this.dust.position.set(this.pointer.sx * -0.15, this.pointer.sy * 0.1, 0);
    this.screenMaterial.uniforms.uTime.value = t;
    this.screenMaterial.uniforms.uBright.value = s.screen;
    this.updateCamera(t);

    for (const key of Object.keys(this.finishMaterials) as FinishKey[]) {
      for (const material of this.finishMaterials[key]) material.color.lerp(this.finishTargets[key], ease(5));
    }

    this.renderer.render(this.scene, this.camera);

    if (this.onProject) {
      const projected = this.root.position.clone().project(this.camera);
      const px = (projected.x + 1) / 2;
      const py = (1 - projected.y) / 2;
      if (Math.abs(px - this.lastProjection.x) > 0.002 || Math.abs(py - this.lastProjection.y) > 0.002) {
        this.lastProjection = { x: px, y: py };
        this.onProject(px, py);
      }
    }
  }

  private updateCamera(t: number) {
    const mix = this.state.cam;
    const active = mix > 0.01;
    this.screenMaterial.uniforms.uCamMix.value = mix;
    const video = this.cameraVideo;
    if (video) {
      if (active && video.paused && !this.videoBlocked) {
        // Autoplay can be refused (iOS Low Power Mode, data saver): keep the drawn camera app instead.
        video.play().catch(() => { this.videoBlocked = true; });
      }
      if (!active && !video.paused) video.pause();
    }
    // The video only takes over once it has a frame to show; until then the display never goes black.
    const useVideo = Boolean(video && this.videoTexture && !this.videoBlocked && video.readyState >= 2 && !video.paused);
    if (active && !useVideo && !this.cameraScreen) this.cameraScreen = new CameraScreen();
    const source = useVideo ? this.videoTexture : this.cameraScreen?.texture;
    if (source && this.screenMaterial.uniforms.uCam.value !== source) this.screenMaterial.uniforms.uCam.value = source;
    const clock = useVideo && video ? video.currentTime % CAMERA_LOOP : t;
    const { zoom, glow, ripple } = active ? cameraTimeline(clock) : { zoom: 1, glow: 0, ripple: -1 };
    if (active && !useVideo) this.cameraScreen?.draw(zoom, glow);

    const light = glow * mix;
    if (this.controlMaterial) this.controlMaterial.emissiveIntensity = light * 1.6;
    if (this.controlGlow) {
      const flicker = 0.92 + 0.08 * Math.sin(t * 9.0);
      this.controlGlow.material.opacity = light * flicker;
    }
    if (this.controlRipple) {
      const base = this.controlRipple.userData.base as number;
      const on = ripple >= 0 && active;
      const grow = on ? 1 - (1 - ripple) ** 3 : 0;
      this.controlRipple.material.opacity = on ? (1 - ripple) * 0.9 * mix : 0;
      this.controlRipple.scale.set(base * (0.6 + grow * 1.4), base * (0.9 + grow * 1.8), 1);
    }
  }

  dispose() {
    this.cameraScreen?.dispose();
    if (this.cameraVideo) {
      this.cameraVideo.pause();
      this.cameraVideo.removeAttribute("src");
    }
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material?.dispose();
    });
    this.envTarget?.dispose();
    this.renderer.dispose();
  }
}
