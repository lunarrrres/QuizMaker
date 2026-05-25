# Mongoose схеми — Довідник

> Цей файл містить повні Mongoose схеми для всіх моделей проєкту.
> Використовуй як довідник при реалізації PHASE-1 та PHASE-2.

---

## User Schema

**Файл:** `backend/src/users/schemas/user.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ 
  timestamps: true,  // Автоматично додає createdAt та updatedAt
  collection: 'users' 
})
export class User {
  @Prop({ 
    required: true, 
    unique: true,
    lowercase: true,  // Зберігати email у нижньому регістрі
    trim: true        // Видаляти пробіли на початку/кінці
  })
  email: string

  @Prop({ required: true })
  passwordHash: string   // bcrypt hash, НІКОЛИ не зберігаємо сирий пароль

  @Prop({ 
    type: String,
    default: null 
  })
  refreshTokenHash: string | null  // bcrypt hash refresh токену, null після logout
}

export const UserSchema = SchemaFactory.createForClass(User)

// Примітка: окремий .index({ email: 1 }) є надлишковим — 
// unique: true вже автоматично створює індекс у MongoDB.
// Залишено явно для читабельності схеми.
UserSchema.index({ email: 1 })
```

**MongoDB документ (приклад):**
```json
{
  "_id": "ObjectId('65f1a2b3c4d5e6f7a8b9c0d1')",
  "email": "user@example.com",
  "passwordHash": "$2b$10$...",
  "refreshTokenHash": "$2b$10$...",
  "createdAt": "2026-03-01T10:00:00.000Z",
  "updatedAt": "2026-03-01T10:05:00.000Z"
}
```

---

## Quiz Schema (з вбудованими Category та Question)

**Файл:** `backend/src/quizzes/schemas/quiz.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

// ===== Question (вбудований документ) =====
@Schema({ _id: true })
export class Question {
  _id: Types.ObjectId  // Автоматично генерується

  @Prop({ 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  })
  text: string        // Текст питання

  @Prop({ 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 500
  })
  answer: string      // Правильна відповідь

  @Prop({ 
    required: true,
    min: 1,
    type: Number
  })
  points: number      // Вартість питання (100, 200, 300, 400, 500...)
}

export const QuestionSchema = SchemaFactory.createForClass(Question)

// ===== Category (вбудований документ) =====
@Schema({ _id: true })
export class Category {
  _id: Types.ObjectId  // Автоматично генерується

  @Prop({ 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  })
  name: string        // Назва категорії (наприклад: "Географія", "Кіно")

  @Prop({ 
    type: [QuestionSchema], 
    default: [] 
  })
  questions: Question[]  // Питання категорії
}

export const CategorySchema = SchemaFactory.createForClass(Category)

// ===== Quiz (кореневий документ) =====
export type QuizDocument = HydratedDocument<Quiz>

@Schema({ 
  timestamps: true,
  collection: 'quizzes'
})
export class Quiz {
  @Prop({ 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
  })
  title: string

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true         // Для швидкого пошуку квізів користувача
  })
  authorId: Types.ObjectId

  @Prop({ 
    type: [CategorySchema], 
    default: []
  })
  categories: Category[]
}

export const QuizSchema = SchemaFactory.createForClass(Quiz)

// Складений індекс: швидкий пошук квізів конкретного автора
QuizSchema.index({ authorId: 1, createdAt: -1 })
```

**MongoDB документ (приклад):**
```json
{
  "_id": "ObjectId('65f1a2b3c4d5e6f7a8b9c0d2')",
  "title": "Загальні знання 2026",
  "authorId": "ObjectId('65f1a2b3c4d5e6f7a8b9c0d1')",
  "categories": [
    {
      "_id": "ObjectId('65f1a2b3c4d5e6f7a8b9c0e1')",
      "name": "Географія",
      "questions": [
        {
          "_id": "ObjectId('65f1a2b3c4d5e6f7a8b9c0f1')",
          "text": "Яка столиця України?",
          "answer": "Київ",
          "points": 100
        },
        {
          "_id": "ObjectId('65f1a2b3c4d5e6f7a8b9c0f2')",
          "text": "Яке місто є найбільшим в Україні за площею?",
          "answer": "Харків (або Київ залежно від трактування)",
          "points": 200
        }
      ]
    },
    {
      "_id": "ObjectId('65f1a2b3c4d5e6f7a8b9c0e2')",
      "name": "Кіно",
      "questions": [
        {
          "_id": "ObjectId('65f1a2b3c4d5e6f7a8b9c0f3')",
          "text": "Хто режисер фільму 'Інтерстеллар'?",
          "answer": "Крістофер Нолан",
          "points": 100
        }
      ]
    }
  ],
  "createdAt": "2026-03-01T10:00:00.000Z",
  "updatedAt": "2026-03-01T12:30:00.000Z"
}
```

---

## Нотатки щодо схем

### Чому вбудовані документи, а не окремі колекції?

Quiz → Category → Question зберігаються як вбудовані документи (embedded) тому що:
1. Категорії та питання **завжди** завантажуються разом з квізом
2. Операції завжди виконуються в контексті одного квізу
3. Простіше обновлення (один `save()` замість кількох запитів)
4. Немає потреби в JOIN-подібних операціях

### Обмеження

- Документ MongoDB: максимум 16 MB
- Для QuizMaker це практично ніколи не буде проблемою
- Якщо квіз матиме 50 категорій × 10 питань — це ~200KB максимум

### Валідація на рівні DTO (NestJS)

Mongoose-схеми дають базову валідацію. Більш детальна — через class-validator у DTO:
- `CreateQuizDto` → перевіряє мінімум 1 категорія
- `CreateCategoryDto` → перевіряє мінімум 1 питання  
- `CreateQuestionDto` → перевіряє що `points > 0`
