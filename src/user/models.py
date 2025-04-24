from django.db import models
from django.contrib.auth.models import AbstractUser

from.domain import UserEntity


class User(AbstractUser):


    avatar = models.ImageField(upload_to='user_avatars', null=True, blank=True)

    def to_domain(self):
        return UserEntity(
            user_id=self.id,
            password=self.password,
            last_login=self.last_login,
            is_superuser=self.is_superuser,
            username=self.username,
            first_name=self.first_name,
            last_name=self.last_name,
            email=self.email,
            is_staff=self.is_staff,
            is_active=self.is_active,
            date_joined=self.date_joined,
            avatar=self.avatar
        )
    

    @classmethod
    def from_domain(cls, user: UserEntity):
        return cls(
            id=user.user_id,
            password=user.password,
            last_login=user.last_login,
            is_superuser=user.is_superuser,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            is_staff=user.is_staff,
            is_active=user.is_active,
            date_joined=user.date_joined,

        )
    
    


