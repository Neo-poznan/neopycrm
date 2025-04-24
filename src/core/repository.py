import redis
from abc import ABC, abstractmethod


from django.db.models import QuerySet

class InMemoryProvider(ABC):
    @abstractmethod
    def get_value_by_key(self, key):
        pass


    @abstractmethod
    def set_keyvalue(self, key, value):
        pass


    @abstractmethod
    def delete_keyvalue(self, key):
        pass


    @abstractmethod
    def add_value_to_list(self, list_name: str, value: str) -> None:
        pass


    @abstractmethod
    def delete_value_from_list_by_value(self, list_name: str, value: str) -> None:
        pass


    @abstractmethod
    def get_all_values_from_list(self, list_name: str) -> list:
        pass


    @abstractmethod
    def add_values_to_list(self, list_name: str, values: list) -> None:
        pass


    @abstractmethod
    def create_hashmap(self, hashmap_name: str, hashmap: dict):
        pass


    @abstractmethod
    def get_hashmap(self, hashmap_name: str):
        pass


class RedisInMemoryProvider(InMemoryProvider):
    def __init__(self, redis_client: redis.Redis) -> None:
        self.redis_client = redis_client


    def get_value_by_key(self, key):
        result = self.redis_client.get(key)
        return result.decode('utf-8') if result else None


    def set_keyvalue(self, key, value):
        return self.redis_client.set(key, value)


    def delete_keyvalue(self, key):
        return self.redis_client.delete(key)


    def create_list(self, list_name: str, value: str) -> None:
        self.redis_client.lpush(list_name, value)


    def add_value_to_list(self, list_name: str, value: str) -> None:
        self.redis_client.lpush(list_name, value)


    def delete_value_from_list_by_value(self, list_name: str, value: str) -> None:
        self.redis_client.lrem(list_name, 0, value)


    def get_all_values_from_list(self, list_name: str) -> list:
        byte_values_list = self.redis_client.lrange(list_name, 0, -1)
        return [value.decode('utf-8') for value in byte_values_list]
    
    
    def add_values_to_list(self, list_name: str, values: list) -> None:
        self.redis_client.lpush(list_name, *values)

    
    def create_hashmap(self, hashmap_name: str, hashmap: dict):
        self.redis_client.hmset(hashmap_name, hashmap)
    
    
    def get_hashmap(self, hashmap_name: str):
        hashmap_byte = self.redis_client.hgetall(hashmap_name)
        hashmap = {}
        for key in hashmap_byte.keys():
            hashmap[key.decode('utf-8')] = hashmap_byte[key].decode('utf-8')
        return hashmap


class InMemoryUserConnectionStatusRepositoryInterface(ABC):
    @abstractmethod
    def set_data_about_connected_to_websocket_user(self, user_id: int, sid: str) -> None:
        pass


    @abstractmethod
    def delete_data_about_connected_to_websocket_user(self, sid: str) -> None:
        pass


    @abstractmethod
    def get_connected_user_by_sid(self, sid: str) -> int:
        pass


    @abstractmethod
    def is_user_has_websocket_connections(self, user_id: int) -> bool:
        pass


    @abstractmethod
    def delete_all_user_connections(self, user_id: int) -> None:
        pass


    @abstractmethod
    def get_users_connections_statuses_dict(self, all_users_in_user_company: QuerySet) -> dict[int, bool]:
        pass


class InMemoryUserConnectionStatusRepository(InMemoryUserConnectionStatusRepositoryInterface):
    '''
    Этот класс не хранит булевый статус пользователя. Он просто 
    создает пары ключ-значение в случае если пользователь онлайн
    и удаляет их если нет. Это решение убирает необходимость хранить 
    статусы в БД, так как пользователь находится в сети только временно.
    '''
    def __init__(self, in_memory_client: InMemoryProvider) -> None:
        self._in_memory_client = in_memory_client


    def set_data_about_connected_to_websocket_user(self, user_id: str, sid: str) -> None:
        self._in_memory_client.set_keyvalue(sid, user_id)
        self._in_memory_client.add_value_to_list(user_id, sid)


    def delete_data_about_connected_to_websocket_user(self, sid: str) -> None:
        user_id = self._in_memory_client.get_keyvalue(sid)
        self._in_memory_client.delete_value_from_list_by_value(user_id, sid)
        self._in_memory_client.delete_keyvalue(sid)


    def get_connected_user_by_sid(self, sid: str) -> int:
        user_id = self._in_memory_client.get_keyvalue(sid)
        return user_id
    

    def is_user_has_websocket_connections(self, user_id: str) -> bool:
        user_connections_list = self._in_memory_client.get_all_values_from_list(str(user_id))
        return True if user_connections_list else False
    

    def delete_all_user_connections(self, user_id: str) -> None:
        user_connections_list = self._in_memory_client.get_all_values_from_list(str(user_id))
        for sid in user_connections_list:
            self._in_memory_client.delete_keyvalue(sid)
        self._in_memory_client.delete_keyvalue(user_id)
    

    def get_users_connections_statuses_dict(self, users: QuerySet) -> dict[int, bool]:
        users_connections_statuses_dict = {}
        for user in users:
            is_user_online = self.is_user_has_websocket_connections(user.id)
            users_connections_statuses_dict[user.id] = is_user_online
        return users_connections_statuses_dict

