from dataclasses import dataclass
from typing import Optional

from .exceptions import AuthorizationFailed


@dataclass
class UserCompanyEntity:

    user: int
    company: int
    department: Optional[int]


    def is_user_in_company(self, company: int) -> bool:
        if not self.company == company:
            raise AuthorizationFailed('user not in call company')
    
