Promise.all([ import("./src/wall_turret.js"), import("./src/assault_sentinel.js"), import("./src/igneous_torrent.js"), import("./src/valkyrie.js") ]).then(([wall, sentinel, igneous, valkyrie]) => {
    window.WallTurret = wall.WallTurret;
    window.AssaultSentinel = sentinel.AssaultSentinel;
    window.IgneousTorrent = igneous.IgneousTorrent;
    window.Valkyrie = valkyrie.Valkyrie;
    window.dispatchEvent(new CustomEvent("wallTurretReady", {
        detail: {
            WallTurret: wall.WallTurret,
            AssaultSentinel: sentinel.AssaultSentinel,
            IgneousTorrent: igneous.IgneousTorrent,
            Valkyrie: valkyrie.Valkyrie
        }
    }));
}).catch(e => console.warn("Turret modules not loaded:", e));
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
