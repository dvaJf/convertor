"""
Файл конфигурации Django-проекта currency_project

Данный модуль содержит все настройки Django-проекта, включая:
- Базовые настройки проекта (SECRET_KEY, DEBUG, ALLOWED_HOSTS)
- Установленные приложения
- Промежуточное ПО (Middleware)
- Настройки базы данных
- Настройки статических файлов
- Настройки аутентификации

"""

from pathlib import Path

# ============================================================================
# БАЗОВЫЕ НАСТРОЙКИ ПРОЕКТА
# ============================================================================

# Базовый каталог проекта (используется для построения путей к файлам)
BASE_DIR = Path(__file__).resolve().parent.parent

# Секретный ключ для криптографической подписи
# ВНИМАНИЕ: В продакшене должен быть заменён на безопасный ключ!
SECRET_KEY = 'django-insecure-6_zywk6=y*6916s^7&_x=y3s(xeie0z%n2+s__094=j3u+cuw)'

# Режим отладки (True - для разработки, False - для продакшена)
DEBUG = True

# Разрешённые хосты ('*' - все хосты разрешены)
ALLOWED_HOSTS = ['*']

# ============================================================================
# УСТАНОВЛЕННЫЕ ПРИЛОЖЕНИЯ
# ============================================================================

INSTALLED_APPS = [
    # Сторонние приложения
    'corsheaders',  # Django CORS Headers - поддержка Cross-Origin Resource Sharing
    
    # Стандартные приложения Django
    'django.contrib.admin',          # Админ-панель
    'django.contrib.auth',           # Система аутентификации
    'django.contrib.contenttypes',   # Типы контента
    'django.contrib.sessions',        # Сессии пользователей
    'django.contrib.messages',        # Система сообщений
    'django.contrib.staticfiles',     # Статические файлы
    
    # Приложения проекта
    'rates',          # Приложение для работы с курсами валют
    'rest_framework', # Django REST Framework
    'accounts',       # Приложение для работы с пользователями
]

# ============================================================================
# ПРОМЕЖУТОЧНОЕ ПО (MIDDLEWARE)
# ============================================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',     # Обработка CORS-запросов
    'django.middleware.security.SecurityMiddleware',  # Безопасность
    'django.contrib.sessions.middleware.SessionMiddleware',  # Сессии
    'django.middleware.common.CommonMiddleware',        # Общие функции
    'django.middleware.csrf.CsrfViewMiddleware',        # Защита от CSRF
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # Аутентификация
    'django.contrib.messages.middleware.MessageMiddleware',  # Сообщения
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Защита от кликджекинга
]

# ============================================================================
# НАСТРОЙКИ АУТЕНТИФИКАЦИИ
# ============================================================================

# Пользовательская модель пользователя (расширенная модель CustomUser)
AUTH_USER_MODEL = 'accounts.CustomUser'

# ============================================================================
# НАСТРОЙКИ CORS (Cross-Origin Resource Sharing)
# ============================================================================

# Разрешить запросы с любых доменов
CORS_ALLOW_ALL_ORIGINS = True

# Разрешить отправку учётных данных (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# ============================================================================
# НАСТРОЙКИ URL И ШАБЛОНОВ
# ============================================================================

# Главный модуль URL-конфигурации
ROOT_URLCONF = 'currency_project.urls'

# Настройки CSRF-куки
CSRF_COOKIE_HTTPONLY = False  # Доступность куки из JavaScript

# Настройки SameSite для куки (защита от CSRF)
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# Настройки шаблонов
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'currency_project' / 'templates'],  # Каталог шаблонов
        'APP_DIRS': True,  # Поиск шаблонов в каталогах приложений
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',   # HttpRequest в шаблонах
                'django.contrib.auth.context_processors.auth',   # Пользователь в шаблонах
                'django.contrib.messages.context_processors.messages',  # Сообщения
            ],
        },
    },
]

# WSGI-приложение для развёртывания
WSGI_APPLICATION = 'currency_project.wsgi.application'

# ============================================================================
# НАСТРОЙКИ БАЗЫ ДАННЫХ
# ============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # СУБД PostgreSQL
        'NAME': 'currency_db',       # Имя базы данных
        'USER': 'postgres',          # Имя пользователя
        'PASSWORD': 'password',      # Пароль
        'HOST': 'postgres',          # Хост (имя контейнера Docker)
        'PORT': '5432',              # Порт PostgreSQL
    }
}

# ============================================================================
# ВАЛИДАТОРЫ ПАРОЛЕЙ
# ============================================================================

# Список валидаторов паролей (пустой - без дополнительных проверок)
AUTH_PASSWORD_VALIDATORS = []

# ============================================================================
# МЕЖДУНАРОДИЗАЦИЯ И ЛОКАЛИЗАЦИЯ
# ============================================================================

# Код языка
LANGUAGE_CODE = 'en-us'

# Часовой пояс
TIME_ZONE = 'UTC'

# Включение интернационализации
USE_I18N = True

# Включение поддержки часовых поясов
USE_TZ = True

# ============================================================================
# НАСТРОЙКИ СТАТИЧЕСКИХ ФАЙЛОВ
# ============================================================================

# URL для статических файлов
STATIC_URL = 'static/'

# Дополнительные каталоги со статическими файлами
STATICFILES_DIRS = [BASE_DIR / 'currency_project' / 'static']

# ============================================================================
# ПРОЧИЕ НАСТРОЙКИ
# ============================================================================

# Тип автоинкрементного поля по умолчанию
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============================================================================
# НАСТРОЙКИ DJANGO REST FRAMEWORK
# ============================================================================

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Разрешить доступ всем
    ],
}