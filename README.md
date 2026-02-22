# Конвертер валют (Currency Converter)

Техническая документация проекта веб-приложения для конвертации валют и отображения курсов.

---

## Содержание

1. [Общее описание](#1-общее-описание)
2. [Архитектура системы](#2-архитектура-системы)
3. [Установка и запуск](#3-установка-и-запуск)
4. [API документация](#4-api-документация)
5. [Frontend](#6-frontend)
6. [Тестирование](#7-тестирование)

---

## 1. Общее описание

### 1.1 Назначение

Веб-приложение для:
- Конвертации валют (USD, EUR, GBP ↔ RUB)
- Отображения текущих курсов валют
- Построения графиков динамики курсов
- Управления пользовательскими настройками

### 1.2 Технологический стек

| Компонент | Технология |
|-----------|------------|
| Backend | Django 4.x, Django REST Framework |
| Database | PostgreSQL 15 |
| Frontend | HTML5, CSS3, JavaScript |
| Parser | Python (BeautifulSoup4, requests) |
| Testing | Django Tests, Jest |

### 1.3 Структура проекта

```
valutarabochaa/
├── Dockerfile                 # Docker-образ приложения
├── docker-compose.yml         # Оркестрация контейнеров
├── requirements.txt           # Python-зависимости
├── package.json               # npm-зависимости (Jest)
├── parser.py                  # Парсер курсов с сайта
├── currency_project/          # Django-проект
│   ├── manage.py              # Управляющий скрипт Django
│   ├── currency_project/      # Настройки проекта
│   │   ├── settings.py        # Конфигурация Django
│   │   ├── urls.py            # Главные URL-маршруты
│   │   ├── views.py           # Главная страница
│   │   ├── templates/         # HTML-шаблоны
│   │   │   └── index.html
│   │   └── static/            # Статические файлы
│   │       ├── script.js      # Клиентский JavaScript
│   │       ├── script.test.js # Тесты JavaScript
│   │       └── style.css      # Стили CSS
│   ├── accounts/              # Приложение пользователей
│   │   ├── models.py          # Модель CustomUser
│   │   ├── views.py           # API аккаунтов
│   │   ├── serializers.py     # Сериализаторы
│   │   ├── urls.py            # URL-маршруты
│   │   └── tests.py           # Тесты
│   └── rates/                 # Приложение курсов
│       ├── models.py          # Модель Rate
│       ├── views.py           # API курсов
│       ├── urls.py            # URL-маршруты
│       └── tests.py           # Тесты
```

---

## 2. Архитектура системы

### 2.1 Общее описание

Система построена по классической трёхуровневой архитектуре клиент-серверного веб-приложения.

**Уровень представления (Frontend):**
- Веб-браузер пользователя
- HTML-страница с интерфейсом конвертера валют
- JavaScript-логика для взаимодействия с сервером

**Уровень бизнес-логики (Backend):**
- Django-сервер на порту 8000
- REST API для работы с курсами валют и пользователями
- Обрабатывает запросы от браузера и парсера

**Уровень данных (Database):**
- PostgreSQL на порту 5432
- Хранит курсы валют и профили пользователей
- Управляется через Django ORM

### 2.2 Компоненты системы

**Клиентская часть (Browser):**
- Конвертер валют
- Таблица курсов
- График курсов
- Формы входа, регистрации, профиля
- Светлая/тёмная тема

**Серверная часть (Django):**
- **rates/** — приложение для работы с курсами валют
  - Модель Rate (хранение курсов)
  - API endpoint /api/rates/ (получение курсов по дате)
- **accounts/** — приложение для работы с пользователями
  - Модель CustomUser (профиль с настройками)
  - API endpoints: /api/login/, /api/logout/, /api/register/, /api/profile/

**База данных (PostgreSQL):**
- Таблица rates — курсы валют (валюта, курс сегодня, курс завтра, изменение, дата)
- Таблица accounts_customuser — пользователи (username, password, валюта по умолчанию, тема)

**Парсер (parser.py):**
- Отдельный Python-скрипт
- Запрашивает страницы сайта ru.myfin.by
- Извлекает курсы валют из HTML
- Сохраняет в базу данных PostgreSQL

### 2.3 Поток данных

**Загрузка курсов в БД:**
1. Парсер формирует URL с нужной датой
2. Выполняет HTTP GET-запрос к сайту-источнику
3. Извлекает данные из HTML-таблицы
4. Подключается к PostgreSQL
5. Выполняет INSERT в таблицу rates

**Отображение в браузере:**
1. Пользователь открывает страницу
2. JavaScript отправляет GET-запрос на /api/rates/?date=YYYY-MM-DD
3. Django ORM выполняет SELECT из таблицы rates
4. Django возвращает JSON с курсами
5. JavaScript отображает данные в таблице и конвертере

**Аутентификация:**
1. Пользователь вводит логин/пароль
2. JavaScript отправляет POST-запрос на /api/login/
3. Django проверяет credentials через auth.authenticate()
4. При успехе создаётся сессия (cookie)
5. Последующие запросы содержат sessionid

### 2.4 Взаимодействие компонентов

**Между браузером и Django:**
- Протокол: HTTP
- Формат данных: JSON
- Методы: GET (чтение), POST (создание/действие), PATCH (обновление)
- Аутентификация: Session-based (cookies)

**Между Django и PostgreSQL:**
- Протокол: PostgreSQL wire protocol
- Порт: 5432
- Доступ: через Django ORM (абстракция над SQL)

**Между парсером и PostgreSQL:**
- Протокол: PostgreSQL wire protocol
- Доступ: через psycopg2 (прямой SQL)

**Между парсером и источником данных:**
- Протокол: HTTPS
- Формат данных: HTML
- Парсинг: BeautifulSoup4

---

## 3. Установка и запуск

### 3.1 Запуск через Docker Compose

```bash

# Сборка и запуск контейнеров
docker-compose up -d --build

# Остановка
docker-compose down
```

### 3.2 Локальная разработка без Docker

```bash
# Создание виртуального окружения
python -m venv venv
venv\Scripts\activate     # Windows

# Установка зависимостей
pip install -r requirements.txt

# Настройка БД (изменить в settings.py):
# 'HOST': '127.0.0.1' вместо 'postgres'

# Миграции
cd currency_project
python manage.py migrate

# Создание суперпользователя
python manage.py createsuperuser

# Запуск сервера
python manage.py runserver
```

### 3.3 Запуск парсера

```bash
python parser.py
```

---

## 4. API документация

### 4.1 Эндпоинты

| Метод | Эндпоинт         | Описание                 | Аутентификация |
|-------|------------------|--------------------------|----------------|
| GET   | /api/rates/      | Получить курсы на дату   | Нет            |
| POST  | /api/login/      | Вход в систему           | Нет            |
| POST  | /api/logout/     | Выход из системы         | Да             |
| POST  | /api/register/   | Регистрация              | Нет            |
| GET   | /api/profile/    | Получить профиль         | Да             |
| PATCH | /api/profile/    | Обновить профиль         | Да             |

### 4.2 GET /api/rates/

Получение курсов валют на указанную дату.

**Параметры запроса:**
```
date (optional): Дата в формате YYYY-MM-DD
```

**Пример запроса:**
```http
GET /api/rates/?date=2026-02-22
```

**Ответ 200 OK:**
```json
{
    "ДОЛЛАР": 95.5,
    "ДОЛЛАР_delta": 0.25,
    "ЕВРО": 102.3,
    "ЕВРО_delta": -0.15,
    "ФУНТ": 119.8,
    "ФУНТ_delta": 0.50
}
```

**Ответ 404 Not Found:**
```json
{
    "error": "Нет курсов на дату 2026-02-22"
}
```

### 4.3 POST /api/login/

Аутентификация пользователя.

**Тело запроса:**
```json
{
    "username": "asd",
    "password": "123"
}
```

**Ответ 200 OK:**
```json
{
    "detail": "Вход успешен",
    "username": "asd"
}
```

**Ответ 401 Unauthorized:**
```json
{
    "detail": "Неверное имя пользователя или пароль"
}
```

### 4.4 POST /api/register/

Регистрация нового пользователя.

**Тело запроса:**
```json
{
    "username": "asd",
    "password": "123",
    "password2": "123"
}
```

**Ответ 201 Created:**
```json
{
    "detail": "Регистрация успешна"
}
```

**Ответ 400 Bad Request:**
```json
{
    "username": ["Пользователь с таким именем уже существует"],
    "password2": ["Пароли не совпадают"]
}
```

### 4.5 GET /api/profile/

Получение данных профиля.

**Ответ 200 OK (авторизован):**
```json
{
    "username": "asd",
    "default_currency": "EUR",
    "theme": "dark",
    "is_authenticated": true
}
```

**Ответ 200 OK (не авторизован):**
```json
{
    "is_authenticated": false
}
```

### 4.6 PATCH /api/profile/

Обновление настроек профиля.

**Тело запроса:**
```json
{
    "default_currency": "GBP",
    "theme": "dark"
}
```

**Ответ 200 OK:**
```json
{
    "username": "asd",
    "default_currency": "GBP",
    "theme": "dark"
}
```

### 4.7 POST /api/logout/

Выход из системы.

**Ответ 200 OK:**
```json
{
    "detail": "Выход успешен"
}
```

---

## 5. Frontend

### 5.1 Структура script.js

**Глобальные переменные:**
- `exchangeRates` — объект с текущими курсами валют

**Основные функции:**
- `loadRates(date)` — загрузка курсов с сервера
- `convertCurrency()` — конвертация валют
- `swapCurrencies()` — обмен валют местами
- `updateTable()` — обновление таблицы курсов
- `drawLineChartWithLabels(values, labels)` — рисование графика
- `showTable()` / `showChart()` — переключение видов

**Аутентификация:**
- `loginUser(username, password)` — вход
- `logoutUser()` — выход
- `registerUser(username, password, password2)` — регистрация
- `checkAuthStatus()` — проверка авторизации

**Обработчики событий:**
- Изменение валюты — вызывает `convertCurrency()`
- Ввод суммы — вызывает `convertCurrency()`
- Изменение даты — вызывает `loadRates()`
- Клик по кнопке темы — переключает тему


## 6. Тестирование

### 6.1 Python-тесты (Django)

```bash
cd currency_project
python manage.py test accounts rates --settings=currency_project.test_settings
```

### 6.2 JavaScript-тесты (Jest)

```bash
npm install
npm test
```