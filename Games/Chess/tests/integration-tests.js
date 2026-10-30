/**
 *   Chess — Automated Integration Test Suite
 * Exercises the real UI, DOM elements, modals, user events, and chess engine together.
 */

(function () {
  'use strict';

  class IntegrationRunner {
    constructor() {
      this.tests = [];
      this.total = 0;
      this.passed = 0;
      this.failed = 0;
      this.startTime = 0;
    }

    add(name, fn) {
      this.tests.push({ name, fn });
    }

    async run() {
      this.total = this.tests.length;
      this.passed = 0;
      this.failed = 0;
      this.startTime = performance.now();

      const results = [];
      const statusEl = document.getElementById('sandbox-status');

      for (let i = 0; i < this.tests.length; i++) {
        const t = this.tests[i];
        if (statusEl) statusEl.textContent = `Running ${i + 1}/${this.total}: ${t.name}`;
        let pass = false;
        let err = null;

        try {
          await t.fn(this.getAppWindow());
          pass = true;
          this.passed++;
        } catch (e) {
          pass = false;
          err = e;
          this.failed++;
        }

        results.push({
          name: t.name,
          passed: pass,
          error: err ? (err.message || String(err)) : null,
          stack: err ? err.stack : null
        });

        this.renderProgress(results);
        await new Promise(r => setTimeout(r, 60)); // Brief visual pause between tests
      }

      if (statusEl) statusEl.textContent = `Complete: ${this.passed}/${this.total} passed`;
      this.renderProgress(results);
    }

    getAppWindow() {
      const iframe = document.getElementById('sandbox-frame');
      try {
        if (iframe && iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.ChessApp) {
          return iframe.contentWindow;
        }
      } catch (e) {
        // Cross-origin file:// fallback
      }
      return window;
    }

    renderProgress(results) {
      document.getElementById('stat-total').textContent = this.total;
      document.getElementById('stat-passed').textContent = this.passed;
      document.getElementById('stat-failed').textContent = this.failed;
      document.getElementById('stat-duration').textContent = `${Math.round(performance.now() - this.startTime)}ms`;

      const container = document.getElementById('integration-results-container');
      if (!container) return;
      container.innerHTML = '';

      const suiteEl = document.createElement('div');
      suiteEl.className = 'test-suite-section';

      const header = document.createElement('div');
      header.className = 'suite-header';
      header.innerHTML = `
        <span>End-to-End DOM Integration Tests</span>
        <span style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--text-secondary);">
          ${this.passed}/${this.total} passed
        </span>
      `;
      suiteEl.appendChild(header);

      for (const res of results) {
        const item = document.createElement('div');
        item.className = 'test-item';

        const row = document.createElement('div');
        row.className = 'test-main-row';

        const name = document.createElement('span');
        name.className = 'test-name';
        name.innerHTML = `${res.passed ? '✔' : '✖'} ${res.name}`;
        name.style.color = res.passed ? 'var(--text-primary)' : 'var(--accent-rose)';

        const badge = document.createElement('span');
        badge.className = `test-status-badge ${res.passed ? 'badge-pass' : 'badge-fail'}`;
        badge.textContent = res.passed ? 'PASS' : 'FAIL';

        row.appendChild(name);
        row.appendChild(badge);
        item.appendChild(row);

        if (!res.passed) {
          const detail = document.createElement('div');
          detail.className = 'failure-detail';
          detail.textContent = `Integration Error: ${res.error}\n\n${res.stack || ''}`;
          item.appendChild(detail);
        }

        suiteEl.appendChild(item);
      }

      container.appendChild(suiteEl);
    }
  }

  // Assertion helpers for integration tests
  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message ? message + ' — ' : ''}Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
  }

  const runner = new IntegrationRunner();

  // Helper to click a square in the sandbox iframe
  function clickSquare(appWin, sqName) {
    const sq = appWin.ChessEngine.nameToSq(sqName);
    const sqEl = appWin.document.querySelector(`.square[data-sq="${sq}"]`);
    assert(sqEl, `Square element for ${sqName} must exist`);
    sqEl.click();
  }

  // 1. Initial Board Verification
  runner.add('1. Initial Board has exactly 64 squares and 32 piece elements in DOM', async (win) => {
    win.ChessApp.startNewGame();
    const squares = win.document.querySelectorAll('.square');
    assertEqual(squares.length, 64, 'Exactly 64 squares present');

    const pieces = win.document.querySelectorAll('.square .piece');
    assertEqual(pieces.length, 32, 'Exactly 32 initial pieces present');
  });

  // 2. Select Piece and Move via Click
  runner.add('2. User can select piece and make legal move using square clicks', async (win) => {
    win.ChessApp.startNewGame();
    // Click e2
    clickSquare(win, 'e2');
    const selSq = win.document.querySelector('.square.sq-selected');
    assert(selSq, 'Square e2 should receive sq-selected class');

    // Click e4
    clickSquare(win, 'e4');
    const e4Sq = win.document.querySelector(`.square[data-sq="${win.ChessEngine.nameToSq('e4')}"]`);
    assert(e4Sq.querySelector('.piece'), 'Piece should now exist on e4');
    assertEqual(win.ChessApp.pos.turn, 'b', 'Turn transitioned to Black');
  });

  // 3. Attempt Illegal Move
  runner.add('3. Attempting an illegal move rejects without modifying position', async (win) => {
    win.ChessApp.startNewGame();
    const initialFen = win.ChessEngine.getFen(win.ChessApp.pos);

    // Click e2, then click e5 (illegal move)
    clickSquare(win, 'e2');
    clickSquare(win, 'e5');

    const afterFen = win.ChessEngine.getFen(win.ChessApp.pos);
    assertEqual(afterFen, initialFen, 'Board state must remain unchanged');
    assertEqual(win.ChessApp.pos.turn, 'w', 'Turn remains White');
  });

  // 4. Play Legal Opening Sequence & Verify SAN History
  runner.add('4. Play legal opening sequence (e4, e5, Nf3, Nc6) and verify SAN move list', async (win) => {
    win.ChessApp.startNewGame();
    // 1. e4 e5
    clickSquare(win, 'e2'); clickSquare(win, 'e4');
    clickSquare(win, 'e7'); clickSquare(win, 'e5');
    // 2. Nf3 Nc6
    clickSquare(win, 'g1'); clickSquare(win, 'f3');
    clickSquare(win, 'b8'); clickSquare(win, 'c6');

    const moveCells = win.document.querySelectorAll('.move-cell');
    assertEqual(moveCells.length, 4, '4 moves in history table');
    assertEqual(moveCells[0].textContent, 'e4');
    assertEqual(moveCells[1].textContent, 'e5');
    assertEqual(moveCells[2].textContent, 'Nf3');
    assertEqual(moveCells[3].textContent, 'Nc6');
  });

  // 5. Castling Execution in DOM
  runner.add('5. Castling legally moves both King and Rook elements in DOM', async (win) => {
    // Load position with open space for White Kingside castling
    win.ChessApp.pos = win.ChessEngine.createGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    win.ChessApp.render();

    // Click e1, then click g1
    clickSquare(win, 'e1');
    clickSquare(win, 'g1');

    const g1Sq = win.document.querySelector(`.square[data-sq="${win.ChessEngine.nameToSq('g1')}"]`);
    const f1Sq = win.document.querySelector(`.square[data-sq="${win.ChessEngine.nameToSq('f1')}"]`);
    const e1Sq = win.document.querySelector(`.square[data-sq="${win.ChessEngine.nameToSq('e1')}"]`);
    const h1Sq = win.document.querySelector(`.square[data-sq="${win.ChessEngine.nameToSq('h1')}"]`);

    assert(g1Sq.querySelector('.piece'), 'King must be on g1');
    assert(f1Sq.querySelector('.piece'), 'Rook must be on f1');
    assert(!e1Sq.querySelector('.piece'), 'e1 must be empty');
    assert(!h1Sq.querySelector('.piece'), 'h1 must be empty');
  });

  // 6. En Passant Execution in DOM
  runner.add('6. En passant capture removes enemy pawn from DOM and increments score', async (win) => {
    // White pawn on e5, Black pawn plays d7-d5
    win.ChessApp.pos = win.ChessEngine.createGame('rnbqkbnr/ppp1pppp/8/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2');
    win.ChessApp.render();

    clickSquare(win, 'd7'); clickSquare(win, 'd5');
    // White captures exd6
    clickSquare(win, 'e5'); clickSquare(win, 'd6');

    const d5Sq = win.document.querySelector(`.square[data-sq="${win.ChessEngine.nameToSq('d5')}"]`);
    const d6Sq = win.document.querySelector(`.square[data-sq="${win.ChessEngine.nameToSq('d6')}"]`);
    assert(!d5Sq.querySelector('.piece'), 'Captured pawn on d5 must be removed from DOM');
    assert(d6Sq.querySelector('.piece'), 'White pawn is now on d6');
  });

  // 7. Promotion Modal & Execution
  runner.add('7. Pawn promotion opens selection dialog and places promoted Queen', async (win) => {
    win.ChessApp.pos = win.ChessEngine.createGame('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    win.ChessApp.render();

    // Click e7, then e8
    clickSquare(win, 'e7');
    clickSquare(win, 'e8');

    const promoModal = win.document.getElementById('promotion-modal');
    assert(promoModal.classList.contains('open'), 'Promotion modal must open');

    // Click Queen choice
    const promoButtons = win.document.querySelectorAll('.promotion-choice-btn');
    assert(promoButtons.length === 4, '4 promotion piece choices');
    promoButtons[0].click(); // Queen choice

    assert(!promoModal.classList.contains('open'), 'Promotion modal closed');
    const e8Sq = win.document.querySelector(`.square[data-sq="${win.ChessEngine.nameToSq('e8')}"]`);
    assert(e8Sq.querySelector('.piece'), 'Promoted Queen present on e8');
  });

  // 8. Checkmate Detection in DOM
  runner.add("8. Checkmate triggers gameover modal and displays winner message", async (win) => {
    win.ChessApp.startNewGame();
    // Fool's mate: 1. f3 e5 2. g4 Qh4#
    clickSquare(win, 'f2'); clickSquare(win, 'f3');
    clickSquare(win, 'e7'); clickSquare(win, 'e5');
    clickSquare(win, 'g2'); clickSquare(win, 'g4');
    clickSquare(win, 'd8'); clickSquare(win, 'h4');

    const modal = win.document.getElementById('gameover-modal');
    assert(modal.classList.contains('open'), 'Game over modal should open');
    const summary = win.document.getElementById('gameover-summary-text');
    assert(summary.textContent.includes('Black wins'), 'Black announced as winner');
    win.ChessApp.closeModal('gameover-modal');
  });

  // 9. Undo & Redo Consistency
  runner.add('9. Undo and redo controls restore exact position and move lists', async (win) => {
    win.ChessApp.startNewGame();
    clickSquare(win, 'e2'); clickSquare(win, 'e4');
    const fenAfterE4 = win.ChessEngine.getFen(win.ChessApp.pos);

    win.document.getElementById('btn-undo-move').click();
    assertEqual(win.ChessEngine.getFen(win.ChessApp.pos), win.ChessEngine.STARTING_FEN, 'Starting FEN restored');

    win.document.getElementById('btn-redo-move').click();
    assertEqual(win.ChessEngine.getFen(win.ChessApp.pos), fenAfterE4, 'FEN restored after redo');
  });

  // 10. Board Flip
  runner.add('10. Flip Board toggles rotation style on board container', async (win) => {
    win.ChessApp.startNewGame();
    const boardEl = win.document.getElementById('chess-board');
    win.document.getElementById('btn-flip-board').click();
    assert(boardEl.style.transform.includes('rotate(180deg)'), 'Board rotated 180 degrees');

    win.document.getElementById('btn-flip-board').click();
    assertEqual(boardEl.style.transform, 'none', 'Board restored to standard rotation');
  });

  // 11. Theme Switcher & Settings Persistence
  runner.add('11. Theme toggle switches dataset attribute on document body', async (win) => {
    const initialTheme = win.document.body.dataset.boardTheme;
    win.document.getElementById('btn-theme-toggle').click();
    const nextTheme = win.document.body.dataset.boardTheme;
    assert(nextTheme !== initialTheme, 'Board theme dataset attribute changed');
  });

  // 12. FEN Export & Import Modal
  runner.add('12. FEN modal exports current FEN and loads custom valid FEN', async (win) => {
    win.ChessApp.startNewGame();
    win.document.getElementById('btn-export-import').click();

    const fenInput = win.document.getElementById('fen-io-input');
    assertEqual(fenInput.value, win.ChessEngine.STARTING_FEN, 'FEN input holds starting position');

    // Set custom FEN
    const customFen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    fenInput.value = customFen;
    win.document.getElementById('btn-load-fen').click();

    assertEqual(win.ChessEngine.getFen(win.ChessApp.pos), customFen, 'Custom FEN loaded successfully');
  });

  // 13. PGN Export & Import Modal
  runner.add('13. PGN import reproduces move history accurately', async (win) => {
    win.ChessApp.startNewGame();
    win.document.getElementById('btn-export-import').click();

    const pgnInput = win.document.getElementById('pgn-io-input');
    pgnInput.value = '1. e4 e5 2. Nf3 Nc6';
    win.document.getElementById('btn-load-pgn').click();

    assertEqual(win.ChessApp.pos.history.length, 4, '4 moves loaded from PGN');
    assertEqual(win.ChessApp.pos.history[3].san, 'Nc6');
  });

  // 14. Sound Toggle
  runner.add('14. Sound toggle toggles mute status and updates icon', async (win) => {
    const initialSound = win.ChessSound.enabled;
    win.document.getElementById('btn-sound-toggle').click();
    assertEqual(win.ChessSound.enabled, !initialSound, 'Audio enabled state flipped');
    win.document.getElementById('btn-sound-toggle').click();
    assertEqual(win.ChessSound.enabled, initialSound, 'Audio enabled state restored');
  });

  // 15. Resign Dialog
  runner.add('15. Resign modal opens and awards victory to opponent on confirmation', async (win) => {
    win.ChessApp.startNewGame();
    win.document.getElementById('btn-resign').click();
    const resignModal = win.document.getElementById('resign-modal');
    assert(resignModal.classList.contains('open'), 'Resign modal is open');

    win.document.getElementById('btn-confirm-resign').click();
    const gameoverSummary = win.document.getElementById('gameover-summary-text');
    assert(gameoverSummary.textContent.includes('Black wins'), 'Black wins by White resignation');
    win.ChessApp.closeModal('gameover-modal');
  });

  // 16. Robot vs Manual Play Switcher
  runner.add('16. Mode Switcher bar toggles between Robot AI and Manual 2-Player modes', async (win) => {
    // Switch to Manual
    win.document.getElementById('btn-mode-manual').click();
    assertEqual(win.ChessApp.activeMode, 'local-2p', 'Mode is local-2p');
    assert(win.document.getElementById('btn-mode-manual').classList.contains('active'), 'Manual button active');
    const topName = win.document.getElementById('top-name');
    assertEqual(topName.textContent, 'Player 2 (Black)', 'Player 2 (Black) label in Manual mode');

    // Switch to Robot
    win.document.getElementById('btn-mode-robot').click();
    assertEqual(win.ChessApp.activeMode, 'vs-computer', 'Mode is vs-computer');
    assert(win.document.getElementById('btn-mode-robot').classList.contains('active'), 'Robot button active');
    assert(topName.textContent.includes('Cyber Robot'), 'Cyber Robot label in Robot AI mode');
  });

  // 17. Robot Level and Side Selection
  runner.add('17. Robot Level select and Side picker update difficulty and board orientation', async (win) => {
    // Select Robot difficulty Level 4
    const diffSelect = win.document.getElementById('select-robot-difficulty');
    diffSelect.value = '4';
    diffSelect.dispatchEvent(new Event('change'));
    assertEqual(win.ChessApp.aiDifficulty, 4, 'Difficulty set to 4');

    // Select Black side
    win.document.getElementById('btn-choose-black').click();
    assertEqual(win.ChessApp.userColor, 'black', 'User plays as Black');
    assert(win.ChessApp.boardFlipped, 'Board automatically flipped for Black');

    // Restore to White side
    win.document.getElementById('btn-choose-white').click();
    assertEqual(win.ChessApp.userColor, 'white', 'User plays as White');
    assert(!win.ChessApp.boardFlipped, 'Board orientation restored to White');
  });

  // Wait for iframe to load before auto-running
  window.integrationRunner = runner;
  window.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('sandbox-frame');
    let hasRun = false;
    const startRunner = () => {
      if (!hasRun) {
        hasRun = true;
        runner.run();
      }
    };

    if (iframe) {
      iframe.onload = () => startRunner();
    }
    setTimeout(startRunner, 600);

    document.getElementById('btn-rerun-integration')?.addEventListener('click', () => runner.run());
  });

})();
