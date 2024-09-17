from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Image(Base):
    __tablename__ = "images"

    image_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(ForeignKey("events.event_id"))
    img_path = Column(String)
    img_description = Column(String)

    events = relationship("Event", back_populates="images")
