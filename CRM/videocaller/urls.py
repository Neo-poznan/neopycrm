from django.urls import path
from . import views

app_name = 'videocaller'

urlpatterns = [
    path('', views.CallsMailPageView.as_view(), name='calls'),
    #path('private-call/<call_id:str>/' , views.PrivateCallRoomView.as_view(), name='private_call'),
]