"""
Тестовые настройки Django для запуска тестов без Docker
Запуск тестов:
    python manage.py test --settings=currency_project.test_settings
"""

from currency_project.settings import *

# Использование SQLite для тестов
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]