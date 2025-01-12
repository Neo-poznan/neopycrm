import redis


from user.models import User
from core.repository import RedisInMemoryProvider, InMemoryUserConnectionStatusRepository
from user.repository import UserDatabaseRepository

class CallsUseCase:
    def __init__(self):
        self._in_memory_repository = InMemoryUserConnectionStatusRepository(RedisInMemoryProvider(redis.Redis(host='localhost', port=6379, db=0)))
        self._user_database_repository = UserDatabaseRepository()
    def get_context_for_calls_main_page(self, user: User) -> dict[int, bool]:
        all_users_in_user_company = self._user_database_repository.get_all_users_in_user_company_order_by_department(user=user)
        print(all_users_in_user_company)
        return {
            'users_for_private_call':all_users_in_user_company,
            'is_user_online_dict': self._in_memory_repository.get_users_connections_statuses_dict(all_users_in_user_company)
            }
    
    