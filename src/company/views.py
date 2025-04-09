from django.views.generic import FormView, TemplateView
from django.urls import reverse_lazy
from django.shortcuts import render

from .forms import CompanyCreationForm
from .use_cases import CompanyUseCase
from user.repository import UserRepository
from .repository import UserCompanyRepository
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.csrf import ensure_csrf_cookie

def index_view(request):
    return render(request, 'company/index.html')


class CompanyCreationView(FormView):
    template_name = 'company/create_company.html'
    form_class = CompanyCreationForm
    success_url = reverse_lazy('company:index')

    def form_valid(self, form):
        company = form.save(commit=False)
        company.save()
        user = self.request.user
        use_case = CompanyUseCase(UserCompanyRepository(), UserRepository())
        use_case.company_creation_use_case(company, user)
    
        return super().form_valid(form)



