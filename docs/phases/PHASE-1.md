# PHASE-1 — Авторизація

> **Мета фази:** Реалізувати повний цикл авторизації: реєстрація, логін, JWT токени, захищені маршрути.
> **Орієнтовний час:** 3–4 години
> **Результат:** Користувач може зареєструватись, увійти, і його сесія зберігається між перезавантаженнями.

---

## PHASE-1.1 — User Mongoose схема та модуль

**Опис:** Створити Mongoose схему для User та NestJS модуль `UsersModule`.

**Залежності:** PHASE-0.6

**Файли:**
- `backend/src/users/schemas/user.schema.ts`
- `backend/src/users/users.service.ts`
- `backend/src/users/users.module.ts`

**Підзадачі:**
- [ ] Встановити bcrypt: `bun add bcrypt && bun add -d @types/bcrypt`
- [ ] Встановити class-validator: `bun add class-validator class-transformer`
- [ ] Створити `src/users/schemas/user.schema.ts`:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string

  @Prop({ required: true })
  passwordHash: string

  @Prop({ default: null })
  refreshTokenHash: string | null
}

export const UserSchema = SchemaFactory.createForClass(User)
```
- [ ] Створити `src/users/users.service.ts` з методами:
  - `findByEmail(email: string): Promise<UserDocument | null>`
  - `create(email: string, passwordHash: string): Promise<UserDocument>`
  - `updateRefreshToken(userId: string, hash: string | null): Promise<void>`
- [ ] Створити `src/users/users.module.ts` — додати MongooseModule та експортувати UsersService
- [ ] Підключити `UsersModule` до `AppModule`

**Критерій завершення:**
```bash
bun run start:dev
# Жодних помилок компіляції
# Mongoose не викидає помилок при старті
```

**Запис у PROGRESS.md:** `[DONE] PHASE-1.1 — User Mongoose схема та модуль — YYYY-MM-DD`

---

## PHASE-1.2 — JWT стратегії та Auth Guard

**Опис:** Налаштувати Passport JWT стратегії для access та refresh токенів.

**Залежності:** PHASE-1.1

**Файли:**
- `backend/src/common/strategies/jwt.strategy.ts`
- `backend/src/common/strategies/jwt-refresh.strategy.ts`
- `backend/src/common/guards/jwt-auth.guard.ts`
- `backend/src/common/guards/jwt-refresh.guard.ts`
- `backend/src/common/decorators/current-user.decorator.ts`

**Підзадачі:**
- [ ] Встановити passport:
  ```bash
  bun add @nestjs/passport @nestjs/jwt passport passport-jwt
  bun add -d @types/passport-jwt
  ```
- [ ] Створити `src/common/strategies/jwt.strategy.ts`:
```typescript
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    })
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email }
  }
}
```
- [ ] Створити `src/common/strategies/jwt-refresh.strategy.ts` — аналогічно, але використовує `ExtractJwt.fromAuthHeaderAsBearerToken()` та валідує через `JWT_REFRESH_SECRET`. Refresh токен передається через `Authorization: Bearer <refreshToken>` (не через body)
- [ ] Створити `src/common/guards/jwt-auth.guard.ts`:
```typescript
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```
- [ ] Створити `src/common/guards/jwt-refresh.guard.ts` — аналогічно з `'jwt-refresh'`
- [ ] Створити `src/common/decorators/current-user.decorator.ts`:
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)
```

**Критерій завершення:**
```bash
bun run start:dev
# Жодних помилок компіляції
```

**Запис у PROGRESS.md:** `[DONE] PHASE-1.2 — JWT стратегії та Auth Guard — YYYY-MM-DD`

---

## PHASE-1.3 — Auth модуль: реєстрація та логін

**Опис:** Реалізувати `AuthModule` з ендпоінтами реєстрації та логіну.

**Залежності:** PHASE-1.2

**Файли:**
- `backend/src/auth/dto/register.dto.ts`
- `backend/src/auth/dto/login.dto.ts`
- `backend/src/auth/types/jwt-payload.type.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.module.ts`

**Підзадачі:**
- [ ] Створити `src/auth/dto/register.dto.ts`:
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string
}
```
- [ ] Створити `src/auth/dto/login.dto.ts` — аналогічно RegisterDto
- [ ] Створити `src/auth/auth.service.ts` з методами:
  - `register(dto: RegisterDto)` — хешує пароль bcrypt, створює User, повертає токени
  - `login(dto: LoginDto)` — перевіряє email та пароль, повертає токени
  - `generateTokens(userId: string, email: string)` — генерує access + refresh токени
- [ ] Створити `src/auth/auth.controller.ts`:
  - `POST /auth/register` → `register(dto)`
  - `POST /auth/login` → `login(dto)`
- [ ] Створити `src/auth/auth.module.ts` — підключити JwtModule, PassportModule, UsersModule, стратегії
- [ ] Підключити `AuthModule` до `AppModule`

**Відповідь при успішному логіні/реєстрації:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "...",
    "email": "user@example.com"
  }
}
```

**Критерій завершення:**
```bash
# Реєстрація
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# Відповідь: {"accessToken":"...","refreshToken":"...","user":{...}}

# Логін
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# Відповідь: {"accessToken":"...","refreshToken":"...","user":{...}}
```

**Запис у PROGRESS.md:** `[DONE] PHASE-1.3 — Auth модуль: реєстрація та логін — YYYY-MM-DD`

---

## PHASE-1.4 — Refresh token та logout

**Опис:** Реалізувати оновлення access токену через refresh та logout.

**Залежності:** PHASE-1.3

**Файли:**
- `backend/src/auth/auth.service.ts` — додати `refresh()` та `logout()`
- `backend/src/auth/auth.controller.ts` — додати маршрути

**Підзадачі:**
- [ ] Додати до `auth.service.ts` метод `refresh(userId, refreshToken)`:
  - Знайти користувача по userId
  - Порівняти refreshToken з хешем у БД (bcrypt.compare)
  - Якщо валідний — згенерувати нові токени та оновити хеш у БД
- [ ] Додати метод `logout(userId)` — записати `null` у `refreshTokenHash`
- [ ] Додати до контролера:
  - `POST /auth/refresh` — захищений JwtRefreshGuard
  - `POST /auth/logout` — захищений JwtAuthGuard
- [ ] Оновити `src/api/client.ts` на фронтенді — додати логіку refresh у interceptor 401

**Критерій завершення:**
```bash
# Отримати токени
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}' | jq -r .refreshToken)

# Оновити через refresh (refresh token передається через Authorization header)
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer $TOKEN"
# Відповідь: нові токени
```

**Запис у PROGRESS.md:** `[DONE] PHASE-1.4 — Refresh token та logout — YYYY-MM-DD`

---

## PHASE-1.5 — Frontend: сторінки Login та Register

**Опис:** Створити сторінки авторизації з формами та підключити їх до API.

**Залежності:** PHASE-1.3, PHASE-0.4

**Файли:**
- `frontend/src/api/auth.api.ts`
- `frontend/src/types/auth.types.ts`
- `frontend/src/atoms/auth.atoms.ts`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/hooks/useAuth.ts`

**Підзадачі:**
- [ ] Створити `src/types/auth.types.ts`:
```typescript
export interface User {
  id: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
}
```
- [ ] Створити `src/api/auth.api.ts` з функціями `login()`, `register()`, `logout()`, `refreshToken()`
- [ ] Створити `src/atoms/auth.atoms.ts`:
```typescript
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { User } from '@/types/auth.types'

export const accessTokenAtom = atomWithStorage<string | null>('accessToken', null)
export const userAtom = atomWithStorage<User | null>('user', null)
export const isAuthenticatedAtom = atom((get) => !!get(accessTokenAtom))
```
- [ ] Створити `src/hooks/useAuth.ts` — хук з методами `login`, `register`, `logout`
- [ ] Створити `src/pages/LoginPage.tsx` — форма з email та password, shadcn Input та Button
- [ ] Створити `src/pages/RegisterPage.tsx` — аналогічно + підтвердження паролю
- [ ] Показувати помилки валідації та API помилки

**Критерій завершення:**
```
1. Відкрити http://localhost:5173/login
2. Ввести тестові дані та натиснути Login
3. Токен зберігається у localStorage
4. Форма реєстрації працює аналогічно
5. При невірному паролі — відображається помилка
```

**Запис у PROGRESS.md:** `[DONE] PHASE-1.5 — Frontend: сторінки Login та Register — YYYY-MM-DD`

---

## PHASE-1.6 — Frontend: роутер та захищені маршрути

**Опис:** Налаштувати React Router з захищеними маршрутами та базовий layout.

**Залежності:** PHASE-1.5

**Файли:**
- `frontend/src/router/index.tsx`
- `frontend/src/router/ProtectedRoute.tsx`
- `frontend/src/components/layout/AppLayout.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/pages/DashboardPage.tsx` — заглушка
- `frontend/src/App.tsx` — оновити

**Підзадачі:**
- [ ] Встановити React Router: `bun add react-router-dom`
- [ ] Створити `src/router/ProtectedRoute.tsx`:
```typescript
import { useAtomValue } from 'jotai'
import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticatedAtom } from '@/atoms/auth.atoms'

export function ProtectedRoute() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
```
- [ ] Створити `src/router/index.tsx` з маршрутами:
  - `/login` → LoginPage (публічний)
  - `/register` → RegisterPage (публічний)
  - `/` → ProtectedRoute → AppLayout → DashboardPage
  - `/quiz/:id/edit` → ProtectedRoute → AppLayout → QuizEditPage (заглушка)
  - `/game/:quizId/setup` → ProtectedRoute → GameSetupPage (заглушка)
  - `/game/:quizId/play` → ProtectedRoute → GamePage (заглушка)
  - `*` → NotFoundPage
- [ ] Створити `src/components/layout/Header.tsx` — назва додатку + кнопка Logout
- [ ] Створити `src/components/layout/AppLayout.tsx` — Header + `<Outlet />`
- [ ] Оновити `src/App.tsx` — підключити `RouterProvider`
- [ ] Створити `src/pages/DashboardPage.tsx` — заглушка "Dashboard — coming soon"
- [ ] Створити `src/pages/NotFoundPage.tsx` — сторінка 404

**Критерій завершення:**
```
1. http://localhost:5173/ — редиректить на /login (якщо не авторизований)
2. Після логіну — редиректить на /
3. Кнопка Logout очищає токен і редиректить на /login
4. Прямий перехід на /login якщо авторизований → редирект на /
```

**Запис у PROGRESS.md:** `[DONE] PHASE-1.6 — Frontend: роутер та захищені маршрути — YYYY-MM-DD`

---

## Підсумок PHASE-1

Після завершення всіх кроків фази 1:

| Компонент | Статус |
|-----------|--------|
| User схема (MongoDB) | ✅ |
| JWT стратегії (access + refresh) | ✅ |
| POST /auth/register | ✅ |
| POST /auth/login | ✅ |
| POST /auth/refresh | ✅ |
| POST /auth/logout | ✅ |
| Frontend Login/Register сторінки | ✅ |
| Jotai auth atoms | ✅ |
| React Router + ProtectedRoute | ✅ |
| AppLayout + Header | ✅ |

**Наступна фаза:** `phases/PHASE-2.md`
