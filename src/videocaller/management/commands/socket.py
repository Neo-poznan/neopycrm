from django.core.management.base import BaseCommand

from core.websocket import app
import eventlet


class Command(BaseCommand):
    def handle(self, *args, **options):
        print('start')
        eventlet.wsgi.server(eventlet.listen(('', 5001)), app)

