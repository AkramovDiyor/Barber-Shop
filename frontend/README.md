# Barber Shop - Full-Stack Web Application

Полнофункциональное веб-приложение для барбершопа с онлайн-записью, личным кабинетом клиента и административной панелью.

## 📋 Содержание

- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Установка и запуск](#установка-и-запуск)
- [API Endpoints](#api-endpoints)
- [Функциональность](#функциональность)

## 🛠 Технологии

### Backend
- **Node.js** + **Express** - REST API
- **PostgreSQL** - база данных
- **JWT** - аутентификация
- **bcryptjs** - хеширование паролей
- **express-validator** - валидация данных

### Frontend
- **React 18** + **Vite** - современный фронтенд
- **React Router** - навигация
- **Axios** - HTTP-клиент
- **CSS3** - стилизация (сохранение оригинального дизайна)

## 📁 Структура проекта

```
/workspace
├── backend/                 # Backend на Node.js
│   ├── src/
│   │   ├── config/         # Конфигурация БД
│   │   ├── controllers/    # Контроллеры
│   │   ├── middleware/     # Middleware (auth, validator)
│   │   ├── models/         # Модели данных
│   │   ├── routes/         # API маршруты
│   │   └── server.js       # Точка входа
│   └── package.json
│
├── frontend/               # Frontend на React
│   ├── src/
│   │   ├── components/     # Переиспользуемые компоненты
│   │   ├── context/        # React Context (Auth)
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API сервисы
│   │   ├── App.jsx         # Главный компонент
│   │   ├── App.css         # Стили (оригинальный дизайн)
│   │   └── main.jsx        # Точка входа
│   ├── public/             # Статические файлы
│   ├── index.html
│   └── package.json
│
├── img/                    # Изображения
└── README.md
```

## 🚀 Установка и запуск

### Предварительные требования
- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm или yarn

### 1. Настройка базы данных

```bash
# Создайте базу данных
createdb barbershop

# Импортируйте схему
psql -d barbershop -f backend/src/config/schema.sql
```

### 2. Настройка Backend

```bash
cd backend

# Установите зависимости
npm install

# Создайте файл .env
cp .env.example .env  # или создайте вручную

# Отредактируйте .env:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=barbershop
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key
# PORT=5000

# Запустите сервер разработки
npm run dev
```

### 3. Настройка Frontend

```bash
cd frontend

# Установите зависимости
npm install

# Запустите сервер разработки
npm run dev
```

Приложение будет доступно по адресу:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📡 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получение данных текущего пользователя
- `PUT /api/auth/profile` - Обновление профиля

### Услуги
- `GET /api/services` - Получить все услуги
- `GET /api/services/:id` - Получить услугу по ID
- `POST /api/services` - Создать услугу (Admin)
- `PUT /api/services/:id` - Обновить услугу (Admin)
- `DELETE /api/services/:id` - Удалить услугу (Admin)

### Барберы
- `GET /api/barbers` - Получить всех барберов
- `GET /api/barbers/:id` - Получить барбера по ID
- `GET /api/barbers/:id/schedule` - Получить расписание
- `GET /api/barbers/:id/availability` - Проверить доступность
- `POST /api/barbers` - Создать барбера (Admin)
- `PUT /api/barbers/:id` - Обновить барбера (Admin)

### Записи
- `POST /api/appointments` - Создать запись
- `GET /api/appointments/my` - Мои записи (Client)
- `GET /api/appointments/barber` - Записи барбера (Barber/Admin)
- `GET /api/appointments/:id` - Получить запись по ID
- `PUT /api/appointments/:id/status` - Обновить статус (Admin/Barber)
- `PUT /api/appointments/:id/cancel` - Отменить запись (Client)
- `PUT /api/appointments/:id/reschedule` - Перенести запись (Admin/Barber)

### Отзывы
- `POST /api/reviews` - Создать отзыв (Client)
- `GET /api/reviews/barber/:barberId` - Отзывы о барбере
- `GET /api/reviews` - Все отзывы (Admin)
- `PUT /api/reviews/:id/approve` - Одобрить/отклонить отзыв (Admin)
- `DELETE /api/reviews/:id` - Удалить отзыв (Admin)

### Админка
- `GET /api/admin/dashboard` - Статистика дашборда
- `GET /api/admin/appointments` - Все записи с фильтрами
- `GET /api/admin/users` - Все пользователи
- `PUT /api/admin/users/:id/status` - Заблокировать/разблокировать
- `GET /api/admin/export/appointments` - Экспорт в CSV

## ✨ Функциональность

### Клиентская часть
✅ Главная страница с hero-блоком, услугами, барберами, отзывами, контактами
✅ Каталог услуг с названием, описанием, ценой, длительностью
✅ Профили барберов с фото, именем, специализацией, рейтингом
✅ Онлайн-запись (пошаговая: услуга → барбер → дата/время → подтверждение)
✅ Проверка занятости барбера и предотвращение пересечений
✅ Личный кабинет клиента (регистрация/вход, история записей, отмена/перенос)
✅ Система отзывов и оценок (после визита, с модерацией)
✅ Адаптивная вёрстка (mobile-first)
✅ Сохранение оригинального стиля и дизайна

### Административная панель
✅ Дашборд со статистикой (записи, выручка, загрузка, топ-услуги)
✅ CRUD услуг
✅ CRUD барберов с расписанием и выходными
✅ Управление записями (просмотр, подтверждение, отмена, перенос)
✅ Управление клиентами (просмотр, блокировка, история)
✅ Модерация отзывов
✅ Экспорт данных в CSV
✅ Ролевая модель (admin, barber, client)

### Безопасность
✅ JWT аутентификация
✅ Хеширование паролей (bcrypt)
✅ Защита от XSS и SQL-инъекций
✅ Валидация данных на сервере и клиенте
✅ Ролевой доступ к API endpoints

## 👤 Учётные данные по умолчанию

### Admin
- Email: admin@barbershop.com
- Password: admin123

## 📝 Примечания

- Для работы уведомлений (email/Telegram) необходимо настроить соответствующие сервисы
- В production режиме используйте HTTPS и безопасное хранение секретов
- Рекомендуется настроить rate limiting и CORS для production

## 📄 License

MIT
