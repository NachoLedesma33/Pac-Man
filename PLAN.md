# 🟡 PAC-MAN NEO-BRUTAL ARCADE — Plan de Desarrollo

> **Estilo visual:** Neo-brutalismo + Arcade retro
> **Stack técnico:** Vite + React + TypeScript + Tailwind CSS + PWA
> **Meta:** Un Pac-Man instalable, jugable, con estética única y sonidos sintetizados.

---

## Arquitectura y Stack

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Build | Vite | Hot reload ultra-rápido, ESM nativo |
| UI | React 18 + TypeScript | Componentes funcionales, tipado estricto |
| Estilos | Tailwind CSS | Clases utilitarias para sombras duras y bordes gruesos |
| PWA | `@vite-pwa/plugin` | Instalable desde Chrome/Brave, service worker |
| Sonido | Web Audio API | Osciladores sintéticos, 0 archivos MP3 externos |
| Iconos | Lucide React | SVG limpios y modernos |
| Estado | React Context + useReducer | State management ligero sin dependencias extra |
| Datos | localStorage | High scores y logros persistentes |

---

## Estructura de Carpetas

```
pac-man/
├── public/
│   ├── favicon.ico
│   └── icons/              # Iconos PWA (192x192, 512x512)
├── src/
│   ├── assets/             # Fuentes, sprites estáticos si los hay
│   ├── components/
│   │   ├── arcade/         # Cabinet, Marquee, Screen bezel
│   │   ├── game/           # GameBoard, Pacman, Ghost, Cell, HUD
│   │   ├── ui/             # Button, Modal, Toast, Toggle, Card
│   │   └── layout/         # Layout, Header, Footer
│   ├── hooks/
│   │   ├── useGameLoop.ts
│   │   ├── useKeyboard.ts
│   │   ├── usePWA.ts
│   │   ├── useSound.ts
│   │   └── useLocalStorage.ts
│   ├── context/
│   │   ├── ThemeContext.tsx
│   │   └── GameContext.tsx
│   ├── engine/
│   │   ├── map.ts          # Matriz del mapa y utilidades
│   │   ├── pacman.ts       # Lógica de movimiento y colisiones
│   │   ├── ghost.ts        # IA de fantasmas (patrones + chase/scatter)
│   │   └── collision.ts    # Detección de colisiones
│   ├── constants/
│   │   ├── map.ts          # Mapa clásico 28x31
│   │   ├── game.ts         # Velocidades, puntos, timings
│   │   └── theme.ts        # Tokens de color Neo-brutalista
│   ├── types/
│   │   ├── game.ts         # Position, Direction, CellType, etc.
│   │   └── ui.ts           # Theme, Achievement, Score
│   ├── utils/
│   │   ├── soundManager.ts # Sintetizador de sonidos Web Audio
│   │   ├── score.ts        # Cálculo y persistencia de puntos
│   │   └── achievements.ts # Lógica de logros
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── PLAN.md                 # Este archivo
```

---

## Fase 1: Inicialización, Estructura y PWA

**Objetivo:** Proyecto funcionando, Tailwind configurado, PWA instalable.

### Tareas

- [ ] `npm create vite@latest . -- --template react-ts`
- [ ] Instalar dependencias: `tailwindcss`, `@tailwindcss/vite`, `@vite-pwa/plugin`, `vite-plugin-pwa`, `lucide-react`
- [ ] Configurar `vite.config.ts` con plugin PWA (manifest completo, icons, theme_color: `#FFE600`)
- [ ] Configurar Tailwind con paleta Neo-brutalista y utilidades custom:
  - `shadow-brutal` → `4px 4px 0px 0px #000`
  - `shadow-brutal-sm` → `2px 2px 0px 0px #000`
  - `shadow-brutal-lg` → `6px 6px 0px 0px #000`
  - Colores: `arcade-yellow`, `arcade-blue`, `ghost-pink`, `ghost-cyan`, `ghost-orange`, `ghost-red`
- [ ] Crear estructura de carpetas
- [ ] Crear componente `usePWA.ts` que detecte `beforeinstallprompt` y exponga `install()`
- [ ] Crear componente `Layout.tsx` con detección de PWA y botón de instalación
- [ ] Verificar que `vite build` genera una PWA válida

### Verificación
```bash
npm run dev    # Abre en localhost, aparece botón instalar en omnibox
npm run build  # Genera sw.js y manifest en dist/
```

---

## Fase 2: UI Neo-Brutalista, Menús y Tema

**Objetivo:** Interfaz completa estilo arcade, onboarding, toggle de tema.

### Componentes a crear

| Componente | Descripción |
|-----------|-------------|
| `ThemeToggle` | Switch dia/noche neo-brutalista (sun/moon icons) |
| `WelcomeScreen` | Pantalla arcade con "INSERT COIN", instrucciones, tips |
| `ArcadeCabinet` | Contenedor estilo cabina física (marco, marquesina, pantalla) |
| `DPad` | D-pad virtual para móviles (4 direcciones) |
| `Button` | Botón base neo-brutalista con efecto press (hundir sombra) |
| `Modal` | Modal con overlay oscuro y borde grueso |
| `Toast` | Notificaciones emergentes para logros |
| `ScoreBoard` | Panel de puntuación estilo LED digital |

### Comportamientos

- **ThemeToggle:** Alterna `data-theme="dark"` / `data-theme="light"` en `<html>`. Persiste en localStorage.
- **WelcomeScreen:** Se muestra al cargar. Contiene:
  - Logo del juego (texto blocky con text-shadow)
  - Controles: ← → ↑ ↓ / W A S D
  - Tip: "Los fantasmas huyen con las píldoras de poder"
  - Botón "INSERT COIN" que inicia el juego
- **ArcadeCabinet:** Responsive wrapper que simula la cabina (borde exterior grueso, sombra grande, fondo con gradiente sutil).
- **DPad:** Solo visible en `pointer: coarse`. 4 botones direccionales dispuestos en cruz.

### Paleta de colores

```
Día:
  bg-primary: #FFFFFF
  bg-secondary: #FFF9DB (amarillo pálido)
  text-primary: #000000
  accent: #FFE600 (amarillo arcade)

Noche:
  bg-primary: #0A0A0A
  bg-secondary: #1A1A2E
  text-primary: #F0F0F0
  accent: #FFE600 (amarillo arcade)
  neon-glow: #FFE600, #00FFFF, #FF00FF
```

---

## Fase 3: Motor del Juego

**Objetivo:** Pac-Man jugable con mapa, movimiento, colisiones y IA básica de fantasmas.

### Tipos principales (`types/game.ts`)

```typescript
type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type CellType = 'WALL' | 'PATH' | 'DOT' | 'POWER_PILL' | 'GHOST_HOUSE' | 'EMPTY';

interface Entity {
  position: Position;
  direction: Direction;
  speed: number;
}

interface Ghost extends Entity {
  name: 'BLINKY' | 'PINKY' | 'INKY' | 'CLYDE';
  color: string;
  mode: 'CHASE' | 'SCATTER' | 'FRIGHTENED' | 'EATEN';
  scatterTarget: Position;
}

interface GameState {
  pacman: Entity;
  ghosts: Ghost[];
  map: CellType[][];
  score: number;
  lives: number;
  level: number;
  isPlaying: boolean;
  isPaused: boolean;
}
```

### Mapa (`constants/map.ts`)

Matriz 28 columnas × 31 filas (clásico). Representación numérica:
- `0` = Pared
- `1` = Camino con punto
- `2` = Píldora de poder
- `3` = Camino vacío (sin punto)
- `4` = Casa de fantasmas
- `5` = Spawn de Pac-Man

### Hook `useGameLoop.ts`

- `requestAnimationFrame` loop a 60 FPS
- Actualiza posición de Pac-Man según velocidad y dirección
- Verifica si la celda destino es transitable antes de mover
- Ejecuta IA de fantasmas en cada tick
- Detecta colisiones (comer punto, power pill, fantasma, ser comido)

### Movimiento de Pac-Man

- **Pre-giro:** Al presionar dirección, se almacena como `nextDirection`. Si en la siguiente intersección esa dirección es válida, se ejecuta.
- **Continuidad:** Pac-Man mantiene la dirección actual hasta chocar con una pared.

### IA de Fantasmas

| Fantasma | Modo Chaser | Modo Scatter |
|----------|------------|--------------|
| Blinky (rojo) | Persigue directamente a Pac-Man | Esquina superior derecha |
| Pinky (rosa) | 4 celdas adelante de Pac-Man | Esquina superior izquierda |
| Inky (cian) | Calcula usando posición de Blinky y Pac-Man | Esquina inferior derecha |
| Clyde (naranja) | Persigue si > 8 celdas, huye si está cerca | Esquina inferior izquierda |

- **Ciclo Chase/Scatter:** 7s scatter → 20s chase → 7s scatter → 20s chase → ...
- **Frightened:** Al comer power pill, todos entran en modo FRIGHTENED por 6 segundos. Se mueven aleatoriamente y son vulnerables.
- **Eaten:** Tras ser comido, el fantasma regresa a la casa como "ojos" (velocidad ×2).

### Colisiones

- Pac-Man + Dot → +10 pts, remover dot del mapa
- Pac-Man + Power Pill → +50 pts, activar FRIGHTENED en todos los fantasmas
- Pac-Man + Ghost (CHASE/SCATTER) → Perder vida
- Pac-Man + Ghost (FRIGHTENED) → +200/400/800/1600 pts (combo)
- Todos los dots comidos → Siguiente nivel

---

## Fase 4: Gamificación, Dificultad y Logros

**Objetivo:** Capa de competencia y progresión sobre el motor base.

### Selector de Dificultad

| Nivel | Velocidad Pac-Man | Velocidad Fantasmas | Power Pill Duration | Vidas |
|-------|-------------------|---------------------|--------------------|----|
| Fácil | 80% | 60% | 10s | 5 |
| Normal | 100% | 100% | 6s | 3 |
| Hardcore | 100% | 120% | 3s | 3 |

### Sistema de Puntuación

- Dot: 10 pts
- Power Pill: 50 pts
- Fantasma (combo): 200 → 400 → 800 → 1600 pts
- Nivel completado: +1000 pts bonus
- **High Score:** Guardado en `localStorage` con key `pacman-highscore`

### Sistema de Logros

| Logro | Condición | Recompensa visual |
|-------|-----------|-------------------|
| 🏁 Primer bocado | Comer primer dot | Toast amarillo |
| 👻 Cazador | Comer primer fantasma | Toast morado |
| 💊 Poder absoluto | Comer las 4 power pills en una partida | Toast dorado |
| 🛡️ Inmune | Completar nivel sin perder vida | Toast cyan |
| 🔥 Racha de 4 | Comer los 4 fantasmas seguidos con 1 power pill | Toast rojo neon |
| 🏆 Master | Alcanzar nivel 10 | Toast especial |
| 💎 Coleccionista | Comer todos los dots de un nivel | Toast blanco |

Cada logro se desbloquea una vez y persiste en `localStorage`.

---

## Fase 5: Sonido, Pulido y Lanzamiento

**Objetivo:** Sonidos sintetizados, animaciones, CRT filter, 0 errores TypeScript.

### soundManager.ts — Síntesis de Audio

| Sonido | Método |
|--------|--------|
| Waka-waka | Oscilador cuadrado alternando 440Hz/520Hz cada 100ms |
| Comer power pill | Escalada ascendente 200→800Hz en 300ms |
| Comer fantasma | 4 notas ascendentes rápidas (C5→E5→G5→C6) |
| Morir | Frecuencia descendente 800→100Hz en 1.5s con fade out |
| Nivel completado | Melodía victoriosa: C5→E5→G5→C6 (acorde final) |
| Game over | Notas descendentes C5→G4→E4→C4 |

Todos los sonidos usan `OscillatorNode` + `GainNode` de Web Audio API.

### Pulido Visual

- **Botón press effect:** `active:translate-y-[2px] active:shadow-none` (elimina sombra, simula hundimiento)
- **Hover glow:** En modo noche, los botones tienen `hover:shadow-[0_0_15px_var(--accent)]`
- **Transiciones:** `transition-all duration-150` en elementos interactivos
- **Scanlines overlay:** CSS `repeating-linear-gradient` con opacidad 0.03, toggleable
- **CRT curve:** `border-radius` sutil en la pantalla del juego + vignette con box-shadow inset
- **Pac-Man animation:** Sprite de boca abierta/cerrada (2 frames CSS o SVG)
- **Ghost animation:** Ondulación en la "falda" del fantasma (clip-path animado)

### Vibration API (móviles)

```typescript
// En colisiones:
navigator.vibrate(50)   // Comer dot
navigator.vibrate(100)  // Comer power pill
navigator.vibrate(200)  // Comer fantasma
navigator.vibrate([100, 50, 100])  // Morir (patrón)
```

### Auditoría final

- [ ] `npm run build` sin errores TypeScript
- [ ] Lighthouse PWA score ≥ 90
- [ ] Service worker registrado y cacheando assets
- [ ] Responsive en mobile (320px) y desktop (1920px)
- [ ] Todos los sonidos funcionan en Chrome/Brarge
- [ ] Toggle de tema persiste al recargar
- [ ] High scores persisten en localStorage

---

## Ideas Extras (Post-Fase 5)

| Idea | Descripción |
|------|-------------|
| **Leaderboard local** | Top 5 scores con iniciales estilo arcade clásico (AAA, BCD, etc.) |
| **Modo Turbo** | Botón físico ×2 velocidad para jugadores experimentados |
| **Niveles custom** | Editor de mapas con drag & drop |
| **Modo Noche infinita** | Mapa aleatorio generado proceduralmente |
| **Achievements online** | Sync de logros con backend (Firebase/Supabase) |
| **Tableta portrait** | Layout adaptado para tablets en orientación vertical |

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview producción
npm run preview

# Type check
npx tsc --noEmit

# Lint
npm run lint
```
