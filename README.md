# Top Ten Pyramid

A party quiz game. Every round shows a category and its ten answers, shuffled, and players rank them into a 4-3-2-1 pyramid with number 1 at the top. You get a point for every answer in the right spot.

**Play solo:** https://jaymus456.github.io/top-ten-pyramid/

## Modes

- **Solo:** pick from 60 categories in six themes (Geography, Sport, Music, History, Impossible, Film/TV & pop culture) and rank them. Works in any browser, including the GitHub Pages link above.
- **Game night (online):** one screen hosts on the TV and players join on their phones with a 4-letter code or a QR code. Each player picks a character and a nickname. Online play only works on the claude.ai version, because it uses claude.ai's live connection between devices. When the page is opened anywhere else it shows a message and solo still works.

### How a game night runs

1. **6 rounds.** Before each one, players vote between four categories. A tie goes to a **blackjack** showdown between one voter from each side, and the winner picks the category.
2. **Rank the pyramid** on your phone. You score a point for every answer in the right spot.
3. **Half-time (after round 3):** the wheel picks one of seven mini-games. Each has exactly one winner, who gets 5 points:
   Spot the Difference · 5-Second Challenge · Finish the Sentence · Guess the Song (emoji clues) · The Memory Test · Who Am I? (clues) · Higher or Lower
4. **Host check:** for answers the game can't judge with certainty (5-Second Challenge, Memory Test, and close guesses in Guess the Song and Who Am I), the host reviews them on the TV and can mark answers right or wrong before the winner is confirmed.
5. A podium shows the final scores.

## Project layout

- `index.html`: the whole game in one self-contained file. Open it or host it anywhere.
- `src/`: the parts it's built from:
  - `template.html`: page structure and styles
  - `data.js`: the 60 categories
  - `minigames.js`: content for the mini-games
  - `online.js`: host/player game logic
  - `avatars.js` / `avatars.css`: the characters
  - `game.css`: game-night screens
  - `qrlib.js`: QR encoder
- Rebuild after editing: `cd src && python3 build.py`. This writes `../index.html`.

## Notes

- Some categories use figures that change over time (stats as of November 2026, streaming counts as of April 2026). Each category's note says how current it is.
- The QR encoder in `src/qrlib.js` is Kazuhiko Arase's QRCode for JavaScript (MIT licence), taken from the qrcode-terminal package (Apache-2.0).
