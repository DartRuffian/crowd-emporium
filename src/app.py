from fastapi import FastAPI, HTTPException, status, Depends, Form
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import uvicorn
from jose import JWTError, jwt
from typing import Annotated, Optional

from schemas.User import User as UserSchema
from models.Event import Event as EventModel
from models.Event import EventCreate as EventCreateModel
from models.Seat import Seat as SeatModel
from models.Seat import SeatCreate as SeatCreateModel
from models.User import User as UserModel
from models.User import UserCreate as UserCreateModel
from models.Image import Image as ImageModel
from models.Image import ImageCreate as ImageCreateModel
from models.Token import Token as TokenModel
from models.Token import TokenData as TokenDataModel
import hashing

from database import engine, SessionLocal, Base
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from controller.DatabaseController import DatabaseController

app = FastAPI()
controller = DatabaseController()

app.mount("/website", StaticFiles(directory="website"), name="website")

Base.metadata.create_all(bind=engine)

SECRET_KEY = "2d0c0dc2fe5893a5fb3e342265b2bcab0a6641c23f9bfb7448d3122633146c19"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_db() -> SessionLocal:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


# TODO: Move the logic to API layer
def get_user(db: Session, username: str):
    return db.query(UserSchema).filter(UserSchema.username == username).first()


def authenticate_user(username: str, password: str, db: Session = Depends(get_db)) -> Optional[UserModel]:
    user = get_user(db, username)
    if not user:
        return None
    if not hashing.verify_password(password, user.password):
        return None
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenDataModel(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
        current_user: Annotated[UserCreateModel, Depends(get_current_user)],
):
    return current_user


@app.post("/token", tags=["user"])
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
) -> TokenModel:
    user = authenticate_user(form_data.username, form_data.password, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return TokenModel(access_token=access_token, token_type="bearer")


@app.get("/users/me/", response_model=UserModel, tags=["user"])
async def read_users_me(
    current_user: Annotated[UserModel, Depends(get_current_active_user)],
):
    return current_user


@app.get("/users/me/items/", tags=["user"])
async def read_own_items(
    current_user: Annotated[UserCreateModel, Depends(get_current_active_user)],
):
    return [{"seat_ID": "1", "owner": current_user.username}]


@app.get("/user", tags=["user"])
def get_all_users(db: Session = Depends(get_db)):
    return controller.get_all_users(db)


@app.get("/user/{user_id}", tags=["user"])
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = controller.get_user_by_id(user_id, db)
    if user is not None:
        return user
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id '{user_id}' not found")


@app.post("/user", tags=["user"])
def create_user(first_name: str = Form(...),  last_name: str = Form(...), phone: str = Form(...),
                username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = {
        "first_name": first_name,
        "last_name": last_name,
        "phone": phone,
        "username": username.lower(),
        "password": password,
        "is_admin": False
    }
    user = controller.create_user(user, db)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    return user


@app.put("/user/{user_id}", tags=["user"])
def update_user(user: UserModel, db: Session = Depends(get_db)):
    user = controller.update_user(user, db)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")

    return user


@app.delete("/user/{user_id}", tags=["user"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = controller.get_user_by_id(user_id, db)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")
    else:
        controller.delete_user(user_id, db)

    return user


@app.get("/event", tags=["event"])
def get_all_events(db: Session = Depends(get_db)):
    return controller.get_all_events(db)


@app.get("/event/{event_id}", tags=["event"])
def get_event_by_id(event_id: int, db: Session = Depends(get_db)):
    event = controller.get_event_by_id(event_id, db)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event with id '{event_id}' not found")
        # Return event details along with ticket link
    return event


@app.put("/event/{event_id}", tags=["event"])
def update_event(event: EventModel, db: Session = Depends(get_db)):
    event = controller.update_event(event, db)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event does not exist")

    return event


@app.delete("/event/{event_id}", tags=["event"])
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = controller.get_event_by_id(event_id, db)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event does not exist")
    else:
        controller.delete_event(event_id, db)

    return event


@app.post("/event/register", tags=["event"])
def register_event(event: EventCreateModel, db: Session = Depends(get_db)):
    event = controller.create_event_with_seats(event, db)
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Event already exist")
    return event


@app.get("/event/seats/{event_id}", tags=["event"])
def get_seats_by_event(event_id: int, db: Session = Depends(get_db)):
    return controller.get_seats_by_event(event_id, db)


@app.get("/event/seats/{event_id}/{section_number}", tags=["event"])
def get_seats_by_section(event_id: int, section_number: int, db: Session = Depends(get_db)):
    return controller.get_seats_by_section(event_id, section_number, db)


@app.put("/event/updatePrices/{event_id}", tags=["event"])
def update_ticket_prices(event_id: int, db: Session = Depends(get_db)):
    event = controller.get_event_by_id(event_id, db)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event with id '{event_id}' not found")
    return controller.update_ticket_prices(event, db)


@app.put("/seat/reserve/{seat_id}/{user_id}", tags=["seat"])
def reserve_seat(seat_id: int, user_id: int, db: Session = Depends(get_db)):
    return controller.reserve_seat(seat_id, user_id, db)


@app.put("/seat/cancel/{seat_id}", tags=["seat"])
def cancel_seat(seat_id: int, db: Session = Depends(get_db)):
    return controller.cancel_seat(seat_id, db)


@app.get("/seat", tags=["seat"])
def get_all_seats(db: Session = Depends(get_db)):
    return controller.get_all_seats(db)


@app.get("/seat/{seat_id}", tags=["seat"])
def get_seat_by_id(seat_id: int, db: Session = Depends(get_db)):
    seat = controller.get_seat_by_id(seat_id, db)
    if seat is not None:
        return seat
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Seat with id '{seat_id}' not found")


@app.get("/seat/user/{user_id}", tags=["seat"])
def get_seats_by_user_id(user_id: int, db: Session = Depends(get_db)):
    return controller.get_seats_by_user_id(user_id, db)


@app.post("/seat", tags=["seat"])
def create_seat(seat: SeatCreateModel, db: Session = Depends(get_db)):
    seat = controller.create_seat(seat, db)
    if seat is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Seat already exist")

    return seat


@app.put("/seat/{seat_id}", tags=["seat"])
def update_seat(seat: SeatModel, db: Session = Depends(get_db)):
    seat = controller.update_seat(seat, db)
    if seat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seat does not exist")

    return seat


@app.delete("/seat/{seat_id}", tags=["seat"])
def delete_seat(seat_id: int, db: Session = Depends(get_db)):
    seat = controller.get_seat_by_id(seat_id, db)
    if seat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seat does not exist")
    else:
        controller.delete_seat(seat_id, db)

    return seat


@app.get("/image", tags=["image"])
def get_all_images(db: Session = Depends(get_db)):
    return controller.get_all_images(db)


@app.get("/image/{image_id}", tags=["image"])
def get_image_by_id(image_id: int, db: Session = Depends(get_db)):
    image = controller.get_image_by_id(image_id, db)
    if image is not None:
        return image
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Image with id '{image_id}' not found")


@app.post("/image", tags=["image"])
def create_image(image: ImageCreateModel, db: Session = Depends(get_db)):
    image = controller.create_image(image, db)
    if image is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image already exist")

    return image


@app.put("/image/{image_id}", tags=["image"])
def update_image(image: ImageModel, db: Session = Depends(get_db)):
    image = controller.update_image(image, db)
    if image is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image does not exist")

    return image


@app.delete("/image/{image_id}", tags=["image"])
def delete_image(image_id: int, db: Session = Depends(get_db)):
    image = controller.get_image_by_id(image_id, db)
    if image is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image does not exist")
    else:
        controller.delete_image(image_id, db)

    return image


@app.put("/debug/adminEmail", tags=["debug"])
def send_admin_email(subject: str = Form(...), content: str = Form(...), db: Session = Depends(get_db)):
    controller.send_admin_email(subject, content, db)


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", reload=True)
