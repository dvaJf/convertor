from django.urls import path
from .views import RegisterAPIView, LoginAPIView, UserProfileAPIView
urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='api-register'),
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('profile/', UserProfileAPIView.as_view(), name='api-profile'),
]
