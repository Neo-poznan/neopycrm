import os

from django.views import View
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseBadRequest, FileResponse
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin

from config.settings import BASE_DIR




from django.views.decorators.csrf import csrf_exempt
from .use_case import CallsUseCase


class CallsMailPageView(LoginRequiredMixin, TemplateView):
    template_name = 'videocaller/calls_main_page.html'

    def get_context_data(self, **kwargs):
        use_case = CallsUseCase()
        return use_case.get_context_for_calls_main_page(self.request.user)
    

class PrivateCallCreationView(LoginRequiredMixin, View):
    def get(self, request):
        return HttpResponseBadRequest('Bad request')
    
    def post(self, request):
        use_case = CallsUseCase()
        new_call_url = use_case.private_call_creation_use_case(user_id=self.request.user.id, interlocutor_id=int(request.POST['interlocutor_id']))

        return HttpResponseRedirect(reverse_lazy('videocaller:private_call', args=[new_call_url]))


def private_call_room_view(request, call_id):
    use_case = CallsUseCase()
    print(request.user)
    if not use_case.private_call_room_use_case(call_id=call_id, user_id=request.user.id):
        return HttpResponseBadRequest('Bad request')
    
    return render(request, 'videocaller/private_call_room.html', {'call_id': call_id})


def receive_view(request):
    return render(request, 'videocaller/receive.html', {'user_id': '1'})

def react_view(request):
    return FileResponse(open(os.path.join(BASE_DIR, 'static/react/build/index.html'), 'rb'))





