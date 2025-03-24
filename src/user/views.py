from django.views.generic import CreateView, UpdateView
from django.contrib.auth.views import LoginView, LogoutView, PasswordChangeView, PasswordChangeDoneView
from django.contrib.auth.forms import PasswordChangeForm
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin

from .forms import RegisterForm, LoginForm, UserUpdateForm


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


class UserPasswordChangeView(LoginRequiredMixin,PasswordChangeView):
    form_class = PasswordChangeForm
    template_name = 'user/change_password.html'
    success_url = reverse_lazy('user:password_change_done')


class UserPasswordChangeDoneView(PasswordChangeDoneView):
    template_name = 'user/password_change_done.html'

