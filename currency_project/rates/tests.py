"""
Юнит-тесты для приложения rates

Данный модуль содержит тесты для:
- Модели Rate
- API получения курсов валют (rates_by_date)

Техники тестирования:
- Позитивное тестирование: проверка корректной работы функций
- Негативное тестирование: проверка обработки ошибок
- Граничные условия: проверка граничных значений
- Классы эквивалентности: проверка типичных представителей классов

"""

from django.test import TestCase
from django.utils.timezone import now
from rest_framework.test import APIClient
from rest_framework import status
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Rate


# ============================================================================
# ТЕСТЫ МОДЕЛИ Rate
# ============================================================================

class RateModelTest(TestCase):
    """
    Тесты модели Rate.
    
    Проверяет:
    - Создание записи курса с корректными данными
    - Строковое представление модели
    - Граничные условия для числовых полей
    - Форматы данных
    """
    
    # ------------------------------------------------------------------------
    # ПОЗИТИВНЫЕ ТЕСТЫ
    # ------------------------------------------------------------------------
    
    def test_create_rate_with_valid_data(self):
        """
        Тест: Создание записи курса с валидными данными.
        
        Класс эквивалентности: корректные данные курса.
        Ожидаемый результат: запись успешно создана.
        """
        rate = Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.5000'),
            tomorrow=Decimal('95.7500'),
            delta=Decimal('0.2500')
        )
        
        self.assertEqual(rate.currency, 'ДОЛЛАР')
        self.assertEqual(rate.today, Decimal('95.5000'))
        self.assertEqual(rate.tomorrow, Decimal('95.7500'))
        self.assertEqual(rate.delta, Decimal('0.2500'))
        # parsed_time устанавливается автоматически
        self.assertIsNotNone(rate.parsed_time)
    
    def test_rate_str_representation(self):
        """
        Тест: Строковое представление модели Rate.
        
        Ожидаемый результат: __str__ возвращает код валюты.
        """
        rate = Rate.objects.create(
            currency='ЕВРО',
            today=Decimal('100.0000'),
            tomorrow=Decimal('100.5000'),
            delta=Decimal('0.5000')
        )
        
        self.assertEqual(str(rate), 'ЕВРО')
    
    def test_create_multiple_rates(self):
        """
        Тест: Создание нескольких курсов.
        
        Класс эквивалентности: несколько записей.
        Ожидаемый результат: все записи созданы.
        """
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.0000'),
            tomorrow=Decimal('95.5000'),
            delta=Decimal('0.5000')
        )
        
        Rate.objects.create(
            currency='ЕВРО',
            today=Decimal('100.0000'),
            tomorrow=Decimal('101.0000'),
            delta=Decimal('1.0000')
        )
        
        self.assertEqual(Rate.objects.count(), 2)
    
    def test_positive_delta(self):
        """
        Тест: Положительное изменение курса (рост).
        
        Класс эквивалентности: delta > 0.
        """
        rate = Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.0000'),
            tomorrow=Decimal('95.5000'),
            delta=Decimal('0.5000')
        )
        
        self.assertTrue(rate.delta > 0)
    
    def test_negative_delta(self):
        """
        Тест: Отрицательное изменение курса (падение).
        
        Класс эквивалентности: delta < 0.
        """
        rate = Rate.objects.create(
            currency='ЕВРО',
            today=Decimal('100.0000'),
            tomorrow=Decimal('99.5000'),
            delta=Decimal('-0.5000')
        )
        
        self.assertTrue(rate.delta < 0)
    
    def test_zero_delta(self):
        """
        Тест: Нулевое изменение курса.
        
        Граничное условие: delta = 0.
        """
        rate = Rate.objects.create(
            currency='ФУНТ',
            today=Decimal('110.0000'),
            tomorrow=Decimal('110.0000'),
            delta=Decimal('0.0000')
        )
        
        self.assertEqual(rate.delta, Decimal('0.0000'))
    
    # ------------------------------------------------------------------------
    # ГРАНИЧНЫЕ ТЕСТЫ
    # ------------------------------------------------------------------------
    
    def test_rate_maximum_precision(self):
        """
        Тест: Максимальная точность курса (4 знака после запятой).
        
        Граничное условие: максимальная точность DecimalField.
        """
        rate = Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.1234'),
            tomorrow=Decimal('95.5678'),
            delta=Decimal('0.4444')
        )
        
        # Перезагрузка из БД для проверки точного хранения
        rate.refresh_from_db()
        self.assertEqual(rate.today, Decimal('95.1234'))
        self.assertEqual(rate.tomorrow, Decimal('95.5678'))
    
    def test_rate_large_values(self):
        """
        Тест: Большие значения курса.
        
        Граничное условие: максимальное значение (10 знаков).
        """
        rate = Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('999999.9999'),  # Максимальное значение
            tomorrow=Decimal('1000000.0000'),
            delta=Decimal('0.0001')
        )
        
        self.assertEqual(rate.today, Decimal('999999.9999'))
    
    def test_rate_minimum_positive_value(self):
        """
        Тест: Минимальное положительное значение.
        
        Граничное условие: минимальное положительное число.
        """
        rate = Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('0.0001'),
            tomorrow=Decimal('0.0002'),
            delta=Decimal('0.0001')
        )
        
        self.assertEqual(rate.today, Decimal('0.0001'))


# ============================================================================
# ТЕСТЫ API КУРСОВ ВАЛЮТ
# ============================================================================

class RatesAPITest(TestCase):
    """
    Тесты API получения курсов валют.
    
    Проверяет:
    - Получение курсов на указанную дату
    - Обработку отсутствующих данных
    - Формат ответа API
    """
    
    def setUp(self):
        """Настройка тестового клиента и тестовых данных."""
        self.client = APIClient()
    
    # ------------------------------------------------------------------------
    # ПОЗИТИВНЫЕ ТЕСТЫ
    # ------------------------------------------------------------------------
    
    def test_get_rates_success(self):
        """
        Тест: Успешное получение курсов.
        
        Позитивный тест: данные есть.
        Ожидаемый результат: статус 200, данные курсов.
        """
        # Создаём курсы (parsed_time установится автоматически на текущее время)
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.0000'),
            tomorrow=Decimal('95.5000'),
            delta=Decimal('0.5000')
        )
        
        # Запрос без даты - использует вчерашнюю дату
        # Но так как данные созданы сейчас, нужно запросить сегодня
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('ДОЛЛАР', data)
        self.assertEqual(float(data['ДОЛЛАР']), 95.5000)
    
    def test_rates_response_includes_delta(self):
        """
        Тест: Ответ API включает изменение курса (delta).
        
        Ожидаемый результат: в ответе есть поля с суффиксом _delta.
        """
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.0000'),
            tomorrow=Decimal('95.5000'),
            delta=Decimal('0.5000')
        )
        
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        self.assertIn('ДОЛЛАР', data)
        self.assertIn('ДОЛЛАР_delta', data)
    
    def test_rates_delta_value_format(self):
        """
        Тест: Формат значения delta.
        
        Ожидаемый результат: delta - это число.
        """
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.0000'),
            tomorrow=Decimal('95.5000'),
            delta=Decimal('0.5000')
        )
        
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        delta = data['ДОЛЛАР_delta']
        
        self.assertIsInstance(delta, (int, float))
    
    # ------------------------------------------------------------------------
    # НЕГАТИВНЫЕ ТЕСТЫ
    # ------------------------------------------------------------------------
    
    def test_get_rates_nonexistent_date(self):
        """
        Тест: Запрос курсов на несуществующую дату.
        
        Негативный тест: дата без данных.
        Ожидаемый результат: статус 404, сообщение об ошибке.
        """
        # Дата в далёком прошлом
        nonexistent_date = datetime(2020, 1, 1).date()
        url = f"/api/rates/?date={nonexistent_date.isoformat()}"
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.json())
    
    def test_get_rates_future_date(self):
        """
        Тест: Запрос курсов на будущую дату.
        
        Негативный тест: дата в будущем.
        Ожидаемый результат: статус 404.
        """
        future_date = (now().date() + timedelta(days=365))
        url = f"/api/rates/?date={future_date.isoformat()}"
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ============================================================================
# ИНТЕГРАЦИОННЫЕ ТЕСТЫ
# ============================================================================

class RatesIntegrationTest(TestCase):
    """
    Интеграционные тесты для курсов валют.
    
    Проверяет:
    - Связь между моделью и API
    - Целостность данных
    """
    
    def setUp(self):
        """Настройка тестового клиента."""
        self.client = APIClient()
    
    def test_created_rate_available_via_api(self):
        """
        Тест: Созданная запись доступна через API.
        
        Интеграционный тест: модель -> API.
        """
        # Создание записи курса
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('96.0000'),
            tomorrow=Decimal('96.5000'),
            delta=Decimal('0.5000')
        )
        
        # Запрос через API на сегодня
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(float(data['ДОЛЛАР']), 96.5000)
    
    def test_multiple_rates_different_currencies(self):
        """
        Тест: Несколько курсов для разных валют.
        
        Интеграционный тест: проверка полноты данных.
        """
        # Создание курсов для трёх валют
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.0000'),
            tomorrow=Decimal('95.5000'),
            delta=Decimal('0.5000')
        )
        Rate.objects.create(
            currency='ЕВРО',
            today=Decimal('100.0000'),
            tomorrow=Decimal('100.5000'),
            delta=Decimal('0.5000')
        )
        Rate.objects.create(
            currency='ФУНТ',
            today=Decimal('110.0000'),
            tomorrow=Decimal('110.5000'),
            delta=Decimal('0.5000')
        )
        
        # Запрос через API
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        
        # Проверка наличия всех валют (3 курса + 3 delta = 6 ключей)
        self.assertIn('ДОЛЛАР', data)
        self.assertIn('ЕВРО', data)
        self.assertIn('ФУНТ', data)
        self.assertIn('ДОЛЛАР_delta', data)
        self.assertIn('ЕВРО_delta', data)
        self.assertIn('ФУНТ_delta', data)


# ============================================================================
# ГРАНИЧНЫЕ ТЕСТЫ ДЛЯ API
# ============================================================================

class RatesAPIBoundaryTests(TestCase):
    """
    Граничные тесты для API курсов.
    
    Проверяет:
    - Граничные значения курсов
    """
    
    def setUp(self):
        """Настройка тестового клиента."""
        self.client = APIClient()
    
    def test_rate_zero_value(self):
        """
        Тест: Нулевое значение курса.
        
        Граничное условие: курс = 0.
        """
        Rate.objects.create(
            currency='ТЕСТ',
            today=Decimal('0.0000'),
            tomorrow=Decimal('0.0000'),
            delta=Decimal('0.0000')
        )
        
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        self.assertEqual(float(data['ТЕСТ']), 0.0)
    
    def test_rate_very_large_delta(self):
        """
        Тест: Очень большое изменение курса.
        
        Граничное условие: большая дельта.
        """
        Rate.objects.create(
            currency='ТЕСТ',
            today=Decimal('100.0000'),
            tomorrow=Decimal('150.0000'),
            delta=Decimal('50.0000')  # Большое изменение
        )
        
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        self.assertEqual(float(data['ТЕСТ_delta']), 50.0)
    
    def test_rate_negative_large_delta(self):
        """
        Тест: Большое отрицательное изменение курса.
        
        Граничное условие: большая отрицательная дельта.
        """
        Rate.objects.create(
            currency='ТЕСТ',
            today=Decimal('100.0000'),
            tomorrow=Decimal('50.0000'),
            delta=Decimal('-50.0000')
        )
        
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        self.assertEqual(float(data['ТЕСТ_delta']), -50.0)


# ============================================================================
# ТЕСТЫ КЛАССОВ ЭКВИВАЛЕНТНОСТИ
# ============================================================================

class RatesEquivalenceClassTests(TestCase):
    """
    Тесты классов эквивалентности для курсов.
    
    Проверяет:
    - Различные типы изменений
    """
    
    def setUp(self):
        """Настройка тестового клиента."""
        self.client = APIClient()
    
    def test_rising_rates(self):
        """
        Тест: Растущие курсы.
        
        Класс эквивалентности: все валюты растут.
        """
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.0000'),
            tomorrow=Decimal('96.0000'),
            delta=Decimal('1.0000')
        )
        
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        self.assertTrue(float(data['ДОЛЛАР_delta']) > 0)
    
    def test_falling_rates(self):
        """
        Тест: Падающие курсы.
        
        Класс эквивалентности: все валюты падают.
        """
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('96.0000'),
            tomorrow=Decimal('95.0000'),
            delta=Decimal('-1.0000')
        )
        
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        self.assertTrue(float(data['ДОЛЛАР_delta']) < 0)
    
    def test_mixed_rates(self):
        """
        Тест: Смешанные изменения курсов.
        
        Класс эквивалентности: разные направления изменения.
        """
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('95.0000'),
            tomorrow=Decimal('96.0000'),
            delta=Decimal('1.0000')  # Рост
        )
        Rate.objects.create(
            currency='ЕВРО',
            today=Decimal('101.0000'),
            tomorrow=Decimal('100.0000'),
            delta=Decimal('-1.0000')  # Падение
        )
        
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        self.assertTrue(float(data['ДОЛЛАР_delta']) > 0)
        self.assertTrue(float(data['ЕВРО_delta']) < 0)