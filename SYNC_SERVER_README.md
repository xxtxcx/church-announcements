# Сервер синхронізації для OBS Helper

## Опис

Простий HTTP сервер для синхронізації стану між браузером (з панеллю управління) та OBS Browser Source.

## Запуск

В окремому терміналі запустіть:

```bash
npm run sync-server
```

Або напряму:

```bash
node sync-server.js
```

Сервер запуститься на `http://localhost:3001`

## Як це працює

1. **Браузер** (з `?control=true`) відправляє команди через POST запит на `/api/sync`
2. **OBS Browser Source** опитує сервер через GET запит на `/api/sync?since=timestamp` кожні 100мс
3. Сервер зберігає останню команду в пам'яті і повертає її, якщо вона новіша за `since`

## API

### POST /api/sync
Відправка команди на сервер

**Body:**
```json
{
  "type": "SHOW_HOST_NAME",
  "data": { "name": "Ім'я Прізвище" },
  "timestamp": 1234567890
}
```

### GET /api/sync?since=timestamp
Отримання команди з сервера

**Response:**
```json
{
  "command": {
    "type": "SHOW_HOST_NAME",
    "data": { "name": "Ім'я Прізвище" },
    "timestamp": 1234567890
  },
  "timestamp": 1234567890
}
```

## Примітки

- Сервер зберігає стан тільки в пам'яті (при перезапуску втрачається)
- Для production можна використати Redis або інше сховище
- Якщо сервер недоступний, додаток автоматично використовує localStorage як fallback
