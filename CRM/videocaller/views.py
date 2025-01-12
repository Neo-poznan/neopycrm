import redis

from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import get_user_model

from .models import HashGenerationSequence
from .use_case import CallsUseCase




class CallsMailPageView(LoginRequiredMixin, TemplateView):
    template_name = 'videocaller/calls_main_page.html'

    def get_context_data(self, **kwargs):
        context = {}
        use_case = CallsUseCase()
        return use_case.get_context_for_calls_main_page(self.request.user)
    
def create_private_call_room(request):
    sequence = HashGenerationSequence()
    new_call_url = HashGenerationSequence.get_hash()
    return HttpResponseRedirect(reverse_lazy('videocaller:private_call', args=[new_call_url]))




def private_call_room_view(request, call_id):

    return render(request, 'videocaller/private_call_room.html')

