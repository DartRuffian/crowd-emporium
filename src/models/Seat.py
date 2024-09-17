from pydantic import BaseModel


class SeatCreate(BaseModel):
    seat_type: str
    seat_number: int
    seat_row: int
    section_number: int
    user_id: int
    event_id: int


class Seat(SeatCreate):
    seat_id: int
    purchase_price: float

    class Config:
        from_attributes = True
