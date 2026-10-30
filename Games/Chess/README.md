Build a Professional Chess Game – Human vs Advanced AI

Create a fully functional, modern chess game using HTML, CSS, and JavaScript.

The game should allow a human player to play against a powerful computer opponent with advanced chess intelligence. The computer should play strategically and be significantly stronger than an average beginner.

1. Game Concept
Human Player vs Computer AI.
The computer should play at a high chess skill level.
The computer should analyze positions before making moves.
It should understand tactics, checkmate patterns, positional advantages, captures, openings, and endgames.
Use Stockfish.js (preferably its WebAssembly version) as the chess engine.
Include multiple difficulty levels, including a very strong maximum difficulty.
2. Automatic Color Switching (IMPORTANT)

Implement automatic color switching whenever a new game starts.

The behavior must be:

First game: Human plays White, computer plays Black.
Second game: Human plays Black, computer plays White.
Third game: Human plays White, computer plays Black.
Continue alternating indefinitely.

This switching must also happen when the user clicks Restart.

For example:

If the current game has the human playing White and the user clicks Restart, start a fresh game with the human playing Black.
If the human is playing Black and clicks Restart, start a fresh game with the human playing White.

The computer must automatically make the first move whenever it is White.

Display clearly which color the human and computer are playing.

3. Chess Rules and Mechanics

Implement complete, standard chess rules:

All six chess pieces must move according to official chess rules.
Legal move validation.
Check and checkmate detection.
Stalemate detection.
Castling on both sides.
En passant.
Pawn promotion with a choice of Queen, Rook, Bishop, or Knight.
Draw detection.
Threefold repetition.
Fifty-move rule.
Insufficient material detection.

Use a reliable chess rules library such as chess.js rather than implementing incomplete movement rules manually.

4. Advanced Computer AI

The AI should:

Use Stockfish.js for powerful chess calculations.
Evaluate possible moves before playing.
Avoid obvious blunders.
Recognize checkmate opportunities.
Protect valuable pieces.
Understand piece exchanges.
Develop pieces intelligently.
Control the center.
Plan attacks and defenses.
Think several moves ahead.
Respond automatically after the human makes a legal move.

Provide difficulty options:

Easy
Medium
Hard
Expert
Grandmaster

The highest difficulty should use the strongest available Stockfish settings.

5. Chessboard Design

Create a beautiful, professional chess interface.

Requirements:

8×8 chessboard.
Classic alternating light and dark squares.
Beautiful, recognizable chess piece designs.
Smooth piece movement animations.
Highlight the selected piece.
Highlight all legal moves.
Highlight the last move.
Highlight the king when in check.
Support both mouse clicks and drag-and-drop.
Responsive layout for desktop, tablet, and mobile.

The board must automatically orient itself according to the human player's color:

Human White: White pieces at the bottom.
Human Black: Black pieces at the bottom.
6. Game Controls

Add the following controls:

New Game: Start a completely fresh game and alternate the human's color.
Restart: Reset the current game and ALSO alternate the human's color.
Undo: Take back the previous move. In human-vs-computer mode, undo both the computer's and human's last moves where possible.
Hint: Show a recommended move.
Flip Board: Manually rotate the board.
Resign: Allow the human to resign.
Difficulty: Change computer strength.
Sound: Toggle move and game sounds.

Ask for confirmation before resigning or starting a new game if a game is already in progress.

7. Game Information Panel

Display:

Human player color.
Computer player color.
Whose turn it is.
Current game status.
Move history in standard chess notation.
Computer thinking indicator.
Captured pieces for both sides.
Current difficulty.

Show clear notifications for:

Check!
Checkmate!
Draw!
Stalemate!
Computer wins!
Human wins!
8. Visual Design

Use a premium, modern chess website aesthetic.

Design inspiration:

Clean and elegant interface.
Dark background with contrasting chessboard.
Gold or green accent colors.
Rounded panels.
Subtle shadows.
Smooth animations and transitions.
Professional typography.
No unnecessary visual clutter.

Make the chessboard the main focus of the interface.

9. Technical Requirements

Use:

HTML5 for structure.
CSS3 for styling and animations.
Vanilla JavaScript for application logic.
chess.js for legal chess rules.
Stockfish.js for the computer opponent.

Organize the project into:

index.html
style.css
script.js

Additional engine files or libraries can be included when necessary.

Important:

The AI must actually work, not simulate thinking with random moves.
Never allow illegal moves.
Prevent the player from moving while the computer is thinking.
Handle asynchronous Stockfish responses correctly.
Ensure the game works without a backend server.
Use a local Stockfish engine or a reliable browser-compatible version.
Make sure all buttons and controls work.
Handle errors gracefully.
10. Final Testing

Before finishing, test the following:

Human can play White against the computer.
Human can play Black against the computer.
Computer makes the first move when playing White.
New Game alternates the human's color.
Restart also alternates the human's color.
Board orientation changes automatically.
All chess rules work correctly.
AI makes genuine strategic moves.
Undo works correctly.
Promotion, castling, and en passant work.
The game works on mobile and desktop.

FINAL GOAL: Build a polished, fully playable human-versus-advanced-AI chess game. Prioritize strong computer intelligence, correct chess rules, automatic color switching on both New Game and Restart, and a beautiful user interface.

Do not leave placeholder functionality. Complete and test the entire application.