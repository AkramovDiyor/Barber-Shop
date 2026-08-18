# Barbershop - Полноценное веб-приложение для барбершопа

## 🚀 Описание

Современное full-stack приложение для барбершопа с онлайн-записью, личным кабинетом клиента и административной панелью.

### Стек технологий:
- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Хранение данных**: In-memory (для демонстрации, легко заменяется на PostgreSQL)
- **Аутентификация**: JWT токены
- **Стили**: CSS3 с переменными

## 📋 Функциональность

### Клиентская часть:
- ✅ Главная страница с hero-блоком, услугами, барберами, отзывами
- ✅ Онлайн-запись в 4 шага (услуга → барбер → дата/время → подтверждение)
- ✅ Проверка доступности времени барбера
- ✅ Личный кабинет с историей записей
- ✅ Регистрация и вход
- ✅ Профили барберов с расписанием и отзывами
- ✅ Адаптивная верстка (mobile-first)

### Административная панель:
- ✅ Дашборд со статистикой (записи, выручка, загрузка барберов)
- ✅ Управление записями (просмотр, подтверждение, отмена)
- ✅ Экспорт данных в CSV
- ✅ Статистика по барберам и услугам
- ✅ Ролевая модель (admin, client, barber)

## 🛠 Установка и запуск

### Требования:
- Node.js >= 16.x
- npm или yarn

### 1. Клонирование репозитория
```bash
cd /workspace
```

### 2. Установка зависимостей бэкенда
```bash
cd backend
npm install
```

### 3. Запуск бэкенда
```bash
# В режиме разработки
npm run dev

# Или в production режиме
npm start
```

Бэкенд запустится на `http://localhost:5000`

### 4. Установка зависимостей фронтенда (в новом терминале)
```bash
cd frontend
npm install
```

### 5. Запуск фронтенда
```bash
npm run dev
```

Фронтенд запустится на `http://localhost:3000`

## 🔐 Тестовые учетные записи

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@barbershop.com | admin123 |
| Клиент | user@example.com | user123 |

## 📁 Структура проекта

```
/workspace
├── backend/
│   ├── src/
│   │   ├── data/           # In-memory хранилище
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API маршруты
│   │   └── server.js       # Точка входа
│   ├── .env                # Переменные окружения
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # UI компоненты
    │   ├── context/        # React Context (Auth)
    │   ├── pages/          # Страницы приложения
    │   ├── services/       # API сервисы
    │   ├── App.jsx         # Главный компонент
    │   ├── main.jsx        # Точка входа
    │   └── index.css       # Глобальные стили
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🌐 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущий профиль
- `PUT /api/auth/me` - Обновить профиль

### Услуги
- `GET /api/services` - Список услуг
- `GET /api/services/:id` - Детали услуги
- `POST /api/services` - Создать услугу (admin)
- `PUT /api/services/:id` - Обновить услугу (admin)
- `DELETE /api/services/:id` - Удалить услугу (admin)

### Барберы
- `GET /api/barbers` - Список барберов
- `GET /api/barbers/:id` - Профиль барбера с отзывами
- `POST /api/barbers` - Создать барбера (admin)
- `PUT /api/barbers/:id` - Обновить барбера (admin)
- `DELETE /api/barbers/:id` - Удалить барбера (admin)

### Записи
- `GET /api/appointments` - Все записи (admin)
- `GET /api/appointments/my` - Мои записи (client)
- `POST /api/appointments/check-availability` - Проверить доступность
- `POST /api/appointments` - Создать запись
- `PATCH /api/appointments/:id/status` - Изменить статус (admin)
- `DELETE /api/appointments/:id` - Отменить запись

### Отзывы
- `GET /api/reviews` - Список отзывов
- `GET /api/reviews/barber/:barberId` - Отзывы о барбере
- `POST /api/reviews` - Создать отзыв
- `PATCH /api/reviews/:id/status` - Модерация отзыва (admin)
- `DELETE /api/reviews/:id` - Удалить отзыв (admin)

### Админка
- `GET /api/admin/dashboard` - Статистика дашборда
- `GET /api/admin/export/appointments` - Экспорт записей (CSV)
- `GET /api/admin/export/users` - Экспорт пользователей (CSV)
- `GET /api/admin/users` - Список пользователей (admin)
- `PATCH /api/admin/users/:id` - Обновить пользователя (admin)

## 🔧 Конфигурация

### Переменные окружения (backend/.env)
```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## 📝 Примечания

1. **Хранение данных**: В текущей версии используется in-memory хранилище. Данные сбрасываются при перезапуске сервера. Для production рекомендуется подключить PostgreSQL.

2. **Миграция на PostgreSQL**: Для подключения базы данных:
   - Установите пакет: `npm install pg pg-hstore`
   - Создайте файл подключения к БД
   - Замените методы store.js на SQL запросы

3. **Уведомления**: Для отправки email/Telegram уведомлений можно добавить интеграцию с nodemailer или Telegram Bot API.

4. **Безопасность**: 
   - Пароли хешируются с bcrypt
   - JWT токены используются для аутентификации
   - Валидация данных на сервере
   - Защита от CORS настроена

## 🎨 Дизайн

Приложение использует современную цветовую схему:
- Основной цвет: #c9a55c (золотой)
- Вторичный цвет: #1a1a1a (темный)
- Адаптивная верстка для мобильных устройств

## 📄 Лицензия

MIT License
