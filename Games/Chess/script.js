/**
 *   Chess — Premium Browser Chess Platform
 * Core Engine, AI, Opening Explorer, Puzzles, Audio, Clocks, and UI Controller
 * Standard: ES6+ Vanilla JavaScript, zero external dependencies.
 */

(function (window, document) {
  'use strict';

  // =========================================================================
  // 1. CHESS PIECE SVG VECTOR GLYPHS
  // Custom-crafted vectors for ultra-crisp display across all resolutions.
  // =========================================================================

  const ChessPieceSVG = {
    // White pieces (Electric Pearl with Cyan highlights)
    wK: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wKg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#cbe5ff"/>
        </linearGradient>
      </defs>
      <path d="M22.5 11.63V6M20 8h5" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="url(#wKg)" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5M11.5 30c-5.5-3.5-15.5-3.5-21 0" fill="none"/>
      <path d="M11.5 30c-5.5-3.5-15.5-3.5-21 0" fill="none"/>
      <path d="M12.5 30c-5.5-3-4-9-2-11.5 4.5-5.5 11-1.5 12 5" fill="none"/>
      <path d="M11.5 30c-4-4.5-3-9.5-1-12 5-6 12-2 12 5.5v3.5M33.5 30c4-4.5 3-9.5 1-12-5-6-12-2-12 5.5v3.5" fill="url(#wKg)" stroke="#0f172a" stroke-width="1.5"/>
      <path d="M11.5 30c5.5-2 15.5-2 21 0m-21 3.5c5.5-2 15.5-2 21 0m-21 3.5c5.5-2 15.5-2 21 0" fill="none" stroke="#00f0ff" stroke-width="1.2"/>
      <path d="M11.5 37h21v3h-21z" fill="url(#wKg)" stroke="#0f172a" stroke-width="1.5"/>
    </svg>`,

    wQ: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wQg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#d0e8ff"/>
        </linearGradient>
      </defs>
      <circle cx="6" cy="12" r="2.5" fill="#00f0ff" stroke="#0f172a"/>
      <circle cx="14" cy="9" r="2.5" fill="#00f0ff" stroke="#0f172a"/>
      <circle cx="22.5" cy="8" r="2.5" fill="#00f0ff" stroke="#0f172a"/>
      <circle cx="31" cy="9" r="2.5" fill="#00f0ff" stroke="#0f172a"/>
      <circle cx="39" cy="12" r="2.5" fill="#00f0ff" stroke="#0f172a"/>
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-8.5-15-8.5 15-7-11 2 12z" fill="url(#wQg)" stroke="#0f172a" stroke-width="1.5" stroke-linecap="butt"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 2.5 4 1 5.5 1 5.5h20s-1.5-1.5 1-5.5c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" fill="url(#wQg)" stroke="#0f172a" stroke-width="1.5"/>
      <path d="M11 38.5h23v2.5h-23z" fill="url(#wQg)" stroke="#0f172a" stroke-width="1.5"/>
      <path d="M12 33.5c6-1 15-1 21 0" fill="none" stroke="#00f0ff" stroke-width="1.2"/>
    </svg>`,

    wR: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wRg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#cde7fe"/>
        </linearGradient>
      </defs>
      <path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1.5-14.5h14L31 31.5H14zM9 17h27v-3h-3v-4h-5v4h-4v-4h-5v4h-4v-4H9v4H6v3h3z" fill="url(#wRg)" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M12 17h21" fill="none" stroke="#00f0ff" stroke-width="1.2"/>
      <path d="M14 31.5h17" fill="none" stroke="#00f0ff" stroke-width="1.2"/>
    </svg>`,

    wB: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#cde7fe"/>
        </linearGradient>
      </defs>
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="url(#wBg)" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M17.5 26h10M22.5 20v8" fill="none" stroke="#00f0ff" stroke-width="1.2"/>
    </svg>`,

    wN: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wNg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#cde7fe"/>
        </linearGradient>
      </defs>
      <path d="M22 10c-3 0-5 2-6 4-2.5 1.5-5 5.5-3 9 1 1.5 2 1.5 3 1.5-1.5 2-2 4-1 6.5 1 2.5 3 3.5 3 3.5v4.5h16.5c1-3 1.5-6.5-.5-10-2-3.5-3-5.5-2-9 1-3.5-3-7-7-7-1.5 0-2 .5-3-.5z" fill="url(#wNg)" stroke="#0f172a" stroke-width="1.5"/>
      <circle cx="27" cy="16" r="1.5" fill="#00f0ff"/>
      <path d="M9.5 39h26v-3.5h-26z" fill="url(#wNg)" stroke="#0f172a" stroke-width="1.5"/>
      <path d="M15 28.5c4-1 10-1 13 1.5" fill="none" stroke="#00f0ff" stroke-width="1.2"/>
    </svg>`,

    wP: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wPg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#d5ebff"/>
        </linearGradient>
      </defs>
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="url(#wPg)" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M14 36c4-1.5 13-1.5 17 0" fill="none" stroke="#00f0ff" stroke-width="1.2"/>
    </svg>`,

    // Black pieces (Midnight Obsidian with Violet/Cyan highlights)
    bK: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bKg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2d124d"/>
          <stop offset="100%" stop-color="#11091e"/>
        </linearGradient>
      </defs>
      <path d="M22.5 11.63V6M20 8h5" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="url(#bKg)" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M11.5 30c-4-4.5-3-9.5-1-12 5-6 12-2 12 5.5v3.5M33.5 30c4-4.5 3-9.5 1-12-5-6-12-2-12 5.5v3.5" fill="url(#bKg)" stroke="#a855f7" stroke-width="1.5"/>
      <path d="M11.5 30c5.5-2 15.5-2 21 0m-21 3.5c5.5-2 15.5-2 21 0m-21 3.5c5.5-2 15.5-2 21 0" fill="none" stroke="#c084fc" stroke-width="1.2"/>
      <path d="M11.5 37h21v3h-21z" fill="url(#bKg)" stroke="#a855f7" stroke-width="1.5"/>
    </svg>`,

    bQ: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bQg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2d124d"/>
          <stop offset="100%" stop-color="#11091e"/>
        </linearGradient>
      </defs>
      <circle cx="6" cy="12" r="2.5" fill="#c084fc" stroke="#a855f7"/>
      <circle cx="14" cy="9" r="2.5" fill="#c084fc" stroke="#a855f7"/>
      <circle cx="22.5" cy="8" r="2.5" fill="#c084fc" stroke="#a855f7"/>
      <circle cx="31" cy="9" r="2.5" fill="#c084fc" stroke="#a855f7"/>
      <circle cx="39" cy="12" r="2.5" fill="#c084fc" stroke="#a855f7"/>
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-8.5-15-8.5 15-7-11 2 12z" fill="url(#bQg)" stroke="#a855f7" stroke-width="1.5" stroke-linecap="butt"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 2.5 4 1 5.5 1 5.5h20s-1.5-1.5 1-5.5c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" fill="url(#bQg)" stroke="#a855f7" stroke-width="1.5"/>
      <path d="M11 38.5h23v2.5h-23z" fill="url(#bQg)" stroke="#a855f7" stroke-width="1.5"/>
      <path d="M12 33.5c6-1 15-1 21 0" fill="none" stroke="#c084fc" stroke-width="1.2"/>
    </svg>`,

    bR: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bRg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2d124d"/>
          <stop offset="100%" stop-color="#11091e"/>
        </linearGradient>
      </defs>
      <path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1.5-14.5h14L31 31.5H14zM9 17h27v-3h-3v-4h-5v4h-4v-4h-5v4h-4v-4H9v4H6v3h3z" fill="url(#bRg)" stroke="#a855f7" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M12 17h21" fill="none" stroke="#c084fc" stroke-width="1.2"/>
      <path d="M14 31.5h17" fill="none" stroke="#c084fc" stroke-width="1.2"/>
    </svg>`,

    bB: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2d124d"/>
          <stop offset="100%" stop-color="#11091e"/>
        </linearGradient>
      </defs>
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="url(#bBg)" stroke="#a855f7" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M17.5 26h10M22.5 20v8" fill="none" stroke="#c084fc" stroke-width="1.2"/>
    </svg>`,

    bN: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bNg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2d124d"/>
          <stop offset="100%" stop-color="#11091e"/>
        </linearGradient>
      </defs>
      <path d="M22 10c-3 0-5 2-6 4-2.5 1.5-5 5.5-3 9 1 1.5 2 1.5 3 1.5-1.5 2-2 4-1 6.5 1 2.5 3 3.5 3 3.5v4.5h16.5c1-3 1.5-6.5-.5-10-2-3.5-3-5.5-2-9 1-3.5-3-7-7-7-1.5 0-2 .5-3-.5z" fill="url(#bNg)" stroke="#a855f7" stroke-width="1.5"/>
      <circle cx="27" cy="16" r="1.5" fill="#c084fc"/>
      <path d="M9.5 39h26v-3.5h-26z" fill="url(#bNg)" stroke="#a855f7" stroke-width="1.5"/>
      <path d="M15 28.5c4-1 10-1 13 1.5" fill="none" stroke="#c084fc" stroke-width="1.2"/>
    </svg>`,

    bP: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bPg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2d124d"/>
          <stop offset="100%" stop-color="#11091e"/>
        </linearGradient>
      </defs>
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="url(#bPg)" stroke="#a855f7" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M14 36c4-1.5 13-1.5 17 0" fill="none" stroke="#c084fc" stroke-width="1.2"/>
    </svg>`
  };

  function getPieceSvg(piece) {
    if (!piece) return '';
    const key = (piece.color === 'w' ? 'w' : 'b') + piece.type.toUpperCase();
    return ChessPieceSVG[key] || '';
  }

  // =========================================================================
  // 2. COMPLETE CHESS RULES ENGINE
  // Mailbox 64, Pure Function Architecture, 100% Rule Compliance
  // =========================================================================

  const ChessEngine = {
    STARTING_FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',

    // Convert square index 0..63 to coordinate { file: 0..7, rank: 0..7 }
    // 0 = a1, 7 = h1, 56 = a8, 63 = h8
    sqToCoords(sq) {
      return { file: sq % 8, rank: Math.floor(sq / 8) };
    },

    coordsToSq(file, rank) {
      if (file < 0 || file > 7 || rank < 0 || rank > 7) return -1;
      return rank * 8 + file;
    },

    sqToName(sq) {
      if (sq === null || sq === undefined || sq < 0 || sq > 63) return '-';
      const f = sq % 8;
      const r = Math.floor(sq / 8);
      return String.fromCharCode(97 + f) + (r + 1);
    },

    nameToSq(name) {
      if (!name || name === '-' || name.length !== 2) return -1;
      const f = name.charCodeAt(0) - 97;
      const r = parseInt(name[1], 10) - 1;
      if (f < 0 || f > 7 || r < 0 || r > 7) return -1;
      return r * 8 + f;
    },

    // Create a new fresh game position or load FEN
    createGame(fen = ChessEngine.STARTING_FEN) {
      const parsed = ChessEngine.parseFen(fen);
      if (!parsed.valid) {
        throw new Error(`Invalid FEN: ${parsed.error}`);
      }
      const pos = parsed.position;
      pos.history = [];
      pos.redoStack = [];
      pos.positionCounts = new Map();
      const posKey = ChessEngine.getPositionHash(pos);
      pos.positionCounts.set(posKey, 1);
      return pos;
    },

    // Clone a position deeply
    clonePosition(pos) {
      return {
        board: pos.board.map(p => p ? { type: p.type, color: p.color } : null),
        turn: pos.turn,
        castling: { ...pos.castling },
        enPassant: pos.enPassant,
        halfmoveClock: pos.halfmoveClock,
        fullmoveNumber: pos.fullmoveNumber,
        history: pos.history ? [...pos.history] : [],
        redoStack: pos.redoStack ? [...pos.redoStack] : [],
        positionCounts: pos.positionCounts ? new Map(pos.positionCounts) : new Map()
      };
    },

    // Position hash for threefold repetition detection
    getPositionHash(pos) {
      // Board piece placement + turn + castling rights + enPassant file if valid
      let s = '';
      for (let i = 0; i < 64; i++) {
        const p = pos.board[i];
        s += p ? (p.color + p.type) : '.';
      }
      s += `_${pos.turn}_`;
      s += (pos.castling.K ? 'K' : '') + (pos.castling.Q ? 'Q' : '') +
           (pos.castling.k ? 'k' : '') + (pos.castling.q ? 'q' : '');
      s += `_${pos.enPassant !== null ? pos.enPassant % 8 : '-'}`;
      return s;
    },

    // Check if square is attacked by a given color
    isSquareAttacked(board, sq, byColor) {
      if (sq < 0 || sq > 63) return false;
      const { file, rank } = ChessEngine.sqToCoords(sq);

      // 1. Pawn attacks
      if (byColor === 'w') {
        const r = rank - 1;
        if (r >= 0) {
          if (file > 0) {
            const p = board[r * 8 + (file - 1)];
            if (p && p.type === 'p' && p.color === 'w') return true;
          }
          if (file < 7) {
            const p = board[r * 8 + (file + 1)];
            if (p && p.type === 'p' && p.color === 'w') return true;
          }
        }
      } else {
        const r = rank + 1;
        if (r <= 7) {
          if (file > 0) {
            const p = board[r * 8 + (file - 1)];
            if (p && p.type === 'p' && p.color === 'b') return true;
          }
          if (file < 7) {
            const p = board[r * 8 + (file + 1)];
            if (p && p.type === 'p' && p.color === 'b') return true;
          }
        }
      }

      // 2. Knight attacks
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [df, dr] of knightOffsets) {
        const f = file + df;
        const r = rank + dr;
        if (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
          const p = board[r * 8 + f];
          if (p && p.type === 'n' && p.color === byColor) return true;
        }
      }

      // 3. King attacks (adjacent 1 square)
      for (let df = -1; df <= 1; df++) {
        for (let dr = -1; dr <= 1; dr++) {
          if (df === 0 && dr === 0) continue;
          const f = file + df;
          const r = rank + dr;
          if (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
            const p = board[r * 8 + f];
            if (p && p.type === 'k' && p.color === byColor) return true;
          }
        }
      }

      // 4. Straight ray attacks (Rook or Queen)
      const straightDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [df, dr] of straightDirs) {
        let f = file + df;
        let r = rank + dr;
        while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
          const p = board[r * 8 + f];
          if (p) {
            if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
            break;
          }
          f += df;
          r += dr;
        }
      }

      // 5. Diagonal ray attacks (Bishop or Queen)
      const diagDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [df, dr] of diagDirs) {
        let f = file + df;
        let r = rank + dr;
        while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
          const p = board[r * 8 + f];
          if (p) {
            if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
            break;
          }
          f += df;
          r += dr;
        }
      }

      return false;
    },

    // Find the square where a color's king resides
    findKingSquare(board, color) {
      for (let i = 0; i < 64; i++) {
        const p = board[i];
        if (p && p.type === 'k' && p.color === color) {
          return i;
        }
      }
      return -1;
    },

    // Check if a color is currently in check
    isCheck(pos, color = pos.turn) {
      const kingSq = ChessEngine.findKingSquare(pos.board, color);
      if (kingSq === -1) return false;
      const opponentColor = color === 'w' ? 'b' : 'w';
      return ChessEngine.isSquareAttacked(pos.board, kingSq, opponentColor);
    },

    // Generate pseudo-legal moves for a position
    generatePseudoMoves(pos) {
      const moves = [];
      const board = pos.board;
      const turn = pos.turn;
      const oppColor = turn === 'w' ? 'b' : 'w';

      for (let sq = 0; sq < 64; sq++) {
        const p = board[sq];
        if (!p || p.color !== turn) continue;

        const { file, rank } = ChessEngine.sqToCoords(sq);

        switch (p.type) {
          case 'p': {
            const dir = turn === 'w' ? 1 : -1;
            const startRank = turn === 'w' ? 1 : 6;
            const promoRank = turn === 'w' ? 7 : 0;

            // 1 square forward
            const fwd1Rank = rank + dir;
            const fwd1Sq = fwd1Rank * 8 + file;
            if (board[fwd1Sq] === null) {
              if (fwd1Rank === promoRank) {
                for (const promo of ['q', 'r', 'b', 'n']) {
                  moves.push({ from: sq, to: fwd1Sq, piece: p, promotion: promo });
                }
              } else {
                moves.push({ from: sq, to: fwd1Sq, piece: p });

                // 2 squares forward from starting rank
                if (rank === startRank) {
                  const fwd2Sq = (rank + dir * 2) * 8 + file;
                  if (board[fwd2Sq] === null) {
                    moves.push({ from: sq, to: fwd2Sq, piece: p, isDoublePawn: true });
                  }
                }
              }
            }

            // Diagonal captures
            for (const df of [-1, 1]) {
              const capFile = file + df;
              if (capFile >= 0 && capFile <= 7) {
                const capSq = (rank + dir) * 8 + capFile;
                const target = board[capSq];
                if (target && target.color === oppColor) {
                  if (rank + dir === promoRank) {
                    for (const promo of ['q', 'r', 'b', 'n']) {
                      moves.push({ from: sq, to: capSq, piece: p, captured: target, promotion: promo });
                    }
                  } else {
                    moves.push({ from: sq, to: capSq, piece: p, captured: target });
                  }
                } else if (capSq === pos.enPassant) {
                  // En passant capture
                  const epPawnSq = rank * 8 + capFile;
                  const epPawn = board[epPawnSq];
                  if (epPawn && epPawn.color === oppColor && epPawn.type === 'p') {
                    moves.push({ from: sq, to: capSq, piece: p, captured: epPawn, isEnPassant: true });
                  }
                }
              }
            }
            break;
          }

          case 'n': {
            const offsets = [
              [-2, -1], [-2, 1], [-1, -2], [-1, 2],
              [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (const [df, dr] of offsets) {
              const f = file + df;
              const r = rank + dr;
              if (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
                const toSq = r * 8 + f;
                const target = board[toSq];
                if (!target) {
                  moves.push({ from: sq, to: toSq, piece: p });
                } else if (target.color === oppColor) {
                  moves.push({ from: sq, to: toSq, piece: p, captured: target });
                }
              }
            }
            break;
          }

          case 'b': {
            const diagDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (const [df, dr] of diagDirs) {
              let f = file + df;
              let r = rank + dr;
              while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
                const toSq = r * 8 + f;
                const target = board[toSq];
                if (!target) {
                  moves.push({ from: sq, to: toSq, piece: p });
                } else {
                  if (target.color === oppColor) {
                    moves.push({ from: sq, to: toSq, piece: p, captured: target });
                  }
                  break;
                }
                f += df;
                r += dr;
              }
            }
            break;
          }

          case 'r': {
            const straightDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (const [df, dr] of straightDirs) {
              let f = file + df;
              let r = rank + dr;
              while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
                const toSq = r * 8 + f;
                const target = board[toSq];
                if (!target) {
                  moves.push({ from: sq, to: toSq, piece: p });
                } else {
                  if (target.color === oppColor) {
                    moves.push({ from: sq, to: toSq, piece: p, captured: target });
                  }
                  break;
                }
                f += df;
                r += dr;
              }
            }
            break;
          }

          case 'q': {
            const allDirs = [
              [0, 1], [0, -1], [1, 0], [-1, 0],
              [1, 1], [1, -1], [-1, 1], [-1, -1]
            ];
            for (const [df, dr] of allDirs) {
              let f = file + df;
              let r = rank + dr;
              while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
                const toSq = r * 8 + f;
                const target = board[toSq];
                if (!target) {
                  moves.push({ from: sq, to: toSq, piece: p });
                } else {
                  if (target.color === oppColor) {
                    moves.push({ from: sq, to: toSq, piece: p, captured: target });
                  }
                  break;
                }
                f += df;
                r += dr;
              }
            }
            break;
          }

          case 'k': {
            // Normal 1-step moves
            for (let df = -1; df <= 1; df++) {
              for (let dr = -1; dr <= 1; dr++) {
                if (df === 0 && dr === 0) continue;
                const f = file + df;
                const r = rank + dr;
                if (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
                  const toSq = r * 8 + f;
                  const target = board[toSq];
                  if (!target) {
                    moves.push({ from: sq, to: toSq, piece: p });
                  } else if (target.color === oppColor) {
                    moves.push({ from: sq, to: toSq, piece: p, captured: target });
                  }
                }
              }
            }

            // Castling moves (King cannot be currently in check)
            if (!ChessEngine.isSquareAttacked(board, sq, oppColor)) {
              if (turn === 'w' && sq === 4) {
                // White Kingside (e1 -> g1)
                if (pos.castling.K && !board[5] && !board[6]) {
                  const rook = board[7];
                  if (rook && rook.type === 'r' && rook.color === 'w') {
                    if (!ChessEngine.isSquareAttacked(board, 5, 'b') &&
                        !ChessEngine.isSquareAttacked(board, 6, 'b')) {
                      moves.push({ from: 4, to: 6, piece: p, isCastle: 'K' });
                    }
                  }
                }
                // White Queenside (e1 -> c1)
                if (pos.castling.Q && !board[3] && !board[2] && !board[1]) {
                  const rook = board[0];
                  if (rook && rook.type === 'r' && rook.color === 'w') {
                    if (!ChessEngine.isSquareAttacked(board, 3, 'b') &&
                        !ChessEngine.isSquareAttacked(board, 2, 'b')) {
                      moves.push({ from: 4, to: 2, piece: p, isCastle: 'Q' });
                    }
                  }
                }
              } else if (turn === 'b' && sq === 60) {
                // Black Kingside (e8 -> g8)
                if (pos.castling.k && !board[61] && !board[62]) {
                  const rook = board[63];
                  if (rook && rook.type === 'r' && rook.color === 'b') {
                    if (!ChessEngine.isSquareAttacked(board, 61, 'w') &&
                        !ChessEngine.isSquareAttacked(board, 62, 'w')) {
                      moves.push({ from: 60, to: 62, piece: p, isCastle: 'k' });
                    }
                  }
                }
                // Black Queenside (e8 -> c8)
                if (pos.castling.q && !board[59] && !board[58] && !board[57]) {
                  const rook = board[56];
                  if (rook && rook.type === 'r' && rook.color === 'b') {
                    if (!ChessEngine.isSquareAttacked(board, 59, 'w') &&
                        !ChessEngine.isSquareAttacked(board, 58, 'w')) {
                      moves.push({ from: 60, to: 58, piece: p, isCastle: 'q' });
                    }
                  }
                }
              }
            }
            break;
          }
        }
      }

      return moves;
    },

    // Check if moving piece leaves mover's king in check
    isMoveLegal(pos, move) {
      const simBoard = pos.board.slice();
      const moverColor = pos.turn;
      const oppColor = moverColor === 'w' ? 'b' : 'w';

      // Apply move on simulated board
      simBoard[move.to] = move.promotion
        ? { type: move.promotion, color: moverColor }
        : simBoard[move.from];
      simBoard[move.from] = null;

      // Handle en passant pawn removal
      if (move.isEnPassant) {
        const epPawnSq = Math.floor(move.from / 8) * 8 + (move.to % 8);
        simBoard[epPawnSq] = null;
      }

      // Handle castling rook movement
      if (move.isCastle) {
        if (move.isCastle === 'K') {
          simBoard[5] = simBoard[7];
          simBoard[7] = null;
        } else if (move.isCastle === 'Q') {
          simBoard[3] = simBoard[0];
          simBoard[0] = null;
        } else if (move.isCastle === 'k') {
          simBoard[61] = simBoard[63];
          simBoard[63] = null;
        } else if (move.isCastle === 'q') {
          simBoard[59] = simBoard[56];
          simBoard[56] = null;
        }
      }

      // Find king of moverColor
      let kingSq = -1;
      for (let i = 0; i < 64; i++) {
        const p = simBoard[i];
        if (p && p.type === 'k' && p.color === moverColor) {
          kingSq = i;
          break;
        }
      }

      if (kingSq === -1) return false;
      return !ChessEngine.isSquareAttacked(simBoard, kingSq, oppColor);
    },

    // Get all legal moves for current position (optionally filtered by square)
    getLegalMoves(pos, fromSquare = null) {
      const pseudo = ChessEngine.generatePseudoMoves(pos);
      const legal = [];

      for (const m of pseudo) {
        if (fromSquare !== null && m.from !== fromSquare) continue;
        if (ChessEngine.isMoveLegal(pos, m)) {
          // Format UCI notation
          m.uci = ChessEngine.sqToName(m.from) + ChessEngine.sqToName(m.to) + (m.promotion || '');
          legal.push(m);
        }
      }

      return legal;
    },

    // Execute a move on the game position with full state recording
    makeMove(pos, moveInput) {
      const legalMoves = ChessEngine.getLegalMoves(pos);
      let match = null;

      // Resolve moveInput from UCI, SAN, or object
      if (typeof moveInput === 'string') {
        // Try matching SAN first
        match = legalMoves.find(m => ChessEngine.getSan(pos, m) === moveInput || m.uci === moveInput);
        if (!match) {
          // Try loose UCI match
          const fromSq = ChessEngine.nameToSq(moveInput.substring(0, 2));
          const toSq = ChessEngine.nameToSq(moveInput.substring(2, 4));
          const promo = moveInput.length > 4 ? moveInput[4].toLowerCase() : undefined;
          match = legalMoves.find(m => m.from === fromSq && m.to === toSq && (!promo || m.promotion === promo));
        }
      } else {
        match = legalMoves.find(m =>
          m.from === moveInput.from &&
          m.to === moveInput.to &&
          (!moveInput.promotion || m.promotion === moveInput.promotion)
        );
      }

      if (!match) {
        return { success: false, error: 'Illegal move' };
      }

      const move = match;

      // Calculate SAN string before mutating state
      const san = ChessEngine.getSan(pos, move);
      move.san = san;

      // Record snapshot for undo
      const record = {
        from: move.from,
        to: move.to,
        piece: { ...move.piece },
        captured: move.captured ? { ...move.captured } : null,
        promotion: move.promotion || null,
        isCastle: move.isCastle || null,
        isEnPassant: !!move.isEnPassant,
        isDoublePawn: !!move.isDoublePawn,
        san: san,
        uci: move.uci,
        prevCastling: { ...pos.castling },
        prevEnPassant: pos.enPassant,
        prevHalfmoveClock: pos.halfmoveClock,
        prevFullmoveNumber: pos.fullmoveNumber,
        fenBefore: ChessEngine.getFen(pos)
      };

      // Apply move to board
      pos.board[move.to] = move.promotion
        ? { type: move.promotion, color: pos.turn }
        : pos.board[move.from];
      pos.board[move.from] = null;

      // Handle en passant capture
      if (move.isEnPassant) {
        const epPawnSq = Math.floor(move.from / 8) * 8 + (move.to % 8);
        pos.board[epPawnSq] = null;
      }

      // Handle castling rook movement
      if (move.isCastle) {
        if (move.isCastle === 'K') {
          pos.board[5] = pos.board[7];
          pos.board[7] = null;
        } else if (move.isCastle === 'Q') {
          pos.board[3] = pos.board[0];
          pos.board[0] = null;
        } else if (move.isCastle === 'k') {
          pos.board[61] = pos.board[63];
          pos.board[63] = null;
        } else if (move.isCastle === 'q') {
          pos.board[59] = pos.board[56];
          pos.board[56] = null;
        }
      }

      // Update castling rights
      if (move.piece.type === 'k') {
        if (pos.turn === 'w') {
          pos.castling.K = false;
          pos.castling.Q = false;
        } else {
          pos.castling.k = false;
          pos.castling.q = false;
        }
      } else if (move.piece.type === 'r') {
        if (move.from === 0) pos.castling.Q = false;
        if (move.from === 7) pos.castling.K = false;
        if (move.from === 56) pos.castling.q = false;
        if (move.from === 63) pos.castling.k = false;
      }

      // If an opponent rook is captured on its original square, forfeit their castling right
      if (move.captured && move.captured.type === 'r') {
        if (move.to === 0) pos.castling.Q = false;
        if (move.to === 7) pos.castling.K = false;
        if (move.to === 56) pos.castling.q = false;
        if (move.to === 63) pos.castling.k = false;
      }

      // Update en passant square (robust rank diff check)
      const isPawn = move.piece.type === 'p';
      const rankDiff = Math.abs(Math.floor(move.to / 8) - Math.floor(move.from / 8));
      if (isPawn && rankDiff === 2) {
        pos.enPassant = ((Math.floor(move.from / 8) + Math.floor(move.to / 8)) / 2) * 8 + (move.from % 8);
      } else {
        pos.enPassant = null;
      }

      // Update halfmove clock (resets on pawn move or capture)
      if (move.piece.type === 'p' || move.captured) {
        pos.halfmoveClock = 0;
      } else {
        pos.halfmoveClock += 1;
      }

      // Update fullmove number
      if (pos.turn === 'b') {
        pos.fullmoveNumber += 1;
      }

      // Switch turn
      pos.turn = pos.turn === 'w' ? 'b' : 'w';

      // Update repetition history
      const posHash = ChessEngine.getPositionHash(pos);
      const count = (pos.positionCounts.get(posHash) || 0) + 1;
      pos.positionCounts.set(posHash, count);

      record.fenAfter = ChessEngine.getFen(pos);
      pos.history.push(record);
      pos.redoStack = []; // New move invalidates redo branch

      return { success: true, move: record };
    },

    // Undo the last move
    undoMove(pos) {
      if (!pos.history || pos.history.length === 0) return null;
      const record = pos.history.pop();

      // Decrement repetition hash
      const currentHash = ChessEngine.getPositionHash(pos);
      const count = pos.positionCounts.get(currentHash) || 1;
      if (count <= 1) {
        pos.positionCounts.delete(currentHash);
      } else {
        pos.positionCounts.set(currentHash, count - 1);
      }

      // Parse previous FEN to restore exact state perfectly
      const parsed = ChessEngine.parseFen(record.fenBefore);
      pos.board = parsed.position.board;
      pos.turn = parsed.position.turn;
      pos.castling = parsed.position.castling;
      pos.enPassant = parsed.position.enPassant;
      pos.halfmoveClock = parsed.position.halfmoveClock;
      pos.fullmoveNumber = parsed.position.fullmoveNumber;

      pos.redoStack.push(record);
      return record;
    },

    // Redo previously undone move
    redoMove(pos) {
      if (!pos.redoStack || pos.redoStack.length === 0) return null;
      const record = pos.redoStack.pop();
      const res = ChessEngine.makeMove(pos, record);
      return res.success ? record : null;
    },

    // Full Standard Algebraic Notation (SAN) generator
    getSan(pos, move) {
      if (move.isCastle === 'K' || move.isCastle === 'k') return 'O-O';
      if (move.isCastle === 'Q' || move.isCastle === 'q') return 'O-O-O';

      let san = '';
      const pieceType = move.piece.type;
      const isCapture = !!move.captured;

      if (pieceType === 'p') {
        if (isCapture) {
          san += ChessEngine.sqToName(move.from)[0] + 'x';
        }
        san += ChessEngine.sqToName(move.to);
        if (move.promotion) {
          san += '=' + move.promotion.toUpperCase();
        }
      } else {
        san += pieceType.toUpperCase();

        // Disambiguation: find other pieces of same type and color that can legally move to target square
        const candidateMoves = ChessEngine.getLegalMoves(pos).filter(
          m => m.from !== move.from &&
               m.to === move.to &&
               m.piece.type === pieceType &&
               m.piece.color === pos.turn
        );

        if (candidateMoves.length > 0) {
          const fromCoord = ChessEngine.sqToCoords(move.from);
          const sameFile = candidateMoves.some(m => ChessEngine.sqToCoords(m.from).file === fromCoord.file);
          const sameRank = candidateMoves.some(m => ChessEngine.sqToCoords(m.from).rank === fromCoord.rank);

          if (!sameFile) {
            san += String.fromCharCode(97 + fromCoord.file);
          } else if (!sameRank) {
            san += (fromCoord.rank + 1).toString();
          } else {
            san += ChessEngine.sqToName(move.from);
          }
        }

        if (isCapture) san += 'x';
        san += ChessEngine.sqToName(move.to);
      }

      // Check for check (+) or checkmate (#) on resulting position
      const simBoard = pos.board.slice();
      simBoard[move.to] = move.promotion
        ? { type: move.promotion, color: pos.turn }
        : simBoard[move.from];
      simBoard[move.from] = null;
      if (move.isEnPassant) {
        const epSq = Math.floor(move.from / 8) * 8 + (move.to % 8);
        simBoard[epSq] = null;
      }
      const oppColor = pos.turn === 'w' ? 'b' : 'w';
      const oppKingSq = ChessEngine.findKingSquare(simBoard, oppColor);
      if (oppKingSq !== -1 && ChessEngine.isSquareAttacked(simBoard, oppKingSq, pos.turn)) {
        // Opponent will be in check. Is it checkmate?
        const tempPos = {
          board: simBoard,
          turn: oppColor,
          castling: { ...pos.castling },
          enPassant: move.isDoublePawn ? (Math.floor(move.from / 8) + (pos.turn === 'w' ? 1 : -1)) * 8 + (move.from % 8) : null,
          halfmoveClock: 0,
          fullmoveNumber: pos.fullmoveNumber
        };
        const oppMoves = ChessEngine.getLegalMoves(tempPos);
        if (oppMoves.length === 0) {
          san += '#';
        } else {
          san += '+';
        }
      }

      return san;
    },

    // Check if position is insufficient mating material
    isInsufficientMaterial(pos) {
      let whiteKnights = 0, blackKnights = 0;
      let whiteBishops = [], blackBishops = [];

      for (let i = 0; i < 64; i++) {
        const p = pos.board[i];
        if (!p) continue;
        if (p.type === 'p' || p.type === 'r' || p.type === 'q') return false; // Pawns, rooks, queens can mate

        if (p.type === 'n') {
          if (p.color === 'w') whiteKnights++;
          else blackKnights++;
        } else if (p.type === 'b') {
          const sqColor = (Math.floor(i / 8) + (i % 8)) % 2;
          if (p.color === 'w') whiteBishops.push(sqColor);
          else blackBishops.push(sqColor);
        }
      }

      const totalMinorPieces = whiteKnights + blackKnights + whiteBishops.length + blackBishops.length;

      // King vs King
      if (totalMinorPieces === 0) return true;

      // King + Minor vs King
      if (totalMinorPieces === 1) return true;

      // King + Bishop vs King + Bishop on same color square
      if (whiteKnights === 0 && blackKnights === 0 && whiteBishops.length === 1 && blackBishops.length === 1) {
        if (whiteBishops[0] === blackBishops[0]) return true;
      }

      return false;
    },

    // Get comprehensive game status
    getGameStatus(pos) {
      const legalMoves = ChessEngine.getLegalMoves(pos);
      const inCheck = ChessEngine.isCheck(pos, pos.turn);

      if (legalMoves.length === 0) {
        if (inCheck) {
          return {
            status: 'checkmate',
            winner: pos.turn === 'w' ? 'b' : 'w',
            inCheck: true,
            terminal: true,
            message: `Checkmate! ${pos.turn === 'w' ? 'Black' : 'White'} wins.`
          };
        } else {
          return {
            status: 'stalemate',
            winner: 'draw',
            inCheck: false,
            terminal: true,
            message: 'Draw by stalemate.'
          };
        }
      }

      // Automatic draw rules
      if (pos.halfmoveClock >= 150) {
        return {
          status: 'draw_seventy_five_moves',
          winner: 'draw',
          terminal: true,
          message: 'Draw by 75-move rule.'
        };
      }

      const posHash = ChessEngine.getPositionHash(pos);
      const repCount = pos.positionCounts.get(posHash) || 1;
      if (repCount >= 5) {
        return {
          status: 'draw_fivefold_repetition',
          winner: 'draw',
          terminal: true,
          message: 'Draw by fivefold repetition.'
        };
      }

      if (ChessEngine.isInsufficientMaterial(pos)) {
        return {
          status: 'draw_insufficient_material',
          winner: 'draw',
          terminal: true,
          message: 'Draw by insufficient mating material.'
        };
      }

      // Claimable draws
      const canClaimFifty = pos.halfmoveClock >= 100;
      const canClaimRepetition = repCount >= 3;

      return {
        status: inCheck ? 'check' : 'active',
        winner: null,
        inCheck: inCheck,
        terminal: false,
        canClaimFifty,
        canClaimRepetition,
        repetitionCount: repCount,
        halfmoveClock: pos.halfmoveClock,
        message: inCheck ? `${pos.turn === 'w' ? 'White' : 'Black'} is in check!` : `${pos.turn === 'w' ? 'White' : 'Black'} to move`
      };
    },

    // Calculate material balance
    getMaterialBalance(pos) {
      const vals = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
      let wScore = 0;
      let bScore = 0;

      for (let i = 0; i < 64; i++) {
        const p = pos.board[i];
        if (!p) continue;
        if (p.color === 'w') wScore += vals[p.type];
        else bScore += vals[p.type];
      }

      return {
        white: wScore,
        black: bScore,
        diff: wScore - bScore
      };
    },

    // Get captured pieces list
    getCapturedPieces(pos) {
      const startCounts = { p: 8, n: 2, b: 2, r: 2, q: 1 };
      const currentWhite = { p: 0, n: 0, b: 0, r: 0, q: 0 };
      const currentBlack = { p: 0, n: 0, b: 0, r: 0, q: 0 };

      for (let i = 0; i < 64; i++) {
        const p = pos.board[i];
        if (!p || p.type === 'k') continue;
        if (p.color === 'w') currentWhite[p.type] = (currentWhite[p.type] || 0) + 1;
        else currentBlack[p.type] = (currentBlack[p.type] || 0) + 1;
      }

      const whiteCaptured = []; // Pieces Black lost (captured by White)
      const blackCaptured = []; // Pieces White lost (captured by Black)

      for (const t of ['q', 'r', 'b', 'n', 'p']) {
        const missingBlack = Math.max(0, startCounts[t] - currentBlack[t]);
        for (let j = 0; j < missingBlack; j++) whiteCaptured.push({ type: t, color: 'b' });

        const missingWhite = Math.max(0, startCounts[t] - currentWhite[t]);
        for (let j = 0; j < missingWhite; j++) blackCaptured.push({ type: t, color: 'w' });
      }

      return { whiteCaptured, blackCaptured };
    },

    // Export current board position to FEN
    getFen(pos) {
      let fen = '';
      for (let r = 7; r >= 0; r--) {
        let empty = 0;
        for (let f = 0; f < 8; f++) {
          const p = pos.board[r * 8 + f];
          if (!p) {
            empty++;
          } else {
            if (empty > 0) {
              fen += empty;
              empty = 0;
            }
            fen += p.color === 'w' ? p.type.toUpperCase() : p.type.toLowerCase();
          }
        }
        if (empty > 0) fen += empty;
        if (r > 0) fen += '/';
      }

      fen += ` ${pos.turn} `;

      let castling = '';
      if (pos.castling.K) castling += 'K';
      if (pos.castling.Q) castling += 'Q';
      if (pos.castling.k) castling += 'k';
      if (pos.castling.q) castling += 'q';
      fen += (castling || '-') + ' ';

      fen += ChessEngine.sqToName(pos.enPassant) + ' ';
      fen += `${pos.halfmoveClock} ${pos.fullmoveNumber}`;

      return fen;
    },

    // Parse FEN with strict validation
    parseFen(fen) {
      if (!fen || typeof fen !== 'string') {
        return { valid: false, error: 'Empty or invalid FEN' };
      }

      const tokens = fen.trim().split(/\s+/);
      if (tokens.length < 4) {
        return { valid: false, error: 'FEN must contain at least 4 tokens' };
      }

      const [ranksStr, turn, castling, enPassant, halfmove = '0', fullmove = '1'] = tokens;

      // 1. Validate ranks
      const ranks = ranksStr.split('/');
      if (ranks.length !== 8) {
        return { valid: false, error: 'FEN must have exactly 8 ranks' };
      }

      const board = new Array(64).fill(null);
      let wKings = 0, bKings = 0;

      for (let r = 7; r >= 0; r--) {
        const rankStr = ranks[7 - r];
        let file = 0;
        for (let i = 0; i < rankStr.length; i++) {
          const ch = rankStr[i];
          if (ch >= '1' && ch <= '8') {
            file += parseInt(ch, 10);
          } else {
            const isWhite = ch === ch.toUpperCase();
            const type = ch.toLowerCase();
            if (!['p', 'n', 'b', 'r', 'q', 'k'].includes(type)) {
              return { valid: false, error: `Invalid piece character: ${ch}` };
            }
            if (file > 7) {
              return { valid: false, error: `Too many squares in rank ${r + 1}` };
            }
            board[r * 8 + file] = { type, color: isWhite ? 'w' : 'b' };
            if (type === 'k') {
              if (isWhite) wKings++;
              else bKings++;
            }
            file++;
          }
        }
        if (file !== 8) {
          return { valid: false, error: `Rank ${r + 1} does not sum to 8 squares` };
        }
      }

      if (wKings !== 1 || bKings !== 1) {
        return { valid: false, error: `FEN must have exactly one white king and one black king (found W:${wKings}, B:${bKings})` };
      }

      // 2. Validate turn
      if (turn !== 'w' && turn !== 'b') {
        return { valid: false, error: `Invalid turn: ${turn}` };
      }

      // 2b. Validate halfmove and fullmove format
      if (!/^\d+$/.test(halfmove) || !/^\d+$/.test(fullmove)) {
        return { valid: false, error: 'Halfmove and fullmove must be integers' };
      }
      if (parseInt(fullmove, 10) < 1) {
        return { valid: false, error: 'Fullmove number must be at least 1' };
      }

      // 3. Validate castling
      const castlingObj = {
        K: castling.includes('K'),
        Q: castling.includes('Q'),
        k: castling.includes('k'),
        q: castling.includes('q')
      };

      // 4. Validate en passant
      let epSq = null;
      if (enPassant !== '-') {
        epSq = ChessEngine.nameToSq(enPassant);
        if (epSq === -1) {
          return { valid: false, error: `Invalid en passant square: ${enPassant}` };
        }
      }

      const pos = {
        board,
        turn,
        castling: castlingObj,
        enPassant: epSq,
        halfmoveClock: parseInt(halfmove, 10) || 0,
        fullmoveNumber: parseInt(fullmove, 10) || 1
      };

      // Check that non-active king is not left in check
      const inactiveColor = turn === 'w' ? 'b' : 'w';
      const inactKingSq = ChessEngine.findKingSquare(board, inactiveColor);
      if (ChessEngine.isSquareAttacked(board, inactKingSq, turn)) {
        return { valid: false, error: `Non-active player ${inactiveColor} is in check` };
      }

      return { valid: true, position: pos };
    },

    // Export game to PGN string
    exportPgn(pos, metadata = {}) {
      const headers = [
        `[Event "${metadata.event || '  Chess Match'}"]`,
        `[Site "${metadata.site || 'Local Browser'}"]`,
        `[Date "${new Date().toISOString().split('T')[0]}"]`,
        `[Round "${metadata.round || '1'}"]`,
        `[White "${metadata.white || 'Player 1'}"]`,
        `[Black "${metadata.black || 'Player 2'}"]`,
        `[Result "${metadata.result || '*'}"]`,
        ''
      ];

      const moves = [];
      for (let i = 0; i < pos.history.length; i++) {
        const h = pos.history[i];
        if (i % 2 === 0) {
          moves.push(`${Math.floor(i / 2) + 1}. ${h.san}`);
        } else {
          moves[moves.length - 1] += ` ${h.san}`;
        }
      }

      return headers.join('\n') + moves.join(' ') + (metadata.result ? ` ${metadata.result}` : '');
    }
  };

  // =========================================================================
  // 3. COMPUTER AI ENGINE (Minimax with Alpha-Beta & Positional Tables)
  // =========================================================================

  const ChessAI = {
    PIECE_VALUES: { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 },

    // Piece-Square Tables (White perspective; flipped for Black)
    PST: {
      p: [
         0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0
      ],
      n: [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
      ],
      b: [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  5,  0,  0,  5,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
      ],
      r: [
          0,  0,  0,  0,  0,  0,  0,  0,
          5, 10, 10, 10, 10, 10, 10,  5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
          0,  0,  0,  5,  5,  0,  0,  0
      ],
      q: [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
         -5,  0,  5,  5,  5,  5,  0, -5,
          0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
      ],
      k: [
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
         20, 20,  0,  0,  0,  0, 20, 20,
         20, 30, 10,  0,  0, 10, 30, 20
      ]
    },

    // Static Position Evaluator (Positive favors White, Negative favors Black)
    evaluate(pos) {
      let evalScore = 0;

      for (let sq = 0; sq < 64; sq++) {
        const p = pos.board[sq];
        if (!p) continue;

        const val = ChessAI.PIECE_VALUES[p.type];
        const pstRank = p.color === 'w' ? (7 - Math.floor(sq / 8)) : Math.floor(sq / 8);
        const pstFile = sq % 8;
        const pstIndex = pstRank * 8 + pstFile;
        const posBonus = ChessAI.PST[p.type] ? ChessAI.PST[p.type][pstIndex] : 0;

        if (p.color === 'w') {
          evalScore += val + posBonus;
        } else {
          evalScore -= (val + posBonus);
        }
      }

      return evalScore;
    },

    // Move ordering for Alpha-Beta efficiency (MVV-LVA)
    orderMoves(moves) {
      return moves.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.captured) {
          scoreA = ChessAI.PIECE_VALUES[a.captured.type] * 10 - ChessAI.PIECE_VALUES[a.piece.type];
        }
        if (a.promotion) scoreA += ChessAI.PIECE_VALUES[a.promotion];

        if (b.captured) {
          scoreB = ChessAI.PIECE_VALUES[b.captured.type] * 10 - ChessAI.PIECE_VALUES[b.piece.type];
        }
        if (b.promotion) scoreB += ChessAI.PIECE_VALUES[b.promotion];

        return scoreB - scoreA;
      });
    },

    // Minimax search with Alpha-Beta pruning
    minimax(pos, depth, alpha, beta, isMaximizing) {
      if (depth === 0) {
        return { score: ChessAI.evaluate(pos) };
      }

      const legalMoves = ChessAI.orderMoves(ChessEngine.getLegalMoves(pos));

      if (legalMoves.length === 0) {
        if (ChessEngine.isCheck(pos, pos.turn)) {
          return { score: isMaximizing ? -50000 - depth : 50000 + depth };
        }
        return { score: 0 }; // Stalemate
      }

      let bestMove = legalMoves[0];

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of legalMoves) {
          const clone = ChessEngine.clonePosition(pos);
          ChessEngine.makeMove(clone, move);
          const evaluation = ChessAI.minimax(clone, depth - 1, alpha, beta, false).score;
          if (evaluation > maxEval) {
            maxEval = evaluation;
            bestMove = move;
          }
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break; // Alpha-beta cutoff
        }
        return { score: maxEval, move: bestMove };
      } else {
        let minEval = Infinity;
        for (const move of legalMoves) {
          const clone = ChessEngine.clonePosition(pos);
          ChessEngine.makeMove(clone, move);
          const evaluation = ChessAI.minimax(clone, depth - 1, alpha, beta, true).score;
          if (evaluation < minEval) {
            minEval = evaluation;
            bestMove = move;
          }
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break; // Alpha-beta cutoff
        }
        return { score: minEval, move: bestMove };
      }
    },

    // Choose best move asynchronously to avoid blocking UI
    getBestMove(pos, depth = 3) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const isWhite = pos.turn === 'w';
          const legalMoves = ChessEngine.getLegalMoves(pos);
          if (legalMoves.length === 0) {
            resolve(null);
            return;
          }

          // Level 1: Casual / slight randomization
          if (depth === 1) {
            const captures = legalMoves.filter(m => m.captured);
            if (captures.length > 0 && Math.random() < 0.6) {
              resolve(captures[Math.floor(Math.random() * captures.length)]);
              return;
            }
            resolve(legalMoves[Math.floor(Math.random() * legalMoves.length)]);
            return;
          }

          const result = ChessAI.minimax(pos, depth, -Infinity, Infinity, isWhite);
          resolve(result.move || legalMoves[0]);
        }, 80);
      });
    }
  };

  // =========================================================================
  // 4. OPENING EXPLORER DATABASE
  // =========================================================================

  const ChessOpenings = [
    { eco: 'C50', name: 'Italian Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], desc: 'Develops bishop swiftly to target the vulnerable f7 square.' },
    { eco: 'C60', name: 'Ruy Lopez', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], desc: 'The Spanish Opening: puts indirect pressure on the e5 center pawn.' },
    { eco: 'B20', name: 'Sicilian Defense', moves: ['e4', 'c5'], desc: 'The most popular combative defense, creating immediate imbalance on the c-file.' },
    { eco: 'B90', name: 'Sicilian: Najdorf', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'], desc: 'Fischer and Kasparov favorite: versatile and razor-sharp.' },
    { eco: 'C00', name: 'French Defense', moves: ['e4', 'e6'], desc: 'Solid pawn chain counter-attacking White center with ...d5 and ...c5.' },
    { eco: 'B10', name: 'Caro-Kann Defense', moves: ['e4', 'c6'], desc: 'Sturdy, sound defense preparing d5 without trapping the light-squared bishop.' },
    { eco: 'D06', name: "Queen's Gambit", moves: ['d4', 'd5', 'c4'], desc: 'White offers a flank wing pawn to dominate the central dark squares.' },
    { eco: 'D30', name: "Queen's Gambit Declined", moves: ['d4', 'd5', 'c4', 'e6'], desc: 'Rock-solid defense reinforcing the central point d5.' },
    { eco: 'E60', name: "King's Indian Defense", moves: ['d4', 'Nf6', 'c4', 'g6'], desc: 'Hypermodern counter-attack allowing White the center to strike on kingside.' },
    { eco: 'A10', name: 'English Opening', moves: ['c4'], desc: 'Flexible flank opening controlling the d5 square before committing center pawns.' },
    { eco: 'B01', name: 'Scandinavian Defense', moves: ['e4', 'd5'], desc: 'Direct central challenge against 1. e4.' },
    { eco: 'C45', name: 'Scotch Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'], desc: 'Direct early liquidation in the center opening lines for White.' },
    { eco: 'D02', name: 'London System', moves: ['d4', 'd5', 'Bf4'], desc: 'Harmonious, universal setup prioritizing solid development.' }
  ];

  function identifyOpening(history) {
    if (!history || history.length === 0) {
      return { eco: 'A00', name: 'Standard Starting Position', desc: 'Control the center with 1. e4 or 1. d4 and develop your pieces toward the center.' };
    }

    const sans = history.map(h => h.san.replace(/[+#]/, ''));
    let bestMatch = null;
    let maxMatchLen = 0;

    for (const op of ChessOpenings) {
      if (op.moves.length <= sans.length) {
        let matches = true;
        for (let i = 0; i < op.moves.length; i++) {
          if (op.moves[i] !== sans[i]) {
            matches = false;
            break;
          }
        }
        if (matches && op.moves.length > maxMatchLen) {
          bestMatch = op;
          maxMatchLen = op.moves.length;
        }
      }
    }

    return bestMatch || { eco: 'A00', name: 'Custom Opening Line', desc: 'Unorthodox or transitioning opening sequence.' };
  }

  // =========================================================================
  // 5. TACTICAL PUZZLES REPERTOIRE
  // =========================================================================

  const ChessPuzzles = [
    {
      id: 1,
      title: 'Queen Deflection Mate',
      fen: 'r1b2rk1/pp3ppp/8/8/1B1Q4/8/PP3PPP/4R1K1 w - - 0 1',
      prompt: 'White to move: deliver a swift back-rank win!',
      solution: ['Bxf8'],
      rating: 1400
    },
    {
      id: 2,
      title: "Scholar's Mate Trap",
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
      prompt: 'White to move and deliver immediate checkmate!',
      solution: ['Qxf7#'],
      rating: 1100
    },
    {
      id: 3,
      title: 'Knight Fork Extravaganza',
      fen: 'r1bqk2r/pppp1ppp/2n5/4P3/1bB1n3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 1',
      prompt: 'White to move and regain material with pressure!',
      solution: ['Qd5'],
      rating: 1550
    }
  ];

  // =========================================================================
  // 6. GUIDED OPENING LESSONS
  // =========================================================================

  const ChessLearnLessons = [
    {
      title: 'Italian Game Mastery',
      eco: 'C50',
      steps: [
        { move: 'e4', note: '1. e4 controls the d5 and f5 squares and opens paths for queen and bishop.' },
        { move: 'e5', note: 'Black responds symmetrically with 1... e5 to stake an equal claim in the center.' },
        { move: 'Nf3', note: '2. Nf3 develops a minor piece while attacking Black e5 pawn.' },
        { move: 'Nc6', note: 'Black defends the e5 pawn while bringing out a knight toward the center.' },
        { move: 'Bc4', note: '3. Bc4 pins its sight on Black weakest pawn: f7.' }
      ]
    }
  ];

  // =========================================================================
  // 7. WEB AUDIO API SYNTHESIZER
  // Pure browser audio synthesis without external media dependencies.
  // =========================================================================

  const ChessSound = {
    ctx: null,
    enabled: true,

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    },

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    playTone(freq, type = 'sine', duration = 0.08, gainPeak = 0.25) {
      if (!this.enabled) return;
      this.init();
      this.resume();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(gainPeak, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio unavailable or blocked by browser policy
      }
    },

    move() {
      this.playTone(320, 'triangle', 0.07, 0.2);
    },

    capture() {
      this.playTone(520, 'square', 0.1, 0.25);
    },

    check() {
      this.playTone(880, 'sine', 0.22, 0.35);
      setTimeout(() => this.playTone(1100, 'sine', 0.25, 0.35), 70);
    },

    castle() {
      this.playTone(400, 'triangle', 0.08, 0.2);
      setTimeout(() => this.playTone(600, 'triangle', 0.09, 0.2), 60);
    },

    gameOver() {
      this.playTone(523, 'sine', 0.2, 0.3);
      setTimeout(() => this.playTone(659, 'sine', 0.2, 0.3), 150);
      setTimeout(() => this.playTone(784, 'sine', 0.3, 0.3), 300);
    },

    illegal() {
      this.playTone(180, 'sawtooth', 0.09, 0.25);
    }
  };

  // =========================================================================
  // 8. HIGH-PRECISION CHESS CLOCK
  // Monotonic time tracking using performance.now() to prevent timer drift.
  // =========================================================================

  class ChessClock {
    constructor(options = {}) {
      this.initialSeconds = options.initialSeconds !== undefined ? options.initialSeconds : 600; // 10 min
      this.incrementSeconds = options.incrementSeconds || 0;
      this.onTick = options.onTick || (() => {});
      this.onTimeout = options.onTimeout || (() => {});

      this.whiteTimeMs = this.initialSeconds * 1000;
      this.blackTimeMs = this.initialSeconds * 1000;
      this.activeColor = null;
      this.lastTickTime = null;
      this.timerId = null;
      this.paused = true;
    }

    start(color = 'w') {
      this.activeColor = color;
      this.paused = false;
      this.lastTickTime = performance.now();
      this.clearTimer();
      this.timerId = setInterval(() => this.tick(), 100);
      this.onTick(this.getState());
    }

    switchTurn() {
      if (this.paused || !this.activeColor) return;
      this.tick(); // Flush delta before adding increment

      // Add increment to the player whose turn just concluded
      if (this.activeColor === 'w') {
        this.whiteTimeMs += this.incrementSeconds * 1000;
        this.activeColor = 'b';
      } else {
        this.blackTimeMs += this.incrementSeconds * 1000;
        this.activeColor = 'w';
      }

      this.lastTickTime = performance.now();
      this.onTick(this.getState());
    }

    pause() {
      if (this.paused) return;
      this.tick();
      this.paused = true;
      this.clearTimer();
      this.onTick(this.getState());
    }

    resume() {
      if (!this.paused || !this.activeColor) return;
      this.paused = false;
      this.lastTickTime = performance.now();
      this.clearTimer();
      this.timerId = setInterval(() => this.tick(), 100);
      this.onTick(this.getState());
    }

    tick() {
      if (this.paused || !this.activeColor) return;
      const now = performance.now();
      const delta = now - this.lastTickTime;
      this.lastTickTime = now;

      if (this.activeColor === 'w') {
        this.whiteTimeMs = Math.max(0, this.whiteTimeMs - delta);
        if (this.whiteTimeMs <= 0) {
          this.handleTimeout('w');
        }
      } else {
        this.blackTimeMs = Math.max(0, this.blackTimeMs - delta);
        if (this.blackTimeMs <= 0) {
          this.handleTimeout('b');
        }
      }

      this.onTick(this.getState());
    }

    handleTimeout(color) {
      this.clearTimer();
      this.paused = true;
      this.onTimeout(color);
    }

    clearTimer() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }

    reset(initialSeconds = this.initialSeconds, incrementSeconds = this.incrementSeconds) {
      this.clearTimer();
      this.initialSeconds = initialSeconds;
      this.incrementSeconds = incrementSeconds;
      this.whiteTimeMs = this.initialSeconds * 1000;
      this.blackTimeMs = this.initialSeconds * 1000;
      this.activeColor = null;
      this.paused = true;
      this.onTick(this.getState());
    }

    formatTime(ms) {
      const totalSec = Math.ceil(ms / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    getState() {
      return {
        whiteTimeFormatted: this.formatTime(this.whiteTimeMs),
        blackTimeFormatted: this.formatTime(this.blackTimeMs),
        whiteTimeMs: this.whiteTimeMs,
        blackTimeMs: this.blackTimeMs,
        activeColor: this.activeColor,
        paused: this.paused
      };
    }
  }

  // =========================================================================
  // 9. LOCAL STORAGE PERSISTENCE
  // =========================================================================

  const ChessStorage = {
    PREFIX: 'ag_chess_',

    get(key, defaultVal) {
      try {
        const val = localStorage.getItem(this.PREFIX + key);
        return val ? JSON.parse(val) : defaultVal;
      } catch (e) {
        return defaultVal;
      }
    },

    set(key, val) {
      try {
        localStorage.setItem(this.PREFIX + key, JSON.stringify(val));
      } catch (e) {}
    },

    loadStats() {
      return this.get('stats', {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        totalDurationSeconds: 0
      });
    },

    saveStats(stats) {
      this.set('stats', stats);
    }
  };

  // =========================================================================
  // 10. MAIN APP CONTROLLER & INTERACTIVE UI
  // =========================================================================

  const ChessApp = {
    pos: null,
    clock: null,
    selectedSq: null,
    legalMovesForSelected: [],
    boardFlipped: false,
    activeMode: 'vs-computer', // 'vs-computer', 'local-2p', 'free-analysis'
    userColor: 'white', // 'white' or 'black'
    aiDifficulty: 3,
    timeControl: '10|0',
    pendingPromotionMove: null,
    inspectingHistoryIndex: null,
    stats: null,
    currentPuzzleIndex: 0,
    currentLessonStep: 0,

    init() {
      this.stats = ChessStorage.loadStats();
      this.pos = ChessEngine.createGame();
      this.initClock();
      this.buildBoardDOM();
      this.attachEventListeners();
      this.loadSettings();
      this.render();
      this.updateStatsUI();
      this.updateOpeningCard();
      this.updatePositionTips();
    },

    initClock() {
      let initialSec = 600;
      let incSec = 0;
      if (this.timeControl && this.timeControl !== 'none') {
        const parts = this.timeControl.split('|');
        initialSec = parseInt(parts[0], 10) * 60;
        incSec = parseInt(parts[1], 10) || 0;
      }

      this.clock = new ChessClock({
        initialSeconds: initialSec,
        incrementSeconds: incSec,
        onTick: (state) => this.renderClocks(state),
        onTimeout: (color) => this.handleTimeout(color)
      });
    },

    buildBoardDOM() {
      const boardEl = document.getElementById('chess-board');
      if (!boardEl) return;
      boardEl.innerHTML = '';

      for (let r = 7; r >= 0; r--) {
        for (let f = 0; f < 8; f++) {
          const sq = r * 8 + f;
          const isLight = (r + f) % 2 !== 0;

          const sqEl = document.createElement('div');
          sqEl.className = `square ${isLight ? 'sq-light' : 'sq-dark'}`;
          sqEl.dataset.sq = sq;
          sqEl.setAttribute('role', 'button');
          sqEl.setAttribute('tabindex', '0');
          sqEl.setAttribute('aria-label', `Square ${ChessEngine.sqToName(sq)}`);

          // Coordinate labels
          if (f === 0) {
            const rankLabel = document.createElement('span');
            rankLabel.className = 'coord-rank';
            rankLabel.textContent = (r + 1).toString();
            sqEl.appendChild(rankLabel);
          }
          if (r === 0) {
            const fileLabel = document.createElement('span');
            fileLabel.className = 'coord-file';
            fileLabel.textContent = String.fromCharCode(97 + f);
            sqEl.appendChild(fileLabel);
          }

          boardEl.appendChild(sqEl);
        }
      }
    },

    attachEventListeners() {
      const boardEl = document.getElementById('chess-board');
      if (!boardEl) return;

      // Click to select & move
      boardEl.addEventListener('click', (e) => {
        const sqEl = e.target.closest('.square');
        if (!sqEl) return;
        const sq = parseInt(sqEl.dataset.sq, 10);
        this.handleSquareClick(sq);
      });

      // Drag and drop handling
      boardEl.addEventListener('dragstart', (e) => {
        const isRobotTurn = this.activeMode === 'vs-computer' && (
          (this.userColor === 'white' && this.pos.turn === 'b') ||
          (this.userColor === 'black' && this.pos.turn === 'w')
        );
        if (isRobotTurn) {
          e.preventDefault();
          return;
        }
        const pieceEl = e.target.closest('.piece');
        if (!pieceEl) return;
        const sqEl = pieceEl.closest('.square');
        if (!sqEl) return;
        const sq = parseInt(sqEl.dataset.sq, 10);
        this.handleSquareClick(sq);
        e.dataTransfer.setData('text/plain', sq.toString());
        pieceEl.classList.add('dragging');
      });

      boardEl.addEventListener('dragend', (e) => {
        const pieceEl = e.target.closest('.piece');
        if (pieceEl) pieceEl.classList.remove('dragging');
      });

      boardEl.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      boardEl.addEventListener('drop', (e) => {
        e.preventDefault();
        const sqEl = e.target.closest('.square');
        if (!sqEl) return;
        const toSq = parseInt(sqEl.dataset.sq, 10);
        const fromSq = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(fromSq) && fromSq !== toSq) {
          this.attemptMove(fromSq, toSq);
        }
      });

      // Play Mode Bar (Robot vs Manual)
      document.getElementById('btn-mode-robot')?.addEventListener('click', () => this.setGameMode('vs-computer'));
      document.getElementById('btn-mode-manual')?.addEventListener('click', () => this.setGameMode('local-2p'));
      document.getElementById('select-robot-difficulty')?.addEventListener('change', (e) => this.setRobotDifficulty(e.target.value));
      document.getElementById('btn-choose-white')?.addEventListener('click', () => this.setUserColor('white'));
      document.getElementById('btn-choose-black')?.addEventListener('click', () => this.setUserColor('black'));

      // Controls Bar Buttons
      document.getElementById('btn-flip-board')?.addEventListener('click', () => this.flipBoard());
      document.getElementById('btn-undo-move')?.addEventListener('click', () => this.undoMove());
      document.getElementById('btn-redo-move')?.addEventListener('click', () => this.redoMove());
      document.getElementById('btn-hint')?.addEventListener('click', () => this.showHint());
      document.getElementById('btn-new-game')?.addEventListener('click', () => this.startNewGame());
      document.getElementById('btn-draw-offer')?.addEventListener('click', () => this.openDrawModal());
      document.getElementById('btn-resign')?.addEventListener('click', () => this.openResignModal());
      document.getElementById('btn-export-import')?.addEventListener('click', () => this.openExportImportModal());

      // Header Buttons
      document.getElementById('btn-sound-toggle')?.addEventListener('click', () => this.toggleSound());
      document.getElementById('btn-theme-toggle')?.addEventListener('click', () => this.cycleTheme());
      document.getElementById('btn-open-settings')?.addEventListener('click', () => this.openSettingsModal());
      document.getElementById('btn-close-settings')?.addEventListener('click', () => this.closeSettingsModal());
      document.getElementById('btn-save-settings')?.addEventListener('click', () => this.saveSettings());
      document.getElementById('btn-user-profile')?.addEventListener('click', () => this.openSettingsModal());

      // Move Nav Buttons
      document.getElementById('btn-move-start')?.addEventListener('click', () => this.goToMove(0));
      document.getElementById('btn-move-prev')?.addEventListener('click', () => this.goToPrevMove());
      document.getElementById('btn-move-next')?.addEventListener('click', () => this.goToNextMove());
      document.getElementById('btn-move-end')?.addEventListener('click', () => this.goToMove(this.pos.history.length));

      // Inspector Tabs Switcher
      document.querySelectorAll('.inspector-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.inspector-tab-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          const targetId = btn.dataset.target;
          document.getElementById(targetId)?.classList.add('active');
        });
      });

      // Mode Navigation Tabs in Header
      document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.nav-tab-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');

          const tabName = btn.dataset.tab;
          if (tabName === 'puzzles') {
            this.switchInspectorTab('tab-puzzles-view');
            this.loadPuzzle(0);
          } else if (tabName === 'analysis') {
            this.activeMode = 'free-analysis';
            this.switchInspectorTab('tab-tips');
            this.showToast('Switched to Free-Play Analysis Mode');
          } else if (tabName === 'learn') {
            this.switchInspectorTab('tab-learn-view');
            this.loadLesson(0);
          } else if (tabName === 'statistics') {
            this.switchInspectorTab('tab-stats-view');
          } else {
            this.switchInspectorTab('tab-moves');
          }
        });
      });

      // Puzzles & Learn Buttons
      document.getElementById('btn-next-puzzle')?.addEventListener('click', () => this.nextPuzzle());
      document.getElementById('btn-puzzle-hint')?.addEventListener('click', () => this.showPuzzleHint());
      document.getElementById('btn-puzzle-reset')?.addEventListener('click', () => this.loadPuzzle(this.currentPuzzleIndex));
      document.getElementById('btn-lesson-next')?.addEventListener('click', () => this.nextLessonStep());
      document.getElementById('btn-lesson-prev')?.addEventListener('click', () => this.prevLessonStep());
      document.getElementById('btn-lesson-reset')?.addEventListener('click', () => this.resetLesson());
      document.getElementById('btn-reset-stats')?.addEventListener('click', () => this.resetStats());

      // Modals
      document.getElementById('btn-cancel-resign')?.addEventListener('click', () => this.closeModal('resign-modal'));
      document.getElementById('btn-confirm-resign')?.addEventListener('click', () => this.confirmResign());
      document.getElementById('btn-cancel-draw')?.addEventListener('click', () => this.closeModal('draw-modal'));
      document.getElementById('btn-confirm-draw')?.addEventListener('click', () => this.confirmDraw());
      document.getElementById('btn-close-gameover')?.addEventListener('click', () => this.closeModal('gameover-modal'));
      document.getElementById('btn-gameover-rematch')?.addEventListener('click', () => {
        this.closeModal('gameover-modal');
        this.startNewGame();
      });
      document.getElementById('btn-gameover-analyze')?.addEventListener('click', () => {
        this.closeModal('gameover-modal');
        this.activeMode = 'free-analysis';
        this.switchInspectorTab('tab-tips');
      });

      // FEN/PGN Modal Buttons
      document.getElementById('btn-close-export-import')?.addEventListener('click', () => this.closeModal('export-import-modal'));
      document.getElementById('btn-copy-fen')?.addEventListener('click', () => this.copyFen());
      document.getElementById('btn-load-fen')?.addEventListener('click', () => this.loadFenFromInput());
      document.getElementById('btn-copy-pgn')?.addEventListener('click', () => this.copyPgn());
      document.getElementById('btn-load-pgn')?.addEventListener('click', () => this.loadPgnFromInput());

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'f' || e.key === 'F') this.flipBoard();
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) this.undoMove();
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) this.redoMove();
        if (e.key === 'h' || e.key === 'H') this.showHint();
        if (e.key === 'Escape') this.deselect();
      });
    },

    switchInspectorTab(tabId) {
      document.querySelectorAll('.inspector-tab-btn').forEach(btn => {
        if (btn.dataset.target === tabId) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        }
      });
      document.querySelectorAll('.tab-pane').forEach(p => {
        if (p.id === tabId) p.classList.add('active');
        else p.classList.remove('active');
      });
    },

    handleSquareClick(sq) {
      // Prevent human input during robot's turn
      const isRobotTurn = this.activeMode === 'vs-computer' && (
        (this.userColor === 'white' && this.pos.turn === 'b') ||
        (this.userColor === 'black' && this.pos.turn === 'w')
      );
      if (isRobotTurn) return;

      // If we are previewing an old history move, clicking the board brings back current position
      if (this.inspectingHistoryIndex !== null) {
        this.inspectingHistoryIndex = null;
        this.render();
      }

      const piece = this.pos.board[sq];

      // If no square currently selected
      if (this.selectedSq === null) {
        if (piece && piece.color === this.pos.turn) {
          this.selectSquare(sq);
        }
        return;
      }

      // If clicked the already selected square, deselect
      if (this.selectedSq === sq) {
        this.deselect();
        return;
      }

      // If clicked another piece of the same friendly color, change selection
      if (piece && piece.color === this.pos.turn) {
        this.selectSquare(sq);
        return;
      }

      // Otherwise attempt move from selectedSq to sq
      this.attemptMove(this.selectedSq, sq);
    },

    selectSquare(sq) {
      this.selectedSq = sq;
      this.legalMovesForSelected = ChessEngine.getLegalMoves(this.pos, sq);
      this.renderHighlights();
    },

    deselect() {
      this.selectedSq = null;
      this.legalMovesForSelected = [];
      this.renderHighlights();
    },

    attemptMove(fromSq, toSq) {
      // Check if this move requires pawn promotion
      const piece = this.pos.board[fromSq];
      const isPromo = piece && piece.type === 'p' && (
        (piece.color === 'w' && Math.floor(toSq / 8) === 7) ||
        (piece.color === 'b' && Math.floor(toSq / 8) === 0)
      );

      if (isPromo) {
        // Verify destination is a legal move
        const match = this.legalMovesForSelected.find(m => m.from === fromSq && m.to === toSq);
        if (match) {
          this.pendingPromotionMove = { from: fromSq, to: toSq };
          this.openPromotionModal(piece.color);
          return;
        }
      }

      const res = ChessEngine.makeMove(this.pos, { from: fromSq, to: toSq });
      if (res.success) {
        this.onMoveExecuted(res.move);
      } else {
        this.triggerIllegalShake(fromSq);
        ChessSound.illegal();
      }
      this.deselect();
    },

    executePromotion(promoPiece) {
      this.closeModal('promotion-modal');
      if (!this.pendingPromotionMove) return;

      const { from, to } = this.pendingPromotionMove;
      this.pendingPromotionMove = null;

      const res = ChessEngine.makeMove(this.pos, { from, to, promotion: promoPiece });
      if (res.success) {
        this.onMoveExecuted(res.move);
      }
      this.deselect();
    },

    onMoveExecuted(moveRecord) {
      // Audio playback
      if (moveRecord.isCastle) {
        ChessSound.castle();
      } else if (moveRecord.captured) {
        ChessSound.capture();
      } else {
        ChessSound.move();
      }

      // Clock switching
      if (this.clock) {
        if (this.pos.history.length === 1) {
          this.clock.start('b');
        } else {
          this.clock.switchTurn();
        }
      }

      // Check / Checkmate audio and status check
      const status = ChessEngine.getGameStatus(this.pos);
      if (status.status === 'checkmate') {
        ChessSound.gameOver();
        this.clock?.pause();
        this.onGameOver(status.winner, 'Checkmate');
      } else if (status.terminal) {
        ChessSound.gameOver();
        this.clock?.pause();
        this.onGameOver('draw', status.message);
      } else if (status.inCheck) {
        ChessSound.check();
      }

      this.render();
      this.updateOpeningCard();
      this.updatePositionTips();

      // Trigger AI reply if playing vs computer
      const isRobotTurn = this.activeMode === 'vs-computer' && (
        (this.userColor === 'white' && this.pos.turn === 'b') ||
        (this.userColor === 'black' && this.pos.turn === 'w')
      );
      if (!status.terminal && isRobotTurn) {
        this.triggerAiMove();
      }
    },

    async triggerAiMove() {
      const statusBanner = document.getElementById('game-status-text');
      if (statusBanner) statusBanner.textContent = `Cyber Robot Lv ${this.aiDifficulty} is thinking...`;

      const bestMove = await ChessAI.getBestMove(this.pos, this.aiDifficulty);
      const isRobotTurn = this.activeMode === 'vs-computer' && (
        (this.userColor === 'white' && this.pos.turn === 'b') ||
        (this.userColor === 'black' && this.pos.turn === 'w')
      );
      if (bestMove && isRobotTurn) {
        const res = ChessEngine.makeMove(this.pos, bestMove);
        if (res.success) {
          this.onMoveExecuted(res.move);
        }
      }
    },

    undoMove() {
      const undone = ChessEngine.undoMove(this.pos);
      if (undone) {
        this.deselect();
        this.render();
        this.updateOpeningCard();
        this.updatePositionTips();
        this.showToast('Move undone');
      }
    },

    redoMove() {
      const redone = ChessEngine.redoMove(this.pos);
      if (redone) {
        this.deselect();
        this.render();
        this.updateOpeningCard();
        this.updatePositionTips();
        this.showToast('Move redone');
      }
    },

    flipBoard() {
      this.boardFlipped = !this.boardFlipped;
      const boardEl = document.getElementById('chess-board');
      if (boardEl) {
        boardEl.style.transform = this.boardFlipped ? 'rotate(180deg)' : 'none';
        // Keep piece icons right-side up
        document.querySelectorAll('.piece, .coord-rank, .coord-file').forEach(el => {
          el.style.transform = this.boardFlipped ? 'rotate(180deg)' : 'none';
        });
      }
      this.showToast(this.boardFlipped ? 'Board flipped to Black' : 'Board flipped to White');
    },

    showHint() {
      const bestMove = ChessAI.orderMoves(ChessEngine.getLegalMoves(this.pos))[0];
      if (!bestMove) return;

      document.querySelectorAll('.square').forEach(el => el.classList.remove('sq-hint'));
      const fromEl = document.querySelector(`.square[data-sq="${bestMove.from}"]`);
      const toEl = document.querySelector(`.square[data-sq="${bestMove.to}"]`);
      fromEl?.classList.add('sq-hint');
      toEl?.classList.add('sq-hint');

      const san = ChessEngine.getSan(this.pos, bestMove);
      this.showToast(`Hint recommendation: ${san}`);
    },

    render() {
      const displayPos = this.inspectingHistoryIndex !== null
        ? this.getHistoryPosition(this.inspectingHistoryIndex)
        : this.pos;

      const board = displayPos.board;

      for (let sq = 0; sq < 64; sq++) {
        const sqEl = document.querySelector(`.square[data-sq="${sq}"]`);
        if (!sqEl) continue;

        // Clean previous piece and markers
        const existingPiece = sqEl.querySelector('.piece');
        if (existingPiece) existingPiece.remove();

        const p = board[sq];
        if (p) {
          const pieceEl = document.createElement('div');
          pieceEl.className = 'piece';
          pieceEl.setAttribute('draggable', 'true');
          pieceEl.innerHTML = getPieceSvg(p);
          if (this.boardFlipped) pieceEl.style.transform = 'rotate(180deg)';
          sqEl.appendChild(pieceEl);
        }
      }

      this.renderHighlights();
      this.renderMovesList();
      this.renderCapturedAndBalance();
      this.renderStatusBanner();
      this.renderEvalBar();
    },

    renderHighlights() {
      document.querySelectorAll('.square').forEach(el => {
        el.classList.remove('sq-selected', 'sq-last-from', 'sq-last-to', 'sq-check');
        const marker = el.querySelector('.move-dest-marker, .capture-dest-marker');
        if (marker) marker.remove();
      });

      // Selected square highlight
      if (this.selectedSq !== null) {
        const selEl = document.querySelector(`.square[data-sq="${this.selectedSq}"]`);
        selEl?.classList.add('sq-selected');

        // Destination markers for legal moves
        for (const m of this.legalMovesForSelected) {
          const targetEl = document.querySelector(`.square[data-sq="${m.to}"]`);
          if (!targetEl) continue;

          if (m.captured) {
            const capMarker = document.createElement('div');
            capMarker.className = 'capture-dest-marker';
            targetEl.appendChild(capMarker);
          } else {
            const destMarker = document.createElement('div');
            destMarker.className = 'move-dest-marker';
            targetEl.appendChild(destMarker);
          }
        }
      }

      // Last move highlights
      const lastMove = this.pos.history[this.pos.history.length - 1];
      if (lastMove) {
        document.querySelector(`.square[data-sq="${lastMove.from}"]`)?.classList.add('sq-last-from');
        document.querySelector(`.square[data-sq="${lastMove.to}"]`)?.classList.add('sq-last-to');
      }

      // Checked King highlight
      if (ChessEngine.isCheck(this.pos, this.pos.turn)) {
        const kingSq = ChessEngine.findKingSquare(this.pos.board, this.pos.turn);
        if (kingSq !== -1) {
          document.querySelector(`.square[data-sq="${kingSq}"]`)?.classList.add('sq-check');
        }
      }
    },

    renderMovesList() {
      const listEl = document.getElementById('moves-list');
      if (!listEl) return;
      listEl.innerHTML = '';

      const history = this.pos.history;
      for (let i = 0; i < history.length; i += 2) {
        const moveRow = document.createElement('div');
        moveRow.className = 'move-row';

        const numEl = document.createElement('span');
        numEl.className = 'move-num';
        numEl.textContent = `${Math.floor(i / 2) + 1}.`;
        moveRow.appendChild(numEl);

        // White move cell
        const wMove = history[i];
        const wCell = document.createElement('span');
        wCell.className = `move-cell ${this.inspectingHistoryIndex === i ? 'active-move' : ''}`;
        wCell.textContent = wMove.san;
        wCell.addEventListener('click', () => this.goToMove(i + 1));
        moveRow.appendChild(wCell);

        // Black move cell
        if (i + 1 < history.length) {
          const bMove = history[i + 1];
          const bCell = document.createElement('span');
          bCell.className = `move-cell ${this.inspectingHistoryIndex === i + 1 ? 'active-move' : ''}`;
          bCell.textContent = bMove.san;
          bCell.addEventListener('click', () => this.goToMove(i + 2));
          moveRow.appendChild(bCell);
        }

        listEl.appendChild(moveRow);
      }

      // Auto-scroll moves container
      const container = listEl.parentElement;
      if (container) container.scrollTop = container.scrollHeight;
    },

    renderCapturedAndBalance() {
      const { whiteCaptured, blackCaptured } = ChessEngine.getCapturedPieces(this.pos);
      const balance = ChessEngine.getMaterialBalance(this.pos);

      // Top player captured (White lost, Black holds)
      const topCapturedEl = document.getElementById('top-captured-pieces');
      const topDiffEl = document.getElementById('top-material-diff');
      if (topCapturedEl) {
        topCapturedEl.innerHTML = blackCaptured.map(p => `<span>${this.pieceGlyph(p)}</span>`).join('');
      }
      if (topDiffEl) {
        if (balance.diff < 0) {
          topDiffEl.style.display = 'inline-block';
          topDiffEl.textContent = `+${Math.abs(balance.diff)}`;
        } else {
          topDiffEl.style.display = 'none';
        }
      }

      // Bottom player captured (Black lost, White holds)
      const botCapturedEl = document.getElementById('bottom-captured-pieces');
      const botDiffEl = document.getElementById('bottom-material-diff');
      if (botCapturedEl) {
        botCapturedEl.innerHTML = whiteCaptured.map(p => `<span>${this.pieceGlyph(p)}</span>`).join('');
      }
      if (botDiffEl) {
        if (balance.diff > 0) {
          botDiffEl.style.display = 'inline-block';
          botDiffEl.textContent = `+${balance.diff}`;
        } else {
          botDiffEl.style.display = 'none';
        }
      }
    },

    pieceGlyph(p) {
      const glyphs = {
        w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕' },
        b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' }
      };
      return glyphs[p.color]?.[p.type] || '';
    },

    renderStatusBanner() {
      const statusEl = document.getElementById('game-status-text');
      const badgeEl = document.getElementById('game-status-badge');
      const modeLabel = document.getElementById('current-mode-label');

      if (modeLabel) {
        modeLabel.textContent = this.activeMode === 'vs-computer' ? 'vs Computer' :
                                this.activeMode === 'free-analysis' ? 'Analysis' : 'Local 2P';
      }

      const status = ChessEngine.getGameStatus(this.pos);
      if (statusEl) statusEl.textContent = status.message;

      if (badgeEl) {
        badgeEl.classList.remove('in-check', 'game-over');
        if (status.inCheck) badgeEl.classList.add('in-check');
        if (status.terminal) badgeEl.classList.add('game-over');
      }

      // Update player cards active turn highlight
      const topCard = document.getElementById('top-player-card');
      const botCard = document.getElementById('bottom-player-card');
      if (this.pos.turn === 'w') {
        botCard?.classList.add('active-turn');
        topCard?.classList.remove('active-turn');
      } else {
        topCard?.classList.add('active-turn');
        botCard?.classList.remove('active-turn');
      }

      // Update player cards metadata according to active mode
      const topName = document.getElementById('top-name');
      const topRating = document.getElementById('top-rating');
      const topAvatar = document.getElementById('top-avatar');
      const botName = document.getElementById('bottom-name');
      const botRating = document.getElementById('bottom-rating');
      const botAvatar = document.getElementById('bottom-avatar');

      const playerName = ChessStorage.get('playerName', 'Grandmaster');
      const botRatingMap = { 1: '800 (Casual)', 2: '1200 (Intermediate)', 3: '1600 (Advanced)', 4: '2000 (Expert)' };

      if (this.activeMode === 'vs-computer') {
        const botRatingStr = botRatingMap[this.aiDifficulty] || '1600';
        if (topName) topName.textContent = `Cyber Robot Lv ${this.aiDifficulty}`;
        if (topRating) topRating.textContent = botRatingStr;
        if (topAvatar) {
          topAvatar.textContent = '🤖';
          topAvatar.className = 'avatar avatar-ai';
        }
        if (botName) botName.textContent = playerName;
        if (botRating) botRating.textContent = this.userColor === 'white' ? 'User (White)' : 'User (Black)';
        if (botAvatar) {
          botAvatar.textContent = playerName.slice(0, 2).toUpperCase();
          botAvatar.className = 'avatar';
        }
      } else if (this.activeMode === 'local-2p') {
        if (topName) topName.textContent = 'Player 2 (Black)';
        if (topRating) topRating.textContent = 'Pass & Play';
        if (topAvatar) {
          topAvatar.textContent = 'P2';
          topAvatar.className = 'avatar avatar-ai';
        }
        if (botName) botName.textContent = 'Player 1 (White)';
        if (botRating) botRating.textContent = 'Pass & Play';
        if (botAvatar) {
          botAvatar.textContent = 'P1';
          botAvatar.className = 'avatar';
        }
      } else {
        if (topName) topName.textContent = 'Analysis Board';
        if (topRating) topRating.textContent = 'Engine Eval';
        if (botName) botName.textContent = playerName;
      }
    },

    renderClocks(state) {
      const botClock = document.getElementById('bottom-clock');
      const topClock = document.getElementById('top-clock');

      if (botClock) {
        botClock.textContent = state.whiteTimeFormatted;
        botClock.classList.toggle('active-clock', state.activeColor === 'w');
        botClock.classList.toggle('low-time', state.whiteTimeMs < 30000);
      }
      if (topClock) {
        topClock.textContent = state.blackTimeFormatted;
        topClock.classList.toggle('active-clock', state.activeColor === 'b');
        topClock.classList.toggle('low-time', state.blackTimeMs < 30000);
      }
    },

    renderEvalBar() {
      const evalScoreEl = document.getElementById('eval-score-text');
      const fillEl = document.getElementById('eval-bar-fill');
      if (!evalScoreEl || !fillEl) return;

      const evalScore = ChessAI.evaluate(this.pos);
      const evalInPawns = (evalScore / 100).toFixed(1);
      evalScoreEl.textContent = (evalInPawns > 0 ? '+' : '') + evalInPawns;

      // Map score from [-1000, 1000] to [5%, 95%]
      const pct = Math.max(5, Math.min(95, 50 + (evalScore / 20)));
      fillEl.style.width = `${pct}%`;
    },

    updateOpeningCard() {
      const op = identifyOpening(this.pos.history);
      const nameEl = document.getElementById('opening-name-text');
      const ecoEl = document.getElementById('opening-eco-text');
      const descEl = document.getElementById('opening-desc-text');

      if (nameEl) nameEl.textContent = op.name;
      if (ecoEl) ecoEl.textContent = op.eco;
      if (descEl) descEl.textContent = op.desc;
    },

    updatePositionTips() {
      const legalCountEl = document.getElementById('legal-moves-count');
      const halfmoveEl = document.getElementById('halfmove-count');
      const repCountEl = document.getElementById('repetition-count');
      const tipsContentEl = document.getElementById('position-tips-content');

      const legalMoves = ChessEngine.getLegalMoves(this.pos);
      if (legalCountEl) legalCountEl.textContent = legalMoves.length.toString();
      if (halfmoveEl) halfmoveEl.textContent = `${this.pos.halfmoveClock} / 50`;

      const hash = ChessEngine.getPositionHash(this.pos);
      const rep = this.pos.positionCounts.get(hash) || 1;
      if (repCountEl) repCountEl.textContent = `${rep} / 3`;

      if (tipsContentEl) {
        if (this.pos.history.length === 0) {
          tipsContentEl.textContent = 'Standard opening position. Strive for central presence, rapid knight and bishop activation, and timely castling.';
        } else if (ChessEngine.isCheck(this.pos, this.pos.turn)) {
          tipsContentEl.textContent = 'King in check! Find a legal retreat, block the line of check, or capture the threatening piece immediately.';
        } else if (legalMoves.length < 5) {
          tipsContentEl.textContent = 'Notice piece restriction: mobility is highly constrained. Watch for tactics, pins, or zugzwang.';
        } else {
          tipsContentEl.textContent = `Side to move possesses ${legalMoves.length} legal moves. Maintain piece harmony, protect key pawn structures, and coordinate rooks.`;
        }
      }
    },

    // Move Navigation (History browsing)
    goToMove(moveIndex) {
      if (moveIndex < 0 || moveIndex > this.pos.history.length) return;
      this.inspectingHistoryIndex = moveIndex === this.pos.history.length ? null : moveIndex - 1;
      this.render();
    },

    goToPrevMove() {
      const current = this.inspectingHistoryIndex !== null ? this.inspectingHistoryIndex : this.pos.history.length - 1;
      if (current >= 0) {
        this.goToMove(current);
      }
    },

    goToNextMove() {
      if (this.inspectingHistoryIndex === null) return;
      this.goToMove(this.inspectingHistoryIndex + 2);
    },

    getHistoryPosition(index) {
      if (index < 0) return ChessEngine.createGame();
      const fen = this.pos.history[index].fenAfter;
      return ChessEngine.createGame(fen);
    },

    triggerIllegalShake(sq) {
      const el = document.querySelector(`.square[data-sq="${sq}"]`);
      if (el) {
        el.classList.add('shake-anim');
        setTimeout(() => el.classList.remove('shake-anim'), 400);
      }
    },

    // Modal Handlers
    openModal(id) {
      document.getElementById(id)?.classList.add('open');
    },

    closeModal(id) {
      document.getElementById(id)?.classList.remove('open');
    },

    openPromotionModal(color) {
      const container = document.getElementById('promotion-choices-container');
      if (!container) return;
      container.innerHTML = '';

      const choices = [
        { type: 'q', label: 'Queen (Q)' },
        { type: 'r', label: 'Rook (R)' },
        { type: 'b', label: 'Bishop (B)' },
        { type: 'n', label: 'Knight (N)' }
      ];

      for (const c of choices) {
        const btn = document.createElement('button');
        btn.className = 'promotion-choice-btn';
        btn.innerHTML = `
          ${getPieceSvg({ type: c.type, color })}
          <span>${c.label}</span>
        `;
        btn.addEventListener('click', () => this.executePromotion(c.type));
        container.appendChild(btn);
      }

      this.openModal('promotion-modal');
    },

    openResignModal() {
      this.openModal('resign-modal');
    },

    confirmResign() {
      this.closeModal('resign-modal');
      const winner = this.pos.turn === 'w' ? 'b' : 'w';
      this.onGameOver(winner, 'Resignation');
    },

    openDrawModal() {
      this.openModal('draw-modal');
    },

    confirmDraw() {
      this.closeModal('draw-modal');
      this.onGameOver('draw', 'Mutual agreement');
    },

    handleTimeout(color) {
      const winner = color === 'w' ? 'b' : 'w';
      this.onGameOver(winner, 'Timeout (Clock expired)');
    },

    onGameOver(winner, reason) {
      this.clock?.pause();

      const summaryEl = document.getElementById('gameover-summary-text');
      const detailEl = document.getElementById('gameover-detail-text');

      if (summaryEl) {
        summaryEl.textContent = winner === 'draw' ? 'Draw!' :
                                winner === 'w' ? 'Checkmate! White wins.' : 'Checkmate! Black wins.';
      }
      if (detailEl) {
        detailEl.textContent = `Game concluded by ${reason}.`;
      }

      // Update Local Statistics
      this.stats.gamesPlayed++;
      if (winner === 'draw') {
        this.stats.draws++;
      } else if (winner === 'w') {
        this.stats.wins++;
      } else {
        this.stats.losses++;
      }
      ChessStorage.saveStats(this.stats);
      this.updateStatsUI();

      this.openModal('gameover-modal');
    },

    setGameMode(mode) {
      this.activeMode = mode;
      ChessStorage.set('gameMode', mode);
      const robotBtn = document.getElementById('btn-mode-robot');
      const manualBtn = document.getElementById('btn-mode-manual');
      const robotOpts = document.getElementById('robot-controls-group');
      const manualOpts = document.getElementById('manual-info-group');

      if (mode === 'vs-computer') {
        robotBtn?.classList.add('active');
        robotBtn?.setAttribute('aria-checked', 'true');
        manualBtn?.classList.remove('active');
        manualBtn?.setAttribute('aria-checked', 'false');
        if (robotOpts) robotOpts.style.display = 'flex';
        if (manualOpts) manualOpts.style.display = 'none';
        this.showToast('Mode: 🤖 Robot AI Active');
      } else if (mode === 'local-2p') {
        manualBtn?.classList.add('active');
        manualBtn?.setAttribute('aria-checked', 'true');
        robotBtn?.classList.remove('active');
        robotBtn?.setAttribute('aria-checked', 'false');
        if (robotOpts) robotOpts.style.display = 'none';
        if (manualOpts) manualOpts.style.display = 'flex';
        this.showToast('Mode: 👥 Manual (2-Player) Active');
      }

      this.render();
      this.startNewGame();
    },

    setRobotDifficulty(level) {
      this.aiDifficulty = parseInt(level, 10) || 3;
      ChessStorage.set('aiDifficulty', this.aiDifficulty);
      const diffSelect = document.getElementById('select-robot-difficulty');
      if (diffSelect) diffSelect.value = this.aiDifficulty.toString();
      this.showToast(`Robot Level set to ${this.aiDifficulty}`);
      this.render();
    },

    setUserColor(color) {
      this.userColor = color;
      ChessStorage.set('userColor', color);
      const btnWhite = document.getElementById('btn-choose-white');
      const btnBlack = document.getElementById('btn-choose-black');

      if (color === 'white') {
        btnWhite?.classList.add('active');
        btnBlack?.classList.remove('active');
        if (this.boardFlipped) this.flipBoard();
      } else {
        btnBlack?.classList.add('active');
        btnWhite?.classList.remove('active');
        if (!this.boardFlipped) this.flipBoard();
      }

      this.showToast(`Side: Playing as ${color === 'white' ? 'White' : 'Black'}`);
      this.startNewGame();
    },

    startNewGame() {
      this.pos = ChessEngine.createGame();
      this.initClock();
      this.selectedSq = null;
      this.legalMovesForSelected = [];
      this.inspectingHistoryIndex = null;
      this.render();
      this.updateOpeningCard();
      this.updatePositionTips();
      this.showToast('New game initiated');

      // If playing as Black against Robot, Robot moves first as White
      if (this.activeMode === 'vs-computer' && this.userColor === 'black' && this.pos.turn === 'w') {
        this.triggerAiMove();
      }
    },

    // FEN / PGN Modal
    openExportImportModal() {
      const fenInput = document.getElementById('fen-io-input');
      const pgnInput = document.getElementById('pgn-io-input');

      if (fenInput) fenInput.value = ChessEngine.getFen(this.pos);
      if (pgnInput) pgnInput.value = ChessEngine.exportPgn(this.pos);

      this.openModal('export-import-modal');
    },

    copyFen() {
      const fenInput = document.getElementById('fen-io-input');
      if (fenInput) {
        navigator.clipboard?.writeText(fenInput.value);
        this.showToast('FEN copied to clipboard!');
      }
    },

    loadFenFromInput() {
      const fenInput = document.getElementById('fen-io-input');
      if (!fenInput) return;
      const fen = fenInput.value.trim();
      try {
        const parsed = ChessEngine.parseFen(fen);
        if (parsed.valid) {
          this.pos = ChessEngine.createGame(fen);
          this.initClock();
          this.render();
          this.updateOpeningCard();
          this.updatePositionTips();
          this.closeModal('export-import-modal');
          this.showToast('Custom position successfully loaded!');
        } else {
          this.showToast(`Error: ${parsed.error}`);
        }
      } catch (err) {
        this.showToast(`Invalid FEN: ${err.message}`);
      }
    },

    copyPgn() {
      const pgnInput = document.getElementById('pgn-io-input');
      if (pgnInput) {
        navigator.clipboard?.writeText(pgnInput.value);
        this.showToast('PGN copied to clipboard!');
      }
    },

    loadPgnFromInput() {
      const pgnInput = document.getElementById('pgn-io-input');
      if (!pgnInput) return;
      const text = pgnInput.value;

      try {
        // Strip comments and headers, extract SAN tokens
        const body = text.replace(/\[.*?\]/g, '').replace(/\{.*?\}/g, '');
        const tokens = body.split(/\s+/).filter(t => t && !t.includes('.') && !['1-0', '0-1', '1/2-1/2', '*'].includes(t));

        const testGame = ChessEngine.createGame();
        for (const tok of tokens) {
          const res = ChessEngine.makeMove(testGame, tok);
          if (!res.success) {
            throw new Error(`Could not parse move: ${tok}`);
          }
        }

        this.pos = testGame;
        this.initClock();
        this.render();
        this.updateOpeningCard();
        this.updatePositionTips();
        this.closeModal('export-import-modal');
        this.showToast(`Loaded ${tokens.length} moves from PGN!`);
      } catch (err) {
        this.showToast(`PGN Load Error: ${err.message}`);
      }
    },

    // Settings Modal
    openSettingsModal() {
      const nameInput = document.getElementById('setting-player-name');
      const modeSelect = document.getElementById('setting-game-mode');
      const diffSelect = document.getElementById('setting-ai-difficulty');
      const timeSelect = document.getElementById('setting-time-control');
      const themeSelect = document.getElementById('setting-board-theme');
      const soundCheck = document.getElementById('setting-sound-enabled');

      if (nameInput) nameInput.value = ChessStorage.get('playerName', 'Grandmaster');
      if (modeSelect) modeSelect.value = this.activeMode;
      if (diffSelect) diffSelect.value = this.aiDifficulty.toString();
      if (timeSelect) timeSelect.value = this.timeControl;
      if (themeSelect) themeSelect.value = document.body.dataset.boardTheme || 'cyber-neon';
      if (soundCheck) soundCheck.checked = ChessSound.enabled;

      this.openModal('settings-modal');
    },

    closeSettingsModal() {
      this.closeModal('settings-modal');
    },

    saveSettings() {
      const name = document.getElementById('setting-player-name')?.value || 'Grandmaster';
      const mode = document.getElementById('setting-game-mode')?.value || 'local-2p';
      const diff = parseInt(document.getElementById('setting-ai-difficulty')?.value || '3', 10);
      const tc = document.getElementById('setting-time-control')?.value || '10|0';
      const theme = document.getElementById('setting-board-theme')?.value || 'cyber-neon';
      const sound = !!document.getElementById('setting-sound-enabled')?.checked;

      ChessStorage.set('playerName', name);
      ChessStorage.set('boardTheme', theme);
      ChessStorage.set('gameMode', mode);
      ChessStorage.set('aiDifficulty', diff);
      ChessSound.enabled = sound;

      this.activeMode = mode;
      this.aiDifficulty = diff;
      this.timeControl = tc;

      document.body.dataset.boardTheme = theme;
      document.getElementById('user-name-badge').textContent = name;
      document.getElementById('bottom-name').textContent = name;

      // Sync Quick Play Mode Bar controls
      const robotBtn = document.getElementById('btn-mode-robot');
      const manualBtn = document.getElementById('btn-mode-manual');
      const robotOpts = document.getElementById('robot-controls-group');
      const manualOpts = document.getElementById('manual-info-group');
      const diffSelect = document.getElementById('select-robot-difficulty');

      if (mode === 'vs-computer') {
        robotBtn?.classList.add('active');
        robotBtn?.setAttribute('aria-checked', 'true');
        manualBtn?.classList.remove('active');
        manualBtn?.setAttribute('aria-checked', 'false');
        if (robotOpts) robotOpts.style.display = 'flex';
        if (manualOpts) manualOpts.style.display = 'none';
      } else if (mode === 'local-2p') {
        manualBtn?.classList.add('active');
        manualBtn?.setAttribute('aria-checked', 'true');
        robotBtn?.classList.remove('active');
        robotBtn?.setAttribute('aria-checked', 'false');
        if (robotOpts) robotOpts.style.display = 'none';
        if (manualOpts) manualOpts.style.display = 'flex';
      }

      if (diffSelect) diffSelect.value = this.aiDifficulty.toString();

      this.initClock();
      this.render();
      this.closeSettingsModal();
      this.showToast('Preferences updated and saved!');
    },

    loadSettings() {
      const name = ChessStorage.get('playerName', 'Grandmaster');
      const theme = ChessStorage.get('boardTheme', 'cyber-neon');
      const mode = ChessStorage.get('gameMode', 'vs-computer');
      const diff = ChessStorage.get('aiDifficulty', 3);
      const color = ChessStorage.get('userColor', 'white');

      this.activeMode = mode;
      this.aiDifficulty = parseInt(diff, 10) || 3;
      this.userColor = color;
      document.body.dataset.boardTheme = theme;

      const userBadge = document.getElementById('user-name-badge');
      const botName = document.getElementById('bottom-name');
      if (userBadge) userBadge.textContent = name;
      if (botName) botName.textContent = name;

      // Sync Quick Play Mode Bar controls
      const robotBtn = document.getElementById('btn-mode-robot');
      const manualBtn = document.getElementById('btn-mode-manual');
      const robotOpts = document.getElementById('robot-controls-group');
      const manualOpts = document.getElementById('manual-info-group');
      const diffSelect = document.getElementById('select-robot-difficulty');
      const btnWhite = document.getElementById('btn-choose-white');
      const btnBlack = document.getElementById('btn-choose-black');

      if (mode === 'vs-computer') {
        robotBtn?.classList.add('active');
        robotBtn?.setAttribute('aria-checked', 'true');
        manualBtn?.classList.remove('active');
        manualBtn?.setAttribute('aria-checked', 'false');
        if (robotOpts) robotOpts.style.display = 'flex';
        if (manualOpts) manualOpts.style.display = 'none';
      } else {
        manualBtn?.classList.add('active');
        manualBtn?.setAttribute('aria-checked', 'true');
        robotBtn?.classList.remove('active');
        robotBtn?.setAttribute('aria-checked', 'false');
        if (robotOpts) robotOpts.style.display = 'none';
        if (manualOpts) manualOpts.style.display = 'flex';
      }

      if (diffSelect) diffSelect.value = this.aiDifficulty.toString();

      if (this.userColor === 'white') {
        btnWhite?.classList.add('active');
        btnBlack?.classList.remove('active');
        this.boardFlipped = false;
      } else {
        btnBlack?.classList.add('active');
        btnWhite?.classList.remove('active');
        this.boardFlipped = true;
      }
    },

    cycleTheme() {
      const themes = ['cyber-neon', 'cosmic-violet', 'classic-walnut', 'emerald-glass'];
      const current = document.body.dataset.boardTheme || 'cyber-neon';
      const next = themes[(themes.indexOf(current) + 1) % themes.length];
      document.body.dataset.boardTheme = next;
      ChessStorage.set('boardTheme', next);
      this.showToast(`Board Theme: ${next.replace('-', ' ').toUpperCase()}`);
    },

    toggleSound() {
      ChessSound.enabled = !ChessSound.enabled;
      const icon = document.getElementById('sound-icon');
      if (icon) icon.textContent = ChessSound.enabled ? '🔊' : '🔇';
      this.showToast(ChessSound.enabled ? 'Audio Unmuted' : 'Audio Muted');
    },

    // Puzzles Runner
    loadPuzzle(index) {
      this.currentPuzzleIndex = index % ChessPuzzles.length;
      const puzzle = ChessPuzzles[this.currentPuzzleIndex];
      this.pos = ChessEngine.createGame(puzzle.fen);
      this.initClock();
      this.render();

      const badgeEl = document.getElementById('puzzle-badge');
      const ratingEl = document.getElementById('puzzle-rating');
      const promptEl = document.getElementById('puzzle-prompt');
      const feedbackEl = document.getElementById('puzzle-feedback');

      if (badgeEl) badgeEl.textContent = `PUZZLE #${puzzle.id}`;
      if (ratingEl) ratingEl.textContent = `Rating: ${puzzle.rating}`;
      if (promptEl) promptEl.textContent = puzzle.prompt;
      if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'puzzle-feedback';
      }
    },

    nextPuzzle() {
      this.loadPuzzle(this.currentPuzzleIndex + 1);
    },

    showPuzzleHint() {
      const puzzle = ChessPuzzles[this.currentPuzzleIndex];
      if (puzzle.solution && puzzle.solution.length > 0) {
        this.showToast(`Puzzle Key Move: ${puzzle.solution[0]}`);
      }
    },

    // Lessons Runner
    loadLesson(index) {
      const lesson = ChessLearnLessons[index % ChessLearnLessons.length];
      this.currentLessonStep = 0;
      this.pos = ChessEngine.createGame();
      this.render();

      const titleEl = document.getElementById('lesson-title');
      const ecoEl = document.getElementById('lesson-eco');
      const expEl = document.getElementById('lesson-explanation');

      if (titleEl) titleEl.textContent = lesson.title;
      if (ecoEl) ecoEl.textContent = lesson.eco;
      if (expEl) expEl.textContent = lesson.steps[0].note;
    },

    nextLessonStep() {
      const lesson = ChessLearnLessons[0];
      if (this.currentLessonStep < lesson.steps.length) {
        const step = lesson.steps[this.currentLessonStep];
        ChessEngine.makeMove(this.pos, step.move);
        this.currentLessonStep++;
        this.render();

        const expEl = document.getElementById('lesson-explanation');
        if (expEl) {
          expEl.textContent = this.currentLessonStep < lesson.steps.length
            ? lesson.steps[this.currentLessonStep].note
            : 'Lesson complete! Practice these key ideas in your games.';
        }
      }
    },

    prevLessonStep() {
      if (this.currentLessonStep > 0) {
        ChessEngine.undoMove(this.pos);
        this.currentLessonStep--;
        this.render();
        const lesson = ChessLearnLessons[0];
        const expEl = document.getElementById('lesson-explanation');
        if (expEl) expEl.textContent = lesson.steps[this.currentLessonStep].note;
      }
    },

    resetLesson() {
      this.loadLesson(0);
    },

    // Statistics UI
    updateStatsUI() {
      const playedEl = document.getElementById('stat-games-played');
      const winRateEl = document.getElementById('stat-win-rate');
      const winsEl = document.getElementById('stat-wins');
      const lossesEl = document.getElementById('stat-losses');
      const drawsEl = document.getElementById('stat-draws');

      if (playedEl) playedEl.textContent = this.stats.gamesPlayed.toString();
      if (winsEl) winsEl.textContent = this.stats.wins.toString();
      if (lossesEl) lossesEl.textContent = this.stats.losses.toString();
      if (drawsEl) drawsEl.textContent = this.stats.draws.toString();

      const rate = this.stats.gamesPlayed > 0
        ? Math.round((this.stats.wins / this.stats.gamesPlayed) * 100)
        : 0;
      if (winRateEl) winRateEl.textContent = `${rate}%`;
    },

    resetStats() {
      this.stats = { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, totalDurationSeconds: 0 };
      ChessStorage.saveStats(this.stats);
      this.updateStatsUI();
      this.showToast('Statistics reset to zero.');
    },

    showToast(message, duration = 3000) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;

      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  // Expose public API to window for testing suites and modular access
  window.ChessPieceSVG = ChessPieceSVG;
  window.ChessEngine = ChessEngine;
  window.ChessAI = ChessAI;
  window.ChessOpenings = ChessOpenings;
  window.identifyOpening = identifyOpening;
  window.ChessPuzzles = ChessPuzzles;
  window.ChessSound = ChessSound;
  window.ChessClock = ChessClock;
  window.ChessStorage = ChessStorage;
  window.ChessApp = ChessApp;

  // Initialize application on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ChessApp.init());
  } else {
    ChessApp.init();
  }

})(window, document);
