from django.urls import path
from . import views

app_name = 'company'

urlpatterns = [
    path('', views.index_view, name='index'),
    path('create_company/', views.CompanyCreationView.as_view(), name='create_company'),
]

