from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True, blank=True, null=True)
    default_currency = models.CharField(max_length=3, default='RUB')

    REQUIRED_FIELDS = []  # username и password обязательны по умолчанию
