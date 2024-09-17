from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Seat(Base):
    __tablename__ = "seats"

    seat_id = Column(Integer, primary_key=True, index=True)
    seat_type = Column(String)
    seat_row = Column(Integer)
    seat_number = Column(Integer)
    section_number = Column(Integer)
    purchase_price = Column(Float)

    event_id = Column(Integer, ForeignKey("events.event_id"))
    user_id = Column(ForeignKey("users.user_id"))

    events = relationship("Event", back_populates="seats")
    users = relationship("User", back_populates="seats")
