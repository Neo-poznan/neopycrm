import json
import redis

from django.views.generic import CreateView, UpdateView, View
from django.contrib.auth.views import LoginView, LogoutView, PasswordChangeView, PasswordChangeDoneView
from django.contrib.auth.forms import PasswordChangeForm
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponseBadRequest

from core.repository import RedisInMemoryProvider
from .forms import RegisterForm, LoginForm, UserUpdateForm
from .use_cases import UserUseCase
from.repository import UserInMemoryRepository, UserRepository 


class RegistrationView(CreateView):
    form_class = RegisterForm
    template_name = 'user/register.html'

    def get_success_url(self) -> str:
        return reverse_lazy('user:login')
    

class UserLoginView(LoginView):
    template_name = 'user/login.html'
    form_class = LoginForm

    def get_success_url(self) -> str:
        return '/'


class UserLogoutView(LogoutView):
    next_page = '/'


class UserUpdateView(LoginRequiredMixin,UpdateView):
    form_class = UserUpdateForm
    template_name = 'user/profile.html'

    def get_object(self):
        return self.request.user
    
    success_url = reverse_lazy('user:profile')


class UserPasswordChangeView(LoginRequiredMixin,PasswordChangeView):
    form_class = PasswordChangeForm
    template_name = 'user/change_password.html'
    success_url = reverse_lazy('user:password_change_done')


class UserPasswordChangeDoneView(PasswordChangeDoneView):
    template_name = 'user/password_change_done.html'


class SetPeerUserInfo(LoginRequiredMixin, View):
    def get(self, request):
        return HttpResponseBadRequest('Invalid request method'); 


    def post(self, request):
        post_data = request.body.decode('utf-8')
        print(post_data)
        post_data_json = json.loads(post_data)
        user_peer_id = post_data_json['peer_id']
        use_case = UserUseCase(UserRepository(), UserInMemoryRepository(RedisInMemoryProvider(redis.Redis())))
        use_case.set_peer_user_info_use_case(self.request.user, user_peer_id)
        return JsonResponse({'status': 'success'})


def get_user_info_by_peer_id_view(request, peer_id):
    use_case = UserUseCase(UserRepository(), UserInMemoryRepository(RedisInMemoryProvider(redis.Redis())))
    user_info = use_case.get_user_info_by_peer_id_use_case(peer_id)
    return JsonResponse(user_info)

