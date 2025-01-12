from django.db import models
from django.contrib.auth.models import AbstractUser

from company.models import Department, Company

class User(AbstractUser):
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)


