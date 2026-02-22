"""
Тестовые настройки Django для запуска тестов без Docker

Использует SQLite вместо PostgreSQL для локального тестирования.

Запуск тестов:
    python manage.py test --settings=currency_project.test_settings

Автор: [Автор проекта]
Дата создания: [Дата]
"""

from currency_project.settings import *

# Использование SQLite для тестов
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Отключение миграций для ускорения тестов
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Ускорение хеширования паролей для тестов
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]