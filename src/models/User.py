from pydantic import BaseModel


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    username: str
    password: str
    is_admin: bool


class User(UserCreate):
    user_id: int

    class Config:
        from_attributes = True
