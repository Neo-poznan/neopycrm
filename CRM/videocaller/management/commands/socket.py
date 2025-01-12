import eventlet

from django.core.management.base import BaseCommand

from core.websocket import socketio_app


class Command(BaseCommand):
    def handle(self, *args, **options):
        print('start')
        eventlet.wsgi.server(eventlet.listen(('', 5001)), socketio_app)

