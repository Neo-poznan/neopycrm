import redis

from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import get_user_model


redis_client = redis.Redis(host='localhost', port=6379, db=0)


class CallsMailPageView(LoginRequiredMixin, TemplateView):
    template_name = 'videocaller/calls_main_page.html'

    def get_context_data(self, **kwargs):
        context = {}
        user_model = get_user_model()
        all_users = user_model.objects.exclude(id=self.request.user.id)
        context['users_for_private_call'] = all_users
        context['is_user_online_dict'] = {}
        for user in all_users:
            user_object_in_redis = redis_client.get(user.id)
            if user_object_in_redis is None:
                context['is_user_online_dict'][user.id] = False
            else:
                context['is_user_online_dict'][user.id] = True

        return context

