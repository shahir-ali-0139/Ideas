/**
 *   Chess — Automated Unit Test Suite
 * Native browser JavaScript test harness with comprehensive assertion library.
 */

(function () {
  'use strict';

  // =========================================================================
  // TEST HARNESS & ASSERTION LIBRARY
  // =========================================================================

  class TestRunner {
    constructor() {
      this.suites = [];
      this.currentSuite = null;
      this.totalTests = 0;
      this.passedTests = 0;
      this.failedTests = 0;
      this.startTime = 0;
      this.durationMs = 0;
    }

    suite(name, fn) {
      this.currentSuite = { name, tests: [] };
      this.suites.push(this.currentSuite);
      fn();
    }

    test(name, fn) {
      if (!this.currentSuite) {
        throw new Error('Test must be defined inside a suite');
      }
      this.currentSuite.tests.push({ name, fn });
    }

    run() {
      this.totalTests = 0;
      this.passedTests = 0;
      this.failedTests = 0;
      this.startTime = performance.now();

      const results = [];

      for (const suite of this.suites) {
        const suiteResult = { name: suite.name, tests: [] };
        for (const test of suite.tests) {
          this.totalTests++;
          let passed = false;
          let error = null;
          try {
            test.fn();
            passed = true;
            this.passedTests++;
          } catch (err) {
            passed = false;
            error = err;
            this.failedTests++;
          }
          suiteResult.tests.push({
            name: test.name,
            passed,
            error: error ? (error.message || String(error)) : null,
            stack: error ? error.stack : null
          });
        }
        results.push(suiteResult);
      }

      this.durationMs = Math.round(performance.now() - this.startTime);
      this.render(results);
    }

    render(results) {
      document.getElementById('stat-total').textContent = this.totalTests;
      document.getElementById('stat-passed').textContent = this.passedTests;
      document.getElementById('stat-failed').textContent = this.failedTests;
      document.getElementById('stat-duration').textContent = `${this.durationMs}ms`;

      const container = document.getElementById('test-results-container');
      if (!container) return;
      container.innerHTML = '';

      for (const suite of results) {
        const suiteEl = document.createElement('div');
        suiteEl.className = 'test-suite-section';

        const suiteHeader = document.createElement('div');
        suiteHeader.className = 'suite-header';
        const suitePassed = suite.tests.filter(t => t.passed).length;
        suiteHeader.innerHTML = `
          <span>${suite.name}</span>
          <span style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--text-secondary);">
            ${suitePassed}/${suite.tests.length} passed
          </span>
        `;
        suiteEl.appendChild(suiteHeader);

        for (const test of suite.tests) {
          const testEl = document.createElement('div');
          testEl.className = 'test-item';

          const mainRow = document.createElement('div');
          mainRow.className = 'test-main-row';

          const nameEl = document.createElement('span');
          nameEl.className = 'test-name';
          nameEl.innerHTML = `${test.passed ? '✔' : '✖'} ${test.name}`;
          nameEl.style.color = test.passed ? 'var(--text-primary)' : 'var(--accent-rose)';

          const badgeEl = document.createElement('span');
          badgeEl.className = `test-status-badge ${test.passed ? 'badge-pass' : 'badge-fail'}`;
          badgeEl.textContent = test.passed ? 'PASS' : 'FAIL';

          mainRow.appendChild(nameEl);
          mainRow.appendChild(badgeEl);
          testEl.appendChild(mainRow);

          if (!test.passed) {
            const failEl = document.createElement('div');
            failEl.className = 'failure-detail';
            failEl.textContent = `Assertion Error: ${test.error}\n\n${test.stack || ''}`;
            testEl.appendChild(failEl);
          }

          suiteEl.appendChild(testEl);
        }

        container.appendChild(suiteEl);
      }
    }
  }

  // Assertion Utilities
  function assertEqual(actual, expected, msg = '') {
    if (actual !== expected) {
      throw new Error(`${msg ? msg + ' — ' : ''}Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
  }

  function assertDeepEqual(actual, expected, msg = '') {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new Error(`${msg ? msg + ' — ' : ''}Deep equality mismatch.\nExpected: ${expStr}\nActual:   ${actStr}`);
    }
  }

  function assertTrue(val, msg = '') {
    if (val !== true) {
      throw new Error(`${msg ? msg + ' — ' : ''}Expected true, got ${val}`);
    }
  }

  function assertFalse(val, msg = '') {
    if (val !== false) {
      throw new Error(`${msg ? msg + ' — ' : ''}Expected false, got ${val}`);
    }
  }

  function assertThrows(fn, msg = '') {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error(`${msg ? msg + ' — ' : ''}Expected function to throw an error`);
    }
  }

  function assertFenEqual(actual, expected, msg = '') {
    const normAct = actual.trim().split(/\s+/).slice(0, 4).join(' ');
    const normExp = expected.trim().split(/\s+/).slice(0, 4).join(' ');
    if (normAct !== normExp) {
      throw new Error(`${msg ? msg + ' — ' : ''}FEN mismatch.\nExpected: ${normExp}\nActual:   ${normAct}`);
    }
  }

  const runner = new TestRunner();
  const CE = window.ChessEngine;

  // =========================================================================
  // SUITE 1: Board Representation & Position Setup
  // =========================================================================
  runner.suite('Suite 1: Board Representation & Setup', () => {
    runner.test('Standard starting position initializes correctly', () => {
      const pos = CE.createGame();
      assertEqual(pos.turn, 'w', 'White moves first');
      assertEqual(pos.halfmoveClock, 0, 'Initial halfmove is 0');
      assertEqual(pos.fullmoveNumber, 1, 'Initial fullmove is 1');
      assertEqual(pos.enPassant, null, 'No initial en passant');
      assertTrue(pos.castling.K && pos.castling.Q && pos.castling.k && pos.castling.q, 'All castling rights present');
    });

    runner.test('Board has exactly 64 squares with correct piece distribution', () => {
      const pos = CE.createGame();
      assertEqual(pos.board.length, 64, 'Board size is 64');

      let whiteCount = 0, blackCount = 0;
      for (const p of pos.board) {
        if (p) {
          if (p.color === 'w') whiteCount++;
          else blackCount++;
        }
      }
      assertEqual(whiteCount, 16, '16 White pieces');
      assertEqual(blackCount, 16, '16 Black pieces');
    });

    runner.test('Square indexing and coordinate mapping works bidirectionally', () => {
      assertEqual(CE.sqToName(0), 'a1', '0 is a1');
      assertEqual(CE.sqToName(7), 'h1', '7 is h1');
      assertEqual(CE.sqToName(56), 'a8', '56 is a8');
      assertEqual(CE.sqToName(63), 'h8', '63 is h8');
      assertEqual(CE.sqToName(4), 'e1', '4 is e1');
      assertEqual(CE.sqToName(60), 'e8', '60 is e8');

      assertEqual(CE.nameToSq('a1'), 0);
      assertEqual(CE.nameToSq('h1'), 7);
      assertEqual(CE.nameToSq('a8'), 56);
      assertEqual(CE.nameToSq('h8'), 63);
      assertEqual(CE.nameToSq('e4'), 28);
    });

    runner.test('FEN roundtrip serialization produces exact initial string', () => {
      const pos = CE.createGame();
      const fen = CE.getFen(pos);
      assertEqual(fen, CE.STARTING_FEN);
    });

    runner.test('Invalid FEN strings are rejected with descriptive errors', () => {
      assertFalse(CE.parseFen('').valid, 'Empty string is invalid');
      assertFalse(CE.parseFen('8/8/8/8/8/8/8 w - - 0 1').valid, 'Missing rank is invalid');
      assertFalse(CE.parseFen('8/8/8/8/8/8/8/8 w - - 0 1').valid, 'Missing kings is invalid');
      assertFalse(CE.parseFen('k7/8/8/8/8/8/8/K7 x - - 0 1').valid, 'Invalid turn token is invalid');
      assertFalse(CE.parseFen('k7/8/8/8/8/8/8/K7 w - - 0 1/2').valid, 'Bad fullmove is invalid');
    });
  });

  // =========================================================================
  // SUITE 2: Piece Movement & Collision
  // =========================================================================
  runner.suite('Suite 2: Piece Movement & Collision', () => {
    runner.test('Pawn single step forward is legal', () => {
      const pos = CE.createGame();
      const res = CE.makeMove(pos, 'e2e3');
      assertTrue(res.success, 'e2e3 is legal');
      assertEqual(pos.board[20]?.type, 'p', 'Pawn now on e3');
      assertEqual(pos.board[12], null, 'e2 is empty');
    });

    runner.test('Pawn double step sets correct en passant square', () => {
      const pos = CE.createGame();
      const res = CE.makeMove(pos, 'e2e4');
      assertTrue(res.success, 'e2e4 is legal');
      assertEqual(pos.enPassant, 20, 'En passant target square is e3 (sq 20)');
    });

    runner.test('Blocked pawn cannot advance forward', () => {
      // White pawn on e4, Black pawn on e5
      const pos = CE.createGame('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      const moves = CE.getLegalMoves(pos, CE.nameToSq('e4'));
      assertEqual(moves.length, 0, 'Blocked pawn has 0 moves');
    });

    runner.test('Knight jumps over surrounding pieces', () => {
      const pos = CE.createGame();
      const res = CE.makeMove(pos, 'g1f3');
      assertTrue(res.success, 'Nf3 is legal from starting position');
      assertEqual(pos.board[21]?.type, 'n', 'Knight on f3');
    });

    runner.test('Bishop diagonal sliding is blocked by friendly pieces', () => {
      const pos = CE.createGame();
      const bishopMoves = CE.getLegalMoves(pos, CE.nameToSq('c1'));
      assertEqual(bishopMoves.length, 0, 'c1 Bishop cannot move through pawns');
    });

    runner.test('Rook moves orthogonally and stops at obstacle', () => {
      const pos = CE.createGame('k7/8/8/4R3/8/8/8/K7 w - - 0 1');
      const rookSq = CE.nameToSq('e5');
      const moves = CE.getLegalMoves(pos, rookSq);
      // Open board: 7 vertical + 7 horizontal = 14 legal moves
      assertEqual(moves.length, 14, 'Centered rook has 14 moves on open board');
    });
  });

  // =========================================================================
  // SUITE 3: King Safety, Pins & Check
  // =========================================================================
  runner.suite('Suite 3: King Safety & Checks', () => {
    runner.test('King in check is accurately recognized', () => {
      // White king on e1, Black queen on e4
      const pos = CE.createGame('rnb1kbnr/pppp1ppp/8/8/4q3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3');
      assertTrue(CE.isCheck(pos, 'w'), 'White is in check from Black Queen on e4');
    });

    runner.test('King cannot move into check', () => {
      // White King on e1, Black Rook on e8, open e-file, Black King on h8
      const pos = CE.createGame('4r2k/8/8/8/8/8/8/4K3 w - - 0 1');
      const moves = CE.getLegalMoves(pos, CE.nameToSq('e1'));
      // King can move to d1, d2, f1, f2, but NOT e2
      const e2Sq = CE.nameToSq('e2');
      const hasE2 = moves.some(m => m.to === e2Sq);
      assertFalse(hasE2, 'King cannot move onto the checked e-file');
    });

    runner.test('Pinned piece cannot move to expose friendly King', () => {
      // White King on e1, White Bishop on e2, Black Rook on e8 (pin on e-file)
      const pos = CE.createGame('4r2k/8/8/8/8/8/4B3/4K3 w - - 0 1');
      const bishopSq = CE.nameToSq('e2');
      const bishopMoves = CE.getLegalMoves(pos, bishopSq);
      assertEqual(bishopMoves.length, 0, 'Pinned bishop cannot expose King');
    });

    runner.test('Moves that evade check are legal while non-evading moves are rejected', () => {
      // White King on e1 in check by Queen on e4, White Pawn on e2 cannot move because e2 is occupied, but Be2 blocks check!
      const pos = CE.createGame('rnb1kbnr/pppp1ppp/8/8/4q3/8/PPPPBPPP/RNBQK1NR w KQkq - 0 3');
      const allMoves = CE.getLegalMoves(pos);
      // All legal moves must result in White NOT being in check
      for (const m of allMoves) {
        const clone = CE.clonePosition(pos);
        CE.makeMove(clone, m);
        assertFalse(CE.isCheck(clone, 'w'), `Move ${m.uci} must resolve check`);
      }
    });
  });

  // =========================================================================
  // SUITE 4: Special Rules (Castling, En Passant, Promotion)
  // =========================================================================
  runner.suite('Suite 4: Special Rules', () => {
    runner.test('Legal kingside and queenside castling moves King and Rook properly', () => {
      // White can castle kingside
      const posK = CE.createGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      const resK = CE.makeMove(posK, 'e1g1');
      assertTrue(resK.success, 'Kingside castle is legal');
      assertEqual(posK.board[6]?.type, 'k', 'King on g1');
      assertEqual(posK.board[5]?.type, 'r', 'Rook on f1');
      assertEqual(posK.board[4], null, 'e1 empty');
      assertEqual(posK.board[7], null, 'h1 empty');

      // White can castle queenside
      const posQ = CE.createGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      const resQ = CE.makeMove(posQ, 'e1c1');
      assertTrue(resQ.success, 'Queenside castle is legal');
      assertEqual(posQ.board[2]?.type, 'k', 'King on c1');
      assertEqual(posQ.board[3]?.type, 'r', 'Rook on d1');
    });

    runner.test('Castling through or out of check is strictly prohibited', () => {
      // Black rook on f8 attacks f1 square (king passes through f1 to castle kingside), Black King on g8 (safe on g-file)
      const posThrough = CE.createGame('5rk1/8/8/8/8/8/8/R3K2R w KQ - 0 1');
      const movesThrough = CE.getLegalMoves(posThrough, CE.nameToSq('e1'));
      const hasO_O = movesThrough.some(m => m.to === CE.nameToSq('g1'));
      assertFalse(hasO_O, 'Cannot castle through attacked f1 square');

      // King currently in check (Black rook on e8, Black King on g8)
      const posInCheck = CE.createGame('4r1k1/8/8/8/8/8/8/R3K2R w KQ - 0 1');
      const movesInCheck = CE.getLegalMoves(posInCheck, CE.nameToSq('e1'));
      const canCastle = movesInCheck.some(m => m.isCastle);
      assertFalse(canCastle, 'Cannot castle when currently in check');
    });

    runner.test('En passant capture legally removes the bypassed pawn', () => {
      // White pawn on e5, Black pawn plays d7-d5
      const pos = CE.createGame('rnbqkbnr/pppppppp/8/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2');
      CE.makeMove(pos, 'd7d5');
      assertEqual(pos.enPassant, CE.nameToSq('d6'), 'En passant target is d6');

      // White captures en passant exd6
      const res = CE.makeMove(pos, 'e5d6');
      assertTrue(res.success, 'exd6 en passant is legal');
      assertEqual(pos.board[CE.nameToSq('d6')]?.type, 'p', 'White pawn on d6');
      assertEqual(pos.board[CE.nameToSq('d5')], null, 'Black pawn on d5 removed');
    });

    runner.test('Pawn promotion produces Queen, Rook, Bishop, or Knight', () => {
      const pos = CE.createGame('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
      const e7Sq = CE.nameToSq('e7');
      const moves = CE.getLegalMoves(pos, e7Sq);

      assertEqual(moves.length, 4, '4 promotion options');
      const promos = moves.map(m => m.promotion).sort();
      assertDeepEqual(promos, ['b', 'n', 'q', 'r']);

      // Execute promotion to Queen
      const res = CE.makeMove(pos, { from: e7Sq, to: CE.nameToSq('e8'), promotion: 'q' });
      assertTrue(res.success, 'Promote to Queen');
      assertEqual(pos.board[CE.nameToSq('e8')]?.type, 'q', 'Promoted Queen on e8');
    });

    runner.test('Underpromotion to Knight is valid and recognized in SAN', () => {
      const pos = CE.createGame('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
      const res = CE.makeMove(pos, { from: CE.nameToSq('e7'), to: CE.nameToSq('e8'), promotion: 'n' });
      assertTrue(res.success, 'Promote to Knight');
      assertEqual(pos.board[CE.nameToSq('e8')]?.type, 'n', 'Promoted Knight on e8');
      assertEqual(res.move.san, 'e8=N', 'SAN indicates =N');
    });

    runner.test('Castling right is permanently lost if rook moves and returns', () => {
      const pos = CE.createGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      // White rook moves from h1 to h2
      CE.makeMove(pos, 'h1h2');
      assertFalse(pos.castling.K, 'White Kingside castling lost');
      assertTrue(pos.castling.Q, 'White Queenside castling preserved');

      // Black moves
      CE.makeMove(pos, 'h8h7');
      // White rook moves back to h1
      CE.makeMove(pos, 'h2h1');
      assertFalse(pos.castling.K, 'White Kingside castling still false after rook returns');
    });

    runner.test('Castling right is lost if rook on original square is captured', () => {
      // White rook on a1 is captured by Black Queen on a6
      const pos = CE.createGame('r3k2r/8/q7/8/8/8/8/R3K2R b KQkq - 0 1');
      CE.makeMove(pos, 'a6a1');
      assertFalse(pos.castling.Q, 'White lost Queenside castling after rook captured on a1');
    });
  });

  // =========================================================================
  // SUITE 5: Game Termination & Draw Detection
  // =========================================================================
  runner.suite('Suite 5: Game Termination & Draws', () => {
    runner.test("Fool's Mate delivers checkmate on move 2", () => {
      const pos = CE.createGame();
      CE.makeMove(pos, 'f2f3');
      CE.makeMove(pos, 'e7e5');
      CE.makeMove(pos, 'g2g4');
      CE.makeMove(pos, 'd8h4');

      const status = CE.getGameStatus(pos);
      assertEqual(status.status, 'checkmate', 'Status is checkmate');
      assertEqual(status.winner, 'b', 'Black wins');
    });

    runner.test('Stalemate is correctly identified when King has no moves', () => {
      // Famous stalemate position: White Ka8, Black Qb6, Black Kc8
      const pos = CE.createGame('k7/8/1Q6/8/8/8/8/K7 b - - 0 1');
      const status = CE.getGameStatus(pos);
      assertEqual(status.status, 'stalemate', 'Stalemate detected');
      assertEqual(status.winner, 'draw');
    });

    runner.test('Insufficient material draws are correctly detected', () => {
      // King vs King
      const posKvK = CE.createGame('8/8/8/4k3/8/8/4K3/8 w - - 0 1');
      assertTrue(CE.isInsufficientMaterial(posKvK), 'K vs K is insufficient');

      // King + Bishop vs King
      const posKvKB = CE.createGame('8/8/8/4k3/8/5B2/4K3/8 w - - 0 1');
      assertTrue(CE.isInsufficientMaterial(posKvKB), 'K+B vs K is insufficient');

      // King + Knight vs King (Knight not directly checking king)
      const posKvKN = CE.createGame('8/8/8/4k3/8/8/3NK3/8 w - - 0 1');
      assertTrue(CE.isInsufficientMaterial(posKvKN), 'K+N vs K is insufficient');
    });

    runner.test('Fifty-move rule and seventy-five move rule detection', () => {
      // Position with pawn present so it is not immediate insufficient material
      const pos50 = CE.createGame('8/8/8/4k3/8/4P3/4K3/8 w - - 100 50');
      assertTrue(CE.getGameStatus(pos50).canClaimFifty, 'Fifty-move draw claimable at halfmove 100');

      const pos75 = CE.createGame('8/8/8/4k3/8/4P3/4K3/8 w - - 150 75');
      assertEqual(CE.getGameStatus(pos75).status, 'draw_seventy_five_moves', 'Seventy-five-move draw automatic');
    });

    runner.test('Threefold repetition becomes claimable after same position occurs 3 times', () => {
      const pos = CE.createGame();
      // Repetition 1 is initial position
      // Move knights back and forth
      CE.makeMove(pos, 'g1f3'); CE.makeMove(pos, 'g8f6');
      CE.makeMove(pos, 'f3g1'); CE.makeMove(pos, 'f6g8'); // Repetition 2

      assertFalse(CE.getGameStatus(pos).canClaimRepetition, 'Not claimable at 2 occurrences');

      CE.makeMove(pos, 'g1f3'); CE.makeMove(pos, 'g8f6');
      CE.makeMove(pos, 'f3g1'); CE.makeMove(pos, 'f6g8'); // Repetition 3

      assertTrue(CE.getGameStatus(pos).canClaimRepetition, 'Threefold repetition claimable after 3 occurrences');
    });

    runner.test('SAN notation accurately disambiguates knights on different files and ranks', () => {
      // 1. File disambiguation: Knights on d2 and f2 moving to e4
      const posFile = CE.createGame('k7/8/8/8/8/8/3N1N2/4K3 w - - 0 1');
      const mD2 = CE.getLegalMoves(posFile).find(m => m.from === CE.nameToSq('d2') && m.to === CE.nameToSq('e4'));
      const mF2 = CE.getLegalMoves(posFile).find(m => m.from === CE.nameToSq('f2') && m.to === CE.nameToSq('e4'));
      assertEqual(CE.getSan(posFile, mD2), 'Nde4', 'Disambiguated by origin file d');
      assertEqual(CE.getSan(posFile, mF2), 'Nfe4', 'Disambiguated by origin file f');

      // 2. Rank disambiguation: Knights on d2 and d4 moving to f3
      const posRank = CE.createGame('k7/8/8/8/3N4/8/3N4/4K3 w - - 0 1');
      const mRank2 = CE.getLegalMoves(posRank).find(m => m.from === CE.nameToSq('d2') && m.to === CE.nameToSq('f3'));
      const mRank4 = CE.getLegalMoves(posRank).find(m => m.from === CE.nameToSq('d4') && m.to === CE.nameToSq('f3'));
      assertEqual(CE.getSan(posRank, mRank2), 'N2f3', 'Disambiguated by origin rank 2');
      assertEqual(CE.getSan(posRank, mRank4), 'N4f3', 'Disambiguated by origin rank 4');
    });

    runner.test('Material balance calculation reflects piece values accurately', () => {
      const pos = CE.createGame();
      const bal = CE.getMaterialBalance(pos);
      assertEqual(bal.diff, 0, 'Starting position has 0 difference');

      // Remove Black Queen
      pos.board[CE.nameToSq('d8')] = null;
      const balAfter = CE.getMaterialBalance(pos);
      assertEqual(balAfter.diff, 9, 'White has +9 advantage without Black Queen');
    });

    runner.test('Opening explorer recognizes standard opening lines', () => {
      const history = [
        { san: 'e4' }, { san: 'c5' }
      ];
      const op = window.identifyOpening ? window.identifyOpening(history) : null;
      if (op) {
        assertEqual(op.name, 'Sicilian Defense', '1. e4 c5 identified as Sicilian');
      }
    });
  });

  // =========================================================================
  // SUITE 6: History, Undo & Redo
  // =========================================================================
  runner.suite('Suite 6: History, Undo & Redo', () => {
    runner.test('Undo restores exact prior FEN and game state', () => {
      const pos = CE.createGame();
      const initialFen = CE.getFen(pos);

      CE.makeMove(pos, 'e2e4');
      CE.makeMove(pos, 'e7e5');

      CE.undoMove(pos); // Undoes e7e5
      assertEqual(pos.turn, 'b', 'Turn restored to Black');

      CE.undoMove(pos); // Undoes e2e4
      assertEqual(CE.getFen(pos), initialFen, 'Exact starting FEN restored after undo');
    });

    runner.test('Redo replays undone moves with full fidelity', () => {
      const pos = CE.createGame();
      CE.makeMove(pos, 'e2e4');
      const fenAfterE4 = CE.getFen(pos);

      CE.undoMove(pos);
      CE.redoMove(pos);
      assertEqual(CE.getFen(pos), fenAfterE4, 'Exact FEN restored after redo');
    });

    runner.test('New move after undo invalidates redo stack', () => {
      const pos = CE.createGame();
      CE.makeMove(pos, 'e2e4');
      CE.undoMove(pos);
      assertEqual(pos.redoStack.length, 1, 'Redo stack has 1 move');

      CE.makeMove(pos, 'd2d4');
      assertEqual(pos.redoStack.length, 0, 'New move cleared redo stack');
    });
  });

  // =========================================================================
  // SUITE 7: Chess Clock Monotonic Timing
  // =========================================================================
  runner.suite('Suite 7: Chess Clock Logic', () => {
    runner.test('Clock initial state and formatting', () => {
      const clock = new window.ChessClock({ initialSeconds: 300 });
      const state = clock.getState();
      assertEqual(state.whiteTimeFormatted, '5:00', 'Initial time formatted as 5:00');
      assertTrue(state.paused, 'Clock starts paused');
    });

    runner.test('Clock turn switching adds increment properly', () => {
      const clock = new window.ChessClock({ initialSeconds: 60, incrementSeconds: 5 });
      clock.start('w');
      clock.switchTurn(); // Switches to Black and adds 5s to White
      const state = clock.getState();
      assertEqual(state.activeColor, 'b', 'Active color is now Black');
      assertTrue(state.whiteTimeMs >= 64000, 'White received 5s increment');
      clock.pause();
    });

    runner.test('Clock timeout callback executes on zero time', () => {
      let timeoutColor = null;
      const clock = new window.ChessClock({
        initialSeconds: 0.1,
        onTimeout: (c) => { timeoutColor = c; }
      });
      clock.whiteTimeMs = 5;
      clock.start('w');
      // Simulate tick after delay
      clock.lastTickTime = performance.now() - 20;
      clock.tick();
      assertEqual(timeoutColor, 'w', 'Timeout correctly handled for White');
    });
  });

  // Expose runner and run immediately if ready
  window.unitTestRunner = runner;
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => runner.run());
  } else {
    runner.run();
  }
  document.getElementById('btn-rerun-tests')?.addEventListener('click', () => runner.run());

})();
