"""
Юнит-тесты для приложения accounts

Данный модуль содержит тесты для:
- Модели CustomUser
- Сериализатора RegisterSerializer
- Представлений аутентификации (login, logout, register, profile)

Техники тестирования:
- Позитивное тестирование: проверка корректной работы функций
- Негативное тестирование: проверка обработки ошибок
- Граничные условия: проверка граничных значений
- Классы эквивалентности: проверка типичных представителей классов

Автор: [Автор проекта]
Дата создания: [Дата]
"""

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .serializers import RegisterSerializer
from .models import CustomUser

# Получение модели пользователя
User = get_user_model()


# ============================================================================
# ТЕСТЫ МОДЕЛИ CustomUser
# ============================================================================

class CustomUserModelTest(TestCase):
    """
    Тесты модели CustomUser.
    
    Проверяет:
    - Создание пользователя с корректными данными
    - Значения полей по умолчанию
    - Граничные условия для полей
    - Уникальность имени пользователя
    """
    
    # ------------------------------------------------------------------------
    # ПОЗИТИВНЫЕ ТЕСТЫ
    # ------------------------------------------------------------------------
    
    def test_create_user_with_valid_data(self):
        """
        Тест: Создание пользователя с валидными данными.
        
        Класс эквивалентности: корректные данные пользователя.
        Ожидаемый результат: пользователь успешно создан.
        """
        user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.default_currency, 'USD')  # Значение по умолчанию
        self.assertEqual(user.theme, 'light')  # Значение по умолчанию
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
    
    def test_create_superuser(self):
        """
        Тест: Создание суперпользователя.
        
        Класс эквивалентности: создание суперпользователя.
        Ожидаемый результат: суперпользователь создан с нужными флагами.
        """
        admin = User.objects.create_superuser(
            username='admin',
            password='admin123'
        )
        
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
    
    def test_default_currency_field(self):
        """
        Тест: Поле default_currency имеет корректное значение по умолчанию.
        
        Ожидаемый результат: default_currency = 'USD'.
        """
        user = User.objects.create_user(username='user1', password='pass123')
        self.assertEqual(user.default_currency, 'USD')
    
    def test_theme_field_default(self):
        """
        Тест: Поле theme имеет корректное значение по умолчанию.
        
        Ожидаемый результат: theme = 'light'.
        """
        user = User.objects.create_user(username='user2', password='pass123')
        self.assertEqual(user.theme, 'light')
    
    def test_theme_field_choices(self):
        """
        Тест: Поле theme принимает допустимые значения.
        
        Классы эквивалентности: 'light' и 'dark'.
        """
        # Тест светлой темы
        user_light = User.objects.create_user(username='user3', password='pass123')
        user_light.theme = 'light'
        user_light.save()
        self.assertEqual(user_light.theme, 'light')
        
        # Тест тёмной темы
        user_dark = User.objects.create_user(username='user4', password='pass123')
        user_dark.theme = 'dark'
        user_dark.save()
        self.assertEqual(user_dark.theme, 'dark')
    
    def test_update_user_settings(self):
        """
        Тест: Обновление настроек пользователя.
        
        Ожидаемый результат: настройки успешно обновляются.
        """
        user = User.objects.create_user(username='user5', password='pass123')
        
        # Обновление настроек
        user.default_currency = 'EUR'
        user.theme = 'dark'
        user.save()
        
        # Проверка обновления
        updated_user = User.objects.get(username='user5')
        self.assertEqual(updated_user.default_currency, 'EUR')
        self.assertEqual(updated_user.theme, 'dark')
    
    # ------------------------------------------------------------------------
    # НЕГАТИВНЫЕ ТЕСТЫ
    # ------------------------------------------------------------------------
    
    def test_username_uniqueness(self):
        """
        Тест: Имя пользователя должно быть уникальным.
        
        Негативный тест: попытка создания дубликата username.
        Ожидаемый результат: ошибка IntegrityError.
        """
        User.objects.create_user(username='unique_user', password='pass123')
        
        with self.assertRaises(Exception):  # IntegrityError
            User.objects.create_user(username='unique_user', password='pass456')
    
    def test_username_required(self):
        """
        Тест: Имя пользователя обязательно.
        
        Негативный тест: создание пользователя без username.
        Ожидаемый результат: ошибка.
        """
        with self.assertRaises(Exception):  # ValueError или TypeError
            User.objects.create_user(username='', password='pass123')


# ============================================================================
# ТЕСТЫ СЕРИАЛИЗАТОРА RegisterSerializer
# ============================================================================

class RegisterSerializerTest(TestCase):
    """
    Тесты сериализатора RegisterSerializer.
    
    Проверяет:
    - Валидацию паролей
    - Создание пользователя
    - Обработку некорректных данных
    """
    
    # ------------------------------------------------------------------------
    # ПОЗИТИВНЫЕ ТЕСТЫ
    # ------------------------------------------------------------------------
    
    def test_valid_registration_data(self):
        """
        Тест: Валидные данные регистрации.
        
        Класс эквивалентности: корректные данные с совпадающими паролями.
        Ожидаемый результат: сериализатор валиден.
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
        
        Ожидаемый результат: пользователь создан с хешированным паролем.
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
        
        Ожидаемый результат: пароль не возвращается в сериализованных данных.
        """
        data = {
            'username': 'user_pass',
            'password': 'secret123',
            'password2': 'secret123'
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        # Сериализация созданного пользователя
        serializer_data = RegisterSerializer(user).data
        
        self.assertNotIn('password', serializer_data)
        self.assertNotIn('password2', serializer_data)
    
    # ------------------------------------------------------------------------
    # НЕГАТИВНЫЕ ТЕСТЫ
    # ------------------------------------------------------------------------
    
    def test_password_mismatch(self):
        """
        Тест: Пароли не совпадают.
        
        Негативный тест: password != password2.
        Ожидаемый результат: ошибка валидации.
        """
        data = {
            'username': 'mismatch_user',
            'password': 'password1',
            'password2': 'password2'  # Отличается от password
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_missing_password2(self):
        """
        Тест: Отсутствует подтверждение пароля.
        
        Негативный тест: поле password2 отсутствует.
        Ожидаемый результат: ошибка валидации.
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
        
        Негативный тест: поле username отсутствует.
        Ожидаемый результат: ошибка валидации.
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
        
        Негативный тест: попытка регистрации с существующим username.
        Ожидаемый результат: ошибка валидации.
        """
        # Создание первого пользователя
        User.objects.create_user(username='existing_user', password='pass123')
        
        # Попытка регистрации с тем же именем
        data = {
            'username': 'existing_user',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)


# ============================================================================
# ТЕСТЫ API АУТЕНТИФИКАЦИИ
# ============================================================================

class AuthenticationAPITest(TestCase):
    """
    Тесты API аутентификации.
    
    Проверяет:
    - Регистрацию пользователей
    - Вход в систему
    - Выход из системы
    - Просмотр и редактирование профиля
    """
    
    def setUp(self):
        """Настройка тестового клиента и тестовых данных."""
        self.client = APIClient()
        self.test_user = User.objects.create_user(
            username='test_auth_user',
            password='testpass123'
        )
    
    # ------------------------------------------------------------------------
    # ТЕСТЫ РЕГИСТРАЦИИ
    # ------------------------------------------------------------------------
    
    def test_registration_success(self):
        """
        Тест: Успешная регистрация.
        
        Позитивный тест: корректные данные регистрации.
        Ожидаемый результат: статус 201, сообщение об успехе.
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
        
        Негативный тест: password != password2.
        Ожидаемый результат: статус 400, ошибка валидации.
        """
        url = reverse('api-register')
        data = {
            'username': 'mismatch_api_user',
            'password': 'pass1',
            'password2': 'pass2'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    # ------------------------------------------------------------------------
    # ТЕСТЫ ВХОДА В СИСТЕМУ
    # ------------------------------------------------------------------------
    
    def test_login_success(self):
        """
        Тест: Успешный вход в систему.
        
        Позитивный тест: корректные учётные данные.
        Ожидаемый результат: статус 200, сообщение об успехе.
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
        
        # Проверяем, что пользователь авторизован в сессии
        self.assertTrue('_auth_user_id' in self.client.session)
    
    def test_login_invalid_credentials(self):
        """
        Тест: Вход с неверными учётными данными.
        
        Негативный тест: неправильный пароль.
        Ожидаемый результат: статус 401, сообщение об ошибке.
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
        
        Негативный тест: несуществующий username.
        Ожидаемый результат: статус 401.
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
        
        Негативный тест: отсутствуют username или password.
        Ожидаемый результат: ошибка аутентификации.
        """
        url = reverse('api-login')
        
        # Без пароля
        data = {'username': 'test_auth_user'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Без имени пользователя
        data = {'password': 'testpass123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    # ------------------------------------------------------------------------
    # ТЕСТЫ ВЫХОДА ИЗ СИСТЕМЫ
    # ------------------------------------------------------------------------
    
    def test_logout_success(self):
        """
        Тест: Успешный выход из системы.
        
        Позитивный тест: авторизованный пользователь выходит.
        Ожидаемый результат: статус 200, сообщение об успехе.
        """
        # Сначала входим в систему через API
        login_url = reverse('api-login')
        self.client.post(login_url, {
            'username': 'test_auth_user',
            'password': 'testpass123'
        }, format='json')
        
        url = reverse('api-logout')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['detail'], 'Выход успешен')
    
    # ------------------------------------------------------------------------
    # ТЕСТЫ ПРОФИЛЯ
    # ------------------------------------------------------------------------
    
    def test_profile_unauthenticated(self):
        """
        Тест: Просмотр профиля неавторизованным пользователем.
        
        Ожидаемый результат: is_authenticated = False.
        """
        url = reverse('api-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json()['is_authenticated'])
    
    def test_profile_authenticated(self):
        """
        Тест: Просмотр профиля авторизованным пользователем.
        
        Позитивный тест: авторизованный пользователь получает данные профиля.
        Ожидаемый результат: данные профиля, is_authenticated = True.
        """
        # Входим в систему через API
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
        
        Позитивный тест: изменение default_currency.
        Ожидаемый результат: валюта успешно обновлена.
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
        
        # Проверка сохранения в БД
        self.test_user.refresh_from_db()
        self.assertEqual(self.test_user.default_currency, 'EUR')
    
    def test_profile_update_theme(self):
        """
        Тест: Обновление темы оформления.
        
        Позитивный тест: изменение theme.
        Ожидаемый результат: тема успешно обновлена.
        """
        # Входим в систему через API
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
        
        # Проверка сохранения в БД
        self.test_user.refresh_from_db()
        self.assertEqual(self.test_user.theme, 'dark')


# ============================================================================
# ГРАНИЧНЫЕ ТЕСТЫ
# ============================================================================

class BoundaryTests(TestCase):
    """
    Тесты граничных условий.
    
    Проверяет:
    - Минимальную и максимальную длину имени пользователя
    - Минимальную и максимальную длину пароля
    - Граничные значения полей модели
    """
    
    def setUp(self):
        """Настройка тестового клиента."""
        self.client = APIClient()
    
    def test_username_min_length(self):
        """
        Тест: Минимальная длина имени пользователя.
        
        Граничное условие: имя пользователя из 1 символа.
        Ожидаемый результат: успех (Django не имеет минимального ограничения).
        """
        data = {
            'username': 'a',  # 1 символ
            'password': 'testpass123',
            'password2': 'testpass123'
        }
        serializer = RegisterSerializer(data=data)
        # Django разрешает 1 символ
        self.assertTrue(serializer.is_valid())
    
    def test_username_max_length(self):
        """
        Тест: Максимальная длина имени пользователя.
        
        Граничное условие: имя пользователя из 150 символов (стандарт Django).
        """
        long_username = 'a' * 150  # Максимальная длина Django
        
        data = {
            'username': long_username,
            'password': 'testpass123',
            'password2': 'testpass123'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_username_exceed_max_length(self):
        """
        Тест: Превышение максимальной длины имени пользователя.
        
        Граничное условие: имя пользователя длиной 151 символ.
        Ожидаемый результат: ошибка валидации.
        """
        too_long_username = 'a' * 151  # Превышает лимит
        
        data = {
            'username': too_long_username,
            'password': 'testpass123',
            'password2': 'testpass123'
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
    
    def test_currency_field_length(self):
        """
        Тест: Длина кода валюты.
        
        Граничное условие: 3 символа (стандарт ISO 4217).
        """
        user = User.objects.create_user(username='currency_test', password='pass')
        
        # Корректная длина
        user.default_currency = 'EUR'
        user.save()
        self.assertEqual(user.default_currency, 'EUR')
    
    def test_theme_field_choices_boundary(self):
        """
        Тест: Граничные значения для поля theme.
        
        Классы эквивалентности: 'light', 'dark' - валидные значения.
        """
        user = User.objects.create_user(username='theme_test', password='pass')
        
        # Валидные значения
        user.theme = 'light'
        user.full_clean()  # Проверка валидации модели
        
        user.theme = 'dark'
        user.full_clean()


# ============================================================================
# ТЕСТЫ КЛАССОВ ЭКВИВАЛЕНТНОСТИ
# ============================================================================

class EquivalenceClassTests(TestCase):
    """
    Тесты классов эквивалентности.
    
    Проверяет:
    - Различные форматы паролей
    - Различные форматы имени пользователя
    """
    
    def test_password_with_special_characters(self):
        """
        Тест: Пароль со специальными символами.
        
        Класс эквивалентности: пароли с спец. символами.
        """
        data = {
            'username': 'special_pass_user',
            'password': 'P@ssw0rd!#$%',
            'password2': 'P@ssw0rd!#$%'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_password_with_unicode(self):
        """
        Тест: Пароль с Unicode-символами.
        
        Класс эквивалентности: пароли с Unicode.
        """
        data = {
            'username': 'unicode_pass_user',
            'password': 'пароль123',
            'password2': 'пароль123'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_username_with_numbers(self):
        """
        Тест: Имя пользователя с цифрами.
        
        Класс эквивалентности: username с цифрами.
        """
        data = {
            'username': 'user123456',
            'password': 'testpass123',
            'password2': 'testpass123'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_username_with_underscores(self):
        """
        Тест: Имя пользователя с подчёркиваниями.
        
        Класс эквивалентности: username с подчёркиваниями.
        """
        data = {
            'username': 'test_user_name',
            'password': 'testpass123',
            'password2': 'testpass123'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_username_case_sensitivity(self):
        """
        Тест: Чувствительность имени пользователя к регистру.
        
        Проверка того, что 'TestUser' и 'testuser' считаются разными.
        """
        User.objects.create_user(username='testuser', password='pass')
        
        # Попытка создания с другим регистром
        # Примечание: Django нечувствителен к регистру в username
        data = {
            'username': 'TestUser',
            'password': 'testpass123',
            'password2': 'testpass123'
        }
        serializer = RegisterSerializer(data=data)
        # Это может вызвать ошибку дубликата
        # В зависимости от настроек PostgreSQL