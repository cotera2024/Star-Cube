# Torrents — Turrets & Valkyrie for HTML5 Canvas games


---

<p align="center">
  Developed by <strong>Isaac Daniel Cotera</strong> (2026)<br>
  <a href="https://cotera.itch.io" target="_blank">Itch.io Profile</a> | 
  <a href="https://github.com/cotera2024" target="_blank">GitHub Profile</a>
</p>

---

Drop-in modules for any `<canvas>` game. Each entity (the turrets and the boss)
lives in its own self-contained file that brings its own bullets, effects,
animations and sounds.

> The interactive demo lives at the project root (`index.html`, `demo.js`, `src/`,
> `sounds/`) and doubles as a usage example — works on GitHub Pages at the root URL.
> The entities have no dependencies: import them straight from `src/`.

## Available entities

| Module | Exported class | What it is |
|---|---|---|
| `src/assault_sentinel.js` | `AssaultSentinel` | Rotating turret |
| `src/igneous_torrent.js` | `IgneousTorrent` | Fireball turret |
| `src/wall_turret.js` | `WallTurret` | Simple wall turret |
| `src/valkyrie.js` | `Valkyrie` | A 3-phase boss (standard / tornado / nuclear) |

Each entity is imported from its own file.

# Minimal usage (3 steps)

```js
import { AssaultSentinel } from './src/assault_sentinel.js';

// 1) Your player (in the demo the mouse acts as the player)
const player = { x: 400, y: 300, width: 30, height: 30, takeDamage: (a, t) => {} };

// 2) Services the entity needs (all optional)
const services = {
    getPlayer: () => player,
    playSound: (name, volume) => { /* your audio system */ },
    createExplosion: (x, y, r, d) => {},
    applyShake: (intensity) => {},
    processGlobalDamage: (entity, amount, type) => { entity.hp -= amount; },
};

// 3) Create and use the entity in your loop
const turret = new AssaultSentinel(200, 250, services);

function loop() {
    turret.update(canvas.width, canvas.height);
    turret.draw(ctx);
    requestAnimationFrame(loop);
}
loop();
```

See the full example in `examples/basic.html`.

# They all follow the same mold

The three turrets and the boss share the exact same structure and the same public
API, so once you know how to use one you know how to use them all — think of it
as a single template.

- `new Entidad(x, y, services)` → creates the entity
- `.update(width, height)` → per-frame logic
- `.draw(ctx)` → drawing, including the entity's own bullets and effects

Every module is 100% self-contained: it doesn't import another file, keeps no
shared state, and doesn't need any other entity to work. Use them solo, together,
in whatever order you want.

> Tip: the sound names each entity asks for (`'shoot.wav'`, `'fireball.ogg'`,
> `'boss_explosion.ogg'`, etc.) are up to you. Each module just tells you a name
> and a volume — your `playSound` does the rest.

# Running the demo

The demo lives at the **root** of the project, so it works directly at the GitHub
Pages home URL (and at the repo root on a local server).

**Live (GitHub Pages):** `https://cotera2024.github.io/Turrets-High-Tech/`

**Locally:** ES Modules need an HTTP server (they won't run over `file://`), so
double-clicking won't cut it. Fire up a server with python:

```bash
python3 -m http.server 8000
```

Works on Windows PowerShell too.

Then open:
- Full demo → `http://localhost:8000/`
- Minimal example → `http://localhost:8000/examples/basic.html`

Or just use the VS Code live-server.

## Structure

```
├── src/          → reusable modules (drop into any of your projects)
├── index.html    → the interactive demo (runs on GitHub Pages at the root)
├── demo.js       → demo runner (imports from ./src)
├── sounds/       → demo audio
├── examples/     → integration example
└── package.json
```

## Global script support

No bundler? Load them as `<script type="module">` and use
`window.AssaultSentinel`, `window.IgneousTorrent`, `window.WallTurret`,
`window.Valkyrie`.

## License

MIT — use, modify, and redistribute freely.

https://github.com/cotera2024
https://cotera.itch.io

© 2026 Isaac Daniel Cotera
