from django.db import models

from user.models import User
from .domain import UserCompanyEntity


class Company(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=100)
    company_id = models.ForeignKey(Company, on_delete=models.CASCADE)


class UserCompany(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)

    @classmethod
    def from_domain(cls, user_company: UserCompanyEntity):
        return cls(
            user=user_company.user,
            company=user_company.company,
            department=user_company.department
        )

    def to_domain(self) -> UserCompanyEntity:
        try:
            department_id = self.department.id
        except:
            department_id = None
        return UserCompanyEntity(
            user=self.user.id,
            company=self.company.id,
            department=department_id
        )

    
