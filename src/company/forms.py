from django import forms
from django.forms import ModelForm

from .models import Company, UserCompany

class CompanyCreationForm(ModelForm):
    name = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'form-field'
    }))

    class Meta:
        model = Company
        fields = ['name']


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserCompany
        fields = ['company', 'user']

    def __init__(self, *args, user=None, **kwargs):
        super(UserProfileForm, self).__init__(*args, **kwargs)
        self.user = user
        print(self.user)
        if user:

            current_user_company = UserCompany.objects.get(user=user)
            # Ограничиваем выбор компании только своей

            self.fields['company'].queryset = Company.objects.filter(id=current_user_company.company.id)
    
