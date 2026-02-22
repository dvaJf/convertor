"""
Сериализаторы для регистрации пользователей

Данный модуль содержит сериализаторы для преобразования данных
пользователей между форматами Python и JSON для REST API.

Автор: [Автор проекта]
Дата создания: [Дата]
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

# Получение модели пользователя (CustomUser)
User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Сериализатор для регистрации новых пользователей.
    
    Обрабатывает данные регистрации, включая валидацию паролей
    и создание нового пользователя в базе данных.
    
    Поля:
        username (str): Имя пользователя (уникальное)
        password (str): Пароль (только для записи)
        password2 (str): Подтверждение пароля (только для записи)
    
    Входные параметры (JSON):
        - username: Имя пользователя
        - password: Пароль
        - password2: Подтверждение пароля (должно совпадать с password)
    
    Методы:
        validate: Проверка совпадения паролей
        create: Создание нового пользователя
    
    Пример использования:
        serializer = RegisterSerializer(data={
            'username': 'ivan',
            'password': 'secure123',
            'password2': 'secure123'
        })
        if serializer.is_valid():
            user = serializer.save()
    
    Исключения:
        ValidationError: При несовпадении паролей
    """
    
    # Поле для подтверждения пароля (не сохраняется в БД)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        """
        Метаданные сериализатора.
        
        Определяет модель и поля, участвующие в сериализации.
        """
        model = User
        fields = ('username', 'password', 'password2')
        extra_kwargs = {
            'password': {'write_only': True}  # Пароль не возвращается в ответе
        }

    def validate(self, attrs):
        """
        Валидация данных регистрации.
        
        Проверяет, что пароль и его подтверждение совпадают.
        
        Параметры:
            attrs (dict): Словарь с валидируемыми данными.
                - username: Имя пользователя
                - password: Пароль
                - password2: Подтверждение пароля
        
        Возвращает:
            dict: Валидированные данные атрибутов.
        
        Исключения:
            ValidationError: Если пароли не совпадают.
                Формат: {"password": "Пароли не совпадают"}
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        """
        Создание нового пользователя.
        
        Создаёт пользователя с хешированным паролем.
        
        Параметры:
            validated_data (dict): Валидированные данные для создания пользователя.
                - username: Имя пользователя
                - password: Пароль (будет хеширован)
        
        Возвращает:
            User: Созданный объект пользователя.
        
        Примечание:
            Поле password2 удаляется из данных перед созданием,
            так как не является полем модели.
        """
        # Удаление поля подтверждения пароля
        validated_data.pop('password2')
        
        # Создание пользователя с хешированием пароля
        user = User.objects.create_user(**validated_data)
        return user