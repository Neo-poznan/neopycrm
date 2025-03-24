from abc import ABC, abstractmethod

from user.models import User
from django.db.models import QuerySet


class UserDatabaseRepositoryInterface(ABC):
    @abstractmethod
    def get_all_users_in_user_company_order_by_department(self, user: User) -> QuerySet[User]:
        pass


class UserDatabaseRepository(UserDatabaseRepositoryInterface):
    def get_all_users_in_user_company_order_by_department(self, user: User) -> QuerySet[User]:
        return User.objects.filter(company=user.company).exclude(id=user.id).order_by('department')
    
    