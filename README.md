RODA v0.1.26 — upload guide

Upload every GREEN-tagged file INSIDE this folder to the root of Haphfles/roda, replacing the same filenames. Do not upload the enclosing folder. Tags include cumulative changes since v0.1.11, including two-phone multiplayer. No character models need re-uploading.

Wait for GitHub Pages deployment, then hard-refresh the game and reopen phone controller links from fresh QR codes.

WHAT CHANGED
- CPU closes distance, follows moving opponents, mixes available kicks and reacts to attacks with dodges. It observes each character's move permissions and energy. Two-player mode still has no AI.
- Admin > sign in > Character measurements: select a fighter, enter height in cm and weight in kg, preview, then Save measurements for everyone. For a new fighter, submit the model first, set measurements while pending, then approve it. Published measurements reach players on reload.
- Height uniformly scales the actual model and changes reach. Feet remain grounded. Weight affects impact, not body width. Defaults: 175 cm / 75 kg; allowed height 120–220 cm and weight 35–160 kg. The Quilombo scene retains its existing 1.3 visual scale.
- The player-editable Size credit stat is removed. Previously allocated size points are released into the same 12-credit budget. Speed, power, defense and per-golpe allocations remain editable.
- Damage = base damage × power credits × bounded square-root weight factor × bounded attack-speed factor × target defense. Default 75 kg and balanced speed/power preserve base damage. Attack speed still changes animation timing.
- Hits dealing at least 18 damage produce a short fading screen shake. Reduced-motion preferences disable shake. Paired phones receive an impact pulse (stronger for the receiving fighter); vibration only works in supported browsers/devices and may be blocked by device settings. No vibration hardware was tested.

SUPABASE
Run Game/Supabase/07-character-physique.sql once in the SQL Editor if not already applied. Do NOT upload SQL files to GitHub. The measurement table was confirmed accessible and anonymous writes were denied during verification. Measurements are stored separately from owner-editable settings; the save function requires the existing admin role. Existing character-owner sign-ins cannot save these measurements.

VERIFICATION
20 automated test suites passed, including pursuit/variety/dodge, move restrictions, two-player isolation, weight/speed damage, real Master_1 mesh heights at 120/175/220 cm with grounded feet, and safe vibration fallback. 61 packaged modules passed syntax/import checks. Browser startup and a complete CPU match finished without JavaScript errors; measurement fields were hidden before admin sign-in. Authenticated admin save and physical phone vibration still need device/account testing.
