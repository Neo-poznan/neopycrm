import redis


from user.models import User
from core.repository import RedisInMemoryProvider, InMemoryUserConnectionStatusRepository
from user.repository import UserDatabaseRepository
from .repository import CallsInMemoryRepository, generate_call_url

class CallsUseCase:
    def __init__(self):
        self._user_connection_status_in_memory_repository = InMemoryUserConnectionStatusRepository(RedisInMemoryProvider(redis.Redis(host='localhost', port=6379, db=0)))
        self._user_database_repository = UserDatabaseRepository()
        self._calls_in_memory_repository = CallsInMemoryRepository(RedisInMemoryProvider(redis.Redis(host='localhost', port=6379, db=0)))
    def get_context_for_calls_main_page(self, user: User) -> dict[int, bool]:
        all_users_in_user_company = self._user_database_repository.get_all_users_in_user_company_order_by_department(user=user)
        print(all_users_in_user_company)
        return {
            'users_for_private_call':all_users_in_user_company,
            'is_user_online_dict': self._user_connection_status_in_memory_repository.get_users_connections_statuses_dict(all_users_in_user_company)
            }
    
    def private_call_creation_use_case(self, user_id: int, interlocutor_id: int) -> str:
        call_url = generate_call_url()
        self._calls_in_memory_repository.create_private_call(call_url=call_url, user_id_1=user_id, user_id_2=interlocutor_id)
        return call_url
    
    def private_call_room_use_case(self, call_id: str, user_id: int) -> dict:
        return self._calls_in_memory_repository.is_user_in_call_users_list(call_id=call_id, user_id=user_id)

