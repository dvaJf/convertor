"""
Модели данных для учётных записей пользователей

Данный модуль содержит расширенную модель пользователя с дополнительными
полями для хранения персональных настроек приложения.

"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Расширенная модель пользователя с дополнительными настройками.
    
    Наследуется от AbstractUser для получения стандартных полей:
    - username: Имя пользователя
    - password: Хешированный пароль
    - first_name: Имя
    - last_name: Фамилия
    - is_active: Флаг активности
    - is_staff: Флаг персонала
    - is_superuser: Флаг суперпользователя
    - last_login: Время последнего входа
    - date_joined: Дата регистрации
    
    Дополнительные поля:
        default_currency (str): Код валюты по умолчанию для отображения.
            Длина: 3 символа (например, 'USD', 'EUR', 'RUB')
            Значение по умолчанию: 'USD'
        theme (str): Предпочтительная тема оформления интерфейса.
            Длина: до 10 символов
            Возможные значения: 'light' (светлая), 'dark' (тёмная)
            Значение по умолчанию: 'light'
    
    Пример использования:
        user = CustomUser.objects.create_user(username='ivan', password='pass123')
        user.default_currency = 'EUR'
        user.theme = 'dark'
        user.save()
    """

    default_currency = models.CharField(
        max_length=3, 
        default='USD',
        verbose_name='Валюта по умолчанию',
        help_text='Трёхбуквенный код валюты (USD, EUR, GBP, RUB)'
    )
    
    # Тема оформления интерфейса
    theme = models.CharField(
        max_length=10, 
        default='light', 
        choices=[('light', 'Светлая'), ('dark', 'Темная')],
        verbose_name='Тема оформления',
        help_text='Предпочтительная тема интерфейса пользователя'
    )

    # Список обязательных полей при создании суперпользователя
    REQUIRED_FIELDS = []