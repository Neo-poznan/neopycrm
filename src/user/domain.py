from dataclasses import dataclass
from datetime import datetime

from django.db.models.fields.files import ImageFieldFile

@dataclass
class UserEntity:
    user_id: int
    password: str
    last_login: datetime
    is_superuser: bool
    username: str
    first_name: str
    last_name: str
    email: str
    is_staff: bool
    is_active: bool
    date_joined: datetime
    avatar: ImageFieldFile


    def upgrade_to_superuser(self):
        self.is_superuser = True
        self.is_staff = True       

