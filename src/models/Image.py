from pydantic import BaseModel


class ImageCreate(BaseModel):
    event_id: int
    img_path: str
    img_description: str


class Image(ImageCreate):
    image_id: int

    class Config:
        from_attributes = True
