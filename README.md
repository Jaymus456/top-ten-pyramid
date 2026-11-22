# Top Ten Pyramid

A party quiz game. Every round shows a category and its ten answers, shuffled, and players rank them into a 4-3-2-1 pyramid with number 1 at the top. You get a point for every answer in the right spot.

**Play:** https://jaymus456.github.io/top-ten-pyramid/ (solo, or host a game night on a TV)

## Modes

- **Solo:** pick from 173 lists in six themes (Geography, Sport, Music, History, Impossible, Film/TV & pop culture) and rank them. Works in any browser, including the GitHub Pages link above.
- **Game night (online):** one screen shows the game on the TV and players join on their phones with a 4-letter code or a QR code. Each player picks a character and a nickname. No accounts are needed.
- **Phone host:** the first player to join becomes the host (🎮). They can start the game, reveal answers, move to the next round, spin the wheel, check close answers and end the game from their phone, and they still play. If they leave, the next player to have joined takes over. The TV's own buttons keep working too.

### How online play connects

- **On GitHub Pages (or any website):** phones connect straight to the host's browser with WebRTC, using the free public [PeerJS](https://peerjs.com) service to find each other. The host's browser runs the game, so **keep the host tab open and the screen awake** for the whole game.
- **On claude.ai:** it uses claude.ai's built-in live connection instead.
- **If a phone can't join:** some strict networks (certain office or university Wi-Fi, some mobile data) block direct connections. Switching that phone to the same Wi-Fi as the TV usually fixes it.

### How a game night runs

1. **Theme vote.** At the start, players vote for one of the six themes (🌍 ⚽ 🎵 🏛️ 🧠 🎬), which is used for all **6 rounds**. A tie goes to a **blackjack** showdown between one voter from each side, and the winner picks the theme.
2. **Rank the pyramid** on your phone, with a fresh list from the theme each round: drag the stones into place, or tap a stone and then its spot. You score a point for every answer in the right spot, plus **3 bonus points for a perfect pyramid**. **Round 6 counts double.**
3. **Half-time (after round 3):** the wheel picks one of seven mini-games. Each has exactly one winner, who gets 5 points:
   Spot the Difference · 10-Second Challenge · Finish the Sentence · Guess the Song (a 5-second clip) · The Memory Test · Who Am I? (clues) · Higher or Lower
4. **Host check:** for answers the game can't judge with certainty (10-Second Challenge, Memory Test, and close guesses in Guess the Song and Who Am I), the host reviews them on the TV or their phone and can mark answers right or wrong before the winner is confirmed.
5. A podium shows the final scores. Players level on points are split by speed: the lower total lock-in time ranks higher. Nothing is saved between games: each game starts from zero.

**Dropped phones:** if a phone sleeps or loses connection, reopen the game link and it rejoins automatically with the same name, score and the stones already placed that round.

**Managing players:** under **👥 Manage players** on the TV (or **👥 Players** in the phone host's bar) you can rename or remove anyone, which also sorts out two phones using the same name.

**Sound effects:** the TV plays a click when someone locks in, a drumroll as the pyramid is revealed, and fanfares for winners, on top of the music. Turn them off with **🔊 Sound effects**.

## Background music

Tap **🎷 Play the Jazz House** on the main menu (or **Start music** on the host screen) to play the [Jazz House playlist](https://soundcloud.com/delicieuse-musique/sets/jazz-house) through SoundCloud's official embedded player, before a game even starts. It keeps playing when you open the host screen. You tap once (browsers won't start sound on their own). The music then plays quieter while people are ranking or playing a mini-game, and there are pause, next-track and volume controls. To use a different playlist, change `MUSIC_URL` in `src/online.js` and rebuild. Music works on GitHub Pages; the claude.ai version blocks embedded players.

## Daily Pyramid

Tap **📅 Daily Pyramid** on the main menu for today's six lists, one from each theme. Everyone gets the same lists on the same day, so you can compare scores, and **Share my score** copies a spoiler-free summary. Each theme's 30 lists are dealt in a fixed shuffled order, one a day, so no list repeats until the theme has gone round once. Only today's progress is kept on your device.

## Ties

- **Theme vote:** if two or more themes tie, one voter from each tied theme plays blackjack, so a three-way tie means three players at the table. Players who tie for the best hand play again until one wins and picks the theme.
- **Mini-games:** if the top players finish level, they go to **sudden death**: a number question, and the closest guess wins (fastest if equal).
- Timed mini-games end the moment someone wins: first to find the 3 differences, first with 3 right answers in the 10-Second Challenge, first to remember all 15 objects, or first correct guess in Guess the Song and Who Am I?.

At the end of a game the final screen shows the join code and QR code again, so new players can join for the next game.

## Guess the Song

The TV plays a 5-second clip from the [Top 100 most-streamed songs playlist](https://soundcloud.com/dj_antidope/sets/top-100-most-streamed-songs-on) on SoundCloud. It plays again at 25 and 50 seconds, and the host can replay it. To land on the hook, the game reads the track's SoundCloud waveform and starts the clip at the first 5-second stretch that reaches the song's loudest level, which is usually the first chorus. When someone wins, the TV plays 10 seconds of the song as the reveal. Song and artist names come from the track titles on SoundCloud, and close answers go to the host check. The clip needs the SoundCloud player, so on claude.ai (or if SoundCloud doesn't load) the mini-game uses emoji clues instead. To use another playlist, change `SONG_URL` in `src/online.js`.

## Project layout

- `index.html`: the whole game in one self-contained file. Open it or host it anywhere.
- `src/`: the parts it's built from:
  - `template.html`: page structure and styles
  - `data.js`, `data_extra.js`, `data_extra_b.js`: the lists
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
