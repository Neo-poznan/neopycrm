from abc import ABC, abstractmethod

from user.models import User
from django.db.models import QuerySet
from .domain import UserEntity
from core.repository import InMemoryProvider


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


class UserInMemoryRepositoryInterface(ABC):
    @abstractmethod
    def set_peer_user_info(self, peer_id: str, first_name: str, last_name: str, avatar_url: str):
        pass


    @abstractmethod
    def get_user_info_by_peer_id(self, peer_id: str):
        pass


class UserInMemoryRepository(UserInMemoryRepositoryInterface):
    def __init__(self, in_memory_client: InMemoryProvider):
        self._in_memory_client = in_memory_client

    
    def set_peer_user_info(self, peer_id: str, first_name: str, last_name: str, avatar_url: str):
        self._in_memory_client.create_hashmap(peer_id, {'first_name': first_name, 'last_name': last_name, 'avatar_url': avatar_url})

    
    def get_user_info_by_peer_id(self, peer_id: str):
        return self._in_memory_client.get_hashmap(peer_id)

