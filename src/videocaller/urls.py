from django.urls import re_path, path
from . import views

app_name = 'videocaller'

urlpatterns = [
    path('create-group-call/', views.GroupCallCreationView.as_view(), name='create_group_call'),
    path('group-call-authorization/<str:call_id>/', views.group_call_authorization_view, name='group_call_authorization'),
    re_path(r'.*$', views.react_view, name='react'),
]

