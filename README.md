# RODA v0.1.19
A browser-based capoeira game. Three fighters, two scenarios, six curated movements.

Play: https://haphfles.github.io/roda/

WASD/arrows: move. J: Queixada. K: Au. U: Armada. O/Space: Esquiva.
Q/E: orbit. P: pause. R: restart. Movement hints follow your fighter.
Choose a character and scenario, then Enter the roda or Free practice.

Studio: New golpe for manual keyframes/IK, Video → move for local MediaPipe tracking, or Import Mixamo FBX. Choose a key and Save & use to activate a draft. Your library is private to this browser and device, not shared with other players. Export JSON regularly; clearing site storage removes your saved moves. Import JSON merges designs as drafts; choose bindings and Save & use again. Video tracking uses 0.2–5 second clips and may need manual corrections. The tracking engine downloads only when tracking starts.
Use GitHub Pages: Settings → Pages → Deploy from a branch → main → / (root).
For a local check: `python3 -m http.server 8766` then open http://localhost:8766/.

Assets are included for playing RODA; no blanket license to reuse character or scene assets is granted here. See CREDITS.txt for third-party code attribution.
