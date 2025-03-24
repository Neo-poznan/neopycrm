import base64
import hashlib

from .models import UniqueNumbersGenerationSequence
from core.repository import RedisInMemoryProvider, InMemoryProvider

class CallsInMemoryRepository:
    def __init__(self, in_memory_client: InMemoryProvider) -> None:
        self._in_memory_client = in_memory_client

    def create_private_call(self, call_url: str, user_id_1: int, user_id_2: int) -> None:
        self._in_memory_client.add_values_to_list(call_url, [user_id_1, user_id_2])
  
    def is_user_in_call_users_list(self, call_id: str, user_id: int) -> bool:
        call_users_list = self._in_memory_client.get_all_values_from_list(call_id)
        print(call_users_list)
        return str(user_id) in call_users_list


def generate_call_url():
    sequence = UniqueNumbersGenerationSequence()
    unique_number = sequence.get_next_value()
    orig_id = str(unique_number).encode('utf-8')  
    hash_object = hashlib.sha256(orig_id)
    hash_digest = hash_object.digest()
    url = base64.urlsafe_b64encode(hash_digest)
    url = url.decode('utf-8')
    return url
    
