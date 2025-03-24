from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

class EmailBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            UserModel = get_user_model()
            user = UserModel.objects.get(email=username)
            if user.check_password(password):
                return user
            else:
                return None
        except (UserModel.DoesNotExist, UserModel.MultipleObjectsReturned):
            return None

    def get_user(self, user_id):
        try:
            UserModel = get_user_model()
            user = UserModel.objects.get(pk=user_id)
            return user
        except UserModel.DoesNotExist:
            return None