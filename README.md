# Top Ten Pyramid

A party quiz game. Every round shows a category and its ten answers, shuffled, and players rank them into a 4-3-2-1 pyramid with number 1 at the top. You get a point for every answer in the right spot.

**Play:** https://jaymus456.github.io/top-ten-pyramid/ (solo, or host a game night on a TV)

## Modes

- **Solo:** pick from 60 categories in six themes (Geography, Sport, Music, History, Impossible, Film/TV & pop culture) and rank them. Works in any browser, including the GitHub Pages link above.
- **Game night (online):** one screen hosts on the TV and players join on their phones with a 4-letter code or a QR code. Each player picks a character and a nickname. No accounts are needed.

### How online play connects

- **On GitHub Pages (or any website):** phones connect straight to the host's browser with WebRTC, using the free public [PeerJS](https://peerjs.com) service to find each other. The host's browser runs the game, so **keep the host tab open and the screen awake** for the whole game.
- **On claude.ai:** it uses claude.ai's built-in live connection instead.
- **If a phone can't join:** some strict networks (certain office or university Wi-Fi, some mobile data) block direct connections. Switching that phone to the same Wi-Fi as the TV usually fixes it.

### How a game night runs

1. **6 rounds.** Before each one, players vote between four categories. A tie goes to a **blackjack** showdown between one voter from each side, and the winner picks the category.
2. **Rank the pyramid** on your phone. You score a point for every answer in the right spot.
3. **Half-time (after round 3):** the wheel picks one of seven mini-games. Each has exactly one winner, who gets 5 points:
   Spot the Difference · 5-Second Challenge · Finish the Sentence · Guess the Song (emoji clues) · The Memory Test · Who Am I? (clues) · Higher or Lower
4. **Host check:** for answers the game can't judge with certainty (5-Second Challenge, Memory Test, and close guesses in Guess the Song and Who Am I), the host reviews them on the TV and can mark answers right or wrong before the winner is confirmed.
5. A podium shows the final scores.

## Background music

The host screen plays the [Jazz House playlist](https://soundcloud.com/delicieuse-musique/sets/jazz-house) through SoundCloud's official embedded player. The host taps **Start music** once (browsers won't start sound on their own). The music then plays quieter while people are ranking or playing a mini-game, and there are pause, next-track and volume controls. To use a different playlist, change `MUSIC_URL` in `src/online.js` and rebuild. Music works on GitHub Pages; the claude.ai version blocks embedded players.

## Project layout

- `index.html`: the whole game in one self-contained file. Open it or host it anywhere.
- `src/`: the parts it's built from:
  - `template.html`: page structure and styles
  - `data.js`: the 60 categories
  - `minigames.js`: content for the mini-games
  - `online.js`: host/player game logic
  - `peerroom.js`: PeerJS connection used outside claude.ai
  - `avatars.js` / `avatars.css`: the characters
  - `game.css`: game-night screens
  - `qrlib.js`: QR encoder
- Rebuild after editing: `cd src && python3 build.py`. This writes `../index.html`.

## Notes

- Some categories use figures that change over time (stats as of November 2026, streaming counts as of April 2026). Each category's note says how current it is.
- The QR encoder in `src/qrlib.js` is Kazuhiko Arase's QRCode for JavaScript (MIT licence), taken from the qrcode-terminal package (Apache-2.0).
