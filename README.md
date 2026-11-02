RODA v0.1.25 — upload guide

Upload the green-tagged files INSIDE v0.1.25 to the root of Haphfles/roda, replacing files with the same names. Do not upload the enclosing folder. The green selection includes cumulative updates since v0.1.11, so it also includes the previous phone-controller and Studio updates. No character models need uploading again for these changes.

After GitHub Pages finishes deploying, reload the game (hard refresh if needed).

Changes:
- Create a movement removed from the opening screen; creation remains in Studio.
- Rounds last up to 120 seconds; each fighter has 200 health. Golpe damage and per-character credits remain unchanged.
- Phones can start/restart and pause/resume the game.
- Game mode: Two players / two phones. Choose your fighter and Player 2 fighter. Open Player 1 phone and scan with the first phone; tap Connect. Close the pairing panel, then do the same under Player 2 phone with the other phone. Close the second panel. Tap Start game on either phone, or Enter the roda on the computer.
- Both players use the SAME computer game screen; each phone has its own joystick and character-specific golpes. Both phones and the computer need internet. Keep the game tab visible. Losing a phone connection pauses the match; reconnect and tap Pause / resume.
- For solo play, choose Solo / computer opponent and pair only Player 1 phone if desired.

Validation: all 18 automated test suites pass; 57 packaged modules pass syntax/import checks; opening UI, two-player selection, second pairing panel and 120-second solo gameplay checked in-browser. Two physical phones have not yet been tested together.

No new Supabase SQL is needed.
