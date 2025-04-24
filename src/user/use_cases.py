from .repository import UserRepositoryInterface, UserInMemoryRepositoryInterface
from .models import User

class UserUseCase:
    def __init__(self, user_repository: UserRepositoryInterface, user_in_memory_repository: UserInMemoryRepositoryInterface):
        self._user_repository = user_repository
        self._user_in_memory_repository = user_in_memory_repository


    def set_peer_user_info_use_case(self, user: User, user_peer_id: str):
        user_entity = user.to_domain()
        print(type(user_entity.avatar))
        self._user_in_memory_repository.set_peer_user_info(user_peer_id, user_entity.first_name, user_entity.last_name, user_entity.avatar.url)

    
    def get_user_info_by_peer_id_use_case(self, user_peer_id: str):
        return self._user_in_memory_repository.get_user_info_by_peer_id(user_peer_id)


        