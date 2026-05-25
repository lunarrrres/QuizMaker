# PHASE-4 — Полірування

> **Мета фази:** Додати анімації у стилі Jeopardy, покращити UX, обробити edge cases, провести фінальне тестування.
> **Орієнтовний час:** 3–4 години
> **Результат:** Готовий до демонстрації продукт з характерним стилем Jeopardy.

---

## PHASE-4.1 — Анімація відкриття питання (flip-ефект)

**Опис:** Додати характерну для Jeopardy анімацію "перекидання" клітинки при виборі питання.

**Залежності:** PHASE-3.4

**Файли:**
- `frontend/src/components/game/BoardCell.tsx` — додати анімацію
- `frontend/src/components/game/QuestionScreen.tsx` — додати анімацію появи
- `frontend/src/index.css` — CSS keyframes

**Підзадачі:**
- [ ] Додати CSS keyframes для flip-анімації у `src/index.css`:
```css
@keyframes flip-in {
  0% { transform: rotateY(90deg); opacity: 0; }
  100% { transform: rotateY(0deg); opacity: 1; }
}

@keyframes flip-out {
  0% { transform: rotateY(0deg); opacity: 1; }
  100% { transform: rotateY(-90deg); opacity: 0; }
}

@keyframes slide-up {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes pulse-score {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); color: #FFD700; }
}
```
- [ ] При кліку на `BoardCell` — короткий flip-out перед переходом до QuestionScreen
- [ ] QuestionScreen з'являється з анімацією (slide-up або zoom-in)
- [ ] Блок відповіді з'являється з анімацією після "Показати відповідь"
- [ ] Анімація `pulse-score` при зміні рахунку у `PlayerCard`

**Критерій завершення:**
```
1. Натиснути на клітинку → анімація flip
2. QuestionScreen плавно з'являється
3. Відповідь "відкривається" з анімацією
4. Рахунок гравця анімовано змінюється
```

**Запис у PROGRESS.md:** `[DONE] PHASE-4.1 — Анімації відкриття питання — YYYY-MM-DD`

---

## PHASE-4.2 — Jeopardy стиль: фінальний дизайн

**Опис:** Відполірувати дизайн ігрового екрану до вигляду справжньої дошки Jeopardy.

**Залежності:** PHASE-4.1

**Файли:**
- `frontend/src/components/game/GameBoard.tsx`
- `frontend/src/components/game/BoardCell.tsx`
- `frontend/src/components/game/QuestionScreen.tsx`
- `frontend/src/components/game/FinalScreen.tsx`
- `frontend/index.html` — додати шрифт

**Підзадачі:**
- [ ] Додати Google Font у `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;600;700&display=swap" rel="stylesheet">
```
- [ ] Палітра кольорів:
  - Дошка: `#060CE9` (Jeopardy синій)
  - Вартості: `#FFD700` (золотий)
  - Назви категорій: `#FFFFFF`
  - Використана клітинка: `#020880` (темніший синій)
  - Відповідь: `#FF6B00` (помаранчевий акцент)
- [ ] `BoardCell` — вартості шрифтом `Anton`, великий розмір
- [ ] Назви категорій — шрифт `Oswald`, верхній регістр, жирний
- [ ] `QuestionScreen` — темний фон з легким синюватим відтінком, текст питання великий і центрований
- [ ] `FinalScreen` — подіум для топ-3 (різна висота блоків 🥇🥈🥉)
- [ ] Scoreboard — тонкий, елегантний, не перекриває дошку

**Критерій завершення:**
```
Порівняти скріншот з реальними Jeopardy-дошками:
✅ Синій фон з золотим текстом
✅ Великі клітинки з вартостями
✅ Читабельні назви категорій
✅ Загальний відчуття "телевізійного шоу"
```

**Запис у PROGRESS.md:** `[DONE] PHASE-4.2 — Jeopardy дизайн — YYYY-MM-DD`

---

## PHASE-4.3 — Адаптивний дизайн (desktop-пріоритет)

**Опис:** Переконатись що ігровий екран коректно відображається на широкому десктопному екрані. Мобільна підтримка — базова.

**Залежності:** PHASE-4.2

**Файли:**
- `frontend/src/components/game/GameBoard.tsx`
- `frontend/src/pages/GamePage.tsx`
- `frontend/src/components/layout/AppLayout.tsx`

**Підзадачі:**
- [ ] Ігровий екран займає весь viewport (100vh × 100vw)
- [ ] Layout на GamePage: `grid-template-columns: 1fr 280px` (дошка + scoreboard)
- [ ] Клітинки масштабуються: `aspect-ratio: 16/9` або фіксована мінімальна висота
- [ ] Текст у клітинках адаптивний: `clamp(1rem, 2vw, 2rem)`
- [ ] На вузьких екранах (< 768px): Scoreboard приховується або переноситься вниз
- [ ] Редактор квізів: горизонтальний scroll якщо категорій більше ніж влазить

**Критерій завершення:**
```
Перевірити у Chrome DevTools:
✅ 1920×1080 — повний ігровий екран, все читається
✅ 1280×720 — трохи менше але функціональне
✅ 768px — Scoreboard переноситься, гра грається
```

**Запис у PROGRESS.md:** `[DONE] PHASE-4.3 — Адаптивний дизайн — YYYY-MM-DD`

---

## PHASE-4.4 — Обробка помилок та edge cases

**Опис:** Додати обробку граничних ситуацій та помилок по всьому застосунку.

**Залежності:** PHASE-4.3

**Файли:**
- `frontend/src/api/client.ts` — покращити interceptors
- `frontend/src/pages/GamePage.tsx` — guard для незапущеної гри
- `frontend/src/components/game/GameBoard.tsx` — guard для порожньої дошки
- `frontend/src/pages/QuizEditPage.tsx` — 404 обробка

**Підзадачі:**
- [ ] **GamePage guard:** якщо `gameState.phase === 'setup'` і немає учасників → redirect до `/game/:quizId/setup`
- [ ] **Порожній квіз у грі:** якщо квіз не має питань → показати повідомлення і кнопку "Редагувати квіз"
- [ ] **Мережеві помилки:** глобальний handler у TanStack Query — показувати toast при помилці
- [ ] **404 для квізу:** при редагуванні неіснуючого квізу → redirect на Dashboard з повідомленням
- [ ] **Від'ємний рахунок:** дозволити (деякі стратегії Jeopardy допускають мінус)
- [ ] **Рефреш сторінки під час гри:** стан Jotai скидається → redirect до setup (додати перевірку `quizId` в atoms)
- [ ] **Дублікати імен учасників:** заблокувати додавання гравця з існуючим іменем

**Критерій завершення:**
```
Перевірити всі сценарії:
✅ Рефреш під час гри → перехід на setup
✅ Прямий URL /game/xxx/play без setup → перехід на setup
✅ Мережева помилка → toast з повідомленням
✅ Видалення квізу що в грі → graceful handling
```

**Запис у PROGRESS.md:** `[DONE] PHASE-4.4 — Обробка помилок та edge cases — YYYY-MM-DD`

---

## PHASE-4.5 — Фінальне тестування повного flow

**Опис:** Провести наскрізне тестування всіх основних сценаріїв використання.

**Залежності:** PHASE-4.4

**Файли:** (без змін, тільки тестування)

**Сценарій 1 — Новий користувач:**
- [ ] Відкрити `http://localhost:5173`
- [ ] Перенаправлення на `/login`
- [ ] Перейти на `/register`
- [ ] Зареєструватись — перенаправлення на Dashboard
- [ ] Dashboard порожній — є кнопка "Створити квіз"

**Сценарій 2 — Створення квізу:**
- [ ] Натиснути "Створити квіз"
- [ ] Ввести назву квізу
- [ ] Додати 3 категорії з іменами
- [ ] Для кожної категорії заповнити питання на 100, 200, 300 балів
- [ ] Зберегти — повернення на Dashboard
- [ ] Квіз відображається у списку

**Сценарій 3 — Гра:**
- [ ] Натиснути "Грати" для щойно створеного квізу
- [ ] GameSetupPage — ввести 3 імені гравців
- [ ] Натиснути "Почати гру"
- [ ] GameBoard відображає сітку 3×3
- [ ] Натиснути на клітинку $200 → QuestionScreen
- [ ] Таймер відлічує
- [ ] Натиснути "Показати відповідь"
- [ ] Нарахувати +200 першому гравцю
- [ ] Повернення до дошки — клітинка затемнена
- [ ] Пройти всі питання
- [ ] FinalScreen з рейтингом

**Сценарій 4 — Редагування:**
- [ ] Повернутись на Dashboard
- [ ] Натиснути "Редагувати"
- [ ] Змінити назву квізу
- [ ] Зберегти
- [ ] Перевірити що зміни збережено

**Сценарій 5 — Авторизація:**
- [ ] Натиснути Logout
- [ ] Спробувати перейти на `/` — редирект на login
- [ ] Увійти знову — сесія відновлена

**Критерій завершення:**
```
Всі 5 сценаріїв пройдено без помилок у консолі
Жодних незакритих попереджень у Network tab
Жодних TypeScript помилок: bun run build (без помилок)
```

**Запис у PROGRESS.md:** `[DONE] PHASE-4.5 — Фінальне тестування — YYYY-MM-DD`

---

## PHASE-4.6 — Фінальне прибирання коду

**Опис:** Прибрати тимчасовий код, console.log, налаштувати збірку.

**Залежності:** PHASE-4.5

**Файли:** Всі файли проєкту

**Підзадачі:**
- [ ] Видалити всі `console.log` (крім навмисних попереджень)
- [ ] Перевірити `.env.example` файли актуальні
- [ ] Переконатись що `.gitignore` покриває `.env` файли
- [ ] `bun run build` у frontend — успішна збірка без помилок
- [ ] `bun run build` у backend — успішна компіляція TypeScript
- [ ] Перевірити що `docker-compose.yml` коректний: `docker compose config`
- [ ] Оновити `README.md` проєкту — інструкції з запуску:
  ```markdown
  ## Запуск

  1. `docker compose up -d`
  2. `cd backend && bun install && bun run start:dev`
  3. `cd frontend && bun install && bun run dev`
  4. Відкрити http://localhost:5173
  ```
- [ ] Фінальний git commit: `git commit -m "feat: complete QuizMaker implementation"`

**Критерій завершення:**
```bash
# Frontend збирається без помилок
cd frontend && bun run build
# > No TypeScript errors

# Backend компілюється без помилок
cd backend && bun run build
# > No TypeScript errors

# Docker конфіг валідний
docker compose config
# > No errors
```

**Запис у PROGRESS.md:** `[DONE] PHASE-4.6 — Фінальне прибирання коду — YYYY-MM-DD`

---

## Підсумок PHASE-4

Після завершення всіх кроків фази 4:

| Компонент | Статус |
|-----------|--------|
| Flip-анімація клітинок | ✅ |
| Jeopardy дизайн (кольори, шрифти) | ✅ |
| Адаптивний дизайн (desktop) | ✅ |
| Обробка edge cases | ✅ |
| Фінальне тестування | ✅ |
| Чистий код + build | ✅ |

---

## 🎉 Проєкт завершено!

Фінальний статус у `PROGRESS.md`:
```markdown
## Статус проєкту
- Поточна фаза: ЗАВЕРШЕНО
- Загальний прогрес: 32 / 32 кроків
```
