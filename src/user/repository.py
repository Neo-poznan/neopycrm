from abc import ABC, abstractmethod

from user.models import User
from django.db.models import QuerySet
from .domain import UserEntity


class UserRepositoryInterface(ABC):
    @abstractmethod
    def get_all_users_in_user_company_order_by_department(self, user: User) -> QuerySet[User]:
        pass

    @abstractmethod
    def save_user_from_entity(self, user_entity: UserEntity) -> None:
        pass


class UserRepository(UserRepositoryInterface):
    def __init__(self):
        self._user_model = User


    def get_all_users_in_user_company_order_by_department(self, user: User) -> QuerySet[User]:
        return self._user_model.objects.filter(company=user.company).exclude(id=user.id).order_by('department')
    
    def save_user_from_entity(self, user_entity: UserEntity) -> None:
        user = self._user_model.from_domain(user_entity)
        user.save()

       
    
    