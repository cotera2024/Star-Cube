# 🌟 StarCube — Plataformas 2D en Vanilla JavaScript

![StarCube Cover](galeria/screenshot_1.webp)

> **Autor**: Isaac Daniel Cotera  
> **Año**: 2026  
> **Licencia**: © 2026 Isaac Daniel Cotera. Todos los derechos reservados.  
> **Tecnología**: 100% Vanilla JavaScript + HTML5 Canvas 2D (Sin frameworks, sin bundlers, sin dependencias pesadas).

---

## 🎮 Descripción del Juego

**StarCube** es un videojuego de acción y plataformas en 2D de precisión, construido puramente sobre la API de **Canvas 2D** y **Web Audio API**. El jugador controla a **Peggy**, un intrépido cubo rosa con habilidades acrobáticas avanzadas (salto variable, dash de energía y disparo cargado) que debe superar 7 mundos desafiantes, salvar a sus compañeros aprisionados y derrotar a formidables jefes.

---

## ✨ Características Principales

- **7 Mundos Únicos**:
  - 🌸 **Mundo 1: Pradera y Caverna Subterránea** (Jefe: *Ice Cube*).
  - ⚡ **Mundo 2: Cyber Grid / Red Neón** (Jefe: *Cyber Hacker / MawlerKnight* con inversión de controles).
  - 🌋 **Mundo 3: Volcán Ardiente** (Jefe: *Centinela Valkyrie*).
  - 🌊 **Mundo 4: Mar Tempestuoso y Fosa Abisal** (Barca con físicas de oleaje, rayos laterales y Jefe: *Krakatoa Kraken*).
  - 💀 **Mundo 5: Hub Central y Mazmorras Ocultas**.
  - 🎃 **Mundo 7: Noche de Halloween** (Niebla procedural, linterna interactiva, almas errantes y persecución de la *Gran Calabaza*).
- **Mecánicas Avanzadas**:
  - Disparo cargado por niveles (1 al 4) y *Rayo Supremo*.
  - Dash aéreo y terrestre con cooldown e invulnerabilidad temporal.
  - Sistema de compañeros rescatables (*Lithium*, *Peggy Rosa*, etc.).
  - Físicas adaptables de viento, flotación, trampolines y superficies resbaladizas.
- **Audio Procedural y BGM Dinámico**:
  - Sintetizador procedural integrado mediante **Web Audio API** para efectos sonoros de latencia cero.
  - Banda sonora ambiental e interactiva que cambia según el estado y eventos del nivel.
- **Soporte Multi-Idioma (i18n)**:
  - 5 idiomas completos: Español, Inglés, Japonés, Ruso y Chino.
  - Auto-detección del idioma del sistema/navegador.
- **Control Universal**:
  - ⌨️ Teclado completo (WASD, Flechas, Espacio, Z, X, C, P).
  - 📱 Pantalla táctil adaptativa (D-pad virtual, botones de acción y respuesta háptica con vibración).
  - 🎮 Soporte nativo para Gamepads (Xbox, PlayStation, genéricos) con efecto **Rumble / Vibración**.
- **100% Offline y Autónomo**:
  - Fuentes tipográficas locales (*Fredoka One* y *Courier Prime*).
  - Sin dependencias de CDNs externas ni librerías pesadas en tiempo de ejecución.

---

## 🕹️ Controles

| Acción | Teclado | Gamepad | Pantalla Táctil |
|---|---|---|---|
| **Moverse** | `A` / `D` o `←` / `→` | D-Pad / Stick Izquierdo | Botones `◀` / `▶` |
| **Saltar** | `Espacio` / `W` / `Z` | Botón Sur (`A` / `✕`) | Botón `SALTAR` |
| **Disparo / Cargar** | Mantener `X` o `K` | Botón Oeste (`X` / `▢`) | Botón `ATACAR` |
| **Dash** | `C` | Gatillos / R1 / L1 | Botón `DASH` |
| **Interactuar / Entrar** | `E` / `W` (frente a puerta) | D-Pad Arriba | Botón `ENTRAR` |
| **Pausar** | `P` / `Escape` | `Start` / `Options` | Botón `⏸` |

---

## ⚡ Códigos Secretos (Cheats)

Teclea las siguientes palabras en cualquier momento durante la partida:
- `godmode` / `goodmode`: Activa/desactiva la invulnerabilidad total.
- `rayosupremo`: Desata inmediatamente la descarga de energía máxima.

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

No se requiere ningún paso de compilación (`npm install`, `build`, etc.). Todo corre de manera nativa en el navegador:

1. **Clonar o descargar el repositorio**:
   ```bash
   git clone https://github.com/TU_USUARIO/starcube.git
   cd starcube
   ```

2. **Iniciar un servidor web local**:
   - Con Python:
     ```bash
     python3 -m http.server 8000
     ```
   - O con Node.js (`npx serve` / Live Server en VS Code):
     ```bash
     npx serve .
     ```

3. **Abrir en el navegador**:
   Visita `http://localhost:8000` y ¡a jugar!

---

## 📁 Estructura del Código

```
starcube/
├── assets/
│   ├── audio/           # Pistas BGM y SFX optimizadas (mp3)
│   ├── fonts/           # Fuentes locales Fredoka One y Courier Prime
│   ├── lang/            # Archivos de localización (es, en, ja, ru, zh)
│   └── sprites/         # Sprites e ilustraciones
├── css/
│   └── plataformer.css  # Estilos responsivos, animaciones y fuentes @font-face
├── favicon/             # Favicons y manifiesto de aplicación
├── galeria/             # Capturas de pantalla y material promocional
├── js/
│   ├── audio.js         # Sintetizador procedural y gestor de audio HTML5
│   ├── backgrounds.js   # Fondos con parallax multinivel
│   ├── boat.js          # Físicas de navegación en barca (Mundo 4)
│   ├── boss1.js a 5.js  # Lógica de cada uno de los jefes
│   ├── companion.js     # Lógica y jaula de Lithium
│   ├── config.js        # Constantes físicas, resolución virtual y utilidades
│   ├── entities.js      # Jugador, enemigos, trampas, resortes y coleccionables
│   ├── gamepad.js       # Gamepad API + soporte de vibración
│   ├── gsap.min.js      # Animaciones fluidas de UI locales
│   ├── i18n.js          # Motor de traducción dinámico
│   ├── levels.js        # Geometría, plataformas y checkpoints de los 7 mundos
│   ├── modales.js       # Modales de victoria, derrota, mapa del mundo y selección
│   ├── plataformer.js   # Bucle principal de físicas, colisiones AABB y cámara
│   ├── render.js        # Dibujo detallado de Peggy (squash & stretch, ojos, expresiones)
│   ├── storm.js         # Rayos y viento lateral del Mundo 4
│   └── touch.js         # Controles táctiles virtuales y API de pantalla completa
├── index.html           # Shell HTML5 y lienzo Canvas principal (1024×576 virtual)
└── README.md
```

---

## 👨‍💻 Créditos

- **Diseño, Arte, Música Procedural y Programación**:  
  **Isaac Daniel Cotera**  
  Correo: [isaacdanielcotera@gmail.com](mailto:isaacdanielcotera@gmail.com)  
  © 2026 Isaac Daniel Cotera. Todos los derechos reservados.

