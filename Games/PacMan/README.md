Build a Complete Responsive PAC-MAN Game

Act as an expert HTML5 game developer, UI/UX designer, and JavaScript game programmer.

Create a fully playable, polished, retro-style PAC-MAN arcade game using only:

HTML5
CSS3
Vanilla JavaScript

Do not use React, Angular, or other frameworks. Keep the code clean, modular, optimized, and easy to maintain.

1. Game Design and Visual Appearance

Create a game inspired by the original classic Pac-Man arcade experience.

Black background with a classic retro arcade aesthetic.
Bright blue maze walls with glowing neon effects.
Yellow Pac-Man character with animated mouth movement.
Four colorful ghosts: Blinky (red), Pinky (pink), Inky (cyan), and Clyde (orange).
Small white/yellow collectible pellets throughout the maze.
Larger power pellets in strategic locations.
Smooth character animations and movement.
Retro arcade typography and pixel-style UI.
2. Gameplay Mechanics

Implement all essential Pac-Man gameplay features:

Pac-Man moves through a maze using directional controls.
Collect all pellets to complete a level.
Avoid ghosts to prevent losing lives.
Eating a power pellet makes ghosts vulnerable for a limited time.
Pac-Man can eat vulnerable ghosts for bonus points.
Ghosts should have basic AI to chase and intercept Pac-Man.
Add collision detection between Pac-Man, ghosts, walls, and pellets.
Include multiple levels with increasing difficulty.
Add a game-over screen and a level-completed screen.
Include a pause/resume feature.
Add a restart game button.
3. Controls

Support multiple input methods.

Desktop:

Arrow Up → Move up
Arrow Down → Move down
Arrow Left → Move left
Arrow Right → Move right

Also support WASD keys.

Mobile and Tablet:

Add a responsive on-screen directional control pad.
Provide four large touch-friendly arrow buttons.
Support touch and swipe gestures.
Prevent accidental page scrolling while playing.

The game must also support keyboard input without requiring mouse interaction.

4. Score and Cookie-Based Storage

Implement persistent score storage using browser cookies.

Store the following information:

Highest score
Current score
Total games played
Highest level reached

Requirements:

Use JavaScript document.cookie to save and retrieve game data.
Save the high score automatically whenever the player achieves a new record.
Preserve the high score after refreshing or reopening the browser.
Add an option to reset saved game statistics.
Set suitable cookie expiration dates.
Use SameSite=Lax and Secure when running over HTTPS.
Handle cases where cookies are disabled gracefully.

Do not store sensitive information in cookies.

5. Background Music and Sound Effects

Create a nostalgic arcade atmosphere.

Implement:

Retro-style looping background music inspired by the original Pac-Man arcade soundtrack.
Pellet collection sound.
Power pellet sound.
Ghost eating sound.
Death/life-lost sound.
Level completion sound.
Game-over sound.

Important:

Use original synthesized chiptune music rather than copying copyrighted original game audio.
Use Web Audio API to generate retro 8-bit music and sound effects.
Include music ON/OFF and sound ON/OFF buttons.
Allow volume adjustment.
Start audio only after the user's first interaction because of browser autoplay restrictions.
Ensure music loops seamlessly without noticeable gaps.
6. Responsive Design and Device Optimization

Make the game work perfectly on:

Desktop computers
Laptops
Android smartphones
iPhones
Tablets
Different screen orientations

Requirements:

Use CSS Flexbox and Grid where appropriate.
Use responsive units and media queries.
Dynamically resize the game canvas based on screen dimensions.
Maintain the correct maze aspect ratio.
Keep the game centered on the screen.
Ensure controls never overlap the game.
Optimize rendering using requestAnimationFrame.
Avoid unnecessary DOM updates.
Ensure smooth performance on lower-end mobile devices.
Support both portrait and landscape orientations.
7. Game Interface and HUD

Display a professional arcade-style dashboard containing:

PAC-MAN title/logo.
Current score.
High score.
Remaining lives.
Current level.
Pause button.
Restart button.
Music toggle.
Sound toggle.
Volume slider.

Include an attractive start screen with a PLAY button and a short controls guide.

8. Game Architecture and Code Quality

Organize the project into three separate files:

index.html
style.css
script.js

Use HTML Canvas for game rendering.

JavaScript requirements:

Create separate classes or modules for Pac-Man, Ghosts, Maze, AudioManager, and Game.
Use requestAnimationFrame for the game loop.
Implement efficient collision detection.
Use delta time for consistent movement across devices.
Avoid memory leaks and unnecessary event listeners.
Handle browser resizing and orientation changes.
Add comments explaining important logic.
9. User Experience

Make the game feel like a real arcade game.

Include:

Smooth movement and animations.
Flashing READY! screen before each level.
3 starting lives.
Short death animation.
Ghost frightened animation.
Score popups for eating ghosts.
Attractive transitions between screens.
Keyboard and touch controls with immediate feedback.
10. Final Testing and Delivery

Before completing the project:

Test all four directional controls.
Test ghost AI and collision detection.
Test score calculation and high-score persistence.
Test cookie storage after browser refresh.
Test sound and music toggles.
Test mobile touch controls.
Test responsive layouts at different screen sizes.
Fix all JavaScript errors.
Ensure the game works without a backend or server-side database.
Final Deliverable

Build the entire playable game, not just a visual mockup.

Generate all three files with complete working code.

The final result should be a polished, responsive, nostalgic arcade game that looks and feels like classic Pac-Man while working smoothly on desktop, tablet, and mobile devices.

Do not leave placeholder functions, unfinished features, or TODO comments. Make sure every button and gameplay feature actually works.