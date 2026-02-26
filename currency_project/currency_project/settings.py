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
BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = 'django-insecure-6_zywk6=y*6916s^7&_x=y3s(xeie0z%n2+s__094=j3u+cuw)'

DEBUG = True


ALLOWED_HOSTS = ['*']


INSTALLED_APPS = [

    'corsheaders',
    'django.contrib.admin',       
    'django.contrib.auth',          
    'django.contrib.contenttypes', 
    'django.contrib.sessions',       
    'django.contrib.messages',       
    'django.contrib.staticfiles',  
    'rates',         
    'rest_framework', 
    'accounts',      
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',    
    'django.middleware.security.SecurityMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware', 
    'django.middleware.common.CommonMiddleware',       
    'django.middleware.csrf.CsrfViewMiddleware',       
    'django.contrib.auth.middleware.AuthenticationMiddleware', 
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  
]

AUTH_USER_MODEL = 'accounts.CustomUser'

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'currency_project.urls'
CSRF_COOKIE_HTTPONLY = False  

SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'currency_project' / 'templates'],  
        'APP_DIRS': True,  
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',  
                'django.contrib.auth.context_processors.auth',  
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


WSGI_APPLICATION = 'currency_project.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  
        'NAME': 'currency_db',       
        'USER': 'postgres',        
        'PASSWORD': 'password',     
        'HOST': 'postgres',          # имя контейнера Docker eсли локально менять
        'PORT': '5432',              
    }
}

AUTH_PASSWORD_VALIDATORS = []


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

STATICFILES_DIRS = [BASE_DIR / 'currency_project' / 'static']


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', 
    ],
}