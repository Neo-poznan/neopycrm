from django.urls import path
from . import views

app_name = 'user'

urlpatterns = [
    path('registration/', views.RegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('profile/', views.UserUpdateView.as_view(), name='profile'),
    path('change-password/', views.UserPasswordChangeView.as_view(), name='change_password'),
    path('password-change-done/', views.UserPasswordChangeDoneView.as_view(), name='password_change_done'),
]