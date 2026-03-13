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
    )
    default_currency = models.CharField(
        max_length=3, 
        default='USD',
    )

    theme = models.CharField(
        max_length=10, 
        default='light', 
        choices=[('light', 'Светлая'), ('dark', 'Темная')],
    )

    REQUIRED_FIELDS = []