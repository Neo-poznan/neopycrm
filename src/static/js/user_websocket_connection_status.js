const socket = io('http://127.0.0.1:5001', {'transports': ['websocket'], 'query': {'user_id': user_id}});

function set_user_connection_status_to_page(id, is_connected) {
    status_label = document.getElementsByClassName('user-status-' + id);
    if (is_connected) {
        status_label[0].innerHTML = 'Online';
        status_label[0].style.color = 'green';
    } else {
        status_label[0].innerHTML = 'Offline';
        status_label[0].style.color = 'red';
    }
}

function handle_user_connection_status_socket() {
    socket.on('user_connection_status', (data) => {
        if (data['user_id'] == user_id) {
            return;
        }
        set_user_connection_status_to_page(data['user_id'], data['is_connected']);
        console.log(data);
    })
}

handle_user_connection_status_socket();