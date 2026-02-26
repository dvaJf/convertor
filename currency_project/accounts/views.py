"""
Представления для работы с учётными записями пользователей

Данный модуль содержит представления для аутентификации, регистрации
и управления профилем пользователя в REST API.

Основные функции:
    - login_view: Аутентификация пользователя
    - logout_view: Выход из системы
    - profile_view: Просмотр и редактирование профиля
    - RegisterAPIView: Регистрация нового пользователя
"""

from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from .serializers import RegisterSerializer
import json


@csrf_exempt
def logout_view(request):
    """
    Представление для выхода пользователя из системы.
    """
    if request.method == 'POST':
        logout(request)
        return JsonResponse({"detail": "Выход успешен"}, status=200)


@csrf_exempt
def login_view(request):
    """
    Представление для аутентификации пользователя.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            response = JsonResponse({"detail": "Вход успешен", "username": user.username}, status=200)
            return response
        else:
            return JsonResponse({"detail": "Неверное имя пользователя или пароль"}, status=401)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(generics.CreateAPIView):
    """
    API-представление для регистрации новых пользователей.
    """
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Создание нового пользователя.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Регистрация успешна"}, status=status.HTTP_201_CREATED)


@csrf_exempt
def profile_view(request):
    """
    Представление для просмотра и редактирования профиля пользователя.
    """
    if request.method == 'GET':
        if request.user.is_authenticated:
            return JsonResponse({
                "username": request.user.username,
                "default_currency": getattr(request.user, 'default_currency', 'USD'),
                "theme": getattr(request.user, 'theme', 'light'),
                "is_authenticated": True
            }, status=200)
        else:
            return JsonResponse({"is_authenticated": False}, status=200)
    
    elif request.method == 'PATCH':
        if request.user.is_authenticated:
            data = json.loads(request.body)
            if 'default_currency' in data:
                request.user.default_currency = data['default_currency']
            if 'theme' in data:
                request.user.theme = data['theme']
            request.user.save()
            
            return JsonResponse({
                "username": request.user.username,
                "default_currency": getattr(request.user, 'default_currency', 'USD'),
                "theme": getattr(request.user, 'theme', 'light')
            }, status=200)
        else:
            return JsonResponse({"error": "Требуется авторизация"}, status=401)
    
    return JsonResponse({"error": "Метод не поддерживается"}, status=405)
