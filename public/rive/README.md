# Life HQ Rive assets

Export the signature animation from the Rive editor to this folder as:

`life-core.riv`

The runtime integration expects a state machine named **Life Core**.

Recommended inputs:

- `Readiness` — number, 0–100
- `Energy` — number, 0–10
- `Focus` — number, 0–10
- `Body` — number, 0–10
- `Mood` — number, 0–10
- `Celebrate` — trigger
- `Listen` — trigger

The controller is located at `src/rive/LifeCore.js`. It safely ignores inputs that are not present, so the animation can be developed incrementally.
