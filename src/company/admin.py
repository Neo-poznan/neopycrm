from django.contrib import admin

from django.contrib import admin
from .models import UserCompany, Company
from .forms import UserProfileForm


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "company":
            current_user = request.user
            print(current_user)
            current_user_company = UserCompany.objects.get(user=current_user.id).company
            print(current_user_company)
            kwargs["queryset"] = Company.objects.filter(id=current_user_company.id)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

admin.site.register(UserCompany, UserProfileAdmin)

