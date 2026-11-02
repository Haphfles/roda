RODA v0.1.29 — direct golpe key entry

Upload the green-tagged files INSIDE this folder to the repository root, replacing the matching files. No models need re-uploading. This includes earlier updates since v0.1.11.

Studio > select character > Edit beside a golpe > click the Key field and press/type a letter or number > Save & use.
Backspace/Delete clears the assignment. Keys are specific to each character. A key already assigned to another golpe is rejected with the movement name; clear its old assignment first. W A S D Q E P R and Space remain reserved for movement, camera, pause, restart and dodge. Ginga and Fall are automatic animation roles and do not have attack keys.

Publish character shares the saved assignments with other players. Custom keys are retained in movement exports, shared libraries, on-screen hints and phone buttons. No new Supabase SQL is needed.

Validation: 21 test suites passed. Additional checks verified letter/digit assignments survive validation, publish and shared reload, reserved keys are rejected, and all packaged module imports/syntax pass.
