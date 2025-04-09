from .repository import UserCompanyRepositoryInterface
from user.repository import UserRepositoryInterface

from .models import Company
from user.models import User

class CompanyUseCase:
    def __init__(
            self,
            user_company_repository: UserCompanyRepositoryInterface,
            user_repository: UserRepositoryInterface
            ):
        self._user_company_repository = user_company_repository
        self._user_repository = user_repository

    def company_creation_use_case(self, company: Company, user: User) -> None:
        self._user_company_repository.add_user_to_company(user=user, company=company)
        user_entity = user.to_domain()
        user_entity.upgrade_to_superuser()
        self._user_repository.save_user_from_entity(user_entity)

