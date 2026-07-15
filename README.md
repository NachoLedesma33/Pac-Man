# PAC-MAN Arcade

Juego clásico de Pac-Man con estética Neo-Brutalista y estilo retro arcade. PWA instalable desde el navegador.

**Demo:** [https://pac-man-iota.vercel.app](https://pac-man-iota.vercel.app)

## Stack

- **Framework:** React 19 + TypeScript
- **Estilo:** Tailwind CSS 4
- **Build:** Vite 8
- **PWA:** vite-plugin-pwa (instalable, offline)
- **Sonidos:** Web Audio API (sin archivos MP3)
- **Iconos:** Lucide React

## Características

### Jugabilidad
- 4 fantasmas con IA clásica (Blinky, Pinky, Inky, Clyde)
- Modo Scatter/Chase con ciclos progresivos
- Power Pills con modo Frightened
- Sistema de combos al comer fantasmas (200 → 400 → 800 → 1600 pts)
- Tunnel wrapping en los pasillos laterales
- Colisión por celda exacta (sin falsos positivos)

### Dificultad progresiva
| Nivel | Ghost Speed | Frightened | Scatter | Chase |
|-------|------------|------------|---------|-------|
| 1 | 0.9 | 6s | 7s | 20s |
| 10 | 1.26 | 3.3s | 4.3s | 24.5s |
| 21+ | 1.7 | 1s | 3s | 30s |

### 3 modos de dificultad
- **Easy:** 5 vidas, fantasmas lentos, frightened largo
- **Normal:** 3 vidas,平衡 difficulty
- **Hardcore:** 3 vidas, fantasmas rápidos, frightened corto

### Contenido
- 8 logros desbloqueables (comer X fantasmas, clear level, etc.)
- Leaderboard top 5 con nombre de jugador arcade
- 10 efectos de sonido retro por Web Audio API
- Vibración en dispositivos móviles
- Toggle de sonido y modo CRT scanlines

### Controles
- **Teclado:** Flechas / WASD + Espacio (pausa) + Escape (pausa)
- **Mobile:** D-Pad virtual con botones táctiles
- **Responsive:** adaptable a cualquier tamaño de pantalla

## Diseño visual

Estética **Neo-Brutalista**:
- Bordes gruesos negros (4px)
- Sombras duras offset (sin blur)
- Colores saturados sobre fondo oscuro
- Tipografía blocky retro
- Palette: `#FFE600` (yellow), `#2121DE` (blue), `#FF0000` (red), `#000` (black)

## Estructura del proyecto

```
src/
├── components/
│   ├── arcade/        # ArcadeCabinet, ThemeToggle
│   ├── game/          # GameBoard, AchievementPanel, DPad, ScoreBoard
│   └── ui/            # Modal, Toast, NameInput
├── engine/
│   ├── pacman.ts      # Movimiento + consumo de dots
│   ├── ghost.ts       # IA de fantasmas (chase/scatter/frightened/eaten)
│   ├── collision.ts   # Detección de colisiones
│   └── map.ts         # Utilidades de mapa y walkability
├── constants/
│   ├── game.ts        # Configuración, dificultad, timings
│   └── map.ts         # Mapa clásico 28×31
├── hooks/
│   ├── useGameState.ts    # Estado central del juego
│   ├── useGameLoop.ts     # Game loop con requestAnimationFrame
│   ├── useKeyboard.ts     # Input de teclado
│   ├── useAchievements.ts # Sistema de logros
│   └── useSound.ts        # Efectos de sonido
├── types/             # TypeScript types
└── utils/
    ├── soundManager.ts    # Web Audio API synthesis
    └── achievements.ts    # Lógica de logros + localStorage
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Development server
npm run dev

# Build de producción
npm run build

# Preview producción
npm run preview

# Lint
npm run lint
```

## Deploy en Vercel

```bash
npx vercel
```

Vercel detecta Vite automáticamente. Configuración por defecto:
- Build command: `npm run build`
- Output: `dist`
