import redis

from user.models import User

from .repository import InMemoryUserConnectionStatusRepository, RedisInMemoryProvider

class UserConnectionStatusUseCase:

    def __init__(self):
        self._redis_client = RedisInMemoryProvider(redis.Redis(host='localhost', port=6379, db=0))
        self._in_memory_repository = InMemoryUserConnectionStatusRepository(self._redis_client)
    
    def is_user_has_websocket_connections(self, user_id: int) -> bool:
        return self._in_memory_repository.is_user_has_websocket_connections(user_id)
    
    def set_data_about_connected_to_websocket_user(self, user_id: str, sid: str) -> None:
        self._in_memory_repository.set_data_about_connected_to_websocket_user(user_id, sid)

    def pop_data_about_connected_to_websocket_user(self, sid: str) -> int:
        user_id = self._in_memory_repository.get_connected_user_by_sid(sid)
        self._in_memory_repository.delete_data_about_connected_to_websocket_user(sid)
        return user_id
    
    def is_user_has_websocket_connections(self, user_id: int) -> bool:
        return self._in_memory_repository.is_user_has_websocket_connections(user_id)
    



    