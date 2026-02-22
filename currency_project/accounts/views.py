"""
Представления для работы с учётными записями пользователей

Данный модуль содержит представления для аутентификации, регистрации
и управления профилем пользователя в REST API.

Основные функции:
    - login_view: Аутентификация пользователя
    - logout_view: Выход из системы
    - profile_view: Просмотр и редактирование профиля
    - RegisterAPIView: Регистрация нового пользователя

Автор: [Автор проекта]
Дата создания: [Дата]
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
    
    Обрабатывает POST-запрос для разрыва сессии пользователя.
    Декоратор @csrf_exempt отключает проверку CSRF-токена.
    
    Параметры:
        request (HttpRequest): Объект HTTP-запроса.
            Метод: POST
    
    Возвращает:
        JsonResponse: JSON-ответ с сообщением об успешном выходе.
            Статус: 200 OK
            Пример: {"detail": "Выход успешен"}
    """
    if request.method == 'POST':
        logout(request)
        return JsonResponse({"detail": "Выход успешен"}, status=200)


@csrf_exempt
def login_view(request):
    """
    Представление для аутентификации пользователя.
    
    Обрабатывает POST-запрос с учетными данными пользователя
    и выполняет вход в систему при успешной аутентификации.
    Декоратор @csrf_exempt отключает проверку CSRF-токена.
    
    Параметры:
        request (HttpRequest): Объект HTTP-запроса.
            Метод: POST
            Тело запроса (JSON):
                - username (str): Имя пользователя
                - password (str): Пароль пользователя
    
    Возвращает:
        JsonResponse: JSON-ответ с результатом аутентификации.
            При успехе:
                Статус: 200 OK
                Пример: {"detail": "Вход успешен", "username": "user123"}
            При неудаче:
                Статус: 401 Unauthorized
                Пример: {"detail": "Неверное имя пользователя или пароль"}
    """
    if request.method == 'POST':
        # Парсинг JSON-данных из тела запроса
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        # Аутентификация пользователя
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Успешная аутентификация - создание сессии
            login(request, user)
            response = JsonResponse({"detail": "Вход успешен", "username": user.username}, status=200)
            return response
        else:
            # Ошибка аутентификации
            return JsonResponse({"detail": "Неверное имя пользователя или пароль"}, status=401)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(generics.CreateAPIView):
    """
    API-представление для регистрации новых пользователей.
    
    Наследуется от CreateAPIView для создания нового объекта пользователя.
    Использует RegisterSerializer для валидации и сохранения данных.
    Декоратор @method_decorator отключает проверку CSRF-токена.
    
    Атрибуты:
        serializer_class (RegisterSerializer): Сериализатор для регистрации.
    
    Методы:
        create: Создаёт нового пользователя и возвращает подтверждение.
    
    Параметры запроса (JSON):
        - username (str): Имя пользователя
        - password (str): Пароль
        - password2 (str): Подтверждение пароля
    
    Возвращает:
        Response: JSON-ответ с результатом регистрации.
            Статус: 201 Created
            Пример: {"detail": "Регистрация успешна"}
    """
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Создание нового пользователя.
        
        Параметры:
            request (Request): Объект запроса DRF с данными пользователя.
            *args: Позиционные аргументы.
            **kwargs: Именованные аргументы.
        
        Возвращает:
            Response: Ответ с сообщением об успешной регистрации.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Регистрация успешна"}, status=status.HTTP_201_CREATED)


@csrf_exempt
def profile_view(request):
    """
    Представление для просмотра и редактирования профиля пользователя.
    
    Поддерживает два метода:
    - GET: Получение информации о профиле
    - PATCH: Частичное обновление профиля
    
    Декоратор @csrf_exempt отключает проверку CSRF-токена.
    
    Параметры:
        request (HttpRequest): Объект HTTP-запроса.
            Методы: GET, PATCH
    
    GET-запрос:
        Возвращает:
            JsonResponse: Данные профиля пользователя.
                Для авторизованных:
                    - username: Имя пользователя
                    - default_currency: Валюта по умолчанию
                    - theme: Тема оформления
                    - is_authenticated: True
                Для неавторизованных:
                    - is_authenticated: False
    
    PATCH-запрос:
        Тело запроса (JSON):
            - default_currency (str, optional): Новая валюта по умолчанию
            - theme (str, optional): Новая тема оформления ('light' или 'dark')
        
        Возвращает:
            JsonResponse: Обновлённые данные профиля.
    """
    if request.method == 'GET':
        # Проверка авторизации пользователя
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
        # Обновление профиля (только для авторизованных)
        if request.user.is_authenticated:
            data = json.loads(request.body)
            
            # Обновление валюты по умолчанию
            if 'default_currency' in data:
                request.user.default_currency = data['default_currency']
            
            # Обновление темы оформления
            if 'theme' in data:
                request.user.theme = data['theme']
            
            # Сохранение изменений в базе данных
            request.user.save()
            
            return JsonResponse({
                "username": request.user.username,
                "default_currency": getattr(request.user, 'default_currency', 'USD'),
                "theme": getattr(request.user, 'theme', 'light')
            }, status=200)
        else:
            return JsonResponse({"error": "Требуется авторизация"}, status=401)
    
    # Для остальных методов возвращаем ошибку
    return JsonResponse({"error": "Метод не поддерживается"}, status=405)
