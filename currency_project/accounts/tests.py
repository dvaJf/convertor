"""
Юнит-тесты для приложения accounts

Данный модуль содержит тесты для:
- Модели CustomUser
- Сериализатора RegisterSerializer
- Представлений аутентификации (login, logout, register, profile)

"""

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .serializers import RegisterSerializer
from .models import CustomUser

User = get_user_model()

# ТЕСТЫ МОДЕЛИ CustomUser

class CustomUserModelTest(TestCase):
    """
    Тесты модели CustomUser.
    
    Проверяет:
    - Создание пользователя с корректными данными
    - Значения полей по умолчанию
    - Граничные условия для полей
    - Уникальность имени пользователя
    """

    def test_create_user_with_valid_data(self):
        """
        Тест: Создание пользователя с валидными данными.
        """
        user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.default_currency, 'USD')  
        self.assertEqual(user.theme, 'light') 
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
    
    def test_create_superuser(self):
        """
        Тест: Создание суперпользователя.
        """
        admin = User.objects.create_superuser(
            username='admin',
            password='admin123'
        )
        
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_theme_field_choices(self):
        """
        Тест: Поле theme принимает допустимые значения.
        """
        user_light = User.objects.create_user(username='user3', password='pass123')
        user_light.theme = 'light'
        user_light.save()
        self.assertEqual(user_light.theme, 'light')
        
        user_dark = User.objects.create_user(username='user4', password='pass123')
        user_dark.theme = 'dark'
        user_dark.save()
        self.assertEqual(user_dark.theme, 'dark')
    
    def test_update_user_settings(self):
        """
        Тест: Обновление настроек пользователя.
        """
        user = User.objects.create_user(username='user5', password='pass123')
        user.default_currency = 'EUR'
        user.theme = 'dark'
        user.save()
        updated_user = User.objects.get(username='user5')
        self.assertEqual(updated_user.default_currency, 'EUR')
        self.assertEqual(updated_user.theme, 'dark')
    
    def test_username_uniqueness(self):
        """
        Тест: Имя пользователя должно быть уникальным.
        """
        User.objects.create_user(username='unique_user', password='pass123')
        
        with self.assertRaises(Exception):
            User.objects.create_user(username='unique_user', password='pass456')
    
    def test_username_required(self):
        """
        Тест: Имя пользователя обязательно.
        """
        with self.assertRaises(Exception):
            User.objects.create_user(username='', password='pass123')

class RegisterSerializerTest(TestCase):
    """
    Тесты сериализатора RegisterSerializer.
    """
    def test_valid_registration_data(self):
        """
        Тест: Валидные данные регистрации.
        """
        data = {
            'username': 'newuser',
            'password': 'securepass123',
            'password2': 'securepass123'
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
    
    def test_create_user_from_serializer(self):
        """
        Тест: Создание пользователя через сериализатор.
        """
        data = {
            'username': 'serializer_user',
            'password': 'testpass123',
            'password2': 'testpass123'
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        self.assertEqual(user.username, 'serializer_user')
        self.assertTrue(user.check_password('testpass123'))
    
    def test_password_write_only(self):
        """
        Тест: Пароль доступен только для записи.
        """
        data = {
            'username': 'user_pass',
            'password': 'secret123',
            'password2': 'secret123'
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        serializer_data = RegisterSerializer(user).data
        
        self.assertNotIn('password', serializer_data)
        self.assertNotIn('password2', serializer_data)
  
    def test_password_mismatch(self):
        """
        Тест: Пароли не совпадают.
        """
        data = {
            'username': 'mismatch_user',
            'password': 'password1',
            'password2': 'password2' 
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_missing_password2(self):
        """
        Тест: Отсутствует подтверждение пароля.
        """
        data = {
            'username': 'no_pass2_user',
            'password': 'password123'
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('password2', serializer.errors)
    
    def test_missing_username(self):
        """
        Тест: Отсутствует имя пользователя.
        """
        data = {
            'password': 'password123',
            'password2': 'password123'
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
    
    def test_duplicate_username(self):
        """
        Тест: Имя пользователя уже занято.
        """

        User.objects.create_user(username='existing_user', password='pass123')
        data = {
            'username': 'existing_user',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)


class AuthenticationAPITest(TestCase):
    """
    Тесты API аутентификации.
    """
    
    def setUp(self):
        """Настройка тестового клиента и тестовых данных."""
        self.client = APIClient()
        self.test_user = User.objects.create_user(
            username='test_auth_user',
            password='testpass123'
        )

    def test_registration_success(self):
        """
        Тест: Успешная регистрация.
        """
        url = reverse('api-register')
        data = {
            'username': 'new_api_user',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['detail'], 'Регистрация успешна')
        self.assertTrue(User.objects.filter(username='new_api_user').exists())
    
    def test_registration_password_mismatch(self):
        """
        Тест: Регистрация с несовпадающими паролями.
        """
        url = reverse('api-register')
        data = {
            'username': 'mismatch_api_user',
            'password': 'pass1',
            'password2': 'pass2'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_success(self):
        """
        Тест: Успешный вход в систему.

        """
        url = reverse('api-login')
        data = {
            'username': 'test_auth_user',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['detail'], 'Вход успешен')
        self.assertEqual(response.json()['username'], 'test_auth_user')

        self.assertTrue('_auth_user_id' in self.client.session)
    
    def test_login_invalid_credentials(self):
        """
        Тест: Вход с неверными учётными данными.
        """
        url = reverse('api-login')
        data = {
            'username': 'test_auth_user',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Неверное', response.json()['detail'])
    
    def test_login_nonexistent_user(self):
        """
        Тест: Вход с несуществующим пользователем.
        """
        url = reverse('api-login')
        data = {
            'username': 'nonexistent_user',
            'password': 'anypassword'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_missing_fields(self):
        """
        Тест: Вход без обязательных полей.
        """
        url = reverse('api-login')

        data = {'username': 'test_auth_user'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        data = {'password': 'testpass123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_success(self):
        """
        Тест: Успешный выход из системы.
        """

        login_url = reverse('api-login')
        self.client.post(login_url, {
            'username': 'test_auth_user',
            'password': 'testpass123'
        }, format='json')
        
        url = reverse('api-logout')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['detail'], 'Выход успешен')

    def test_profile_unauthenticated(self):
        """
        Тест: Просмотр профиля неавторизованным пользователем.
        """
        url = reverse('api-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json()['is_authenticated'])
    
    def test_profile_authenticated(self):
        """
        Тест: Просмотр профиля авторизованным пользователем.
        """

        login_url = reverse('api-login')
        self.client.post(login_url, {
            'username': 'test_auth_user',
            'password': 'testpass123'
        }, format='json')
        
        url = reverse('api-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['is_authenticated'])
        self.assertEqual(data['username'], 'test_auth_user')
        self.assertEqual(data['default_currency'], 'USD')
    
    def test_profile_update_currency(self):
        """
        Тест: Обновление валюты по умолчанию.
        """
        # Входим в систему через API
        login_url = reverse('api-login')
        self.client.post(login_url, {
            'username': 'test_auth_user',
            'password': 'testpass123'
        }, format='json')
        
        url = reverse('api-profile')
        data = {'default_currency': 'EUR'}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['default_currency'], 'EUR')

        self.test_user.refresh_from_db()
        self.assertEqual(self.test_user.default_currency, 'EUR')
    
    def test_profile_update_theme(self):
        """
        Тест: Обновление темы оформления.
        """

        login_url = reverse('api-login')
        self.client.post(login_url, {
            'username': 'test_auth_user',
            'password': 'testpass123'
        }, format='json')
        
        url = reverse('api-profile')
        data = {'theme': 'dark'}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['theme'], 'dark')

        self.test_user.refresh_from_db()
        self.assertEqual(self.test_user.theme, 'dark')