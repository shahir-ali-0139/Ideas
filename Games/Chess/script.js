/**
 * Professional Chess – Human vs Advanced AI
 * Application Logic & Stockfish Integration
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Audio System (Procedural Web Audio API Synthesizer)
  // ==========================================================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.initOnFirstInteraction();
    }

    initOnFirstInteraction() {
      const unlock = () => {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        } else if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
        document.removeEventListener('touchstart', unlock);
      };
      document.addEventListener('click', unlock);
      document.addEventListener('keydown', unlock);
      document.addEventListener('touchstart', unlock);
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playMove() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    }

    playCapture() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Noise burst + low thump for crisp snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    }

    playCastle() {
      if (!this.enabled || !this.ctx) return;
      this.playMove();
      setTimeout(() => this.playMove(), 110);
    }

    playCheck() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      [587.33, 880].forEach((freq, i) => { // D5, A5
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.25, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    }

    playGameOver(victory) {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = victory ? [523.25, 659.25, 783.99, 1046.50] : [392.00, 349.23, 311.13, 261.63];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = victory ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.3, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    }
  }

  // ==========================================================================
  // 2. Fallback Chess AI Engine (Minimax with Alpha-Beta & PST)
  // Ensures 100% playable AI in environments where Web Workers are blocked
  // ==========================================================================
  class FallbackEngine {
    constructor() {
      this.pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
      this.pawnPST = [
        0,  0,  0,  0,  0,  0,  0,  0,
       50, 50, 50, 50, 50, 50, 50, 50,
       10, 10, 20, 30, 30, 20, 10, 10,
        5,  5, 10, 25, 25, 10,  5,  5,
        0,  0,  0, 20, 20,  0,  0,  0,
        5, -5,-10,  0,  0,-10, -5,  5,
        5, 10, 10,-20,-20, 10, 10,  5,
        0,  0,  0,  0,  0,  0,  0,  0
      ];
      this.knightPST = [
       -50,-40,-30,-30,-30,-30,-40,-50,
       -40,-20,  0,  0,  0,  0,-20,-40,
       -30,  0, 10, 15, 15, 10,  0,-30,
       -30,  5, 15, 20, 20, 15,  5,-30,
       -30,  0, 15, 20, 20, 15,  0,-30,
       -30,  5, 10, 15, 15, 10,  5,-30,
       -40,-20,  0,  5,  5,  0,-20,-40,
       -50,-40,-30,-30,-30,-30,-40,-50
      ];
      this.bishopPST = [
       -20,-10,-10,-10,-10,-10,-10,-20,
       -10,  0,  0,  0,  0,  0,  0,-10,
       -10,  0,  5, 10, 10,  5,  0,-10,
       -10,  5,  5, 10, 10,  5,  5,-10,
       -10,  0, 10, 10, 10, 10,  0,-10,
       -10, 10, 10, 10, 10, 10, 10,-10,
       -10,  5,  0,  0,  0,  0,  5,-10,
       -20,-10,-10,-10,-10,-10,-10,-20
      ];
    }

    evaluate(chess) {
      if (chess.isCheckmate()) {
        return chess.turn() === 'w' ? -99999 : 99999;
      }
      if (chess.isDraw()) return 0;

      let score = 0;
      const board = chess.board();

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (!piece) continue;
          const val = this.pieceValues[piece.type] || 0;
          let pstVal = 0;
          const idx = piece.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;
          if (piece.type === 'p') pstVal = this.pawnPST[idx];
          else if (piece.type === 'n') pstVal = this.knightPST[idx];
          else if (piece.type === 'b') pstVal = this.bishopPST[idx];

          if (piece.color === 'w') score += val + pstVal;
          else score -= (val + pstVal);
        }
      }
      return score;
    }

    minimax(chess, depth, alpha, beta, isMaximizing) {
      if (depth === 0 || chess.isGameOver()) {
        return { score: this.evaluate(chess) };
      }

      const moves = chess.moves({ verbose: true });
      // Move ordering: captures first
      moves.sort((a, b) => (b.captured ? 10 : 0) - (a.captured ? 10 : 0));

      let bestMove = null;

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
          chess.move(move);
          const evaluation = this.minimax(chess, depth - 1, alpha, beta, false).score;
          chess.undo();
          if (evaluation > maxEval) {
            maxEval = evaluation;
            bestMove = move;
          }
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break;
        }
        return { score: maxEval, move: bestMove };
      } else {
        let minEval = Infinity;
        for (const move of moves) {
          chess.move(move);
          const evaluation = this.minimax(chess, depth - 1, alpha, beta, true).score;
          chess.undo();
          if (evaluation < minEval) {
            minEval = evaluation;
            bestMove = move;
          }
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break;
        }
        return { score: minEval, move: bestMove };
      }
    }

    findBestMove(fen, depth = 3) {
      const chess = new window.Chess(fen);
      const isWhite = chess.turn() === 'w';
      const result = this.minimax(chess, depth, -Infinity, Infinity, isWhite);
      return result.move ? (result.move.from + result.move.to + (result.move.promotion || '')) : null;
    }
  }

  // ==========================================================================
  // 3. Stockfish Engine Controller
  // ==========================================================================
  class StockfishController {
    constructor(onReady, onStatusUpdate) {
      this.worker = null;
      this.isReady = false;
      this.isThinking = false;
      this.fallback = new FallbackEngine();
      this.usingFallback = false;
      this.onReadyCallback = onReady;
      this.onStatusUpdate = onStatusUpdate;

      this.currentCallback = null;
      this.evalCallback = null;
      this.difficultyLevel = 'grandmaster';

      this.skillConfigs = {
        easy: { skill: 2, depth: 4, movetime: 300, label: 'Easy (Skill 2)', elo: 'ELO ~1100' },
        medium: { skill: 7, depth: 7, movetime: 500, label: 'Medium (Skill 7)', elo: 'ELO ~1550' },
        hard: { skill: 13, depth: 11, movetime: 800, label: 'Hard (Skill 13)', elo: 'ELO ~1950' },
        expert: { skill: 17, depth: 15, movetime: 1400, label: 'Expert (Skill 17)', elo: 'ELO ~2400' },
        grandmaster: { skill: 20, depth: 19, movetime: 2200, label: 'Grandmaster (Max)', elo: 'ELO ~2850+' }
      };

      this.initEngine();
    }

    initEngine() {
      try {
        // Attempt to create Web Worker with local stockfish.js
        this.worker = new Worker('lib/stockfish.js');
        this.setupWorkerListeners();
        this.worker.postMessage('uci');
      } catch (err) {
        console.warn('Direct Stockfish Worker failed, attempting fallback...', err);
        this.activateFallback();
      }
    }

    setupWorkerListeners() {
      this.worker.onmessage = (event) => {
        const line = typeof event.data === 'string' ? event.data : '';
        // console.log('[Stockfish]', line);

        if (line === 'uciok') {
          this.worker.postMessage('isready');
        } else if (line === 'readyok') {
          this.isReady = true;
          this.worker.postMessage('ucinewgame');
          this.applyDifficulty();
          if (this.onReadyCallback) this.onReadyCallback(true);
        } else if (line.startsWith('info') && line.includes('score')) {
          this.parseEval(line);
        } else if (line.startsWith('bestmove')) {
          this.isThinking = false;
          const parts = line.split(' ');
          const move = parts[1];
          if (this.currentCallback) {
            const cb = this.currentCallback;
            this.currentCallback = null;
            cb(move);
          }
        }
      };

      this.worker.onerror = (err) => {
        console.error('Stockfish Worker Error:', err);
        if (!this.isReady) {
          this.activateFallback();
        }
      };
    }

    activateFallback() {
      this.usingFallback = true;
      this.isReady = true;
      console.log('Stockfish Worker unavailable in this browser context. Running high-performance Fallback Engine.');
      if (this.onStatusUpdate) {
        this.onStatusUpdate('Fallback AI Ready');
      }
      if (this.onReadyCallback) this.onReadyCallback(false);
    }

    setDifficulty(level) {
      if (this.skillConfigs[level]) {
        this.difficultyLevel = level;
        this.applyDifficulty();
      }
    }

    applyDifficulty() {
      if (!this.isReady || this.usingFallback || !this.worker) return;
      const config = this.skillConfigs[this.difficultyLevel];
      this.worker.postMessage(`setoption name Skill Level value ${config.skill}`);
    }

    parseEval(line) {
      // Example: info depth 12 score cp 45 ... or score mate -2 ...
      const cpMatch = line.match(/score cp (-?\d+)/);
      const mateMatch = line.match(/score mate (-?\d+)/);
      const depthMatch = line.match(/depth (\d+)/);

      let evalScore = null;
      let depth = depthMatch ? depthMatch[1] : null;

      if (mateMatch) {
        evalScore = { type: 'mate', val: parseInt(mateMatch[1], 10), depth };
      } else if (cpMatch) {
        evalScore = { type: 'cp', val: parseInt(cpMatch[1], 10), depth };
      }

      if (evalScore && this.evalCallback) {
        this.evalCallback(evalScore);
      }
    }

    calculateBestMove(fen, callback, evalCallback) {
      this.currentCallback = callback;
      this.evalCallback = evalCallback;
      this.isThinking = true;

      const config = this.skillConfigs[this.difficultyLevel];

      if (this.usingFallback || !this.worker) {
        setTimeout(() => {
          this.isThinking = false;
          const bestMove = this.fallback.findBestMove(fen, Math.min(config.depth, 4));
          if (this.currentCallback) {
            const cb = this.currentCallback;
            this.currentCallback = null;
            cb(bestMove);
          }
        }, Math.min(config.movetime, 500));
        return;
      }

      this.worker.postMessage('stop');
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${config.depth} movetime ${config.movetime}`);
    }

    getHint(fen, callback) {
      if (this.usingFallback || !this.worker) {
        const bestMove = this.fallback.findBestMove(fen, 3);
        callback(bestMove);
        return;
      }

      const tempCallback = (e) => {
        const line = typeof e.data === 'string' ? e.data : '';
        if (line.startsWith('bestmove')) {
          this.worker.removeEventListener('message', tempCallback);
          const parts = line.split(' ');
          callback(parts[1]);
        }
      };

      this.worker.addEventListener('message', tempCallback);
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage('go depth 12 movetime 1000');
    }

    stop() {
      if (this.worker && !this.usingFallback) {
        this.worker.postMessage('stop');
      }
      this.isThinking = false;
      this.currentCallback = null;
    }
  }

  // ==========================================================================
  // Fullscreen Manager
  // Automatically enters fullscreen on visit / first interaction
  // and provides dedicated toggle control
  // ==========================================================================
  class FullscreenManager {
    constructor(btnEl) {
      this.btn = btnEl;
      this.init();
    }

    init() {
      // 1. Try immediate fullscreen request on load
      this.tryImmediateFullscreen();

      // 2. On first user interaction, automatically enter fullscreen if not yet active
      const autoFullscreenOnFirstGesture = () => {
        if (!this.isFullscreen()) {
          this.requestFullscreen().catch(() => {});
        }
        cleanup();
      };

      const cleanup = () => {
        document.removeEventListener('pointerdown', autoFullscreenOnFirstGesture, true);
        document.removeEventListener('click', autoFullscreenOnFirstGesture, true);
        document.removeEventListener('touchstart', autoFullscreenOnFirstGesture, true);
      };

      document.addEventListener('pointerdown', autoFullscreenOnFirstGesture, true);
      document.addEventListener('click', autoFullscreenOnFirstGesture, true);
      document.addEventListener('touchstart', autoFullscreenOnFirstGesture, true);

      // 3. Button click toggle
      if (this.btn) {
        this.btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggle();
        });
      }

      // 4. Update button icon on fullscreen change
      const onFsChange = () => this.updateUI();
      document.addEventListener('fullscreenchange', onFsChange);
      document.addEventListener('webkitfullscreenchange', onFsChange);
      document.addEventListener('mozfullscreenchange', onFsChange);
      document.addEventListener('MSFullscreenChange', onFsChange);
    }

    isFullscreen() {
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    }

    async tryImmediateFullscreen() {
      try {
        if (!this.isFullscreen()) {
          await this.requestFullscreen();
        }
      } catch (err) {
        // Handled cleanly by first user gesture listener
      }
    }

    async requestFullscreen() {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        return docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        return docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        return docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        return docEl.msRequestFullscreen();
      }
    }

    async exitFullscreen() {
      if (document.exitFullscreen) {
        return document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        return document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        return document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        return document.msExitFullscreen();
      }
    }

    async toggle() {
      try {
        if (this.isFullscreen()) {
          await this.exitFullscreen();
        } else {
          await this.requestFullscreen();
        }
      } catch (err) {
        console.warn('Fullscreen toggle:', err);
      }
    }

    updateUI() {
      if (!this.btn) return;
      const isFs = this.isFullscreen();
      const icon = this.btn.querySelector('.icon-fullscreen');
      if (icon) {
        icon.textContent = isFs ? '🗗' : '⛶';
      }
      this.btn.title = isFs ? 'Exit Fullscreen' : 'Enter Fullscreen';
    }
  }

  // ==========================================================================
  // 4. Main Chess Application Controller
  // ==========================================================================
  class ChessApp {
    constructor() {
      this.chess = new window.Chess();
      this.sound = new SoundManager();

      // Automatic Color Alternation Logic
      // Game 1: Human = White, Computer = Black
      // Game 2: Human = Black, Computer = White
      // Game 3: Human = White, Computer = Black... indefinitely!
      this.gameNumber = 1;
      this.humanColor = 'w';
      this.computerColor = 'b';
      this.boardFlipped = false; // Manual flip toggle

      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.pendingPromotion = null;
      this.isGameOver = false;

      // Drag and drop state
      this.dragState = {
        isDragging: false,
        fromSquare: null,
        pieceElement: null,
        ghostElement: null
      };

      this.initDOMElements();
      this.initEngine();
      this.setupEventListeners();
      this.renderBoard();
      this.updateGameInfo();
    }

    initDOMElements() {
      this.dom = {
        boardFrame: document.getElementById('board-frame'),
        chessboard: document.getElementById('chessboard'),
        svgArrows: document.getElementById('svg-arrows'),
        evalBarFill: document.getElementById('eval-bar-fill'),
        evalScoreText: document.getElementById('eval-score-text'),

        // Player Cards
        topPlayerCard: document.getElementById('top-player-card'),
        topPlayerName: document.getElementById('top-player-name'),
        topPlayerColorBadge: document.getElementById('top-player-color-badge'),
        topPlayerDiffTag: document.getElementById('top-player-diff-tag'),
        topCapturedList: document.getElementById('top-captured-list'),
        topMaterialLead: document.getElementById('top-material-lead'),
        aiThinkingIndicator: document.getElementById('ai-thinking-indicator'),
        aiThinkingLabel: document.getElementById('ai-thinking-label'),

        bottomPlayerCard: document.getElementById('bottom-player-card'),
        bottomPlayerName: document.getElementById('bottom-player-name'),
        bottomPlayerColorBadge: document.getElementById('bottom-player-color-badge'),
        bottomCapturedList: document.getElementById('bottom-captured-list'),
        bottomMaterialLead: document.getElementById('bottom-material-lead'),
        humanTurnPill: document.getElementById('human-turn-pill'),
        turnBannerText: document.getElementById('turn-banner-text'),

        // Controls
        btnFullscreen: document.getElementById('btn-fullscreen'),
        btnSoundToggle: document.getElementById('btn-sound-toggle'),
        selectTheme: document.getElementById('select-theme'),
        selectDifficulty: document.getElementById('select-difficulty'),
        diffRatingBadge: document.getElementById('diff-rating-badge'),
        diffMeterFill: document.getElementById('diff-meter-fill'),
        engineStatusPill: document.getElementById('engine-status-pill'),
        engineStatusText: document.getElementById('engine-status-text'),

        btnNewGame: document.getElementById('btn-new-game'),
        btnRestart: document.getElementById('btn-restart'),
        btnUndo: document.getElementById('btn-undo'),
        btnHint: document.getElementById('btn-hint'),
        btnFlip: document.getElementById('btn-flip'),
        btnResign: document.getElementById('btn-resign'),

        // Status Card
        colorCycleNotice: document.getElementById('color-cycle-notice'),
        statusPrimaryText: document.getElementById('status-primary-text'),
        statusSecondaryText: document.getElementById('status-secondary-text'),
        hintBox: document.getElementById('hint-box'),
        hintContent: document.getElementById('hint-content'),

        // Moves
        movesContainer: document.getElementById('moves-container'),
        movesTbody: document.getElementById('moves-tbody'),
        moveCounter: document.getElementById('move-counter'),
        emptyMovesMsg: document.getElementById('empty-moves-msg'),
        btnCopyFen: document.getElementById('btn-copy-fen'),
        btnCopyPgn: document.getElementById('btn-copy-pgn'),

        // Modals
        promotionOverlay: document.getElementById('promotion-overlay'),
        promotionChoices: document.getElementById('promotion-choices'),
        gameOverModal: document.getElementById('game-over-modal'),
        modalResultTitle: document.getElementById('modal-result-title'),
        modalResultSubtitle: document.getElementById('modal-result-subtitle'),
        modalStatMoves: document.getElementById('modal-stat-moves'),
        modalStatDiff: document.getElementById('modal-stat-diff'),
        modalStatNextColor: document.getElementById('modal-stat-next-color'),
        modalBtnPlayNext: document.getElementById('modal-btn-play-next'),
        modalBtnClose: document.getElementById('modal-btn-close'),

        confirmModal: document.getElementById('confirm-modal'),
        confirmModalTitle: document.getElementById('confirm-modal-title'),
        confirmModalMessage: document.getElementById('confirm-modal-message'),
        confirmBtnYes: document.getElementById('confirm-btn-yes'),
        confirmBtnNo: document.getElementById('confirm-btn-no'),

        toastContainer: document.getElementById('toast-container')
      };
    }

    initEngine() {
      this.engine = new StockfishController(
        (isStockfish) => {
          this.dom.engineStatusText.textContent = isStockfish ? 'Stockfish Ready' : 'AI Ready';
          this.dom.engineStatusPill.className = 'status-pill status-ready';
          // If computer is White in the starting game, trigger its opening move
          if (this.computerColor === 'w' && this.chess.turn() === 'w') {
            this.handleComputerTurn();
          }
        },
        (msg) => {
          this.dom.engineStatusText.textContent = msg;
        }
      );
    }

    setupEventListeners() {
      // Fullscreen Controller
      this.fullscreen = new FullscreenManager(this.dom.btnFullscreen);

      // Load saved preferences
      try {
        const savedTheme = localStorage.getItem('chess_theme');
        if (savedTheme) {
          document.body.className = savedTheme;
          this.dom.selectTheme.value = savedTheme;
        }
        const savedDiff = localStorage.getItem('chess_difficulty');
        if (savedDiff && this.engine.skillConfigs[savedDiff]) {
          this.dom.selectDifficulty.value = savedDiff;
          this.engine.setDifficulty(savedDiff);
          const cfg = this.engine.skillConfigs[savedDiff];
          this.dom.diffRatingBadge.textContent = cfg.elo;
          this.dom.topPlayerDiffTag.textContent = savedDiff.charAt(0).toUpperCase() + savedDiff.slice(1);
          const meterMap = { easy: '20%', medium: '45%', hard: '70%', expert: '88%', grandmaster: '100%' };
          this.dom.diffMeterFill.style.width = meterMap[savedDiff] || '100%';
        }
        const savedSound = localStorage.getItem('chess_sound');
        if (savedSound !== null) {
          this.sound.enabled = savedSound === 'true';
          this.dom.btnSoundToggle.querySelector('.icon-sound').textContent = this.sound.enabled ? '🔊' : '🔇';
        }
      } catch (e) {}

      // Sound Toggle
      this.dom.btnSoundToggle.addEventListener('click', () => {
        const enabled = this.sound.toggle();
        try { localStorage.setItem('chess_sound', enabled.toString()); } catch (e) {}
        this.dom.btnSoundToggle.querySelector('.icon-sound').textContent = enabled ? '🔊' : '🔇';
        this.showToast(enabled ? 'Sound enabled' : 'Sound muted');
      });

      // Theme Selector
      this.dom.selectTheme.addEventListener('change', (e) => {
        document.body.className = e.target.value;
        try { localStorage.setItem('chess_theme', e.target.value); } catch (e) {}
      });

      // Difficulty Selector
      this.dom.selectDifficulty.addEventListener('change', (e) => {
        const val = e.target.value;
        this.engine.setDifficulty(val);
        try { localStorage.setItem('chess_difficulty', val); } catch (e) {}
        const config = this.engine.skillConfigs[val];
        this.dom.diffRatingBadge.textContent = config.elo;
        this.dom.topPlayerDiffTag.textContent = val.charAt(0).toUpperCase() + val.slice(1);

        const meterMap = { easy: '20%', medium: '45%', hard: '70%', expert: '88%', grandmaster: '100%' };
        this.dom.diffMeterFill.style.width = meterMap[val] || '100%';
        this.showToast(`AI Difficulty: ${config.label}`);
      });

      // New Game & Restart
      this.dom.btnNewGame.addEventListener('click', () => {
        this.promptNewGame('new');
      });

      this.dom.btnRestart.addEventListener('click', () => {
        this.promptNewGame('restart');
      });

      // Undo
      this.dom.btnUndo.addEventListener('click', () => {
        this.handleUndo();
      });

      // Hint
      this.dom.btnHint.addEventListener('click', () => {
        this.handleHint();
      });

      // Flip Board
      this.dom.btnFlip.addEventListener('click', () => {
        this.boardFlipped = !this.boardFlipped;
        this.renderBoard();
        this.showToast(this.boardFlipped ? 'Board rotated' : 'Board standard orientation');
      });

      // Resign
      this.dom.btnResign.addEventListener('click', () => {
        if (this.isGameOver) return;
        this.showConfirm(
          'Resign Game',
          'Are you sure you want to resign this game to the computer opponent?',
          () => {
            this.handleResignation();
          }
        );
      });

      // Copy FEN / PGN
      this.dom.btnCopyFen.addEventListener('click', () => {
        navigator.clipboard.writeText(this.chess.fen()).then(() => {
          this.showToast('FEN copied to clipboard!');
        });
      });

      this.dom.btnCopyPgn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.chess.pgn()).then(() => {
          this.showToast('PGN copied to clipboard!');
        });
      });

      // Pawn Promotion Choice Buttons
      this.dom.promotionChoices.addEventListener('click', (e) => {
        const btn = e.target.closest('.promo-choice-btn');
        if (!btn || !this.pendingPromotion) return;
        const choice = btn.dataset.promo;
        this.executeMove(this.pendingPromotion.from, this.pendingPromotion.to, choice);
        this.pendingPromotion = null;
        this.dom.promotionOverlay.style.display = 'none';
      });

      // Cancel Promotion
      const btnCancelPromo = document.getElementById('btn-cancel-promo');
      if (btnCancelPromo) {
        btnCancelPromo.addEventListener('click', () => {
          this.pendingPromotion = null;
          this.dom.promotionOverlay.style.display = 'none';
          this.deselect();
        });
      }

      // Keyboard Shortcuts
      document.addEventListener('keydown', (e) => {
        // If typing inside an input/select, ignore
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key.toLowerCase();
        if (key === 'escape') {
          if (this.pendingPromotion) {
            this.pendingPromotion = null;
            this.dom.promotionOverlay.style.display = 'none';
          }
          if (this.dom.confirmModal.style.display === 'flex') {
            this.dom.confirmModal.style.display = 'none';
          }
          if (this.dom.gameOverModal.style.display === 'flex') {
            this.dom.gameOverModal.style.display = 'none';
          }
          this.deselect();
        } else if (key === 'z') {
          this.handleUndo();
        } else if (key === 'h') {
          this.handleHint();
        } else if (key === 'f') {
          this.dom.btnFlip.click();
        } else if (key === 'n') {
          this.dom.btnNewGame.click();
        } else if (key === 'r') {
          this.dom.btnRestart.click();
        }
      });

      // Game Over Modal Buttons
      this.dom.modalBtnPlayNext.addEventListener('click', () => {
        this.dom.gameOverModal.style.display = 'none';
        this.startNextGame(true); // Always switches color
      });

      this.dom.modalBtnClose.addEventListener('click', () => {
        this.dom.gameOverModal.style.display = 'none';
      });

      // Drag and Drop global listeners (pointer events)
      document.addEventListener('pointermove', (e) => this.handlePointerMove(e));
      document.addEventListener('pointerup', (e) => this.handlePointerUp(e));
      document.addEventListener('pointercancel', (e) => this.handlePointerUp(e));
    }

    // ========================================================================
    // 5. Automatic Color Switching Logic (CRITICAL)
    // ========================================================================
    promptNewGame(actionType) {
      if (!this.isGameOver && this.chess.history().length > 0) {
        const msg = actionType === 'restart'
          ? 'Restart the game? Current progress will be lost, and player colors will alternate.'
          : 'Start a new game? Current progress will be lost, and player colors will alternate.';
        this.showConfirm(
          actionType === 'restart' ? 'Restart Game' : 'New Game',
          msg,
          () => this.startNextGame(true)
        );
      } else {
        this.startNextGame(true);
      }
    }

    /**
     * Starts a fresh game and alternates colors.
     * Game 1: Human = White, Computer = Black
     * Game 2: Human = Black, Computer = White
     * Game 3: Human = White, Computer = Black
     * Indefinitely alternating!
     */
    startNextGame(alternateColor = true) {
      this.engine.stop();
      this.chess.reset();
      this.isGameOver = false;
      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.clearArrows();
      this.dom.hintBox.style.display = 'none';

      if (alternateColor) {
        this.gameNumber++;
        this.humanColor = this.humanColor === 'w' ? 'b' : 'w';
        this.computerColor = this.humanColor === 'w' ? 'b' : 'w';
      }

      this.boardFlipped = false; // Reset manual flip so it defaults to Human's color
      this.showToast(`Starting Game ${this.gameNumber} • You are ${this.humanColor === 'w' ? 'White' : 'Black'}`);

      this.renderBoard();
      this.updateGameInfo();
      this.updateMovesTable();
      this.updateEvalBar(0);

      // Automatic first move: If Computer is White, it moves first!
      if (this.computerColor === 'w') {
        setTimeout(() => {
          this.handleComputerTurn();
        }, 500);
      }
    }

    // ========================================================================
    // 6. Board Rendering & Geometry
    // ========================================================================
    getBoardOrientation() {
      // Standard: Human White -> 'w' (White at bottom)
      // Human Black -> 'b' (Black at bottom)
      const base = this.humanColor;
      return this.boardFlipped ? (base === 'w' ? 'b' : 'w') : base;
    }

    renderBoard() {
      const orientation = this.getBoardOrientation();
      const board = this.chess.board();
      this.dom.chessboard.innerHTML = '';

      const ranks = orientation === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
      const files = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

      const lastMove = this.chess.history({ verbose: true }).slice(-1)[0];
      const inCheckKingSquare = this.chess.inCheck() ? this.getKingSquare(this.chess.turn()) : null;

      for (let rIdx = 0; rIdx < 8; rIdx++) {
        const r = ranks[rIdx];
        for (let cIdx = 0; cIdx < 8; cIdx++) {
          const c = files[cIdx];
          const squareName = String.fromCharCode(97 + c) + (r + 1);
          const isLight = (r + c) % 2 !== 0;

          const squareEl = document.createElement('div');
          squareEl.className = `square ${isLight ? 'light' : 'dark'}`;
          squareEl.dataset.square = squareName;

          // Rank / File coordinates labels on edge squares
          if (cIdx === 0) {
            const rankLabel = document.createElement('span');
            rankLabel.className = 'coord-rank';
            rankLabel.textContent = (r + 1).toString();
            squareEl.appendChild(rankLabel);
          }
          if (rIdx === 7) {
            const fileLabel = document.createElement('span');
            fileLabel.className = 'coord-file';
            fileLabel.textContent = String.fromCharCode(97 + c);
            squareEl.appendChild(fileLabel);
          }

          // Highlights
          if (this.selectedSquare === squareName) {
            squareEl.classList.add('selected');
          }
          if (lastMove && (lastMove.from === squareName || lastMove.to === squareName)) {
            squareEl.classList.add('last-move');
          }
          if (inCheckKingSquare === squareName) {
            squareEl.classList.add('in-check');
          }

          // Legal move indicators
          const isLegalDest = this.legalMovesForSelected.some(m => m.to === squareName);
          if (isLegalDest) {
            const targetPiece = board[7 - r][c];
            if (targetPiece) {
              const ring = document.createElement('div');
              ring.className = 'legal-capture-ring';
              squareEl.appendChild(ring);
            } else {
              const dot = document.createElement('div');
              dot.className = 'legal-dot';
              squareEl.appendChild(dot);
            }
          }

          // Render Piece
          // chess.js board(): index 0 is rank 8, index 7 is rank 1
          const piece = board[7 - r][c];
          if (piece) {
            const pieceEl = document.createElement('div');
            pieceEl.className = `chess-piece piece-${piece.color}${piece.type}`;
            pieceEl.dataset.piece = `${piece.color}${piece.type}`;
            pieceEl.dataset.square = squareName;

            // Pointer down for drag or click
            pieceEl.addEventListener('pointerdown', (e) => this.handlePiecePointerDown(e, squareName));

            squareEl.appendChild(pieceEl);
          }

          // Click on square
          squareEl.addEventListener('click', (e) => {
            // Ignore if handled by piece drag
            if (this.dragState.isDragging) return;
            this.handleSquareClick(squareName);
          });

          this.dom.chessboard.appendChild(squareEl);
        }
      }
    }

    getKingSquare(color) {
      const board = this.chess.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'k' && p.color === color) {
            return String.fromCharCode(97 + c) + (8 - r);
          }
        }
      }
      return null;
    }

    // ========================================================================
    // 7. Human Interaction (Click & Drag-and-Drop)
    // ========================================================================
    canHumanMove() {
      return !this.isGameOver &&
        !this.engine.isThinking &&
        this.chess.turn() === this.humanColor &&
        !this.pendingPromotion;
    }

    handleSquareClick(square) {
      if (!this.canHumanMove()) return;

      // If a piece is already selected
      if (this.selectedSquare) {
        const legalMove = this.legalMovesForSelected.find(m => m.to === square);
        if (legalMove) {
          this.attemptHumanMove(this.selectedSquare, square);
          return;
        }

        // If clicking on another piece of the same human color, switch selection
        const piece = this.chess.get(square);
        if (piece && piece.color === this.humanColor) {
          this.selectSquare(square);
          return;
        }

        // Otherwise deselect
        this.deselect();
        return;
      }

      // If clicking on a piece to select it
      const piece = this.chess.get(square);
      if (piece && piece.color === this.humanColor) {
        this.selectSquare(square);
      }
    }

    selectSquare(square) {
      this.selectedSquare = square;
      this.legalMovesForSelected = this.chess.moves({ square: square, verbose: true });
      this.clearArrows();
      this.renderBoard();
    }

    deselect() {
      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.renderBoard();
    }

    // Drag and drop mechanics
    handlePiecePointerDown(e, square) {
      if (!this.canHumanMove()) return;
      const piece = this.chess.get(square);
      if (!piece || piece.color !== this.humanColor) return;

      e.preventDefault();
      this.selectSquare(square);

      const pieceEl = e.currentTarget;
      pieceEl.classList.add('dragging');

      // Create floating ghost element
      const ghost = document.createElement('div');
      ghost.className = `drag-ghost-piece piece-${piece.color}${piece.type}`;
      ghost.style.left = `${e.clientX}px`;
      ghost.style.top = `${e.clientY}px`;
      document.body.appendChild(ghost);

      this.dragState = {
        isDragging: true,
        fromSquare: square,
        pieceElement: pieceEl,
        ghostElement: ghost
      };
    }

    handlePointerMove(e) {
      if (!this.dragState.isDragging || !this.dragState.ghostElement) return;
      this.dragState.ghostElement.style.left = `${e.clientX}px`;
      this.dragState.ghostElement.style.top = `${e.clientY}px`;
    }

    handlePointerUp(e) {
      if (!this.dragState.isDragging) return;

      const { fromSquare, pieceElement, ghostElement } = this.dragState;

      // Clean up ghost and original piece styling
      if (ghostElement && ghostElement.parentNode) {
        ghostElement.parentNode.removeChild(ghostElement);
      }
      if (pieceElement) {
        pieceElement.classList.remove('dragging');
      }

      this.dragState.isDragging = false;
      this.dragState.ghostElement = null;

      // Determine drop target square from coordinates
      const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
      const targetSquareEl = dropTarget ? dropTarget.closest('.square') : null;

      if (targetSquareEl && targetSquareEl.dataset.square) {
        const toSquare = targetSquareEl.dataset.square;
        if (toSquare !== fromSquare) {
          const legalMove = this.legalMovesForSelected.find(m => m.to === toSquare);
          if (legalMove) {
            this.attemptHumanMove(fromSquare, toSquare);
            return;
          }
        }
      }
    }

    // ========================================================================
    // 8. Move Execution & Pawn Promotion
    // ========================================================================
    attemptHumanMove(from, to) {
      const piece = this.chess.get(from);
      // Check for pawn promotion: White reaches rank 8 or Black reaches rank 1
      const isPromotion = piece && piece.type === 'p' &&
        ((piece.color === 'w' && to.endsWith('8')) || (piece.color === 'b' && to.endsWith('1')));

      if (isPromotion) {
        this.pendingPromotion = { from, to };
        this.showPromotionDialog(piece.color);
        return;
      }

      this.executeMove(from, to);
    }

    showPromotionDialog(color) {
      // Set correct piece SVGs in the promotion dialog
      document.getElementById('promo-q').className = `promo-piece piece-${color}q`;
      document.getElementById('promo-r').className = `promo-piece piece-${color}r`;
      document.getElementById('promo-b').className = `promo-piece piece-${color}b`;
      document.getElementById('promo-n').className = `promo-piece piece-${color}n`;
      this.dom.promotionOverlay.style.display = 'flex';
    }

    executeMove(from, to, promotion = 'q') {
      try {
        const move = this.chess.move({ from, to, promotion });
        if (!move) {
          console.warn('Illegal move attempted:', from, to);
          this.deselect();
          return;
        }

        // Sound effect
        if (move.flags.includes('k') || move.flags.includes('q')) {
          this.sound.playCastle();
        } else if (move.captured) {
          this.sound.playCapture();
        } else {
          this.sound.playMove();
        }

        if (this.chess.inCheck()) {
          this.sound.playCheck();
        }

        this.deselect();
        this.clearArrows();
        this.dom.hintBox.style.display = 'none';

        this.updateGameInfo();
        this.updateMovesTable();
        this.renderBoard();

        // Check for Game Over
        if (this.checkGameOver()) {
          return;
        }

        // If it's now Computer's turn, trigger Stockfish
        if (this.chess.turn() === this.computerColor) {
          this.handleComputerTurn();
        }
      } catch (err) {
        console.error('Move error:', err);
        this.deselect();
      }
    }

    // ========================================================================
    // 9. Advanced Computer AI Turn (Stockfish)
    // ========================================================================
    handleComputerTurn() {
      if (this.isGameOver) return;

      this.dom.aiThinkingIndicator.style.display = 'flex';
      this.dom.aiThinkingLabel.textContent = `Analyzing (${this.engine.difficultyLevel})...`;
      this.updateGameInfo();

      const fen = this.chess.fen();

      this.engine.calculateBestMove(
        fen,
        (bestMove) => {
          this.dom.aiThinkingIndicator.style.display = 'none';

          if (!bestMove || bestMove === '(none)' || this.isGameOver) {
            return;
          }

          // Bestmove format: "e7e5" or "e7e8q" (with promotion)
          const from = bestMove.slice(0, 2);
          const to = bestMove.slice(2, 4);
          const promotion = bestMove.length >= 5 ? bestMove.slice(4, 5) : 'q';

          this.executeMove(from, to, promotion);
        },
        (evalData) => {
          this.handleEvalUpdate(evalData);
        }
      );
    }

    handleEvalUpdate(evalData) {
      if (!evalData) return;
      let scoreVal = 0;
      let displayText = '';

      if (evalData.type === 'mate') {
        displayText = `M${evalData.val}`;
        scoreVal = evalData.val > 0 ? 100 : -100;
      } else {
        // Stockfish centipawn score is from perspective of side to move in FEN
        // Convert score to White perspective
        const isWhiteTurn = this.chess.turn() === 'w';
        const whiteScoreCp = isWhiteTurn ? evalData.val : -evalData.val;
        const pawns = (whiteScoreCp / 100).toFixed(1);
        displayText = pawns > 0 ? `+${pawns}` : `${pawns}`;
        scoreVal = whiteScoreCp / 100;
      }

      this.updateEvalBar(scoreVal, displayText);
    }

    updateEvalBar(score, text) {
      // Clamped between -8 and +8 for smooth bar display
      const clamped = Math.max(-8, Math.min(8, score));
      // Percentage: 0 score = 50%, +8 = 95%, -8 = 5%
      const percentage = 50 + (clamped / 8) * 45;
      this.dom.evalBarFill.style.height = `${percentage}%`;
      this.dom.evalScoreText.textContent = text || (score >= 0 ? `+${score.toFixed(1)}` : score.toFixed(1));
    }

    // ========================================================================
    // 10. Undo, Hint & Resignation
    // ========================================================================
    handleUndo() {
      if (this.isGameOver || this.engine.isThinking) return;

      const history = this.chess.history();
      if (history.length === 0) {
        this.showToast('No moves to undo');
        return;
      }

      // In Human vs Computer mode:
      // If it's Human's turn: undo computer's move and human's move (2 steps)
      // If Computer made first move and history length is 1, reset to 0
      if (this.chess.turn() === this.humanColor) {
        if (history.length >= 2) {
          this.chess.undo(); // Undo computer
          this.chess.undo(); // Undo human
          this.showToast('Undid last turn (2 moves)');
        } else if (history.length === 1 && this.computerColor === 'w') {
          this.chess.undo();
          this.showToast('Reset opening move');
          // Re-trigger computer opening move
          setTimeout(() => this.handleComputerTurn(), 400);
        }
      }

      this.deselect();
      this.clearArrows();
      this.dom.hintBox.style.display = 'none';
      this.renderBoard();
      this.updateGameInfo();
      this.updateMovesTable();
      this.updateEvalBar(0);
    }

    handleHint() {
      if (!this.canHumanMove()) {
        this.showToast('Wait for your turn to get a hint');
        return;
      }

      this.dom.hintBox.style.display = 'block';
      this.dom.hintContent.innerHTML = '<em>Stockfish is analyzing the best strategic move...</em>';

      this.engine.getHint(this.chess.fen(), (bestMove) => {
        if (!bestMove || bestMove === '(none)') {
          this.dom.hintContent.textContent = 'No move found.';
          return;
        }

        const from = bestMove.slice(0, 2);
        const to = bestMove.slice(2, 4);

        // Draw animated hint arrow
        this.drawHintArrow(from, to);

        // Highlight squares
        const fromEl = this.dom.chessboard.querySelector(`[data-square="${from}"]`);
        const toEl = this.dom.chessboard.querySelector(`[data-square="${to}"]`);
        if (fromEl) fromEl.classList.add('hint-square');
        if (toEl) toEl.classList.add('hint-square');

        // Formulate friendly advice
        const piece = this.chess.get(from);
        const pieceNames = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
        const pieceName = piece ? pieceNames[piece.type] : 'Piece';
        this.dom.hintContent.innerHTML = `Move <strong>${pieceName}</strong> from <strong>${from}</strong> to <strong>${to}</strong>.<br><span style="color:var(--text-muted);font-size:0.8rem;">Controls key squares and improves positional advantage.</span>`;
      });
    }

    drawHintArrow(from, to) {
      this.clearArrows();

      const orientation = this.getBoardOrientation();
      const getSquareCenter = (sq) => {
        const file = sq.charCodeAt(0) - 97; // 0..7
        const rank = parseInt(sq[1], 10) - 1; // 0..7

        const col = orientation === 'w' ? file : 7 - file;
        const row = orientation === 'w' ? 7 - rank : rank;

        // SVG viewBox is 800 x 800
        const x = col * 100 + 50;
        const y = row * 100 + 50;
        return { x, y };
      };

      const start = getSquareCenter(from);
      const end = getSquareCenter(to);

      // Shorten the arrow line slightly so the marker arrow head points cleanly
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const offset = 28;
      const endX = end.x - (dx / dist) * offset;
      const endY = end.y - (dy / dist) * offset;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', start.x);
      line.setAttribute('y1', start.y);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      line.setAttribute('class', 'hint-arrow');
      line.setAttribute('marker-end', 'url(#arrowhead-hint)');

      this.dom.svgArrows.appendChild(line);
    }

    clearArrows() {
      this.dom.svgArrows.innerHTML = '';
      const hintSquares = this.dom.chessboard.querySelectorAll('.hint-square');
      hintSquares.forEach(el => el.classList.remove('hint-square'));
    }

    handleResignation() {
      this.isGameOver = true;
      this.engine.stop();
      this.sound.playGameOver(false);

      this.dom.statusPrimaryText.textContent = 'Human Resigned';
      this.dom.statusSecondaryText.textContent = 'Stockfish AI wins by resignation.';

      this.showGameOverModal(
        'Stockfish AI Wins!',
        'You resigned the game.',
        false
      );
    }

    // ========================================================================
    // 11. Game Status & Over Conditions
    // ========================================================================
    checkGameOver() {
      if (this.chess.isCheckmate()) {
        this.isGameOver = true;
        const winnerColor = this.chess.turn() === 'w' ? 'b' : 'w';
        const humanWon = winnerColor === this.humanColor;

        this.sound.playGameOver(humanWon);

        const winnerTitle = humanWon ? 'Victory! You Win!' : 'Defeat! Stockfish Wins!';
        const winnerSubtitle = humanWon
          ? `Spectacular play! You defeated Stockfish AI (${this.engine.difficultyLevel}) by checkmate.`
          : 'Stockfish AI checkmated your king.';

        this.dom.statusPrimaryText.textContent = 'Checkmate!';
        this.dom.statusSecondaryText.textContent = humanWon ? 'Human wins!' : 'Computer wins!';

        this.showGameOverModal(winnerTitle, winnerSubtitle, humanWon);
        return true;
      }

      if (this.chess.isStalemate()) {
        this.isGameOver = true;
        this.sound.playGameOver(false);
        this.dom.statusPrimaryText.textContent = 'Stalemate!';
        this.dom.statusSecondaryText.textContent = 'Game is a draw (no legal moves available).';
        this.showGameOverModal('Draw by Stalemate', 'Neither player has a legal move.', false);
        return true;
      }

      if (this.chess.isThreefoldRepetition()) {
        this.isGameOver = true;
        this.sound.playGameOver(false);
        this.dom.statusPrimaryText.textContent = 'Draw!';
        this.dom.statusSecondaryText.textContent = 'Draw by threefold repetition.';
        this.showGameOverModal('Draw (Threefold Repetition)', 'The exact same board position occurred three times.', false);
        return true;
      }

      if (this.chess.isInsufficientMaterial()) {
        this.isGameOver = true;
        this.sound.playGameOver(false);
        this.dom.statusPrimaryText.textContent = 'Draw!';
        this.dom.statusSecondaryText.textContent = 'Draw by insufficient material.';
        this.showGameOverModal('Draw (Insufficient Material)', 'Neither side has sufficient pieces to deliver checkmate.', false);
        return true;
      }

      if (this.chess.isDraw()) {
        this.isGameOver = true;
        this.sound.playGameOver(false);
        this.dom.statusPrimaryText.textContent = 'Draw!';
        this.dom.statusSecondaryText.textContent = 'Game drawn by 50-move rule.';
        this.showGameOverModal('Draw (50-Move Rule)', 'Fifty moves occurred without a pawn move or capture.', false);
        return true;
      }

      return false;
    }

    showGameOverModal(title, subtitle, humanWon) {
      this.dom.modalResultTitle.textContent = title;
      this.dom.modalResultSubtitle.textContent = subtitle;
      document.getElementById('modal-result-icon').textContent = humanWon ? '🏆' : '👑';

      this.dom.modalStatMoves.textContent = Math.ceil(this.chess.history().length / 2).toString();
      this.dom.modalStatDiff.textContent = this.engine.difficultyLevel.toUpperCase();

      // Show what color human will play NEXT
      const nextColor = this.humanColor === 'w' ? 'Black' : 'White';
      this.dom.modalStatNextColor.textContent = nextColor;

      setTimeout(() => {
        this.dom.gameOverModal.style.display = 'flex';
      }, 700);
    }

    // ========================================================================
    // 12. Information Panels, Captured Pieces & History
    // ========================================================================
    updateGameInfo() {
      const turn = this.chess.turn();
      const isHumanTurn = turn === this.humanColor;

      // Color Cycle Notice
      this.dom.colorCycleNotice.textContent = `Game ${this.gameNumber} • Human: ${this.humanColor === 'w' ? 'White' : 'Black'} | AI: ${this.computerColor === 'w' ? 'White' : 'Black'}`;

      // Player Badges
      this.dom.topPlayerName.textContent = 'Stockfish AI';
      this.dom.topPlayerColorBadge.textContent = this.computerColor === 'w' ? 'White' : 'Black';
      this.dom.topPlayerColorBadge.className = `color-badge ${this.computerColor === 'w' ? 'badge-white' : 'badge-black'}`;

      this.dom.bottomPlayerName.textContent = 'You (Human)';
      this.dom.bottomPlayerColorBadge.textContent = this.humanColor === 'w' ? 'White' : 'Black';
      this.dom.bottomPlayerColorBadge.className = `color-badge ${this.humanColor === 'w' ? 'badge-white' : 'badge-black'}`;

      // Turn styling
      if (isHumanTurn) {
        this.dom.bottomPlayerCard.classList.add('active-turn');
        this.dom.topPlayerCard.classList.remove('active-turn');
        this.dom.humanTurnPill.style.display = 'inline-block';
        this.dom.turnBannerText.textContent = `${this.humanColor === 'w' ? 'White' : 'Black'} (Your turn)`;
      } else {
        this.dom.bottomPlayerCard.classList.remove('active-turn');
        this.dom.topPlayerCard.classList.add('active-turn');
        this.dom.humanTurnPill.style.display = 'none';
        this.dom.turnBannerText.textContent = `${this.computerColor === 'w' ? 'White' : 'Black'} (AI is thinking)`;
      }

      // Check Status
      if (!this.isGameOver) {
        if (this.chess.inCheck()) {
          this.dom.statusPrimaryText.textContent = 'Check!';
          this.dom.statusSecondaryText.textContent = `${turn === 'w' ? 'White' : 'Black'} king is under attack!`;
        } else {
          this.dom.statusPrimaryText.textContent = isHumanTurn ? 'Your Turn' : 'Computer Thinking...';
          this.dom.statusSecondaryText.textContent = isHumanTurn ? 'Select a piece to make your move.' : 'Stockfish is calculating optimal lines.';
        }
      }

      // Update captured pieces & material leads
      this.updateCapturedPieces();
    }

    updateCapturedPieces() {
      // Standard piece counts
      const standard = { p: 8, n: 2, b: 2, r: 2, q: 1 };
      const currentWhite = { p: 0, n: 0, b: 0, r: 0, q: 0 };
      const currentBlack = { p: 0, n: 0, b: 0, r: 0, q: 0 };

      const board = this.chess.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type !== 'k') {
            if (p.color === 'w') currentWhite[p.type]++;
            else currentBlack[p.type]++;
          }
        }
      }

      // Captured by White = Black pieces lost
      const capturedByWhite = [];
      // Captured by Black = White pieces lost
      const capturedByBlack = [];

      const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
      let whiteScore = 0;
      let blackScore = 0;

      ['q', 'r', 'b', 'n', 'p'].forEach(type => {
        const whiteLost = Math.max(0, standard[type] - currentWhite[type]);
        const blackLost = Math.max(0, standard[type] - currentBlack[type]);

        for (let i = 0; i < blackLost; i++) {
          capturedByWhite.push({ color: 'b', type });
          whiteScore += pieceValues[type];
        }
        for (let i = 0; i < whiteLost; i++) {
          capturedByBlack.push({ color: 'w', type });
          blackScore += pieceValues[type];
        }
      });

      // Render pieces captured by Top Player and Bottom Player
      const topIsWhite = this.computerColor === 'w';
      const topCaptured = topIsWhite ? capturedByWhite : capturedByBlack;
      const bottomCaptured = topIsWhite ? capturedByBlack : capturedByWhite;

      this.renderCapturedList(this.dom.topCapturedList, topCaptured);
      this.renderCapturedList(this.dom.bottomCapturedList, bottomCaptured);

      // Material Advantage Leads
      const diff = topIsWhite ? whiteScore - blackScore : blackScore - whiteScore;
      if (diff > 0) {
        this.dom.topMaterialLead.textContent = `+${diff}`;
        this.dom.bottomMaterialLead.textContent = '';
      } else if (diff < 0) {
        this.dom.topMaterialLead.textContent = '';
        this.dom.bottomMaterialLead.textContent = `+${Math.abs(diff)}`;
      } else {
        this.dom.topMaterialLead.textContent = '';
        this.dom.bottomMaterialLead.textContent = '';
      }
    }

    renderCapturedList(container, list) {
      container.innerHTML = '';
      list.forEach(p => {
        const el = document.createElement('div');
        el.className = `captured-piece piece-${p.color}${p.type}`;
        container.appendChild(el);
      });
    }

    updateMovesTable() {
      const history = this.chess.history();
      this.dom.movesTbody.innerHTML = '';

      if (history.length === 0) {
        this.dom.emptyMovesMsg.style.display = 'flex';
        this.dom.moveCounter.textContent = '0 moves';
        return;
      }

      this.dom.emptyMovesMsg.style.display = 'none';
      this.dom.moveCounter.textContent = `${history.length} moves`;

      for (let i = 0; i < history.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = history[i];
        const blackMove = history[i + 1] || '';

        const tr = document.createElement('tr');

        const tdNum = document.createElement('td');
        tdNum.className = 'move-num-cell';
        tdNum.textContent = `${moveNumber}.`;

        const tdWhite = document.createElement('td');
        tdWhite.className = 'move-cell';
        tdWhite.textContent = whiteMove;

        const tdBlack = document.createElement('td');
        tdBlack.className = 'move-cell';
        tdBlack.textContent = blackMove;

        tr.appendChild(tdNum);
        tr.appendChild(tdWhite);
        tr.appendChild(tdBlack);
        this.dom.movesTbody.appendChild(tr);
      }

      // Auto-scroll table to the bottom
      this.dom.movesContainer.scrollTop = this.dom.movesContainer.scrollHeight;
    }

    // ========================================================================
    // 13. Modals & Toast Utilities
    // ========================================================================
    showConfirm(title, message, onConfirm) {
      this.dom.confirmModalTitle.textContent = title;
      this.dom.confirmModalMessage.textContent = message;
      this.dom.confirmModal.style.display = 'flex';

      const handleYes = () => {
        cleanup();
        this.dom.confirmModal.style.display = 'none';
        onConfirm();
      };

      const handleNo = () => {
        cleanup();
        this.dom.confirmModal.style.display = 'none';
      };

      const cleanup = () => {
        this.dom.confirmBtnYes.removeEventListener('click', handleYes);
        this.dom.confirmBtnNo.removeEventListener('click', handleNo);
      };

      this.dom.confirmBtnYes.addEventListener('click', handleYes);
      this.dom.confirmBtnNo.addEventListener('click', handleNo);
    }

    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      this.dom.toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
      }, 2400);
    }
  }

  // ==========================================================================
  // Initialize Application on DOM Ready
  // ==========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    window.chessApp = new ChessApp();
  });
})();
