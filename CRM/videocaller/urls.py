from django.urls import path
from . import views

app_name = 'videocaller'

urlpatterns = [
    path('', views.CallsMailPageView.as_view(), name='calls'),
    path('create-private-call/', views.PrivateCallCreationView.as_view(), name='private_call_creation'),
    path('private-call/<str:call_id>/' , views.private_call_room_view, name='private_call'),
    path('receive/', views.receive_view, name='receive'),
]