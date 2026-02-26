"""
Сериализаторы для регистрации пользователей

"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

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
    """
    
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        """
        Валидация данных регистрации.
        Проверяет, что пароль и его подтверждение совпадают.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        """
        Создание нового пользователя.
        Создаёт пользователя с хешированным паролем.

        """
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user