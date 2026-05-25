# Jotai State — Архітектура стану гри

> Довідник по структурі Jotai atoms для ігрового стану QuizMaker.
> Весь ігровий стан живе **тільки в пам'яті** (Jotai) — не зберігається в БД під час гри.

---

## Загальна архітектура

```
Jotai Atoms
├── auth.atoms.ts          # Авторизаційний стан
│   ├── accessTokenAtom    # string | null (persisted)
│   ├── userAtom           # User | null (persisted)
│   └── isAuthenticatedAtom # derived: !!accessToken
│
└── game.atoms.ts          # Ігровий стан
    ├── gameStateAtom      # GameState (in-memory)
    ├── [derived atoms]    # playersAtom, gamePhaseAtom, ...
    └── [action atoms]     # initGameAtom, addPlayerAtom, ...
```

---

## Auth Atoms

```typescript
// src/atoms/auth.atoms.ts
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Зберігається у localStorage — персистентний між сесіями
export const accessTokenAtom = atomWithStorage<string | null>('qm_access_token', null)
export const userAtom = atomWithStorage<User | null>('qm_user', null)

// Derived — не зберігається
export const isAuthenticatedAtom = atom((get) => !!get(accessTokenAtom))
```

---

## Game State Structure

```typescript
// src/types/game.types.ts

export type GamePhase = 
  | 'idle'       // Гра не ініціалізована
  | 'setup'      // Налаштування: введення учасників
  | 'playing'    // Гра активна: хост вибирає клітинки
  | 'question'   // Відображається питання
  | 'finished'   // Гра завершена

export interface Player {
  id: string      // crypto.randomUUID()
  name: string
  score: number   // Може бути від'ємним
}

export type CellStatus = 'available' | 'used'

export interface GameCell {
  questionId: string    // _id питання з MongoDB
  categoryId: string    // _id категорії
  categoryName: string  // для відображення
  points: number
  text: string
  answer: string
  status: CellStatus
}

export interface ActiveQuestion {
  cell: GameCell
  isAnswerRevealed: boolean
}

export interface GameState {
  phase: GamePhase
  quizId: string
  quizTitle: string
  players: Player[]
  cells: GameCell[]           // Всі клітинки (плоский список)
  categories: string[]        // Назви категорій (для відображення заголовків)
  pointLevels: number[]       // Рівні вартості (для побудови рядків сітки)
  activeQuestion: ActiveQuestion | null
  lastAnsweredPlayerId: string | null  // Для UX (виділення останнього)
}
```

---

## Game Atoms

### Primitive atoms

```typescript
// Основний atom — єдине джерело правди для гри
export const gameStateAtom = atom<GameState>(initialGameState)
```

### Derived (read-only) atoms

```typescript
// Читаємо зрізи стану без дублювання
export const playersAtom = atom((get) => get(gameStateAtom).players)
export const gamePhaseAtom = atom((get) => get(gameStateAtom).phase)
export const activeQuestionAtom = atom((get) => get(gameStateAtom).activeQuestion)

export const availableCellsAtom = atom((get) =>
  get(gameStateAtom).cells.filter(c => c.status === 'available')
)

export const isGameFinishedAtom = atom((get) => {
  const phase = get(gameStateAtom).phase
  // Перевіряємо фазу щоб уникнути false-positive на початку гри (cells ще порожні)
  return get(availableCellsAtom).length === 0 && (phase === 'playing' || phase === 'question')
})

export const sortedPlayersAtom = atom((get) =>
  [...get(gameStateAtom).players].sort((a, b) => b.score - a.score)
)
```

### Action (write-only) atoms

```typescript
// Ініціалізація гри з квізу
export const initGameAtom = atom(null, (get, set, quiz: Quiz) => { ... })

// Управління гравцями
export const addPlayerAtom = atom(null, (get, set, name: string) => { ... })
export const removePlayerAtom = atom(null, (get, set, playerId: string) => { ... })

// Керування грою
export const startGameAtom = atom(null, (get, set) => { ... })
export const selectCellAtom = atom(null, (get, set, cell: GameCell) => { ... })
export const revealAnswerAtom = atom(null, (get, set) => { ... })

// Нарахування балів
export const awardPointsAtom = atom(null, (get, set, payload: {
  playerId: string
  delta: number   // +points або -points
}) => { ... })

// Пропустити питання (без балів)
export const skipQuestionAtom = atom(null, (get, set) => { ... })

// Скинути гру
export const resetGameAtom = atom(null, (get, set) => { ... })
```

---

## Діаграма переходів стану (GamePhase)

```
                    ┌─────────────────┐
                    │      idle       │
                    │  (initial)      │
                    └────────┬────────┘
                             │ initGame(quiz)
                             ▼
                    ┌─────────────────┐
                    │     setup       │◄──── resetGame()
                    │  (add players)  │
                    └────────┬────────┘
                             │ startGame()
                             ▼
              ┌──────────────────────────────┐
              │           playing            │
              │  (board visible, pick cell)  │◄────────────────┐
              └──────┬───────────────────────┘                 │
                     │ selectCell(cell)                        │
                     ▼                                         │
              ┌─────────────────┐                              │
              │    question     │   awardPoints() / skip()    │
              │  (Q on screen)  │─────────────────────────────┘
              └─────────────────┘
                     │
                     │ (всі клітинки used)
                     ▼
              ┌─────────────────┐
              │    finished     │
              │  (final screen) │
              └─────────────────┘
```

---

## Як використовувати atoms у компонентах

### Читання стану
```typescript
import { useAtomValue } from 'jotai'
import { playersAtom, gamePhaseAtom } from '@/atoms/game.atoms'

function Scoreboard() {
  const players = useAtomValue(playersAtom)
  const phase = useAtomValue(gamePhaseAtom)
  // ...
}
```

### Виконання дії
```typescript
import { useSetAtom } from 'jotai'
import { awardPointsAtom } from '@/atoms/game.atoms'

function PlayerButton({ playerId, points }: Props) {
  const awardPoints = useSetAtom(awardPointsAtom)
  
  return (
    <button onClick={() => awardPoints({ playerId, delta: points })}>
      +{points}
    </button>
  )
}
```

### Читання і запис одночасно
```typescript
import { useAtom } from 'jotai'
import { gameStateAtom } from '@/atoms/game.atoms'

// Тільки якщо потрібен прямий доступ до стану І setter
// В більшості випадків краще використовувати action atoms
function GameDebug() {
  const [gameState, setGameState] = useAtom(gameStateAtom)
  // ...
}
```

---

## Нотатки

### Чому Jotai, а не useState або Redux?

- **useState** — занадто локальний, стан гри потрібен у багатьох компонентах
- **Redux** — занадто verbose для цього проєкту
- **Jotai** — атомарний підхід, TypeScript-friendly, без boilerplate, atoms composable

### Чому не зберігаємо ігровий стан у БД?

- Гра відбувається локально, у real-time, без мережевих затримок
- Хост керує грою з одного пристрою
- Немає мультиплеєрного підключення гравців
- Збереження результатів після гри — опціонально (можна додати POST /game-results)

### Стійкість до рефрешу

Поточна архітектура: Jotai in-memory → рефреш скидає стан гри.
**Рішення:** У `GamePage.tsx` перевіряти `gameState.phase !== 'idle'` і `gameState.quizId` — якщо стан порожній після рефрешу → redirect до `/game/:quizId/setup`.
