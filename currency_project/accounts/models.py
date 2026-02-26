"""
Модели данных для учётных записей пользователей

"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Стандартные поля :
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
        email (srt):  почта на будующее
        default_currency (str): Код валюты по умолчанию для отображения.
        theme (str): Предпочтительная тема оформления интерфейса.
    """
    email = models.EmailField(
        blank=True, 
        null=True,
        unique=False, 
        verbose_name='Email'
    )
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