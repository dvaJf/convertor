from django.urls import path
from .views import RegisterAPIView, login_view, logout_view, profile_view
urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='api-register'),
    path('login/', login_view, name='api-login'),
    path('profile/', profile_view, name='api-profile'),
    path('logout/', logout_view, name='api-logout'),
]
