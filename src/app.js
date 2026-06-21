(() => {
  "use strict";

  const SAVE_KEY = "dadventure-save-v1";
  const APP_VERSION = "0.3.15";
  const app = document.querySelector("#app");

  const worlds = [
    {
      id: "moto",
      title: "The Garage Track",
      icon: "MX",
      token: "Gearheart",
      summary: "Tune the bike, beat the rival, and survive Adam's commentary."
    },
    {
      id: "pixie",
      title: "Tinker Bell Rescue",
      icon: "TB",
      token: "Pixieheart",
      summary: "Fight through Captain Hook's pirate ship and rescue Tinker Bell."
    }
  ];

  const motoTarget = {
    tires: 3,
    suspension: 1,
    gearing: 5,
    engine: 3,
    timing: 4
  };

  const MOTO_DEFAULT_TUNE = {
    tires: 2,
    suspension: 2,
    gearing: 2,
    engine: 2,
    timing: 2
  };

  const MOTO_VIEW_DISTANCE = 0.24;
  const MOTO_RAMP_START = 0.56;
  const MOTO_RAMP_TAKEOFF = 0.635;
  const MOTO_RAMP_END = 0.67;
  const motoTrackFeatures = [
    { type: "mud", start: 0.105, end: 0.165, center: 0.135, radius: 0.034, lane: -0.42, width: 0.42 },
    { type: "mud", start: 0.178, end: 0.238, center: 0.208, radius: 0.034, lane: 0.38, width: 0.42 },
    { type: "mud", start: 0.242, end: 0.306, center: 0.274, radius: 0.038, lane: 0, width: 1.12 },
    { type: "bump", start: 0.330, end: 0.344, lane: 0, width: 0.92, bumpNo: 1 },
    { type: "bump", start: 0.365, end: 0.380, lane: 0, width: 0.92, bumpNo: 2, kicker: true },
    { type: "bump", start: 0.400, end: 0.414, lane: 0, width: 0.9, bumpNo: 3 },
    { type: "bump", start: 0.435, end: 0.449, lane: 0, width: 0.9, bumpNo: 4 },
    { type: "bump", start: 0.470, end: 0.486, lane: 0, width: 0.92, bumpNo: 5, kicker: true },
    { type: "bump", start: 0.505, end: 0.520, lane: 0, width: 0.9, bumpNo: 6 },
    { type: "hill", start: 0.525, end: 0.555, lane: 0, width: 0.96 },
    { type: "ramp", start: MOTO_RAMP_START, end: MOTO_RAMP_END, lane: 0, width: 0.78 }
  ];

  const creatures = [
    {
      id: "snugglecub",
      name: "Snugglecub",
      area: "Meadow Patch",
      role: "Tiny heart-powered healer",
      x: 20,
      y: 24,
      color: "#ffcfde",
      hp: 82,
      speed: 7,
      moves: [
        move("Tiny Hug", 14, "Snugglecub weaponizes sweetness."),
        move("Cuddle Charge", -26, "Snugglecub heals with full toddler confidence.", "heal"),
        move("Snack Toss", 22, "Snacks are not optional."),
        move("Big Feelings", 18, "The enemy is emotionally unprepared.")
      ]
    },
    {
      id: "gearfox",
      name: "Gearfox",
      area: "Metal Mountain",
      role: "Fast garage gremlin",
      x: 72,
      y: 22,
      color: "#c8c0a9",
      hp: 88,
      speed: 9,
      moves: [
        move("Wrench Dash", 24, "Gearfox moves like it had a better idea."),
        move("Oil Slick", 16, "The enemy loses traction and dignity."),
        move("Smart Mouth", 20, "That hit came with commentary."),
        move("Socket Spark", 26, "A spark jumps from the toolbox.")
      ]
    },
    {
      id: "stormpup",
      name: "Stormpup",
      area: "Stormy Hill",
      role: "Loyal thunder dog",
      x: 32,
      y: 62,
      color: "#a4c9ff",
      hp: 96,
      speed: 8,
      moves: [
        move("Thunder Bark", 25, "Stormpup barks and the weather apologizes."),
        move("Zoomies", 18, "Stormpup achieves unreasonable speed."),
        move("Loyal Bite", 27, "Good boy. Bad day for the enemy."),
        move("Good Boy Guard", 12, "Stormpup refuses to back down.")
      ]
    },
    {
      id: "snowfang",
      name: "Snowfang",
      area: "Snowfield Den",
      role: "Husky-wolf chaos in snow form",
      x: 78,
      y: 55,
      color: "#eef8ff",
      hp: 92,
      speed: 10,
      moves: [
        move("Arctic Howl", 24, "Snowfang howls like it pays rent here."),
        move("Snow Sprint", 21, "Too fast. Too dramatic."),
        move("Frost Nip", 19, "A cold little problem."),
        move("Pack Instinct", 29, "Snowfang fights harder for the team.")
      ]
    },
    {
      id: "naptitan",
      name: "Naptitan",
      area: "Quiet Hollow",
      role: "Sleepy tank, impossible to move",
      x: 20,
      y: 82,
      color: "#d9b287",
      hp: 124,
      speed: 4,
      moves: [
        move("Dad Strength", 31, "Naptitan lifts the whole problem."),
        move("Power Nap", -32, "Naptitan recovers suspiciously fast.", "heal"),
        move("Not Today", 22, "The enemy's plan is rejected."),
        move("One More Thing", 26, "Naptitan remembered another attack.")
      ]
    },
    {
      id: "heartlion",
      name: "Heartlion",
      area: "Heartstone Clearing",
      role: "Fierce love with claws",
      x: 62,
      y: 82,
      color: "#ffb35c",
      hp: 106,
      speed: 6,
      moves: [
        move("Pride Roar", 30, "Heartlion makes the arena listen."),
        move("Family Flame", 34, "A warm hit with consequences."),
        move("Mama's Look", 24, "The enemy immediately regrets choices."),
        move("Stay Together", -18, "Heartlion steadies the whole team.", "teamHeal")
      ]
    }
  ];

  const rounds = [
    {
      name: "Rookie Riley",
      intro: "Rookie Riley: I practiced all morning. Well, most of morning. Some of morning.",
      enemies: [
        enemy("Mudpup", 62, 6, [move("Mud Slap", 13), move("Puddle Charge", 16)]),
        enemy("Bumblebat", 56, 9, [move("Wing Bonk", 14), move("Buzz Panic", 17)]),
        enemy("Pebblehog", 68, 4, [move("Rock Bump", 15), move("Tiny Tackle", 13)])
      ]
    },
    {
      name: "Chaos Casey",
      intro: "Chaos Casey: I brought five creatures and absolutely no plan. That is called confidence.",
      enemies: [
        enemy("Crankcoon", 72, 7, [move("Trash Dash", 17), move("Side Eye", 15)]),
        enemy("Grumblegoose", 76, 5, [move("Honk Slam", 18), move("Wing Fuss", 16)]),
        enemy("Nap Goblin", 82, 3, [move("Blanket Trap", 16), move("Crabby Swipe", 18)]),
        enemy("Laundry Lynx", 74, 8, [move("Sock Storm", 17), move("Static Claw", 19)]),
        enemy("Snackrat", 66, 9, [move("Crumb Rush", 16), move("Juice Box Jab", 18)])
      ]
    },
    {
      name: "Captain Chaos",
      intro: "Captain Chaos: So this is Dad's Legendary Six? Cute. I brought six problems and no instructions.",
      enemies: [
        enemy("Punferno", 82, 7, [move("Bad Punchline", 19), move("Hot Take", 22)]),
        enemy("Socksnake", 78, 9, [move("Laundry Lunge", 18), move("Static Bite", 21)]),
        enemy("Grillizard", 88, 6, [move("Propane Puff", 20), move("Tongs Snap", 22)]),
        enemy("Remote Hog", 86, 4, [move("Channel Slam", 19), move("Couch Roll", 20)]),
        enemy("Overtime Ogre", 96, 5, [move("Late Shift", 22), move("Inbox Smash", 20)]),
        enemy("Meltdown Mammoth", 104, 3, [move("Big Feelings", 23), move("Stomp Fuss", 25)])
      ]
    }
  ];

  let state = loadState();
  let selectedAvatar = state.avatar || "Riding Gear";
  let raceLoop = null;
  let catchLoop = null;
  let cleanupFns = [];
  let battle = null;
  let motoDevMode = "normal";
  let threeModulePromise = null;
  let threeGameplaySerial = 0;

  function move(name, power, text = "", effect = "damage") {
    return { name, power, text, effect };
  }

  function enemy(name, hp, speed, moves) {
    return { id: name.toLowerCase().replaceAll(" ", "-"), name, hp, speed, moves };
  }

  function defaultState() {
    return {
      playerName: "",
      avatar: "",
      completed: {},
      motoAttempts: 0,
      lastTune: { ...MOTO_DEFAULT_TUNE },
      creature: {
        caught: [],
        dadX: 50,
        dadY: 50,
        tournamentWon: false
      }
    };
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(SAVE_KEY));
      return { ...defaultState(), ...stored, creature: { ...defaultState().creature, ...(stored?.creature || {}) } };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // The game remains playable if storage is blocked; progress just will not persist.
    }
  }

  function stopLoops() {
    if (raceLoop) cancelAnimationFrame(raceLoop);
    if (catchLoop) cancelAnimationFrame(catchLoop);
    raceLoop = null;
    catchLoop = null;
    cleanupFns.forEach((cleanup) => cleanup());
    cleanupFns = [];
  }

  function addCleanup(cleanup) {
    cleanupFns.push(cleanup);
  }

  function render(html) {
    stopLoops();
    app.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function esc(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function completeWorld(id) {
    state.completed[id] = true;
    saveState();
  }

  function init() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    }
    if (new URLSearchParams(window.location.search).get("scene") === "moto-tech") {
      renderMotoTechScene3D();
      return;
    }
    if (new URLSearchParams(window.location.search).get("scene") === "moto-close-loss") {
      renderMotoPerfectLossScene3D();
      return;
    }
    if (state.playerName) renderHub();
    else renderIntro(0);
  }

  function renderIntro(step = 0) {
    const lines = [
      {
        speaker: "???",
        text: "Hey. Wake up. You have been chosen for a very important mission. No pressure."
      },
      {
        speaker: "???",
        text: "Before we begin, this world needs to know who its hero is."
      },
      {
        speaker: "Adam",
        text: "Yeah, that checks out. Try not to break reality before level one."
      },
      {
        speaker: "Hayleigh",
        text: "Dada!"
      }
    ];

    if (step < lines.length) {
      const line = lines[step];
      render(`
        <section class="screen">
          <div class="hero-card">
            <h1 class="title">Dadventure</h1>
            <p class="subtitle">Motocross, pirates, and one very important rescue.</p>
          </div>
          <div class="dialogue">
            <span class="speaker">${line.speaker}</span>
            ${line.text}
          </div>
          <button class="btn" id="nextIntro">Continue</button>
        </section>
      `);
      document.querySelector("#nextIntro").addEventListener("click", () => renderIntro(step + 1));
      return;
    }

    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Choose Dad</h1>
          <p class="subtitle">Pick a hero style. We can swap these later when we know his exact vibe.</p>
          <div class="avatar-grid">
            ${["Classic Dad", "Hat Dad", "Beard Dad", "Riding Gear"].map((name) => `
              <button class="avatar-card ${selectedAvatar === name ? "selected" : ""}" data-avatar="${name}">
                <div class="dad-avatar"></div>
                <strong>${name}</strong>
              </button>
            `).join("")}
          </div>
          <form id="nameForm">
            <label for="dadName"><strong>What is your name, hero?</strong></label>
            <input id="dadName" class="name-input" autocomplete="off" maxlength="18" placeholder="Enter name">
            <button class="btn" type="submit">Start Dadventure</button>
          </form>
        </div>
      </section>
    `);

    document.querySelectorAll("[data-avatar]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedAvatar = button.dataset.avatar;
        renderIntro(step);
      });
    });

    document.querySelector("#nameForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.querySelector("#dadName").value.trim() || "Dad";
      state.playerName = name;
      state.avatar = selectedAvatar;
      saveState();
      renderHub(`So your name is ${esc(name)}? Around here, you are known by a much more powerful title: Dad.`);
    });
  }

  function renderHub(message = "") {
    const earned = worlds.filter((world) => state.completed[world.id]).length;
    const allDone = earned === worlds.length;
    render(`
      <section class="screen">
        <div class="hub-header">
          <h1 class="title">Dadventure</h1>
          <p class="subtitle">${esc(state.playerName)}'s Father's Day Rescue</p>
          <small class="version-tag">Prototype v${APP_VERSION}</small>
          <div class="token-row">
            ${worlds.map((world) => `<span class="token-pill ${state.completed[world.id] ? "earned" : ""}">${world.token}</span>`).join("")}
          </div>
        </div>
        ${message ? `<div class="dialogue"><span class="speaker">Heartspace</span>${message}</div>` : ""}
        <div class="portal-grid">
          ${worlds.map((world) => `
            <article class="portal-card world-${world.id} ${state.completed[world.id] ? "complete" : ""}">
              <div class="portal-icon">${world.icon}</div>
              <span class="status-badge">${state.completed[world.id] ? "Token Earned" : "Open"}</span>
              <div>
                <h2>${world.title}</h2>
                <p>${world.summary}</p>
              </div>
              <button class="btn" data-world="${world.id}">${state.completed[world.id] ? "Replay" : "Enter World"}</button>
            </article>
          `).join("")}
        </div>
        <div class="panel">
          <h2>Final Door</h2>
          <p>${allDone ? "Both tokens are glowing. The final Father's Day ending is unlocked." : `${earned}/${worlds.length} tokens earned. Finish both worlds to open this door.`}</p>
          <button class="btn ${allDone ? "" : "secondary"}" id="finalDoor">${allDone ? "Open Final Door" : "Locked"}</button>
          <button class="btn secondary" id="resetProgress">Reset Progress</button>
        </div>
        <div class="panel">
          <h2>Playtest Controls</h2>
          <p>Mobile uses the on-screen buttons. Desktop supports arrow keys or WASD. Motocross gas uses Up/W/Space; Tinker Bell uses Space to attack and E to open fairy dust boxes.</p>
        </div>
      </section>
    `);

    document.querySelectorAll("[data-world]").forEach((button) => {
      button.addEventListener("click", () => openWorld(button.dataset.world));
    });
    document.querySelector("#finalDoor").addEventListener("click", () => {
      if (allDone) renderFinale();
    });
    document.querySelector("#finalDoor").disabled = !allDone;
    document.querySelector("#resetProgress").addEventListener("click", () => renderResetConfirm());
  }

  function renderResetConfirm() {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Reset?</h1>
          <p class="subtitle">This clears the saved name, avatar, tokens, and level progress on this device.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          This is the button for when Pops names himself something ridiculous and we need a do-over.
        </div>
        <div class="button-row">
          <button class="btn warning" id="confirmReset">Yes, Reset Game</button>
          <button class="btn secondary" id="cancelReset">Cancel</button>
        </div>
      </section>
    `);
    document.querySelector("#confirmReset").addEventListener("click", () => {
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        // Ignore blocked storage; the in-memory state still resets for this session.
      }
      state = defaultState();
      selectedAvatar = "Riding Gear";
      renderIntro(0);
    });
    document.querySelector("#cancelReset").addEventListener("click", () => renderHub());
  }

  function openWorld(id) {
    if (id === "moto") renderMotoDevGate();
    else if (id === "pixie") renderTinkerbellDungeon();
    else renderPlaceholder(id);
  }

  function renderPlaceholder(id) {
    const world = worlds.find((item) => item.id === id) || {
      title: "Unknown World",
      token: "Unknown"
    };
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">${world.title}</h1>
          <p class="subtitle">This world is not available.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          Something sent Pops to a world that is not wired up. That is suspicious and probably not canon.
        </div>
        <div class="button-row">
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function renderMotoDevGate(message = "") {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Race Setup</h1>
          <p class="subtitle">Choose normal racing or development testing before entering the garage.</p>
        </div>
        ${message ? `<div class="dialogue">${message}</div>` : ""}
        <div class="panel">
          <h2>Race Cheat Code</h2>
          <p>If you don't have a cheat code just hit continue to garage so you can flex your mechanical skills. This box is only for those who are mechanically a blonde.... Good luck!</p>
          <form id="motoDevForm">
            <input id="motoDevCode" class="name-input" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="000000">
            <button class="btn" type="submit">Continue To Garage</button>
          </form>
        </div>
        <div class="button-row">
          <button class="btn secondary" id="normalMotoMode">Use Normal Mode</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);

    const continueWithCode = () => {
      const code = document.querySelector("#motoDevCode").value.trim();
      if (code === "101824") {
        motoDevMode = "heatLock";
        renderMotoGarage(`<span class="speaker">Pit Board</span>Development heat lock active. Engine temperature will stay locked while you inspect the race.`);
        return;
      }
      if (code === "" || code === "000000") {
        motoDevMode = "normal";
        renderMotoGarage();
        return;
      }
      motoDevMode = "normal";
      renderMotoGarage(`<span class="speaker">Pit Board</span>Unknown development code. Starting normal race mode.`);
    };

    document.querySelector("#motoDevForm").addEventListener("submit", (event) => {
      event.preventDefault();
      continueWithCode();
    });
    document.querySelector("#normalMotoMode").addEventListener("click", () => {
      motoDevMode = "normal";
      renderMotoGarage();
    });
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function renderMotoGarage(message = "") {
    const tune = { ...MOTO_DEFAULT_TUNE };
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">The Garage Track</h1>
          <p class="subtitle">Tune the bike, preview the track, then race from a behind-the-rider arcade view.</p>
        </div>
        ${message ? `<div class="dialogue">${message}</div>` : ""}
        <div class="panel">
          <h2>Bike Tuning</h2>
          <p>Winning combo exists, but Adam is not handing it over for free.</p>
          <div class="slider-grid">
            ${tuneSlider("tires", "Tires", tune.tires)}
            ${tuneSlider("suspension", "Suspension", tune.suspension)}
            ${tuneSlider("gearing", "Gearing", tune.gearing)}
            ${tuneSlider("engine", "Engine Mix", tune.engine)}
            ${tuneSlider("timing", "Timing", tune.timing)}
          </div>
        </div>
        <div class="track-preview">
          <canvas id="previewCanvas" width="900" height="420" aria-label="Track preview"></canvas>
        </div>
        <div class="button-row">
          <button class="btn" id="startRace">Start Race</button>
          <button class="btn secondary" id="changeRaceMode">Change Race Mode</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    drawTrack(document.querySelector("#previewCanvas"), true);
    document.querySelectorAll("[data-tune]").forEach((input) => {
      input.addEventListener("input", () => {
        document.querySelector(`#${input.dataset.tune}Value`).textContent = input.value;
      });
    });
    document.querySelector("#startRace").addEventListener("click", () => {
      const current = {};
      document.querySelectorAll("[data-tune]").forEach((input) => current[input.dataset.tune] = Number(input.value));
      state.lastTune = current;
      saveState();
      startMotoRace(current, motoDevMode);
    });
    document.querySelector("#changeRaceMode").addEventListener("click", () => renderMotoDevGate());
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function tuneSlider(key, label, value) {
    return `
      <div class="slider-box">
        <label for="${key}">${label}<span id="${key}Value">${value}</span></label>
        <input id="${key}" data-tune="${key}" type="range" min="1" max="5" value="${value}">
      </div>
    `;
  }

  function exactTune(tune) {
    return Object.keys(motoTarget).every((key) => tune[key] === motoTarget[key]);
  }

  function loadThree() {
    if (!threeModulePromise) threeModulePromise = import("../vendor/three.module.js");
    return threeModulePromise;
  }

  async function renderThreeStoryScene(config) {
    const stageId = `${config.theme}StoryStage`;
    const lines = config.lines || [];
    let index = 0;
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">${esc(config.title)}</h1>
          <p class="subtitle">${esc(config.subtitle)}</p>
        </div>
        <div class="race-wrap three-race tech-race">
          <div id="${stageId}" class="moto-3d-stage tech-3d-stage" aria-label="${esc(config.aria || config.title)}"></div>
          <div class="speech-bubble announcer-bubble">
            <span class="speaker" id="storySpeaker">${esc(lines[0]?.speaker || "Narrator")}</span>
            <span id="storyText">${esc(lines[0]?.text || "")}</span>
          </div>
        </div>
        <div class="button-row">
          <button class="btn" id="storyNext">${lines.length > 1 ? "Next" : esc(config.primaryLabel)}</button>
          <button class="btn secondary" id="storyBack">${esc(config.secondaryLabel || "Back To Hub")}</button>
        </div>
      </section>
    `);

    const next = document.querySelector("#storyNext");
    const back = document.querySelector("#storyBack");
    const speaker = document.querySelector("#storySpeaker");
    const text = document.querySelector("#storyText");
    const updateLine = () => {
      const line = lines[index] || lines[lines.length - 1] || { speaker: "Narrator", text: "" };
      speaker.textContent = line.speaker;
      text.textContent = line.text;
      next.textContent = index >= lines.length - 1 ? config.primaryLabel : "Next";
    };
    next.addEventListener("click", () => {
      if (index < lines.length - 1) {
        index += 1;
        updateLine();
      } else {
        config.onPrimary();
      }
    });
    back.addEventListener("click", config.onSecondary || (() => renderHub()));

    try {
      const THREE = await loadThree();
      startThreeStoryScene3D(THREE, document.querySelector(`#${stageId}`), config.theme);
    } catch {
      // Text and buttons remain available if WebGL cannot start.
    }
  }

  function startThreeStoryScene3D(THREE, stage, theme) {
    if (!stage) return;
    const palette = {
      jedi: { sky: "#10172b", ground: "#25304f", accent: "#63e7ff" },
      creatures: { sky: "#91d9f7", ground: "#5aa65c", accent: "#ffcf5a" },
      guardian: { sky: "#182136", ground: "#2a3347", accent: "#62e3ff" },
      pixie: { sky: "#7dd4f4", ground: "#3f9c73", accent: "#ffe77a" },
      fishing: { sky: "#7ccdf0", ground: "#226b86", accent: "#d9f7ff" },
      finale: { sky: "#172c2d", ground: "#305052", accent: "#ffcf5a" }
    }[theme] || { sky: "#85d4f0", ground: "#4e8948", accent: "#ffcf5a" };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.sky);
    scene.fog = new THREE.Fog(palette.sky, 28, 100);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 160);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight("#fff7d8", "#223a3a", 1.25);
    const sun = new THREE.DirectionalLight("#fff7df", 2.1);
    sun.position.set(-12, 22, 14);
    sun.castShadow = true;
    scene.add(hemi, sun);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(42, 32),
      new THREE.MeshStandardMaterial({ color: palette.ground, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    buildStoryTheme3D(THREE, scene, theme, palette);
    camera.position.set(7.8, 5.2, 10.6);
    camera.lookAt(0, 1.4, 0);

    function resizeScene() {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(320, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resizeScene();
    window.addEventListener("resize", resizeScene);
    addCleanup(() => {
      window.removeEventListener("resize", resizeScene);
      renderer.dispose();
      renderer.domElement.remove();
    });

    function tick(now) {
      scene.traverse((item) => {
        if (item.userData.float) item.position.y = item.userData.baseY + Math.sin(now / item.userData.speed + item.userData.phase) * item.userData.float;
        if (item.userData.spin) item.rotation.y += item.userData.spin;
      });
      camera.position.x = 7.8 + Math.sin(now / 1800) * 0.36;
      camera.lookAt(0, 1.45, 0);
      renderer.render(scene, camera);
      raceLoop = requestAnimationFrame(tick);
    }
    raceLoop = requestAnimationFrame(tick);
  }

  function buildStoryTheme3D(THREE, scene, theme, palette) {
    const accentMat = new THREE.MeshStandardMaterial({ color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.32, roughness: 0.45 });
    const darkMat = new THREE.MeshStandardMaterial({ color: "#172c2d", roughness: 0.7 });
    const blueMat = new THREE.MeshStandardMaterial({ color: "#4d8dff", roughness: 0.62 });

    if (theme === "jedi") {
      addStoryStars3D(THREE, scene, 38);
      const ship = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.15, 4.2, 5), darkMat);
      ship.rotation.x = Math.PI / 2;
      ship.position.set(-2.7, 1.1, -0.6);
      ship.castShadow = true;
      scene.add(ship);
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.72), accentMat);
      crystal.position.set(1.4, 2.05, -0.35);
      crystal.userData = { float: 0.22, baseY: 2.05, speed: 520, phase: 0, spin: 0.012 };
      scene.add(crystal);
      addSimpleHero3D(THREE, scene, 0.15, 0, "#f76d57");
      addSimpleHero3D(THREE, scene, 2.8, 0.15, "#7fd8ff", 0.55);
      return;
    }

    if (theme === "creatures") {
      const colors = ["#ffcfde", "#c8c0a9", "#a4c9ff", "#eef8ff", "#b5e0b1", "#f5c456"];
      colors.forEach((color, i) => {
        const creature = new THREE.Mesh(new THREE.SphereGeometry(0.46 + (i % 2) * 0.08, 18, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.72 }));
        creature.position.set(-4.2 + i * 1.55, 0.58, -0.55 + Math.sin(i) * 1.1);
        creature.castShadow = true;
        creature.userData = { float: 0.12, baseY: creature.position.y, speed: 420 + i * 70, phase: i };
        scene.add(creature);
      });
      addSimpleHero3D(THREE, scene, 0, 1.35, "#f76d57");
      return;
    }

    if (theme === "guardian") {
      for (let i = 0; i < 3; i += 1) {
        const room = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.14, 4.4), new THREE.MeshStandardMaterial({ color: i === 2 ? "#34475f" : "#2d394d", roughness: 0.78 }));
        room.position.set(-5.2 + i * 5.2, 0.08, -0.5);
        room.receiveShadow = true;
        scene.add(room);
      }
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 14), accentMat);
      light.position.set(2.8, 2.4, -0.7);
      light.userData = { float: 0.28, baseY: 2.4, speed: 470, phase: 0, spin: 0.01 };
      scene.add(light);
      addSimpleHero3D(THREE, scene, -1.5, 0.2, "#4d8dff");
      addSimpleHero3D(THREE, scene, 3.5, 0.4, "#3b1c45", 0.72);
      return;
    }

    if (theme === "pixie") {
      const water = new THREE.Mesh(new THREE.PlaneGeometry(42, 16), new THREE.MeshStandardMaterial({ color: "#2f9ab8", roughness: 0.82 }));
      water.rotation.x = -Math.PI / 2;
      water.position.z = 5.2;
      water.position.y = 0.04;
      scene.add(water);
      const ship = buildPixiePirateShip3D(THREE);
      ship.position.set(0.8, 0.15, 1.4);
      ship.scale.setScalar(0.7);
      scene.add(ship);
      const cage = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.35, 1.0), darkMat);
      cage.position.set(2.2, 1.85, 1.0);
      cage.castShadow = true;
      scene.add(cage);
      const fairy = buildPixieFairy3D(THREE);
      fairy.position.set(2.2, 1.9, 1.0);
      fairy.userData = { float: 0.18, baseY: 1.9, speed: 320, phase: 0 };
      scene.add(fairy);
      addSimpleHero3D(THREE, scene, -2.2, -0.2, "#f76d57");
      return;
    }

    if (theme === "fishing") {
      const boat = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.85, 2.4), new THREE.MeshStandardMaterial({ color: "#fff7e1", roughness: 0.58 }));
      boat.position.set(-1.3, 0.85, 0.35);
      boat.castShadow = true;
      scene.add(boat);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.4), new THREE.MeshStandardMaterial({ color: "#d9f7ff", roughness: 0.52 }));
      cabin.position.set(-2.2, 1.75, 0.3);
      cabin.castShadow = true;
      scene.add(cabin);
      const fish = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.2, 16), blueMat);
      fish.rotation.z = Math.PI / 2;
      fish.position.set(2.9, 0.75, 1.1);
      fish.castShadow = true;
      fish.userData = { float: 0.12, baseY: 0.75, speed: 380, phase: 1.4 };
      scene.add(fish);
      addSimpleHero3D(THREE, scene, -0.6, 0.4, "#f76d57");
      return;
    }

    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 12, 48), accentMat);
    ring.position.set(0, 1.35, 0);
    ring.rotation.x = Math.PI / 2;
    ring.userData = { spin: 0.008 };
    scene.add(ring);
    addSimpleHero3D(THREE, scene, -0.8, 0, "#f76d57");
    addSimpleHero3D(THREE, scene, 0.8, 0, "#ffcfde", 0.55);
  }

  function addSimpleHero3D(THREE, scene, x, z, color, scale = 1) {
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.64 });
    const skinMat = new THREE.MeshStandardMaterial({ color: "#f3bd86", roughness: 0.72 });
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.15, 0.36), bodyMat);
    body.position.y = 1.15;
    body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 10), skinMat);
    head.position.y = 1.95;
    head.castShadow = true;
    group.add(body, head);
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    scene.add(group);
    return group;
  }

  function addStoryStars3D(THREE, scene, count) {
    const mat = new THREE.MeshBasicMaterial({ color: "#f8fbff" });
    for (let i = 0; i < count; i += 1) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (i % 3) * 0.015, 8, 6), mat);
      star.position.set(-18 + Math.random() * 36, 4 + Math.random() * 9, -12 + Math.random() * 8);
      scene.add(star);
    }
  }

  function threeGameplayPanel(theme, state = {}) {
    const id = `gameplay3d${++threeGameplaySerial}`;
    setTimeout(() => mountThreeGameplayScene(id, theme, state), 0);
    return `
      <div class="race-wrap three-race gameplay-3d-wrap">
        <div id="${id}" class="moto-3d-stage gameplay-3d-stage" aria-label="${esc(state.aria || `${theme} 3D gameplay`)}"></div>
        <div class="speech-bubble announcer-bubble">
          <span class="speaker">${esc(state.speaker || "Scene")}</span>
          ${esc(state.caption || "Live scene")}
        </div>
      </div>
    `;
  }

  async function mountThreeGameplayScene(id, theme, state) {
    const stage = document.querySelector(`#${id}`);
    if (!stage) return;
    try {
      const THREE = await loadThree();
      startThreeGameplayScene3D(THREE, stage, theme, state);
    } catch {
      // Gameplay buttons and text remain available without WebGL.
    }
  }

  function startThreeGameplayScene3D(THREE, stage, theme, state = {}) {
    const palette = {
      jedi: { sky: "#10172b", ground: "#25304f", accent: "#63e7ff" },
      guardian: { sky: "#182136", ground: "#2a3347", accent: "#62e3ff" },
      creatures: { sky: "#91d9f7", ground: "#5aa65c", accent: "#ffcf5a" },
      pixie: { sky: "#7dd4f4", ground: "#3f9c73", accent: "#ffe77a" },
      fishing: { sky: "#7ccdf0", ground: "#226b86", accent: "#d9f7ff" }
    }[theme] || { sky: "#85d4f0", ground: "#4e8948", accent: "#ffcf5a" };
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.sky);
    scene.fog = new THREE.Fog(palette.sky, 24, 92);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 150);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight("#fff7d8", "#243838", 1.22);
    const sun = new THREE.DirectionalLight("#fff7df", 2);
    sun.position.set(-10, 22, 12);
    sun.castShadow = true;
    scene.add(hemi, sun);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 24),
      new THREE.MeshStandardMaterial({ color: palette.ground, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    buildGameplayTheme3D(THREE, scene, theme, state, palette);
    camera.position.set(6.8, 5.1, 9.4);
    camera.lookAt(0, 1.2, 0);

    function resizeScene() {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(300, rect.width);
      const height = Math.max(280, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resizeScene();
    window.addEventListener("resize", resizeScene);
    addCleanup(() => {
      window.removeEventListener("resize", resizeScene);
      renderer.dispose();
      renderer.domElement.remove();
    });

    function tick(now) {
      scene.traverse((item) => {
        if (item.userData.float) item.position.y = item.userData.baseY + Math.sin(now / item.userData.speed + item.userData.phase) * item.userData.float;
        if (item.userData.spin) item.rotation.y += item.userData.spin;
        if (item.userData.pulse) item.scale.setScalar(item.userData.baseScale + Math.sin(now / item.userData.speed) * item.userData.pulse);
      });
      camera.position.x = 6.8 + Math.sin(now / 1700) * 0.25;
      camera.lookAt(0, 1.2, 0);
      renderer.render(scene, camera);
      raceLoop = requestAnimationFrame(tick);
    }
    raceLoop = requestAnimationFrame(tick);
  }

  function buildGameplayTheme3D(THREE, scene, theme, state, palette) {
    const accentMat = new THREE.MeshStandardMaterial({ color: palette.accent, emissive: palette.accent, emissiveIntensity: 0.36, roughness: 0.45 });
    const redMat = new THREE.MeshStandardMaterial({ color: "#f76d57", emissive: state.result === "bad" ? "#7a1008" : "#000000", emissiveIntensity: state.result === "bad" ? 0.28 : 0, roughness: 0.62 });
    const darkMat = new THREE.MeshStandardMaterial({ color: "#172c2d", roughness: 0.72 });
    const blueMat = new THREE.MeshStandardMaterial({ color: "#4d8dff", roughness: 0.62 });

    if (theme === "jedi") {
      addStoryStars3D(THREE, scene, 24);
      if (state.mode === "asteroids") {
        const lanes = [-2.6, 0, 2.6];
        lanes.forEach((x, index) => {
          const lane = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 8), new THREE.MeshStandardMaterial({ color: index === state.danger ? "#513640" : "#2c4468", roughness: 0.76 }));
          lane.position.set(x, 0.08, -0.4);
          scene.add(lane);
          const obj = index === state.danger
            ? new THREE.Mesh(new THREE.DodecahedronGeometry(0.58), darkMat)
            : new THREE.Mesh(new THREE.OctahedronGeometry(0.36), accentMat);
          obj.position.set(x, 1.05, -2.2 + index * 0.7);
          obj.castShadow = true;
          obj.userData = { spin: index === state.danger ? 0.012 : 0.018, float: 0.15, baseY: 1.05, speed: 360 + index * 80, phase: index };
          scene.add(obj);
        });
        const ship = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.72, 2.4, 5), redMat);
        ship.rotation.x = Math.PI / 2;
        ship.position.set(lanes[state.lastPick ?? 1] || 0, 0.82, 2.8);
        ship.castShadow = true;
        scene.add(ship);
        return;
      }
      addSimpleHero3D(THREE, scene, -1.4, 0.2, "#f76d57");
      addSimpleHero3D(THREE, scene, 1.4, -0.2, state.mode === "choices" ? "#50315e" : "#172c2d", 0.9);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3.4), state.result === "bad" ? redMat : accentMat);
      beam.position.set(0, 1.5, 0);
      beam.rotation.z = state.mode === "saber" ? 0.65 : -0.65;
      beam.castShadow = true;
      scene.add(beam);
      return;
    }

    if (theme === "guardian") {
      for (let i = 0; i < 3; i += 1) {
        const room = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.12, 3.7), new THREE.MeshStandardMaterial({ color: i === (state.room || 1) ? "#38516d" : "#2d394d", roughness: 0.78 }));
        room.position.set(-4.8 + i * 4.8, 0.08, -0.5);
        scene.add(room);
      }
      addSimpleHero3D(THREE, scene, -1.5, 0.35, "#4d8dff");
      addSimpleHero3D(THREE, scene, 2.0, -0.45, state.boss ? "#3b1c45" : "#202b38", state.boss ? 1.25 : 0.82);
      const projectile = new THREE.Mesh(new THREE.SphereGeometry(state.action === "super" ? 0.62 : 0.28, 18, 12), state.result === "bad" ? redMat : accentMat);
      projectile.position.set(0.35, 1.35, -0.12);
      projectile.userData = { pulse: 0.18, baseScale: 1, speed: 260, spin: 0.01 };
      scene.add(projectile);
      return;
    }

    if (theme === "creatures") {
      const map = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.08, 4.8), new THREE.MeshStandardMaterial({ color: "#6fb76c", roughness: 0.86 }));
      map.position.y = 0.08;
      scene.add(map);
      addSimpleHero3D(THREE, scene, -2.8, -0.2, "#f76d57", 0.65);
      const caught = state.caught || [];
      caught.forEach((id, i) => {
        const creature = creatures.find((item) => item.id === id) || creatures[i];
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 10), new THREE.MeshStandardMaterial({ color: creature.color, roughness: 0.72 }));
        orb.position.set(-1.35 + i * 0.72, 0.58, 1.1 + Math.sin(i) * 0.35);
        orb.userData = { float: 0.08, baseY: 0.58, speed: 360 + i * 70, phase: i };
        scene.add(orb);
      });
      if (state.encounter) {
        const target = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 10), new THREE.MeshStandardMaterial({ color: state.encounter.color, roughness: 0.7 }));
        target.position.set(2.5, 0.64, -0.65);
        target.userData = { float: 0.12, baseY: 0.64, speed: 330, phase: 0, spin: 0.012 };
        scene.add(target);
      }
      return;
    }

    if (theme === "pixie") {
      if (state.mode === "cove") {
        const water = new THREE.Mesh(new THREE.PlaneGeometry(36, 16), new THREE.MeshStandardMaterial({ color: "#2f9ab8", roughness: 0.82 }));
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.05;
        scene.add(water);
        const shadow = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.04, 0.72), darkMat);
        shadow.position.set(0.7, 0.12, -0.8);
        shadow.userData = { spin: 0.004 };
        scene.add(shadow);
      } else if (state.mode === "ship" || state.mode === "duel") {
        const ship = buildPixiePirateShip3D(THREE);
        ship.position.set(0.4, 0.15, 0.4);
        ship.scale.setScalar(0.72);
        scene.add(ship);
        addSimpleHero3D(THREE, scene, -1.8, -0.3, "#f76d57", 0.82);
        addSimpleHero3D(THREE, scene, 1.7, 0.2, "#172c2d", 0.92);
      } else {
        [-2.4, 0, 2.4].forEach((x, i) => {
          const key = new THREE.Mesh(new THREE.OctahedronGeometry(0.34), i < (state.keys || 0) ? accentMat : darkMat);
          key.position.set(x, 1.0, -0.4);
          key.userData = { float: 0.12, baseY: 1.0, speed: 350 + i * 70, phase: i, spin: 0.012 };
          scene.add(key);
        });
        addSimpleHero3D(THREE, scene, -3.1, 0.5, "#f76d57", 0.75);
      }
      const fairy = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), accentMat);
      fairy.position.set(2.7, 1.85, 0.9);
      fairy.userData = { float: 0.2, baseY: 1.85, speed: 300, phase: 0 };
      scene.add(fairy);
      return;
    }

    if (theme === "fishing") {
      const water = new THREE.Mesh(new THREE.PlaneGeometry(36, 24), new THREE.MeshStandardMaterial({ color: "#226b86", roughness: 0.86 }));
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.06;
      scene.add(water);
      const boat = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.76, 2.1), new THREE.MeshStandardMaterial({ color: "#fff7e1", roughness: 0.58 }));
      boat.position.set(-1.8, 0.82, 0.4);
      boat.castShadow = true;
      scene.add(boat);
      addSimpleHero3D(THREE, scene, -1.2, 0.1, "#f76d57", 0.74);
      const fish = new THREE.Mesh(new THREE.ConeGeometry(state.mode === "fight" ? 0.62 : 0.42, state.mode === "fight" ? 3.4 : 2.4, 16), blueMat);
      fish.rotation.z = Math.PI / 2;
      fish.position.set(2.3, 0.65, state.signal === "strike" || state.mode === "fight" ? 0.8 : 2.4);
      fish.userData = { float: 0.14, baseY: 0.65, speed: 360, phase: 1.4, spin: 0.006 };
      scene.add(fish);
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 4.4), state.result === "bad" ? redMat : accentMat);
      line.position.set(0.3, 1.05, 0.6);
      line.rotation.y = -0.35;
      scene.add(line);
    }
  }

  async function startMotoRace(tune, devMode = "normal") {
    render(`
      <section class="screen game-screen">
        <div class="race-wrap three-race">
          <div class="race-hud">
            <span id="raceStatus">Loading 3D track...</span>
            <span id="heatStatus">Heat 0%</span>
            <span id="lapStatus">3D Prototype</span>
          </div>
          <div id="moto3dStage" class="moto-3d-stage" aria-label="3D motocross race"></div>
        </div>
        <div class="dialogue" id="raceCallout">
          <span class="speaker">Pit Board</span>
          Building the 3D Garage Track.
        </div>
        <div class="mobile-controls">
          <div class="cluster">
            <button class="control-btn" data-control="left">Left</button>
            <button class="control-btn" data-control="right">Right</button>
          </div>
          <div class="cluster">
            <button class="control-btn boost" data-control="boost">Trick</button>
            <button class="control-btn gas" data-control="gas">Gas</button>
          </div>
        </div>
      </section>
    `);

    try {
      const THREE = await loadThree();
      startMotoRace3D(THREE, tune, devMode);
    } catch {
      callout("Pit Board", "Three.js did not load, so the fallback race is starting.");
      startMotoRaceCanvas(tune, devMode);
    }
  }

  function startMotoRace3D(THREE, tune, devMode = "normal") {
    const stage = document.querySelector("#moto3dStage");
    const heatLocked = devMode === "heatLock";
    const attemptNo = state.motoAttempts + 1;
    const exact = exactTune(tune);
    const trackLength = 280;
    const trackWidth = 18;
    const startZ = 18;
    const controls = { left: false, right: false, gas: false };
    const player = {
      p: 0,
      lane: 0,
      speed: 0,
      heat: 0,
      overheats: 0,
      boost: 0,
      airborne: 0,
      airT: 0,
      airDuration: 1.05,
      trickTimer: 0,
      trickKind: "sideSpin",
      trickQueued: 0,
      jumpCameraTimer: 0,
      launchedBumps: {},
      rampCalled: false,
      rampUsed: false,
      heatLocked
    };
    const rival = {
      p: 0,
      lane: 0.28,
      speed: tune.timing === 3 ? 0.0208 : 0.0216,
      airborne: 0,
      airT: 0,
      airDuration: 1.05,
      trickTimer: 0,
      trickKind: "sideSpin",
      trickQueued: 0,
      jumpCameraTimer: 0,
      launchedBumps: {}
    };
    let ended = false;
    let last = performance.now();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#85d4f0");
    scene.fog = new THREE.Fog("#85d4f0", 45, 185);

    const camera = new THREE.PerspectiveCamera(64, 1, 0.1, 380);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight("#fff6d7", "#476b48", 1.35);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight("#fff7df", 2.2);
    sun.position.set(-22, 44, 24);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    const world = new THREE.Group();
    scene.add(world);
    buildMoto3DWorld(THREE, world, trackLength, trackWidth, startZ);
    const bike = buildMotoBike3D(THREE, "#f76d57", "DAD");
    const rivalBike = buildMotoBike3D(THREE, "#2e4057", "R");
    const startGate = buildMotoStartGate3D(THREE, trackWidth);
    startGate.position.set(0, moto3DTrackHeight(0.012, 0) + 0.08, startZ - 3.4);
    scene.add(startGate, bike, rivalBike);

    function resize3D() {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(360, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resize3D();
    window.addEventListener("resize", resize3D);
    addCleanup(() => {
      window.removeEventListener("resize", resize3D);
      renderer.dispose();
      renderer.domElement.remove();
    });

    document.querySelectorAll("[data-control]").forEach((button) => {
      const key = button.dataset.control;
      const down = (event) => {
        event.preventDefault();
        if (key === "boost") useMoto3DBoost();
        else controls[key] = true;
      };
      const up = (event) => {
        event.preventDefault();
        if (key !== "boost") controls[key] = false;
      };
      button.addEventListener("pointerdown", down);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
      button.addEventListener("pointerleave", up);
    });

    const keyDown = (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) {
        event.preventDefault();
        controls.left = true;
      }
      if (["arrowright", "d"].includes(key)) {
        event.preventDefault();
        controls.right = true;
      }
      if (["arrowup", "w", " "].includes(key)) {
        event.preventDefault();
        controls.gas = true;
      }
      if (["shift", "enter", "b"].includes(key) && !event.repeat) {
        event.preventDefault();
        useMoto3DBoost();
      }
    };
    const keyUp = (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) controls.left = false;
      if (["arrowright", "d"].includes(key)) controls.right = false;
      if (["arrowup", "w", " "].includes(key)) controls.gas = false;
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    addCleanup(() => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    });

    let countdown = 3.35;
    callout(heatLocked ? "Pit Board" : "Announcer", heatLocked ? "3D heat lock active. Gate drops in three." : "Gate is loaded. Hold gas and wait for the drop.");
    document.querySelector("#lapStatus").textContent = `Attempt ${attemptNo}`;

    function tick(now) {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (!ended) update3D(dt);
      render3D(now);
      if (!ended) raceLoop = requestAnimationFrame(tick);
    }

    function update3D(dt) {
      const section = motoSection(player.p);
      if (countdown > 0) {
        countdown -= dt;
        player.p = 0;
        rival.p = 0;
        player.speed = 0;
        rival.speed = tune.timing === 3 ? 0.0208 : 0.0216;
        player.trickQueued = 0;
        startGate.userData.dropped = countdown <= 0;
        document.querySelector("#raceStatus").textContent = countdown > 0 ? `Gate ${Math.max(1, Math.ceil(countdown))}` : "Gate Drop";
        document.querySelector("#heatStatus").textContent = heatLocked ? "Heat Locked" : "Heat 0%";
        document.querySelector("#lapStatus").textContent = `Attempt ${attemptNo}`;
        if (countdown <= 0) callout("Announcer", "Gate drop! Go, Pops.");
        return;
      }
      const previousP = player.p;
      const rivalPreviousP = rival.p;
      const steering = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
      player.lane = clamp(player.lane + steering * dt * 1.7, -1, 1);
      player.lane *= 0.993;

      const maxSpeed = 0.020 + tune.engine * 0.0015 + tune.gearing * 0.0011;
      const accel = controls.gas ? 0.014 + tune.gearing * 0.001 : -0.010;
      player.speed = clamp(player.speed + accel * dt, 0, maxSpeed);
      if (player.boost > 0) player.boost -= dt;

      let speedMultiplier = player.boost > 0 ? 1.22 : 1;
      if (Math.abs(player.lane) > 0.72) speedMultiplier *= 0.84;
      if (motoMudAt(player.p, player.lane)) speedMultiplier *= 0.8;
      if (section === "bumps" && tune.suspension !== 3) speedMultiplier *= 0.88;
      if (section === "hill" && tune.gearing !== 3) speedMultiplier *= 0.88;
      player.p += player.speed * speedMultiplier * dt;
      maybeLaunchFromBump(player, previousP, player.p, "Dad");

      if (section === "ramp" && !player.rampCalled) {
        player.rampCalled = true;
        callout("Announcer", "Ramp is coming up in the track. Keep it straight, Pops.");
      }
      if (player.p >= MOTO_RAMP_TAKEOFF && !player.rampUsed) {
        player.airborne = 1.05;
        player.airT = 0;
        player.airDuration = 1.05;
        player.rampUsed = true;
        player.jumpCameraTimer = 3.2;
        callout("Announcer", "Takeoff. Now you can actually see the air.");
        if (player.trickQueued > 0) activateMotoTrick("Queued ramp trick. Dad throws a double whip-spin off the big ramp.", "bigRamp");
      }
      if (player.airborne > 0) {
        player.airborne -= dt;
        player.airT += dt;
        if (player.p >= MOTO_RAMP_TAKEOFF && player.p <= MOTO_RAMP_END + 0.14) {
          player.jumpCameraTimer = Math.max(player.jumpCameraTimer, 1.7);
        } else {
          player.jumpCameraTimer = Math.max(player.jumpCameraTimer, 1.2);
        }
      } else {
        player.airborne = 0;
      }
      if (player.trickTimer > 0) player.trickTimer -= dt;
      if (player.trickQueued > 0) player.trickQueued -= dt;
      if (player.jumpCameraTimer > 0) player.jumpCameraTimer -= dt;

      let rivalMultiplier = motoMudAt(rival.p, rival.lane) ? 0.8 : 1;
      if (motoSection(rival.p) === "bumps") rivalMultiplier *= 0.96;
      rival.p += rival.speed * rivalMultiplier * dt;
      maybeLaunchFromBump(rival, rivalPreviousP, rival.p, "Rival");
      if (rival.airborne > 0) {
        rival.airborne -= dt;
        rival.airT += dt;
      } else {
        rival.airborne = 0;
      }

      if (heatLocked) {
        player.heat = 0;
      } else {
        if (controls.gas) player.heat += dt * (7 + tune.engine * 1.8);
        else player.heat = Math.max(0, player.heat - dt * 10.4);
        if (player.boost > 0) player.heat += dt * 16;
        if (player.heat > 100) trigger3DOverheat();
      }

      document.querySelector("#raceStatus").textContent = sectionLabel(section);
      document.querySelector("#heatStatus").textContent = heatLocked ? "Heat Locked" : `Heat ${Math.round(player.heat)}%`;
      document.querySelector("#lapStatus").textContent = `Dad ${Math.min(100, Math.round(player.p * 100))}% | Rival ${Math.min(100, Math.round(rival.p * 100))}%`;
      if (player.p >= 1) finish3D(true);
      else if (rival.p >= 1) finish3D(false);
    }

    function render3D(now) {
      positionBike3D(bike, player, trackLength, trackWidth, startZ, now);
      positionBike3D(rivalBike, rival, trackLength, trackWidth, startZ, now + 300);
      animateMotoStartGate(startGate);
      const target = bike.position.clone();
      const finalJumpView = player.p >= MOTO_RAMP_START - 0.015 && player.p <= MOTO_RAMP_END + 0.16;
      const rawJumpView = clamp(Math.max(player.airborne, player.jumpCameraTimer) / 1.05, 0, 1);
      const jumpView = finalJumpView ? Math.max(rawJumpView, 0.72) : rawJumpView;
      const lookAhead = finalJumpView ? 4.6 : 14 + jumpView * 4;
      const chaseBack = finalJumpView ? 32 + jumpView * 10 : 20 + jumpView * 10;
      const cameraTarget = new THREE.Vector3(target.x * 0.3, target.y + 2.85 + jumpView * 2.2, target.z - lookAhead);
      const desired = new THREE.Vector3(target.x * 0.55, target.y + 8.1 + jumpView * 9.6 + (finalJumpView ? 2.8 : 0), target.z + chaseBack);
      const cameraP = clamp((startZ - desired.z) / trackLength, 0, 1);
      const cameraGround = moto3DTrackHeight(cameraP, clamp(desired.x / (trackWidth * 0.33), -1, 1));
      desired.y = Math.max(desired.y, cameraGround + 10.8 + jumpView * 6.8 + (finalJumpView ? 2.6 : 0));
      camera.position.lerp(desired, finalJumpView ? 0.11 : jumpView > 0 ? 0.08 : 0.12);
      const actualCameraP = clamp((startZ - camera.position.z) / trackLength, 0, 1);
      const actualGround = moto3DTrackHeight(actualCameraP, clamp(camera.position.x / (trackWidth * 0.33), -1, 1));
      camera.position.y = Math.max(camera.position.y, actualGround + 10.2 + (finalJumpView ? 2.2 : 0));
      camera.lookAt(cameraTarget);
      renderer.render(scene, camera);
    }

    function useMoto3DBoost() {
      if (ended || countdown > 0) return;
      const trickWindow = player.airborne > 0 || player.jumpCameraTimer > 0.18;
      if (trickWindow) {
        const kind = player.p >= MOTO_RAMP_START - 0.02 ? "bigRamp" : "sideSpin";
        activateMotoTrick("", kind);
      } else if (canQueueMotoTrick(player.p)) {
        const rampQueue = player.p >= MOTO_RAMP_START - 0.11;
        player.trickQueued = rampQueue ? 7.0 : 2.8;
        callout("Announcer", rampQueue ? "Big-ramp trick queued. Hold gas and keep the bike straight." : "Trick queued. Hold the line and Dad will throw it off the next lip.");
      } else {
        player.boost = 0.72;
        if (!player.heatLocked) player.heat += 18;
        callout("Announcer", "Boost engaged. The engine has concerns.");
      }
    }

    function activateMotoTrick(text = "", kind = "sideSpin") {
      const timing = player.airborne;
      const clean = timing === 0 || (timing > 0.24 && timing < 0.82);
      player.boost = clean ? 1.18 : 0.64;
      player.trickTimer = kind === "bigRamp" ? 1.18 : 0.92;
      player.trickKind = kind;
      player.trickQueued = 0;
      player.jumpCameraTimer = kind === "bigRamp" ? 2.55 : 1.25;
      if (!player.heatLocked) player.heat += clean ? 12 : 10;
      callout("Announcer", text || (kind === "bigRamp" ? "Big ramp trick. Two clean sideways spins." : clean ? "Small sideways whip. Clean and readable." : "Sketchy air trick. Dad keeps it under control."));
    }

    function canQueueMotoTrick(p) {
      if (["bumps", "hill", "ramp"].includes(motoSection(p))) return true;
      return motoTrackFeatures.some((feature) => {
        if (feature.type === "bump" && feature.kicker) return p >= feature.start - 0.07 && p <= feature.end + 0.012;
        if (feature.type === "ramp") return p >= feature.start - 0.11 && p <= MOTO_RAMP_TAKEOFF + 0.03;
        return false;
      });
    }

    function maybeLaunchFromBump(racer, previousP, currentP, label) {
      motoTrackFeatures.filter((feature) => feature.type === "bump" && feature.kicker).forEach((feature) => {
        const launchP = feature.start + (feature.end - feature.start) * 0.72;
        if (previousP < launchP && currentP >= launchP && !racer.launchedBumps[feature.bumpNo]) {
          racer.launchedBumps[feature.bumpNo] = true;
          racer.airborne = 0.58;
          racer.airT = 0;
          racer.airDuration = 0.58;
          racer.jumpCameraTimer = 0.85;
          if (label === "Dad") {
            callout("Announcer", `Rhythm bump ${feature.bumpNo} kicked Dad into the air. Trick window open.`);
            if (player.trickQueued > 0) activateMotoTrick(`Queued rhythm trick. Dad throws it off bump ${feature.bumpNo}.`, "sideSpin");
          }
        }
      });
    }

    function trigger3DOverheat() {
      player.overheats += 1;
      player.heat = 42;
      if (player.overheats === 1) {
        player.speed *= 0.45;
        callout("Announcer", "Engine is hot. The bike is now making financial decisions.");
      } else if (player.overheats === 2) {
        player.speed = 0;
        callout("Adam", "That engine did not stall by accident. That was a full commitment.");
      } else {
        ended = true;
        state.motoAttempts += 1;
        saveState();
        renderMotoGarage(`
          <span class="speaker">Hayleigh</span>
          Boom!
          <br><br>
          <span class="speaker">Adam</span>
          Third overheat. The 3D bike has filed for emotional damages.
          ${motoAdvice(tune)}
        `);
      }
    }

    function finish3D(playerFinishedFirst) {
      if (ended) return;
      ended = true;
      state.motoAttempts += 1;
      saveState();
      if (playerFinishedFirst && !(attemptNo === 1 && !exact)) {
        completeWorld("moto");
        if (exact) renderMotoTechScene3D();
        else renderMotoWin(false);
      } else if (exact) {
        renderMotoPerfectLossScene3D();
      } else {
        renderMotoGarage(`
          <span class="speaker">Adam</span>
          ${attemptNo === 1 && !exact ? "First run exposed the setup. The rival edges you out at the line." : "He got you that time. No pity wins in this family."}
          ${motoAdvice(tune)}
        `);
      }
    }

    raceLoop = requestAnimationFrame(tick);
  }

  function buildMoto3DWorld(THREE, world, trackLength, trackWidth, startZ) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 360),
      new THREE.MeshStandardMaterial({ color: "#4d8846", roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.08, -trackLength / 2 + startZ);
    ground.receiveShadow = true;
    world.add(ground);

    const trackMesh = createMotoTrackMesh(THREE, trackLength, trackWidth, startZ);
    trackMesh.receiveShadow = true;
    world.add(trackMesh);

    addTrackEdges3D(THREE, world, trackLength, trackWidth, startZ);
    addTrackScenery3D(THREE, world, trackLength, trackWidth, startZ);
  }

  function createMotoTrackMesh(THREE, trackLength, trackWidth, startZ) {
    const rows = 360;
    const cols = 28;
    const vertices = [];
    const colors = [];
    const indices = [];
    for (let i = 0; i <= rows; i += 1) {
      const p = i / rows;
      const z = startZ - p * trackLength;
      for (let j = 0; j <= cols; j += 1) {
        const side = j / cols;
        const lane = (side - 0.5) * 2;
        const x = lane * trackWidth / 2;
        const y = moto3DTrackHeight(p, lane);
        vertices.push(x, y, z);
        const color = moto3DTrackColor(THREE, p, lane, i, j);
        colors.push(color.r, color.g, color.b);
      }
    }
    for (let i = 0; i < rows; i += 1) {
      for (let j = 0; j < cols; j += 1) {
        const a = i * (cols + 1) + j;
        const b = a + 1;
        const c = a + cols + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.02, side: THREE.DoubleSide })
    );
  }

  function moto3DTrackColor(THREE, p, lane, row, col) {
    const feature = motoTrackFeatures.find((item) => item.start <= p && item.end >= p);
    let base = "#a96f3f";
    if (motoMudAt(p, lane)) base = "#4a2d22";
    else if (feature?.type === "bump") base = "#c28b52";
    else if (feature?.type === "hill") base = "#925936";
    else if (feature?.type === "ramp") base = (row + col) % 2 === 0 ? "#c78b4a" : "#8b5a38";
    const color = new THREE.Color(base);
    const grain = 0.88 + seededRandom(row * 17 + col * 23) * 0.18;
    color.multiplyScalar(grain);
    return color;
  }

  function moto3DTrackHeight(p, lane = 0) {
    let y = 0;
    if (p >= 0.43 && p < MOTO_RAMP_START) {
      y += Math.sin(((p - 0.43) / (MOTO_RAMP_START - 0.43)) * Math.PI) * 3.1;
    }
    if (p >= MOTO_RAMP_START && p < MOTO_RAMP_TAKEOFF) {
      y += ((p - MOTO_RAMP_START) / (MOTO_RAMP_TAKEOFF - MOTO_RAMP_START)) * 6.4;
    }
    if (p >= MOTO_RAMP_TAKEOFF && p < MOTO_RAMP_END) {
      y += 6.4 - ((p - MOTO_RAMP_TAKEOFF) / (MOTO_RAMP_END - MOTO_RAMP_TAKEOFF)) * 2.6;
    }
    motoTrackFeatures.filter((feature) => feature.type === "bump").forEach((feature) => {
      if (p >= feature.start && p <= feature.end) {
        const t = (p - feature.start) / (feature.end - feature.start);
        const height = feature.kicker ? 2.35 : 1.55;
        y += Math.sin(t * Math.PI) * height * clamp(1.28 - Math.abs(lane) * 0.74, 0.35, 1);
      }
    });
    return y;
  }

  function motoMudAt(p, lane) {
    return motoTrackFeatures.some((feature) => {
      if (feature.type !== "mud") return false;
      const longitudinal = (p - feature.center) / feature.radius;
      const lateral = (lane - feature.lane) / feature.width;
      return longitudinal * longitudinal + lateral * lateral <= 1;
    });
  }

  function addTrackEdges3D(THREE, world, trackLength, trackWidth, startZ) {
    for (let i = 0; i < 46; i += 1) {
      const p = i / 45;
      const z = startZ - p * trackLength;
      const y = moto3DTrackHeight(p, 1) + 0.18;
      [-1, 1].forEach((side) => {
        const block = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.32, 2.4),
          new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? "#fff7e1" : "#d74332", roughness: 0.82 })
        );
        block.position.set(side * (trackWidth / 2 + 0.55), y, z);
        block.castShadow = true;
        block.receiveShadow = true;
        world.add(block);
      });
    }
  }

  function addTrackScenery3D(THREE, world, trackLength, trackWidth, startZ) {
    for (let i = 0; i < 70; i += 1) {
      const p = i / 69;
      const z = startZ - p * trackLength + seededRandom(i + 45) * 6 - 3;
      const side = seededRandom(i + 12) > 0.5 ? 1 : -1;
      const x = side * (trackWidth / 2 + 7 + seededRandom(i + 71) * 18);
      if (i % 4 === 0) addMoto3DSign(THREE, world, x, z, side);
      else addMoto3DTree(THREE, world, x, z);
    }
  }

  function addMoto3DTree(THREE, world, x, z) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.26, 2.5, 8),
      new THREE.MeshStandardMaterial({ color: "#5b3f2d", roughness: 1 })
    );
    trunk.position.set(x, 1.2, z);
    trunk.castShadow = true;
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(1.15, 3.2, 9),
      new THREE.MeshStandardMaterial({ color: "#2f7048", roughness: 1 })
    );
    leaves.position.set(x, 3.2, z);
    leaves.castShadow = true;
    world.add(trunk, leaves);
  }

  function addMoto3DSign(THREE, world, x, z, side) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 2.2, 0.18),
      new THREE.MeshStandardMaterial({ color: "#6d4a32", roughness: 1 })
    );
    post.position.set(x, 1.1, z);
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1, 0.18),
      new THREE.MeshStandardMaterial({ color: "#fff7e1", roughness: 0.8 })
    );
    board.position.set(x + side * 0.4, 2.25, z);
    board.rotation.y = side * -0.25;
    world.add(post, board);
  }

  function buildMotoStartGate3D(THREE, trackWidth) {
    const gate = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: "#283337", roughness: 0.5, metalness: 0.25 });
    const padMat = new THREE.MeshStandardMaterial({ color: "#ffcf5a", roughness: 0.56, metalness: 0.05 });
    const bar = new THREE.Group();
    const cross = new THREE.Mesh(new THREE.BoxGeometry(trackWidth * 0.78, 0.16, 0.18), metalMat);
    cross.position.y = 1.55;
    cross.castShadow = true;
    bar.add(cross);
    for (let x = -trackWidth * 0.35; x <= trackWidth * 0.35; x += trackWidth * 0.175) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.55, 0.16), padMat);
      slat.position.set(x, 0.82, 0);
      slat.rotation.z = 0.08;
      slat.castShadow = true;
      bar.add(slat);
    }
    [-trackWidth * 0.42, trackWidth * 0.42].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.25, 0.24), metalMat);
      post.position.set(x, 1.12, 0);
      post.castShadow = true;
      gate.add(post);
    });
    gate.add(bar);
    gate.userData.bar = bar;
    gate.userData.drop = 0;
    gate.userData.dropped = false;
    return gate;
  }

  function animateMotoStartGate(gate) {
    if (!gate) return;
    const bar = gate.userData.bar;
    gate.userData.drop = clamp((gate.userData.drop || 0) + (gate.userData.dropped ? 0.075 : -0.075), 0, 1);
    const drop = gate.userData.drop;
    if (bar) {
      bar.rotation.x = -drop * 1.45;
      bar.position.y = -drop * 0.56;
      bar.position.z = -drop * 0.58;
    }
  }

  function buildMotoBike3D(THREE, color, label) {
    const bike = new THREE.Group();
    const visual = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.06 });
    const darkMat = new THREE.MeshStandardMaterial({ color: "#172c2d", roughness: 0.64, metalness: 0.04 });
    const metalMat = new THREE.MeshStandardMaterial({ color: "#d7d2c2", roughness: 0.38, metalness: 0.25 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: "#11191a", roughness: 0.78 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: "#25343b", roughness: 0.72 });
    const jerseyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.66 });
    const skinMat = new THREE.MeshStandardMaterial({ color: "#f3bd86", roughness: 0.72 });
    const plateMat = new THREE.MeshStandardMaterial({ color: "#fff7e1", roughness: 0.64 });
    const flareMat = new THREE.MeshStandardMaterial({
      color: "#ffd35a",
      emissive: "#ff7a18",
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.82,
      roughness: 0.34
    });

    const wheelPositions = [
      new THREE.Vector3(0, 0.58, -1.08),
      new THREE.Vector3(0, 0.58, 1.05)
    ];
    const wheels = wheelPositions.map((position) => {
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.11, 12, 28), rubberMat);
      tire.rotation.y = Math.PI / 2;
      tire.position.copy(position);
      tire.castShadow = true;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.28, 14), metalMat);
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(position);
      hub.castShadow = true;
      visual.add(tire, hub);
      return tire;
    });

    addTubeBetween(THREE, visual, new THREE.Vector3(0, 0.96, -1.04), new THREE.Vector3(0, 1.32, -0.12), 0.06, metalMat);
    addTubeBetween(THREE, visual, new THREE.Vector3(0, 0.96, 1.03), new THREE.Vector3(0, 1.28, -0.05), 0.06, metalMat);
    addTubeBetween(THREE, visual, new THREE.Vector3(0, 1.28, -0.05), new THREE.Vector3(0, 1.55, 0.72), 0.055, metalMat);
    addTubeBetween(THREE, visual, new THREE.Vector3(0, 1.28, -0.05), new THREE.Vector3(0, 1.66, -0.86), 0.055, metalMat);

    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.34, 1.18), bodyMat);
    tank.position.set(0, 1.42, -0.2);
    tank.rotation.x = -0.16;
    tank.castShadow = true;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 1.02), darkMat);
    seat.position.set(0, 1.58, 0.48);
    seat.rotation.x = -0.08;
    seat.castShadow = true;
    const frontFender = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.12, 0.9), bodyMat);
    frontFender.position.set(0, 1.08, -1.22);
    frontFender.rotation.x = 0.12;
    frontFender.castShadow = true;
    const rearFender = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.13, 0.92), bodyMat);
    rearFender.position.set(0, 1.18, 1.18);
    rearFender.rotation.x = -0.18;
    rearFender.castShadow = true;
    const numberPlate = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.46, 0.08), plateMat);
    numberPlate.position.set(0, 1.48, -1.0);
    numberPlate.rotation.x = -0.12;
    numberPlate.castShadow = true;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.86, 0.38), jerseyMat);
    torso.position.set(0, 2.0, 0.08);
    torso.rotation.x = -0.32;
    torso.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 12), skinMat);
    head.position.set(0, 2.58, -0.18);
    head.castShadow = true;
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.39, 18, 12), darkMat);
    helmet.scale.set(1.08, 0.78, 1);
    helmet.position.set(0, 2.66, -0.2);
    helmet.castShadow = true;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.24), plateMat);
    visor.position.set(0, 2.68, -0.52);
    visor.castShadow = true;

    addTubeBetween(THREE, visual, new THREE.Vector3(-0.22, 1.72, 0.25), new THREE.Vector3(-0.24, 1.08, 0.86), 0.07, pantsMat);
    addTubeBetween(THREE, visual, new THREE.Vector3(0.22, 1.72, 0.25), new THREE.Vector3(0.24, 1.08, 0.86), 0.07, pantsMat);
    addTubeBetween(THREE, visual, new THREE.Vector3(-0.28, 2.18, -0.05), new THREE.Vector3(-0.38, 1.76, -0.86), 0.055, jerseyMat);
    addTubeBetween(THREE, visual, new THREE.Vector3(0.28, 2.18, -0.05), new THREE.Vector3(0.38, 1.76, -0.86), 0.055, jerseyMat);
    const handlebar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.12), metalMat);
    handlebar.position.set(0, 1.78, -0.92);
    handlebar.castShadow = true;

    const flare = new THREE.Group();
    [-0.34, 0.34].forEach((x) => {
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.28), flareMat);
      ribbon.position.set(x, 1.16, 1.18);
      ribbon.rotation.x = 0.35;
      ribbon.castShadow = true;
      flare.add(ribbon);
      const spark = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), flareMat);
      spark.position.set(x * 1.15, 1.22, 1.84);
      flare.add(spark);
    });
    flare.visible = false;
    visual.add(flare);

    [tank, seat, frontFender, rearFender, numberPlate, torso, head, helmet, visor, handlebar].forEach((part) => visual.add(part));
    visual.rotation.x = 0.02;
    bike.add(visual);
    bike.userData.visual = visual;
    bike.userData.wheels = wheels;
    bike.userData.flare = flare;
    bike.userData.label = label;
    return bike;
  }

  function addTubeBetween(THREE, group, start, end, radius, material) {
    const delta = new THREE.Vector3().subVectors(end, start);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 10), material);
    mesh.position.copy(start).addScaledVector(delta, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }

  function positionBike3D(bike, racer, trackLength, trackWidth, startZ, now) {
    const laneX = racer.lane * trackWidth * 0.33;
    const z = startZ - racer.p * trackLength;
    const groundY = moto3DTrackHeight(racer.p, racer.lane);
    let lift = 0;
    if (racer.airborne > 0) {
      const duration = racer.airDuration || 1.05;
      const t = clamp(racer.airT / duration, 0, 1);
      const jumpHeight = duration < 0.8 ? 3.3 : 7.4;
      lift = 1.8 + Math.sin(t * Math.PI) * jumpHeight;
    }
    const trickKind = racer.trickKind || "sideSpin";
    if (racer.trickTimer > 0) lift += trickKind === "bigRamp" ? 4.25 : 3.05;
    const minClearance = racer.trickTimer > 0 ? (trickKind === "bigRamp" ? 4.4 : 3.35) : 0;
    bike.position.set(laneX, groundY + Math.max(lift, minClearance), z);
    const ahead = moto3DTrackHeight(clamp(racer.p + 0.012, 0, 1), racer.lane);
    const slope = ahead - groundY;
    const visual = bike.userData.visual || bike;
    bike.rotation.set(0, -racer.lane * 0.05, 0);
    visual.rotation.x = -slope * 0.2 + (racer.airborne > 0 ? -0.2 : 0);
    visual.rotation.y = 0;
    visual.rotation.z = -racer.lane * 0.08 + Math.sin(now / 90) * 0.015;
    if (racer.trickTimer > 0) {
      const fullTime = trickKind === "bigRamp" ? 1.18 : 0.92;
      const trickT = 1 - clamp(racer.trickTimer / fullTime, 0, 1);
      visual.rotation.z += trickKind === "bigRamp"
        ? trickT * Math.PI * 4
        : Math.sin(trickT * Math.PI) * Math.PI * 0.34;
      visual.rotation.y += trickKind === "bigRamp"
        ? Math.sin(trickT * Math.PI) * 0.26
        : Math.sin(trickT * Math.PI) * 0.34;
      visual.rotation.x += Math.sin(trickT * Math.PI) * (trickKind === "bigRamp" ? 0.12 : 0.18);
    }
    const flare = bike.userData.flare;
    if (flare) {
      const activeFlare = racer.trickTimer > 0;
      flare.visible = activeFlare;
      if (activeFlare) {
        const pulse = (trickKind === "bigRamp" ? 1.06 : 0.72) + Math.sin(now / 70) * 0.12;
        flare.scale.set(pulse, pulse, (trickKind === "bigRamp" ? 1.22 : 0.82) + Math.sin(now / 90) * 0.1);
        flare.rotation.y = now / (trickKind === "bigRamp" ? 160 : 220);
      }
    }
    (bike.userData.wheels || []).forEach((wheel) => {
      wheel.rotation.x = now / -80;
    });
  }

  function startMotoRaceCanvas(tune, devMode = "normal") {
    const attemptNo = state.motoAttempts + 1;
    const exact = exactTune(tune);
    const heatLocked = devMode === "heatLock";
    render(`
      <section class="screen game-screen">
        <div class="race-wrap">
          <div class="race-hud">
            <span id="raceStatus">Gate drop...</span>
            <span id="heatStatus">Heat 0%</span>
            <span id="lapStatus">Attempt ${attemptNo}</span>
          </div>
          <canvas id="raceCanvas" width="900" height="560" aria-label="Motocross race"></canvas>
        </div>
        <div class="dialogue" id="raceCallout">
          <span class="speaker">${heatLocked ? "Pit Board" : "Announcer"}</span>
          ${heatLocked ? "Development heat lock active. Hold gas freely to inspect the race flow." : tune.timing === 3 ? "Clean start if you earn it." : "That timing sounds suspicious already."}
        </div>
        <div class="mobile-controls">
          <div class="cluster">
            <button class="control-btn" data-control="left">Left</button>
            <button class="control-btn" data-control="right">Right</button>
          </div>
          <div class="cluster">
            <button class="control-btn boost" data-control="boost">Trick</button>
            <button class="control-btn gas" data-control="gas">Gas</button>
          </div>
        </div>
      </section>
    `);

    const canvas = document.querySelector("#raceCanvas");
    const ctx = canvas.getContext("2d");
    const controls = { left: false, right: false, gas: false };
    const player = {
      p: 0,
      lane: 0,
      speed: 0,
      heat: 0,
      overheats: 0,
      stall: tune.timing === 3 ? 0 : 1.9,
      boost: 0,
      airborne: 0,
      rampUsed: false,
      rampCalled: false,
      finished: false,
      heatLocked
    };
    const rival = {
      p: tune.timing === 3 ? 0 : 0.035,
      speed: 0.0205
    };
    let last = performance.now();
    let ended = false;

    document.querySelectorAll("[data-control]").forEach((button) => {
      const key = button.dataset.control;
      const down = (event) => {
        event.preventDefault();
        if (key === "boost") useMotoBoost(player);
        else controls[key] = true;
      };
      const up = (event) => {
        event.preventDefault();
        if (key !== "boost") controls[key] = false;
      };
      button.addEventListener("pointerdown", down);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
      button.addEventListener("pointerleave", up);
    });
    const keyDown = (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) {
        event.preventDefault();
        controls.left = true;
      }
      if (["arrowright", "d"].includes(key)) {
        event.preventDefault();
        controls.right = true;
      }
      if (["arrowup", "w", " "].includes(key)) {
        event.preventDefault();
        controls.gas = true;
      }
      if (["shift", "enter", "b"].includes(key) && !event.repeat) {
        event.preventDefault();
        useMotoBoost(player);
      }
    };
    const keyUp = (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) controls.left = false;
      if (["arrowright", "d"].includes(key)) controls.right = false;
      if (["arrowup", "w", " "].includes(key)) controls.gas = false;
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    addCleanup(() => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    });

    function tick(now) {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (!ended) updateMoto(dt);
      drawMotoRace(ctx, canvas, player, rival);
      if (!ended) raceLoop = requestAnimationFrame(tick);
    }

    function updateMoto(dt) {
      const section = motoSection(player.p);
      if (player.stall > 0) {
        player.stall -= dt;
        document.querySelector("#raceStatus").textContent = "Stalled at gate";
      } else {
        const grip = 1 + (tune.tires - 3) * 0.08;
        const steering = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
        player.lane += steering * dt * 1.65 * grip;
        player.lane *= 0.992;
        player.lane = clamp(player.lane, -1, 1);

        const maxSpeed = 0.018 + tune.engine * 0.0014 + tune.gearing * 0.001;
        const accel = controls.gas ? 0.016 + tune.gearing * 0.001 : -0.012;
        player.speed = clamp(player.speed + accel * dt, 0, maxSpeed);
        if (player.boost > 0) player.boost -= dt;

        let speedMultiplier = player.boost > 0 ? 1.24 : 1;
        if (Math.abs(player.lane) > 0.72) speedMultiplier *= 0.82;
        if (section === "mud" && tune.tires !== 4) speedMultiplier *= 0.86;
        if (section === "bumps" && tune.suspension !== 3) speedMultiplier *= 0.9;
        if (section === "hill" && tune.gearing !== 3) speedMultiplier *= 0.88;

        if (section === "ramp" && !player.rampCalled) {
          player.rampCalled = true;
          callout("Announcer", "Ramp ahead. Hold your line, Pops.");
        }
        if (player.p >= MOTO_RAMP_TAKEOFF && !player.rampUsed) {
          player.airborne = 1.05;
          player.rampUsed = true;
          callout("Announcer", "Takeoff. This is where confidence meets paperwork.");
        }
        if (player.airborne > 0) player.airborne -= dt;

        player.p += player.speed * speedMultiplier * dt;
        if (heatLocked) {
          player.heat = 0;
        } else {
          if (controls.gas) player.heat += dt * (7 + tune.engine * 1.8);
          else player.heat = Math.max(0, player.heat - dt * 10.4);
          if (player.boost > 0) player.heat += dt * 16;
          if (player.heat > 100) triggerOverheat();
        }
        document.querySelector("#raceStatus").textContent = sectionLabel(section);
      }

      rival.p += rival.speed * dt;
      document.querySelector("#heatStatus").textContent = heatLocked ? "Heat Locked" : `Heat ${Math.round(player.heat)}%`;
      document.querySelector("#lapStatus").textContent = `Dad ${Math.min(100, Math.round(player.p * 100))}% | Rival ${Math.min(100, Math.round(rival.p * 100))}%`;
      if (player.p >= 1) finishMoto(true);
      else if (rival.p >= 1) finishMoto(false);
    }

    function triggerOverheat() {
      player.overheats += 1;
      player.heat = 42;
      if (player.overheats === 1) {
        player.speed *= 0.45;
        callout("Announcer", "Engine is hot. The bike is now making financial decisions.");
      } else if (player.overheats === 2) {
        player.stall = 1.35;
        callout("Adam", "That engine did not stall by accident. That was a full commitment.");
      } else {
        ended = true;
        state.motoAttempts += 1;
        saveState();
        renderMotoGarage(`
          <span class="speaker">Hayleigh</span>
          Boom!
          <br><br>
          <span class="speaker">Adam</span>
          The third overheat exploded the bike. Maybe stop trying to turn the engine into fireworks.
          ${motoAdvice(tune)}
        `);
      }
    }

    function useMotoBoost(playerState) {
      if (ended) return;
      if (playerState.airborne > 0) {
        const timing = playerState.airborne;
        if (timing > 0.38 && timing < 0.78) {
          playerState.boost = 1.15;
          if (!playerState.heatLocked) playerState.heat += 12;
          callout("Announcer", "Dad Flip! Clean enough to pretend it was planned.");
        } else if (timing > 0.16) {
          playerState.boost = 0.68;
          if (!playerState.heatLocked) playerState.heat += 10;
          callout("Announcer", "Questionable Decision! Somehow, still moving.");
        } else {
          playerState.speed *= 0.35;
          callout("Announcer", "That landing went over like a fart in church!<br><br><span class='speaker'>Adam</span>I respect the confidence. Not the landing.");
        }
        playerState.airborne = 0;
      } else {
        playerState.boost = 0.72;
        if (!playerState.heatLocked) playerState.heat += 18;
        callout("Announcer", "Boost engaged. The engine has concerns.");
      }
    }

    function finishMoto(playerFinishedFirst) {
      if (ended) return;
      ended = true;
      state.motoAttempts += 1;
      saveState();
      if (playerFinishedFirst && !(attemptNo === 1 && !exact)) {
        completeWorld("moto");
        if (exact) renderMotoTechScene();
        else renderMotoWin(false);
      } else if (exact) {
        renderMotoPerfectLossScene3D();
      } else {
        renderMotoGarage(`
          <span class="speaker">Adam</span>
          ${attemptNo === 1 && !exact ? "First run exposed the setup. The rival edges you out at the line." : "He got you that time. No pity wins in this family."}
          ${motoAdvice(tune)}
        `);
      }
    }

    raceLoop = requestAnimationFrame(tick);
  }

  function motoSection(p) {
    if (p < 0.08) return "start";
    if (p < 0.31) return "mud";
    if (p < 0.525) return "bumps";
    if (p < 0.57) return "hill";
    if (p < 0.66) return "ramp";
    return "straight";
  }

  function sectionLabel(section) {
    return ({
      start: "Start Gate",
      mud: "Mud Pit",
      bumps: "Rhythm Bumps",
      hill: "Steep Climb",
      ramp: "Big Ramp",
      straight: "Final Straight"
    })[section] || "Track";
  }

  function motoAdvice(tune) {
    const wrong = Object.keys(motoTarget).find((key) => tune[key] !== motoTarget[key]);
    if (!wrong) return "<br><br>Adam: The tune is right. Now race like you meant it.";
    const advice = {
      tires: "You're trying to ride through mud like it's a freshly paved driveway. Try more tire grip, Pops.",
      suspension: "That landing looked like the bike filed a complaint. Suspension needs work.",
      gearing: "You're either launching hard and running out of breath, or waiting three business days to accelerate. Check the gearing.",
      engine: "The engine is fast, yeah. It's also trying to become fireworks. Maybe adjust the mix.",
      timing: "Start gate timing, Pops. Right now the bike is thinking about it before leaving."
    };
    return `<br><br>${advice[wrong]}`;
  }

  function callout(speaker, text) {
    const box = document.querySelector("#raceCallout");
    if (box) box.innerHTML = `<span class="speaker">${speaker}</span>${text}`;
  }

  async function renderMotoTechScene3D() {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Tech Check</h1>
          <p class="subtitle">Perfect Tune Bonus Unlocked</p>
        </div>
        <div class="race-wrap three-race tech-race">
          <div id="motoTech3dStage" class="moto-3d-stage tech-3d-stage" aria-label="3D motocross tech inspection"></div>
          <div class="speech-bubble judge-bubble" id="techSpeechBubble">
            <span class="speaker">Announcer</span>
            Hold up!
          </div>
        </div>
        <div class="panel tech-check-panel">
          <h2>Inspection Board</h2>
          <div class="tech-list" id="techList">
            <span>Tires</span>
            <span>Engine</span>
            <span>Suspension</span>
            <span>Dad Horsepower</span>
          </div>
        </div>
        <div class="button-row">
          <button class="btn" id="nextTechLine">Next</button>
          <button class="btn secondary" id="continueWin" disabled>Inspection In Progress</button>
        </div>
      </section>
    `);

    try {
      const THREE = await loadThree();
      startMotoTechScene3D(THREE);
    } catch {
      renderMotoTechScene();
    }
  }

  function startMotoTechScene3D(THREE) {
    const stage = document.querySelector("#motoTech3dStage");
    const button = document.querySelector("#continueWin");
    const nextButton = document.querySelector("#nextTechLine");
    const speechBubble = document.querySelector("#techSpeechBubble");
    const checks = Array.from(document.querySelectorAll("#techList span"));
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#82d0e8");
    scene.fog = new THREE.Fog("#82d0e8", 36, 120);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight("#fff6d7", "#476b48", 1.35);
    const sun = new THREE.DirectionalLight("#fff7df", 2.2);
    sun.position.set(-16, 32, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(hemi, sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
      new THREE.MeshStandardMaterial({ color: "#4e8948", roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.22, 8),
      new THREE.MeshStandardMaterial({ color: "#b77d48", roughness: 0.9 })
    );
    pad.position.set(0, 0.08, 0);
    pad.receiveShadow = true;
    scene.add(pad);

    const stripeMat = new THREE.MeshStandardMaterial({ color: "#fff7e1", roughness: 0.8 });
    [-1, 1].forEach((side) => {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 8.4), stripeMat);
      stripe.position.set(side * 5.6, 0.25, 0);
      scene.add(stripe);
    });

    const bike = buildMotoBike3D(THREE, "#f76d57", "DAD");
    bike.position.set(0, 0.22, -0.7);
    bike.rotation.y = Math.PI;
    scene.add(bike);

    const rival = buildMotoBike3D(THREE, "#2e4057", "R");
    rival.position.set(-8.4, 0.16, -2.6);
    rival.rotation.y = Math.PI * 0.74;
    rival.scale.setScalar(0.82);
    scene.add(rival);

    const judge = buildTechJudge3D(THREE);
    judge.position.set(8.2, 0, 4.5);
    judge.rotation.y = -Math.PI * 0.62;
    scene.add(judge);

    addTechProps3D(THREE, scene);
    camera.position.set(8.5, 5.1, 10.8);
    camera.lookAt(0, 1.3, -0.2);

    const lines = [
      { speaker: "Announcer", text: "Hold up!" },
      { speaker: "Announcer", text: "Rider to tech inspection." },
      { speaker: "Rival", text: "That bike has to be illegal." },
      { speaker: "Judge", text: "Checking tires.", check: 0 },
      { speaker: "Judge", text: "Suspiciously round..." },
      { speaker: "Judge", text: "Legal." },
      { speaker: "Judge", text: "Checking engine.", check: 1 },
      { speaker: "Judge", text: "Loud." },
      { speaker: "Judge", text: "Dramatic." },
      { speaker: "Judge", text: "Technically normal motocross behavior." },
      { speaker: "Judge", text: "Checking suspension.", check: 2 },
      { speaker: "Judge", text: "Still attached." },
      { speaker: "Judge", text: "Mostly." },
      { speaker: "Judge", text: "Checking secret dad horsepower.", check: 3 },
      { speaker: "Judge", text: "Off the charts." },
      { speaker: "Judge", text: "But technically legal." },
      { speaker: "Announcer", text: "Bike passes inspection." },
      { speaker: "Announcer", text: "Win stands.", done: true }
    ];
    let startedAt = performance.now();
    let finished = false;
    let lineIndex = 0;

    function resizeTechScene() {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(320, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resizeTechScene();
    window.addEventListener("resize", resizeTechScene);
    addCleanup(() => {
      window.removeEventListener("resize", resizeTechScene);
      renderer.dispose();
      renderer.domElement.remove();
    });

    function setTechLine(index) {
      const line = lines[index];
      speechBubble.classList.toggle("rival-bubble", line.speaker === "Rival");
      speechBubble.classList.toggle("announcer-bubble", line.speaker === "Announcer");
      speechBubble.innerHTML = `<span class="speaker">${line.speaker}</span>${line.text}`;
      if (Number.isInteger(line.check) && checks[line.check]) checks[line.check].classList.add("checked");
      if (line.done) {
        checks.forEach((item) => item.classList.add("checked"));
        button.disabled = false;
        button.textContent = "Win Stands";
        button.classList.remove("secondary");
        nextButton.disabled = true;
        nextButton.textContent = "Complete";
        finished = true;
      }
    }

    function advanceTechLine() {
      if (lineIndex < lines.length - 1) {
        lineIndex += 1;
        setTechLine(lineIndex);
      }
    }

    function tick(now) {
      const elapsed = (now - startedAt) / 1000;
      const judgeTargetX = elapsed < 2.7 ? 8.2 - elapsed * 2.15 : 2.35;
      judge.position.x += (judgeTargetX - judge.position.x) * 0.08;
      judge.position.y = Math.abs(Math.sin(now / 180)) * (finished ? 0.01 : 0.045);
      judge.rotation.y = -Math.PI * 0.55 + Math.sin(now / 700) * 0.08;
      bike.rotation.z = Math.sin(now / 360) * 0.018;
      rival.rotation.z = Math.sin(now / 500) * 0.012;
      camera.position.x = 8.5 + Math.sin(now / 1400) * 0.7;
      camera.lookAt(0, 1.25, -0.3);

      renderer.render(scene, camera);
      raceLoop = requestAnimationFrame(tick);
    }

    setTechLine(lineIndex);
    nextButton.addEventListener("click", advanceTechLine);
    button.addEventListener("click", () => renderMotoWin(true));
    raceLoop = requestAnimationFrame(tick);
  }

  function buildTechJudge3D(THREE) {
    const judge = new THREE.Group();
    const shirtMat = new THREE.MeshStandardMaterial({ color: "#fff7e1", roughness: 0.8 });
    const vestMat = new THREE.MeshStandardMaterial({ color: "#172c2d", roughness: 0.7 });
    const skinMat = new THREE.MeshStandardMaterial({ color: "#f3bd86", roughness: 0.72 });
    const boardMat = new THREE.MeshStandardMaterial({ color: "#d9b287", roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.45, 0.42), shirtMat);
    body.position.y = 1.45;
    body.castShadow = true;
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.92, 0.48), vestMat);
    vest.position.set(0, 1.56, -0.035);
    vest.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 12), skinMat);
    head.position.y = 2.45;
    head.castShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 0.56), vestMat);
    cap.position.y = 2.76;
    cap.castShadow = true;
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.92, 0.08), boardMat);
    board.position.set(-0.72, 1.55, -0.24);
    board.rotation.z = -0.18;
    board.castShadow = true;
    [-0.23, 0.23].forEach((x) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.24), vestMat);
      leg.position.set(x, 0.46, 0);
      leg.castShadow = true;
      judge.add(leg);
    });
    judge.add(body, vest, head, cap, board);
    return judge;
  }

  function addTechProps3D(THREE, scene) {
    const coneMat = new THREE.MeshStandardMaterial({ color: "#f76d57", roughness: 0.82 });
    const lightMat = new THREE.MeshStandardMaterial({ color: "#ffcf5a", emissive: "#7a4a00", emissiveIntensity: 0.45, roughness: 0.5 });
    [[-5.8, -4.4], [5.8, -4.4], [-5.8, 3.7], [5.8, 3.7]].forEach(([x, z]) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.9, 16), coneMat);
      cone.position.set(x, 0.48, z);
      cone.castShadow = true;
      scene.add(cone);
    });
    const arch = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.45, 0.32), lightMat);
    arch.position.set(0, 4.2, -5.3);
    arch.castShadow = true;
    scene.add(arch);
    [-4.9, 4.9].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 4.1, 0.32), lightMat);
      post.position.set(x, 2.05, -5.3);
      post.castShadow = true;
      scene.add(post);
    });
  }

  async function renderMotoPerfectLossScene3D() {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Photo Finish</h1>
          <p class="subtitle">Perfect tune. One cleaner line needed.</p>
        </div>
        <div class="race-wrap three-race tech-race">
          <div id="motoCloseLoss3dStage" class="moto-3d-stage tech-3d-stage" aria-label="3D motocross close finish"></div>
          <div class="speech-bubble announcer-bubble">
            <span class="speaker">Announcer</span>
            Replay shows it: rival is past the stripe while Dad is still short.
          </div>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          The tune is right, Pops. That was not a garage problem. That was a race-line problem.
        </div>
        <div class="button-row">
          <button class="btn" id="retryMotoPerfect">Retry Race</button>
          <button class="btn secondary" id="backMotoGarage">Back To Garage</button>
        </div>
      </section>
    `);

    document.querySelector("#retryMotoPerfect").addEventListener("click", () => startMotoRace({ ...motoTarget }, motoDevMode));
    document.querySelector("#backMotoGarage").addEventListener("click", () => renderMotoGarage());

    try {
      const THREE = await loadThree();
      startMotoPerfectLossScene3D(THREE);
    } catch {
      // The dialogue and buttons above are enough fallback if WebGL is unavailable.
    }
  }

  function startMotoPerfectLossScene3D(THREE) {
    const stage = document.querySelector("#motoCloseLoss3dStage");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#82d0e8");
    scene.fog = new THREE.Fog("#82d0e8", 34, 110);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight("#fff6d7", "#476b48", 1.35);
    const sun = new THREE.DirectionalLight("#fff7df", 2.2);
    sun.position.set(-12, 28, 18);
    sun.castShadow = true;
    scene.add(hemi, sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(72, 72),
      new THREE.MeshStandardMaterial({ color: "#4e8948", roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const track = new THREE.Mesh(
      new THREE.BoxGeometry(15, 0.18, 24),
      new THREE.MeshStandardMaterial({ color: "#a96f3f", roughness: 0.95 })
    );
    track.position.y = 0.05;
    track.receiveShadow = true;
    scene.add(track);

    const finishMat = new THREE.MeshStandardMaterial({ color: "#fff7e1", roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: "#172c2d", roughness: 0.8 });
    for (let x = -6; x <= 5; x += 2) {
      const tile = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 1.1), ((x / 2) % 2 === 0) ? finishMat : darkMat);
      tile.position.set(x, 0.22, -4.2);
      scene.add(tile);
    }

    const finishZ = -4.2;
    const finishBeam = new THREE.Mesh(
      new THREE.BoxGeometry(15.5, 2.9, 0.06),
      new THREE.MeshStandardMaterial({
        color: "#fff7e1",
        emissive: "#ffcf5a",
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.28,
        roughness: 0.5
      })
    );
    finishBeam.position.set(0, 1.65, finishZ);
    scene.add(finishBeam);
    const dad = buildMotoBike3D(THREE, "#f76d57", "DAD");
    dad.position.set(-1.55, 0.22, 2.45);
    dad.rotation.y = Math.PI;
    const rival = buildMotoBike3D(THREE, "#2e4057", "R");
    rival.position.set(1.55, 0.24, 2.25);
    rival.rotation.y = Math.PI;
    scene.add(dad, rival);

    const archMat = new THREE.MeshStandardMaterial({ color: "#ffcf5a", emissive: "#7a4a00", emissiveIntensity: 0.25, roughness: 0.6 });
    const arch = new THREE.Mesh(new THREE.BoxGeometry(14, 0.42, 0.34), archMat);
    arch.position.set(0, 4.3, -5.1);
    scene.add(arch);
    [-6.8, 6.8].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 4.2, 0.32), archMat);
      post.position.set(x, 2.15, -5.1);
      scene.add(post);
    });

    const dadShortMarker = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.08, 0.34),
      new THREE.MeshStandardMaterial({ color: "#f76d57", emissive: "#6a150d", emissiveIntensity: 0.18, roughness: 0.55 })
    );
    dadShortMarker.position.set(-1.55, 0.28, finishZ + 1.2);
    dadShortMarker.visible = false;
    scene.add(dadShortMarker);
    const rivalWinMarker = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.08, 0.34),
      new THREE.MeshStandardMaterial({ color: "#63e7ff", emissive: "#168dc2", emissiveIntensity: 0.25, roughness: 0.45 })
    );
    rivalWinMarker.position.set(1.55, 0.3, finishZ - 1.28);
    rivalWinMarker.visible = false;
    scene.add(rivalWinMarker);

    camera.position.set(10.6, 5.65, 0.2);
    camera.lookAt(0, 1.25, finishZ);

    function resizeScene() {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(320, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resizeScene();
    window.addEventListener("resize", resizeScene);
    addCleanup(() => {
      window.removeEventListener("resize", resizeScene);
      renderer.dispose();
      renderer.domElement.remove();
    });

    const startedAt = performance.now();
    function tick(now) {
      const replay = clamp((now - startedAt) / 3400, 0, 1);
      const travel = 1 - Math.pow(1 - clamp(replay / 0.82, 0, 1), 3);
      dad.position.z = 2.45 + (-2.62 - 2.45) * travel;
      rival.position.z = 2.25 + (-5.62 - 2.25) * travel;
      dadShortMarker.visible = replay > 0.78;
      rivalWinMarker.visible = replay > 0.78;
      dad.rotation.z = Math.sin(now / 340) * 0.02;
      rival.rotation.z = Math.sin(now / 360) * 0.015;
      camera.position.x = 10.6 + Math.sin(now / 1600) * 0.22;
      camera.position.z = 0.2 - replay * 0.42;
      camera.lookAt(0, 1.25, finishZ - 0.15);
      renderer.render(scene, camera);
      raceLoop = requestAnimationFrame(tick);
    }

    raceLoop = requestAnimationFrame(tick);
  }

  function renderMotoTechScene() {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Tech Check</h1>
          <p class="subtitle">Perfect Tune Bonus Unlocked</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Announcer</span>
          Hold up! Rider has been called to tech inspection.
          <br><br>
          <span class="speaker">Rival</span>
          That bike has to be illegal.
          <br><br>
          <span class="speaker">Judge</span>
          Checking tires... suspiciously round.
          <br><br>
          Checking engine... loud, dramatic, emotionally unavailable. Standard motocross behavior.
          <br><br>
          Checking suspension... still attached. Mostly.
          <br><br>
          Checking secret dad horsepower... off the charts, but technically legal.
          <br><br>
          Bike passes inspection. Win stands.
        </div>
        <button class="btn" id="continueWin">Continue</button>
      </section>
    `);
    document.querySelector("#continueWin").addEventListener("click", () => renderMotoWin(true));
  }

  function renderMotoWin(perfect) {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Gearheart</h1>
          <p class="subtitle">${perfect ? "Perfect tune. Legal bike. Hurt feelings." : "Race won. Rival humbled. Bike mostly intact."}</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          Alright, I'll admit it. That was actually pretty sick.
          <br><br>
          Not perfect. I saw at least three things I could make fun of. But still sick.
          <br><br>
          Motocross is loud, messy, expensive, dangerous, and somehow still worth it. Kind of like raising kids.
          <br><br>
          You taught me that crashing doesn't mean you're done. It means you figure out what went wrong, get back up, and try again.
          <br><br>
          And if something explodes... well. You probably tuned it wrong.
          <br><br>
          But seriously, Pops. A lot of who I am comes from watching you keep going.
          <br><br>
          Even when things were hard. Even when nobody made it easy. Even when the track was absolute garbage.
          <br><br>
          So yeah. You earned this one.
        </div>
        <button class="btn" id="hubAfterMoto">Gearheart Token Earned</button>
      </section>
    `);
    document.querySelector("#hubAfterMoto").addEventListener("click", () => renderHub("Gearheart Token earned."));
  }

  function drawTrack(canvas, labels = false) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#739b66";
    ctx.fillRect(0, 0, w, h);
    drawPath(ctx, w, h, 118, "#4f382c");
    drawPath(ctx, w, h, 86, "#b77d48");
    drawPath(ctx, w, h, 5, "rgba(255,247,225,0.7)");
    const sections = [
      ["Start Gate", 0.02],
      ["Mud Pit", 0.16],
      ["Rhythm Bumps", 0.34],
      ["Steep Climb", 0.50],
      ["Big Ramp", 0.61],
      ["Final Straight", 0.78]
    ];
    sections.forEach(([label, p]) => {
      const point = trackPoint(p, w, h);
      ctx.fillStyle = "#172c2d";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
      ctx.fill();
      if (labels) {
        ctx.fillStyle = "#fff7e1";
        ctx.font = "bold 24px Georgia";
        ctx.fillText(label, point.x + 16, point.y - 14);
      }
    });
  }

  function drawPath(ctx, w, h, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i <= 180; i += 1) {
      const point = trackPoint(i / 180, w, h);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  function drawMotoRace(ctx, canvas, player, rival) {
    drawChaseTrack(ctx, canvas, player);
    drawChaseRival(ctx, canvas, player, rival);
    drawSpeedEffects(ctx, canvas, player);
    drawChaseBike(ctx, canvas, player);
    drawMotoRaceOverlay(ctx, canvas, player, rival);
  }

  function drawChaseTrack(ctx, canvas, player) {
    const w = canvas.width;
    const h = canvas.height;
    const section = motoSection(player.p);
    const heatTint = Math.min(0.32, player.heat / 360);
    ctx.clearRect(0, 0, w, h);
    drawMotoBackdrop(ctx, w, h, player);
    drawDistantHills(ctx, w, h);
    drawChaseRoad(ctx, w, h, player, section);
    drawProjectedTrackFeatures(ctx, w, h, player);
    drawTracksideScenery(ctx, w, h, player, section);
    if (heatTint > 0) {
      ctx.fillStyle = `rgba(247, 109, 87, ${heatTint})`;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.fillStyle = "rgba(16, 34, 37, 0.82)";
    ctx.beginPath();
    ctx.roundRect(22, 22, 278, 58, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 247, 225, 0.42)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#fff7e1";
    ctx.font = "bold 24px Georgia";
    ctx.fillText("Garage Track", 42, 59);
  }

  function drawMotoBackdrop(ctx, w, h, player) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0, "#5bbbe5");
    sky.addColorStop(0.58, "#bcecff");
    sky.addColorStop(0.86, "#ffe2a4");
    sky.addColorStop(1, "#cfa35d");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    drawMotoClouds(ctx, w, h, player);
    ctx.fillStyle = "#4c8a4c";
    ctx.fillRect(0, h * 0.45, w, h * 0.55);
    const grass = ctx.createLinearGradient(0, h * 0.45, 0, h);
    grass.addColorStop(0, "#6ab35e");
    grass.addColorStop(0.58, "#3f7b43");
    grass.addColorStop(1, "#2d5b35");
    ctx.fillStyle = grass;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);
  }

  function drawMotoClouds(ctx, w, h, player) {
    for (let i = 0; i < 5; i += 1) {
      const x = ((seededRandom(i + 401) * w + player.p * 420 * (i % 2 === 0 ? -1 : 1)) % (w + 240)) - 120;
      const y = h * (0.08 + seededRandom(i + 412) * 0.22);
      const scale = 0.7 + seededRandom(i + 423) * 0.8;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
      ctx.beginPath();
      ctx.arc(-42, 8, 24, 0, Math.PI * 2);
      ctx.arc(-14, -2, 34, 0, Math.PI * 2);
      ctx.arc(26, 7, 28, 0, Math.PI * 2);
      ctx.arc(54, 14, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawDistantHills(ctx, w, h) {
    const hill = ctx.createLinearGradient(0, h * 0.32, 0, h * 0.55);
    hill.addColorStop(0, "#5d8f64");
    hill.addColorStop(1, "#2f604b");
    ctx.fillStyle = hill;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.46);
    for (let x = 0; x <= w; x += 80) {
      ctx.lineTo(x, h * 0.40 + Math.sin(x * 0.015) * 26);
    }
    ctx.lineTo(w, h * 0.55);
    ctx.lineTo(0, h * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  function drawChaseRoad(ctx, w, h, player, section) {
    const horizon = h * 0.42;
    const roadBottom = h + 40;
    const curve = Math.sin(player.p * Math.PI * 4) * 46;
    const roadColor = section === "mud" ? "#654331" : section === "straight" ? "#c48a4f" : "#a76b3f";
    for (let i = 22; i >= 0; i -= 1) {
      const near = i / 22;
      const far = (i - 1) / 22;
      const farClamped = Math.max(0, far);
      const pNear = player.p + (1 - clamp(near, 0, 1)) * MOTO_VIEW_DISTANCE;
      const pFar = player.p + (1 - clamp(farClamped, 0, 1)) * MOTO_VIEW_DISTANCE;
      const y1 = horizon + (roadBottom - horizon) * near * near - motoTrackElevation(pNear) * (18 + near * 34);
      const y2 = horizon + (roadBottom - horizon) * farClamped * farClamped - motoTrackElevation(pFar) * (18 + farClamped * 34);
      const width1 = 86 + near * near * 848;
      const width2 = 86 + farClamped * farClamped * 848;
      const center1 = w / 2 + curve * (1 - near) - player.lane * 70 * near;
      const center2 = w / 2 + curve * (1 - farClamped) - player.lane * 70 * farClamped;
      const stripe = Math.floor((player.p * 80 + i) % 2);
      const edgeColor = stripe ? "#fff7e1" : "#d74332";
      const strip = {
        pNear,
        pFar,
        near,
        far: farClamped,
        y1,
        y2,
        width1,
        width2,
        center1,
        center2,
        points: [
          { x: center1 - width1 / 2, y: y1 },
          { x: center1 + width1 / 2, y: y1 },
          { x: center2 + width2 / 2, y: y2 },
          { x: center2 - width2 / 2, y: y2 }
        ]
      };
      drawNativeRoadStrip(ctx, strip, roadColor, i);
      ctx.strokeStyle = "rgba(255, 247, 225, 0.32)";
      ctx.lineWidth = 3;
      strokeProjectedQuad(ctx, strip.points);
      drawRoadEdge(ctx, center1, center2, width1, width2, y1, y2, -1, edgeColor);
      drawRoadEdge(ctx, center1, center2, width1, width2, y1, y2, 1, edgeColor);
      if (i % 4 === 0) drawRoadCenterMarker(ctx, center1, center2, y1, y2, near);
    }
  }

  function drawNativeRoadStrip(ctx, strip, roadColor, index) {
    const base = roadSurfaceAt((strip.pNear + strip.pFar) / 2, roadColor, index);
    ctx.fillStyle = base;
    fillProjectedQuad(ctx, strip.points);
    drawRoadRuts(ctx, strip, index);
    drawEmbeddedFeatureSurfaces(ctx, strip);
  }

  function roadSurfaceAt(p, roadColor, index) {
    const feature = motoTrackFeatures.find((item) => item.start <= p && item.end >= p && item.type !== "mud");
    if (feature?.type === "hill") return index % 2 === 0 ? "#9b6138" : "#8a5333";
    if (feature?.type === "ramp") return index % 2 === 0 ? "#bf8145" : "#a66b3e";
    if (feature?.type === "bump") return index % 2 === 0 ? "#c5965c" : "#9d643b";
    return index % 2 === 0 ? roadColor : shadeDirt(roadColor);
  }

  function drawEmbeddedFeatureSurfaces(ctx, strip) {
    motoTrackFeatures
      .filter((feature) => feature.end >= strip.pNear && feature.start <= strip.pFar)
      .forEach((feature) => {
        if (feature.type === "mud") drawEmbeddedMud(ctx, strip, feature);
        if (feature.type === "bump") drawEmbeddedBump(ctx, strip, feature);
        if (feature.type === "hill") drawEmbeddedHill(ctx, strip, feature);
        if (feature.type === "ramp") drawEmbeddedRamp(ctx, strip, feature);
      });
  }

  function drawEmbeddedMud(ctx, strip, feature) {
    const lane = featureLaneQuad(strip, feature);
    ctx.save();
    fillProjectedQuad(ctx, lane);
    ctx.clip();
    const mud = ctx.createLinearGradient(0, strip.y2, 0, strip.y1);
    mud.addColorStop(0, "#3b261f");
    mud.addColorStop(0.58, "#654331");
    mud.addColorStop(1, "#2c1d18");
    ctx.fillStyle = mud;
    ctx.fillRect(
      Math.min(...lane.map((point) => point.x)),
      Math.min(strip.y1, strip.y2) - 4,
      Math.max(...lane.map((point) => point.x)) - Math.min(...lane.map((point) => point.x)),
      Math.abs(strip.y2 - strip.y1) + 8
    );
    ctx.fillStyle = "rgba(255, 247, 225, 0.13)";
    const centerX = (lane[0].x + lane[1].x + lane[2].x + lane[3].x) / 4;
    const centerY = (lane[0].y + lane[1].y + lane[2].y + lane[3].y) / 4;
    const size = Math.max(8, Math.abs(lane[1].x - lane[0].x) * 0.16);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size * 1.8, size * 0.36, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawEmbeddedBump(ctx, strip, feature) {
    const lane = featureLaneQuad(strip, feature);
    const grad = ctx.createLinearGradient(0, strip.y2, 0, strip.y1);
    grad.addColorStop(0, "rgba(63, 36, 23, 0.5)");
    grad.addColorStop(0.44, "rgba(255, 222, 144, 0.84)");
    grad.addColorStop(1, "rgba(255, 247, 225, 0.22)");
    ctx.fillStyle = grad;
    fillProjectedQuad(ctx, lane);
  }

  function drawEmbeddedHill(ctx, strip, feature) {
    const lane = featureLaneQuad(strip, feature);
    const grad = ctx.createLinearGradient(0, strip.y2, 0, strip.y1);
    grad.addColorStop(0, "rgba(54, 31, 22, 0.22)");
    grad.addColorStop(1, "rgba(255, 247, 225, 0.18)");
    ctx.fillStyle = grad;
    fillProjectedQuad(ctx, lane);
  }

  function drawEmbeddedRamp(ctx, strip, feature) {
    const lane = featureLaneQuad(strip, feature);
    const ramp = ctx.createLinearGradient(0, strip.y2, 0, strip.y1);
    ramp.addColorStop(0, "#6f4a31");
    ramp.addColorStop(0.42, "#bf8145");
    ramp.addColorStop(1, "#f4d078");
    ctx.fillStyle = ramp;
    fillProjectedQuad(ctx, lane);
    ctx.strokeStyle = "rgba(255, 247, 225, 0.22)";
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i += 1) {
      const t = i / 4;
      const top = pointAlong(lane[0], lane[1], t);
      const bottom = pointAlong(lane[3], lane[2], t);
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(bottom.x, bottom.y);
      ctx.stroke();
    }
    const stripe = Math.floor(strip.pNear * 170) % 2 === 0 ? "rgba(215, 67, 50, 0.72)" : "rgba(255, 247, 225, 0.62)";
    ctx.fillStyle = stripe;
    const inner = [
      pointAlong(lane[0], lane[1], 0.38),
      pointAlong(lane[0], lane[1], 0.62),
      pointAlong(lane[3], lane[2], 0.62),
      pointAlong(lane[3], lane[2], 0.38)
    ];
    fillProjectedQuad(ctx, inner);
  }

  function drawRoadRuts(ctx, strip, index) {
    if (index % 2 !== 0) return;
    ctx.save();
    ctx.strokeStyle = "rgba(58, 38, 31, 0.26)";
    ctx.lineWidth = 2 + strip.near * 3;
    [-0.22, 0.22].forEach((lane) => {
      const x1 = strip.center1 + lane * strip.width1;
      const x2 = strip.center2 + lane * strip.width2;
      ctx.beginPath();
      ctx.moveTo(x1, strip.y1);
      ctx.lineTo(x2, strip.y2);
      ctx.stroke();
    });
    ctx.fillStyle = "rgba(255, 247, 225, 0.08)";
    const dotX = strip.center1 + Math.sin(strip.pNear * 220) * strip.width1 * 0.22;
    const dotY = (strip.y1 + strip.y2) / 2;
    ctx.beginPath();
    ctx.ellipse(dotX, dotY, 3 + strip.near * 9, 1 + strip.near * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function featureLaneQuad(strip, feature) {
    const nearHalf = strip.width1 * feature.width * 0.5;
    const farHalf = strip.width2 * feature.width * 0.5;
    const nearCenter = strip.center1 + feature.lane * strip.width1 * 0.32;
    const farCenter = strip.center2 + feature.lane * strip.width2 * 0.32;
    return [
      { x: nearCenter - nearHalf, y: strip.y1 },
      { x: nearCenter + nearHalf, y: strip.y1 },
      { x: farCenter + farHalf, y: strip.y2 },
      { x: farCenter - farHalf, y: strip.y2 }
    ];
  }

  function drawRoadEdge(ctx, center1, center2, width1, width2, y1, y2, side, color) {
    const edge1 = center1 + side * width1 / 2;
    const edge2 = center2 + side * width2 / 2;
    const inner1 = edge1 - side * Math.max(10, width1 * 0.035);
    const inner2 = edge2 - side * Math.max(10, width2 * 0.035);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(edge1, y1);
    ctx.lineTo(inner1, y1);
    ctx.lineTo(inner2, y2);
    ctx.lineTo(edge2, y2);
    ctx.closePath();
    ctx.fill();
  }

  function drawRoadCenterMarker(ctx, center1, center2, y1, y2, near) {
    const width = 8 + near * 30;
    ctx.fillStyle = "rgba(255, 247, 225, 0.54)";
    ctx.beginPath();
    ctx.moveTo(center1 - width, y1);
    ctx.lineTo(center1 + width, y1);
    ctx.lineTo(center2 + width * 0.45, y2);
    ctx.lineTo(center2 - width * 0.45, y2);
    ctx.closePath();
    ctx.fill();
  }

  function drawTracksideScenery(ctx, w, h, player, section) {
    const horizon = h * 0.42;
    const roadBottom = h + 40;
    const curve = Math.sin(player.p * Math.PI * 4) * 46;
    const scroll = player.p * 9.5;
    for (let i = 0; i < 28; i += 1) {
      const travel = scroll + i / 28;
      const row = Math.floor(travel);
      const depth = travel - row;
      if (depth < 0.03) continue;
      const seed = row * 101 + i;
      const eased = depth * depth;
      const y = horizon + (roadBottom - horizon) * eased;
      const roadWidth = 90 + eased * 820;
      const center = w / 2 + curve * (1 - depth) - player.lane * 70 * depth;
      const side = seededRandom(seed + 17) > 0.5 ? 1 : -1;
      const stagger = seededRandom(seed + 43);
      const shoulder = 34 + depth * 142 + stagger * 76;
      const x = center + side * (roadWidth / 2 + shoulder);
      const scale = 0.22 + depth * 1.28;
      const kindRoll = seededRandom(seed + 71);
      const colorRoll = seededRandom(seed + 91);

      if (x < -120 || x > w + 120) continue;
      if (kindRoll < 0.42) drawTracksideTree(ctx, x, y, scale, colorRoll);
      else if (kindRoll < 0.64) drawFencePost(ctx, x, y, scale, side);
      else if (kindRoll < 0.8) drawHayBale(ctx, x, y, scale);
      else drawTracksideSign(ctx, x, y, scale, section, side);
    }
    drawNearGrass(ctx, w, h, player);
  }

  function drawTracksideTree(ctx, x, y, scale, colorRoll) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#5b3f2d";
    ctx.fillRect(-7, -58, 14, 60);
    ctx.fillStyle = colorRoll > 0.58 ? "#315f46" : "#3f7a50";
    ctx.beginPath();
    ctx.moveTo(0, -132);
    ctx.lineTo(-46, -42);
    ctx.lineTo(46, -42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(16, 34, 37, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 2, 38, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawFencePost(ctx, x, y, scale, side) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#6d4a32";
    ctx.fillRect(-7, -54, 14, 56);
    ctx.strokeStyle = "rgba(255, 247, 225, 0.7)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(side * -8, -38);
    ctx.lineTo(side * -58, -28);
    ctx.moveTo(side * -8, -20);
    ctx.lineTo(side * -58, -10);
    ctx.stroke();
    ctx.restore();
  }

  function drawHayBale(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#d7a84f";
    ctx.strokeStyle = "#8b6234";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-32, -28, 64, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 247, 225, 0.55)";
    ctx.lineWidth = 3;
    for (let xLine = -18; xLine <= 18; xLine += 18) {
      ctx.beginPath();
      ctx.moveTo(xLine, -26);
      ctx.lineTo(xLine - 8, 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTracksideSign(ctx, x, y, scale, section, side) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#6d4a32";
    ctx.fillRect(-4, -58, 8, 60);
    ctx.fillStyle = "#fff7e1";
    ctx.strokeStyle = "#172c2d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(side > 0 ? -74 : 0, -86, 74, 38, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#172c2d";
    ctx.font = "bold 15px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(section === "straight" ? "GO" : "MX", side > 0 ? -37 : 37, -62);
    ctx.restore();
  }

  function drawNearGrass(ctx, w, h, player) {
    const sway = player.p * 38;
    ctx.strokeStyle = "rgba(255, 247, 225, 0.36)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 34; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side < 0 ? 26 + seededRandom(i + 5) * 170 : w - 26 - seededRandom(i + 9) * 170;
      const y = h - ((i * 31 + sway * 23) % 190);
      const height = 14 + seededRandom(i + 12) * 26;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + side * (8 + seededRandom(i + 15) * 16), y - height);
      ctx.stroke();
    }
  }

  function seededRandom(seed) {
    const value = Math.sin(seed * 999.91) * 10000;
    return value - Math.floor(value);
  }

  function shadeDirt(color) {
    return ({
      "#654331": "#5a382b",
      "#c48a4f": "#b97d44",
      "#a76b3f": "#965c36"
    })[color] || color;
  }

  function drawProjectedTrackFeatures(ctx, w, h, player) {
    motoTrackFeatures
      .filter((feature) => feature.end >= player.p - 0.035 && feature.start <= player.p + MOTO_VIEW_DISTANCE)
      .sort((a, b) => b.start - a.start)
      .forEach((feature) => {
        if (feature.type === "mud") drawProjectedMudDetail(ctx, w, h, player, feature);
        if (feature.type === "bump") drawProjectedBumpCrest(ctx, w, h, player, feature);
        if (feature.type === "ramp") drawProjectedRampLip(ctx, w, h, player, feature);
      });
  }

  function projectedFeatureQuad(w, h, player, feature) {
    const nearP = clamp(feature.start, player.p - 0.035, player.p + MOTO_VIEW_DISTANCE);
    const farP = clamp(feature.end, player.p - 0.035, player.p + MOTO_VIEW_DISTANCE);
    const near = projectMotoDepth(w, h, player, progressToMotoDepth(player, nearP));
    const far = projectMotoDepth(w, h, player, progressToMotoDepth(player, farP));
    const nearWidth = near.width * feature.width;
    const farWidth = far.width * feature.width;
    const laneNear = near.center + feature.lane * near.width * 0.32;
    const laneFar = far.center + feature.lane * far.width * 0.32;
    return {
      near,
      far,
      points: [
        { x: laneNear - nearWidth / 2, y: near.y },
        { x: laneNear + nearWidth / 2, y: near.y },
        { x: laneFar + farWidth / 2, y: far.y },
        { x: laneFar - farWidth / 2, y: far.y }
      ]
    };
  }

  function progressToMotoDepth(player, p) {
    return clamp(1 - (p - player.p) / MOTO_VIEW_DISTANCE, 0.035, 1.12);
  }

  function projectMotoDepth(w, h, player, depth) {
    const air = clamp(player.airborne / 1.05, 0, 1);
    const horizon = h * (0.42 - air * 0.055);
    const roadBottom = h + 40 + air * 68;
    const eased = depth * depth;
    const curve = Math.sin(player.p * Math.PI * 4) * 46;
    const width = 86 + eased * 848;
    const pAtDepth = player.p + (1 - clamp(depth, 0, 1)) * MOTO_VIEW_DISTANCE;
    const elevation = motoTrackElevation(pAtDepth) * (18 + depth * 34);
    return {
      y: horizon + (roadBottom - horizon) * eased - elevation,
      width,
      center: w / 2 + curve * (1 - depth) - player.lane * 70 * depth
    };
  }

  function motoTrackElevation(p) {
    if (p >= 0.43 && p < MOTO_RAMP_START) {
      return Math.sin(((p - 0.43) / (MOTO_RAMP_START - 0.43)) * Math.PI) * 0.7;
    }
    if (p >= MOTO_RAMP_START && p < MOTO_RAMP_TAKEOFF) {
      return ((p - MOTO_RAMP_START) / (MOTO_RAMP_TAKEOFF - MOTO_RAMP_START)) * 1.2;
    }
    if (p >= MOTO_RAMP_TAKEOFF && p < MOTO_RAMP_END) {
      return 1.2 - ((p - MOTO_RAMP_TAKEOFF) / (MOTO_RAMP_END - MOTO_RAMP_TAKEOFF)) * 0.45;
    }
    return 0;
  }

  function drawProjectedMudDetail(ctx, w, h, player, feature) {
    const quad = projectedFeatureQuad(w, h, player, feature);
    ctx.save();
    fillProjectedQuad(ctx, quad.points);
    ctx.clip();
    ctx.fillStyle = "rgba(255, 247, 225, 0.12)";
    for (let i = 0; i < 5; i += 1) {
      const t = i / 4;
      const x = lerp(quad.points[3].x, quad.points[1].x, 0.18 + t * 0.16);
      const y = lerp(quad.far.y, quad.near.y, 0.24 + t * 0.13);
      ctx.beginPath();
      ctx.ellipse(x, y, 24 + t * 38, 5 + t * 10, -0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawProjectedBumpCrest(ctx, w, h, player, feature) {
    const quad = projectedFeatureQuad(w, h, player, feature);
    ctx.strokeStyle = "rgba(255, 247, 225, 0.58)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(quad.points[0].x, quad.points[0].y);
    ctx.lineTo(quad.points[1].x, quad.points[1].y);
    ctx.stroke();
  }

  function drawProjectedRampLip(ctx, w, h, player, feature) {
    const quad = projectedFeatureQuad(w, h, player, feature);
    ctx.strokeStyle = "#fff7e1";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(quad.points[2].x, quad.points[2].y);
    ctx.lineTo(quad.points[3].x, quad.points[3].y);
    ctx.stroke();
    if (player.p > MOTO_RAMP_START - 0.02 && player.p < MOTO_RAMP_END + 0.03) {
      ctx.fillStyle = "rgba(255, 207, 90, 0.28)";
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.36, 58, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function fillProjectedQuad(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();
  }

  function strokeProjectedQuad(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.stroke();
  }

  function pointAlong(a, b, t) {
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t)
    };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function drawChaseRival(ctx, canvas, player, rival) {
    const rawGap = rival.p - player.p;
    const gap = clamp(rawGap, -0.09, 0.18);
    if (rawGap < -0.06) {
      ctx.fillStyle = "rgba(255, 247, 225, 0.82)";
      ctx.font = "bold 24px Georgia";
      ctx.fillText("Rival behind", canvas.width - 180, 58);
      return;
    }
    const depth = clamp(1 - gap / 0.18, 0.22, 1);
    const x = canvas.width / 2 + 90 * Math.sin((player.p + gap) * Math.PI * 6) - player.lane * 80 * depth;
    const y = canvas.height * (0.47 + depth * 0.24);
    drawSimpleRider(ctx, x, y, depth * 0.9, "#2e4057", "R");
  }

  function drawSpeedEffects(ctx, canvas, player) {
    const w = canvas.width;
    const h = canvas.height;
    const intensity = clamp(player.speed / 0.026, 0, 1);
    if (intensity <= 0.08 && player.boost <= 0) return;
    ctx.save();
    ctx.strokeStyle = player.boost > 0 ? "rgba(255, 207, 90, 0.48)" : "rgba(255, 247, 225, 0.32)";
    ctx.lineWidth = 2 + intensity * 5;
    for (let i = 0; i < 18; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side < 0 ? 30 + seededRandom(i + 211) * 220 : w - 30 - seededRandom(i + 221) * 220;
      const y = h * 0.48 + ((i * 47 + player.p * 1600) % (h * 0.52));
      const len = 28 + intensity * 70 + seededRandom(i + 231) * 32;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - side * len, y + len * 0.72);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawChaseBike(ctx, canvas, player) {
    const x = canvas.width / 2 + player.lane * 260;
    const lift = motoBikeLift(player);
    const y = canvas.height - 102 - lift;
    const wobble = Math.sin(performance.now() / 90) * (player.airborne > 0 ? 4 : 1.6);
    drawBikeShadow(ctx, x, canvas.height - 54, player.airborne);
    drawDustTrail(ctx, x, y, player);
    drawSimpleRider(ctx, x + wobble, y, 1.35, "#f76d57", "DAD");
    if (player.boost > 0) {
      const boost = ctx.createRadialGradient(x, y + 58, 18, x, y + 66, 116);
      boost.addColorStop(0, "rgba(255, 247, 225, 0.74)");
      boost.addColorStop(0.38, "rgba(255, 207, 90, 0.54)");
      boost.addColorStop(1, "rgba(247, 109, 87, 0)");
      ctx.fillStyle = boost;
      ctx.beginPath();
      ctx.moveTo(x - 84, y + 36);
      ctx.lineTo(x + 84, y + 36);
      ctx.lineTo(x, y + 150);
      ctx.closePath();
      ctx.fill();
    }
  }

  function motoBikeLift(player) {
    if (player.airborne > 0) {
      const airT = 1 - clamp(player.airborne / 1.05, 0, 1);
      return 42 + Math.sin(airT * Math.PI) * 62;
    }
    if (player.p >= MOTO_RAMP_START && player.p < MOTO_RAMP_TAKEOFF) {
      const rampT = (player.p - MOTO_RAMP_START) / (MOTO_RAMP_TAKEOFF - MOTO_RAMP_START);
      return rampT * 38;
    }
    return 0;
  }

  function drawBikeShadow(ctx, x, y, airborne) {
    ctx.save();
    ctx.fillStyle = `rgba(16, 34, 37, ${airborne > 0 ? 0.18 : 0.34})`;
    ctx.beginPath();
    ctx.ellipse(x, y, airborne > 0 ? 74 : 104, airborne > 0 ? 14 : 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDustTrail(ctx, x, y, player) {
    const intensity = clamp(player.speed / 0.026, 0, 1);
    ctx.save();
    for (let i = 0; i < 8; i += 1) {
      const puff = seededRandom(i + Math.floor(player.p * 120));
      ctx.fillStyle = `rgba(255, 226, 164, ${0.08 + intensity * 0.14})`;
      ctx.beginPath();
      ctx.arc(x - 78 + i * 22, y + 76 + puff * 20, 12 + puff * 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawMotoRaceOverlay(ctx, canvas, player, rival) {
    const w = canvas.width;
    const h = canvas.height;
    const barX = 34;
    const barY = h - 96;
    const barW = w - 68;
    ctx.save();
    ctx.fillStyle = "rgba(16, 34, 37, 0.7)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 16, 8);
    ctx.fill();
    ctx.fillStyle = "#fff7e1";
    ctx.fillRect(barX + 8, barY + 6, barW - 16, 4);
    drawProgressMarker(ctx, barX, barY, barW, player.p, "#f76d57", "D");
    drawProgressMarker(ctx, barX, barY, barW, rival.p, "#5bbbe5", "R");
    drawRaceMeter(ctx, 34, h - 166, 190, "ENGINE TEMP", player.heatLocked ? 0 : player.heat / 100, player.heatLocked ? "LOCKED" : `${Math.round(player.heat)}%`, "#f76d57");
    drawRaceMeter(ctx, w - 224, h - 166, 190, "SPEED", clamp(player.speed / 0.026, 0, 1), "", "#ffcf5a");
    ctx.restore();
  }

  function drawRaceMeter(ctx, x, y, width, label, amount, value, color) {
    ctx.fillStyle = "rgba(16, 34, 37, 0.76)";
    ctx.beginPath();
    ctx.roundRect(x, y, width, 58, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 247, 225, 0.34)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff7e1";
    ctx.font = "bold 14px Georgia";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(label, x + 16, y + 22);
    if (value) {
      ctx.textAlign = "right";
      ctx.fillText(value, x + width - 16, y + 22);
    }
    ctx.fillStyle = "rgba(255, 247, 225, 0.22)";
    ctx.fillRect(x + 16, y + 36, width - 32, 10);
    ctx.fillStyle = color;
    ctx.fillRect(x + 16, y + 36, clamp(amount, 0, 1) * (width - 32), 10);
    ctx.strokeStyle = "rgba(255, 247, 225, 0.56)";
    ctx.strokeRect(x + 16, y + 36, width - 32, 10);
  }

  function drawProgressMarker(ctx, x, y, width, p, color, label) {
    const markerX = x + 8 + clamp(p, 0, 1) * (width - 16);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(markerX, y + 8, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff7e1";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#172c2d";
    ctx.font = "bold 11px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, markerX, y + 8);
  }

  function drawSimpleRider(ctx, x, y, scale, color, label) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(16, 34, 37, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 34, 54, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#172c2d";
    ctx.lineWidth = 4;
    const body = ctx.createLinearGradient(-34, -18, 34, 24);
    body.addColorStop(0, "#fff7e1");
    body.addColorStop(0.18, color);
    body.addColorStop(1, shadeBike(color));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(-42, -16, 84, 40, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2f3b42";
    ctx.beginPath();
    ctx.moveTo(-8, -18);
    ctx.lineTo(20, -18);
    ctx.lineTo(36, 4);
    ctx.lineTo(2, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#172c2d";
    ctx.beginPath();
    ctx.arc(-34, 28, 17, 0, Math.PI * 2);
    ctx.arc(34, 28, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff7e1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-34, 28, 8, 0, Math.PI * 2);
    ctx.arc(34, 28, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#f3bd86";
    ctx.beginPath();
    ctx.arc(2, -36, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#324550";
    ctx.beginPath();
    ctx.roundRect(-20, -54, 44, 22, 9);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 247, 225, 0.72)";
    ctx.fillRect(-12, -45, 28, 7);
    ctx.fillStyle = "#fff7e1";
    ctx.font = "bold 15px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 8);
    ctx.restore();
  }

  function shadeBike(color) {
    return ({
      "#f76d57": "#b7382c",
      "#2e4057": "#172c2d"
    })[color] || color;
  }

  function trackPoint(p, w, h) {
    const a = -Math.PI / 2 + p * Math.PI * 2;
    const rx = w * 0.34 + Math.sin(a * 2) * 34;
    const ry = h * 0.28 + Math.cos(a * 3) * 18;
    return {
      x: w / 2 + Math.cos(a) * rx,
      y: h / 2 + Math.sin(a) * ry
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  async function renderCreatureMap(message = "") {
    const caught = state.creature.caught;
    const allCaught = creatures.every((creature) => caught.includes(creature.id));
    render(`
      <section class="screen game-screen">
        <div class="hero-card">
          <h1 class="title">Creature League</h1>
          <p class="subtitle">Catch Dad's Legendary Six, then enter the tournament.</p>
        </div>
        ${threeGameplayPanel("creatures", {
          caught,
          speaker: "Creature League",
          caption: caught.length ? `${caught.length} teammate${caught.length === 1 ? "" : "s"} caught and traveling with Dad.` : "Dad starts alone. Find the creatures before they join the team."
        })}
        ${message ? `<div class="dialogue">${message}</div>` : ""}
        <div class="creature-map mini-creature-map">
          <div class="map-stage" id="mapStage">
            <div class="map-dad" style="left:${state.creature.dadX}%;top:${state.creature.dadY}%;">Dad</div>
            ${creatures.map((creature) => `
              <button class="map-creature ${caught.includes(creature.id) ? "caught" : ""}" data-creature="${creature.id}" style="left:${creature.x}%;top:${creature.y}%;background:${creature.color};">
                ${caught.includes(creature.id) ? creature.name.slice(0, 2) : "?"}
              </button>
            `).join("")}
          </div>
        </div>
        <div class="map-controls">
          <button class="btn secondary blank">.</button>
          <button class="btn secondary" data-move="up">Up</button>
          <button class="btn secondary blank">.</button>
          <button class="btn secondary" data-move="left">Left</button>
          <button class="btn secondary" data-move="down">Down</button>
          <button class="btn secondary" data-move="right">Right</button>
        </div>
        <div class="panel">
          <h2>Dad's Legendary Six</h2>
          <div class="creature-grid">
            ${creatures.map((creature) => `
              <div class="creature-card ${caught.includes(creature.id) ? "caught" : ""}">
                <strong>${creature.name}</strong>
                <p>${creature.area}</p>
                <small>${creature.role}</small>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="button-row">
          <button class="btn" id="enterTournament" ${allCaught ? "" : "disabled"}>${allCaught ? "Enter Tournament" : `${caught.length}/6 Caught`}</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);

    document.querySelectorAll("[data-move]").forEach((button) => {
      button.addEventListener("click", () => moveDad(button.dataset.move));
    });
    const mapKeys = (event) => {
      const key = event.key.toLowerCase();
      const direction = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right"
      }[key];
      if (!direction) return;
      event.preventDefault();
      moveDad(direction);
    };
    window.addEventListener("keydown", mapKeys);
    addCleanup(() => window.removeEventListener("keydown", mapKeys));
    document.querySelectorAll("[data-creature]").forEach((button) => {
      button.addEventListener("click", () => {
        const creature = creatures.find((item) => item.id === button.dataset.creature);
        if (caught.includes(creature.id)) return;
        const near = distance(state.creature.dadX, state.creature.dadY, creature.x, creature.y) < 18;
        if (near) renderCatch(creature);
        else renderCreatureMap(`<span class="speaker">Adam</span>Walk closer first. We are catching creatures, not sending emails.`);
      });
    });
    document.querySelector("#enterTournament").addEventListener("click", () => {
      if (allCaught) startTournament();
    });
    document.querySelector("#backHub").addEventListener("click", () => renderHub());

  }

  function moveDad(direction) {
    const step = 7;
    if (direction === "up") state.creature.dadY -= step;
    if (direction === "down") state.creature.dadY += step;
    if (direction === "left") state.creature.dadX -= step;
    if (direction === "right") state.creature.dadX += step;
    state.creature.dadX = clamp(state.creature.dadX, 8, 92);
    state.creature.dadY = clamp(state.creature.dadY, 8, 92);
    saveState();
    const nearby = creatures.find((creature) =>
      !state.creature.caught.includes(creature.id) &&
      distance(state.creature.dadX, state.creature.dadY, creature.x, creature.y) < 8
    );
    if (nearby) renderCatch(nearby);
    else renderCreatureMap();
  }

  function distance(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
  }

  function renderCatch(creature, attempt = 1, message = "") {
    let ring = 100;
    let shrinking = true;
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">${creature.name}</h1>
          <p class="subtitle">A wild ${creature.name} appeared in ${creature.area}.</p>
        </div>
        ${threeGameplayPanel("creatures", {
          caught: state.creature.caught,
          encounter: creature,
          result: message ? "bad" : "neutral",
          speaker: creature.name,
          caption: message ? `${creature.name} popped out. Try the timing ring again.` : `${creature.name} appeared. Time the ring to catch it.`
        })}
        ${message ? `<div class="dialogue">${message}</div>` : ""}
        <div class="catch-stage">
          <div class="catch-orb">
            <div class="catch-zone"></div>
            <div class="catch-ring" id="catchRing" style="--ring-size:${ring}%;"></div>
            <div class="creature-face" style="background:${creature.color};"></div>
          </div>
          <p><strong>Attempt ${attempt}/5:</strong> Tap throw when the ring is inside the green zone.</p>
          <button class="btn" id="throwCatch">Throw</button>
          <button class="btn secondary" id="leaveCatch">Back To Map</button>
        </div>
      </section>
    `);
    const ringEl = document.querySelector("#catchRing");
    let last = performance.now();
    function tick(now) {
      const dt = (now - last) / 1000;
      last = now;
      ring += (shrinking ? -1 : 1) * dt * 58;
      if (ring <= 24) shrinking = false;
      if (ring >= 100) shrinking = true;
      ringEl.style.setProperty("--ring-size", `${ring}%`);
      catchLoop = requestAnimationFrame(tick);
    }
    catchLoop = requestAnimationFrame(tick);
    document.querySelector("#throwCatch").addEventListener("click", () => {
      if (attempt >= 5 || (ring >= 34 && ring <= 48)) {
        state.creature.caught.push(creature.id);
        saveState();
        renderCreatureMap(`
          <span class="speaker">${creature.name}</span>
          ${creature.name} joined Dad's Legendary Six.
          <br><br>
          <span class="speaker">Hayleigh</span>
          Yay Dada!
        `);
      } else {
        const pop = attempt === 4
          ? `${creature.name} popped out again. Adam: At this point it is not escaping. It is negotiating.`
          : `${creature.name} popped out. Adam: That throw had confidence. Not accuracy.`;
        renderCatch(creature, attempt + 1, `<span class="speaker">Adam</span>${pop}`);
      }
    });
    document.querySelector("#leaveCatch").addEventListener("click", () => renderCreatureMap());
  }

  function startTournament() {
    battle = {
      round: 0,
      playerTeam: creatures.map((creature) => ({ ...creature, currentHp: creature.hp })),
      activePlayer: 0,
      enemyTeam: [],
      activeEnemy: 0,
      log: rounds[0].intro
    };
    loadRound(0);
  }

  function loadRound(index) {
    battle.round = index;
    battle.playerTeam.forEach((creature) => creature.currentHp = creature.hp);
    battle.enemyTeam = rounds[index].enemies.map((creature) => ({ ...creature, currentHp: creature.hp }));
    battle.activePlayer = firstLiving(battle.playerTeam);
    battle.activeEnemy = 0;
    battle.log = rounds[index].intro;
    renderBattle();
  }

  function renderBattle() {
    const player = battle.playerTeam[battle.activePlayer];
    const foe = battle.enemyTeam[battle.activeEnemy];
    const round = rounds[battle.round];
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">${round.name}</h1>
          <p class="subtitle">Round ${battle.round + 1} of 3</p>
        </div>
        ${threeGameplayPanel("creatures", {
          caught: state.creature.caught,
          encounter: foe,
          result: battle.log.includes("defeated") || battle.log.includes("fainted") ? "bad" : "neutral",
          speaker: "Creature Battle",
          caption: `${player.name} faces ${foe.name}. Pick a move and watch the exchange.`
        })}
        <div class="battle-layout">
          <div class="fighters">
            ${fighterCard(player, "Dad's Team")}
            ${fighterCard(foe, round.name)}
          </div>
          <div class="dialogue"><span class="speaker">Battle</span>${battle.log}</div>
          <div class="battle-card">
            <h2>Fight</h2>
            <div class="move-grid">
              ${player.moves.map((item, index) => `<button class="btn" data-move-index="${index}">${item.name}</button>`).join("")}
            </div>
          </div>
          <div class="battle-card">
            <h2>Swap</h2>
            <div class="move-grid">
              ${battle.playerTeam.map((creature, index) => `
                <button class="btn secondary" data-swap-index="${index}" ${creature.currentHp <= 0 || index === battle.activePlayer ? "disabled" : ""}>
                  ${creature.name} (${Math.max(0, creature.currentHp)}/${creature.hp})
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      </section>
    `);
    document.querySelectorAll("[data-move-index]").forEach((button) => {
      button.addEventListener("click", () => playerMove(Number(button.dataset.moveIndex)));
    });
    document.querySelectorAll("[data-swap-index]").forEach((button) => {
      button.addEventListener("click", () => {
        battle.activePlayer = Number(button.dataset.swapIndex);
        enemyTurn(`${battle.playerTeam[battle.activePlayer].name} tagged in.`);
      });
    });
  }

  function fighterCard(creature, label) {
    return `
      <div class="battle-card">
        <small>${label}</small>
        <h2>${creature.name}</h2>
        <p>${Math.max(0, creature.currentHp)} / ${creature.hp} HP</p>
        <div class="hp-bar"><div class="hp-fill" style="--hp:${Math.max(0, creature.currentHp / creature.hp * 100)}%;"></div></div>
      </div>
    `;
  }

  function playerMove(moveIndex) {
    const player = battle.playerTeam[battle.activePlayer];
    const foe = battle.enemyTeam[battle.activeEnemy];
    const selected = player.moves[moveIndex];
    let log = applyMove(player, foe, selected, battle.playerTeam);
    if (foe.currentHp <= 0) {
      log += `<br>${foe.name} fainted.`;
      const nextEnemy = firstLiving(battle.enemyTeam);
      if (nextEnemy === -1) return winRound(log);
      battle.activeEnemy = nextEnemy;
      log += `<br>${battle.enemyTeam[nextEnemy].name} enters the battle.`;
      battle.log = log;
      renderBattle();
      return;
    }
    enemyTurn(log);
  }

  function enemyTurn(prefix) {
    const player = battle.playerTeam[battle.activePlayer];
    const foe = battle.enemyTeam[battle.activeEnemy];
    const selected = foe.moves[Math.floor(Math.random() * foe.moves.length)];
    let log = `${prefix}<br>${applyMove(foe, player, selected, battle.enemyTeam)}`;
    if (player.currentHp <= 0) {
      log += `<br>${player.name} fainted.`;
      const next = firstLiving(battle.playerTeam);
      if (next === -1) {
        battle.log = `${log}<br>Dad's Legendary Six was defeated this round.`;
        renderTournamentLoss();
        return;
      }
      battle.activePlayer = next;
      log += `<br>${battle.playerTeam[next].name} steps in.`;
    }
    battle.log = log;
    renderBattle();
  }

  function applyMove(attacker, target, selected, team) {
    if (selected.effect === "heal") {
      attacker.currentHp = clamp(attacker.currentHp + Math.abs(selected.power), 0, attacker.hp);
      return `${attacker.name} used ${selected.name}. ${selected.text}`;
    }
    if (selected.effect === "teamHeal") {
      team.forEach((ally) => {
        if (ally.currentHp > 0) ally.currentHp = clamp(ally.currentHp + Math.abs(selected.power), 0, ally.hp);
      });
      return `${attacker.name} used ${selected.name}. ${selected.text}`;
    }
    const variance = Math.floor(Math.random() * 7) - 3;
    const damage = Math.max(8, selected.power + variance);
    target.currentHp -= damage;
    return `${attacker.name} used ${selected.name}. ${selected.text || ""} ${target.name} took ${damage} damage.`;
  }

  function firstLiving(team) {
    return team.findIndex((creature) => creature.currentHp > 0);
  }

  function winRound(log) {
    if (battle.round >= rounds.length - 1) {
      completeWorld("creatures");
      state.creature.tournamentWon = true;
      saveState();
      renderCreatureWin();
      return;
    }
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Round Won</h1>
          <p class="subtitle">The team rests for the day before the next battle.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Battle</span>${log}
          <br><br>
          <span class="speaker">Narrator</span>
          Snugglecub demanded snacks. Gearfox pretended not to be tired. Naptitan was asleep before anyone finished talking. Everyone recovered.
        </div>
        <button class="btn" id="nextRound">Next Round</button>
      </section>
    `);
    document.querySelector("#nextRound").addEventListener("click", () => loadRound(battle.round + 1));
  }

  function renderTournamentLoss() {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Round Lost</h1>
          <p class="subtitle">No pity wins. Heal up and try the tournament again.</p>
        </div>
        <div class="dialogue">${battle.log}</div>
        <div class="button-row">
          <button class="btn" id="retryTournament">Retry Tournament</button>
          <button class="btn secondary" id="backMap">Back To Map</button>
        </div>
      </section>
    `);
    document.querySelector("#retryTournament").addEventListener("click", startTournament);
    document.querySelector("#backMap").addEventListener("click", () => renderCreatureMap());
  }

  function renderCreatureWin() {
    renderThreeStoryScene({
      theme: "creatures",
      title: "Teamheart",
      subtitle: "Dad's Legendary Six won the Creature League.",
      aria: "3D Creature League victory",
      primaryLabel: "Teamheart Token Earned",
      lines: [
        { speaker: "Adam", text: "That was a weird team. A cuddle monster, garage fox, weather dogs, sleepy tank, and offended lion." },
        { speaker: "Hayleigh", text: "Team!" },
        { speaker: "Adam", text: "They won because each one brought something nobody else could. No matter what shows up, you do not fight alone." }
      ],
      onPrimary: () => renderHub("Teamheart Token earned."),
      onSecondary: () => renderHub()
    });
  }

  function renderJediIntro() {
    renderThreeStoryScene({
      theme: "jedi",
      title: "The Galaxy Trial",
      subtitle: "Asteroid run, laser defense, wise choices, and a final duel.",
      aria: "3D galaxy trial briefing",
      primaryLabel: "Begin Trial",
      lines: [
        { speaker: "Adam", text: "Congratulations, Pops. The galaxy needs a hero and apparently you are already qualified." },
        { speaker: "Hayleigh", text: "Dada go!" },
        { speaker: "Mission", text: "Recover the Family Star Crystal and prove distance does not make love quieter." }
      ],
      onPrimary: () => renderJediAsteroids(),
      onSecondary: () => renderHub()
    });
  }

  function renderJediAsteroids(score = 0, hp = 3, wave = 1, message = "Choose the safe lane and collect enough light to reach the trial gate.") {
    if (score >= 10) return renderJediSaber();
    if (hp <= 0) return renderJediLoss("The asteroid field wins this round. Space rocks remain undefeated.");
    const danger = Math.floor(Math.random() * 3);
    const lanes = ["Left", "Center", "Right"];
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Asteroid Run</h1>
          <p class="subtitle">Light Orbs: ${score}/10 | Shields: ${hp}</p>
        </div>
        ${threeGameplayPanel("jedi", {
          mode: "asteroids",
          danger,
          result: message.startsWith("Impact") ? "bad" : message.startsWith("Clean") ? "good" : "neutral",
          speaker: "Asteroid Field",
          caption: message.startsWith("Impact") ? "Wrong lane. The ship clips an asteroid." : message.startsWith("Clean") ? "Safe lane. Dad collects a light orb." : "Pick a lane and dodge the asteroid."
        })}
        <div class="dialogue"><span class="speaker">Mission</span>${message}</div>
        <div class="lane-grid">
          ${lanes.map((lane, index) => `
            <button class="lane-card ${index === danger ? "active" : ""}" data-lane="${index}">
              ${lane}<br>${index === danger ? "Asteroid" : "Safe Light"}
            </button>
          `).join("")}
        </div>
      </section>
    `);
    document.querySelectorAll("[data-lane]").forEach((button) => {
      button.addEventListener("click", () => {
        const picked = Number(button.dataset.lane);
        if (picked === danger) renderJediAsteroids(score, hp - 1, wave + 1, "Impact. Adam is absolutely going to mention that later.");
        else renderJediAsteroids(score + 1, hp, wave + 1, "Clean dodge. The light orb joins the ship trail.");
      });
    });
  }

  function renderJediSaber(blocks = 0, hp = 3, message = "Tap the matching direction to block the training bolt.") {
    if (blocks >= 12) return renderJediChoices();
    if (hp <= 0) return renderJediLoss("Too many bolts got through. The training droid looks smug, which is rude.");
    const shot = Math.floor(Math.random() * 3);
    const lanes = ["Left Block", "Center Block", "Right Block"];
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Saber Defense</h1>
          <p class="subtitle">Blocks: ${blocks}/12 | Focus: ${hp}</p>
        </div>
        ${threeGameplayPanel("jedi", {
          mode: "saber",
          result: message.startsWith("Missed") ? "bad" : message.startsWith("Blocked") ? "good" : "neutral",
          speaker: "Training Droid",
          caption: message.startsWith("Missed") ? "The bolt gets through." : message.startsWith("Blocked") ? "The saber catches the bolt." : "Read the lane and block the incoming bolt."
        })}
        <div class="dialogue"><span class="speaker">Training Droid</span>${message}</div>
        <div class="lane-grid">
          ${lanes.map((lane, index) => `
            <button class="lane-card ${index === shot ? "active" : ""}" data-block="${index}">
              ${lane}<br>${index === shot ? "Incoming Bolt" : "Clear"}
            </button>
          `).join("")}
        </div>
      </section>
    `);
    document.querySelectorAll("[data-block]").forEach((button) => {
      button.addEventListener("click", () => {
        const picked = Number(button.dataset.block);
        if (picked === shot) renderJediSaber(blocks + 1, hp, "Blocked. The saber hums brighter.");
        else renderJediSaber(blocks, hp - 1, "Missed block. Adam: The laser was kind of the obvious glowing part.");
      });
    });
  }

  function renderJediChoices(step = 0, charge = 0, message = "The shadow tries to pull Dad off the light side.") {
    const choices = [
      {
        prompt: "The Shadow: You are tired. Stay gone. Rest alone.",
        right: "My family is my strength.",
        wrong: ["I fight only for myself.", "I'll think about it after snacks."]
      },
      {
        prompt: "The Shadow: Anger is faster.",
        right: "Light is stronger when I slow down.",
        wrong: ["Anger gets better gas mileage.", "I will simply glare harder."]
      },
      {
        prompt: "The Shadow: Distance makes love quieter.",
        right: "No. Love reaches home.",
        wrong: ["Maybe if the service is bad.", "Only if the snacks run out."]
      }
    ];
    if (step >= choices.length) return renderJediDuel(0, 3, charge);
    const current = choices[step];
    const options = [current.right, ...current.wrong].sort(() => Math.random() - 0.5);
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Light Side Choice</h1>
          <p class="subtitle">Saber Charge: ${charge}/3</p>
        </div>
        ${threeGameplayPanel("jedi", {
          mode: "choices",
          result: message.includes("flickers") ? "bad" : message.includes("brightens") ? "good" : "neutral",
          speaker: "Choice Scene",
          caption: message.includes("flickers") ? "The shadow presses in, but Dad stays standing." : message.includes("brightens") ? "The light answers the right choice." : "Choose the answer that keeps Dad on the light side."
        })}
        <div class="dialogue">
          <span class="speaker">Shadow</span>
          ${current.prompt}
          <br><br>
          <span class="speaker">Mission</span>
          ${message}
        </div>
        <div class="button-row">
          ${options.map((option) => `<button class="btn secondary" data-choice="${esc(option)}">${option}</button>`).join("")}
        </div>
      </section>
    `);
    document.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const correct = button.dataset.choice === current.right;
        renderJediChoices(step + 1, charge + (correct ? 1 : 0), correct ? "The saber brightens." : "The saber flickers, but Dad stays standing.");
      });
    });
  }

  function renderJediDuel(hits = 0, hp = 3, charge = 0, message = "Read the shadow's move and answer correctly.") {
    if (hits >= 3) return renderJediWin(charge);
    if (hp <= 0) return renderJediLoss("The shadow wins the duel. Pops can retry from the trial start.");
    const prompts = [
      { tell: "The shadow raises its saber high.", answer: "Block", options: ["Attack", "Block", "Dodge"] },
      { tell: "The shadow overextends after a swing.", answer: "Attack", options: ["Attack", "Block", "Dodge"] },
      { tell: "The floor glows under Dad's boots.", answer: "Dodge", options: ["Attack", "Block", "Dodge"] }
    ];
    const turn = prompts[Math.floor(Math.random() * prompts.length)];
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Final Duel</h1>
          <p class="subtitle">Hits: ${hits}/3 | Focus: ${hp}</p>
        </div>
        ${threeGameplayPanel("jedi", {
          mode: "duel",
          result: message.startsWith("Wrong") ? "bad" : message.startsWith("Clean") ? "good" : "neutral",
          speaker: "Final Duel",
          caption: message.startsWith("Wrong") ? "The shadow lands the exchange." : message.startsWith("Clean") ? "Dad pushes the shadow back." : "Read the move and choose the counter."
        })}
        <div class="dialogue">
          <span class="speaker">Shadow</span>
          ${turn.tell}
          <br><br>
          <span class="speaker">Mission</span>
          ${message}
        </div>
        <div class="button-row">
          ${turn.options.map((option) => `<button class="btn" data-duel="${option}">${option}</button>`).join("")}
        </div>
      </section>
    `);
    document.querySelectorAll("[data-duel]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.duel === turn.answer) renderJediDuel(hits + 1, hp, charge, "Clean answer. The shadow loses ground.");
        else renderJediDuel(hits, hp - 1, charge, "Wrong read. Adam: Bold. Incorrect, but bold.");
      });
    });
  }

  function renderJediLoss(message) {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Trial Failed</h1>
          <p class="subtitle">No pity wins. The light side allows retries.</p>
        </div>
        <div class="dialogue"><span class="speaker">Adam</span>${message}</div>
        <div class="button-row">
          <button class="btn" id="retryJedi">Retry Trial</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    document.querySelector("#retryJedi").addEventListener("click", () => renderJediAsteroids());
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function renderJediWin(charge) {
    completeWorld("jedi");
    renderThreeStoryScene({
      theme: "jedi",
      title: "Starheart",
      subtitle: "The Galaxy Trial is complete.",
      aria: "3D Galaxy Trial victory",
      primaryLabel: "Return To Hub",
      lines: [
        { speaker: "Adam", text: "Not bad, Pops. You defeated a shadow, dodged space rocks, and only looked confused a normal amount." },
        { speaker: "Hayleigh", text: "Dada light!" },
        { speaker: "Narrator", text: "Some heroes win by being powerful. Dad wins because he keeps choosing what matters." }
      ],
      onPrimary: () => renderHub(`Starheart Token earned. Saber charge: ${charge}/3.`),
      onSecondary: () => renderHub()
    });
  }

  function renderGuardianIntro() {
    renderThreeStoryScene({
      theme: "guardian",
      title: "Guardian of the Home Light",
      subtitle: "Clear rooms, recover light fragments, and face The Distance.",
      aria: "3D guardian mission briefing",
      primaryLabel: "Start Mission",
      lines: [
        { speaker: "Little Light", text: `Guardian ${state.playerName}, the Home Light is fading.` },
        { speaker: "Adam", text: "Fireteam advice: shoot the bad stuff, save the little light, and do not forget you are coming home." },
        { speaker: "Mission", text: "Recover five light fragments, charge Arc Burst, and bring the fireteam home." }
      ],
      onPrimary: () => renderGuardianMission(),
      onSecondary: () => renderHub()
    });
  }

  function freshGuardianState(log = "A Taken echo blocks the path. Choose an action.") {
    return {
      hp: 100,
      fragments: 0,
      superCharge: 0,
      enemyHp: 48,
      boss: false,
      dodging: false,
      log
    };
  }

  function renderGuardianMission(mission = freshGuardianState()) {
    if (mission.hp <= 0) return renderGuardianLoss(mission.log);
    if (mission.boss && mission.enemyHp <= 0) return renderGuardianWin();
    if (!mission.boss && mission.fragments >= 5) {
      mission.boss = true;
      mission.enemyHp = 140;
      mission.hp = 100;
      mission.log = "The Home Light restores Dad before the final fight. The Distance steps into the light.";
    }
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">${mission.boss ? "The Distance" : "Arc Patrol"}</h1>
          <p class="subtitle">Fragments: ${mission.fragments}/5 | Arc Burst: ${mission.superCharge}%</p>
        </div>
        ${threeGameplayPanel("guardian", {
          boss: mission.boss,
          room: mission.boss ? 2 : Math.min(2, mission.fragments % 3),
          action: mission.log.includes("Arc Burst") ? "super" : mission.log.includes("Dodge") ? "dodge" : mission.log.includes("Knife") ? "knife" : "shoot",
          result: mission.log.includes("hits back") ? "bad" : "good",
          speaker: mission.boss ? "Boss Room" : "Arc Patrol",
          caption: mission.boss ? "The Distance is in the light. Choose the next action." : "Dad clears the room, fires arc shots, and collects light fragments."
        })}
        <div class="panel">
          <div class="meter-list">
            ${meter("Guardian HP", mission.hp)}
            ${meter(mission.boss ? "The Distance" : "Echo HP", mission.enemyHp, mission.boss ? 140 : 48)}
            ${meter("Arc Charge", mission.superCharge)}
          </div>
        </div>
        <div class="dialogue"><span class="speaker">Mission Feed</span>${mission.log}</div>
        <div class="button-row">
          <button class="btn" data-guardian="shoot">Arc Shot</button>
          <button class="btn secondary" data-guardian="knife">Lightning Knife</button>
          <button class="btn secondary" data-guardian="dodge">Hunter Dodge</button>
          <button class="btn warning" data-guardian="super" ${mission.superCharge < 100 ? "disabled" : ""}>Arc Burst</button>
        </div>
      </section>
    `);
    document.querySelectorAll("[data-guardian]").forEach((button) => {
      button.addEventListener("click", () => guardianAction(mission, button.dataset.guardian));
    });
  }

  function guardianAction(mission, action) {
    let damage = 0;
    let log = "";
    if (action === "shoot") {
      damage = 18 + Math.floor(Math.random() * 8);
      mission.superCharge = clamp(mission.superCharge + 18, 0, 100);
      log = "Arc Shot lands. The air smells like lightning.";
    }
    if (action === "knife") {
      damage = 25 + Math.floor(Math.random() * 10);
      mission.superCharge = clamp(mission.superCharge + 12, 0, 100);
      log = "Lightning Knife hits hard. Adam: Stylish and probably against several safety rules.";
    }
    if (action === "dodge") {
      mission.dodging = true;
      mission.superCharge = clamp(mission.superCharge + 10, 0, 100);
      log = "Hunter Dodge. Dad moves like the bill was due yesterday.";
    }
    if (action === "super") {
      damage = mission.boss ? 62 : 48;
      mission.superCharge = 0;
      log = "Arc Burst detonates across the room. Hayleigh: Boom!";
    }
    mission.enemyHp -= damage;
    if (!mission.boss && mission.enemyHp <= 0) {
      mission.fragments += 1;
      mission.enemyHp = 48 + mission.fragments * 7;
      mission.hp = clamp(mission.hp + 6, 0, 100);
      mission.log = `${log}<br>A light fragment returns home. Little Light: ${mission.fragments}/5 recovered.`;
      return renderGuardianMission(mission);
    }
    const incoming = mission.boss ? 20 + Math.floor(Math.random() * 9) : 12 + Math.floor(Math.random() * 7);
    const taken = mission.dodging ? Math.floor(incoming * 0.35) : incoming;
    mission.dodging = false;
    mission.hp -= taken;
    mission.log = `${log}<br>${mission.boss ? "The Distance" : "The echo"} hits back for ${taken}.`;
    renderGuardianMission(mission);
  }

  function renderGuardianLoss(message) {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Mission Failed</h1>
          <p class="subtitle">The fireteam can retry.</p>
        </div>
        <div class="dialogue"><span class="speaker">Little Light</span>${message}<br><br>Distance is loud. Love is louder. Try again.</div>
        <div class="button-row">
          <button class="btn" id="retryGuardian">Retry Mission</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    document.querySelector("#retryGuardian").addEventListener("click", () => renderGuardianMission());
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function renderGuardianWin() {
    completeWorld("guardian");
    renderThreeStoryScene({
      theme: "guardian",
      title: "Lightheart",
      subtitle: "The Home Light is restored.",
      aria: "3D Guardian victory",
      primaryLabel: "Return To Hub",
      lines: [
        { speaker: "Little Light", text: "The Distance is gone." },
        { speaker: "Adam", text: "Your fireteam is still here, Pops. Even when work pulls you out of town." },
        { speaker: "Narrator", text: "Some missions take Guardian far from home. This light always knows the way back." }
      ],
      onPrimary: () => renderHub("Lightheart Token earned."),
      onSecondary: () => renderHub()
    });
  }

  function meter(label, value, max = 100) {
    const percent = clamp(value / max * 100, 0, 100);
    return `
      <div>
        <div class="meter-label"><span>${label}</span><span>${Math.max(0, Math.round(value))}/${max}</span></div>
        <div class="meter"><div class="meter-fill" style="--meter:${percent}%;"></div></div>
      </div>
    `;
  }

  function renderFishingIntro() {
    renderThreeStoryScene({
      theme: "fishing",
      title: "The Deep Blue Fight",
      subtitle: "Marathon Key, one boat, one huge swordfish, and a long memory.",
      aria: "3D deep blue fishing briefing",
      primaryLabel: "Rig The Line",
      lines: [
        { speaker: "Adam", text: "Four hours later and somehow this fish still has better cardio than all of us." },
        { speaker: "Deck", text: "The rod is ready. The ocean is acting casual, which is suspicious." },
        { speaker: "Memory", text: "Some memories are measured in pounds. Some are measured in hours." }
      ],
      onPrimary: () => renderFishingRig(),
      onSecondary: () => renderHub()
    });
  }

  function renderFishingRig(message = "") {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">The Deep Blue Fight</h1>
          <p class="subtitle">Marathon Key, Florida. One boat. One memory. One 228 lb swordfish.</p>
        </div>
        ${message ? `<div class="dialogue">${message}</div>` : ""}
        <div class="panel ocean-panel">
          <h2>Rig The Line</h2>
          <p>Choose a setup. This level is more about the fight than perfect tuning.</p>
          <div class="slider-grid">
            ${tuneSlider("drag", "Drag", 3)}
            ${tuneSlider("depth", "Bait Depth", 4)}
            ${tuneSlider("hook", "Hook Set Timing", 3)}
            ${tuneSlider("line", "Line Weight", 4)}
            ${tuneSlider("patience", "Patience", 5)}
          </div>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          Four hours later and somehow this fish still has better cardio than all of us.
        </div>
        <div class="button-row">
          <button class="btn" id="startFishing">Head Offshore</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    document.querySelectorAll("[data-tune]").forEach((input) => {
      input.addEventListener("input", () => {
        document.querySelector(`#${input.dataset.tune}Value`).textContent = input.value;
      });
    });
    document.querySelector("#startFishing").addEventListener("click", () => {
      const rig = {};
      document.querySelectorAll("[data-tune]").forEach((input) => rig[input.dataset.tune] = Number(input.value));
      renderFishingHook(rig);
    });
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function renderFishingHook(rig, signal = "quiet", misses = 0) {
    if (misses >= 3) {
      return renderFishingRig(`<span class="speaker">Adam</span>The fish stole the bait three times. I am not mad. I am just narrating your crimes.`);
    }
    const signals = ["quiet", "nibble", "twitch", "strike"];
    const current = signal || signals[Math.floor(Math.random() * signals.length)];
    const strike = current === "strike";
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Find The Bite</h1>
          <p class="subtitle">Wait for the strike, then set the hook.</p>
        </div>
        ${threeGameplayPanel("fishing", {
          mode: "hook",
          signal: current,
          result: misses > 0 ? "bad" : "neutral",
          speaker: "Rod Tip",
          caption: strike ? "The rod folds hard. Set the hook." : "Watch the rod. Not every twitch is the fish."
        })}
        <div class="panel ocean-panel">
          <h2>Rod Tip</h2>
          <p>${fishingSignalText(current)}</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          ${strike ? "That's not a nibble. Set it!" : "That was either a bite or the ocean judging you."}
        </div>
        <div class="button-row">
          <button class="btn secondary" id="watchRod">Watch Rod</button>
          <button class="btn" id="setHook">Set Hook</button>
        </div>
      </section>
    `);
    document.querySelector("#watchRod").addEventListener("click", () => {
      const next = signals[Math.floor(Math.random() * signals.length)];
      renderFishingHook(rig, next, misses);
    });
    document.querySelector("#setHook").addEventListener("click", () => {
      if (strike) {
        const cleanHook = rig.hook === 3;
        renderFishingFight({
          tension: cleanHook ? 42 : 58,
          dadStamina: 100,
          fishStamina: cleanHook ? 100 : 112,
          progress: 0,
          phase: "The Run",
          log: cleanHook ? "Clean hook set. The swordfish turns and runs." : "Hook set was rough. The fish is angry and the line is already tight."
        });
      } else {
        renderFishingHook(rig, "quiet", misses + 1);
      }
    });
  }

  function fishingSignalText(signal) {
    return ({
      quiet: "Small waves slap the hull. The line hums quietly.",
      nibble: "A tiny tap. Maybe bait. Maybe attitude.",
      twitch: "The rod twitches twice, then settles.",
      strike: "The rod folds hard toward the water. Strike zone."
    })[signal] || signal;
  }

  function renderFishingFight(fight) {
    if (fight.tension >= 105) return renderFishingLoss("The line snaps. The ocean keeps the story for now.");
    if (fight.dadStamina <= 0) return renderFishingLoss("Pops runs out of stamina. The fish pulls away before boat side.");
    if (fight.fishStamina <= 0 || fight.progress >= 100) return renderFishingLand();

    const phase = fight.progress > 72 ? "Boat Side" : fight.progress > 34 ? "The Grind" : "The Run";
    fight.phase = phase;
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">${phase}</h1>
          <p class="subtitle">228 lb Swordfish | Marathon Key, Florida</p>
        </div>
        ${threeGameplayPanel("fishing", {
          mode: "fight",
          signal: "strike",
          result: fight.tension > 85 ? "bad" : "good",
          speaker: phase,
          caption: fight.tension > 85 ? "The line is screaming. Ease up or it may snap." : "Dad works the fish closer to the boat."
        })}
        <div class="panel ocean-panel">
          <div class="meter-list">
            ${meter("Line Tension", fight.tension)}
            ${meter("Dad Stamina", fight.dadStamina)}
            ${meter("Fish Stamina", fight.fishStamina, 120)}
            ${meter("Boat-Side Progress", fight.progress)}
          </div>
        </div>
        <div class="dialogue">
          <span class="speaker">Deck</span>
          ${fight.log}
          <br><br>
          <span class="speaker">Adam</span>
          ${fishingPhaseAdvice(phase)}
        </div>
        <div class="button-row">
          <button class="btn" data-fishing="reel">Reel</button>
          <button class="btn secondary" data-fishing="ease">Ease Drag</button>
          <button class="btn warning" data-fishing="pump">Pump Rod</button>
        </div>
      </section>
    `);
    document.querySelectorAll("[data-fishing]").forEach((button) => {
      button.addEventListener("click", () => fishingAction(fight, button.dataset.fishing));
    });
  }

  function fishingPhaseAdvice(phase) {
    return ({
      "The Run": "Do not horse it. Let him run, but do not let him own the boat.",
      "The Grind": "This is the part where the clock gets weird and everyone pretends their arms do not hurt.",
      "Boat Side": "He's right there. Don't get greedy."
    })[phase];
  }

  function fishingAction(fight, action) {
    const next = { ...fight };
    if (action === "reel") {
      next.fishStamina -= 10;
      next.progress += 8;
      next.tension += 14;
      next.dadStamina -= 10;
      next.log = "Dad reels. The fish gives up water one stubborn foot at a time.";
    }
    if (action === "ease") {
      next.tension -= 20;
      next.dadStamina += 7;
      next.fishStamina += 4;
      next.log = "Dad eases the drag. The line breathes, but the fish steals a little distance.";
    }
    if (action === "pump") {
      if (next.tension < 76) {
        next.fishStamina -= 18;
        next.progress += 14;
        next.tension += 19;
        next.dadStamina -= 15;
        next.log = "Pump and reel. The swordfish comes closer.";
      } else {
        next.tension += 24;
        next.dadStamina -= 12;
        next.log = "Pump was too greedy with high tension. The line screams.";
      }
    }
    if (Math.random() < 0.32) {
      next.tension += 8;
      next.progress -= 3;
      next.log += "<br>The swordfish surges. Dad has entered negotiations with a sea sword.";
    }
    next.tension = clamp(next.tension, 0, 120);
    next.dadStamina = clamp(next.dadStamina, -10, 100);
    next.fishStamina = clamp(next.fishStamina, -10, 120);
    next.progress = clamp(next.progress, 0, 100);
    renderFishingFight(next);
  }

  function renderFishingLoss(message) {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Fish Lost</h1>
          <p class="subtitle">No pity wins offshore either.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          ${message}
          <br><br>
          If you lose this fish, I am telling the story dramatically forever. So maybe try again.
        </div>
        <div class="button-row">
          <button class="btn" id="retryFishing">Retry Fight</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    document.querySelector("#retryFishing").addEventListener("click", () => renderFishingRig());
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function renderFishingLand() {
    completeWorld("fishing");
    renderThreeStoryScene({
      theme: "fishing",
      title: "Tideheart",
      subtitle: "228 lb Swordfish Landed | Marathon Key, Florida",
      aria: "3D Deep Blue victory",
      primaryLabel: "Return To Hub",
      lines: [
        { speaker: "Adam", text: "I still remember that trip. Not just the fish. The boat. The waiting." },
        { speaker: "Adam", text: "Watching you fight something bigger than both of us expected. And you did not let go." },
        { speaker: "Narrator", text: "The best memories are measured by who was standing beside you." }
      ],
      onPrimary: () => renderHub("Tideheart Token earned."),
      onSecondary: () => renderHub()
    });
  }

  async function renderTinkerbellDungeon() {
    render(`
      <section class="screen game-screen tinker-screen">
        <div class="hero-card">
          <h1 class="title">Tinker Bell Rescue</h1>
          <p class="subtitle">Fight through Captain Hook's pirate ship and rescue Dad's Tinker Bell.</p>
        </div>
        <div class="tinker-play-shell">
          <div class="tinker-stage-shell">
            <div class="race-wrap three-race tinker-wrap">
              <div class="race-hud tinker-hud">
                <span id="tinkerHealth">Hearts</span>
                <span id="tinkerStatus">Loading pirate ship...</span>
                <span id="tinkerBoss">Smee</span>
              </div>
              <div id="tinkerDungeonStage" class="moto-3d-stage tinker-dungeon-stage" aria-label="Top-down Tinker Bell dungeon"></div>
            </div>
          </div>
          <div class="tinker-control-panel">
            <div class="mobile-controls tinker-controls">
              <div class="tinker-dpad" aria-label="Movement controls">
                <button class="control-btn dpad-up" data-dungeon-control="UP" aria-label="Move up">&uarr;</button>
                <button class="control-btn dpad-left" data-dungeon-control="LEFT" aria-label="Move left">&larr;</button>
                <span class="dpad-center" aria-hidden="true"></span>
                <button class="control-btn dpad-right" data-dungeon-control="RIGHT" aria-label="Move right">&rarr;</button>
                <button class="control-btn dpad-down" data-dungeon-control="DOWN" aria-label="Move down">&darr;</button>
              </div>
              <div class="tinker-center-pad">
                <button class="tinker-exit-mini" id="tinkerExit">Hub</button>
              </div>
              <div class="tinker-action-pad" aria-label="Action controls">
                <button class="control-btn attack-btn" id="tinkerAttack">Attack</button>
                <button class="control-btn action-btn" id="tinkerInteract">Open</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `);

    try {
      const THREE = await loadThree();
      const dungeon = await import("./tinkerbell-dungeon.js");
      const cleanup = dungeon.startTinkerbellDungeon({
        THREE,
        mount: document.querySelector("#tinkerDungeonStage"),
        hud: {
          health: document.querySelector("#tinkerHealth"),
          status: document.querySelector("#tinkerStatus"),
          boss: document.querySelector("#tinkerBoss")
        },
        controls: {
          moveButtons: Array.from(document.querySelectorAll("[data-dungeon-control]")),
          attackButton: document.querySelector("#tinkerAttack"),
          interactButton: document.querySelector("#tinkerInteract"),
          exitButton: document.querySelector("#tinkerExit")
        },
        onExit: () => renderHub(),
        onVictory: () => {
          completeWorld("pixie");
          renderTinkerbellVictory();
        }
      });
      addCleanup(cleanup);
    } catch {
      renderPixieIntro();
    }
  }

  function renderTinkerbellVictory() {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Tinker Bell Rescued</h1>
          <p class="subtitle">Captain Hook is defeated.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Tinker Bell</span>
          You defeated the pirates and rescued your Tinker Bell! Happy Father's Day!
        </div>
        <button class="btn" id="hubAfterTinker">Pixieheart Token Earned</button>
      </section>
    `);
    document.querySelector("#hubAfterTinker").addEventListener("click", () => renderHub("Pixieheart Token earned."));
  }

  function renderPixieIntro() {
    renderThreeStoryScene({
      theme: "pixie",
      title: "Neverland Rescue",
      subtitle: "Find memory keys, cross the cove, and rescue the tiny light.",
      aria: "3D Neverland rescue briefing",
      primaryLabel: "Enter Never Island",
      lines: [
        { speaker: "Narrator", text: "A tiny light flickers over the water." },
        { speaker: "Hayleigh", text: "Dada help!" },
        { speaker: "Narrator", text: "The fairy is trapped aboard the captain's ship, and Dad is going to do what Dad does." }
      ],
      onPrimary: () => renderPixieExplore(),
      onSecondary: () => renderHub()
    });
  }

  async function renderPixieExplore(message = "") {
    render(`
      <section class="screen game-screen">
        <div class="hero-card">
          <h1 class="title">Neverland Rescue</h1>
          <p class="subtitle">Move Dad around the island, collect three memory keys, then rescue the fairy from the pirate ship.</p>
        </div>
        <div class="race-wrap three-race pixie-play-wrap">
          <div class="race-hud pixie-hud">
            <span id="pixieKeyStatus">Keys 0/3</span>
            <span id="pixieHintStatus">Find the glowing keys</span>
            <span id="pixieDustStatus">Pixie Dust 3</span>
          </div>
          <div id="pixieWorldStage" class="moto-3d-stage pixie-world-stage" aria-label="3D Pixie island exploration"></div>
        </div>
        <div class="dialogue" id="raceCallout">
          <span class="speaker">Fairy Light</span>
          ${message || "The island is open now. Use the movement buttons or WASD/arrow keys to search for memory keys."}
        </div>
        <div class="mobile-controls pixie-controls">
          <div class="cluster">
            <button class="control-btn" data-pixie-control="left">Left</button>
            <button class="control-btn" data-pixie-control="right">Right</button>
          </div>
          <div class="cluster">
            <button class="control-btn" data-pixie-control="up">Up</button>
            <button class="control-btn gas" data-pixie-control="down">Down</button>
          </div>
        </div>
        <div class="button-row">
          <button class="btn" id="pixieRescueButton" disabled>Rescue Fairy</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);

    document.querySelector("#backHub").addEventListener("click", () => renderHub());
    try {
      const THREE = await loadThree();
      startPixieExplore3D(THREE);
    } catch {
      renderPixieKeys();
    }
  }

  function startPixieExplore3D(THREE) {
    const stage = document.querySelector("#pixieWorldStage");
    const rescueButton = document.querySelector("#pixieRescueButton");
    const keyStatus = document.querySelector("#pixieKeyStatus");
    const hintStatus = document.querySelector("#pixieHintStatus");
    const dustStatus = document.querySelector("#pixieDustStatus");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#7dd4f4");
    scene.fog = new THREE.Fog("#7dd4f4", 28, 92);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 160);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight("#fff7d8", "#2b665b", 1.35);
    const sun = new THREE.DirectionalLight("#fff1bf", 2.35);
    sun.position.set(-16, 28, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(hemi, sun);

    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(74, 54, 12, 8),
      new THREE.MeshStandardMaterial({ color: "#2f9ab8", roughness: 0.82, metalness: 0.02 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.05;
    water.receiveShadow = true;
    scene.add(water);

    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 18, 0.5, 48),
      new THREE.MeshStandardMaterial({ color: "#56a866", roughness: 0.92 })
    );
    island.scale.z = 0.72;
    island.position.y = 0.18;
    island.receiveShadow = true;
    scene.add(island);

    const sand = new THREE.Mesh(
      new THREE.CylinderGeometry(17.8, 19.8, 0.18, 48),
      new THREE.MeshStandardMaterial({ color: "#e2c46f", roughness: 0.9 })
    );
    sand.scale.z = 0.75;
    sand.position.y = 0.02;
    sand.receiveShadow = true;
    scene.add(sand);

    const dad = addSimpleHero3D(THREE, scene, -8.5, 3.4, "#f76d57", 0.82);
    dad.position.y = 0.28;
    const fairy = buildPixieFairy3D(THREE);
    fairy.position.set(10.4, 2.6, -4.9);
    scene.add(fairy);
    const ship = buildPixiePirateShip3D(THREE);
    ship.position.set(11.2, 0.3, -6.4);
    ship.rotation.y = -0.3;
    scene.add(ship);

    const keyPositions = [
      new THREE.Vector3(-4.8, 0.75, -4.6),
      new THREE.Vector3(0.8, 0.75, 5.1),
      new THREE.Vector3(6.6, 0.75, 1.9)
    ];
    const keyMeshes = keyPositions.map((position, index) => {
      const key = buildMemoryKey3D(THREE, index);
      key.position.copy(position);
      scene.add(key);
      return key;
    });

    [
      [-10.2, -2.6],
      [-6.4, 6.4],
      [-1.2, -6.2],
      [4.3, -4.7],
      [7.8, 5.5]
    ].forEach(([x, z]) => addPixiePalm3D(THREE, scene, x, z));

    const crocodile = new THREE.Mesh(
      new THREE.BoxGeometry(4.1, 0.08, 1.0),
      new THREE.MeshStandardMaterial({ color: "#173b35", transparent: true, opacity: 0.58, roughness: 0.7 })
    );
    crocodile.position.set(-1, 0.08, 8.2);
    scene.add(crocodile);

    const controls = { left: false, right: false, up: false, down: false };
    const player = { x: -8.5, z: 3.4, keys: 0, dust: 3, hitCooldown: 0, rescued: false };
    let last = performance.now();

    function resizeScene() {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(420, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resizeScene();
    window.addEventListener("resize", resizeScene);
    addCleanup(() => {
      window.removeEventListener("resize", resizeScene);
      renderer.dispose();
      renderer.domElement.remove();
    });

    document.querySelectorAll("[data-pixie-control]").forEach((button) => {
      const key = button.dataset.pixieControl;
      const down = (event) => {
        event.preventDefault();
        controls[key] = true;
      };
      const up = (event) => {
        event.preventDefault();
        controls[key] = false;
      };
      button.addEventListener("pointerdown", down);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
      button.addEventListener("pointerleave", up);
    });
    const keyDown = (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) controls.left = true;
      if (["arrowright", "d"].includes(key)) controls.right = true;
      if (["arrowup", "w"].includes(key)) controls.up = true;
      if (["arrowdown", "s"].includes(key)) controls.down = true;
    };
    const keyUp = (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) controls.left = false;
      if (["arrowright", "d"].includes(key)) controls.right = false;
      if (["arrowup", "w"].includes(key)) controls.up = false;
      if (["arrowdown", "s"].includes(key)) controls.down = false;
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    addCleanup(() => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    });

    rescueButton.addEventListener("click", () => {
      if (!rescueButton.disabled) renderPixieWin();
    });

    function updateHud(text) {
      keyStatus.textContent = `Keys ${player.keys}/3`;
      dustStatus.textContent = `Pixie Dust ${player.dust}`;
      if (text) hintStatus.textContent = text;
    }
    updateHud("Find the glowing keys");

    function tick(now) {
      const dt = Math.min(0.045, (now - last) / 1000);
      last = now;
      const dx = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
      const dz = (controls.down ? 1 : 0) - (controls.up ? 1 : 0);
      const length = Math.hypot(dx, dz) || 1;
      player.x += dx / length * dt * 7.2;
      player.z += dz / length * dt * 7.2;
      const radius = Math.hypot(player.x / 15.2, player.z / 9.8);
      if (radius > 1) {
        player.x /= radius;
        player.z /= radius;
      }
      dad.position.set(player.x, 0.28, player.z);
      if (dx || dz) dad.rotation.y = Math.atan2(dx, dz);

      keyMeshes.forEach((key, index) => {
        if (!key.visible) return;
        key.rotation.y += 0.04;
        key.position.y = keyPositions[index].y + Math.sin(now / 280 + index) * 0.14;
        if (Math.hypot(player.x - key.position.x, player.z - key.position.z) < 1.25) {
          key.visible = false;
          player.keys += 1;
          updateHud(player.keys >= 3 ? "Go to the pirate ship" : "Memory key found");
          callout("Fairy Light", player.keys >= 3 ? "The cage lock is glowing. Get to the ship." : "A memory key joined Dad's pocket.");
        }
      });

      crocodile.position.x = Math.sin(now / 920) * 8.5;
      crocodile.position.z = 7.5 + Math.cos(now / 1200) * 1.2;
      crocodile.rotation.y = Math.sin(now / 900) * 0.45;
      if (player.hitCooldown > 0) player.hitCooldown -= dt;
      if (player.hitCooldown <= 0 && Math.hypot(player.x - crocodile.position.x, player.z - crocodile.position.z) < 1.8) {
        player.dust -= 1;
        player.hitCooldown = 1.8;
        updateHud("Crocodile shadow hit");
        callout("Cove", "The crocodile shadow clipped Dad. Pixie dust dropped.");
        if (player.dust <= 0) {
          renderPixieLoss("The pixie dust ran out while Dad searched the island.");
          return;
        }
      }

      const nearFairy = Math.hypot(player.x - fairy.position.x, player.z - fairy.position.z) < 2.2;
      rescueButton.disabled = !(player.keys >= 3 && nearFairy);
      if (player.keys >= 3 && nearFairy) updateHud("Rescue button ready");
      else if (player.keys >= 3) updateHud("Reach the ship cage");
      fairy.position.y = 2.6 + Math.sin(now / 300) * 0.16;
      camera.position.lerp(new THREE.Vector3(player.x * 0.35, 10.2, player.z + 14.2), 0.08);
      camera.lookAt(player.x * 0.35, 0.7, player.z - 1.7);
      renderer.render(scene, camera);
      raceLoop = requestAnimationFrame(tick);
    }

    raceLoop = requestAnimationFrame(tick);
  }

  function buildMemoryKey3D(THREE, index) {
    const group = new THREE.Group();
    const keyMat = new THREE.MeshStandardMaterial({
      color: "#ffe77a",
      emissive: "#ffcf5a",
      emissiveIntensity: 0.35,
      roughness: 0.42,
      metalness: 0.12
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.055, 10, 24), keyMat);
    ring.rotation.x = Math.PI / 2;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.72), keyMat);
    shaft.position.z = 0.44;
    const toothA = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.12), keyMat);
    toothA.position.set(0.1, 0, 0.82);
    const toothB = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.12), keyMat);
    toothB.position.set(-0.08, 0, 1.0);
    [ring, shaft, toothA, toothB].forEach((part) => {
      part.castShadow = true;
      group.add(part);
    });
    group.rotation.z = index * 0.35;
    return group;
  }

  function buildPixieFairy3D(THREE) {
    const fairy = new THREE.Group();
    const glowMat = new THREE.MeshStandardMaterial({
      color: "#ffe77a",
      emissive: "#ffe77a",
      emissiveIntensity: 0.75,
      roughness: 0.36
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: "#d9f7ff",
      emissive: "#63e7ff",
      emissiveIntensity: 0.32,
      transparent: true,
      opacity: 0.72,
      roughness: 0.28
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 12), glowMat);
    const wingL = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 10), wingMat);
    wingL.scale.set(0.55, 0.12, 1.3);
    wingL.position.set(-0.24, 0.04, 0);
    wingL.rotation.z = 0.45;
    const wingR = wingL.clone();
    wingR.position.x = 0.24;
    wingR.rotation.z = -0.45;
    fairy.add(body, wingL, wingR);
    fairy.userData = { float: 0.2, baseY: 2.6, speed: 300, phase: 0 };
    return fairy;
  }

  function buildPixiePirateShip3D(THREE) {
    const ship = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: "#6b3d25", roughness: 0.78 });
    const deckMat = new THREE.MeshStandardMaterial({ color: "#a66b3c", roughness: 0.72 });
    const mastMat = new THREE.MeshStandardMaterial({ color: "#4b2d1b", roughness: 0.68 });
    const sailMat = new THREE.MeshStandardMaterial({ color: "#fff7e1", roughness: 0.58, side: THREE.DoubleSide });
    const darkMat = new THREE.MeshStandardMaterial({ color: "#172c2d", roughness: 0.78 });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.0, 2.2), hullMat);
    hull.position.y = 0.72;
    hull.scale.x = 1.0;
    hull.castShadow = true;
    const bow = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.55, 4), hullMat);
    bow.rotation.z = Math.PI / 2;
    bow.rotation.y = Math.PI / 4;
    bow.position.set(3.8, 0.78, 0);
    bow.castShadow = true;
    const stern = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.7, 2.25), deckMat);
    stern.position.set(-2.8, 1.36, 0);
    stern.castShadow = true;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.18, 1.86), deckMat);
    deck.position.set(0.1, 1.28, 0);
    deck.castShadow = true;
    ship.add(hull, bow, stern, deck);

    [-1.25, 1.25].forEach((x, index) => {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.0 - index * 0.35, 12), mastMat);
      mast.position.set(x, 3.05 - index * 0.18, 0);
      mast.castShadow = true;
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.85), sailMat);
      sail.position.set(x + 0.12, 3.25 - index * 0.22, -0.08);
      sail.rotation.y = -0.18;
      sail.castShadow = true;
      const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.9, 10), mastMat);
      cross.rotation.z = Math.PI / 2;
      cross.position.set(x, 3.72 - index * 0.24, 0);
      ship.add(mast, sail, cross);
    });

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.42), darkMat);
    flag.position.set(1.25, 5.1, 0);
    flag.rotation.y = -0.22;
    ship.add(flag);

    const cage = new THREE.Group();
    const barMat = new THREE.MeshStandardMaterial({ color: "#26393c", roughness: 0.58, metalness: 0.12 });
    for (let x = -0.36; x <= 0.36; x += 0.24) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.05, 8), barMat);
      bar.position.set(x, 0, -0.42);
      cage.add(bar);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.05, 0.1), barMat);
    top.position.set(0, 0.52, -0.42);
    const bottom = top.clone();
    bottom.position.y = -0.52;
    cage.add(top, bottom);
    cage.position.set(2.1, 2.25, -0.72);
    cage.castShadow = true;
    ship.add(cage);

    return ship;
  }

  function addPixiePalm3D(THREE, scene, x, z) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: "#7a4a2b", roughness: 0.82 })
    );
    trunk.position.set(x, 1.05, z);
    trunk.rotation.z = Math.sin(x + z) * 0.14;
    trunk.castShadow = true;
    scene.add(trunk);
    const leafMat = new THREE.MeshStandardMaterial({ color: "#2f7048", roughness: 0.82 });
    for (let i = 0; i < 5; i += 1) {
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 1.35), leafMat);
      leaf.position.set(x, 1.98, z);
      leaf.rotation.y = i / 5 * Math.PI * 2;
      leaf.rotation.x = 0.45;
      leaf.castShadow = true;
      scene.add(leaf);
    }
  }

  function renderPixieKeys(keys = 0, dust = 3, message = "Pick the safest path and collect the memory keys.") {
    if (keys >= 3) return renderPixieCove(dust);
    if (dust <= 0) return renderPixieLoss("The pixie dust ran out before Dad found the keys.");
    const rooms = [
      { name: "Lost Lagoon", key: true, risk: "low" },
      { name: "Shadow Ferns", key: false, risk: "high" },
      { name: "Moonlit Rock", key: true, risk: "medium" }
    ].sort(() => Math.random() - 0.5);
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Memory Keys</h1>
          <p class="subtitle">Keys: ${keys}/3 | Pixie Dust: ${dust}</p>
        </div>
        ${threeGameplayPanel("pixie", {
          mode: "keys",
          keys,
          result: message.includes("trap") ? "bad" : message.includes("found") ? "good" : "neutral",
          speaker: "Island Path",
          caption: message.includes("trap") ? "Wrong path. The island steals pixie dust." : message.includes("found") ? "A memory key rises from the path." : "Search the island paths for memory keys."
        })}
        <div class="dialogue"><span class="speaker">Fairy Light</span>${message}</div>
        <div class="challenge-grid">
          ${rooms.map((room, index) => `
            <button class="stat-card" data-room="${index}">
              <strong>${room.name}</strong>
              <span>Risk: ${room.risk}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `);
    document.querySelectorAll("[data-room]").forEach((button) => {
      button.addEventListener("click", () => {
        const room = rooms[Number(button.dataset.room)];
        if (room.key) renderPixieKeys(keys + 1, dust, `${room.name} glows. Dad found a memory key.`);
        else renderPixieKeys(keys, dust - 1, `${room.name} was a trap. Adam: To be fair, it was called Shadow Ferns.`);
      });
    });
  }

  function renderPixieCove(dust, steps = 0, message = "Cross when the crocodile shadow sinks below the water.") {
    if (steps >= 4) return renderPixieShip(dust);
    if (dust <= 0) return renderPixieLoss("The cove swallowed the last bit of pixie dust.");
    const safe = Math.floor(Math.random() * 3);
    const options = ["Leap Now", "Wait A Beat", "Float Over"];
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Crocodile Cove</h1>
          <p class="subtitle">Crossing Steps: ${steps}/4 | Pixie Dust: ${dust}</p>
        </div>
        ${threeGameplayPanel("pixie", {
          mode: "cove",
          result: message.startsWith("Splash") ? "bad" : message.startsWith("Clean") ? "good" : "neutral",
          speaker: "Cove",
          caption: message.startsWith("Splash") ? "The crocodile shadow catches the crossing." : message.startsWith("Clean") ? "Dad crosses on the safe ripple." : "Watch the water and choose the safe crossing."
        })}
        <div class="dialogue">
          <span class="speaker">Narrator</span>
          ${message}
          <br><br>
          <span class="speaker">Hayleigh</span>
          Tick tock!
        </div>
        <div class="lane-grid">
          ${options.map((option, index) => `
            <button class="lane-card ${index === safe ? "active" : ""}" data-cove="${index}">
              ${option}<br>${index === safe ? "Safe ripple" : "Croc shadow"}
            </button>
          `).join("")}
        </div>
      </section>
    `);
    document.querySelectorAll("[data-cove]").forEach((button) => {
      button.addEventListener("click", () => {
        const picked = Number(button.dataset.cove);
        if (picked === safe) renderPixieCove(dust, steps + 1, "Clean crossing. Dad keeps moving toward the ship.");
        else renderPixieCove(dust - 1, steps, "Splash. Not eaten, but deeply judged by a reptile.");
      });
    });
  }

  function renderPixieShip(dust) {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Captain's Ship</h1>
          <p class="subtitle">Three memory keys unlock the fairy cage.</p>
        </div>
        ${threeGameplayPanel("pixie", {
          mode: "ship",
          speaker: "Captain's Ship",
          caption: "The cage is on deck. Unlock it and face the captain."
        })}
        <div class="dialogue">
          <span class="speaker">Captain</span>
          Nobody rescues the little light from my ship.
          <br><br>
          <span class="speaker">Adam</span>
          Historically bad thing to say to Dad.
        </div>
        <div class="button-row">
          <button class="btn" id="unlockFairy">Unlock Cage</button>
        </div>
      </section>
    `);
    document.querySelector("#unlockFairy").addEventListener("click", () => renderPixieDuel(0, 3 + Math.max(0, dust)));
  }

  function renderPixieDuel(hits = 0, courage = 3, message = "Watch the captain's move and answer with the right action.") {
    if (hits >= 3) return renderPixieWin();
    if (courage <= 0) return renderPixieLoss("The captain knocks Dad back across the deck.");
    const moves = [
      { tell: "The captain swings the hook wide.", answer: "Duck", options: ["Duck", "Strike", "Jump"] },
      { tell: "The captain's coat catches on the rail.", answer: "Strike", options: ["Duck", "Strike", "Jump"] },
      { tell: "A rope sweeps across the deck.", answer: "Jump", options: ["Duck", "Strike", "Jump"] }
    ];
    const moveSet = moves[Math.floor(Math.random() * moves.length)];
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Deck Duel</h1>
          <p class="subtitle">Hits: ${hits}/3 | Courage: ${courage}</p>
        </div>
        ${threeGameplayPanel("pixie", {
          mode: "duel",
          result: message.startsWith("Wrong") ? "bad" : message.startsWith("That worked") ? "good" : "neutral",
          speaker: "Deck Duel",
          caption: message.startsWith("Wrong") ? "The captain knocks Dad back." : message.startsWith("That worked") ? "Dad wins the exchange and the cage glows." : "Read the captain's move and answer."
        })}
        <div class="dialogue">
          <span class="speaker">Captain</span>
          ${moveSet.tell}
          <br><br>
          <span class="speaker">Fairy</span>
          ${message}
        </div>
        <div class="button-row">
          ${moveSet.options.map((option) => `<button class="btn" data-pixie-duel="${option}">${option}</button>`).join("")}
        </div>
      </section>
    `);
    document.querySelectorAll("[data-pixie-duel]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.pixieDuel === moveSet.answer) renderPixieDuel(hits + 1, courage, "That worked. The cage glows brighter.");
        else renderPixieDuel(hits, courage - 1, "Wrong move. Adam: He did telegraph that pretty hard.");
      });
    });
  }

  function renderPixieLoss(message) {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Rescue Failed</h1>
          <p class="subtitle">The fairy waits. Dad can try again.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Narrator</span>
          ${message}
          <br><br>
          <span class="speaker">Hayleigh</span>
          Again Dada!
        </div>
        <div class="button-row">
          <button class="btn" id="retryPixie">Retry Rescue</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    document.querySelector("#retryPixie").addEventListener("click", () => renderPixieExplore());
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function renderPixieWin() {
    completeWorld("pixie");
    renderThreeStoryScene({
      theme: "pixie",
      title: "Pixieheart",
      subtitle: "The fairy is safe.",
      aria: "3D Pixie rescue victory",
      primaryLabel: "Return To Hub",
      lines: [
        { speaker: "Fairy", text: "You came for me." },
        { speaker: "Narrator", text: "Of course he did. That is what Dad does." },
        { speaker: "Hayleigh", text: "Dada!" }
      ],
      onPrimary: () => renderHub("Pixieheart Token earned."),
      onSecondary: () => renderHub()
    });
  }

  function renderFinale() {
    renderThreeStoryScene({
      theme: "finale",
      title: "The Real Treasure",
      subtitle: "Gearheart and Pixieheart glow together.",
      aria: "3D final treasure scene",
      primaryLabel: "Back To Hub",
      lines: [
        { speaker: "Adam", text: "You did it. Two worlds, zero excuses, and only a medium amount of chaos." },
        { speaker: "Adam", text: "The bike survived, Tinker Bell is safe, and Pops somehow made this look like a plan." },
        { speaker: "Adam", text: "I am still going to roast a few choices later, but for now... yeah. That was pretty heroic." },
        { speaker: "Hayleigh", text: "Dada!" },
        { speaker: "Adam & Hayleigh", text: "You have always been a hero to us." }
      ],
      onPrimary: () => renderHub(),
      onSecondary: () => renderHub()
    });
  }

  init();
})();
