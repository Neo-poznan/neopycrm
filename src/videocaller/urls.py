from django.urls import re_path
from . import views

app_name = 'videocaller'

urlpatterns = [
    re_path(r'.*$', views.react_view, name='react'),
]