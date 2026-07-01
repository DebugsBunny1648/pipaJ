import re
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

PAYMENT_METHODS = {"razorpay", "cod", "manual_upi", "partial_cod"}
_URL_RE = re.compile(r"^https?://\S+\.\S+")


def _is_url(v: str) -> bool:
    return bool(_URL_RE.match(v))


def _clean_phone(v: str) -> str:
    digits = re.sub(r"\D", "", v)
    if len(digits) < 7 or len(digits) > 15:
        raise ValueError("Phone must be 7–15 digits")
    return digits


def _clean_pincode(v: str) -> str:
    if not v.isdigit() or not (4 <= len(v) <= 10):
        raise ValueError("Pincode must be 4–10 digits only")
    return v


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserSignup(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)

    @field_validator("name")
    @classmethod
    def clean_name(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if re.search(r"[<>\"';&]", v):
            raise ValueError("Name contains invalid characters")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)

# ── Products & Catalog ────────────────────────────────────────────────────────

class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5, max_length=2000)
    price: float = Field(gt=0)
    compare_price: Optional[float] = Field(default=None, ge=0)
    category: str = Field(min_length=2, max_length=60)
    material: Optional[str] = Field(default="Brass", max_length=60)
    stock: int = Field(ge=0, le=100_000, default=0)
    images: List[str] = Field(default_factory=list, max_length=10)
    featured: bool = False
    bestseller: bool = False
    sku: Optional[str] = Field(default=None, max_length=50, pattern=r"^[A-Za-z0-9_-]*$")

    @field_validator("name", "description")
    @classmethod
    def strip_text(cls, v):
        return v.strip()

    @field_validator("category")
    @classmethod
    def clean_category(cls, v):
        return v.strip().lower()

    @field_validator("compare_price")
    @classmethod
    def compare_gt_price(cls, v, info):
        if v is not None and "price" in info.data and v < info.data["price"]:
            raise ValueError("compare_price must be ≥ selling price")
        return v

    @field_validator("images")
    @classmethod
    def validate_images(cls, v):
        for url in v:
            if url and not _is_url(url):
                raise ValueError(f"Invalid image URL: {url}")
        return v


class CategoryIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    slug: str = Field(min_length=2, max_length=60, pattern=r"^[a-z0-9-]+$")
    image: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def clean_name(cls, v):
        return v.strip()

    @field_validator("image")
    @classmethod
    def validate_image(cls, v):
        if v and not _is_url(v):
            raise ValueError("Image must be a valid http/https URL")
        return v


class BannerIn(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    subtitle: Optional[str] = Field(default=None, max_length=200)
    image: str
    link: Optional[str] = None
    active: bool = True

    @field_validator("image")
    @classmethod
    def validate_image(cls, v):
        if not _is_url(v):
            raise ValueError("Image must be a valid http/https URL")
        return v

    @field_validator("link")
    @classmethod
    def validate_link(cls, v):
        if v and not _is_url(v):
            raise ValueError("Link must be a valid http/https URL")
        return v


class CouponIn(BaseModel):
    code: str = Field(min_length=3, max_length=20, pattern=r"^[A-Z0-9_-]+$")
    discount_percent: float = Field(gt=0, le=90)
    min_order: float = Field(ge=0, default=0)
    active: bool = True
    expiry_date: Optional[str] = None

    @field_validator("code")
    @classmethod
    def uppercase_code(cls, v):
        return v.upper().strip()

    @field_validator("expiry_date")
    @classmethod
    def validate_expiry(cls, v):
        if v:
            try:
                exp = date.fromisoformat(v)
            except ValueError:
                raise ValueError("expiry_date must be YYYY-MM-DD format")
            if exp < date.today():
                raise ValueError("Expiry date cannot be in the past")
        return v


class LookbookIn(BaseModel):
    image: str
    caption: Optional[str] = Field(default="", max_length=300)
    product_ids: List[str] = Field(default_factory=list, max_length=20)
    active: bool = True

    @field_validator("image")
    @classmethod
    def validate_image(cls, v):
        if not _is_url(v):
            raise ValueError("Image must be a valid http/https URL")
        return v

# ── Cart / Orders ─────────────────────────────────────────────────────────────

class CartItem(BaseModel):
    product_id: str = Field(min_length=1)
    quantity: int = Field(ge=1, le=100, default=1)


class OrderAddress(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=15)
    line1: str = Field(min_length=2, max_length=200)
    line2: Optional[str] = Field(default="", max_length=200)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=4, max_length=10)

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, v): return _clean_phone(v)

    @field_validator("pincode")
    @classmethod
    def clean_pincode(cls, v): return _clean_pincode(v)

    @field_validator("full_name", "city", "state")
    @classmethod
    def strip_text(cls, v): return v.strip()


class OrderCreate(BaseModel):
    items: List[CartItem] = Field(min_length=1, max_length=50)
    address: OrderAddress
    coupon_code: Optional[str] = None
    payment_method: str = "cod"
    notes: Optional[str] = Field(default="", max_length=500)

    @field_validator("payment_method")
    @classmethod
    def valid_payment(cls, v):
        v = v.lower()
        if v not in PAYMENT_METHODS:
            raise ValueError(f"payment_method must be one of: {', '.join(sorted(PAYMENT_METHODS))}")
        return v


class RazorpayVerify(BaseModel):
    order_id: str = Field(min_length=1)
    razorpay_order_id: str = Field(min_length=1)
    razorpay_payment_id: str = Field(min_length=1)
    razorpay_signature: str = Field(min_length=1)


class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=2, max_length=1000)

    @field_validator("comment")
    @classmethod
    def clean_comment(cls, v): return v.strip()


class AddressIn(BaseModel):
    label: str = Field(min_length=1, max_length=30)
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=15)
    line1: str = Field(min_length=2, max_length=200)
    line2: Optional[str] = Field(default="", max_length=200)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=4, max_length=10)
    is_default: bool = False

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, v): return _clean_phone(v)

    @field_validator("pincode")
    @classmethod
    def clean_pincode(cls, v): return _clean_pincode(v)
