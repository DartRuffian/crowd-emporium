from pydantic import BaseModel
from datetime import date, time


class EventCreate(BaseModel):
    event_name: str
    event_date: date
    event_time: time

    seat_price: float
    seat_price_vip: float
    seat_price_reserved: float


class Event(EventCreate):
    event_id: int
    seat_price_original: float

    class Config:
        from_attributes = True
