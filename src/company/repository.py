from abc import ABC, abstractmethod

from user.models import User
from .models import UserCompany, Company


class UserCompanyRepositoryInterface(ABC):
    @abstractmethod
    def add_user_to_company(self, user: User, company: Company) -> None:
        pass

    @abstractmethod
    def get_model_object_by_user(self, user: User) -> UserCompany:
        pass

class UserCompanyRepository(UserCompanyRepositoryInterface):
    def __init__(self) -> None:
        self._user_company_model = UserCompany


    def add_user_to_company(self, user: User, company: Company) -> None:
        self._user_company_model.objects.create(user=user, company=company)

    
    def get_model_object_by_user(self, user: User) -> UserCompany:
        return self._user_company_model.objects.get(user=user)

