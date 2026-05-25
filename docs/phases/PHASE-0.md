# PHASE-0 — Підготовка середовища

> **Мета фази:** Налаштувати робоче середовище, підключити всі технології, перевірити що frontend і backend спілкуються між собою.
> **Орієнтовний час:** 2–3 години
> **Результат:** Повністю налаштований монорепозиторій, готовий до розробки функціоналу.

---

## PHASE-0.1 — Ініціалізація структури монорепо

**Опис:** Створити кореневу папку проєкту з базовими конфігураційними файлами та структурою директорій.

**Залежності:** —

**Файли:**
- `quizmaker/` — коренева директорія
- `quizmaker/.gitignore`
- `quizmaker/README.md` — короткий опис проєкту
- `quizmaker/docker-compose.yml` — MongoDB + mongo-express
- `quizmaker/PROGRESS.md` — журнал прогресу (копія шаблону)

**Підзадачі:**
- [ ] Створити директорію `quizmaker/`
- [ ] Ініціалізувати git: `git init`
- [ ] Створити `.gitignore` (node_modules, dist, .env, *.local)
- [ ] Створити `docker-compose.yml` зі службами `mongo` та `mongo-express`
- [ ] Створити `PROGRESS.md` з шаблону
- [ ] Зробити перший git commit: `git commit -m "chore: init monorepo"`

**Критерій завершення:**
```bash
ls quizmaker/
# має показати: .git .gitignore README.md docker-compose.yml PROGRESS.md
git log --oneline  # має показати перший commit
```

**Запис у PROGRESS.md:** `[DONE] PHASE-0.1 — Ініціалізація структури монорепо — YYYY-MM-DD`

---

## PHASE-0.2 — Налаштування frontend (Vite + React + TypeScript)

**Опис:** Ініціалізувати Vite-проєкт з React та TypeScript у директорії `frontend/`.

**Залежності:** PHASE-0.1

**Файли:**
- `frontend/` — директорія проєкту
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/tsconfig.app.json`
- `frontend/index.html`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/vite-env.d.ts`

**Підзадачі:**
- [ ] Виконати у корені: `bun create vite frontend -- --template react-ts`
- [ ] Перейти у `frontend/`: `cd frontend`
- [ ] Встановити залежності: `bun install`
- [ ] Перевірити запуск: `bun run dev` — має відкритись на `http://localhost:5173`
- [ ] Додати `frontend/.env` та `frontend/.env.example` зі змінною `VITE_API_URL=http://localhost:3000`
- [ ] Налаштувати `vite.config.ts` — додати proxy для `/api` → `http://localhost:3000`

**`vite.config.ts` (фінальний вміст):**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

**Критерій завершення:**
```bash
cd frontend && bun run dev
# Браузер відкриває http://localhost:5173 без помилок
# Заголовок сторінки: "Vite + React"
```

**Запис у PROGRESS.md:** `[DONE] PHASE-0.2 — Налаштування frontend (Vite + React + TS) — YYYY-MM-DD`

---

## PHASE-0.3 — Налаштування TailwindCSS та shadcn/ui

**Опис:** Підключити TailwindCSS та ініціалізувати shadcn/ui з базовими компонентами.

**Залежності:** PHASE-0.2

**Файли:**
- `frontend/tailwind.config.ts` — конфіг Tailwind
- `frontend/postcss.config.js`
- `frontend/src/index.css` — базові стилі + CSS змінні shadcn
- `frontend/components.json` — shadcn/ui конфіг
- `frontend/src/lib/utils.ts` — функція `cn()`
- `frontend/src/components/ui/` — shadcn компоненти (після ініціалізації)

**Підзадачі:**
- [ ] Встановити Tailwind: `bun add -d tailwindcss postcss autoprefixer`
- [ ] Ініціалізувати Tailwind: `bunx tailwindcss init -p`
- [ ] Налаштувати `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... решта shadcn кольорів
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```
- [ ] Встановити shadcn CLI та ініціалізувати: `bunx shadcn@latest init`
  - Style: Default
  - Base color: Slate
  - CSS variables: Yes
- [ ] Встановити базові компоненти:
  ```bash
  bunx shadcn@latest add button input card dialog badge label toast
  ```
- [ ] Встановити `tailwindcss-animate`: `bun add tailwindcss-animate`
- [ ] Перевірити що `src/lib/utils.ts` містить функцію `cn()`

**Критерій завершення:**
```bash
# У src/components/ui/ мають бути файли:
ls frontend/src/components/ui/
# button.tsx  card.tsx  dialog.tsx  input.tsx  badge.tsx  label.tsx  toast.tsx

# Запустити dev — жодних помилок компіляції
bun run dev
```

**Запис у PROGRESS.md:** `[DONE] PHASE-0.3 — Налаштування Tailwind та shadcn/ui — YYYY-MM-DD`

---

## PHASE-0.4 — Налаштування Jotai та TanStack Query

**Опис:** Встановити та підключити Jotai і TanStack Query у кореневому компоненті.

**Залежності:** PHASE-0.3

**Файли:**
- `frontend/src/main.tsx` — додати провайдери
- `frontend/src/App.tsx` — базовий компонент

**Підзадачі:**
- [ ] Встановити залежності:
  ```bash
  bun add jotai @tanstack/react-query @tanstack/react-query-devtools
  ```
- [ ] Оновити `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```
- [ ] Створити `src/atoms/` директорію з порожніми файлами `auth.atoms.ts` та `game.atoms.ts`
- [ ] Перевірити що проєкт компілюється без помилок

**Критерій завершення:**
```bash
bun run dev
# Відкрити DevTools — у правому нижньому куті має бути іконка TanStack Query
# Жодних помилок у консолі
```

**Запис у PROGRESS.md:** `[DONE] PHASE-0.4 — Налаштування Jotai та TanStack Query — YYYY-MM-DD`

---

## PHASE-0.5 — Налаштування backend (Bun + NestJS)

**Опис:** Ініціалізувати NestJS проєкт у директорії `backend/`, налаштувати базову конфігурацію.

**Залежності:** PHASE-0.1

**Файли:**
- `backend/` — директорія проєкту
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/.env`
- `backend/.env.example`

**Підзадачі:**
- [ ] У корені репозиторію: `bunx @nestjs/cli new backend --package-manager bun`
- [ ] Перейти у `backend/`: `cd backend`
- [ ] Встановити залежності для конфігурації:
  ```bash
  bun add @nestjs/config
  ```
- [ ] Створити `backend/.env` та `backend/.env.example`:
  ```env
  PORT=3000
  MONGODB_URI=mongodb://localhost:27017/quizmaker
  JWT_ACCESS_SECRET=super-secret-access-key-change-in-production
  JWT_REFRESH_SECRET=super-secret-refresh-key-change-in-production
  JWT_ACCESS_EXPIRES_IN=15m
  JWT_REFRESH_EXPIRES_IN=7d
  FRONTEND_URL=http://localhost:5173
  ```
- [ ] Оновити `src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`Backend running on http://localhost:${port}`)
}
bootstrap()
```
- [ ] Оновити `src/app.module.ts` — підключити ConfigModule:
```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
```
- [ ] Додати health-check endpoint у `app.module.ts` або окремий контролер:
  - `GET /health` → повертає `{ status: 'ok' }`
- [ ] Запустити: `bun run start:dev`

**Критерій завершення:**
```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

**Запис у PROGRESS.md:** `[DONE] PHASE-0.5 — Налаштування backend (Bun + NestJS) — YYYY-MM-DD`

---

## PHASE-0.6 — Підключення MongoDB через Docker

**Опис:** Запустити MongoDB у Docker, підключити Mongoose до NestJS.

**Залежності:** PHASE-0.5

**Файли:**
- `docker-compose.yml` — вже створений у PHASE-0.1
- `backend/src/app.module.ts` — додати MongooseModule

**Підзадачі:**
- [ ] Запустити MongoDB: `docker compose up -d mongo`
- [ ] Перевірити що контейнер запущено: `docker ps | grep mongo`
- [ ] Встановити Mongoose у backend:
  ```bash
  bun add @nestjs/mongoose mongoose
  ```
- [ ] Оновити `src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```
- [ ] Перезапустити backend та перевірити логи на відсутність помилок підключення

**Критерій завершення:**
```bash
# Лог backend НЕ містить помилок типу "MongoNetworkError"
# Лог містить: "Connected to MongoDB" або аналог
curl http://localhost:3000/health
# {"status":"ok"}
```

**Запис у PROGRESS.md:** `[DONE] PHASE-0.6 — Підключення MongoDB через Docker — YYYY-MM-DD`

---

## PHASE-0.7 — Налаштування axios та перевірка зв'язку frontend ↔ backend

**Опис:** Налаштувати axios клієнт на фронтенді та перевірити що запити доходять до backend.

**Залежності:** PHASE-0.4, PHASE-0.5

**Файли:**
- `frontend/src/api/client.ts` — axios instance

**Підзадачі:**
- [ ] Встановити axios: `bun add axios`
- [ ] Створити `src/api/client.ts`:
```typescript
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — додавати access token
// Примітка: токен читається з localStorage (ключ 'accessToken') — 
// це той самий ключ що використовує atomWithStorage у auth.atoms.ts.
// Прямий доступ до localStorage тут є свідомим рішенням: interceptor
// не є React-компонентом і не може використовувати useAtomValue.
// Якщо ключ зміниться в auth.atoms.ts — змінити і тут.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — обробка 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: refresh token logic (додамо у PHASE-1.4)
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```
- [ ] Тимчасово у `App.tsx` зробити тестовий запит до `/health` та вивести результат у консоль
- [ ] Перевірити що запит успішний
- [ ] Видалити тестовий код з `App.tsx`

**Критерій завершення:**
```
Frontend (localhost:5173) робить запит → Backend (localhost:3000/health)
Консоль браузера: {status: "ok"}
Жодних CORS помилок
```

**Запис у PROGRESS.md:** `[DONE] PHASE-0.7 — Перевірка зв'язку frontend ↔ backend — YYYY-MM-DD`

---

## Підсумок PHASE-0

Після завершення всіх кроків фази 0:

| Компонент | Статус |
|-----------|--------|
| Монорепо (git) | ✅ |
| Frontend (Vite + React + TS) | ✅ |
| TailwindCSS + shadcn/ui | ✅ |
| Jotai + TanStack Query | ✅ |
| Backend (Bun + NestJS) | ✅ |
| MongoDB (Docker) | ✅ |
| Axios клієнт | ✅ |
| Frontend ↔ Backend зв'язок | ✅ |

**Наступна фаза:** `phases/PHASE-1.md`
