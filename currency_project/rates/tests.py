"""
Юнит-тесты для приложения rates

Данный модуль содержит тесты для:
- Модели Rate
- API получения курсов валют (rates_by_date)

"""

from django.test import TestCase
from django.utils.timezone import now
from rest_framework.test import APIClient
from rest_framework import status
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Rate

class RateModelTest(TestCase):
    def test_create_rate_with_valid_data(self):
        """
        Тест: Создание записи курса с валидными данными.
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
        self.assertIsNotNone(rate.parsed_time)

class RatesAPITest(TestCase):
    """
    Тесты API получения курсов валют.
    """
    
    def setUp(self):
        self.client = APIClient()
    
    def test_get_rates_success(self):
        """
        Тест: Успешное получение курсов.
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
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('ДОЛЛАР', data)
        self.assertEqual(float(data['ДОЛЛАР']), 95.5000)
    
    def test_rates_response_includes_delta(self):
        """
        Тест: Ответ API включает изменение курса (delta).
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

    def test_get_rates_nonexistent_date(self):
        """
        Тест: Запрос курсов на несуществующую дату.
        """

        nonexistent_date = datetime(2020, 1, 1).date()
        url = f"/api/rates/?date={nonexistent_date.isoformat()}"
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.json())
    
    def test_get_rates_future_date(self):
        """
        Тест: Запрос курсов на будущую дату.
        """
        future_date = (now().date() + timedelta(days=365))
        url = f"/api/rates/?date={future_date.isoformat()}"
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class RatesIntegrationTest(TestCase):
    def setUp(self):

        self.client = APIClient()
    
    def test_created_rate_available_via_api(self):
        """
        Тест: Созданная запись доступна через API.
        """
        Rate.objects.create(
            currency='ДОЛЛАР',
            today=Decimal('96.0000'),
            tomorrow=Decimal('96.5000'),
            delta=Decimal('0.5000')
        )
        
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(float(data['ДОЛЛАР']), 96.5000)
    
    def test_multiple_rates_different_currencies(self):
        """
        Тест: Несколько курсов для разных валют.
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
            tomorrow=Decimal('100.5000'),
            delta=Decimal('0.5000')
        )
        Rate.objects.create(
            currency='ФУНТ',
            today=Decimal('110.0000'),
            tomorrow=Decimal('110.5000'),
            delta=Decimal('0.5000')
        )
        today = now().date()
        url = f"/api/rates/?date={today.isoformat()}"
        response = self.client.get(url)
        
        data = response.json()
        self.assertIn('ДОЛЛАР', data)
        self.assertIn('ЕВРО', data)
        self.assertIn('ФУНТ', data)
        self.assertIn('ДОЛЛАР_delta', data)
        self.assertIn('ЕВРО_delta', data)
        self.assertIn('ФУНТ_delta', data)