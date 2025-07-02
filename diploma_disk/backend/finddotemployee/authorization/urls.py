from django.urls import path

from .views import RegistrationAPIView, LoginAPIView, CustomUserRetrieveUpdateAPIView, RefreshAPIView


app_name = 'authorization'
urlpatterns = [
    path('registration/', RegistrationAPIView.as_view()),
    path('login/', LoginAPIView.as_view()),
    path('user/', CustomUserRetrieveUpdateAPIView.as_view()),
    path('refresh/', RefreshAPIView.as_view())
]
