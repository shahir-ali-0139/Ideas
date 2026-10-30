
// ---------------------------------------------
// Vanilla JS Ludo (2-4 local players)
// ---------------------------------------------

const BOARD_SIZE = 15;
const DICE_PIP_LAYOUTS = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9]
};
const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const TURN_DICE_CLASSES = ["turn-red", "turn-green", "turn-yellow", "turn-blue"];
const TOKEN_STEP_MS = 180;

const TRACK = [
  { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
  { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 },
  { r: 0, c: 6 }, { r: 0, c: 7 }, { r: 0, c: 8 }, { r: 1, c: 8 }, { r: 2, c: 8 },
  { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 }, { r: 6, c: 9 }, { r: 6, c: 10 },
  { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 }, { r: 7, c: 14 },
  { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 },
  { r: 8, c: 9 }, { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 },
  { r: 13, c: 8 }, { r: 14, c: 8 }, { r: 14, c: 7 }, { r: 14, c: 6 }, { r: 13, c: 6 },
  { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 }, { r: 8, c: 5 },
  { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
  { r: 7, c: 0 }, { r: 6, c: 0 }
];

const COLORS = [
  {
    id: "red",
    name: "Red",
    hex: "#ef4444",
    startIndex: 0,
    baseSlots: [{ r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 }],
    tokenBaseSlots: [{ r: 1.5, c: 1.5 }, { r: 1.5, c: 3.5 }, { r: 3.5, c: 1.5 }, { r: 3.5, c: 3.5 }],
    yard: { r1: 1, r2: 4, c1: 1, c2: 4 },
    homePath: [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 7 }]
  },
  {
    id: "green",
    name: "Green",
    hex: "#22c55e",
    startIndex: 13,
    baseSlots: [{ r: 2, c: 11 }, { r: 2, c: 12 }, { r: 3, c: 11 }, { r: 3, c: 12 }],
    tokenBaseSlots: [{ r: 1.5, c: 10.5 }, { r: 1.5, c: 12.5 }, { r: 3.5, c: 10.5 }, { r: 3.5, c: 12.5 }],
    yard: { r1: 1, r2: 4, c1: 10, c2: 13 },
    homePath: [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 7, c: 7 }]
  },
  {
    id: "yellow",
    name: "Yellow",
    hex: "#facc15",
    startIndex: 26,
    baseSlots: [{ r: 11, c: 11 }, { r: 11, c: 12 }, { r: 12, c: 11 }, { r: 12, c: 12 }],
    tokenBaseSlots: [{ r: 10.5, c: 10.5 }, { r: 10.5, c: 12.5 }, { r: 12.5, c: 10.5 }, { r: 12.5, c: 12.5 }],
    yard: { r1: 10, r2: 13, c1: 10, c2: 13 },
    homePath: [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }, { r: 7, c: 7 }]
  },
  {
    id: "blue",
    name: "Blue",
    hex: "#3b82f6",
    startIndex: 39,
    baseSlots: [{ r: 11, c: 2 }, { r: 11, c: 3 }, { r: 12, c: 2 }, { r: 12, c: 3 }],
    tokenBaseSlots: [{ r: 10.5, c: 1.5 }, { r: 10.5, c: 3.5 }, { r: 12.5, c: 1.5 }, { r: 12.5, c: 3.5 }],
    yard: { r1: 10, r2: 13, c1: 1, c2: 4 },
    homePath: [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }, { r: 7, c: 7 }]
  }
];

const TRACK_INDEX_BY_KEY = new Map(TRACK.map((p, i) => [`${p.r},${p.c}`, i]));

const boardEl = document.getElementById("board");
const tokensLayerEl = document.getElementById("tokens-layer");
const boardCellsByKey = new Map();
const diceEl = document.getElementById("dice");
const scoreboardEl = document.getElementById("scoreboard");
const playerCountEl = document.getElementById("player-count");
const restartGameEl = document.getElementById("restart-game");
const startToggleEl = document.getElementById("start-toggle");
const winnerModalEl = document.getElementById("winner-modal");
const winnerTextEl = document.getElementById("winner-text");
const playAgainEl = document.getElementById("play-again");
const colorSettingsPanel = document.getElementById("color-settings-panel");
const playerSettingsPanel = document.getElementById("player-settings-panel");
const customDrawerInstances = new Map();

const state = {
  activePlayers: [],
  playerCount: 4,
  consecutiveSixes: 0,
  currentTurn: 0,
  diceValue: null,
  awaitingTokenChoice: false,
  validTokenIds: new Set(),
  rolling: false,
  gameOver: false,
  gameStarted: false,
  selectionLocked: false,
  paused: false,
  tokenElements: new Map(),
  robotTimer: null,
  playerTypes: {
    red: "human",
    green: "human",
    yellow: "human",
    blue: "human"
  },
  scores: {
    red: 0,
    green: 0,
    yellow: 0,
    blue: 0
  }
};

let audioCtx;

// ---------- Utility ----------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForGameResume() {
  while (state.paused && !state.gameOver) {
    await sleep(80);
  }
}

async function sleepRespectingPause(ms) {
  let remaining = ms;
  while (remaining > 0) {
    await waitForGameResume();
    const chunk = Math.min(remaining, 40);
    await sleep(chunk);
    remaining -= chunk;
  }
}

function posKey(p) {
  return `${p.r},${p.c}`;
}

function randomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function getActiveColorConfigs(count = state.playerCount) {
  if (count === 2) {
    // Automatically select Cage 2 (Green) and Cage 4 (Blue) for 2 Players
    return ["green", "blue"]
      .map((id) => COLORS.find((c) => c.id === id))
      .filter(Boolean);
  }

  return COLORS.slice(0, count);
}

function getEnabledColorIds(count = state.playerCount) {
  return getActiveColorConfigs(count).map((c) => c.id);
}

function closeDrawerSelectById(selectId) {
  const instance = customDrawerInstances.get(selectId);
  if (!instance) return;

  instance.wrapperEl.classList.remove("open");
  instance.toggleEl.setAttribute("aria-expanded", "false");
}

function closeAllDrawerSelects(exceptId = "") {
  for (const selectId of customDrawerInstances.keys()) {
    if (selectId === exceptId) continue;
    closeDrawerSelectById(selectId);
  }
}

function syncDrawerSelectUI(selectEl) {
  if (!selectEl) return;

  const instance = customDrawerInstances.get(selectEl.id);
  if (!instance) return;

  const selectedOption = [...selectEl.options].find((option) => option.value === selectEl.value) || selectEl.options[0];
  instance.valueEl.textContent = selectedOption ? selectedOption.textContent : "Select";
  instance.toggleEl.disabled = !!selectEl.disabled;

  for (const optionEl of instance.optionEls) {
    const isSelected = optionEl.dataset.value === selectEl.value;
    optionEl.classList.toggle("selected", isSelected);
    optionEl.setAttribute("aria-selected", isSelected ? "true" : "false");
  }
}

function setupCustomDrawerSelect(selectEl) {
  if (!selectEl) return;

  const wrapperEl = document.querySelector(`.drawer-select[data-target-select="${selectEl.id}"]`);
  if (!wrapperEl) return;

  const toggleEl = wrapperEl.querySelector(".drawer-toggle");
  const valueEl = wrapperEl.querySelector(".drawer-value");
  const optionEls = [...wrapperEl.querySelectorAll(".drawer-option")];
  if (!toggleEl || !valueEl || !optionEls.length) return;

  customDrawerInstances.set(selectEl.id, {
    wrapperEl,
    toggleEl,
    valueEl,
    optionEls,
    selectEl
  });

  syncDrawerSelectUI(selectEl);

  toggleEl.addEventListener("click", () => {
    if (toggleEl.disabled) return;
    const willOpen = !wrapperEl.classList.contains("open");
    closeAllDrawerSelects(willOpen ? selectEl.id : "");
    wrapperEl.classList.toggle("open", willOpen);
    toggleEl.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });

  for (const optionEl of optionEls) {
    optionEl.addEventListener("click", () => {
      const nextValue = optionEl.dataset.value;
      if (!nextValue) return;

      const changed = selectEl.value !== nextValue;
      selectEl.value = nextValue;
      syncDrawerSelectUI(selectEl);
      closeDrawerSelectById(selectEl.id);

      if (changed) {
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  selectEl.addEventListener("change", () => syncDrawerSelectUI(selectEl));
}

function setupCustomDrawers() {
  setupCustomDrawerSelect(playerCountEl);

  document.addEventListener("click", (e) => {
    if (e.target.closest(".drawer-select")) return;
    closeAllDrawerSelects();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDrawerSelects();
    }
  });
}

function getBaseSlotClassByCell(r, c) {
  for (const cfg of COLORS) {
    const has = cfg.baseSlots.some((p) => p.r === r && p.c === c);
    if (has) return `base-slot base-slot-${cfg.id}`;
  }
  return "";
}

function getYardClassByCell(r, c) {
  for (const cfg of COLORS) {
    const y = cfg.yard;
    if (r >= y.r1 && r <= y.r2 && c >= y.c1 && c <= y.c2) {
      const classes = ["yard", `yard-${cfg.id}`];
      if (r === y.r1 && c === y.c1) classes.push("yard-tl");
      if (r === y.r1 && c === y.c2) classes.push("yard-tr");
      if (r === y.r2 && c === y.c1) classes.push("yard-bl");
      if (r === y.r2 && c === y.c2) classes.push("yard-br");
      return classes.join(" ");
    }
  }
  return "";
}

function normalizePlayerTypesForCount() {
  const enabled = new Set(getEnabledColorIds());
  for (const cfg of COLORS) {
    if (!enabled.has(cfg.id)) {
      state.playerTypes[cfg.id] = "human";
    }
  }
}

function togglePlayerType(colorId) {
  if (state.selectionLocked || state.gameStarted) {
    console.warn("Blocked: Game already started");
    return;
  }
  const enabled = new Set(getEnabledColorIds());
  if (!enabled.has(colorId)) return;

  state.playerTypes[colorId] = state.playerTypes[colorId] === "robot" ? "human" : "robot";
  updateScoreboard();
  updateRollControls();

  if (state.gameOver) return;
  if (isRobotTurn() && !state.rolling && !state.awaitingTokenChoice) {
    scheduleRobotTurn();
  } else {
    clearRobotTimer();
    state.selectionLocked = false;
    document.body.classList.remove('locked');
  }
}

function updateScoreboard() {
  const enabled = new Set(getEnabledColorIds());
  scoreboardEl.innerHTML = "";

  for (const cfg of COLORS) {
    const active = enabled.has(cfg.id);
    const type = state.playerTypes[cfg.id] || "human";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `mode-chip mode-${cfg.id} ${type === "robot" ? "is-robot" : "is-human"}`;
    btn.dataset.color = cfg.id;
    btn.disabled = !active;
    btn.innerHTML = active ? (type === "robot"
        ? `<svg viewBox="0 0 64 64"><rect x="12" y="20" width="40" height="28" rx="6" fill="currentColor"/><circle cx="24" cy="34" r="4"/><circle cx="40" cy="34" r="4"/><rect x="26" y="10" width="12" height="6" fill="currentColor"/></svg>`
        : `<svg viewBox="0 0 64 64"><circle cx="32" cy="18" r="10" fill="currentColor"/><rect x="16" y="30" width="32" height="20" rx="10" fill="currentColor"/></svg>`)
        : "×";
    btn.title = `${cfg.name}: ${active ? (type === "robot" ? "Robot" : "Human") : "Off"}`;
    btn.setAttribute("aria-label", btn.title);
    scoreboardEl.appendChild(btn);
  }
}

function clearRobotTimer() {
  if (state.robotTimer) {
    clearTimeout(state.robotTimer);
    state.robotTimer = null;
  }
}

function isRobotTurn() {
  const player = state.activePlayers[state.currentTurn];
  return !!player && state.playerTypes[player.id] === "robot";
}

function scheduleRobotTurn() {
  clearRobotTimer();
  state.selectionLocked = false;
  document.body.classList.remove('locked');
  if (state.gameOver || !state.gameStarted || state.paused || !isRobotTurn()) return;

  state.robotTimer = setTimeout(async () => {
    if (state.gameOver || !isRobotTurn()) return;
    await rollDice("robot");
    if (state.awaitingTokenChoice && isRobotTurn()) {
      await runRobotMove();
    }
  }, 500 + Math.floor(Math.random() * 400));
}

function updateStartToggleButton() {
  if (!startToggleEl) return;

  if (!state.gameStarted) {
    startToggleEl.textContent = "Start";
    startToggleEl.title = "Start game";
    startToggleEl.disabled = false;
    return;
  }

  startToggleEl.textContent = state.paused ? "Resume" : "Pause";
  startToggleEl.title = state.paused ? "Resume game" : "Pause game";
  startToggleEl.disabled = state.gameOver;
}

function resumeGameFlowIfNeeded() {
  if (!state.gameStarted || state.paused || state.gameOver || !isRobotTurn()) return;

  clearRobotTimer();
  state.selectionLocked = false;
  document.body.classList.remove('locked');
  if (state.awaitingTokenChoice) {
    state.robotTimer = setTimeout(() => {
      if (!state.gameStarted || state.paused || state.gameOver || !isRobotTurn()) return;
      runRobotMove();
    }, 280);
  } else {
    scheduleRobotTurn();
  }
}

function toggleStartPause() {
  requestFullscreenSafe();
  if (state.gameOver) return;

  if (!state.gameStarted) {
    // ---- LOCK CONFIGURATION PANELS ----
    colorSettingsPanel?.classList.add('is-locked');
    playerSettingsPanel?.classList.add('is-locked');
    scoreboardEl?.classList.add('is-locked'); // Lock the mode chips
    
    // Explicitly disable inputs as a fallback
    document.querySelectorAll('.color-inputs input').forEach(i => i.disabled = true);
    const resetBtn = document.getElementById("reset-colors");
    if (resetBtn) resetBtn.disabled = true;
    if (playerCountEl) {
      playerCountEl.disabled = true;
      syncDrawerSelectUI(playerCountEl);
    }
    // ------------------------------------

    state.gameStarted = true;
    state.selectionLocked = true;
    document.body.classList.add('locked');
    state.paused = false;
    updateStartToggleButton();
    updateRollControls();
    resumeGameFlowIfNeeded();
    return;
  }

  state.paused = !state.paused;
  if (state.paused) {
    clearRobotTimer();
    state.selectionLocked = false;
    document.body.classList.remove('locked');
  }

  updateStartToggleButton();
  updateRollControls();
  if (!state.paused) {
    resumeGameFlowIfNeeded();
  }
}

// ---------- Game Setup ----------
function createPlayers(count) {
  return getActiveColorConfigs(count).map((cfg) => ({
    ...cfg,
    tokens: Array.from({ length: 4 }, (_, i) => ({
      id: `${cfg.id}-${i}`,
      index: i,
      steps: -1
    }))
  }));
}

function initGame(count = 4, resetScores = false) {
  // ---- UNLOCK CONFIGURATION PANELS ----
  colorSettingsPanel?.classList.remove('is-locked');
  playerSettingsPanel?.classList.remove('is-locked');
  scoreboardEl?.classList.remove('is-locked'); // Unlock the mode chips

  document.querySelectorAll('.color-inputs input').forEach(i => i.disabled = false);
  const resetBtn = document.getElementById("reset-colors");
  if (resetBtn) resetBtn.disabled = false;
  if (playerCountEl) {
    playerCountEl.disabled = false;
    syncDrawerSelectUI(playerCountEl);
  }
  // --------------------------------------

  clearRobotTimer();
  state.selectionLocked = false;
  document.body.classList.remove('locked');
  state.playerCount = count;
  if (playerCountEl) {
    playerCountEl.value = String(count);
    syncDrawerSelectUI(playerCountEl);
  }
  
  state.activePlayers = createPlayers(count);
  state.consecutiveSixes = 0;
  state.currentTurn = 0;
  state.diceValue = null;
  state.awaitingTokenChoice = false;
  state.validTokenIds = new Set();
  state.rolling = false;
  state.gameOver = false;
  state.gameStarted = false;
  state.paused = false;

  if (resetScores) {
    state.scores = { red: 0, green: 0, yellow: 0, blue: 0 };
  }

  winnerModalEl.classList.add("hidden");
  normalizePlayerTypesForCount();

  buildBoard();
  createTokenElements();
  updateScoreboard();
  updateTurnIndicator();
  updateStartToggleButton();
  setDiceFace(1);
  updateRollControls();
  applyPlayerCountVisuals(); // New function call
  renderTokens();
}

function applyPlayerCountVisuals() {
  const enabledColors = getEnabledColorIds(state.playerCount);
  const colorInputLabels = document.querySelectorAll(".color-customizer .color-label");

  COLORS.forEach((colorConfig) => {
    const isActive = enabledColors.includes(colorConfig.id);
    const baseClass = `base-${colorConfig.id}`;
    const colorInputLabel = document.getElementById(`color-${colorConfig.id}-text`)?.closest(".color-label");

    // Update board cage colors
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = boardCellsByKey.get(`${r},${c}`);
        if (cell && cell.classList.contains(baseClass)) {
          cell.classList.toggle("base-inactive", !isActive);
        }
      }
    }

    // Hide/show color input options
    if (colorInputLabel) {
      colorInputLabel.classList.toggle("hidden-color-input", !isActive);
    }
  });
}

function getTrackIndexForSteps(player, steps) {
  if (steps < 0 || steps > 50) return null;
  return (player.startIndex + steps) % 52;
}

function countCapturableOpponentsAtIndex(activePlayer, trackIndex) {
  if (trackIndex === null || SAFE_INDICES.has(trackIndex)) return 0;

  let captured = 0;
  for (const opponent of state.activePlayers) {
    if (opponent.id === activePlayer.id) continue;

    for (const token of opponent.tokens) {
      const oppIndex = getTrackIndexForSteps(opponent, token.steps);
      if (oppIndex === trackIndex) {
        captured += 1;
      }
    }
  }

  return captured;
}

function countThreatsAtTrackIndex(activePlayer, trackIndex) {
  if (trackIndex === null || SAFE_INDICES.has(trackIndex)) return 0;

  let threats = 0;
  for (const opponent of state.activePlayers) {
    if (opponent.id === activePlayer.id) continue;

    for (const token of opponent.tokens) {
      const oppIndex = getTrackIndexForSteps(opponent, token.steps);
      if (oppIndex === null) continue;

      const distance = (trackIndex - oppIndex + 52) % 52;
      if (distance >= 1 && distance <= 6) {
        threats += 1;
      }
    }
  }

  return threats;
}

function getFriendlyStackCountAtIndex(activePlayer, trackIndex, occupancy) {
  if (trackIndex === null) return 0;
  const byColor = occupancy.get(trackIndex);
  if (!byColor) return 0;
  return byColor.get(activePlayer.id) || 0;
}

function chooseRobotToken(player, movableTokens) {
  const occupancy = getTrackOccupancy();
  let bestScore = -Infinity;
  let bestTokens = [];

  for (const token of movableTokens) {
    const fromSteps = token.steps;
    const toSteps = fromSteps === -1 ? 0 : fromSteps + state.diceValue;

    const currentIdx = getTrackIndexForSteps(player, fromSteps);
    const landingIdx = getTrackIndexForSteps(player, toSteps);
    const currentThreats = countThreatsAtTrackIndex(player, currentIdx);
    const landingThreats = countThreatsAtTrackIndex(player, landingIdx);
    const captures = countCapturableOpponentsAtIndex(player, landingIdx);
    const friendlyStackAtLanding = getFriendlyStackCountAtIndex(player, landingIdx, occupancy);

    let score = 0;

    if (toSteps === 56) {
      score += 2500;
    } else if (toSteps >= 51) {
      score += 1000 + toSteps * 18;
      if (fromSteps <= 50) {
        score += 350;
      }
    }

    score += Math.max(0, toSteps) * 14;

    if (fromSteps === -1) {
      score += 220;
    }

    if (captures > 0) {
      score += captures * 1250;
    }

    if (landingIdx !== null && SAFE_INDICES.has(landingIdx)) {
      score += 180;
    }

    if (currentThreats > 0) {
      if (toSteps >= 51) {
        score += 420;
      } else if (landingIdx !== null && SAFE_INDICES.has(landingIdx)) {
        score += 320;
      } else if (landingThreats < currentThreats) {
        score += 220 + (currentThreats - landingThreats) * 60;
      }
    }

    if (landingIdx !== null && !SAFE_INDICES.has(landingIdx)) {
      score -= landingThreats * 135;
    }

    if (landingIdx !== null && friendlyStackAtLanding >= 1) {
      score += 120 + friendlyStackAtLanding * 25;
    }

    if (
      currentIdx !== null &&
      SAFE_INDICES.has(currentIdx) &&
      landingIdx !== null &&
      !SAFE_INDICES.has(landingIdx) &&
      captures === 0 &&
      toSteps < 51
    ) {
      score -= 120;
    }

    if (score > bestScore) {
      bestScore = score;
      bestTokens = [token];
    } else if (score === bestScore) {
      bestTokens.push(token);
    }
  }

  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return pickRandom(bestTokens.length ? bestTokens : movableTokens);
}

async function runRobotMove() {
  if (!state.awaitingTokenChoice || state.gameOver || !state.gameStarted || state.paused || !isRobotTurn()) return;

  const player = state.activePlayers[state.currentTurn];
  const movable = player.tokens.filter((t) => state.validTokenIds.has(t.id));
  if (!movable.length) {
    state.awaitingTokenChoice = false;
    state.validTokenIds.clear();
    updateRollControls();
    scheduleRobotTurn();
    return;
  }

  const choice = chooseRobotToken(player, movable);
  await sleep(320);
  await onTokenClick(player.id, choice.id, true);
}

// ---------- Sound ----------
function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
}

function beep(frequency = 440, duration = 0.08, type = "sine", gain = 0.05) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playDiceSound() {
  ensureAudio();
  beep(520, 0.05, "triangle", 0.05);
  setTimeout(() => beep(380, 0.06, "triangle", 0.05), 60);
}

function playDiceShuffleTickSound(step = 0) {
  ensureAudio();
  const freq = 250 + (step % 5) * 28;
  beep(freq, 0.022, "square", 0.018);
}

function playSixSound() {
  ensureAudio();
  beep(720, 0.07, "triangle", 0.06);
  setTimeout(() => beep(920, 0.08, "triangle", 0.06), 80);
}

function playCaptureSound() {
  ensureAudio();
  beep(220, 0.07, "sawtooth", 0.065);
  setTimeout(() => beep(180, 0.08, "sawtooth", 0.055), 70);
}

function playGoalSound() {
  ensureAudio();
  beep(540, 0.06, "sine", 0.06);
  setTimeout(() => beep(760, 0.08, "sine", 0.06), 75);
  setTimeout(() => beep(980, 0.09, "sine", 0.06), 165);
}

function playSafeStopSound() {
  ensureAudio();
  beep(460, 0.05, "triangle", 0.045);
  setTimeout(() => beep(560, 0.06, "triangle", 0.045), 60);
}

function playMoveSound() {
  ensureAudio();
  beep(660, 0.05, "square", 0.04);
}

function playWinSound() {
  ensureAudio();
  beep(600, 0.08, "sine", 0.06);
  setTimeout(() => beep(800, 0.1, "sine", 0.06), 90);
  setTimeout(() => beep(1000, 0.12, "sine", 0.06), 200);
}

// ---------- Board ----------
function isInRect(r, c, r1, r2, c1, c2) {
  return r >= r1 && r <= r2 && c >= c1 && c <= c2;
}

function getHomeClassByCell(r, c) {
  for (const cfg of COLORS) {
    for (let i = 0; i < cfg.homePath.length - 1; i++) {
      const p = cfg.homePath[i];
      if (p.r === r && p.c === c) return `home-${cfg.id}`;
    }
  }
  return "";
}

function getStartClassByCell(r, c) {
  for (const cfg of COLORS) {
    const s = TRACK[cfg.startIndex];
    if (s.r === r && s.c === c) return `start-${cfg.id}`;
  }
  return "";
}

function buildBoard() {
  boardEl.innerHTML = "";
  boardCellsByKey.clear();

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);

      if (isInRect(r, c, 0, 5, 0, 5)) cell.classList.add("base-red");
      if (isInRect(r, c, 0, 5, 9, 14)) cell.classList.add("base-green");
      if (isInRect(r, c, 9, 14, 9, 14)) cell.classList.add("base-yellow");
      if (isInRect(r, c, 9, 14, 0, 5)) cell.classList.add("base-blue");

      if ((r >= 6 && r <= 8) || (c >= 6 && c <= 8)) {
        cell.classList.add("cross");
      }

      const yardClass = getYardClassByCell(r, c);
      if (yardClass) cell.classList.add(...yardClass.split(" "));

      const baseSlotClass = getBaseSlotClassByCell(r, c);
      if (baseSlotClass) cell.classList.add(...baseSlotClass.split(" "));

      const key = `${r},${c}`;
      if (TRACK_INDEX_BY_KEY.has(key)) {
        const idx = TRACK_INDEX_BY_KEY.get(key);
        cell.classList.add("track");
        if (SAFE_INDICES.has(idx)) cell.classList.add("safe");
      }

      const homeClass = getHomeClassByCell(r, c);
      if (homeClass) cell.classList.add(homeClass);

      const startClass = getStartClassByCell(r, c);
      if (startClass) cell.classList.add(startClass);

      if (r === 7 && c === 7) {
        cell.classList.add("center");
      }

      boardEl.appendChild(cell);
      boardCellsByKey.set(key, cell);
    }
  }
}

function createTokenElements() {
  tokensLayerEl.innerHTML = "";
  state.tokenElements.clear();
}

// ---------- Rendering ----------
function setDiceFace(value) {
  const activePips = new Set(DICE_PIP_LAYOUTS[value] || DICE_PIP_LAYOUTS[1]);
  diceEl.innerHTML = Array.from({ length: 9 }, (_, i) => {
    const slot = i + 1;
    return `<span class="dice-pip-slot">${activePips.has(slot) ? '<span class="dice-pip"></span>' : ""}</span>`;
  }).join("");
}

function updateTurnIndicator() {
  const player = state.activePlayers[state.currentTurn];
  updateDiceTurnStyle(player.id);
}

function updateDiceTurnStyle(playerId) {
  diceEl.classList.remove(...TURN_DICE_CLASSES);
  diceEl.classList.add(`turn-${playerId}`);
}

function getTokenBoardPosition(player, token) {
  if (token.steps === -1) {
    return player.baseSlots[token.index];
  }

  if (token.steps <= 50) {
    const idx = (player.startIndex + token.steps) % 52;
    return TRACK[idx];
  }

  return player.homePath[token.steps - 51];
}

function clearTokenCellStyles() {
  for (const cell of boardCellsByKey.values()) {
    cell.classList.remove(
      "token-spot",
      "token-spot-red",
      "token-spot-green",
      "token-spot-yellow",
      "token-spot-blue",
      "token-stack",
      "token-mixed",
      "token-selectable"
    );
    cell.style.removeProperty("--token-mix");
    cell.removeAttribute("data-token-count");

    for (const node of cell.querySelectorAll(".token-label")) {
      node.remove();
    }
  }
}

function buildTokenMixGradient(colorIds) {
  const unique = [...new Set(colorIds)];
  if (unique.length <= 1) return "";

  const step = 100 / unique.length;
  const stops = unique
    .map((id, i) => {
      const from = i * step;
      const to = (i + 1) * step;
      return `var(--${id}) ${from}% ${to}%`;
    })
    .join(", ");

  return `linear-gradient(135deg, ${stops})`;
}

function getCellTokenOccupancy() {
  const occupancy = new Map();

  for (const player of state.activePlayers) {
    for (const token of player.tokens) {
      const p = getTokenBoardPosition(player, token);
      const key = posKey(p);
      if (!occupancy.has(key)) occupancy.set(key, []);
      occupancy.get(key).push({ player, token });
    }
  }

  return occupancy;
}

function getSelectableTokensAtKey(player, cellKey) {
  return player.tokens.filter((token) => {
    if (!state.validTokenIds.has(token.id)) return false;
    return posKey(getTokenBoardPosition(player, token)) === cellKey;
  });
}

function getTokenLabelText(entries, isSingleColor) {
  return entries
    .map(({ player, token }) => {
      const num = token.index + 1;
      return isSingleColor ? String(num) : `${player.name[0]}${num}`;
    })
    .join(" ");
}

function renderTokens() {
  clearTokenCellStyles();

  const occupancy = getCellTokenOccupancy();
  for (const [key, entries] of occupancy.entries()) {
    const cell = boardCellsByKey.get(key);
    if (!cell) continue;

    const byColor = new Map();
    for (const { player } of entries) {
      byColor.set(player.id, (byColor.get(player.id) || 0) + 1);
    }

    const colors = [...byColor.keys()];
    const sameColorCount = Math.max(...byColor.values());
    const isSingleColor = colors.length === 1;

    cell.classList.add("token-spot");
    if (isSingleColor) {
      cell.classList.add(`token-spot-${colors[0]}`);
    } else {
      cell.classList.add("token-mixed");
      const mixGradient = buildTokenMixGradient(colors);
      if (mixGradient) {
        cell.style.setProperty("--token-mix", mixGradient);
      }
    }

    if (sameColorCount >= 2) {
      cell.classList.add("token-stack");
    }

    const labelEl = document.createElement("div");
    labelEl.className = "token-label";
    labelEl.textContent = getTokenLabelText(entries, isSingleColor);
    cell.appendChild(labelEl);
  }

  if (state.awaitingTokenChoice) {
    const player = state.activePlayers[state.currentTurn];
    for (const token of player.tokens) {
      if (!state.validTokenIds.has(token.id)) continue;
      const key = posKey(getTokenBoardPosition(player, token));
      const cell = boardCellsByKey.get(key);
      if (cell) cell.classList.add("token-selectable");
    }
  }
}

function waitForTokenTransition(_tokenId, timeout = TOKEN_STEP_MS + 90) {
  return sleep(timeout);
}

function selectTokenByNumber(tokenNumber, fromRobot = false) {
  if (isRobotTurn() && !fromRobot) return;
  if (!state.gameStarted || state.paused || !state.awaitingTokenChoice || state.gameOver || state.rolling) return;

  const currentPlayer = state.activePlayers[state.currentTurn];
  const token = currentPlayer.tokens.find(
    (t) => t.index === tokenNumber - 1 && state.validTokenIds.has(t.id)
  );

  if (!token) return;
  onTokenClick(currentPlayer.id, token.id, fromRobot);
}

// ---------- Turn / Dice ----------
function updateRollControls() {
  const canInteract = state.gameStarted && !state.paused && !state.rolling && !state.awaitingTokenChoice && !state.gameOver && !isRobotTurn();
  diceEl.classList.toggle("disabled", !canInteract);
}

async function animateDiceRoll(finalValue) {
  const triggerResultPop = () => {
    diceEl.classList.remove("result-pop");
    void diceEl.offsetWidth; // restart animation
    diceEl.classList.add("result-pop");
    setTimeout(() => diceEl.classList.remove("result-pop"), 320);
  };

  diceEl.classList.add("rolling");
  for (let i = 0; i < 16; i++) {
    await waitForGameResume();
    setDiceFace(randomDice());
    if (i % 3 === 0) {
      playDiceShuffleTickSound(i);
    }
    // slight slowdown near the end for a better settle effect
    await sleepRespectingPause(40 + i * 6);
  }
  await waitForGameResume();
  diceEl.classList.remove("rolling");
  setDiceFace(finalValue);
  triggerResultPop();
}

function getMovableTokens(player, diceValue) {
  const occupancy = getTrackOccupancy();

  return player.tokens.filter((token) => {
    if (token.steps === 56) return false;
    if (token.steps === -1) {
      if (diceValue !== 6) return false;
      return true;
    }
    if (token.steps + diceValue > 56) return false;
    return true;
  });
}

function getTrackOccupancy() {
  const occupancy = new Map();

  for (const player of state.activePlayers) {
    for (const token of player.tokens) {
      if (token.steps < 0 || token.steps > 50) continue;

      const idx = (player.startIndex + token.steps) % 52;
      if (!occupancy.has(idx)) occupancy.set(idx, new Map());

      const byColor = occupancy.get(idx);
      byColor.set(player.id, (byColor.get(player.id) || 0) + 1);
    }
  }

  return occupancy;
}

function getTrackPathIndicesForMove(player, token, diceValue) {
  if (token.steps === -1) {
    return diceValue === 6 ? [player.startIndex] : [];
  }

  const nextSteps = token.steps + diceValue;
  const endTrackStep = Math.min(nextSteps, 50);
  const indices = [];

  for (let step = token.steps + 1; step <= endTrackStep; step++) {
    indices.push((player.startIndex + step) % 52);
  }

  return indices;
}

function hasAnyBlockadeAtIndex(occupancy, trackIndex) {
  const byColor = occupancy.get(trackIndex);
  if (!byColor) return false;

  for (const count of byColor.values()) {
    if (count >= 2) {
      return true;
    }
  }

  return false;
}

function isMoveBlockedByBlockade(player, token, diceValue, occupancy) {
  const path = getTrackPathIndicesForMove(player, token, diceValue);
  if (!path.length) return false;

  for (const idx of path) {
    if (hasAnyBlockadeAtIndex(occupancy, idx)) {
      return true;
    }
  }

  return false;
}

function advanceTurn() {
  state.currentTurn = (state.currentTurn + 1) % state.activePlayers.length;
}

async function rollDice(trigger = "human") {
  if (trigger === "human") {
    requestFullscreenSafe();
  }
  if (!state.gameStarted || state.paused) return;
  if (trigger !== "robot" && isRobotTurn()) return;
  if (state.rolling || state.awaitingTokenChoice || state.gameOver) return;

  ensureAudio();
  state.rolling = true;
  updateRollControls();

  const value = randomDice();
  await animateDiceRoll(value);
  playDiceSound();

  state.diceValue = value;
  const player = state.activePlayers[state.currentTurn];

  if (value === 6) {
    state.consecutiveSixes += 1;
    playSixSound();
  } else {
    state.consecutiveSixes = 0;
  }

  if (state.consecutiveSixes >= 3) {
    await sleep(800);
    state.diceValue = null;
    state.awaitingTokenChoice = false;
    state.validTokenIds = new Set();
    state.rolling = false;
    state.consecutiveSixes = 0;
    advanceTurn();
    updateTurnIndicator();
    renderTokens();
    updateRollControls();
    scheduleRobotTurn();
    return;
  }

  const movable = getMovableTokens(player, value);

  if (movable.length === 0) {
    await sleep(700);
    state.diceValue = null;
    state.rolling = false;
    state.consecutiveSixes = 0;
    advanceTurn();
    updateTurnIndicator();
    updateRollControls();
    scheduleRobotTurn();
    return;
  }

  if (movable.length === 1) {
    state.validTokenIds = new Set([movable[0].id]);
    state.awaitingTokenChoice = true;
    state.rolling = false;
    renderTokens();
    updateRollControls();

    await sleep(260);
    await onTokenClick(player.id, movable[0].id, isRobotTurn());
    return;
  }

  state.validTokenIds = new Set(movable.map((t) => t.id));
  state.awaitingTokenChoice = true;
  state.rolling = false;
  renderTokens();
  updateRollControls();
}

// ---------- Movement ----------
function getTrackIndex(player, token) {
  if (token.steps < 0 || token.steps > 50) return null;
  return (player.startIndex + token.steps) % 52;
}

function isTokenOnSafeStop(player, token) {
  const idx = getTrackIndex(player, token);
  return idx !== null && SAFE_INDICES.has(idx);
}

function captureOpponentsIfNeeded(activePlayer, movedToken) {
  if (movedToken.steps < 0 || movedToken.steps > 50) return 0;

  const landedIndex = getTrackIndex(activePlayer, movedToken);
  if (landedIndex === null) return 0;

  // Check if the landing index is a predefined safe spot
  if (SAFE_INDICES.has(landedIndex)) return 0;

  // Get current occupancy to check for stacks
  const occupancy = getTrackOccupancy();
  const byColor = occupancy.get(landedIndex);

  // If there's a stack of 2 or more tokens of *any* single player on this spot,
  // it becomes a safe spot, and no captures occur.
  if (byColor) {
    for (const count of byColor.values()) {
      if (count >= 2) {
        return 0; // Stack found, no captures
      }
    }
  }

  let captured = 0;
  for (const opponent of state.activePlayers) {
    if (opponent.id === activePlayer.id) continue;
    for (const token of opponent.tokens) {
      if (token.steps < 0 || token.steps > 50) continue;
      const oppIndex = getTrackIndex(opponent, token);
      if (oppIndex === landedIndex) {
        token.steps = -1;
        captured++;
      }
    }
  }
  return captured;
}

function checkWin(player) {
  return player.tokens.every((t) => t.steps === 56);
}

async function moveTokenByDice(player, token, diceValue) {
  if (token.steps === -1) {
    token.steps = 0; // unlock from base on 6
    playMoveSound();
    renderTokens();
    await waitForTokenTransition(token.id, TOKEN_STEP_MS + 120);
    return;
  }

  for (let i = 0; i < diceValue; i++) {
    token.steps += 1;
    playMoveSound();
    renderTokens();
    await waitForTokenTransition(token.id);
  }
}

async function onTokenClick(playerId, tokenId, fromRobot = false) {
  if (!state.gameStarted || state.paused) return;
  if (isRobotTurn() && !fromRobot) return;
  if (!state.awaitingTokenChoice || state.gameOver) return;

  const currentPlayer = state.activePlayers[state.currentTurn];
  if (currentPlayer.id !== playerId) return;
  if (!state.validTokenIds.has(tokenId)) return;

  state.awaitingTokenChoice = false;
  state.validTokenIds = new Set();
  renderTokens();
  updateRollControls();

  const token = currentPlayer.tokens.find((t) => t.id === tokenId);
  const usedDiceValue = state.diceValue;
  const stepsBeforeMove = token.steps;

  await moveTokenByDice(currentPlayer, token, usedDiceValue);
  const reachedHome = stepsBeforeMove !== 56 && token.steps === 56;
  const landedOnSafeStop = isTokenOnSafeStop(currentPlayer, token);

  const captured = captureOpponentsIfNeeded(currentPlayer, token);
  if (captured > 0) {
    playCaptureSound();
    renderTokens();
    await sleep(350);
  }

  const wonGame = checkWin(currentPlayer);
  if (wonGame) {
    state.gameOver = true;
    clearRobotTimer();
    state.selectionLocked = false;
    document.body.classList.remove('locked');
    state.scores[currentPlayer.id] += 1;
    updateScoreboard();
    winnerTextEl.textContent = `${currentPlayer.name} wins!`;
    winnerModalEl.classList.remove("hidden");
    playWinSound();
    updateRollControls();
    return;
  }

  if (reachedHome) {
    playGoalSound();
  } else if (landedOnSafeStop) {
    playSafeStopSound();
  }

  // Turn flow: rolling 6 grants extra turn
  state.diceValue = null;
  if (usedDiceValue === 6 || captured > 0 || reachedHome) {
    if (usedDiceValue !== 6) {
      state.consecutiveSixes = 0;
    }
  } else {
    state.consecutiveSixes = 0;
    advanceTurn();
  }

  updateTurnIndicator();
  updateRollControls();
  scheduleRobotTurn();
}

// ---------- Color Customizer ----------
function setupColorCustomizer() {
  const colorInputs = document.querySelectorAll('.color-customizer input[type="color"]');
  const resetBtn = document.getElementById('reset-colors');

  const defaultColors = {
    red: "#ef4444",
    green: "#22c55e",
    yellow: "#facc15",
    blue: "#3b82f6"
  };

  colorInputs.forEach(input => {
    const colorId = input.id.replace('color-', '');

    // Listen for changes and update the root CSS variables
    input.addEventListener('input', (e) => {
      document.documentElement.style.setProperty(`--${colorId}`, e.target.value);
    });
  });

  resetBtn.addEventListener('click', () => {
    colorInputs.forEach(input => {
      const colorId = input.id.replace('color-', '');
      input.value = defaultColors[colorId];
      document.documentElement.style.setProperty(`--${colorId}`, defaultColors[colorId]);
    });
  });
}


// ---------- Fullscreen API ----------
function isCurrentlyFullscreen() {
  return Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

function requestFullscreenSafe() {
  try {
    if (!isCurrentlyFullscreen()) {
      const docEl = document.documentElement;
      const req =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;
      if (req) {
        const res = req.call(docEl);
        if (res && res.catch) {
          res.catch(() => {});
        }
      }
    }
  } catch (e) {
    // Ignore restricted permission error in unprivileged contexts
  }
}

function exitFullscreenSafe() {
  try {
    if (isCurrentlyFullscreen()) {
      const exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;
      if (exit) {
        const res = exit.call(document);
        if (res && res.catch) {
          res.catch(() => {});
        }
      }
    }
  } catch (e) {
    // Ignore error
  }
}

function toggleFullscreen() {
  if (isCurrentlyFullscreen()) {
    exitFullscreenSafe();
  } else {
    requestFullscreenSafe();
  }
}

function updateFullscreenUI() {
  const isFs = isCurrentlyFullscreen();
  const fsEnterIcon = document.getElementById("fs-enter-icon");
  const fsExitIcon = document.getElementById("fs-exit-icon");
  const fullscreenBtn = document.getElementById("fullscreen-btn");

  if (fsEnterIcon && fsExitIcon) {
    fsEnterIcon.classList.toggle("hidden", isFs);
    fsExitIcon.classList.toggle("hidden", !isFs);
  }
  if (fullscreenBtn) {
    fullscreenBtn.setAttribute("aria-label", isFs ? "Exit Fullscreen" : "Enter Fullscreen");
    fullscreenBtn.title = isFs ? "Exit Fullscreen" : "Enter Fullscreen";
  }
  setTimeout(() => renderTokens(), 100);
}

// ---------- Events ----------
function setupEvents() {
  diceEl.addEventListener("click", rollDice);
  diceEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      rollDice();
    }
  });

  boardEl.addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    if (!state.gameStarted || state.paused || !state.awaitingTokenChoice || state.gameOver || state.rolling || isRobotTurn()) return;

    const player = state.activePlayers[state.currentTurn];
    const key = `${cell.dataset.r},${cell.dataset.c}`;
    const selectableTokens = getSelectableTokensAtKey(player, key);
    if (!selectableTokens.length) return;

    onTokenClick(player.id, selectableTokens[0].id);
  });

  window.addEventListener("keydown", (e) => {
    const targetTag = e.target?.tagName;
    if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(targetTag)) {
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      rollDice();
      return;
    }

    let tokenNumber = null;
    if (/^Digit[1-4]$/.test(e.code)) {
      tokenNumber = Number(e.code.slice(5));
    } else if (/^Numpad[1-4]$/.test(e.code)) {
      tokenNumber = Number(e.code.slice(6));
    } else if (["1", "2", "3", "4"].includes(e.key)) {
      tokenNumber = Number(e.key);
    }

    if (tokenNumber) {
      e.preventDefault();
      selectTokenByNumber(tokenNumber);
    }
  });

  restartGameEl.addEventListener("click", () => {
    requestFullscreenSafe();
    state.playerCount = Number(playerCountEl.value);
    initGame(state.playerCount, false);
  });

  if (startToggleEl) {
    startToggleEl.addEventListener("click", toggleStartPause);
  }

  playerCountEl.addEventListener("change", () => {
    if (state.gameStarted) return;
    state.playerCount = Number(playerCountEl.value);
    initGame(state.playerCount, false);
  });

  scoreboardEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".mode-chip[data-color]");
    if (!btn) return;
    togglePlayerType(btn.dataset.color);
  });

  playAgainEl.addEventListener("click", () => {
    requestFullscreenSafe();
    winnerModalEl.classList.add("hidden");
    initGame(state.playerCount, false);
  });

  window.addEventListener("resize", () => renderTokens());

  // Init customizers
  setupColorCustomizer();

  // Fullscreen button
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
  }

  // Fullscreen change events
  ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach((evt) => {
    document.addEventListener(evt, updateFullscreenUI);
  });

  // Attempt automatic fullscreen upon visiting
  requestFullscreenSafe();
  window.addEventListener("DOMContentLoaded", requestFullscreenSafe);
  window.addEventListener("load", requestFullscreenSafe);

  // Orientation change resize
  window.addEventListener("orientationchange", () => {
    setTimeout(() => renderTokens(), 150);
  });

  // Unlock audio context and trigger fullscreen on user gesture
  ["click", "touchstart", "pointerdown", "keydown"].forEach((evt) => {
    window.addEventListener(
      evt,
      () => {
        ensureAudio();
        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        requestFullscreenSafe(); { /* user interaction hook */
        }
      },
      { once: true }
    );
  });
}

setupCustomDrawers();
setupEvents();
initGame(4, true);

// ==== CUSTOM COLOR SYSTEM ====
function isValidColor(value){
  const s = new Option().style;
  s.color = value;
  return s.color !== "";
}

function applyCustomColors(){
  if(state.gameStarted) return;

  const red = document.getElementById("color-red-text")?.value.trim();
  const green = document.getElementById("color-green-text")?.value.trim();
  const yellow = document.getElementById("color-yellow-text")?.value.trim();
  const blue = document.getElementById("color-blue-text")?.value.trim();

  if(red && isValidColor(red)) document.documentElement.style.setProperty("--red", red);
  if(green && isValidColor(green)) document.documentElement.style.setProperty("--green", green);
  if(yellow && isValidColor(yellow)) document.documentElement.style.setProperty("--yellow", yellow);
  if(blue && isValidColor(blue)) document.documentElement.style.setProperty("--blue", blue);

  renderTokens();
}

setTimeout(()=>{
  document.querySelectorAll('.color-inputs input').forEach(i=>{
    i.addEventListener('input', applyCustomColors);
  });
},500);

// ==== RESET COLOR FUNCTION ====
function resetColors(){
  if(state.gameStarted) return;

  const defaults = {
    red: "#ef4444",
    green: "#22c55e",
    yellow: "#facc15",
    blue: "#3b82f6"
  };

  document.documentElement.style.setProperty("--red", defaults.red);
  document.documentElement.style.setProperty("--green", defaults.green);
  document.documentElement.style.setProperty("--yellow", defaults.yellow);
  document.documentElement.style.setProperty("--blue", defaults.blue);

  // clear inputs
  document.getElementById("color-red-text").value = "";
  document.getElementById("color-green-text").value = "";
  document.getElementById("color-yellow-text").value = "";
  document.getElementById("color-blue-text").value = "";

  renderTokens();
}

// attach reset button
setTimeout(()=>{
  const btn = document.getElementById("reset-colors");
  if(btn){
    btn.addEventListener("click", resetColors);
  }
},500);
