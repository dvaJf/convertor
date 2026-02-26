from django.urls import path
from . import views

urlpatterns = [
    path('rates/', views.rates_by_date),
]
