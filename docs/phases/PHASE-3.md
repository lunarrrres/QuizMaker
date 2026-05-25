# PHASE-3 — Режим гри Jeopardy

> **Мета фази:** Реалізувати повноцінний ігровий режим у форматі Jeopardy. Хост керує грою: обирає питання, нараховує бали, бачить рейтинг.
> **Орієнтовний час:** 6–8 годин
> **Результат:** Повністю функціональний ігровий екран у стилі Jeopardy.
> **Важливо:** Весь ігровий стан зберігається локально у Jotai. БД не використовується під час гри.

---

## PHASE-3.1 — Jotai atoms для стану гри

**Опис:** Визначити повну структуру ігрового стану у Jotai atoms.

**Залежності:** PHASE-2.3

**Файли:**
- `frontend/src/atoms/game.atoms.ts`
- `frontend/src/types/game.types.ts`

**Підзадачі:**
- [ ] Створити `src/types/game.types.ts`:
```typescript
export interface Player {
  id: string          // uuid, генерується локально
  name: string
  score: number
}

export type CellStatus = 'available' | 'used'

export interface GameCell {
  questionId: string
  categoryId: string
  categoryName: string
  points: number
  text: string
  answer: string
  status: CellStatus
}

export interface ActiveQuestion {
  cell: GameCell
  isAnswerRevealed: boolean
}

export type GamePhase = 'setup' | 'playing' | 'question' | 'finished'

export interface GameState {
  phase: GamePhase
  quizId: string
  quizTitle: string
  players: Player[]
  cells: GameCell[]           // всі клітинки (всіх категорій)
  categories: string[]        // упорядкований список назв категорій
  pointLevels: number[]       // упорядкований список рівнів (100,200,...)
  activeQuestion: ActiveQuestion | null
  lastAnsweredPlayerId: string | null
}
```
- [ ] Створити `src/atoms/game.atoms.ts`:
```typescript
import { atom } from 'jotai'
import type { GameState, Player, GameCell, ActiveQuestion } from '@/types/game.types'

const initialGameState: GameState = {
  phase: 'setup',
  quizId: '',
  quizTitle: '',
  players: [],
  cells: [],
  categories: [],
  pointLevels: [],
  activeQuestion: null,
  lastAnsweredPlayerId: null,
}

// Основний atom стану гри
export const gameStateAtom = atom<GameState>(initialGameState)

// Derived atoms (тільки для читання)
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

// Action atoms (write-only)
export const initGameAtom = atom(null, (get, set, quiz: import('@/types/quiz.types').Quiz) => {
  // Трансформувати Quiz у GameState
  const categories = quiz.categories.map(c => c.name)
  const pointLevels = [...new Set(
    quiz.categories.flatMap(c => c.questions.map(q => q.points))
  )].sort((a, b) => a - b)
  
  const cells: GameCell[] = quiz.categories.flatMap(category =>
    category.questions.map(question => ({
      questionId: question._id,
      categoryId: category._id,
      categoryName: category.name,
      points: question.points,
      text: question.text,
      answer: question.answer,
      status: 'available' as const,
    }))
  )

  set(gameStateAtom, {
    phase: 'setup',
    quizId: quiz._id,
    quizTitle: quiz.title,
    players: [],
    cells,
    categories,
    pointLevels,
    activeQuestion: null,
    lastAnsweredPlayerId: null,
  })
})

export const addPlayerAtom = atom(null, (get, set, name: string) => {
  const state = get(gameStateAtom)
  const newPlayer: Player = {
    id: crypto.randomUUID(),
    name,
    score: 0,
  }
  set(gameStateAtom, { ...state, players: [...state.players, newPlayer] })
})

export const removePlayerAtom = atom(null, (get, set, playerId: string) => {
  const state = get(gameStateAtom)
  set(gameStateAtom, {
    ...state,
    players: state.players.filter(p => p.id !== playerId),
  })
})

export const startGameAtom = atom(null, (get, set) => {
  set(gameStateAtom, { ...get(gameStateAtom), phase: 'playing' })
})

export const selectCellAtom = atom(null, (get, set, cell: GameCell) => {
  const state = get(gameStateAtom)
  set(gameStateAtom, {
    ...state,
    phase: 'question',
    activeQuestion: { cell, isAnswerRevealed: false },
  })
})

export const revealAnswerAtom = atom(null, (get, set) => {
  const state = get(gameStateAtom)
  if (!state.activeQuestion) return
  set(gameStateAtom, {
    ...state,
    activeQuestion: { ...state.activeQuestion, isAnswerRevealed: true },
  })
})

export const awardPointsAtom = atom(null, (get, set, payload: { playerId: string; delta: number }) => {
  const state = get(gameStateAtom)
  if (!state.activeQuestion) return
  
  const updatedPlayers = state.players.map(p =>
    p.id === payload.playerId ? { ...p, score: p.score + payload.delta } : p
  )
  const updatedCells = state.cells.map(c =>
    c.questionId === state.activeQuestion!.cell.questionId
      ? { ...c, status: 'used' as const }
      : c
  )
  const availableAfter = updatedCells.filter(c => c.status === 'available')
  
  set(gameStateAtom, {
    ...state,
    players: updatedPlayers,
    cells: updatedCells,
    activeQuestion: null,
    lastAnsweredPlayerId: payload.playerId,
    phase: availableAfter.length === 0 ? 'finished' : 'playing',
  })
})

export const skipQuestionAtom = atom(null, (get, set) => {
  const state = get(gameStateAtom)
  if (!state.activeQuestion) return
  
  const updatedCells = state.cells.map(c =>
    c.questionId === state.activeQuestion!.cell.questionId
      ? { ...c, status: 'used' as const }
      : c
  )
  const availableAfter = updatedCells.filter(c => c.status === 'available')
  
  set(gameStateAtom, {
    ...state,
    cells: updatedCells,
    activeQuestion: null,
    phase: availableAfter.length === 0 ? 'finished' : 'playing',
  })
})

export const resetGameAtom = atom(null, (get, set) => {
  set(gameStateAtom, initialGameState)
})
```

**Критерій завершення:**
```bash
bun run dev
# TypeScript не показує помилок у файлі game.atoms.ts
# Всі atoms імпортуються без помилок
```

**Запис у PROGRESS.md:** `[DONE] PHASE-3.1 — Jotai atoms для стану гри — YYYY-MM-DD`

---

## PHASE-3.2 — Екран налаштування гри (GameSetupPage)

**Опис:** Сторінка де хост вводить імена учасників перед початком гри.

**Залежності:** PHASE-3.1, PHASE-2.3

**Файли:**
- `frontend/src/pages/GameSetupPage.tsx`
- `frontend/src/hooks/useGame.ts`

**Підзадачі:**
- [ ] Створити `src/hooks/useGame.ts` — хук який збирає всі ігрові actions в одне місце:
```typescript
import { useAtomValue, useSetAtom } from 'jotai'
import { gameStateAtom, addPlayerAtom, removePlayerAtom, startGameAtom, ... } from '@/atoms/game.atoms'

export function useGame() {
  const gameState = useAtomValue(gameStateAtom)
  const addPlayer = useSetAtom(addPlayerAtom)
  const removePlayer = useSetAtom(removePlayerAtom)
  const startGame = useSetAtom(startGameAtom)
  // ...
  return { gameState, addPlayer, removePlayer, startGame, ... }
}
```
- [ ] Створити `src/pages/GameSetupPage.tsx`:
  - При завантаженні — отримати квіз по `quizId` з URL і викликати `initGame(quiz)`
  - Показати назву квізу
  - Поле вводу імені учасника + кнопка "Додати"
  - Список доданих учасників з кнопкою видалення
  - Кнопка "Почати гру" (активна якщо мінімум 1 учасник)
  - При "Почати гру" — викликати `startGame()` → navigate до `/game/:quizId/play`
- [ ] Валідація: ім'я не може бути порожнім, не може дублюватись
- [ ] Додати маршрут `/game/:quizId/setup` в роутер

**Критерій завершення:**
```
1. Перейти на /game/:quizId/setup
2. Ввести кілька імен учасників
3. Побачити список учасників
4. Видалити одного учасника
5. Натиснути "Почати гру" → перехід на /game/:quizId/play
```

**Запис у PROGRESS.md:** `[DONE] PHASE-3.2 — Екран налаштування гри — YYYY-MM-DD`

---

## PHASE-3.3 — Головний ігровий екран: сітка Jeopardy (GameBoard)

**Опис:** Реалізувати головний екран гри з сіткою Jeopardy у характерному стилі.

**Залежності:** PHASE-3.2

**Файли:**
- `frontend/src/pages/GamePage.tsx`
- `frontend/src/components/game/GameBoard.tsx`
- `frontend/src/components/game/BoardCell.tsx`

**Підзадачі:**
- [ ] Створити `src/pages/GamePage.tsx`:
  - Перевірити що gameState.phase === 'playing' (якщо ні — redirect до setup)
  - Відображати `GameBoard` або `QuestionScreen` або `FinalScreen` залежно від фази
  - Додати маршрут `/game/:quizId/play` в роутер
- [ ] Створити `src/components/game/GameBoard.tsx`:
  - CSS Grid: `grid-template-columns: repeat(N, 1fr)` де N = кількість категорій
  - Перший рядок: назви категорій
  - Решта рядків: клітинки по рівнях вартості
  - Компонент має виглядати як справжня дошка Jeopardy:
    - Фон: `#060CE9` (синій Jeopardy)
    - Текст: `#FFD700` (золотий)
    - Шрифт: жирний, великий
    - Розділювачі між клітинками
- [ ] Створити `src/components/game/BoardCell.tsx`:
  - Якщо `status === 'available'`: показує вартість (`$100`, `$200`, ...)
  - Якщо `status === 'used'`: порожня/затемнена клітинка
  - `onClick` — тільки для available клітинок → `selectCell(cell)`
  - Hover ефект для available клітинок
  
**Стиль сітки (Tailwind + inline styles):**
```tsx
// GameBoard.tsx — приклад структури
<div 
  className="w-full h-screen grid gap-1 p-2"
  style={{ 
    gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
    gridTemplateRows: `auto repeat(${pointLevels.length}, 1fr)`,
    backgroundColor: '#060CE9'
  }}
>
  {/* Рядок заголовків категорій */}
  {categories.map(cat => (
    <div key={cat} className="flex items-center justify-center p-4 text-yellow-400 font-bold text-xl text-center uppercase border border-blue-900">
      {cat}
    </div>
  ))}
  
  {/* Рядки питань */}
  {pointLevels.map(points =>
    categories.map(cat => {
      const cell = cells.find(c => c.categoryName === cat && c.points === points)
      return <BoardCell key={`${cat}-${points}`} cell={cell} points={points} />
    })
  )}
</div>
```

**Критерій завершення:**
```
1. Після "Почати гру" → перехід на /game/:quizId/play
2. Бачимо синю сітку з назвами категорій та вартостями
3. Клітинки відображають правильні значення
4. Hover ефект при наведенні на клітинку
```

**Запис у PROGRESS.md:** `[DONE] PHASE-3.3 — Головний ігровий екран: сітка Jeopardy — YYYY-MM-DD`

---

## PHASE-3.4 — Екран питання (QuestionScreen)

**Опис:** Fullscreen відображення питання та відповіді при виборі клітинки.

**Залежності:** PHASE-3.3

**Файли:**
- `frontend/src/components/game/QuestionScreen.tsx`
- `frontend/src/components/game/GameTimer.tsx`

**Підзадачі:**
- [ ] Створити `src/components/game/GameTimer.tsx`:
  - Props: `duration: number` (секунди), `onExpire: () => void`
  - Зворотний відлік від `duration` до 0
  - Візуальний прогрес-бар або кільцевий таймер
  - При досягненні 0 — викликає `onExpire`
  - Зупиняється і скидається при `revealAnswer`
- [ ] Створити `src/components/game/QuestionScreen.tsx`:
  - Fullscreen overlay поверх дошки
  - Стиль: темний фон, великий текст
  - Структура:
    1. Назва категорії + вартість (вгорі)
    2. Текст питання (по центру, великий)
    3. `GameTimer` (30 секунд за замовчуванням)
    4. Кнопка "Показати відповідь" → `revealAnswer()`
    5. Після reveal: відображається відповідь
    6. Кнопки нарахування балів (з'являються після reveal):
       - Для кожного гравця: кнопка "+{points}" (зелена) та "-{points}" (червона)
       - Кнопка "Пропустити питання" (без балів, позначити як використане)
- [ ] Підключити у `GamePage.tsx` — якщо `phase === 'question'`, показувати `QuestionScreen`

**Макет QuestionScreen:**
```
┌─────────────────────────────────────┐
│     ГЕОГРАФІЯ   •   $300            │
│                                     │
│   Найбільша країна у світі          │
│         за площею                   │
│                                     │
│         [▓▓▓▓▓▓░░░░]  20s          │
│                                     │
│      [Показати відповідь]           │
│                                     │
│ Після reveal:                       │
│   ВІДПОВІДЬ: Росія                  │
│                                     │
│  Іван: [+300] [-300]                │
│  Марія: [+300] [-300]               │
│  Петро: [+300] [-300]               │
│                                     │
│         [Пропустити]                │
└─────────────────────────────────────┘
```

**Критерій завершення:**
```
1. Натиснути на клітинку → відкривається QuestionScreen
2. Бачимо питання та таймер що відлічує
3. Натиснути "Показати відповідь" → з'являється відповідь та кнопки гравців
4. Натиснути "+300" для Іван → Іван отримує 300 балів, повернення до дошки
5. Натиснути "-300" → бали зменшуються
6. Клітинка позначена як використана
```

**Запис у PROGRESS.md:** `[DONE] PHASE-3.4 — Екран питання — YYYY-MM-DD`

---

## PHASE-3.5 — Scoreboard (таблиця балів)

**Опис:** Постійна таблиця балів гравців видима під час гри.

**Залежності:** PHASE-3.3

**Файли:**
- `frontend/src/components/game/Scoreboard.tsx`
- `frontend/src/components/game/PlayerCard.tsx`

**Підзадачі:**
- [ ] Створити `src/components/game/PlayerCard.tsx`:
  - Показує ім'я гравця та поточний рахунок
  - Виділяє гравця з найвищим рахунком (золота рамка)
  - Від'ємний рахунок показується червоним
  - Анімація при зміні рахунку (pulse або flash)
- [ ] Створити `src/components/game/Scoreboard.tsx`:
  - Список `PlayerCard` відсортований за рахунком (спадаючи)
  - Місця: 🥇 🥈 🥉
  - Показується збоку від дошки або внизу
- [ ] Інтегрувати в `GamePage.tsx`:
  - Layout: сітка ліворуч (основна частина) + Scoreboard праворуч (фіксована ширина)
  - При відкритому питанні Scoreboard залишається видимим

**Критерій завершення:**
```
1. На ігровому екрані бачимо таблицю балів
2. Після нарахування балів рахунок гравця оновлюється миттєво
3. Гравці відсортовані за рахунком
4. Гравець з найвищим рахунком виділений
```

**Запис у PROGRESS.md:** `[DONE] PHASE-3.5 — Scoreboard — YYYY-MM-DD`

---

## PHASE-3.6 — Відстеження використаних клітинок

**Опис:** Візуальне відображення використаних клітинок та автоматичне завершення гри.

**Залежності:** PHASE-3.4, PHASE-3.5

**Файли:**
- `frontend/src/components/game/BoardCell.tsx` — оновити стиль
- `frontend/src/pages/GamePage.tsx` — додати логіку завершення

**Підзадачі:**
- [ ] Оновити `BoardCell.tsx`:
  - `status === 'used'`: порожня клітинка, темний фон, без курсору pointer
  - `status === 'available'`: яскрава, з вартістю, cursor pointer, hover ефект
  - Плавний перехід між станами (CSS transition)
- [ ] У `GamePage.tsx` відстежувати `isGameFinishedAtom`:
  - Якщо всі клітинки використані — `phase` автоматично стає `'finished'`
  - Відображати `FinalScreen` замість `GameBoard`

**Критерій завершення:**
```
1. Після відповіді на питання клітинка темнішає/очищається
2. При вичерпанні всіх клітинок → автоматичний перехід до фінального екрану
```

**Запис у PROGRESS.md:** `[DONE] PHASE-3.6 — Відстеження використаних клітинок — YYYY-MM-DD`

---

## PHASE-3.7 — Фінальний екран (FinalScreen)

**Опис:** Екран завершення гри з підсумковим рейтингом учасників.

**Залежності:** PHASE-3.6

**Файли:**
- `frontend/src/components/game/FinalScreen.tsx`

**Підзадачі:**
- [ ] Створити `src/components/game/FinalScreen.tsx`:
  - Заголовок: "🎉 Гра завершена!"
  - Підзаголовок: назва квізу
  - Рейтинг учасників (1-е, 2-е, 3-є місця — виділені)
  - Таблиця всіх учасників з фінальними балами
  - Кнопка "Грати ще раз" → `resetGame()` → redirect на setup
  - Кнопка "На головну" → redirect на Dashboard
- [ ] Підключити у `GamePage.tsx` для фази `'finished'`

**Критерій завершення:**
```
1. Після завершення всіх питань → FinalScreen
2. Бачимо учасників відсортованих за балами
3. Кнопка "Грати ще раз" → повернення до setup зі скинутим станом
4. Кнопка "На головну" → Dashboard
```

**Запис у PROGRESS.md:** `[DONE] PHASE-3.7 — Фінальний екран — YYYY-MM-DD`

---

## PHASE-3.8 — Кнопка "Запустити гру" на Dashboard та QuizEditPage

**Опис:** Додати кнопки переходу до гри з Dashboard та з редактора квізу.

**Залежності:** PHASE-3.2

**Файли:**
- `frontend/src/components/quiz/QuizCard.tsx` — оновити
- `frontend/src/pages/QuizEditPage.tsx` — додати кнопку

**Підзадачі:**
- [ ] У `QuizCard.tsx` кнопка "Грати" веде на `/game/:id/setup`
- [ ] У `QuizEditPage.tsx` кнопка "Запустити гру" веде на `/game/:id/setup`
- [ ] Перевірити що квіз має мінімум 1 питання перед переходом до гри

**Критерій завершення:**
```
1. На Dashboard → "Грати" → GameSetupPage
2. В редакторі → "Запустити гру" → GameSetupPage
```

**Запис у PROGRESS.md:** `[DONE] PHASE-3.8 — Навігація до гри — YYYY-MM-DD`

---

## Підсумок PHASE-3

Після завершення всіх кроків фази 3:

| Компонент | Статус |
|-----------|--------|
| Jotai game atoms | ✅ |
| GameSetupPage (введення учасників) | ✅ |
| GameBoard (сітка Jeopardy) | ✅ |
| QuestionScreen (fullscreen питання) | ✅ |
| GameTimer | ✅ |
| Scoreboard (таблиця балів) | ✅ |
| Позначення використаних клітинок | ✅ |
| FinalScreen (фінальний рейтинг) | ✅ |
| Навігація до гри | ✅ |

**Наступна фаза:** `phases/PHASE-4.md`
