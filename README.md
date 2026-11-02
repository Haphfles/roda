RODA v0.1.24 — upload instructions

Upload the GREEN-tagged files from the v0.1.24 folder into the ROOT of Haphfles/roda, replacing matching names. Keep the filenames. Do not create a v0.1.24 subfolder on GitHub. These green tags include cumulative changes since v0.1.11, so skipped earlier updates are covered. Existing unchanged models and tracking engine binaries do not need uploading again.

The v0.1.24 folder is also a complete standalone site if you need to upload everything. No Supabase SQL or private setup files are included. No new SQL setup is needed for the phone controller; the existing project's Realtime connection was tested successfully.

After GitHub Pages finishes deploying, reload the site.

PHONE: Click Phone controller on the computer, scan the QR with your phone camera, tap Connect on the phone, then Back to game on the computer. Start the game on the computer. Left thumb moves; right buttons show that fighter's assigned golpes. Both devices need internet. The computer game must stay visible. Disconnect phone ends the temporary pairing. A localhost/127.0.0.1 URL cannot be reached from your phone; use the published website for this test. This uses Supabase Realtime messages and its project quota. Physical phone latency has not been measured.

TRIM: Studio > choose/edit a movement > Trim animation below the timeline. Enter start/end seconds or use the playhead buttons, then Keep selected section. Undo restores the clip; Save & use applies it. At least 0.2 seconds must remain. Review attack contact timing after trimming. Whole-body travel is rebased to the origin with grounded start/end heights.

TRACKING: Video capture now defaults to Keep both feet planted. Turn that OFF for kicks, steps, jumps or cartwheels. Character credits contains a separate Flexibility slider for tracked movement range. These are animation limits, not a full physics or collision solver. They apply to newly captured movements, not existing Mixamo animations. The original captured frames are retained; constraints are evaluated for the selected character at preview/playback time.

OPPONENTS: Choose your opponent above the scenarios. All loaded, unselected fighters watch around the roda. The selected opponent uses its own move permissions and stats.

LIBRARY: Fixed the incorrect 40-movement import block across all fighters. The combined library supports 160 animation versions; publishing remains limited to 40 per character. Exact duplicates with matching character scope, credit identity and saved/draft content are combined and references repaired on load/merge. Different animations and character-specific versions are preserved. The six-movement local baseline was not deleted.

VALIDATION: 17 Node test files pass; release JavaScript syntax and local module links checked; real Master_1 foot-ground contact tested across crouches; opponent/audience preview and trim/Undo checked in-browser; two live Supabase clients exchanged a test controller message. Browser security review blocked opening the generated phone-pairing link in a second test tab, so a physical-phone test remains after upload.
