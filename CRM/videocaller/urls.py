from django.urls import path
from . import views

app_name = 'videocaller'

urlpatterns = [
    path('', views.CallsMailPageView.as_view(), name='calls'),
]