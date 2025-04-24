import base64
import hashlib
from abc import ABC, abstractmethod

from .models import UniqueNumbersGenerationSequence
from core.repository import InMemoryProvider

class CallsInMemoryRepositoryInterface(ABC):


    @abstractmethod
    def create_private_call(self, call_url: str, user_id_1: int, user_id_2: int) -> None:
        pass


    @abstractmethod
    def is_user_in_call_users_list(self, private_call_id: str, user_id: int) -> bool:
        pass


    @abstractmethod
    def get_company_id_by_call_id(self, group_call_id: str) -> int:
        pass


    @abstractmethod
    def create_group_call(self, group_call_id: str, company_id: int) -> None:
        pass


    @abstractmethod
    def set_group_call_admin(self, group_call_id: str, admin_user_id: int) -> None:
        pass


    @abstractmethod
    def get_group_call_admin(self, call_id: str) -> str:
        pass


class CallsInMemoryRepository(CallsInMemoryRepositoryInterface):
    def __init__(self, in_memory_client: InMemoryProvider) -> None:
        self._in_memory_client = in_memory_client


    def create_private_call(self, call_url: str, user_id_1: int, user_id_2: int) -> None:
        self._in_memory_client.add_values_to_list(call_url, [user_id_1, user_id_2])
  

    def is_user_in_call_users_list(self, private_call_id: str, user_id: int) -> bool:
        call_users_list = self._in_memory_client.get_all_values_from_list(private_call_id)
        print(call_users_list)
        return str(user_id) in call_users_list
    

    def get_company_id_by_call_id(self, group_call_id: str) -> int:
        return self._in_memory_client.get_value_by_key(group_call_id)
    

    def create_group_call(self, group_call_id: str, company_id: int) -> None:
        self._in_memory_client.set_keyvalue(group_call_id, company_id)

    
    def set_group_call_admin(self, call_id: str, admin_user_id: int) -> None:
        self._in_memory_client.set_keyvalue('admin_of_call_' + call_id, admin_user_id)

    
    def get_group_call_admin(self, call_id: str) -> str:
        return self._in_memory_client.get_value_by_key('admin_of_call_' + call_id)

        
def generate_url():
    sequence = UniqueNumbersGenerationSequence()
    unique_number = sequence.get_next_value()
    orig_id = str(unique_number).encode('utf-8')  
    hash_object = hashlib.sha256(orig_id)
    hash_digest = hash_object.digest()
    url = base64.urlsafe_b64encode(hash_digest)
    url = url.decode('utf-8')
    return url
    
