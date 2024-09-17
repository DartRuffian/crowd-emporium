from sqlalchemy.orm import Session
import hashing
from fastapi import HTTPException
from typing import Optional, List, Type

from models.Event import Event as EventModel
from models.Event import EventCreate as EventCreateModel
from schemas.Event import Event as EventSchema
from models.Seat import Seat as SeatModel
from models.Seat import SeatCreate as SeatCreateModel
from schemas.Seat import Seat as SeatSchema
from models.User import User as UserModel
from models.User import UserCreate as UserCreateModel
from schemas.User import User as UserSchema
from models.Image import Image as ImageModel
from models.Image import ImageCreate as ImageCreateModel
from schemas.Image import Image as ImageSchema

import smtplib
from email.message import EmailMessage


class DatabaseController:
    # These are flags that ticket prices should be increased at.
    # When 60% of tickets are sold, increase price by 15%.
    # When 80% of tickets are sold, increase price by 25%.
    SALE_FLAGS = {
        0.00: 1.00,
        0.40: 1.15,
        0.20: 1.25
    }

    # These would obviously be an environment variable or some other secure method
    API_EMAIL = "crowdemporium@gmail.com"
    API_PASSWORD = "jwtx rxfh mttv bggl"

    def get_all_events(self, db: Session) -> List[Type[EventModel]]:
        return db.query(EventSchema).all()

    def get_event_by_id(self, event_id: int, db: Session) -> Optional[Type[EventModel]]:
        return db.query(EventSchema).filter(EventSchema.event_id == event_id).first()

    def create_event(self, event: EventCreateModel, db: Session) -> Optional[Type[EventModel]]:
        response = None
        # checks for same name events
        item = db.query(EventSchema).filter(EventSchema.event_name == event.event_name).first()

        # creates event with event details
        if item is None:
            db_event = EventSchema(event_name=event.event_name, event_date=event.event_date,
                                   event_time=event.event_time)

            db.add(db_event)
            db.commit()
            db.refresh(db_event)
            response = self.get_event_by_id(db_event.event_id, db)
        return response

    def create_event_with_seats(self, event: EventCreateModel, db: Session) -> Optional[Type[EventModel]]:
        item = db.query(EventSchema).filter(EventSchema.event_name == event.event_name).first()
        response = None

        # creates event with event details
        if item is None:
            db_event = EventSchema(event_name=event.event_name, event_date=event.event_date,
                                   event_time=event.event_time, seat_price=event.seat_price,
                                   seat_price_original=event.seat_price, seat_price_vip=event.seat_price_vip,
                                   seat_price_reserved=event.seat_price_reserved)
            db.add(db_event)
            db.commit()
            db.refresh(db_event)

            # creates the 500 seats for the event
            section_num = 1  # max: 10
            row_num = 1  # max: 5
            seat_num = 1  # max: 10
            seat_type = ''
            while section_num <= 10:
                if row_num == 6:
                    row_num = 1
                while row_num <= 5:
                    if seat_num == 11:
                        seat_num = 1
                    if row_num == 1:
                        seat_type = 'vip'
                    elif row_num == 2 or row_num == 3:
                        seat_type = 'res'
                    elif row_num == 4 or row_num == 5:
                        seat_type = 'ga'

                    while seat_num <= 10:
                        # set seat attributes and create seat
                        db_seat = SeatSchema(
                            seat_number=seat_num,
                            seat_row=row_num,
                            section_number=section_num,
                            seat_type=seat_type,
                            event_id=db_event.event_id,
                            user_id=None
                        )
                        db.add(db_seat)
                        seat_num += 1
                    row_num += 1
                section_num += 1

            db.commit()
            db.refresh(db_event)
            response = self.get_event_by_id(db_event.event_id, db)
        else:
            print('[create_event_with_seats] Name already in use')

        return response

    def update_event(self, event: Type[EventModel], db: Session) -> Optional[Type[EventModel]]:
        response = None
        db_event = db.query(EventSchema).filter(EventSchema.event_id == event.event_id).first()

        if db_event is not None:
            db_event.event_name = event.event_name
            db_event.event_date = event.event_date
            db_event.event_time = event.event_time

            db_event.seat_price = event.seat_price
            db_event.seat_price_vip = event.seat_price_vip
            db_event.seat_price_reserved = event.seat_price_reserved

            db.commit()
            response = self.get_event_by_id(db_event.event_id, db)
        return response

    def delete_event(self, event_id: int, db: Session) -> Optional[Type[EventModel]]:
        db_event = db.query(EventSchema).filter(EventSchema.event_id == event_id).first()

        # Delete event image if it exists
        db_images = db.query(ImageSchema).filter(ImageSchema.event_id == event_id).all()
        for image in db_images:
            db.delete(image)
        db.commit()

        db_seats = self.get_seats_by_event(event_id, db)
        for seat in db_seats:
            self.delete_seat(seat.seat_id, db)

        if db_event is not None:
            db.delete(db_event)
            db.commit()
        else:
            raise Exception(f"Event with id '{event_id}' not found")
        return db_event

    def get_all_seats(self, db: Session) -> List[Type[SeatModel]]:
        return db.query(SeatSchema).all()

    def get_seat_by_id(self, seat_id: int, db: Session):
        seat = db.query(SeatSchema).filter(SeatSchema.seat_id == seat_id).first()
        if not seat:
            raise HTTPException(status_code=404, detail=f"Seat with id '{seat_id}' not found")
        return seat

    def get_seats_by_user_id(self, user_id: int, db: Session):
        return db.query(SeatSchema).filter(SeatSchema.user_id == user_id).all()

    def get_seats_by_event(self, event_id: int, db: Session) -> List[SeatModel]:
        return db.query(SeatSchema).filter(SeatSchema.event_id == event_id).all()

    def get_seats_by_section(self, event_id: int, section_number: int, db: Session) -> List[SeatModel]:
        # filter by event_id first
        seats = db.query(SeatSchema).filter(SeatSchema.event_id == event_id,
                                            SeatSchema.section_number == section_number).all()

        return seats

    def reserve_seat(self, seat_id: int, user_id: int, db: Session) -> Optional[SeatModel]:
        db_seat = self.get_seat_by_id(seat_id, db)
        db_user = self.get_user_by_id(user_id, db)
        db_event = self.get_event_by_id(db_seat.event_id, db)

        if db_seat.user_id is not None:
            raise HTTPException(status_code=400, detail="Can not reserve already reserved seat")

        db_seat.user_id = db_user.user_id
        purchase_price = db_event.seat_price

        match db_seat.seat_type:
            case "res":
                purchase_price = db_event.seat_price * db_event.seat_price_reserved
            case "vip":
                purchase_price = db_event.seat_price * db_event.seat_price_vip

        db_seat.purchase_price = purchase_price

        db.add(db_seat)
        db.commit()
        db.refresh(db_seat)

        percent_available = self.__log_seat_availability(db_seat.event_id, db)
        if percent_available == 0:
            content = f"All tickets for {db_event.event_name} have been sold out!"
            self.send_admin_email(f"{db_event.event_name} has sold out", content, db)
            print(f"[API]	(INFO)	{db_event.event_name} has sold out of all seats.")

        return db_seat

    def cancel_seat(self, seat_id: int, db: Session) -> Optional[SeatModel]:
        db_seat = self.get_seat_by_id(seat_id, db)

        if db_seat.user_id is None:
            raise HTTPException(status_code=400, detail="Can not cancel seat that has not been reserved")

        db_seat.purchase_price = None
        db_seat.user_id = None

        db.add(db_seat)
        db.commit()
        db.refresh(db_seat)

        self.__log_seat_availability(db_seat.event_id, db)

        return db_seat

    def get_all_users(self, db: Session) -> List[Type[UserModel]]:
        return db.query(UserSchema).all()

    def get_user_by_id(self, user_id: int, db: Session) -> Optional[Type[UserModel]]:
        db_user = db.query(UserSchema).filter(UserSchema.user_id == user_id).first()
        if db_user is None:
            raise HTTPException(status_code=404, detail=f"User with id '{user_id}' not found")

        return db_user

    def get_all_admins(self, db: Session) -> List[Type[UserModel]]:
        return db.query(UserSchema).filter(UserSchema.is_admin == True).all()

    def create_user(self, request: UserCreateModel | dict[str, str], db: Session):
        # Same phone / email can't be used for multiple accounts
        response = None
        item = db.query(UserSchema).filter(UserSchema.phone == request["phone"]).first()
        item = item or db.query(UserSchema).filter(UserSchema.username == request["username"]).first()

        if item is None:
            db_user = UserSchema(first_name=request["first_name"], last_name=request["last_name"],
                                 phone=request["phone"], username=request["username"],
                                 password=hashing.get_password_hash(request["password"]), is_admin=request["is_admin"])
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            response = self.get_user_by_id(db_user.user_id, db)

        return response

    def update_user(self, user: UserModel, db: Session) -> Optional[Type[UserModel]]:
        response = None
        db_user = db.query(UserSchema).filter(UserSchema.user_id == user.user_id).first()

        if db_user is not None:
            db_user.first_name = user.first_name
            db_user.last_name = user.last_name
            db_user.phone = user.phone
            db_user.username = user.username
            db_user.password = user.password
            db_user.is_admin = user.is_admin

            db.commit()
            response = self.get_user_by_id(db_user.user_id, db)
        return response

    def delete_user(self, user_id: int, db: Session) -> Optional[Type[UserModel]]:
        db_user = db.query(UserSchema).filter(UserSchema.user_id == user_id).first()
        if db_user is not None:
            db.delete(db_user)
            db.commit()
        else:
            raise Exception(f"User with id '{user_id}' not found")
        return db_user

    def create_seat(self, seat: SeatCreateModel, db: Session) -> Optional[Type[SeatModel]]:
        response = None
        item = None  # Need to check if seat already exists before creating a new one

        if item is None:
            db_seat = SeatSchema(seat_type=seat.seat_type, seat_number=seat.seat_number, seat_row=seat.seat_row,
                                 section_number=seat.section_number, user_id=seat.user_id, event_id=seat.event_id)

            db.add(db_seat)
            db.commit()
            db.refresh(db_seat)
            response = self.get_seat_by_id(db_seat.seat_id, db)
        return response

    def update_seat(self, seat: SeatModel, db: Session) -> Optional[Type[SeatModel]]:
        response = None
        db_seat = db.query(SeatSchema).filter(SeatSchema.seat_id == seat.seat_id).first()

        if db_seat is not None:
            db_seat.seat_type = seat.seat_type
            db_seat.seat_number = seat.seat_number
            db_seat.seat_row = seat.seat_row
            db_seat.section_number = seat.section_number
            db_seat.user_id = seat.user_id
            db_seat.event_id = seat.event_id

            db.commit()
            response = self.get_seat_by_id(db_seat.seat_id, db)
        return response

    def delete_seat(self, seat_id: int, db: Session) -> Optional[Type[SeatModel]]:
        db_seat = db.query(SeatSchema).filter(SeatSchema.seat_id == seat_id).first()
        if db_seat is not None:
            db.delete(db_seat)
            db.commit()
        else:
            raise Exception(f"Seat with id '{seat_id}' not found")
        return db_seat

    def get_all_images(self, db: Session) -> List[Type[ImageModel]]:
        return db.query(ImageSchema).all()

    def get_image_by_id(self, image_id: int, db: Session) -> Optional[Type[ImageModel]]:
        return db.query(ImageSchema).filter(ImageSchema.image_id == image_id).first()

    def create_image(self, image: ImageCreateModel, db: Session) -> Optional[Type[ImageModel]]:
        response = None
        # Only one image per event
        item = db.query(ImageSchema).filter(ImageSchema.event_id == image.event_id).first()

        if item is None:
            db_image = ImageSchema(event_id=image.event_id, img_path=image.img_path,
                                   img_description=image.img_description)

            db.add(db_image)
            db.commit()
            db.refresh(db_image)
            response = self.get_image_by_id(db_image.image_id, db)
        return response

    def update_image(self, image: ImageModel, db: Session) -> Optional[Type[ImageModel]]:
        response = None
        db_image = db.query(ImageSchema).filter(ImageSchema.image_id == image.image_id).first()

        if db_image is not None:
            db_image.event_id = image.event_id
            db_image.img_path = image.img_path
            db_image.img_description = image.img_description

            db.commit()
            response = self.get_image_by_id(db_image.image_id, db)
        return response

    def delete_image(self, image_id: int, db: Session) -> Optional[Type[ImageModel]]:
        db_image = db.query(ImageSchema).filter(ImageSchema.image_id == image_id).first()
        if db_image is not None:
            db.delete(db_image)
            db.commit()
        else:
            raise Exception(f"Image with id '{image_id}' not found")
        return db_image

    def update_ticket_prices(self, event: Type[EventModel], db: Session) -> Type[EventModel]:
        """Update event prices based on remaining tickets"""
        percent_available = self.__log_seat_availability(event.event_id, db)
        new_price = event.seat_price_original

        for available, price_increase in self.SALE_FLAGS.items():
            if percent_available <= available:
                new_price = event.seat_price_original * price_increase

        if new_price != event.seat_price:
            old_price = event.seat_price
            new_price = round(new_price, 2)
            event.seat_price = new_price
            print(f"[API]	(INFO)	Updated base ticket price: ${old_price:.2f} (old) ${new_price:.2f} (new)")
            if percent_available > 0.2:  # Small work-around, checks if more than 1 seat is available
                content = (f"The base price for {event.event_name} has been changed from ${old_price:.2f} to "
                           f"${new_price:.2f} due to ticket availability. "
                           f"There are {percent_available*100:.2f}% seats remaining.")
                self.send_admin_email(f"Updating ticket price for {event.event_name}", content, db)
            self.update_event(event, db)

        return self.get_event_by_id(event.event_id, db)

    def send_admin_email(self, subject: str, content: str, db: Session) -> None:
        admins = self.get_all_admins(db)
        admin_emails = ", ".join([admin.username for admin in admins])

        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self.API_EMAIL
        msg["To"] = admin_emails
        msg.set_content(content + "\n\nThis is an automated message from Crowd Emporium.")

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(self.API_EMAIL, self.API_PASSWORD)
            smtp.send_message(msg)

    def __log_seat_availability(self, event_id: int, db: Session) -> float:
        """
        Calculates the percentage of available seats for a given event and logs a message, then returns the percentage
        """
        seats = self.get_seats_by_event(event_id, db)
        total_seats = len(seats)

        available_seats = list(filter(lambda seat: seat.user_id is None, seats))
        total_available = len(available_seats)

        percent_available = total_available / total_seats
        print(f"[API]	(INFO)	Available seats: {percent_available * 100:.2f}%")
        return percent_available
