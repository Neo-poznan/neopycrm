import redis
import socketio
import eventlet
 
eventlet.monkey_patch()

redis_client = redis.Redis(host='localhost', port=6379, db=0)
redis_manager = socketio.RedisManager('redis://localhost:6379/0')
socketio_server = socketio.Server(cors_allowed_origins='*', async_mode='eventlet', client_manager=redis_manager)
socketio_app = socketio.WSGIApp(socketio_server)


@socketio_server.event()
def connect(sid, environ):
    print('connect ', sid)


@socketio_server.event()
def disconnect(sid):
    try:
        user_id = redis_client.get(sid)
        redis_client.delete(sid)
        redis_client.delete(user_id)
        send_user_connection_status_to_clients(user_id.decode('utf-8'), False)
    except:
        pass
    print('disconnect ', sid)


@socketio_server.event()
def set_user_connected_status(sid, data):
    print('is_connected ', sid, data)
    send_user_connection_status_to_clients(data['user_id'], data['is_connected'])
    redis_client.set(sid, data['user_id'])
    redis_client.set(data['user_id'], 'true')
    print('set_user_connected_status ', sid, data)


def send_user_connection_status_to_clients(user_id, is_connected):
    print('send_user_connection_status_to_clients ', user_id, is_connected)
    socketio_server.emit('user_connection_status', {'user_id': user_id, 'is_connected': is_connected})