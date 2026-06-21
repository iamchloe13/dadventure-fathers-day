const STEP_TIME = 0.16;
const ATTACK_TIME = 0.2;
const DAMAGE_COOLDOWN = 0.7;
const MAX_HEALTH = 5;

const ADAM_PIRATE_HIT_LINES = [
  "Adam: Pirate hit. Honestly rude, but recoverable.",
  "Adam: Walk it off, Pops. Dramatically, if necessary.",
  "Adam: That pirate had one job, and unfortunately he did it.",
  "Adam: Good news, Pops. Your face blocked the sword.",
  "Adam: Tiny setback. Huge opportunity to pretend that was strategy.",
  "Adam: That looked personal. I support revenge, carefully.",
  "Adam: Heart down, confidence questionable, mission still alive.",
  "Adam: The pirate scored one point. Do not let him build a brand around it.",
  "Adam: Okay, less hugging the pirates with your whole body.",
  "Adam: Still in this. Rescue missions are allowed to have ugly moments."
];

const DIRS = {
  UP: { x: 0, z: -1, rot: Math.PI },
  DOWN: { x: 0, z: 1, rot: 0 },
  LEFT: { x: -1, z: 0, rot: -Math.PI / 2 },
  RIGHT: { x: 1, z: 0, rot: Math.PI / 2 }
};

const LEVELS = [
  {
    name: "Lower Deck",
    objective: "Defeat every pirate crew member. The key appears after the last pirate falls.",
    trigger: "clearCrew",
    map: [
      "#########################",
      "#P....e....##....e.....D#",
      "#..........##...........#",
      "#..C.......##........C..#",
      "#..........##...........#",
      "#.......................#",
      "#.......................#",
      "#.......e...............#",
      "#.......................#",
      "#########################"
    ],
    keySpawn: { x: 12, z: 6 }
  },
  {
    name: "Upper Deck",
    objective: "Find Mr. Smee in the chokepoint and defeat him to claim the key.",
    trigger: "smee",
    map: [
      "###########################",
      "#P.....e.....###.........C#",
      "#............###..........#",
      "#..C.........###....M.....#",
      "#............###..........#",
      "#######..###########..#####",
      "#.........................#",
      "#..................e......#",
      "#.........................#",
      "#......................D..#",
      "###########################"
    ],
    keySpawn: null
  },
  {
    name: "Main Deck",
    objective: "Defeat Captain Hook and rescue Tinker Bell.",
    trigger: "hook",
    map: [
      "###########################",
      "#P........................#",
      "#.........................#",
      "#.........................#",
      "#............H............#",
      "#.........................#",
      "#.........................#",
      "#......................G..#",
      "#.........................#",
      "#.........................#",
      "###########################"
    ],
    keySpawn: null
  }
];

export function startTinkerbellDungeon({ THREE, mount, hud, controls, onVictory, onExit }) {
  const game = new TinkerbellDungeon({ THREE, mount, hud, controls, onVictory, onExit });
  game.start();
  return () => game.destroy();
}

class TinkerbellDungeon {
  constructor({ THREE, mount, hud, controls, onVictory, onExit }) {
    this.THREE = THREE;
    this.mount = mount;
    this.hud = hud;
    this.controls = controls;
    this.onVictory = onVictory;
    this.onExit = onExit;
    this.keys = { UP: false, DOWN: false, LEFT: false, RIGHT: false };
    this.lastKey = "DOWN";
    this.clock = new THREE.Clock();
    this.levelIndex = 0;
    this.raf = 0;
    this.done = false;
    this.damageLinePool = [];
    this.bossDeaths = 0;
  }

  start() {
    this.buildScene();
    this.loadLevel(0, MAX_HEALTH);
    this.bindInputs();
    this.loop();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("resize", this.onResize);
    this.buttonCleanups?.forEach((cleanup) => cleanup());
    clearTimeout(this.damageLineTimeout);
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.tickTockBanner?.remove();
    this.damageOverlay?.remove();
    this.victoryOverlay?.remove();
  }

  buildScene() {
    const { THREE } = this;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#07111d");
    this.scene.fog = new THREE.Fog("#07111d", 10, 34);
    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.mount.appendChild(this.renderer.domElement);
    this.createTickTockBanner();
    this.createDamageOverlay();
    this.createVictoryOverlay();

    this.ambientLight = new THREE.AmbientLight("#9fb6dc", 0.82);
    this.scene.add(this.ambientLight);

    this.moonLight = new THREE.DirectionalLight("#7fa1e6", 2.65);
    this.moonLight.position.set(-8, 22, 11);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.set(2048, 2048);
    this.moonLight.shadow.camera.left = -24;
    this.moonLight.shadow.camera.right = 24;
    this.moonLight.shadow.camera.top = 22;
    this.moonLight.shadow.camera.bottom = -22;
    this.moonLight.shadow.camera.near = 4;
    this.moonLight.shadow.camera.far = 44;
    this.scene.add(this.moonLight);

    this.victoryLight = new THREE.DirectionalLight("#ffe8a4", 0);
    this.victoryLight.position.set(0, 26, 8);
    this.scene.add(this.victoryLight);

    this.playerHeadlightTarget = new THREE.Object3D();
    this.playerHeadlight = new THREE.DirectionalLight("#dbe8ff", 0.7);
    this.playerHeadlight.position.set(0, 10, 6);
    this.playerHeadlight.target = this.playerHeadlightTarget;
    this.scene.add(this.playerHeadlight, this.playerHeadlightTarget);

    this.materials = this.createMaterials();
    this.groups = {
      map: new THREE.Group(),
      actors: new THREE.Group(),
      effects: new THREE.Group()
    };
    this.scene.add(this.groups.map, this.groups.actors, this.groups.effects);
    this.resize();
    this.onResize = () => this.resize();
    window.addEventListener("resize", this.onResize);
  }

  createTickTockBanner() {
    const banner = document.createElement("div");
    if (window.getComputedStyle(this.mount).position === "static") this.mount.style.position = "relative";
    banner.textContent = "*TICK-TOCK... THE CROCODILE IS NEAR!*";
    banner.style.position = "absolute";
    banner.style.left = "50%";
    banner.style.top = "14px";
    banner.style.transform = "translateX(-50%)";
    banner.style.zIndex = "8";
    banner.style.padding = "10px 16px";
    banner.style.border = "2px solid rgba(255, 214, 92, 0.95)";
    banner.style.borderRadius = "8px";
    banner.style.background = "rgba(10, 22, 26, 0.86)";
    banner.style.color = "#ffd65c";
    banner.style.fontWeight = "900";
    banner.style.letterSpacing = "0";
    banner.style.textAlign = "center";
    banner.style.boxShadow = "0 0 22px rgba(255, 171, 59, 0.55)";
    banner.style.pointerEvents = "none";
    banner.style.opacity = "0";
    banner.style.transition = "opacity 120ms ease";
    this.mount.appendChild(banner);
    this.tickTockBanner = banner;
  }

  createDamageOverlay() {
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.left = "50%";
    overlay.style.top = "54px";
    overlay.style.transform = "translateX(-50%)";
    overlay.style.zIndex = "9";
    overlay.style.maxWidth = "min(560px, calc(100% - 32px))";
    overlay.style.padding = "12px 16px";
    overlay.style.borderRadius = "10px";
    overlay.style.background = "rgba(7, 16, 20, 0.84)";
    overlay.style.color = "#f8f8f8";
    overlay.style.textAlign = "center";
    overlay.style.fontWeight = "700";
    overlay.style.lineHeight = "1.35";
    overlay.style.boxShadow = "0 8px 28px rgba(0,0,0,0.34)";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.transition = "opacity 180ms ease";
    this.mount.appendChild(overlay);
    this.damageOverlay = overlay;
  }

  createVictoryOverlay() {
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.zIndex = "10";
    overlay.style.display = "none";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "rgba(11, 16, 20, 0.42)";
    overlay.innerHTML = `
      <div style="max-width:min(680px,calc(100% - 36px));padding:28px 24px;border-radius:16px;background:rgba(255,246,214,0.96);box-shadow:0 20px 60px rgba(0,0,0,0.35);text-align:center;">
        <div style="font-size:34px;font-weight:900;line-height:1.1;color:#1d2c2d;">You defeated the pirates and rescued your Tinker Bell! Happy Father's Day!</div>
        <button type="button" data-victory-continue style="margin-top:20px;padding:12px 18px;border:0;border-radius:999px;background:#ffb944;color:#102427;font-weight:900;cursor:pointer;">Continue</button>
      </div>
    `;
    overlay.querySelector("[data-victory-continue]")?.addEventListener("click", () => {
      if (this.done) return;
      this.done = true;
      this.onVictory?.();
    });
    this.mount.appendChild(overlay);
    this.victoryOverlay = overlay;
  }

  createMaterials() {
    const { THREE } = this;
    const floorTexture = this.createWoodTexture("floor");
    const wallTexture = this.createWoodTexture("wall");
    const darkWoodTexture = this.createWoodTexture("dark");
    return {
      floor: new THREE.MeshStandardMaterial({ color: "#a97443", map: floorTexture, roughness: 0.88, metalness: 0.02, emissive: "#211108", emissiveIntensity: 0.22 }),
      wall: new THREE.MeshStandardMaterial({ color: "#7f5940", map: wallTexture, roughness: 0.92, emissive: "#1c100c", emissiveIntensity: 0.16 }),
      deckUnder: new THREE.MeshStandardMaterial({ color: "#221610", map: darkWoodTexture, roughness: 0.9, emissive: "#080403", emissiveIntensity: 0.12 }),
      rail: new THREE.MeshStandardMaterial({ color: "#231713", map: darkWoodTexture, roughness: 0.86, emissive: "#080403", emissiveIntensity: 0.1 }),
      doorPanel: new THREE.MeshStandardMaterial({ color: "#3a1712", map: darkWoodTexture, roughness: 0.62, emissive: "#240704", emissiveIntensity: 0.2 }),
      doorFrame: new THREE.MeshStandardMaterial({ color: "#ffd36a", emissive: "#ffb02e", emissiveIntensity: 0.4, roughness: 0.4, metalness: 0.1 }),
      doorLockedGlow: new THREE.MeshStandardMaterial({ color: "#ffcf5a", emissive: "#ff8f1f", emissiveIntensity: 0.65, roughness: 0.35 }),
      doorUnlockedGlow: new THREE.MeshStandardMaterial({ color: "#69ff91", emissive: "#1dff68", emissiveIntensity: 1.1, roughness: 0.3 }),
      dadBody: new THREE.MeshStandardMaterial({ color: "#d64f3e", roughness: 0.62 }),
      dadVest: new THREE.MeshStandardMaterial({ color: "#253d63", roughness: 0.66 }),
      skin: new THREE.MeshStandardMaterial({ color: "#f3bd86", roughness: 0.72 }),
      pirateCrew: new THREE.MeshStandardMaterial({ color: "#28425f", roughness: 0.65 }),
      pirateSmee: new THREE.MeshStandardMaterial({ color: "#668aae", roughness: 0.62 }),
      pirateHook: new THREE.MeshStandardMaterial({ color: "#44224f", roughness: 0.58 }),
      bandana: new THREE.MeshStandardMaterial({ color: "#c52c2c", roughness: 0.7 }),
      black: new THREE.MeshStandardMaterial({ color: "#121217", roughness: 0.75 }),
      blade: new THREE.MeshStandardMaterial({ color: "#d7d2c2", emissive: "#fff7e1", emissiveIntensity: 0.16, metalness: 0.45, roughness: 0.22 }),
      tealChest: new THREE.MeshStandardMaterial({ color: "#00aeb7", emissive: "#00444b", emissiveIntensity: 0.36, roughness: 0.45 }),
      goldGlow: new THREE.MeshStandardMaterial({ color: "#ffd700", emissive: "#ffd700", emissiveIntensity: 0.5, roughness: 0.35, metalness: 0.18 }),
      cage: new THREE.MeshStandardMaterial({ color: "#26393c", roughness: 0.58, metalness: 0.18 }),
      torch: new THREE.MeshStandardMaterial({ color: "#ff9f31", emissive: "#ff7b12", emissiveIntensity: 1.15, roughness: 0.2 })
    };
  }

  createWoodTexture(kind) {
    const { THREE } = this;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const palette = {
      floor: ["#7c4b2a", "#a06d3e", "#d19a5a", "#3a2418"],
      wall: ["#4a3429", "#6b4a38", "#8a6148", "#251915"],
      dark: ["#1d120d", "#332019", "#4b3023", "#0e0907"]
    }[kind];
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const plank = kind === "wall" ? 34 : 42;
    for (let y = 0; y < canvas.height; y += plank) {
      const offset = (y / plank) % 2 ? 34 : 0;
      for (let x = -offset; x < canvas.width; x += 86) {
        const shade = Math.sin((x + y) * 0.07) * 12;
        ctx.fillStyle = tint(palette[1], shade);
        ctx.fillRect(x, y, 86, plank - 2);
        ctx.strokeStyle = palette[3];
        ctx.globalAlpha = 0.55;
        ctx.strokeRect(x, y, 86, plank - 2);
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < 170; i += 1) {
      const x = (i * 47) % canvas.width;
      const y = (i * 73) % canvas.height;
      const w = 22 + ((i * 13) % 42);
      ctx.strokeStyle = i % 3 ? palette[2] : palette[3];
      ctx.globalAlpha = i % 3 ? 0.16 : 0.22;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + w * 0.45, y + Math.sin(i) * 6, x + w, y + ((i * 5) % 9) - 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (kind === "wall") {
      ctx.strokeStyle = "#1b1210";
      ctx.globalAlpha = 0.42;
      for (let x = 20; x < canvas.width; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + Math.sin(x) * 5, canvas.height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    return texture;
  }

  loadLevel(index, health = this.player?.health || MAX_HEALTH) {
    this.levelIndex = index;
    this.level = LEVELS[index];
    this.clearLevelObjects();
    this.entities = [];
    this.chests = [];
    this.projectiles = [];
    this.particles = [];
    this.torches = [];
    this.walls = new Set();
    this.doors = new Map();
    this.hasKey = false;
    this.keyItem = null;
    this.cage = null;
    this.player = null;
    this.mainDeck = this.level.trigger === "hook";
    this.gatorBlock = null;
    this.rescueFairy = null;
    this.emergencyChestSpawned = false;
    this.killSequence = {
      active: false,
      timer: 0,
      hook: null,
      fallVector: null,
      fallTile: null,
      gatorEater: null,
      gatorJumped: false,
      finalized: false,
      auraTimer: 0
    };
    this.finalBattle = this.mainDeck ? {
      phase: "hook-fight",
      finalKey: null,
      hasFinalKey: false,
      cageUnlocked: false
    } : null;
    this.tickTock = {
      cooldown: this.mainDeck ? randomRange(15, 20) : Number.POSITIVE_INFINITY,
      active: 0,
      plan: null,
      bannerPulse: 0
    };
    this.setTickTockBanner(false);
    this.hideDamageOverlay();
    this.hideVictoryOverlay();
    this.parseLevel(health);
    this.updateHud(`${this.level.name}: ${this.level.objective}`);
  }

  clearLevelObjects() {
    if (!this.groups) return;
    ["map", "actors", "effects"].forEach((name) => {
      while (this.groups[name].children.length) this.groups[name].remove(this.groups[name].children[0]);
    });
  }

  parseLevel(health) {
    const { THREE } = this;
    const width = this.level.map[0].length;
    const height = this.level.map.length;
    this.center = { x: (width - 1) / 2, z: (height - 1) / 2 };

    this.level.map.forEach((row, z) => {
      [...row].forEach((cell, x) => {
        if (cell !== "#") this.addFloor(x, z, this.materials.floor);
        if (cell === "#") {
          this.walls.add(this.key(x, z));
          this.addWall(x, z, this.materials.wall);
          return;
        }
        if (cell === "D") this.createDoor(x, z);
        if (cell === "P") this.createPlayer(x, z, health);
        if (cell === "C") this.createChest(x, z);
        if (cell === "e") this.createEnemy("crew", x, z);
        if (cell === "M") this.createEnemy("smee", x, z);
        if (cell === "H") this.createEnemy("hook", x, z);
        if (cell === "G") this.createCage(x, z, { hidden: this.mainDeck, locked: this.mainDeck });
      });
    });

    this.addShipTorches(width, height);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(width + 1.4, 0.35, height + 1.4), this.materials.deckUnder);
    deck.position.set(0, -0.26, 0);
    deck.receiveShadow = true;
    this.groups.map.add(deck);

    const railFront = new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.28, 0.18), this.materials.rail);
    railFront.position.set(0, 0.12, height - 0.45 - this.center.z);
    const railBack = railFront.clone();
    railBack.position.z = -0.55 - this.center.z;
    const railLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, height + 1.2), this.materials.rail);
    railLeft.position.set(-0.55 - this.center.x, 0.12, 0);
    const railRight = railLeft.clone();
    railRight.position.x = width - 0.45 - this.center.x;
    [railFront, railBack, railLeft, railRight].forEach((rail) => {
      rail.castShadow = true;
      rail.receiveShadow = true;
      this.groups.map.add(rail);
    });
  }

  addFloor(x, z, material) {
    const floor = new this.THREE.Mesh(new this.THREE.BoxGeometry(1, 0.12, 1), material);
    this.placeGrid(floor, x, z);
    floor.receiveShadow = true;
    this.groups.map.add(floor);
  }

  addWall(x, z, material) {
    const wall = new this.THREE.Mesh(new this.THREE.BoxGeometry(1, 1.35, 1), material);
    this.placeGrid(wall, x, z);
    wall.position.y = 0.68;
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.groups.map.add(wall);
  }

  addShipTorches(width, height) {
    const candidates = [];
    for (let z = 1; z < height - 1; z += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (this.level.map[z][x] === "#") continue;
        const nearWall = [
          this.level.map[z - 1]?.[x],
          this.level.map[z + 1]?.[x],
          this.level.map[z]?.[x - 1],
          this.level.map[z]?.[x + 1]
        ].some((cell) => cell === "#");
        if (nearWall && (x * 3 + z * 5) % 6 === 0) candidates.push({ x, z });
      }
    }
    candidates.slice(0, 14).forEach((spot) => this.createTorch(spot.x, spot.z));
  }

  createTorch(x, z) {
    const { THREE } = this;
    const torch = new THREE.Group();
    const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.38, 8), this.materials.black);
    bracket.rotation.z = Math.PI / 2;
    bracket.position.y = 0.92;
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), this.materials.torch);
    flame.position.y = 1.08;
    const light = new THREE.PointLight("#ffad45", 2.75, 8.6, 1.65);
    light.position.y = 1.15;
    torch.add(bracket, flame, light);
    this.placeGrid(torch, x, z);
    torch.position.y = 0;
    this.groups.map.add(torch);
    this.torches.push({ flame, light, baseIntensity: 2.75, phase: (x * 13 + z * 17) % 31 });
  }

  createSwordMesh(length = 0.72, active = false) {
    const { THREE } = this;
    const group = new THREE.Group();
    const bladeMat = active ? this.materials.blade.clone() : this.materials.blade;
    if (active) bladeMat.emissiveIntensity = 0.36;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.055, length), bladeMat);
    blade.position.z = length * 0.18;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.06), this.materials.goldGlow);
    guard.position.z = -length * 0.32;
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.25), this.materials.black);
    grip.position.z = -length * 0.48;
    group.add(blade, guard, grip);
    this.setShadows(group);
    return group;
  }

  setShadows(root) {
    root.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });
  }

  createDoor(x, z) {
    const { THREE } = this;
    const door = new THREE.Group();
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.18, 0.18), this.materials.doorPanel);
    panel.position.y = 0.68;
    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.36, 0.22), this.materials.doorFrame);
    frameLeft.position.set(-0.44, 0.72, 0.01);
    const frameRight = frameLeft.clone();
    frameRight.position.x = 0.44;
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.12, 0.24), this.materials.doorFrame);
    frameTop.position.set(0, 1.37, 0.01);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.045, 8, 18, Math.PI), this.materials.doorFrame);
    arch.position.set(0, 1.38, 0.03);
    arch.rotation.z = Math.PI;
    const keyPlate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.08), this.materials.doorLockedGlow);
    keyPlate.position.set(0, 0.72, 0.14);
    const glow = new THREE.PointLight("#ffb02e", 1.35, 3.2, 1.7);
    glow.position.set(0, 0.9, 0.55);
    door.add(panel, frameLeft, frameRight, frameTop, arch, keyPlate, glow);
    this.setShadows(door);
    this.placeGrid(door, x, z);
    this.groups.map.add(door);
    this.doors.set(this.key(x, z), { x, z, mesh: door, panel, frame: [frameLeft, frameRight, frameTop, arch], keyPlate, glow, unlocked: false, flash: 0 });
  }

  createPlayer(x, z, health) {
    const { THREE } = this;
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.34), this.materials.dadBody);
    body.position.y = 0.62;
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.44, 0.08), this.materials.dadVest);
    vest.position.set(0, 0.64, 0.19);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 18, 12), this.materials.skin);
    head.position.y = 1.12;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.235, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.46), this.materials.black);
    hair.position.y = 1.2;
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.14), this.materials.skin);
    armL.position.set(-0.38, 0.62, 0.02);
    const armR = armL.clone();
    armR.position.x = 0.38;
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), this.materials.black);
    legL.position.set(-0.15, 0.26, 0);
    const legR = legL.clone();
    legR.position.x = 0.15;
    const sword = this.createSwordMesh(0.68, false);
    sword.position.set(0.42, 0.56, 0.18);
    sword.rotation.x = -0.62;
    sword.rotation.z = -0.45;
    group.add(body, vest, head, hair, armL, armR, legL, legR, sword);
    this.setShadows(group);
    this.groups.actors.add(group);
    this.player = {
      gridX: x,
      gridZ: z,
      fromX: x,
      fromZ: z,
      toX: x,
      toZ: z,
      moveT: 1,
      facing: "DOWN",
      health,
      invulnerable: 0,
      attacking: 0,
      mesh: group
    };
    this.placeGrid(group, x, z);
  }

  createEnemy(type, x, z) {
    const { THREE } = this;
    const config = {
      crew: { hp: 1, material: this.materials.pirateCrew, bandana: this.materials.bandana, scale: 0.74, name: "Pirate Crew" },
      smee: { hp: 4, material: this.materials.pirateSmee, bandana: this.materials.black, scale: 1.0, name: "Mr. Smee" },
      hook: { hp: 5, material: this.materials.pirateHook, bandana: this.materials.black, scale: 1.12, name: "Captain Hook" }
    }[type];
    const group = new THREE.Group();
    const mat = config.material.clone();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.76, 0.45), mat);
    body.position.y = 0.56;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 10), this.materials.skin);
    head.position.y = 1.05;
    const bandana = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.12, 0.48), config.bandana);
    bandana.position.y = 1.18;
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), config.bandana);
    knot.position.set(-0.28, 1.18, 0.1);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.12), this.materials.skin);
    armL.position.set(-0.39, 0.58, 0.02);
    const armR = armL.clone();
    armR.position.x = 0.39;
    const cutlass = this.createSwordMesh(type === "hook" ? 0.76 : 0.58, false);
    cutlass.position.set(0.45, 0.58, 0.16);
    cutlass.rotation.x = -0.7;
    cutlass.rotation.z = -0.55;
    group.add(body, head, bandana, knot, armL, armR, cutlass);
    if (type === "hook") {
      const hat = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.12, 0.58), this.materials.black);
      hat.position.y = 1.32;
      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI * 1.35), this.materials.blade);
      hook.position.set(-0.48, 0.53, 0.08);
      hook.rotation.z = Math.PI / 2;
      group.add(hat, hook);
    }
    this.setShadows(group);
    group.scale.setScalar(config.scale);
    this.groups.actors.add(group);
    this.placeGrid(group, x, z);
    this.entities.push({
      type,
      name: config.name,
      hp: config.hp,
      maxHp: config.hp,
      gridX: x,
      gridZ: z,
      originX: x,
      originZ: z,
      dir: type === "smee" ? "LEFT" : "RIGHT",
      patrolAxis: type === "crew" ? (z % 2 ? "x" : "z") : "x",
      patrolRange: type === "smee" ? 2 : 1,
      stepTimer: 0,
      fireTimer: 1.2,
      panic: false,
      panicTarget: null,
      openApproach: null,
      flash: 0,
      mesh: group,
      material: mat,
      baseColor: mat.color.clone()
    });
  }

  createChest(x, z, options = {}) {
    const { THREE } = this;
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.45, 0.6), this.materials.tealChest);
    base.position.y = 0.28;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.18, 0.66), this.materials.goldGlow);
    lid.position.y = 0.58;
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.08), this.materials.goldGlow);
    lock.position.set(0, 0.38, 0.34);
    const glow = new THREE.PointLight("#ffd65c", 0.8, 2.6, 2);
    glow.position.y = 0.72;
    group.add(base, lid, lock, glow);
    this.setShadows(group);
    this.groups.actors.add(group);
    this.placeGrid(group, x, z);
    this.chests.push({ gridX: x, gridZ: z, opened: false, mesh: group, lid, glow, emergency: !!options.emergency });
  }

  createCage(x, z, options = {}) {
    const { THREE } = this;
    const cage = new THREE.Group();
    const mat = this.materials.cage;
    for (let i = -2; i <= 2; i += 1) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8), mat);
      bar.position.set(i * 0.16, 0.65, 0);
      cage.add(bar);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.5), mat);
    top.position.y = 1.25;
    const bottom = top.clone();
    bottom.position.y = 0.04;
    cage.add(top, bottom);
    this.groups.actors.add(cage);
    this.placeGrid(cage, x, z);
    const fairy = this.createTinkerBellModel();
    fairy.visible = !options.hidden;
    fairy.position.copy(cage.position).add(new THREE.Vector3(0, 0.8, 0));
    this.groups.actors.add(fairy);
    cage.visible = !options.hidden;
    this.cage = { gridX: x, gridZ: z, mesh: cage, fairy, locked: !!options.locked };
  }

  createTinkerBellModel() {
    const { THREE } = this;
    const group = new THREE.Group();
    const glow = new THREE.MeshStandardMaterial({ color: "#ffe77a", emissive: "#ffe77a", emissiveIntensity: 0.85, roughness: 0.28 });
    const wing = new THREE.MeshStandardMaterial({ color: "#d9f7ff", emissive: "#63e7ff", emissiveIntensity: 0.4, transparent: true, opacity: 0.72, roughness: 0.25 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 10), glow);
    const wingL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), wing);
    wingL.scale.set(0.48, 0.1, 1.15);
    wingL.position.x = -0.22;
    const wingR = wingL.clone();
    wingR.position.x = 0.22;
    group.add(body, wingL, wingR);
    return group;
  }

  bindInputs() {
    this.onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key === " ") {
        event.preventDefault();
        this.attack();
      }
      if (key === "e") this.interact();
      const dir = keyMap(key);
      if (dir) {
        event.preventDefault();
        this.keys[dir] = true;
        this.lastKey = dir;
      }
    };
    this.onKeyUp = (event) => {
      const dir = keyMap(event.key.toLowerCase());
      if (dir) this.keys[dir] = false;
    };
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.buttonCleanups = [];
    this.controls?.moveButtons?.forEach((button) => {
      const dir = button.dataset.dungeonControl;
      const down = (event) => {
        event.preventDefault();
        this.keys[dir] = true;
        this.lastKey = dir;
      };
      const up = (event) => {
        event.preventDefault();
        this.keys[dir] = false;
      };
      button.addEventListener("pointerdown", down);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
      button.addEventListener("pointerleave", up);
      this.buttonCleanups.push(() => {
        button.removeEventListener("pointerdown", down);
        button.removeEventListener("pointerup", up);
        button.removeEventListener("pointercancel", up);
        button.removeEventListener("pointerleave", up);
      });
    });
    const attack = () => this.attack();
    const interact = () => this.interact();
    this.controls?.attackButton?.addEventListener("click", attack);
    this.controls?.interactButton?.addEventListener("click", interact);
    this.controls?.exitButton?.addEventListener("click", this.onExit);
    this.buttonCleanups.push(() => {
      this.controls?.attackButton?.removeEventListener("click", attack);
      this.controls?.interactButton?.removeEventListener("click", interact);
      this.controls?.exitButton?.removeEventListener("click", this.onExit);
    });
  }

  loop() {
    const dt = Math.min(0.05, this.clock.getDelta());
    this.update(dt);
    this.render();
    if (!this.done) this.raf = requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    if (this.killSequence.active) {
      this.updateKillSequence(dt);
      this.updateParticles(dt);
      this.updateTorches(dt);
      this.updateDoors(dt);
      this.updateCamera();
      return;
    }
    this.updatePlayer(dt);
    this.updateTickTock(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateParticles(dt);
    this.updateTorches(dt);
    this.updateDoors(dt);
    this.updateCamera();
  }

  updatePlayer(dt) {
    const p = this.player;
    if (p.invulnerable > 0) p.invulnerable -= dt;
    if (p.attacking > 0) {
      p.attacking -= dt;
      if (p.attacking <= 0 && this.sword) {
        this.groups.effects.remove(this.sword);
        this.sword = null;
      }
    }
    if (p.moveT < 1) {
      p.moveT = Math.min(1, p.moveT + dt / STEP_TIME);
      const t = ease(p.moveT);
      this.placeGrid(p.mesh, p.fromX + (p.toX - p.fromX) * t, p.fromZ + (p.toZ - p.fromZ) * t);
      return;
    }
    this.checkKeyPickup();
    this.checkFinalKeyPickup();
    const dir = this.nextDirection();
    if (!dir) return;
    p.facing = dir;
    p.mesh.rotation.y = DIRS[dir].rot;
    const nx = p.gridX + DIRS[dir].x;
    const nz = p.gridZ + DIRS[dir].z;
    const door = this.doors.get(this.key(nx, nz));
    if (door) {
      if (this.hasKey) this.transitionLevel();
      else this.updateHud("The door is locked. Find the key first.");
      return;
    }
    const enemy = this.enemyAt(nx, nz);
    if (enemy) {
      if (p.attacking <= 0 && !(enemy.type === "hook" && enemy.panic)) this.damagePlayer(dir);
      return;
    }
    if (this.isBlocked(nx, nz)) return;
    p.fromX = p.gridX;
    p.fromZ = p.gridZ;
    p.toX = nx;
    p.toZ = nz;
    p.gridX = nx;
    p.gridZ = nz;
    p.moveT = 0;
  }

  nextDirection() {
    if (this.keys[this.lastKey]) return this.lastKey;
    return ["UP", "DOWN", "LEFT", "RIGHT"].find((dir) => this.keys[dir]);
  }

  attack() {
    const p = this.player;
    if (p.attacking > 0 || this.killSequence.active) return;
    p.attacking = ATTACK_TIME;
    const dir = DIRS[p.facing];
    const sx = p.gridX + dir.x;
    const sz = p.gridZ + dir.z;
    const sword = this.createSwordMesh(0.92, true);
    sword.position.set(sx - this.center.x, 0.78, sz - this.center.z);
    sword.rotation.y = p.facing === "LEFT" || p.facing === "RIGHT" ? Math.PI / 2 : 0;
    this.groups.effects.add(sword);
    this.sword = sword;
    const enemy = this.enemyAt(sx, sz);
    if (enemy) this.damageEnemy(enemy, 1);
  }

  interact() {
    const p = this.player;
    const adjacentCage = this.cage
      && this.cage.mesh.visible
      && Math.abs(this.cage.gridX - p.gridX) + Math.abs(this.cage.gridZ - p.gridZ) === 1
      ? this.cage
      : null;
    if (adjacentCage) {
      if (!this.finalBattle?.hasFinalKey) {
        this.updateHud("The cage is locked. Find Hook's final key first.");
        return;
      }
      if (!this.finalBattle.cageUnlocked) {
        this.unlockRescueCage();
        return;
      }
    }
    const adjacent = this.chests.find((chest) => !chest.opened && Math.abs(chest.gridX - p.gridX) + Math.abs(chest.gridZ - p.gridZ) === 1);
    if (!adjacent) {
      this.updateHud("Stand next to a fairy dust box and press E.");
      return;
    }
    adjacent.opened = true;
    adjacent.lid.rotation.x = -0.8;
    adjacent.lid.position.y += 0.18;
    adjacent.glow.intensity = 2.6;
    p.health = MAX_HEALTH;
    this.spawnPixieDust(adjacent.mesh.position);
    this.updateHud(adjacent.emergency ? "Emergency fairy dust chest restored Pops to full hearts." : "Fairy dust restored Dad's hearts.");
  }

  showDamageOverlay(text) {
    if (!this.damageOverlay) return;
    clearTimeout(this.damageLineTimeout);
    const adamLine = text.replace(/^Adam:\s*/i, "");
    this.damageOverlay.innerHTML = [
      `<div><strong>Hayliegh:</strong> "Uh oh!"</div>`,
      `<div style="margin-top:6px;"><strong>Adam:</strong> "${escapeHtml(adamLine)}"</div>`
    ].join("");
    this.damageOverlay.style.opacity = "1";
    this.damageLineTimeout = setTimeout(() => this.hideDamageOverlay(), 3000);
  }

  hideDamageOverlay() {
    if (!this.damageOverlay) return;
    this.damageOverlay.style.opacity = "0";
  }

  showVictoryOverlay() {
    if (!this.victoryOverlay) return;
    this.victoryOverlay.style.display = "flex";
  }

  hideVictoryOverlay() {
    if (!this.victoryOverlay) return;
    this.victoryOverlay.style.display = "none";
  }

  nextDamageLine() {
    if (!this.damageLinePool.length) this.damageLinePool = [...ADAM_PIRATE_HIT_LINES];
    const index = Math.floor(Math.random() * this.damageLinePool.length);
    return this.damageLinePool.splice(index, 1)[0];
  }

  updateEnemies(dt) {
    for (const enemy of this.entities) {
      if (enemy.hp <= 0) continue;
      if (enemy.flash > 0) {
        enemy.flash -= dt;
        enemy.material.color.copy(enemy.flash > 0 ? new this.THREE.Color("#ff3b30") : enemy.baseColor);
      }
      if (enemy.type === "hook") {
        this.updateHook(enemy, dt);
        continue;
      }
      if (this.mainDeck && this.level.trigger === "hook") continue;
      enemy.stepTimer -= dt;
      if (enemy.stepTimer > 0) continue;
      enemy.stepTimer = enemy.type === "smee" ? 0.85 : 0.65;
      this.patrol(enemy);
    }
  }

  updateHook(enemy, dt) {
    if (this.killSequence.active) return;
    if (enemy.panic) {
      enemy.stepTimer -= dt;
      enemy.mesh.rotation.z = Math.sin(this.clock.elapsedTime * 22) * 0.07;
      if (enemy.stepTimer <= 0) {
        enemy.stepTimer = 0.18;
        this.moveHookTowardPanicCorner(enemy);
      }
      return;
    }

    enemy.mesh.rotation.z = 0;
    enemy.fireTimer -= dt;
    if (enemy.fireTimer <= 0) {
      enemy.fireTimer = 0.85;
      this.fireHook(enemy);
    }
  }

  updateTickTock(dt) {
    if (!this.mainDeck || this.killSequence.active || this.finalBattle?.phase !== "hook-fight") {
      this.setTickTockBanner(false);
      return;
    }
    const hook = this.entities?.find((enemy) => enemy.type === "hook" && enemy.hp > 0);
    if (!hook) {
      this.setTickTockBanner(false);
      return;
    }

    if (this.tickTock.active > 0) {
      this.tickTock.active -= dt;
      this.tickTock.bannerPulse += dt;
      this.setTickTockBanner(true);
      if (this.tickTock.active <= 0) {
        this.endTickTock(hook, "timeout");
      }
      return;
    }

    this.tickTock.cooldown -= dt;
    if (this.tickTock.cooldown <= 0) this.startTickTock(hook);
  }

  startTickTock(hook) {
    const plan = this.pickTickTockPlan(hook);
    if (!plan) return;
    this.tickTock.active = randomRange(4.4, 5.1);
    this.tickTock.bannerPulse = 0;
    this.tickTock.plan = plan;
    hook.panic = true;
    hook.panicTarget = plan.corner;
    hook.openApproach = plan.openTile;
    hook.fireTimer = this.tickTock.active + 0.8;
    hook.stepTimer = 0;
    this.projectiles.forEach((projectile) => this.groups.effects.remove(projectile.mesh));
    this.projectiles = [];
    this.spawnTickTockGator(plan);
    this.spawnPixieDust(hook.mesh.position);
    this.setTickTockBanner(true);
    this.updateHud("*TICK-TOCK... THE CROCODILE IS NEAR!* Hook is panicking. Chase him.");
  }

  pickTickTockPlan(hook) {
    const width = this.level.map[0].length;
    const height = this.level.map.length;
    const plans = [
      { corner: { x: 1, z: 1 }, options: [{ blockedTile: { x: 2, z: 1 }, openTile: { x: 1, z: 2 }, rotation: 0 }, { blockedTile: { x: 1, z: 2 }, openTile: { x: 2, z: 1 }, rotation: Math.PI / 2 }] },
      { corner: { x: width - 2, z: 1 }, options: [{ blockedTile: { x: width - 3, z: 1 }, openTile: { x: width - 2, z: 2 }, rotation: Math.PI }, { blockedTile: { x: width - 2, z: 2 }, openTile: { x: width - 3, z: 1 }, rotation: -Math.PI / 2 }] },
      { corner: { x: 1, z: height - 2 }, options: [{ blockedTile: { x: 2, z: height - 2 }, openTile: { x: 1, z: height - 3 }, rotation: 0 }, { blockedTile: { x: 1, z: height - 3 }, openTile: { x: 2, z: height - 2 }, rotation: Math.PI / 2 }] },
      { corner: { x: width - 2, z: height - 2 }, options: [{ blockedTile: { x: width - 3, z: height - 2 }, openTile: { x: width - 2, z: height - 3 }, rotation: Math.PI }, { blockedTile: { x: width - 2, z: height - 3 }, openTile: { x: width - 3, z: height - 2 }, rotation: -Math.PI / 2 }] }
    ].flatMap((plan) => plan.options.map((option) => ({ ...option, corner: plan.corner })))
      .filter((plan) => this.isTileFree(plan.corner.x, plan.corner.z, { ignoreHook: true }) && this.isTileFree(plan.blockedTile.x, plan.blockedTile.z, { ignoreHook: true }) && this.isTileFree(plan.openTile.x, plan.openTile.z, { ignoreHook: true }));
    const ranked = plans.sort((a, b) => {
      const scoreA = Math.abs(a.corner.x - hook.gridX) + Math.abs(a.corner.z - hook.gridZ) + Math.abs(a.corner.x - this.player.gridX) + Math.abs(a.corner.z - this.player.gridZ);
      const scoreB = Math.abs(b.corner.x - hook.gridX) + Math.abs(b.corner.z - hook.gridZ) + Math.abs(b.corner.x - this.player.gridX) + Math.abs(b.corner.z - this.player.gridZ);
      return scoreB - scoreA;
    });
    return ranked[Math.floor(Math.random() * Math.min(2, ranked.length))] || null;
  }

  setTickTockBanner(visible) {
    if (!this.tickTockBanner) return;
    if (!visible) {
      this.tickTockBanner.style.opacity = "0";
      return;
    }
    const flash = Math.sin((this.tickTock?.bannerPulse || 0) * 18) > 0 ? 1 : 0.56;
    this.tickTockBanner.style.opacity = String(flash);
  }

  moveHookTowardPanicCorner(enemy) {
    if (!enemy.panicTarget) return;
    const dx = enemy.panicTarget.x - enemy.gridX;
    const dz = enemy.panicTarget.z - enemy.gridZ;
    if (dx === 0 && dz === 0) return;
    const primary = Math.abs(dx) >= Math.abs(dz)
      ? (dx > 0 ? "RIGHT" : "LEFT")
      : (dz > 0 ? "DOWN" : "UP");
    const secondary = Math.abs(dx) >= Math.abs(dz)
      ? (dz > 0 ? "DOWN" : "UP")
      : (dx > 0 ? "RIGHT" : "LEFT");
    const dir = [primary, secondary].find((candidate) => {
      const step = DIRS[candidate];
      const nx = enemy.gridX + step.x;
      const nz = enemy.gridZ + step.z;
      return !this.isBlocked(nx, nz) && !this.doors.has(this.key(nx, nz));
    });
    if (!dir) return;
    enemy.dir = dir;
    enemy.gridX += DIRS[dir].x;
    enemy.gridZ += DIRS[dir].z;
    enemy.mesh.rotation.y = DIRS[dir].rot + Math.PI;
    this.placeGrid(enemy.mesh, enemy.gridX, enemy.gridZ);
  }

  endTickTock(hook, reason) {
    this.clearTickTockGator();
    this.tickTock.active = 0;
    this.tickTock.plan = null;
    this.setTickTockBanner(false);
    hook.panic = false;
    hook.panicTarget = null;
    hook.openApproach = null;
    hook.mesh.rotation.z = 0;
    this.tickTock.cooldown = randomRange(15, 20);
    if (reason === "timeout" && hook.hp > 0) {
      this.relocateHook(hook, { preferCenter: true });
      this.updateHud("Captain Hook breaks from cover and starts throwing hooks again.");
    }
  }

  spawnTickTockGator(plan) {
    const { THREE } = this;
    this.clearTickTockGator();
    const gator = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: "#3f8f4d", roughness: 0.72, emissive: "#1f4a27", emissiveIntensity: 0.26 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: "#8cc06a", roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.34, 1.08), bodyMat);
    body.position.y = 0.22;
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.18, 0.48), bodyMat);
    snout.position.set(0, 0.22, 0.7);
    const belly = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.78), bellyMat);
    belly.position.set(0, 0.1, 0.08);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), this.materials.goldGlow);
    eyeL.position.set(-0.16, 0.36, 0.92);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.16;
    gator.add(body, snout, belly, eyeL, eyeR);
    gator.rotation.y = plan.rotation;
    this.setShadows(gator);
    this.placeGrid(gator, plan.blockedTile.x, plan.blockedTile.z);
    this.groups.actors.add(gator);
    this.gatorBlock = { mesh: gator, tile: plan.blockedTile, openTile: plan.openTile };
  }

  clearTickTockGator() {
    if (!this.gatorBlock) return;
    this.groups.actors.remove(this.gatorBlock.mesh);
    this.gatorBlock = null;
  }

  patrol(enemy) {
    const dir = DIRS[enemy.dir];
    const nx = enemy.gridX + dir.x;
    const nz = enemy.gridZ + dir.z;
    const overRange = Math.abs(nx - enemy.originX) > enemy.patrolRange || Math.abs(nz - enemy.originZ) > enemy.patrolRange;
    if (overRange || this.isBlocked(nx, nz) || this.enemyAt(nx, nz) || this.doors.has(this.key(nx, nz))) {
      enemy.dir = opposite(enemy.dir);
      return;
    }
    enemy.gridX = nx;
    enemy.gridZ = nz;
    enemy.mesh.rotation.y = DIRS[enemy.dir].rot;
    this.placeGrid(enemy.mesh, nx, nz);
    if (enemy.gridX === this.player.gridX && enemy.gridZ === this.player.gridZ) this.damagePlayer(enemy.dir);
  }

  fireHook(enemy) {
    const dx = this.player.gridX - enemy.gridX;
    const dz = this.player.gridZ - enemy.gridZ;
    const dir = Math.abs(dx) > Math.abs(dz)
      ? (dx >= 0 ? "RIGHT" : "LEFT")
      : (dz >= 0 ? "DOWN" : "UP");
    const mesh = new this.THREE.Mesh(
      new this.THREE.TorusGeometry(0.22, 0.045, 8, 18),
      new this.THREE.MeshStandardMaterial({ color: "#d7d2c2", metalness: 0.45, roughness: 0.25 })
    );
    mesh.position.set(enemy.gridX - this.center.x, 0.7, enemy.gridZ - this.center.z);
    this.groups.effects.add(mesh);
    this.projectiles.push({ x: enemy.gridX, z: enemy.gridZ, dir, mesh, life: 3, speed: 5.8 * this.getHookProjectileSpeedFactor() });
  }

  updateProjectiles(dt) {
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.life -= dt;
      projectile.x += DIRS[projectile.dir].x * dt * projectile.speed;
      projectile.z += DIRS[projectile.dir].z * dt * projectile.speed;
      projectile.mesh.position.set(projectile.x - this.center.x, 0.7, projectile.z - this.center.z);
      projectile.mesh.rotation.y += dt * 12;
      const gx = Math.round(projectile.x);
      const gz = Math.round(projectile.z);
      if (gx === this.player.gridX && gz === this.player.gridZ) {
        this.damagePlayer(projectile.dir);
        this.groups.effects.remove(projectile.mesh);
        return false;
      }
      if (projectile.life <= 0 || this.isBlocked(gx, gz)) {
        this.groups.effects.remove(projectile.mesh);
        return false;
      }
      return true;
    });
  }

  damageEnemy(enemy, amount) {
    if (enemy.type === "hook") {
      this.hitHook(enemy, amount);
      return;
    }
    enemy.hp -= amount;
    enemy.flash = 0.18;
    this.updateHud(`${enemy.name} hit.`);
    if (enemy.hp > 0) return;
    enemy.mesh.visible = false;
    if (this.level.trigger === "clearCrew" && this.entities.filter((item) => item.type === "crew").every((item) => item.hp <= 0)) {
      this.spawnKey(this.level.keySpawn, "All pirates defeated. The key appeared.");
    }
    if (this.level.trigger === "smee" && enemy.type === "smee") {
      this.spawnKey({ x: enemy.gridX, z: enemy.gridZ }, "Mr. Smee dropped the key to the main deck.");
    }
  }

  hitHook(enemy, amount) {
    if (this.killSequence.active || enemy.hp <= 0 || this.finalBattle?.phase !== "hook-fight") return;
    if (enemy.panic && enemy.panicTarget && (enemy.gridX !== enemy.panicTarget.x || enemy.gridZ !== enemy.panicTarget.z)) {
      this.updateHud("Hook is still scrambling for cover. Cut him off at the corner.");
      return;
    }
    if (enemy.panic && enemy.openApproach && (this.player.gridX !== enemy.openApproach.x || this.player.gridZ !== enemy.openApproach.z)) {
      this.updateHud("Hook is cornered. Reach the open side past the gator.");
      return;
    }
    enemy.hp -= amount;
    enemy.flash = 0.24;
    if (this.tickTock.active > 0) this.endTickTock(enemy, "hit");
    if (enemy.hp <= 0) {
      this.startKillSequence(enemy);
      return;
    }
    this.updateHud(`Captain Hook hit. ${enemy.hp} hits left.`);
    this.spawnPixieDust(enemy.mesh.position);
    this.relocateHook(enemy, { preferCenter: false });
  }

  spawnKey(position, message) {
    if (this.keyItem) return;
    const { THREE } = this;
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: "#ffe77a", emissive: "#ffcf5a", emissiveIntensity: 0.42, roughness: 0.35, metalness: 0.18 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.055, 10, 24), mat);
    ring.rotation.x = Math.PI / 2;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.62), mat);
    shaft.position.z = 0.38;
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.12), mat);
    tooth.position.set(0.1, 0, 0.72);
    group.add(ring, shaft, tooth);
    this.groups.actors.add(group);
    this.placeGrid(group, position.x, position.z);
    group.position.y = 0.72;
    this.keyItem = { gridX: position.x, gridZ: position.z, mesh: group };
    this.updateHud(message);
  }

  checkKeyPickup() {
    if (!this.keyItem || this.hasKey) return;
    if (this.player.gridX !== this.keyItem.gridX || this.player.gridZ !== this.keyItem.gridZ) return;
    this.hasKey = true;
    this.keyItem.mesh.visible = false;
    this.spawnPixieDust(this.keyItem.mesh.position);
    this.unlockDoors();
    this.updateHud("Key collected. Go to the locked door.");
  }

  checkFinalKeyPickup() {
    const finalKey = this.finalBattle?.finalKey;
    if (!finalKey || this.finalBattle.hasFinalKey) return;
    if (this.player.gridX !== finalKey.gridX || this.player.gridZ !== finalKey.gridZ) return;
    this.finalBattle.hasFinalKey = true;
    finalKey.mesh.visible = false;
    this.spawnPixieDust(finalKey.mesh.position);
    this.updateHud("Final key collected. Get to Tinker Bell's cage.");
  }

  unlockDoors() {
    this.doors.forEach((door) => {
      door.unlocked = true;
      door.flash = 2.4;
      door.keyPlate.material = this.materials.doorUnlockedGlow;
      door.frame.forEach((part) => {
        part.material = this.materials.doorUnlockedGlow;
      });
      door.glow.color.set("#39ff7a");
      door.glow.intensity = 3.2;
      door.glow.distance = 5.6;
      this.spawnDoorUnlockEffect(door.mesh.position);
    });
  }

  spawnDoorUnlockEffect(origin) {
    const { THREE } = this;
    const count = 130;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = origin.x + (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = origin.y + 0.7 + Math.random() * 0.7;
      positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.5;
      velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.7, Math.random() * 1.8 + 0.6, (Math.random() - 0.5) * 0.7));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: "#69ff91",
      size: 0.11,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const points = new THREE.Points(geometry, material);
    this.groups.effects.add(points);
    this.particles.push({ points, velocities, life: 1.6, age: 0 });
  }

  transitionLevel() {
    if (this.levelIndex >= LEVELS.length - 1) return;
    const nextIndex = this.levelIndex + 1;
    const name = LEVELS[nextIndex].name;
    this.updateHud(`Door unlocked. Entering ${name}.`);
    this.spawnPixieDust(this.player.mesh.position);
    setTimeout(() => this.loadLevel(nextIndex, this.player.health), 380);
  }

  damagePlayer(dirName) {
    const p = this.player;
    if (p.invulnerable > 0 || this.killSequence.active) return;
    p.health -= 1;
    p.invulnerable = DAMAGE_COOLDOWN;
    const dir = DIRS[opposite(dirName)];
    const nx = p.gridX + dir.x;
    const nz = p.gridZ + dir.z;
    if (!this.isBlocked(nx, nz) && !this.enemyAt(nx, nz) && !this.doors.has(this.key(nx, nz))) {
      p.gridX = nx;
      p.gridZ = nz;
      p.fromX = nx;
      p.fromZ = nz;
      p.toX = nx;
      p.toZ = nz;
      p.moveT = 1;
      this.placeGrid(p.mesh, nx, nz);
    }
    this.showDamageOverlay(this.nextDamageLine());
    this.updateHud("Pops took a hit. Keep moving.");
    if (this.mainDeck && p.health === 2 && !this.emergencyChestSpawned) this.spawnEmergencyChest();
    if (p.health <= 0) {
      if (this.mainDeck) this.bossDeaths += 1;
      this.loadLevel(this.levelIndex, MAX_HEALTH);
      this.updateHud("Dad got knocked back to the start. Fairy dust keeps him going.");
    }
  }

  spawnEmergencyChest() {
    const spot = this.randomBattleTile({ minPlayerDistance: 3, minHookDistance: 3 });
    if (!spot) return;
    this.emergencyChestSpawned = true;
    this.createChest(spot.x, spot.z, { emergency: true });
    this.spawnPixieDust(new this.THREE.Vector3(spot.x - this.center.x, 0.2, spot.z - this.center.z));
    this.updateHud("Emergency fairy dust chest appeared on deck.");
  }

  relocateHook(enemy, options = {}) {
    const spot = this.randomBattleTile({
      exclude: [{ x: enemy.gridX, z: enemy.gridZ }],
      minPlayerDistance: options.preferCenter ? 4 : 3,
      minHookDistance: 5,
      preferCenter: !!options.preferCenter
    });
    if (!spot) return;
    enemy.gridX = spot.x;
    enemy.gridZ = spot.z;
    enemy.originX = spot.x;
    enemy.originZ = spot.z;
    enemy.mesh.rotation.z = 0;
    enemy.fireTimer = 0.72;
    this.placeGrid(enemy.mesh, spot.x, spot.z);
  }

  randomBattleTile(options = {}) {
    const tiles = [];
    for (let z = 1; z < this.level.map.length - 1; z += 1) {
      for (let x = 1; x < this.level.map[0].length - 1; x += 1) {
        if (!this.isTileFree(x, z, { ignoreHook: true })) continue;
        if (options.exclude?.some((item) => item.x === x && item.z === z)) continue;
        const playerDistance = Math.abs(x - this.player.gridX) + Math.abs(z - this.player.gridZ);
        if (options.minPlayerDistance && playerDistance < options.minPlayerDistance) continue;
        const hook = this.entities.find((enemy) => enemy.type === "hook" && enemy.hp > 0);
        const hookDistance = hook ? Math.abs(x - hook.gridX) + Math.abs(z - hook.gridZ) : 99;
        if (options.minHookDistance && hookDistance < options.minHookDistance) continue;
        const centerBias = options.preferCenter
          ? Math.abs(x - Math.round(this.level.map[0].length / 2)) + Math.abs(z - Math.round(this.level.map.length / 2))
          : 0;
        tiles.push({ x, z, centerBias, playerDistance });
      }
    }
    if (!tiles.length) return null;
    if (options.preferCenter) tiles.sort((a, b) => a.centerBias - b.centerBias);
    return options.preferCenter ? tiles[0] : tiles[Math.floor(Math.random() * tiles.length)];
  }

  isTileFree(x, z, options = {}) {
    if (this.walls.has(this.key(x, z)) || this.doors.has(this.key(x, z))) return false;
    if (this.chests.some((chest) => chest.gridX === x && chest.gridZ === z && !chest.opened)) return false;
    if (this.cage && this.cage.gridX === x && this.cage.gridZ === z) return false;
    if (this.keyItem && this.keyItem.gridX === x && this.keyItem.gridZ === z && !this.hasKey) return false;
    if (this.gatorBlock && this.gatorBlock.tile.x === x && this.gatorBlock.tile.z === z) return false;
    return !this.entities.some((enemy) => enemy.hp > 0 && !(options.ignoreHook && enemy.type === "hook") && enemy.gridX === x && enemy.gridZ === z);
  }

  startKillSequence(enemy) {
    this.projectiles.forEach((projectile) => this.groups.effects.remove(projectile.mesh));
    this.projectiles = [];
    this.endTickTock(enemy, "hit");
    this.killSequence.active = true;
    this.killSequence.timer = 0;
    this.killSequence.hook = enemy;
    this.killSequence.fallVector = this.pickOverboardVector(enemy);
    this.killSequence.fallTile = { x: enemy.gridX, z: enemy.gridZ };
    this.killSequence.gatorJumped = false;
    this.killSequence.finalized = false;
    this.killSequence.auraTimer = 0;
    this.finalBattle.phase = "hook-fall";
    this.ambientLight.color.set("#ffe6a1");
    this.ambientLight.intensity = 1.45;
    this.moonLight.color.set("#ffd97a");
    this.moonLight.intensity = 0.95;
    this.victoryLight.intensity = 2.8;
    this.playerHeadlight.intensity = 0.25;
    this.scene.background.set("#f2d78c");
    this.scene.fog.color.set("#f2d78c");
    this.updateHud("Captain Hook is going overboard. Hold tight.");
  }

  pickOverboardVector(enemy) {
    const left = enemy.gridX - 0;
    const right = (this.level.map[0].length - 1) - enemy.gridX;
    const top = enemy.gridZ - 0;
    const bottom = (this.level.map.length - 1) - enemy.gridZ;
    const shortest = Math.min(left, right, top, bottom);
    if (shortest === left) return new this.THREE.Vector3(-1.8, -0.18, 0);
    if (shortest === right) return new this.THREE.Vector3(1.8, -0.18, 0);
    if (shortest === top) return new this.THREE.Vector3(0, -0.18, -1.8);
    return new this.THREE.Vector3(0, -0.18, 1.8);
  }

  updateKillSequence(dt) {
    const hook = this.killSequence.hook;
    if (!hook) return;
    this.killSequence.timer += dt;
    hook.material.color.set(Math.sin(this.killSequence.timer * 40) > 0 ? "#fff5c8" : "#ff3b30");
    hook.mesh.rotation.y += dt * 16;
    hook.mesh.rotation.z += dt * 10;
    if (this.killSequence.timer > 0.55) hook.mesh.position.addScaledVector(this.killSequence.fallVector, dt * 3.8);

    if (!this.killSequence.gatorJumped && this.killSequence.timer > 3.2) {
      this.killSequence.gatorJumped = true;
      this.spawnOverboardGator(hook.mesh.position.clone());
    }

    if (this.killSequence.gatorEater) {
      this.killSequence.gatorEater.mesh.position.y = Math.min(0.55, this.killSequence.gatorEater.mesh.position.y + dt * 1.45);
      this.killSequence.gatorEater.mesh.rotation.y += dt * 2.2;
    }

    if (!this.killSequence.finalized && this.killSequence.timer >= 5) {
      this.killSequence.finalized = true;
      hook.mesh.visible = false;
      if (this.killSequence.gatorEater) this.groups.actors.remove(this.killSequence.gatorEater.mesh);
      this.finalizeHookDefeat();
      this.killSequence.active = false;
    }

    if (this.rescueFairy) {
      this.killSequence.auraTimer += dt;
      this.rescueFairy.position.y = 0.95 + Math.sin(this.clock.elapsedTime * 4) * 0.18;
      if (this.killSequence.auraTimer >= 0.16) {
        this.killSequence.auraTimer = 0;
        this.spawnRescueAura(this.rescueFairy.position);
      }
    }
  }

  finalizeHookDefeat() {
    this.finalBattle.phase = "rescue-run";
    const fallTile = this.killSequence.fallTile || { x: this.player.gridX, z: this.player.gridZ };
    this.spawnFinalBattleKey(fallTile);
    this.repositionCageToFarthestTile(fallTile);
    this.updateHud("Hook is gone. Grab the final key and unlock Tinker Bell's cage.");
  }

  spawnFinalBattleKey(position) {
    const { THREE } = this;
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: "#ffe77a",
      emissive: "#ffd86a",
      emissiveIntensity: 0.62,
      roughness: 0.28,
      metalness: 0.16
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 10, 28), mat);
    ring.rotation.x = Math.PI / 2;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.74), mat);
    shaft.position.z = 0.42;
    const toothA = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.12), mat);
    toothA.position.set(0.08, 0, 0.78);
    const toothB = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.12), mat);
    toothB.position.set(-0.06, 0, 0.63);
    const glow = new THREE.PointLight("#ffe27a", 1.6, 3.6, 1.9);
    glow.position.y = 0.72;
    group.add(ring, shaft, toothA, toothB, glow);
    this.setShadows(group);
    this.groups.actors.add(group);
    this.placeGrid(group, position.x, position.z);
    group.position.y = 0.76;
    this.finalBattle.finalKey = { gridX: position.x, gridZ: position.z, mesh: group };
    this.spawnPixieDust(group.position);
  }

  repositionCageToFarthestTile(fromTile) {
    if (!this.cage) return;
    const width = this.level.map[0].length;
    const height = this.level.map.length;
    const tiles = [];
    for (let z = 1; z < height - 1; z += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (!this.isTileFree(x, z, { ignoreHook: true })) continue;
        const distance = Math.abs(x - fromTile.x) + Math.abs(z - fromTile.z);
        const playerDistance = Math.abs(x - this.player.gridX) + Math.abs(z - this.player.gridZ);
        tiles.push({ x, z, distance, playerDistance });
      }
    }
    if (!tiles.length) return;
    tiles.sort((a, b) => {
      if (b.distance !== a.distance) return b.distance - a.distance;
      return b.playerDistance - a.playerDistance;
    });
    const spot = tiles[0];
    this.cage.gridX = spot.x;
    this.cage.gridZ = spot.z;
    this.cage.locked = true;
    this.placeGrid(this.cage.mesh, spot.x, spot.z);
    this.cage.mesh.visible = true;
    this.cage.mesh.rotation.z = 0;
    this.cage.mesh.position.y = 0;
    this.cage.fairy.visible = true;
    this.cage.fairy.position.set(spot.x - this.center.x, 0.84, spot.z - this.center.z);
    this.spawnPixieDust(this.cage.mesh.position);
  }

  unlockRescueCage() {
    if (!this.cage || !this.finalBattle || this.finalBattle.cageUnlocked) return;
    this.finalBattle.cageUnlocked = true;
    this.finalBattle.phase = "rescued";
    this.cage.locked = false;
    this.cage.mesh.visible = false;
    this.cage.fairy.visible = true;
    this.cage.fairy.position.set(this.cage.gridX - this.center.x, 1.05, this.cage.gridZ - this.center.z);
    this.rescueFairy = this.cage.fairy;
    this.killSequence.auraTimer = 0;
    this.spawnPixieDust(this.cage.fairy.position);
    this.spawnRescueAura(this.cage.fairy.position);
    this.updateHud("Tinker Bell is free. Happy Father's Day.");
    this.showVictoryOverlay();
  }

  spawnOverboardGator(position) {
    const { THREE } = this;
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: "#3f8f4d",
      roughness: 0.72,
      emissive: "#183e22",
      emissiveIntensity: 0.24
    });
    const bellyMat = new THREE.MeshStandardMaterial({ color: "#9bc876", roughness: 0.78 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.4, 1.5), bodyMat);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.92), bodyMat);
    tail.position.set(0, 0.02, -1.1);
    tail.rotation.x = -0.2;
    const jawLower = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.84), bodyMat);
    jawLower.position.set(0, -0.06, 1.04);
    const jawUpper = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.84), bodyMat);
    jawUpper.position.set(0, 0.12, 1.02);
    jawUpper.rotation.x = -0.36;
    const belly = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.12, 0.98), bellyMat);
    belly.position.set(0, -0.08, 0.1);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), this.materials.goldGlow);
    eyeL.position.set(-0.18, 0.18, 1.18);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.18;
    group.add(body, tail, jawLower, jawUpper, belly, eyeL, eyeR);
    this.setShadows(group);
    group.position.copy(position);
    group.position.y = -1.35;
    group.rotation.y = Math.atan2(-this.killSequence.fallVector.x, -this.killSequence.fallVector.z);
    this.groups.actors.add(group);
    this.killSequence.gatorEater = { mesh: group };
  }

  spawnRescueFairy() {
    if (this.rescueFairy) return;
    const fairy = this.createTinkerBellModel();
    fairy.position.set(0, 0.95, 0);
    fairy.scale.setScalar(2.1);
    fairy.visible = true;
    this.groups.actors.add(fairy);
    this.rescueFairy = fairy;
    this.spawnPixieDust(fairy.position);
  }

  spawnRescueAura(origin) {
    const { THREE } = this;
    const count = 56;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = origin.x + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = origin.y + (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.3;
      velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.45, Math.random() * 1.2 + 0.5, (Math.random() - 0.5) * 0.45));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: "#ffe98a",
      size: 0.09,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const points = new THREE.Points(geometry, material);
    this.groups.effects.add(points);
    this.particles.push({ points, velocities, life: 0.95, age: 0 });
  }

  spawnPixieDust(origin) {
    const { THREE } = this;
    const count = 230;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y + 0.55;
      positions[i * 3 + 2] = origin.z;
      velocities.push(new THREE.Vector3((Math.random() - 0.5) * 3.6, Math.random() * 3.8 + 1.6, (Math.random() - 0.5) * 3.6));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: "#ffd65c",
      size: 0.13,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const points = new THREE.Points(geometry, material);
    this.groups.effects.add(points);
    this.particles.push({ points, velocities, life: 1.35, age: 0 });
  }

  updateParticles(dt) {
    this.particles = this.particles.filter((burst) => {
      burst.life -= dt;
      burst.age += dt;
      const positions = burst.points.geometry.attributes.position.array;
      burst.velocities.forEach((velocity, i) => {
        velocity.y -= dt * 2.8;
        const swirl = Math.sin(burst.age * 9 + i * 0.37) * dt * 0.22;
        positions[i * 3] += velocity.x * dt + swirl;
        positions[i * 3 + 1] += velocity.y * dt;
        positions[i * 3 + 2] += velocity.z * dt - swirl;
      });
      burst.points.geometry.attributes.position.needsUpdate = true;
      burst.points.material.opacity = Math.min(1, Math.max(0, burst.life / 1.35));
      if (burst.life > 0) return true;
      this.groups.effects.remove(burst.points);
      return false;
    });
  }

  updateTorches(dt) {
    this.torchTime = (this.torchTime || 0) + dt;
    this.torches?.forEach((torch) => {
      const flicker = 0.82 + Math.sin(this.torchTime * 7 + torch.phase) * 0.14 + Math.sin(this.torchTime * 17 + torch.phase) * 0.06;
      torch.light.intensity = torch.baseIntensity * flicker;
      torch.flame.scale.setScalar(0.85 + flicker * 0.22);
    });
  }

  updateDoors(dt) {
    this.doors?.forEach((door) => {
      if (!door.unlocked) return;
      if (door.flash > 0) door.flash -= dt;
      const pulse = 0.72 + Math.sin(this.clock.elapsedTime * 9) * 0.28;
      door.glow.intensity = door.flash > 0 ? 2.6 + pulse * 1.9 : 1.6 + pulse * 0.8;
      door.keyPlate.scale.setScalar(1 + pulse * 0.08);
    });
  }

  isBlocked(x, z) {
    const chestBlocks = this.chests?.some((chest) => chest.gridX === x && chest.gridZ === z);
    const gatorBlocks = this.gatorBlock?.tile.x === x && this.gatorBlock?.tile.z === z;
    return chestBlocks || gatorBlocks || this.walls.has(this.key(x, z)) || z < 0 || z >= this.level.map.length || x < 0 || x >= this.level.map[0].length;
  }

  enemyAt(x, z) {
    return this.entities.find((enemy) => enemy.hp > 0 && enemy.gridX === x && enemy.gridZ === z);
  }

  placeGrid(mesh, x, z) {
    mesh.position.set(x - this.center.x, mesh.position.y || 0, z - this.center.z);
  }

  key(x, z) {
    return `${x},${z}`;
  }

  updateCamera() {
    const target = this.rescueFairy && this.killSequence.active ? this.rescueFairy.position : this.player.mesh.position;
    const facing = DIRS[this.player.facing] || DIRS.DOWN;
    const lookX = target.x + facing.x * 1.2;
    const lookZ = target.z + facing.z * 1.2;
    this.camera.position.lerp(new this.THREE.Vector3(target.x, 16.8, target.z + 9.8), 0.08);
    this.camera.lookAt(lookX, 0.75, lookZ);
    if (this.playerHeadlight && this.playerHeadlightTarget) {
      this.playerHeadlight.position.set(target.x, 9.5, target.z + 5.6);
      this.playerHeadlightTarget.position.set(lookX, 0.35, lookZ);
      this.playerHeadlightTarget.updateMatrixWorld();
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const rect = this.mount.getBoundingClientRect();
    const width = Math.max(320, rect.width);
    const cssHeight = Number.parseFloat(window.getComputedStyle(this.mount).height) || 0;
    const height = Math.max(420, rect.height, cssHeight, 500);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  getHookProjectileSpeedFactor() {
    if (this.bossDeaths >= 3) return 0.5;
    if (this.bossDeaths >= 2) return 0.75;
    return 1;
  }

  updateHud(status) {
    if (this.hud?.health) this.hud.health.textContent = `Hearts ${this.player ? `${this.player.health}/${MAX_HEALTH}` : ""}`;
    if (this.hud?.status) this.hud.status.textContent = status;
    if (!this.hud?.boss) return;
    const hook = this.entities.find((enemy) => enemy.type === "hook" && enemy.hp > 0);
    const smee = this.entities.find((enemy) => enemy.type === "smee" && enemy.hp > 0);
    if (hook) this.hud.boss.textContent = `Main Deck Hook ${hook.hp}/${hook.maxHp}`;
    else if (smee) this.hud.boss.textContent = `Upper Deck Smee ${smee.hp}/${smee.maxHp}`;
    else if (this.finalBattle?.phase === "hook-fall") this.hud.boss.textContent = "Main Deck Hook Overboard";
    else if (this.finalBattle?.phase === "rescue-run") this.hud.boss.textContent = `Main Deck ${this.finalBattle.hasFinalKey ? "Unlock Cage" : "Find Final Key"}`;
    else if (this.finalBattle?.phase === "rescued") this.hud.boss.textContent = "Main Deck Tinker Bell Safe";
    else this.hud.boss.textContent = `${this.level.name} ${this.hasKey ? "Key" : `${this.levelIndex + 1}/3`}`;
  }
}

function keyMap(key) {
  return ({
    arrowup: "UP",
    w: "UP",
    arrowdown: "DOWN",
    s: "DOWN",
    arrowleft: "LEFT",
    a: "LEFT",
    arrowright: "RIGHT",
    d: "RIGHT"
  })[key];
}

function opposite(dir) {
  return ({ UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" })[dir];
}

function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function tint(hex, amount) {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (value >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (value & 255) + amount));
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
