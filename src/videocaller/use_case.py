import redis


from user.models import User
from user.repository import UserRepositoryInterface
from .repository import CallsInMemoryRepositoryInterface, generate_url
from company.repository import UserCompanyRepositoryInterface

class CallsUseCase:


    def __init__(
                self, user_repository: UserRepositoryInterface,
                user_company_repository: UserCompanyRepositoryInterface,
                calls_in_memory_repository: CallsInMemoryRepositoryInterface
                 ):
        self._user_database_repository = user_repository
        self._calls_in_memory_repository = calls_in_memory_repository
        self._user_company_repository = user_company_repository


    def private_call_room_use_case(self, call_id: str, user_id: int) -> dict:
        return self._calls_in_memory_repository.is_user_in_call_users_list(call_id=call_id, user_id=user_id)
    

    def group_call_creation_use_case(self, user: User) -> str:
        call_id = generate_url()
        company_id = self._user_company_repository.get_model_object_by_user(user).company.id
        self._calls_in_memory_repository.create_group_call(call_id, company_id)
        return call_id
    
    def group_call_authorization_use_case(self, user: User, call_id: str) -> bool:
        user_company = self._user_company_repository.get_model_object_by_user(user=user)
        user_company_entity = user_company.to_domain()
        print(type(user_company_entity.company))
        
        company_id = int(self._calls_in_memory_repository.get_company_id_by_call_id(call_id))
        print(type(company_id))

        return user_company_entity.is_user_in_company(company_id)

