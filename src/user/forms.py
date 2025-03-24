from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms
from .models import User

class RegisterForm(UserCreationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'username',
        'id': 'username-id-for-label',
        'placeholder':"Логин",
        'required': True
    }))

    first_name = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'firstname',
        'id': 'firstname-id-for-label',
        'placeholder':"Имя",
        'required': True
    }))

    last_name = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'lastname',
        'id': 'lastname-id-for-label',
        'placeholder': "Фамилия",
        'required': True
    }))

    email = forms.EmailField(widget=forms.EmailInput(attrs={
        'class': 'email',
        'id': 'email-id-for-label',
        'placeholder':"email",
        'required': True
    }))

    password1 = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'password',
        'id': 'password-id-for-label',
        'placeholder':"Пароль",
        'required': True
    }))

    password2 = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'password-repeat',
        'id': 'password-repeat-id-for-label',
        'placeholder':"Повторите пароль",
        'required': True
    }))

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Пользователь с таким email уже существует")
        return email

    class Meta:
        model = User
        fields = ['username','first_name', 'last_name', 'email', 'password1', 'password2']


class LoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'email',
        'id': 'email-id-for-label',
        'placeholder':"email",
        'required': True
    }))

    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'password',
        'id': 'password-id-for-label',
        'placeholder':"Пароль",
        'required': True
    }))


    class Meta:
        model = User
        fields = ['username', 'password']


class UserUpdateForm(forms.ModelForm):
    username = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'username',
        'id': 'username-id-for-label',
        'placeholder':"Логин",
        'required': True
    }))

    first_name = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'firstname',
        'id': 'firstname-id-for-label',
        'placeholder':"Имя",
        'required': True
    }))

    last_name = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'lastname',
        'id': 'lastname-id-for-label',
        'placeholder': "Фамилия",
        'required': True
    }))

    email = forms.EmailField(widget=forms.EmailInput(attrs={
        'class': 'email',
        'id': 'email-id-for-label',
        'placeholder':"email",
        'required': True
    }))

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']

