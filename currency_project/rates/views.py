"""
Представления для работы с курсами валют

Данный модуль содержит API-представления для получения информации
о курсах валют на указанную дату.

Автор: [Автор проекта]
Дата создания: [Дата]
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from .models import Rate
from datetime import datetime, timedelta


@csrf_exempt
def rates_by_date(request):
    """
    Получение курсов валют на указанную дату.
    
    Обрабатывает GET-запрос для получения информации о курсах валют
    (USD, EUR, GBP) и их изменениях относительно предыдущего дня.
    Декоратор @csrf_exempt отключает проверку CSRF-токена.
    
    Параметры:
        request (HttpRequest): Объект HTTP-запроса.
            Метод: GET
            GET-параметры:
                - date (str, optional): Дата в формате 'YYYY-MM-DD'.
                    Если не указана, используется вчерашняя дата.
    
    Возвращает:
        JsonResponse: JSON-ответ с курсами валют.
            При успешном запросе:
                Статус: 200 OK
                Структура данных:
                    {
                        "ДОЛЛАР": <курс USD>,
                        "ДОЛЛАР_DELTA": <изменение USD>,
                        "ЕВРО": <курс EUR>,
                        "ЕВРО_DELTA": <изменение EUR>,
                        "ФУНТ": <курс GBP>,
                        "ФУНТ_DELTA": <изменение GBP>
                    }
            При отсутствии данных:
                Статус: 404 Not Found
                Пример: {"error": "Нет курсов на дату 2026-01-15"}
    
    Примеры использования:
        GET /api/rates/?date=2026-01-15
        GET /api/rates/ (вернёт курсы за вчерашний день)
    """
    # Получение даты из параметров запроса
    date_str = request.GET.get('date')
    
    if date_str:
        # Парсинг даты из строки запроса
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
    else:
        # Использование вчерашней даты по умолчанию
        # (курсы обычно публикуются за предыдущий рабочий день)
        date_obj = now().date() - timedelta(days=1)

    # Выборка курсов валют из базы данных за указанную дату
    # Используем __date lookup для сравнения только даты (без времени)
    rates = Rate.objects.filter(parsed_time__date=date_obj)

    # Проверка наличия данных
    if not rates.exists():
        return JsonResponse({"error": f"Нет курсов на дату {date_obj}"}, status=404)

    # Формирование словаря с данными о курсах
    data = {}

    for rate in rates:
        # Добавление курса на завтрашний день
        data[rate.currency] = float(rate.tomorrow)
        # Добавление изменения курса (дельта) с суффиксом _delta
        data[rate.currency + "_delta"] = float(rate.delta)

    return JsonResponse(data)