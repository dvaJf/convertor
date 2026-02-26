from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from .models import Rate
from datetime import datetime, timedelta


@csrf_exempt
def rates_by_date(request):
    """
    Получение курсов валют на указанную дату.
    """

    date_str = request.GET.get('date')
    
    if date_str:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
    else:
        date_obj = now().date() - timedelta(days=1)

    rates = Rate.objects.filter(parsed_time__date=date_obj)

    if not rates.exists():
        return JsonResponse({"error": f"Нет курсов на дату {date_obj}"}, status=404)

    data = {}

    for rate in rates:
        data[rate.currency] = float(rate.tomorrow)
        data[rate.currency + "_delta"] = float(rate.delta)

    return JsonResponse(data)