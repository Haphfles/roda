# RODA v0.1.31

Full-screen fighter selection with bottom-centered controls. Click a visible fighter or choose a name in the dropdown. The selected fighter stands at the front, without a raised platform or idle bobbing. Shared models load on demand, with loading/retry feedback.

Includes the optimized assets, Studio, and two-phone controls from v0.1.30.

Upload the green-tagged files in this folder to the root of Haphfles/roda, replacing matching names. Include all five optimized GLB files. Do not upload the parent Game folder or the testing/source folders. For a clean repository, upload all contents of this release folder, including .nojekyll.

Changes: one main game renderer shared by selection and gameplay; no 3D thumbnail renderer; smaller 1024px release textures and 512px mobile GPU textures; texture-only material donors; lighter mobile shadows and resolution; no unused default crowd clones. Original assets remain unchanged outside this release.

Shared characters are downloaded when selected, rather than blocking startup. Loaded fighters are reused around the roda. Select a cloud fighter using the fighter dropdown, Studio fighter buttons, or opponent picker.

Two phones: select “Two players · two phones”. Pair phone one through “Player 1 phone” and phone two through “Player 2 phone”, using their different QR codes. Close the pairing panels, then start. Keep both controller pages visible. Attacks and hit feedback now use acknowledgements/retries; joystick updates have independent sequencing.

Use Test vibration on the controller. Vibration depends on browser/device support and system settings. Unsupported browsers receive a visual hit flash. Real physical phones still need a hands-on check.

Validation: 21 automated test files pass; desktop and mobile-emulated Chrome startup and start/home transitions pass; both Supabase controller channels worked simultaneously with 200 input messages, 20 attacks, and 20 returned impact messages. Emulation is not a physical-phone performance measurement.

No new Supabase SQL required. Open https://haphfles.github.io/roda/ after GitHub Pages finishes deploying. Reload the game and open fresh phone pairing links.

Full-screen v0.1.31 validation: desktop and mobile-emulated startup, dropdown selection, 3D click selection, and start/home transitions passed.
