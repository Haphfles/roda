# RODA v0.1.32

Full-screen selection: the chosen player and opponent stand together at the front, facing the camera and performing their character-specific ginga. Other loaded fighters keep still poses behind them. Click a fighter or choose a name from the dropdown. Shared models load on demand.

Ginga and Fall / Knockout are automatic behaviors for every fighter. Studio lists them under Automatic animations, without optional golpe checkboxes. Choose and edit animation variants there. Missing or previously disabled role animations fall back to built-in behavior. Automatic animations are excluded from playable golpe controls. The existing movement library remains editable.

Phone controller: tap Game mode for a larger joystick and golpe buttons, with only a small Exit game mode button during play. Connection, vibration-test and other utility buttons are hidden. A large Start / Resume / Restart action appears when appropriate. Native browser full screen is requested where supported; the game-mode layout also works without that API.

Includes v0.1.30 optimizations: reduced textures, texture-only material donors, one main renderer and lighter mobile graphics. Source models remain unchanged.

Upload the green-tagged files to the root of Haphfles/roda, replacing matching names. The tags include earlier pending changes and all five optimized GLBs. No deletion or new Supabase SQL required. Reload the game and use fresh phone pairing links after deployment.

Validation: 22 automated test files; desktop/mobile-emulated startup, click/dropdown selection, animated front pair, automatic-role UI, start/home transitions, and controller game-mode layout/exit. Controller screenshot uses a UI fixture; native phone fullscreen and vibration still require a physical-device check.
