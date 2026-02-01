# Деплой на Vercel

## Крок 1: Підготовка проекту

1. Переконайтеся, що всі зміни закомічені в git:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
```

2. Створіть репозиторій на GitHub (якщо ще не створено):
```bash
git remote add origin https://github.com/your-username/church-announcements.git
git push -u origin main
```

## Крок 2: Деплой на Vercel

### Варіант 1: Через веб-інтерфейс Vercel

1. Перейдіть на [vercel.com](https://vercel.com)
2. Увійдіть через GitHub
3. Натисніть "Add New Project"
4. Імпортуйте ваш репозиторій `church-announcements`
5. Налаштування:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (залиште порожнім)
   - **Build Command**: `npm run build` (за замовчуванням)
   - **Output Directory**: `build` (за замовчуванням)
6. Натисніть "Deploy"

### Варіант 2: Через Vercel CLI

1. Встановіть Vercel CLI:
```bash
npm install -g vercel
```

2. Увійдіть в Vercel:
```bash
vercel login
```

3. Деплой:
```bash
vercel
```

4. Для production деплою:
```bash
vercel --prod
```

## Крок 3: Налаштування змінних середовища (опціонально)

Якщо потрібно налаштувати щось специфічне, можна додати змінні середовища в Vercel Dashboard:
- Settings → Environment Variables

## Крок 4: Використання після деплою

Після успішного деплою ви отримаєте URL типу: `https://your-project.vercel.app`

### В браузері (для управління):
```
https://your-project.vercel.app/obs-helper
```

### В OBS Browser Source (щоб приховати панелі):
```
https://your-project.vercel.app/obs-helper?control=false
```

## Важливі примітки

1. **Serverless Functions**: API endpoints (`/api/sync` та `/api/settings`) працюють як Vercel Serverless Functions
2. **Статус зберігається в пам'яті**: При кожному cold start стан буде скидатися. Для production можна використати Vercel KV або Redis
3. **CORS**: Вже налаштовано для роботи з будь-яких доменів
4. **Роутинг**: Vercel автоматично обробляє React Router через `vercel.json`

## Покращення для production

Для збереження стану між cold starts можна використати:

1. **Vercel KV** (рекомендовано):
   - Додайте Vercel KV в проект
   - Оновіть `/api/sync.js` та `/api/settings.js` для використання KV

2. **Або зовнішній сервіс**:
   - Використайте окремий сервер для синхронізації
   - Оновіть URL в компонентах

## Troubleshooting

Якщо щось не працює:
1. Перевірте логи в Vercel Dashboard → Deployments → [ваш деплой] → Functions
2. Перевірте, чи правильно працюють API endpoints: `https://your-project.vercel.app/api/sync`
3. Перевірте консоль браузера на помилки
