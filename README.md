# 🌟 Star Cube

<p align="center">
  <b><a href="#-español">Español</a></b> | <b><a href="#-english">English</a></b>
</p>

<p align="center">
  <img src="galeria/screenshot_1.webp" alt="Star Cube Cover" width="800" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Engine-100%25%20Vanilla%20JS-F7DF1E?logo=javascript&logoColor=black" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/Render-HTML5%20Canvas%202D-E34F26?logo=html5&logoColor=white" alt="HTML5 Canvas" />
  <img src="https://img.shields.io/badge/Audio-Web%20Audio%20API-5c6bc0" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/Languages-5%20Idiomas%20(ES%2C%20EN%2C%20JA%2C%20RU%2C%20ZH)-22c55e" alt="5 Languages" />
  <img src="https://img.shields.io/badge/Platform-PC%20%7C%20Mobile%20%7C%20Gamepad-blue" alt="Cross Platform" />
  <img src="https://img.shields.io/badge/Year-2026-purple" alt="Year 2026" />
</p>

---

## 🇪🇸 Español

¡Un juego arcade de plataformas y disparos 2D desarrollado completamente desde cero usando **Vanilla JavaScript** y **HTML5 Canvas**, sin depender de motores de juegos ni usar sprites! El juego entero está diseñado en puro arte vectorial (con la única excepción de un atlas de sprites utilizado para optimizar ciertos elementos gráficos hacia el final).

---

### 🎮 Sobre el juego

*Star Cube* es un proyecto arcade de vieja escuela enfocado en la acción rápida, mecánicas fluidas y control directo en el navegador. Fue diseñado con un rendimiento ultra ligero para correr de forma nativa en cualquier navegador web moderno, tanto en computadoras como en dispositivos móviles.

El jugador controla a **Peggy**, un intrépido cubo rosa dotado de habilidades acrobáticas avanzadas (salto dinámico, dash terrestre/aéreo, disparo cargado multinivel y el devastador *Rayo Supremo*). Tu misión es rescatar a tus compañeros capturados a lo largo de desafiantes mundos y derrotar a formidables jefes.

---

### 🌐 Jugar en línea y Comunidad

El juego está disponible para jugar directamente en la web. ¡Puedes dejar comentarios, calificaciones y conocer más proyectos en mis perfiles oficiales!:
* 🕹️ **[Jugar en Itch.io](https://cotera.itch.io/star-cube)**
* 🎮 **[Jugar en Newgrounds](https://www.newgrounds.com/portal/view/1052101)**

---

### ✨ Características del Juego

* 🌍 **6 Mundos y Jefes Únicos**:
  1. **Mundo 1: Pradera & Cavernas Heladas** — Jefe: *Ice Cube*.
  2. **Mundo 2: Cyber Grid & Red Neón** — Jefe: *Cyber Hacker / MawlerKnight* (con inversión de controles).
  3. **Mundo 3: Volcán Ardiente** — Jefe: *Centinela Valkyrie*.
  4. **Mundo 4: Mar Tempestuoso & Fosas Abisales** — Navegación en barca con física de oleaje y Jefe: *Krakatoa Kraken*.
  5. **Mundo 5: Mazmorras Oscuras & Rescate** — Desafíos de precisión y rescate de aliados.
  6. **Mundo 6: Noche de Halloween & La Gran Calabaza** — Niebla procedural, linterna interactiva y persecución contrarreloj contra la *Gran Calabaza*.
* 🌀 **Sub-mundos Dinámicos**: Portales y zonas subterráneas que cambian drásticamente las mecánicas, la gravedad, la visibilidad y el entorno del nivel.
* 🌑 **Post-Game Oscuro (Gran Rejugabilidad)**: Al completar la aventura principal, el juego sufre una metamorfosis. Toda la atmósfera se transforma en un entorno oscuro y terrorífico:
  * Diálogos y cinemáticas alteradas.
  * Modo **La Cacería**: mecánicas de persecución y combate cuerpo a cuerpo con tajo especial.
  * Aumento del desafío, velocidad y vida de los enemigos y jefes.
* 🌐 **Soporte Multi-idioma (5 Idiomas)**: Traducción completa e integrada en **Español**, **Inglés**, **Japonés**, **Ruso** y **Chino** con selector interactivo y auto-detección.
* 📱 **Soporte Completo para Móviles y PC**:
  * **Móvil:** Controles táctiles virtuales en pantalla diseñados a medida, con soporte multitáctil, gestos y respuesta háptica.
  * **PC:** Teclado y soporte nativo para **Gamepads** (Xbox, PlayStation, mandos genéricos) con vibración/rumble.

---

### 🕹️ Controles

#### Teclado (PC)
| Acción | Tecla / Control |
| :--- | :--- |
| **Moverse** | Flechas direccionales (`←` / `→`) o teclas `A` / `D` |
| **Saltar** | `Barra espaciadora` / `W` / `Z` |
| **Disparar** | `X` o `K` |
| **Cargar Ataque** | Mantener `X` presionado |
| **Dash** | `C` |
| **Energy Dash** | `C` (con el ataque cargado al máximo) |
| **Interactuar / Entrar** | `E` o `W` (frente a puertas) |
| **Pausar** | `P` o `Escape` |

#### Pantalla Táctil (Móvil / Tablet)
* **D-Pad Virtual**: Moverse a la izquierda o derecha.
* **Botones de Acción**: `SALTAR`, `DASH`, `ATACAR` (cargar disparo) y botón especial de `TAJO` durante La Cacería.
* **Modo Pantalla Completa**: Botón dedicado para aprovechar al máximo la pantalla del teléfono.

#### Gamepad
* **Moverse**: Cruceta (D-Pad) o Stick izquierdo.
* **Saltar**: Botón `A` (Xbox) / `✕` (PlayStation).
* **Disparar / Cargar**: Botón `X` (Xbox) / `▢` (PlayStation).
* **Dash**: Botón `B` / Gatillos / R1.

---

### 🛠️ Tecnologías utilizadas

* **HTML5 Canvas:** Renderizado gráfico vectorial 2D y bucle de juego (*game loop*) propio a 60 FPS.
* **Vanilla JavaScript (ES6+):** Físicas de plataformas, colisiones AABB, inteligencia artificial de jefes y gestión de estados sin librerías externas.
* **Web Audio API:** Síntesis de sonido procedural en tiempo real para efectos de audio de baja latencia.
* **CSS3:** Diseño de interfaz de usuario (HUD), animaciones de menús y diseño responsivo adaptativo.
* **FFmpeg:** Optimización y compresión acústica de pistas musicales en formato MP3 para carga ultrarrápida.

---

### 🛡️ Módulo Destacado: Torretas High-Tech y Jefe Valkyrie (Vanilla JS)

Si deseas utilizar, aprender o integrar de forma independiente el sistema modular de **Torretas de Alta Tecnología** o al jefe **Valkyrie** (el temible jefe del mundo de fuego), he publicado el código modular en su propio repositorio, desarrollado 100% en **Vanilla JavaScript** puro (ES6 Modules) sin librerías ni dependencias externas:

* 🔗 **Repositorio oficial:** [https://github.com/cotera2024/Turrets-High-Tech.git](https://github.com/cotera2024/Turrets-High-Tech.git)

---

### 🚀 Cómo ejecutarlo localmente

Para revisar el código, ejecutar el juego en tu máquina o contribuir:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/cotera2024/starcube.git
   cd starcube
   ```

2. **Iniciar un servidor HTTP local:**
   > ⚠️ **Importante**: Debido a las políticas de seguridad de los navegadores (CORS), no debes abrir `index.html` directamente haciendo doble clic (`file:///`), ya que el navegador bloqueará la carga de audios y diccionarios de idioma. Es necesario usar un servidor local:

   * **Con Visual Studio Code**: Instala la extensión **Live Server**, haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.
   * **Con Python 3**:
     ```bash
     python3 -m http.server 8000
     ```
   * **Con Node.js**:
     ```bash
     npx serve .
     ```

3. **Abrir en tu navegador:**
   Ingresa a `http://localhost:8000` (o el puerto que te indique tu servidor).

---

### 👨‍💻 Autor y Contacto

* **Desarrollador**: Isaac Daniel Cotera
* **Año**: 2026
* **Correo electrónico**: [isaacdanielcotera@gmail.com](mailto:isaacdanielcotera@gmail.com)
* **Itch.io**: [https://cotera.itch.io](https://cotera.itch.io)
* **GitHub**: [https://github.com/cotera2024](https://github.com/cotera2024)

---
---

## 🇬🇧 English

A 2D arcade platformer and shooter built entirely from scratch using **Vanilla JavaScript** and **HTML5 Canvas**, with no external game engines or heavy sprite sheets! The entire game is rendered using pure procedural vector art (with the single exception of an optimized sprite atlas introduced near the end).

---

### 🎮 About the Game

*Star Cube* is an old-school arcade experience designed around fast-paced action, responsive physics, and crisp browser controls. It was engineered to run with ultra-low overhead natively on any modern web browser across desktop and mobile devices.

You play as **Peggy**, a courageous pink cube equipped with advanced acrobatic mechanics: variable jumping height, ground and air dashing, multi-tier charged energy shots, and the devastating *Supreme Lightning*. Your goal is to rescue your imprisoned companions across challenging worlds and bring down intimidating bosses.

---

### 🌐 Play Online & Community

You can play *Star Cube* directly in your browser. Feel free to leave feedback, ratings, and explore my other projects:
* 🕹️ **[Play on Itch.io](https://cotera.itch.io/star-cube)**
* 🎮 **[Play on Newgrounds](https://www.newgrounds.com/portal/view/1052101)**

---

### ✨ Key Features

* 🌍 **6 Worlds with Unique Boss Encounters**:
  1. **World 1: Meadow & Glacial Cavern** — Boss: *Ice Cube*.
  2. **World 2: Cyber Grid & Neon Network** — Boss: *Cyber Hacker / MawlerKnight* (with control inversion mechanics).
  3. **World 3: Fiery Volcano** — Boss: *Valkyrie Sentinel*.
  4. **World 4: Tempest Sea & Abyssal Trench** — Sailing boat with wave physics, lateral lightning, and Boss: *Krakatoa Kraken*.
  5. **World 5: Dark Dungeons & Hub** — Precision platforming and rescue missions.
  6. **World 6: Halloween Night & The Great Pumpkin** — Procedural fog, dynamic flashlight cone, and an adrenaline-fueled chase against the *Great Pumpkin*.
* 🌀 **Dynamic Sub-Worlds**: Hidden caverns and dimensions that alter gravity, lighting, and platforming hazards.
* 🌑 **Dark Post-Game Mode (High Replay Value)**: Finishing the main game unveils an eerie transformation. The entire world transitions into a creepy nightmare dimension:
  * Altered story beats and dialogues.
  * **The Hunt Mode**: Specialized chase sequences with a dedicated melee slash control.
  * Enhanced difficulty, faster enemy patterns, and scaled boss health.
* 🌐 **5 Languages Supported**: Fully localized into **Spanish**, **English**, **Japanese**, **Russian**, and **Chinese** with instant switching and auto-detection.
* 📱 **Seamless Cross-Platform Controls**:
  * **Mobile:** Custom touch controls with on-screen D-Pad, dedicated jump/dash/attack buttons, and haptic feedback.
  * **PC:** Responsive keyboard input and native **Gamepad** support (Xbox, PlayStation, generic controllers) with vibration/rumble.

---

### 🕹️ Controls

#### Keyboard (PC)
| Action | Key / Input |
| :--- | :--- |
| **Move** | Arrow keys (`←` / `→`) or `A` / `D` |
| **Jump** | `Spacebar` / `W` / `Z` |
| **Shoot** | `X` or `K` |
| **Charge Attack** | Hold `X` |
| **Dash** | `C` |
| **Energy Dash** | `C` (while fully charged) |
| **Interact / Enter** | `E` or `W` (in front of doors) |
| **Pause** | `P` or `Escape` |

#### Touch Screen (Mobile / Tablet)
* **Virtual D-Pad**: Move left and right.
* **Action Buttons**: `JUMP`, `DASH`, `ATTACK` (charge shot) and a dedicated `SLASH` button during The Hunt.
* **Fullscreen Button**: Maximizes viewport for distraction-free mobile play.

#### Gamepad
* **Movement**: D-Pad or Left Stick.
* **Jump**: `A` (Xbox) / `✕` (PlayStation).
* **Shoot / Charge**: `X` (Xbox) / `▢` (PlayStation).
* **Dash**: `B` / Shoulder Triggers / R1.

---

### 🛠️ Built With

* **HTML5 Canvas:** Custom 2D vector renderer and fixed 60 FPS game loop.
* **Vanilla JavaScript (ES6+):** Pure platform physics, AABB collisions, boss AI state machines, and sound scheduling without third-party frameworks.
* **Web Audio API:** Real-time procedural audio synthesis for zero-latency sound effects.
* **CSS3:** Responsive UI layout, HUD overlays, and smooth menu animations.
* **FFmpeg:** High-efficiency audio compression and bitrate optimization for instant web loading.

---

### 🛡️ Featured Module: High-Tech Turrets & Valkyrie Boss (Vanilla JS)

If you wish to use, inspect, or integrate the modular **High-Tech Turret System** or the **Valkyrie Boss** (the fire world's formidable boss) into your own projects, this standalone module is published in its own dedicated repository, built 100% in pure **Vanilla JavaScript** (ES6 Modules) without third-party dependencies:

* 🔗 **Official Repository:** [https://github.com/cotera2024/Turrets-High-Tech.git](https://github.com/cotera2024/Turrets-High-Tech.git)

---

### 🚀 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cotera2024/starcube.git
   cd starcube
   ```

2. **Start a local HTTP server:**
   > ⚠️ **Important**: Browsers restrict cross-origin audio and JSON loading over `file:///`. You must run a local HTTP server:

   * **VS Code Live Server**: Right-click `index.html` and select **"Open with Live Server"**.
   * **Python 3**:
     ```bash
     python3 -m http.server 8000
     ```
   * **Node.js**:
     ```bash
     npx serve .
     ```

3. **Open your browser:**
   Navigate to `http://localhost:8000`.

---

### 👨‍💻 Author & Contact

* **Developer**: Isaac Daniel Cotera
* **Year**: 2026
* **Email**: [isaacdanielcotera@gmail.com](mailto:isaacdanielcotera@gmail.com)
* **Itch.io**: [https://cotera.itch.io](https://cotera.itch.io)
* **GitHub**: [https://github.com/cotera2024](https://github.com/cotera2024)

---
*© 2026 Isaac Daniel Cotera. All rights reserved.*
