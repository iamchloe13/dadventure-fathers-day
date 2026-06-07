(() => {
  "use strict";

  const SAVE_KEY = "dadventure-save-v1";
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
      id: "jedi",
      title: "The Light Side Trial",
      icon: "LS",
      token: "Starheart",
      summary: "A Jedi trial for the Dad who chooses the light."
    },
    {
      id: "creatures",
      title: "The Creature League",
      icon: "CL",
      token: "Teamheart",
      summary: "Catch Dad's Legendary Six and win the tournament."
    },
    {
      id: "guardian",
      title: "Guardian of the Home Light",
      icon: "AR",
      token: "Lightheart",
      summary: "A Hunter Arc mission against The Distance."
    },
    {
      id: "pixie",
      title: "The Pixie Rescue",
      icon: "PX",
      token: "Pixieheart",
      summary: "Rescue the fairy from the hook-handed troublemaker."
    },
    {
      id: "fishing",
      title: "The Deep Blue Fight",
      icon: "DB",
      token: "Tideheart",
      summary: "Battle the 228 lb swordfish from Marathon Key."
    }
  ];

  const motoTarget = {
    tires: 4,
    suspension: 3,
    gearing: 3,
    engine: 4,
    timing: 3
  };

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
  let actionLoop = null;
  let battle = null;

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
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function stopLoops() {
    if (raceLoop) cancelAnimationFrame(raceLoop);
    if (catchLoop) cancelAnimationFrame(catchLoop);
    if (actionLoop) cancelAnimationFrame(actionLoop);
    raceLoop = null;
    catchLoop = null;
    actionLoop = null;
  }

  function render(html) {
    stopLoops();
    app.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "instant" });
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
            <p class="subtitle">The Six Worlds of Father's Day</p>
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
          <p class="subtitle">${esc(state.playerName)}'s Six Worlds of Father's Day</p>
          <div class="token-row">
            ${worlds.map((world) => `<span class="token-pill ${state.completed[world.id] ? "earned" : ""}">${world.token}</span>`).join("")}
          </div>
        </div>
        ${message ? `<div class="dialogue"><span class="speaker">Heartspace</span>${message}</div>` : ""}
        <div class="portal-grid">
          ${worlds.map((world) => `
            <article class="portal-card ${state.completed[world.id] ? "complete" : ""}">
              <div class="portal-icon">${world.icon}</div>
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
          <p>${allDone ? "All six tokens are glowing. The final Father's Day ending is unlocked." : `${earned}/${worlds.length} tokens earned. Finish every world to open this door.`}</p>
          <button class="btn ${allDone ? "" : "secondary"}" id="finalDoor">${allDone ? "Open Final Door" : "Locked"}</button>
        </div>
      </section>
    `);

    document.querySelectorAll("[data-world]").forEach((button) => {
      button.addEventListener("click", () => openWorld(button.dataset.world));
    });
    document.querySelector("#finalDoor").addEventListener("click", () => {
      if (allDone) renderFinale();
    });
  }

  function openWorld(id) {
    if (id === "moto") renderMotoGarage();
    else if (id === "jedi") renderJediIntro();
    else if (id === "creatures") renderCreatureMap();
    else if (id === "guardian") renderGuardianIntro();
    else if (id === "fishing") renderFishingRig();
    else renderPlaceholder(id);
  }

  function renderPlaceholder(id) {
    const world = worlds.find((item) => item.id === id);
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">${world.title}</h1>
          <p class="subtitle">Playable version not built yet. This placeholder lets us wire the hub and test progression.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          This world is still under construction. I am choosing to believe that is intentional.
        </div>
        <div class="button-row">
          <button class="btn" id="completePlaceholder">Mark Complete For Testing</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    document.querySelector("#completePlaceholder").addEventListener("click", () => {
      completeWorld(id);
      renderHub(`${world.token} Token earned in placeholder mode.`);
    });
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function renderMotoGarage(message = "") {
    const tune = { ...motoTarget, ...(state.lastTune || {}) };
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">The Garage Track</h1>
          <p class="subtitle">Tune the bike, then beat the rival around a one-lap top-down track.</p>
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
      startMotoRace(current);
    });
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

  function startMotoRace(tune) {
    const attemptNo = state.motoAttempts + 1;
    const exact = exactTune(tune);
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
          <span class="speaker">Announcer</span>
          ${tune.timing === 3 ? "Clean start if you earn it." : "That timing sounds suspicious already."}
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
      finished: false
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

        if (section === "ramp" && !player.rampUsed) {
          player.airborne = 1.05;
          player.rampUsed = true;
          callout("Announcer", "Big ramp. This is where confidence meets paperwork.");
        }
        if (player.airborne > 0) player.airborne -= dt;

        player.p += player.speed * speedMultiplier * dt;
        player.heat += dt * (controls.gas ? 7 + tune.engine * 1.8 : 2);
        if (player.boost > 0) player.heat += dt * 16;
        if (player.heat > 100) triggerOverheat();
        document.querySelector("#raceStatus").textContent = sectionLabel(section);
      }

      rival.p += rival.speed * dt;
      document.querySelector("#heatStatus").textContent = `Heat ${Math.round(player.heat)}%`;
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
          playerState.heat += 12;
          callout("Announcer", "Dad Flip! Clean enough to pretend it was planned.");
        } else if (timing > 0.16) {
          playerState.boost = 0.68;
          playerState.heat += 10;
          callout("Announcer", "Questionable Decision! Somehow, still moving.");
        } else {
          playerState.speed *= 0.35;
          callout("Announcer", "That landing went over like a fart in church!<br><br><span class='speaker'>Adam</span>I respect the confidence. Not the landing.");
        }
        playerState.airborne = 0;
      } else {
        playerState.boost = 0.72;
        playerState.heat += 18;
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
    if (p < 0.25) return "mud";
    if (p < 0.43) return "bumps";
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
      tires: "You're trying to ride through mud like it's a freshly paved driveway. Try more tire grip, Dad.",
      suspension: "That landing looked like the bike filed a complaint. Suspension needs work.",
      gearing: "You're either launching hard and running out of breath, or waiting three business days to accelerate. Check the gearing.",
      engine: "The engine is fast, yeah. It's also trying to become fireworks. Maybe adjust the mix.",
      timing: "Start gate timing, Dad. Right now the bike is thinking about it before leaving."
    };
    return `<br><br>${advice[wrong]}`;
  }

  function callout(speaker, text) {
    const box = document.querySelector("#raceCallout");
    if (box) box.innerHTML = `<span class="speaker">${speaker}</span>${text}`;
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
          But seriously, Dad. A lot of who I am comes from watching you keep going.
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
    drawTrack(canvas, false);
    drawBike(ctx, canvas, rival.p % 1, -0.18, "#202b37", "R");
    drawBike(ctx, canvas, player.p % 1, player.lane * 0.26, "#f76d57", "D");
  }

  function drawBike(ctx, canvas, progress, lane, color, label) {
    const base = trackPoint(progress, canvas.width, canvas.height);
    const ahead = trackPoint((progress + 0.003) % 1, canvas.width, canvas.height);
    const angle = Math.atan2(ahead.y - base.y, ahead.x - base.x);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    ctx.save();
    ctx.translate(base.x + nx * lane * 120, base.y + ny * lane * 120);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = "#fff7e1";
    ctx.lineWidth = 4;
    ctx.fillRect(-20, -13, 40, 26);
    ctx.strokeRect(-20, -13, 40, 26);
    ctx.fillStyle = "#fff7e1";
    ctx.font = "bold 18px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 1);
    ctx.restore();
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

  function renderCreatureMap(message = "") {
    const caught = state.creature.caught;
    const allCaught = creatures.every((creature) => caught.includes(creature.id));
    render(`
      <section class="screen game-screen">
        <div class="hero-card">
          <h1 class="title">Creature League</h1>
          <p class="subtitle">Catch Dad's Legendary Six, then enter the tournament.</p>
        </div>
        ${message ? `<div class="dialogue">${message}</div>` : ""}
        <div class="creature-map">
          <div class="map-stage" id="mapStage">
            <div class="map-dad" style="left:${state.creature.dadX}%;top:${state.creature.dadY}%;">Dad</div>
            ${creatures.map((creature) => `
              <button class="map-creature ${caught.includes(creature.id) ? "caught" : ""}" data-creature="${creature.id}" style="left:${creature.x}%;top:${creature.y}%;background:${creature.color};">
                ${creature.name.slice(0, 2)}
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
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Teamheart</h1>
          <p class="subtitle">Dad's Legendary Six won the Creature League.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          That was a weird team.
          <br><br>
          A tiny cuddle monster, a garage fox, two dogs with weather issues, a sleepy tank, and a lion that looked personally offended by everything.
          <br><br>
          But they won.
          <br><br>
          Not because they were the same. Because each one brought something nobody else could.
          <br><br>
          <span class="speaker">Hayleigh</span>
          Team!
          <br><br>
          <span class="speaker">Adam</span>
          Yeah. Team.
          <br><br>
          That's kind of us, isn't it?
          <br><br>
          No matter what shows up across from you, you don't fight alone.
        </div>
        <button class="btn" id="hubAfterCreature">Teamheart Token Earned</button>
      </section>
    `);
    document.querySelector("#hubAfterCreature").addEventListener("click", () => renderHub("Teamheart Token earned."));
  }

  function renderJediIntro() {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">The Light Side Trial</h1>
          <p class="subtitle">Dodge the asteroid field, block the incoming fire, choose the light, and win the duel.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          Congratulations, Dad. You have been promoted to Jedi because apparently the galaxy is short-staffed.
          <br><br>
          <span class="speaker">Hayleigh</span>
          Dada go!
        </div>
        <div class="button-row">
          <button class="btn" id="startJedi">Begin Trial</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    document.querySelector("#startJedi").addEventListener("click", () => renderJediAsteroids());
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  function renderJediAsteroids(score = 0, hp = 3, wave = 1, message = "Drag the ship through the safe lane. In this prototype, choose the lane that is not glowing red.") {
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
    if (hp <= 0) return renderJediLoss("The shadow wins the duel. Dad can retry from the trial start.");
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
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Starheart</h1>
          <p class="subtitle">The Light Side Trial is complete.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          Not bad, Dad. You defeated a shadow, dodged space rocks, and only looked confused a normal amount.
          <br><br>
          <span class="speaker">Hayleigh</span>
          Dada light!
          <br><br>
          <span class="speaker">Narrator</span>
          The saber fades, but the light stays.
          <br><br>
          Some heroes win by being powerful. Dad wins because he keeps choosing what matters.
          <br><br>
          Starheart Token unlocked.
        </div>
        <button class="btn" id="hubAfterJedi">Return To Hub</button>
      </section>
    `);
    document.querySelector("#hubAfterJedi").addEventListener("click", () => renderHub(`Starheart Token earned. Saber charge: ${charge}/3.`));
  }

  function renderGuardianIntro() {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Guardian of the Home Light</h1>
          <p class="subtitle">Hunter. Arc subclass. Fireteam: Adam and Hayleigh.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Little Light</span>
          Guardian ${esc(state.playerName)}, the Home Light is fading. The Distance is trying to make the road feel longer than love.
          <br><br>
          Recover five light fragments, charge Arc Burst, and bring the fireteam home.
        </div>
        <div class="button-row">
          <button class="btn" id="startGuardian">Start Mission</button>
          <button class="btn secondary" id="backHub">Back To Hub</button>
        </div>
      </section>
    `);
    document.querySelector("#startGuardian").addEventListener("click", () => renderGuardianMission());
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
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
      mission.log = "The Distance steps into the light. Boss fight.";
    }
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">${mission.boss ? "The Distance" : "Arc Patrol"}</h1>
          <p class="subtitle">Fragments: ${mission.fragments}/5 | Arc Burst: ${mission.superCharge}%</p>
        </div>
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
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Lightheart</h1>
          <p class="subtitle">The Home Light is restored.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Little Light</span>
          The Distance is gone.
          <br><br>
          <span class="speaker">Adam</span>
          Your fireteam is still here, Dad. Even when work pulls you out of town.
          <br><br>
          <span class="speaker">Narrator</span>
          Some missions take Guardian far from home. This light always knows the way back.
          <br><br>
          Lightheart Token unlocked.
        </div>
        <button class="btn" id="hubAfterGuardian">Return To Hub</button>
      </section>
    `);
    document.querySelector("#hubAfterGuardian").addEventListener("click", () => renderHub("Lightheart Token earned."));
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

  function renderFishingHook(rig, signal = "The rod tip is quiet.", misses = 0) {
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
    if (fight.dadStamina <= 0) return renderFishingLoss("Dad runs out of stamina. The fish pulls away before boat side.");
    if (fight.fishStamina <= 0 || fight.progress >= 100) return renderFishingLand();

    const phase = fight.progress > 72 ? "Boat Side" : fight.progress > 34 ? "The Grind" : "The Run";
    fight.phase = phase;
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">${phase}</h1>
          <p class="subtitle">228 lb Swordfish | Marathon Key, Florida</p>
        </div>
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
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">Tideheart</h1>
          <p class="subtitle">228 lb Swordfish Landed | Marathon Key, Florida</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          I still remember that trip.
          <br><br>
          Not just the fish. The boat. The waiting. Watching you fight something bigger than both of us expected.
          <br><br>
          And you did not let go.
          <br><br>
          <span class="speaker">Narrator</span>
          Some memories are measured in pounds. Some are measured in hours.
          <br><br>
          The best ones are measured by who was standing beside you.
          <br><br>
          Tideheart Token unlocked.
        </div>
        <button class="btn" id="hubAfterFishing">Return To Hub</button>
      </section>
    `);
    document.querySelector("#hubAfterFishing").addEventListener("click", () => renderHub("Tideheart Token earned."));
  }

  function renderFinale() {
    render(`
      <section class="screen">
        <div class="hero-card">
          <h1 class="title">The Real Treasure</h1>
          <p class="subtitle">Final letter placeholder. We will write this when you are ready.</p>
        </div>
        <div class="dialogue">
          <span class="speaker">Adam</span>
          You did it.
          <br><br>
          <span class="speaker">Hayleigh</span>
          Dada!
          <br><br>
          <span class="speaker">Narrator</span>
          The six worlds glow together. The final message is waiting to be written.
        </div>
        <button class="btn" id="backHub">Back To Hub</button>
      </section>
    `);
    document.querySelector("#backHub").addEventListener("click", () => renderHub());
  }

  init();
})();
