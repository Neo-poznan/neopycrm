import os

from django.views import View
from django.http import HttpResponseRedirect, HttpResponseBadRequest, FileResponse, JsonResponse, HttpResponseForbidden
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required


from config.settings import BASE_DIR

from .use_case import CallsUseCase
from .repository import CallsInMemoryRepository
from user.repository import UserRepository
from company.repository import UserCompanyRepository
from core.repository import RedisInMemoryProvider, redis


class PrivateCallCreationView(LoginRequiredMixin, View):


    def get(self, request):
        return HttpResponseBadRequest('Invalid request method for this link')


    def post(self, request):
        use_case = CallsUseCase(
            user_repository=UserRepository,
            user_company_repository=UserCompanyRepository,
            calls_in_memory_repository=CallsInMemoryRepository(in_memory_client=RedisInMemoryProvider(redis.Redis))
            )
        new_call_url = use_case.private_call_creation_use_case(user_id=self.request.user.id, interlocutor_id=int(request.POST['interlocutor_id']))

        return HttpResponseRedirect(reverse_lazy('videocaller:private_call', args=[new_call_url]))


class GroupCallCreationView(LoginRequiredMixin, View):


    def get(self, request):
        return HttpResponseBadRequest('Invalid request method for this link')
    

    def post(self, request):
        use_case = CallsUseCase(
            user_repository=UserRepository(),
            user_company_repository=UserCompanyRepository(),
            calls_in_memory_repository=CallsInMemoryRepository(in_memory_client=RedisInMemoryProvider(redis_client=redis.Redis()))
            )
        call_url = use_case.group_call_creation_use_case(self.request.user)       
        return JsonResponse({'call_id': call_url})
    

@login_required
def group_call_authorization_view(request, call_id):
        use_case = CallsUseCase(
            user_repository=UserRepository(),
            user_company_repository=UserCompanyRepository(),
            calls_in_memory_repository=CallsInMemoryRepository(in_memory_client=RedisInMemoryProvider(redis.Redis()))
            )
        try:
            is_user_call_admin = use_case.group_call_authorization_use_case(request.user, call_id)
        except Exception as e:
            return HttpResponseForbidden('<h1>403 Forbidden</h1>')
        return JsonResponse({'is_admin': is_user_call_admin})
     

@login_required
def react_view(request):
    return FileResponse(open(os.path.join(BASE_DIR, 'static/react/build/index.html'), 'rb'))
