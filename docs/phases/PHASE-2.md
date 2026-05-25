# PHASE-2 — Редактор квізів

> **Мета фази:** Реалізувати повний CRUD для квізів. Користувач може створювати квізи з категоріями та питаннями, редагувати та видаляти їх.
> **Орієнтовний час:** 5–7 годин
> **Результат:** Повноцінний редактор квізів у стилі сітки Jeopardy.

---

## PHASE-2.1 — Quiz Mongoose схема

**Опис:** Створити Mongoose схему для Quiz з вбудованими категоріями та питаннями.

**Залежності:** PHASE-1.1

**Файли:**
- `backend/src/quizzes/schemas/quiz.schema.ts`

**Підзадачі:**
- [ ] Створити `src/quizzes/schemas/quiz.schema.ts`:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

// --- Question (вбудований документ) ---
@Schema({ _id: true })
export class Question {
  @Prop({ required: true })
  text: string          // Текст питання

  @Prop({ required: true })
  answer: string        // Відповідь

  @Prop({ required: true, min: 1 })
  points: number        // Вартість (100, 200, 300, 400, 500)
}
export const QuestionSchema = SchemaFactory.createForClass(Question)

// --- Category (вбудований документ) ---
@Schema({ _id: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string          // Назва категорії

  @Prop({ type: [QuestionSchema], default: [] })
  questions: Question[] // Питання категорії (відсортовані за points)
}
export const CategorySchema = SchemaFactory.createForClass(Category)

// --- Quiz (кореневий документ) ---
export type QuizDocument = HydratedDocument<Quiz>

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true, trim: true })
  title: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId

  @Prop({ type: [CategorySchema], default: [] })
  categories: Category[]
}

export const QuizSchema = SchemaFactory.createForClass(Quiz)
```

**Структура даних (приклад):**
```json
{
  "_id": "...",
  "title": "Мій перший квіз",
  "authorId": "userId",
  "categories": [
    {
      "_id": "...",
      "name": "Географія",
      "questions": [
        { "_id": "...", "text": "Столиця України", "answer": "Київ", "points": 100 },
        { "_id": "...", "text": "Найвища гора", "answer": "Евересет", "points": 200 }
      ]
    }
  ]
}
```

**Критерій завершення:**
```bash
bun run start:dev
# Жодних помилок Mongoose при старті
```

**Запис у PROGRESS.md:** `[DONE] PHASE-2.1 — Quiz Mongoose схема — YYYY-MM-DD`

---

## PHASE-2.2 — Quiz CRUD backend

**Опис:** Реалізувати CRUD ендпоінти для квізів у NestJS.

**Залежності:** PHASE-2.1, PHASE-1.2

**Файли:**
- `backend/src/quizzes/dto/create-quiz.dto.ts`
- `backend/src/quizzes/dto/update-quiz.dto.ts`
- `backend/src/quizzes/quizzes.service.ts`
- `backend/src/quizzes/quizzes.controller.ts`
- `backend/src/quizzes/quizzes.module.ts`

**Підзадачі:**
- [ ] Створити `src/quizzes/dto/create-quiz.dto.ts`:
```typescript
import { Type } from 'class-transformer'
import { IsString, IsNumber, IsArray, ValidateNested, Min, ArrayMinSize } from 'class-validator'

export class CreateQuestionDto {
  @IsString() text: string
  @IsString() answer: string
  @IsNumber() @Min(1) points: number
}

export class CreateCategoryDto {
  @IsString() name: string
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[]
}

export class CreateQuizDto {
  @IsString() title: string
  
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryDto)
  categories: CreateCategoryDto[]
}
```
- [ ] Створити `src/quizzes/dto/update-quiz.dto.ts` — той самий DTO але всі поля optional (PartialType)
- [ ] Створити `src/quizzes/quizzes.service.ts` з методами:
  - `findAll(authorId: string)` — список квізів авторизованого користувача
  - `findOne(id: string, authorId: string)` — один квіз (тільки свій)
  - `create(dto: CreateQuizDto, authorId: string)` — створити квіз
  - `update(id: string, dto: UpdateQuizDto, authorId: string)` — оновити
  - `remove(id: string, authorId: string)` — видалити
- [ ] Створити `src/quizzes/quizzes.controller.ts`:
  - Всі маршрути захищені `@UseGuards(JwtAuthGuard)`
  - `GET /quizzes` — список квізів
  - `GET /quizzes/:id` — один квіз
  - `POST /quizzes` — створити
  - `PATCH /quizzes/:id` — оновити
  - `DELETE /quizzes/:id` — видалити
- [ ] Створити `src/quizzes/quizzes.module.ts` та підключити до `AppModule`

**Критерій завершення:**
```bash
# Отримати токен (логін)
TOKEN="..."

# Створити квіз
curl -X POST http://localhost:3000/quizzes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Тест квіз",
    "categories": [{
      "name": "Географія",
      "questions": [
        {"text": "Столиця України", "answer": "Київ", "points": 100}
      ]
    }]
  }'
# Відповідь: {"_id":"...","title":"Тест квіз",...}

# Отримати список
curl http://localhost:3000/quizzes -H "Authorization: Bearer $TOKEN"
# Відповідь: масив квізів
```

**Запис у PROGRESS.md:** `[DONE] PHASE-2.2 — Quiz CRUD backend — YYYY-MM-DD`

---

## PHASE-2.3 — Frontend: типи та API функції для квізів

**Опис:** Визначити TypeScript типи для квізів та створити API функції через TanStack Query.

**Залежності:** PHASE-2.2, PHASE-1.5

**Файли:**
- `frontend/src/types/quiz.types.ts`
- `frontend/src/api/quiz.api.ts`
- `frontend/src/hooks/useQuizzes.ts`

**Підзадачі:**
- [ ] Створити `src/types/quiz.types.ts`:
```typescript
export interface Question {
  _id: string
  text: string
  answer: string
  points: number
}

export interface Category {
  _id: string
  name: string
  questions: Question[]
}

export interface Quiz {
  _id: string
  title: string
  authorId: string
  categories: Category[]
  createdAt: string
  updatedAt: string
}

export interface CreateQuizDto {
  title: string
  categories: Omit<Category, '_id'>[]
}

export type UpdateQuizDto = Partial<CreateQuizDto>
```
- [ ] Створити `src/api/quiz.api.ts` з функціями:
  - `getQuizzes(): Promise<Quiz[]>`
  - `getQuiz(id: string): Promise<Quiz>`
  - `createQuiz(dto: CreateQuizDto): Promise<Quiz>`
  - `updateQuiz(id: string, dto: UpdateQuizDto): Promise<Quiz>`
  - `deleteQuiz(id: string): Promise<void>`
- [ ] Створити `src/hooks/useQuizzes.ts` з TanStack Query хуками:
  - `useQuizzes()` → `useQuery`
  - `useQuiz(id)` → `useQuery`
  - `useCreateQuiz()` → `useMutation`
  - `useUpdateQuiz()` → `useMutation`
  - `useDeleteQuiz()` → `useMutation`

**Критерій завершення:**
```bash
bun run dev
# Жодних TypeScript помилок
# TanStack Query DevTools показує запити при навігації
```

**Запис у PROGRESS.md:** `[DONE] PHASE-2.3 — Frontend: типи та API для квізів — YYYY-MM-DD`

---

## PHASE-2.4 — Frontend: Dashboard — список квізів

**Опис:** Реалізувати сторінку Dashboard з переліком квізів користувача.

**Залежності:** PHASE-2.3

**Файли:**
- `frontend/src/pages/DashboardPage.tsx` — замінити заглушку
- `frontend/src/components/quiz/QuizCard.tsx`
- `frontend/src/components/quiz/QuizList.tsx`

**Підзадачі:**
- [ ] Оновити `DashboardPage.tsx`:
  - Використовує `useQuizzes()` для отримання списку
  - Показує `QuizList` або стан завантаження
  - Кнопка "Створити новий квіз"
  - При кліку на кнопку — перехід до `/quiz/new/edit`
- [ ] Створити `QuizCard.tsx`:
  - Показує: назву квізу, кількість категорій, кількість питань, дата створення
  - Кнопки: "Редагувати", "Грати", "Видалити"
  - При видаленні — підтвердження через `window.confirm` або shadcn `AlertDialog`
- [ ] Створити `QuizList.tsx`:
  - Відображає масив `QuizCard`
  - Якщо список порожній — "У вас ще немає квізів. Створіть перший!"
- [ ] Додати маршрут `/quiz/new/edit` → `QuizEditPage` (заглушка)

**Критерій завершення:**
```
1. Відкрити http://localhost:5173/ після логіну
2. Бачимо список квізів (або повідомлення про їх відсутність)
3. Кнопка "Створити" веде на /quiz/new/edit
4. Кнопка "Видалити" видаляє квіз після підтвердження
5. Після видалення список оновлюється автоматично
```

**Запис у PROGRESS.md:** `[DONE] PHASE-2.4 — Frontend: Dashboard — список квізів — YYYY-MM-DD`

---

## PHASE-2.5 — Frontend: редактор квізу (сітка)

**Опис:** Реалізувати повноцінний редактор квізу у вигляді інтерактивної сітки категорій та питань.

**Залежності:** PHASE-2.4

**Файли:**
- `frontend/src/pages/QuizEditPage.tsx`
- `frontend/src/components/quiz/QuizEditor.tsx`
- `frontend/src/components/quiz/CategoryColumn.tsx`
- `frontend/src/components/quiz/QuestionCell.tsx`
- `frontend/src/components/quiz/QuestionModal.tsx`

**Підзадачі:**
- [ ] Створити `QuizEditPage.tsx`:
  - Якщо параметр `:id` === `"new"` — порожній квіз
  - Інакше — завантажити квіз через `useQuiz(id)`
  - Кнопки: "Зберегти", "Назад"
  - При збереженні — `createQuiz` або `updateQuiz`
- [ ] Створити `QuizEditor.tsx` — основний компонент:
  - Поле вводу назви квізу
  - Горизонтальна сітка колонок-категорій
  - Кнопка "+ Додати категорію"
  - Локальний стан редактора у `useState` (не Jotai — це не ігровий стан)
- [ ] Створити `CategoryColumn.tsx`:
  - Поле вводу назви категорії
  - Список клітинок питань для рівнів: 100, 200, 300, 400, 500
  - Кнопка видалення категорії
  - Кожна клітинка — `QuestionCell`
- [ ] Створити `QuestionCell.tsx`:
  - Показує вартість або "➕" якщо питання немає
  - При кліку — відкриває `QuestionModal`
  - Візуально різниця між заповненим і порожнім питанням
- [ ] Створити `QuestionModal.tsx` (shadcn `Dialog`):
  - Поля: "Питання" (textarea), "Відповідь" (textarea)
  - Вартість відображається але не редагується (фіксована)
  - Кнопки: "Зберегти", "Видалити питання", "Скасувати"
- [ ] Додати маршрут `/quiz/:id/edit` в роутер

**Логіка редактора (локальний стан):**
```typescript
// Структура локального стану редактора
interface EditorState {
  title: string
  categories: {
    _id?: string       // є якщо збережено
    name: string
    questions: {
      _id?: string
      text: string
      answer: string
      points: number
    }[]
  }[]
}
```

**Критерій завершення:**
```
1. Відкрити /quiz/new/edit — порожній редактор
2. Ввести назву квізу
3. Натиснути "+ Додати категорію" — з'являється колонка
4. Ввести назву категорії
5. Натиснути клітинку 100 — відкривається модалка
6. Заповнити питання та відповідь — зберегти
7. Клітинка позначається як заповнена
8. Натиснути "Зберегти" — квіз з'являється у Dashboard
9. Відкрити квіз на редагування — всі дані завантажені
```

**Запис у PROGRESS.md:** `[DONE] PHASE-2.5 — Frontend: редактор квізу (сітка) — YYYY-MM-DD`

---

## PHASE-2.6 — Валідація та обробка помилок редактора

**Опис:** Додати валідацію форми редактора та UX покращення.

**Залежності:** PHASE-2.5

**Файли:**
- `frontend/src/components/quiz/QuizEditor.tsx` — додати валідацію
- `frontend/src/pages/QuizEditPage.tsx` — обробка помилок збереження

**Підзадачі:**
- [ ] Валідація при натисканні "Зберегти":
  - Назва квізу не може бути порожньою
  - Мінімум 1 категорія
  - Кожна категорія має мати назву
  - Кожна категорія має мати мінімум 1 питання
  - Відображати конкретне повідомлення про помилку
- [ ] Підтвердження при виході з несохраненими змінами:
  - Відстежувати `isDirty` — чи були зміни після завантаження (порівняти початковий стан з поточним через `JSON.stringify`)
  - Використати `useBlocker` з `react-router-dom` для перехоплення навігації при `isDirty === true`
  - Показати shadcn `AlertDialog` з підтвердженням через `blocker.proceed()` / `blocker.reset()`
- [ ] Toast-повідомлення після збереження (shadcn `Toaster`)
- [ ] Стан завантаження кнопки "Зберегти" (спінер під час запиту)
- [ ] Обробка помилки 404 (квіз не знайдено) — редирект на Dashboard

**Критерій завершення:**
```
1. Спробувати зберегти порожній квіз — побачити помилку валідації
2. Зберегти квіз з питаннями — побачити toast "Збережено!"
3. Зробити зміни і спробувати вийти — побачити підтвердження
```

**Запис у PROGRESS.md:** `[DONE] PHASE-2.6 — Валідація та UX редактора — YYYY-MM-DD`

---

## Підсумок PHASE-2

Після завершення всіх кроків фази 2:

| Компонент | Статус |
|-----------|--------|
| Quiz Mongoose схема | ✅ |
| GET/POST/PATCH/DELETE /quizzes | ✅ |
| TanStack Query хуки | ✅ |
| Dashboard — список квізів | ✅ |
| Редактор квізу (сітка) | ✅ |
| Модалка питання | ✅ |
| Валідація | ✅ |

**Наступна фаза:** `phases/PHASE-3.md`
