# API Контракти — Довідник

> Повний список REST API ендпоінтів. Використовуй як довідник при реалізації backend та frontend.

---

## Базовий URL

```
http://localhost:3000
```

## Аутентифікація

Захищені ендпоінти потребують заголовку:
```
Authorization: Bearer <accessToken>
```

---

## Auth API

### POST /auth/register

Реєстрація нового користувача.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 201:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "email": "user@example.com"
  }
}
```

**Response 409 (email вже існує):**
```json
{
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

**Response 400 (невалідні дані):**
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than or equal to 8 characters"]
}
```

---

### POST /auth/login

Вхід існуючого користувача.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:** (аналогічно /auth/register)

**Response 401:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

### POST /auth/refresh

Оновлення access токену через refresh токен.

**Headers:** `Authorization: Bearer <refreshToken>`

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response 401:** Refresh токен невалідний або прострочений.

---

### POST /auth/logout

Вихід (інвалідація refresh токену).

**Headers:** `Authorization: Bearer <accessToken>`

**Response 200:**
```json
{ "message": "Logged out successfully" }
```

---

## Quizzes API

Всі ендпоінти потребують `Authorization: Bearer <accessToken>`.

---

### GET /quizzes

Список квізів авторизованого користувача.

**Response 200:**
```json
[
  {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
    "title": "Загальні знання 2026",
    "owner": "65f1a2b3c4d5e6f7a8b9c0d1",
    "categories": [ ... ],
    "createdAt": "2026-03-01T10:00:00.000Z",
    "updatedAt": "2026-03-01T12:30:00.000Z"
  }
]
```

---

### GET /quizzes/:id

Отримати один квіз по ID (тільки свій).

**Response 200:** Один об'єкт квізу (повна структура з категоріями та питаннями)

**Response 404:**
```json
{ "statusCode": 404, "message": "Quiz not found" }
```

**Response 403:**
```json
{ "statusCode": 403, "message": "Forbidden" }
```

---

### POST /quizzes

Створити новий квіз.

**Request:**
```json
{
  "title": "Мій новий квіз",
  "categories": [
    {
      "name": "Географія",
      "questions": [
        {
          "text": "Столиця Франції?",
          "answer": "Париж",
          "points": 100
        },
        {
          "text": "Найдовша річка Африки?",
          "answer": "Ніл",
          "points": 200
        }
      ]
    }
  ]
}
```

**Валідація:**
- `title` — обов'язкове, рядок, не порожній
- `categories` — масив, мінімум 1 елемент
- `categories[].name` — обов'язкове, рядок
- `categories[].questions` — масив (може бути порожнім при збереженні чернетки)
- `categories[].questions[].text` — обов'язкове
- `categories[].questions[].answer` — обов'язкове
- `categories[].questions[].points` — число > 0

**Response 201:** Створений об'єкт квізу

---

### PATCH /quizzes/:id

Оновити квіз (часткове оновлення).

**Request:** (всі поля опціональні)
```json
{
  "title": "Нова назва",
  "categories": [ ... ]
}
```

**Response 200:** Оновлений об'єкт квізу

**Response 404/403:** Аналогічно GET /quizzes/:id

---

### DELETE /quizzes/:id

Видалити квіз.

**Response 200:**
```json
{ "message": "Quiz deleted successfully" }
```

**Response 404/403:** Аналогічно GET /quizzes/:id

---

## Health Check

### GET /health

Перевірка що сервер працює (публічний ендпоінт).

**Response 200:**
```json
{ "status": "ok" }
```

---

## Коди помилок

| Код | Значення |
|-----|----------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (невалідні дані) |
| 401 | Unauthorized (відсутній або невалідний токен) |
| 403 | Forbidden (доступ до чужого ресурсу) |
| 404 | Not Found |
| 409 | Conflict (наприклад, email вже існує) |
| 500 | Internal Server Error |

---

## Frontend: API функції

```typescript
// src/api/auth.api.ts
export const login = (dto: LoginDto) =>
  apiClient.post<AuthResponse>('/auth/login', dto).then(r => r.data)

export const register = (dto: RegisterDto) =>
  apiClient.post<AuthResponse>('/auth/register', dto).then(r => r.data)

export const logout = () =>
  apiClient.post('/auth/logout').then(r => r.data)

export const refreshTokens = (refreshToken: string) =>
  apiClient.post<{ accessToken: string; refreshToken: string }>(
    '/auth/refresh',
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` } }
  ).then(r => r.data)

// src/api/quiz.api.ts
export const getQuizzes = () =>
  apiClient.get<Quiz[]>('/quizzes').then(r => r.data)

export const getQuiz = (id: string) =>
  apiClient.get<Quiz>(`/quizzes/${id}`).then(r => r.data)

export const createQuiz = (dto: CreateQuizDto) =>
  apiClient.post<Quiz>('/quizzes', dto).then(r => r.data)

export const updateQuiz = (id: string, dto: UpdateQuizDto) =>
  apiClient.patch<Quiz>(`/quizzes/${id}`, dto).then(r => r.data)

export const deleteQuiz = (id: string) =>
  apiClient.delete(`/quizzes/${id}`).then(r => r.data)
```
