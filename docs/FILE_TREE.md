# QuizMaker — Повне дерево файлів проєкту

> Цей файл описує **фінальну** структуру репозиторію після завершення всіх фаз.
> Використовуй як орієнтир при створенні файлів.

---

```
quizmaker/
├── README.md
├── PROGRESS.md
├── docker-compose.yml              # MongoDB + mongo-express
├── .gitignore
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── components.json             # shadcn/ui конфіг
│   ├── index.html
│   ├── .env
│   ├── .env.example
│   │
│   └── src/
│       ├── main.tsx                # Entry point, QueryClient, Jotai Provider
│       ├── App.tsx                 # Router + layout
│       ├── vite-env.d.ts
│       │
│       ├── api/
│       │   ├── client.ts           # axios instance з interceptors
│       │   ├── auth.api.ts         # login, register, refresh
│       │   └── quiz.api.ts         # CRUD квізів
│       │
│       ├── atoms/
│       │   ├── auth.atoms.ts       # currentUser, accessToken
│       │   └── game.atoms.ts       # gameState, players, currentQuestion
│       │
│       ├── components/
│       │   ├── ui/                 # shadcn/ui компоненти (auto-generated)
│       │   │   ├── button.tsx
│       │   │   ├── input.tsx
│       │   │   ├── card.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── badge.tsx
│       │   │   └── ...
│       │   │
│       │   ├── layout/
│       │   │   ├── AppLayout.tsx   # Header + Outlet
│       │   │   └── Header.tsx      # Навігація, logout
│       │   │
│       │   ├── auth/
│       │   │   ├── LoginForm.tsx
│       │   │   └── RegisterForm.tsx
│       │   │
│       │   ├── quiz/
│       │   │   ├── QuizCard.tsx          # Картка квізу у списку
│       │   │   ├── QuizList.tsx          # Список квізів
│       │   │   ├── QuizEditor.tsx        # Головний редактор
│       │   │   ├── CategoryColumn.tsx    # Колонка категорії в редакторі
│       │   │   ├── QuestionCell.tsx      # Клітинка питання в редакторі
│       │   │   └── QuestionModal.tsx     # Модалка редагування питання
│       │   │
│       │   └── game/
│       │       ├── GameBoard.tsx         # Сітка Jeopardy
│       │       ├── BoardCell.tsx         # Клітинка сітки (вартість / відкрита)
│       │       ├── QuestionScreen.tsx    # Fullscreen питання
│       │       ├── Scoreboard.tsx        # Таблиця балів
│       │       ├── PlayerCard.tsx        # Картка гравця з балами
│       │       ├── GameTimer.tsx         # Таймер
│       │       └── FinalScreen.tsx       # Екран завершення
│       │
│       ├── hooks/
│       │   ├── useAuth.ts          # хук авторизації
│       │   ├── useQuizzes.ts       # TanStack Query хуки для квізів
│       │   └── useGame.ts          # хук управління ігровим станом
│       │
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx   # Список квізів
│       │   ├── QuizEditPage.tsx    # Редактор квізу
│       │   ├── GameSetupPage.tsx   # Введення учасників
│       │   ├── GamePage.tsx        # Активна гра
│       │   └── NotFoundPage.tsx
│       │
│       ├── router/
│       │   ├── index.tsx           # createBrowserRouter
│       │   └── ProtectedRoute.tsx  # Захищений маршрут
│       │
│       ├── types/
│       │   ├── auth.types.ts
│       │   ├── quiz.types.ts
│       │   └── game.types.ts
│       │
│       └── lib/
│           └── utils.ts            # cn() та інші утиліти
│
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env
    ├── .env.example
    │
    └── src/
        ├── main.ts                 # Bootstrap, CORS, порт
        ├── app.module.ts           # Кореневий модуль
        ├── health.controller.ts    # GET /health
        │
        ├── common/
        │   ├── decorators/
        │   │   └── current-user.decorator.ts
        │   ├── guards/
        │   │   ├── jwt-auth.guard.ts
        │   │   └── jwt-refresh.guard.ts
        │   └── strategies/
        │       ├── jwt.strategy.ts
        │       └── jwt-refresh.strategy.ts
        │
        ├── auth/
        │   ├── auth.module.ts
        │   ├── auth.controller.ts  # POST /auth/register, /auth/login, /auth/refresh, /auth/logout
        │   ├── auth.service.ts
        │   ├── dto/
        │   │   ├── register.dto.ts
        │   │   └── login.dto.ts
        │   └── types/
        │       └── jwt-payload.type.ts
        │
        ├── users/
        │   ├── users.module.ts
        │   ├── users.service.ts
        │   └── schemas/
        │       └── user.schema.ts  # Mongoose User schema
        │
        └── quizzes/
            ├── quizzes.module.ts
            ├── quizzes.controller.ts  # CRUD /quizzes
            ├── quizzes.service.ts
            ├── dto/
            │   ├── create-quiz.dto.ts
            │   ├── update-quiz.dto.ts
            │   └── create-question.dto.ts
            └── schemas/
                └── quiz.schema.ts  # Quiz + Category + Question (embedded)
```

---

## Файли конфігурації

### `docker-compose.yml`
```yaml
services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: quizmaker

  mongo-express:
    image: mongo-express
    ports:
      - "8081:8081"
    depends_on:
      - mongo
    environment:
      ME_CONFIG_MONGODB_URL: mongodb://mongo:27017/

volumes:
  mongo_data:
```

### `backend/.env.example`
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/quizmaker
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env.example`
```env
VITE_API_URL=http://localhost:3000
```
