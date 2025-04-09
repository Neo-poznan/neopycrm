from dataclasses import dataclass
from typing import Optional


@dataclass
class UserCompanyEntity:

    user: int
    company: int
    department: Optional[int]


    def is_user_in_company(self, company: int) -> bool:
        return self.company == company
    
