from sqlalchemy import Column, Integer, String, Date, Time, Float
from sqlalchemy.orm import relationship
from database import Base


class Event(Base):
    __tablename__ = "events"

    event_id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String)
    event_date = Column(Date)
    event_time = Column(Time)

    seat_price = Column(Float)
    seat_price_original = Column(Float)
    seat_price_vip = Column(Float)
    seat_price_reserved = Column(Float)

    seats = relationship("Seat", back_populates="events")
    images = relationship("Image", back_populates="events")
