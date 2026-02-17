from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from .models import Rate
from datetime import datetime
from datetime import timedelta

@csrf_exempt
def rates_by_date(request):
    date_str = request.GET.get('date')

    if date_str:
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return JsonResponse(
                {"error": "Некорректная дата, используйте формат YYYY-MM-DD"},
                status=400
            )
    else:
        date_obj = now().date() - timedelta(days=1) 

    rates = Rate.objects.filter(parsed_time=date_obj)
    
    if not rates.exists():
        return JsonResponse({"error": f"Нет курсов на дату {date_obj}"}, status=404)

    data = {}

    for rate in rates:
        data[rate.currency] = float(rate.tomorrow)
        data[rate.currency+"_delta"] = float(rate.delta)

    return JsonResponse(data)
