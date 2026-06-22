from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import List, Optional, Annotated
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import razorpay
import hmac
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'pipa-jewellery-secret-key-change-me')
JWT_ALGO = 'HS256'
JWT_EXP_HOURS = 24 * 7

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET')
rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET else None

app = FastAPI(title="Pipa Jewellery API")
api_router = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)


# ------------------- Models -------------------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


class UserSignup(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: str


class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5, max_length=2000)
    price: float = Field(gt=0)
    compare_price: Optional[float] = Field(default=None, ge=0)
    category: str
    material: Optional[str] = "Brass"
    stock: int = Field(ge=0, default=0)
    images: List[str] = Field(default_factory=list)
    featured: bool = False
    bestseller: bool = False
    sku: Optional[str] = None

    @field_validator('compare_price')
    @classmethod
    def check_compare(cls, v, info):
        if v is not None and 'price' in info.data and v != 0 and v < info.data['price']:
            raise ValueError('compare_price must be greater than price')
        return v


class CategoryIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    slug: str = Field(min_length=2, max_length=60)
    image: Optional[str] = None
    description: Optional[str] = None


class BannerIn(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image: str
    link: Optional[str] = None
    active: bool = True


class CouponIn(BaseModel):
    code: str = Field(min_length=3, max_length=20)
    discount_percent: float = Field(gt=0, le=90)
    min_order: float = Field(ge=0, default=0)
    active: bool = True


class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, default=1)


class OrderAddress(BaseModel):
    full_name: str
    phone: str = Field(min_length=7, max_length=15)
    line1: str
    line2: Optional[str] = ""
    city: str
    state: str
    pincode: str = Field(min_length=4, max_length=10)


class OrderCreate(BaseModel):
    items: List[CartItem]
    address: OrderAddress
    coupon_code: Optional[str] = None
    payment_method: str = "COD"


# ------------------- Auth helpers -------------------
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def make_token(user_id: str, role: str) -> str:
    payload = {
        'sub': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload['sub']}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user


async def current_admin(user=Depends(current_user)):
    if user.get('role') != 'admin':
        raise HTTPException(403, "Admin only")
    return user


# ------------------- Auth Routes -------------------
@api_router.post("/auth/signup")
async def signup(payload: UserSignup):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password": hash_pw(payload.password),
        "role": "customer",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    token = make_token(user['id'], user['role'])
    user.pop('_id', None)
    return {"token": token, "user": {k: v for k, v in user.items() if k != 'password'}}


@api_router.post("/auth/login")
async def login(payload: UserLogin):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_pw(payload.password, user['password']):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(user['id'], user['role'])
    user.pop('password', None)
    user.pop('_id', None)
    return {"token": token, "user": user}


@api_router.get("/auth/me")
async def me(user=Depends(current_user)):
    return user


# ------------------- Products -------------------
@api_router.get("/products")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    bestseller: Optional[bool] = None,
    sort: Optional[str] = "newest",
    limit: int = 50,
):
    q = {}
    if category:
        q['category'] = category
    if search:
        q['$or'] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    if min_price is not None or max_price is not None:
        q['price'] = {}
        if min_price is not None:
            q['price']['$gte'] = min_price
        if max_price is not None:
            q['price']['$lte'] = max_price
    if featured is not None:
        q['featured'] = featured
    if bestseller is not None:
        q['bestseller'] = bestseller

    sort_map = {
        "newest": [("created_at", -1)],
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "name": [("name", 1)],
    }
    cursor = db.products.find(q, {"_id": 0}).sort(sort_map.get(sort, sort_map['newest'])).limit(min(limit, 200))
    return await cursor.to_list(length=None)


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Product not found")
    return p


@api_router.post("/products")
async def create_product(payload: ProductIn, _=Depends(current_admin)):
    doc = payload.model_dump()
    doc['id'] = str(uuid.uuid4())
    doc['created_at'] = now_iso()
    doc['updated_at'] = now_iso()
    if not doc.get('sku'):
        doc['sku'] = f"PIPA-{doc['id'][:8].upper()}"
    await db.products.insert_one(doc)
    doc.pop('_id', None)
    return doc


@api_router.put("/products/{product_id}")
async def update_product(product_id: str, payload: ProductIn, _=Depends(current_admin)):
    doc = payload.model_dump()
    doc['updated_at'] = now_iso()
    result = await db.products.update_one({"id": product_id}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(404, "Product not found")
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    return p


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, _=Depends(current_admin)):
    r = await db.products.delete_one({"id": product_id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"ok": True}


# ------------------- Categories -------------------
@api_router.get("/categories")
async def list_categories():
    return await db.categories.find({}, {"_id": 0}).sort("name", 1).to_list(length=None)


@api_router.post("/categories")
async def create_category(payload: CategoryIn, _=Depends(current_admin)):
    if await db.categories.find_one({"slug": payload.slug}):
        raise HTTPException(400, "Slug already exists")
    doc = payload.model_dump()
    doc['id'] = str(uuid.uuid4())
    doc['created_at'] = now_iso()
    await db.categories.insert_one(doc)
    doc.pop('_id', None)
    return doc


@api_router.put("/categories/{cat_id}")
async def update_category(cat_id: str, payload: CategoryIn, _=Depends(current_admin)):
    r = await db.categories.update_one({"id": cat_id}, {"$set": payload.model_dump()})
    if r.matched_count == 0:
        raise HTTPException(404, "Category not found")
    return await db.categories.find_one({"id": cat_id}, {"_id": 0})


@api_router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, _=Depends(current_admin)):
    r = await db.categories.delete_one({"id": cat_id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ------------------- Banners -------------------
@api_router.get("/banners")
async def list_banners():
    return await db.banners.find({}, {"_id": 0}).to_list(length=None)


@api_router.post("/banners")
async def create_banner(payload: BannerIn, _=Depends(current_admin)):
    doc = payload.model_dump()
    doc['id'] = str(uuid.uuid4())
    doc['created_at'] = now_iso()
    await db.banners.insert_one(doc)
    doc.pop('_id', None)
    return doc


@api_router.delete("/banners/{bid}")
async def delete_banner(bid: str, _=Depends(current_admin)):
    await db.banners.delete_one({"id": bid})
    return {"ok": True}


# ------------------- Coupons -------------------
@api_router.get("/coupons")
async def list_coupons(_=Depends(current_admin)):
    return await db.coupons.find({}, {"_id": 0}).to_list(length=None)


@api_router.post("/coupons")
async def create_coupon(payload: CouponIn, _=Depends(current_admin)):
    if await db.coupons.find_one({"code": payload.code.upper()}):
        raise HTTPException(400, "Coupon already exists")
    doc = payload.model_dump()
    doc['code'] = doc['code'].upper()
    doc['id'] = str(uuid.uuid4())
    doc['created_at'] = now_iso()
    await db.coupons.insert_one(doc)
    doc.pop('_id', None)
    return doc


@api_router.delete("/coupons/{cid}")
async def delete_coupon(cid: str, _=Depends(current_admin)):
    await db.coupons.delete_one({"id": cid})
    return {"ok": True}


@api_router.post("/coupons/validate")
async def validate_coupon(body: dict):
    code = (body.get('code') or '').upper().strip()
    subtotal = float(body.get('subtotal') or 0)
    if not code:
        raise HTTPException(400, "Code required")
    c = await db.coupons.find_one({"code": code, "active": True}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Invalid coupon")
    if subtotal < c.get('min_order', 0):
        raise HTTPException(400, f"Minimum order ₹{c['min_order']} required")
    return {"code": c['code'], "discount_percent": c['discount_percent'], "discount_amount": round(subtotal * c['discount_percent'] / 100, 2)}


# ------------------- Wishlist -------------------
@api_router.get("/wishlist")
async def get_wishlist(user=Depends(current_user)):
    w = await db.wishlists.find_one({"user_id": user['id']}, {"_id": 0}) or {"user_id": user['id'], "product_ids": []}
    if not w.get('product_ids'):
        return {"items": []}
    items = await db.products.find({"id": {"$in": w['product_ids']}}, {"_id": 0}).to_list(length=None)
    return {"items": items}


@api_router.post("/wishlist/toggle")
async def toggle_wishlist(body: dict, user=Depends(current_user)):
    pid = body.get('product_id')
    if not pid:
        raise HTTPException(400, "product_id required")
    w = await db.wishlists.find_one({"user_id": user['id']})
    if not w:
        await db.wishlists.insert_one({"user_id": user['id'], "product_ids": [pid]})
        return {"in_wishlist": True}
    pids = w.get('product_ids', [])
    if pid in pids:
        pids.remove(pid)
        action = False
    else:
        pids.append(pid)
        action = True
    await db.wishlists.update_one({"user_id": user['id']}, {"$set": {"product_ids": pids}})
    return {"in_wishlist": action}


# ------------------- Cart -------------------
@api_router.get("/cart")
async def get_cart(user=Depends(current_user)):
    cart = await db.carts.find_one({"user_id": user['id']}, {"_id": 0}) or {"user_id": user['id'], "items": []}
    items = []
    for ci in cart.get('items', []):
        p = await db.products.find_one({"id": ci['product_id']}, {"_id": 0})
        if p:
            items.append({"product": p, "quantity": ci['quantity']})
    return {"items": items}


@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, user=Depends(current_user)):
    p = await db.products.find_one({"id": item.product_id})
    if not p:
        raise HTTPException(404, "Product not found")
    cart = await db.carts.find_one({"user_id": user['id']})
    if not cart:
        await db.carts.insert_one({"user_id": user['id'], "items": [item.model_dump()]})
        return {"ok": True}
    items = cart.get('items', [])
    for it in items:
        if it['product_id'] == item.product_id:
            it['quantity'] += item.quantity
            break
    else:
        items.append(item.model_dump())
    await db.carts.update_one({"user_id": user['id']}, {"$set": {"items": items}})
    return {"ok": True}


@api_router.post("/cart/update")
async def update_cart(item: CartItem, user=Depends(current_user)):
    cart = await db.carts.find_one({"user_id": user['id']}) or {"items": []}
    items = cart.get('items', [])
    items = [it for it in items if it['product_id'] != item.product_id]
    if item.quantity > 0:
        items.append(item.model_dump())
    await db.carts.update_one({"user_id": user['id']}, {"$set": {"items": items}}, upsert=True)
    return {"ok": True}


@api_router.post("/cart/clear")
async def clear_cart(user=Depends(current_user)):
    await db.carts.update_one({"user_id": user['id']}, {"$set": {"items": []}}, upsert=True)
    return {"ok": True}


# ------------------- Orders -------------------
@api_router.post("/orders")
async def create_order(payload: OrderCreate, user=Depends(current_user)):
    if not payload.items:
        raise HTTPException(400, "Cart is empty")
    line_items = []
    subtotal = 0.0
    for ci in payload.items:
        p = await db.products.find_one({"id": ci.product_id})
        if not p:
            raise HTTPException(400, f"Product {ci.product_id} not found")
        if p.get('stock', 0) < ci.quantity:
            raise HTTPException(400, f"Insufficient stock for {p['name']}")
        line = {
            "product_id": p['id'],
            "name": p['name'],
            "price": p['price'],
            "image": (p.get('images') or [None])[0],
            "quantity": ci.quantity,
            "subtotal": round(p['price'] * ci.quantity, 2),
        }
        subtotal += line['subtotal']
        line_items.append(line)

    discount = 0.0
    coupon_code = None
    if payload.coupon_code:
        c = await db.coupons.find_one({"code": payload.coupon_code.upper(), "active": True})
        if c and subtotal >= c.get('min_order', 0):
            discount = round(subtotal * c['discount_percent'] / 100, 2)
            coupon_code = c['code']

    shipping = 0 if subtotal >= 999 else 79
    total = round(subtotal - discount + shipping, 2)

    order = {
        "id": str(uuid.uuid4()),
        "order_no": f"PIPA{int(datetime.now().timestamp())}",
        "user_id": user['id'],
        "user_email": user['email'],
        "user_name": user['name'],
        "items": line_items,
        "address": payload.address.model_dump(),
        "subtotal": round(subtotal, 2),
        "discount": discount,
        "shipping": shipping,
        "total": total,
        "coupon_code": coupon_code,
        "payment_method": payload.payment_method,
        "payment_status": "pending" if payload.payment_method == "RAZORPAY" else "cod",
        "status": "pending",
        "created_at": now_iso(),
    }

    # If razorpay, create RP order
    if payload.payment_method == "RAZORPAY":
        if not rzp_client:
            raise HTTPException(500, "Razorpay not configured")
        rp_order = rzp_client.order.create({
            "amount": int(total * 100),
            "currency": "INR",
            "receipt": order['order_no'][:40],
            "payment_capture": 1,
        })
        order['razorpay_order_id'] = rp_order['id']

    await db.orders.insert_one(order)

    # decrement stock (will be restored on RZP failure handler in production)
    for ci in payload.items:
        await db.products.update_one({"id": ci.product_id}, {"$inc": {"stock": -ci.quantity}})

    # clear cart only for COD; for RZP we wait for verification
    if payload.payment_method != "RAZORPAY":
        await db.carts.update_one({"user_id": user['id']}, {"$set": {"items": []}}, upsert=True)
    order.pop('_id', None)
    return order


class RazorpayVerify(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@api_router.post("/payments/razorpay/verify")
async def verify_razorpay(payload: RazorpayVerify, user=Depends(current_user)):
    if not rzp_client:
        raise HTTPException(500, "Razorpay not configured")
    order = await db.orders.find_one({"id": payload.order_id, "user_id": user['id']})
    if not order:
        raise HTTPException(404, "Order not found")
    body = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode()
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, payload.razorpay_signature):
        await db.orders.update_one({"id": payload.order_id}, {"$set": {"payment_status": "failed"}})
        raise HTTPException(400, "Signature mismatch")
    await db.orders.update_one({"id": payload.order_id}, {"$set": {
        "payment_status": "paid",
        "razorpay_payment_id": payload.razorpay_payment_id,
        "status": "confirmed",
    }})
    await db.carts.update_one({"user_id": user['id']}, {"$set": {"items": []}}, upsert=True)
    return {"ok": True}


@api_router.get("/payments/razorpay/key")
async def razorpay_key():
    return {"key_id": RAZORPAY_KEY_ID or ""}


@api_router.get("/orders/mine")
async def my_orders(user=Depends(current_user)):
    orders = await db.orders.find({"user_id": user['id']}, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    return orders


@api_router.get("/orders")
async def all_orders(_=Depends(current_admin)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=None)


@api_router.put("/orders/{oid}/status")
async def update_order_status(oid: str, body: dict, _=Depends(current_admin)):
    new_status = body.get('status')
    if new_status not in ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']:
        raise HTTPException(400, "Invalid status")
    r = await db.orders.update_one({"id": oid}, {"$set": {"status": new_status}})
    if r.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return {"ok": True}


# ------------------- Admin -------------------
@api_router.get("/admin/users")
async def admin_users(_=Depends(current_admin)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(length=None)
    return users


@api_router.get("/admin/stats")
async def admin_stats(_=Depends(current_admin)):
    total_users = await db.users.count_documents({"role": "customer"})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    orders = await db.orders.find({}, {"_id": 0, "total": 1, "created_at": 1, "status": 1}).to_list(length=None)
    total_revenue = sum(o.get('total', 0) for o in orders if o.get('status') != 'cancelled')
    low_stock = await db.products.count_documents({"stock": {"$lte": 5}})

    # last 7 days revenue
    by_day = {}
    for o in orders:
        if o.get('status') == 'cancelled':
            continue
        d = o['created_at'][:10]
        by_day[d] = by_day.get(d, 0) + o.get('total', 0)
    daily = [{"date": k, "revenue": round(v, 2)} for k, v in sorted(by_day.items())][-7:]

    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "low_stock": low_stock,
        "daily_revenue": daily,
    }


# ------------------- Reviews -------------------
class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=2, max_length=1000)


@api_router.get("/products/{product_id}/reviews")
async def list_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    if not reviews:
        return {"reviews": [], "avg": 0, "count": 0}
    avg = round(sum(r['rating'] for r in reviews) / len(reviews), 1)
    return {"reviews": reviews, "avg": avg, "count": len(reviews)}


@api_router.post("/products/{product_id}/reviews")
async def create_review(product_id: str, payload: ReviewIn, user=Depends(current_user)):
    p = await db.products.find_one({"id": product_id})
    if not p:
        raise HTTPException(404, "Product not found")
    existing = await db.reviews.find_one({"product_id": product_id, "user_id": user['id']})
    if existing:
        raise HTTPException(400, "You already reviewed this product")
    doc = {
        "id": str(uuid.uuid4()),
        "product_id": product_id,
        "user_id": user['id'],
        "user_name": user['name'],
        "rating": payload.rating,
        "comment": payload.comment.strip(),
        "created_at": now_iso(),
    }
    await db.reviews.insert_one(doc)
    doc.pop('_id', None)
    return doc


@api_router.delete("/reviews/{rid}")
async def delete_review(rid: str, user=Depends(current_user)):
    r = await db.reviews.find_one({"id": rid})
    if not r:
        raise HTTPException(404, "Not found")
    if r['user_id'] != user['id'] and user.get('role') != 'admin':
        raise HTTPException(403, "Not allowed")
    await db.reviews.delete_one({"id": rid})
    return {"ok": True}


# ------------------- Addresses -------------------
class AddressIn(BaseModel):
    label: str = Field(min_length=1, max_length=30)
    full_name: str = Field(min_length=2)
    phone: str = Field(min_length=7, max_length=15)
    line1: str = Field(min_length=2)
    line2: Optional[str] = ""
    city: str = Field(min_length=1)
    state: str = Field(min_length=1)
    pincode: str = Field(min_length=4, max_length=10)
    is_default: bool = False


@api_router.get("/addresses")
async def list_addresses(user=Depends(current_user)):
    return await db.addresses.find({"user_id": user['id']}, {"_id": 0}).sort("created_at", -1).to_list(length=None)


@api_router.post("/addresses")
async def create_address(payload: AddressIn, user=Depends(current_user)):
    if not payload.phone.isdigit():
        raise HTTPException(400, "Phone must be digits only")
    if not payload.pincode.isdigit():
        raise HTTPException(400, "Pincode must be digits only")
    doc = payload.model_dump()
    doc['id'] = str(uuid.uuid4())
    doc['user_id'] = user['id']
    doc['created_at'] = now_iso()
    if doc['is_default']:
        await db.addresses.update_many({"user_id": user['id']}, {"$set": {"is_default": False}})
    elif await db.addresses.count_documents({"user_id": user['id']}) == 0:
        doc['is_default'] = True
    await db.addresses.insert_one(doc)
    doc.pop('_id', None)
    return doc


@api_router.delete("/addresses/{aid}")
async def delete_address(aid: str, user=Depends(current_user)):
    r = await db.addresses.delete_one({"id": aid, "user_id": user['id']})
    if r.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api_router.post("/addresses/{aid}/default")
async def set_default_address(aid: str, user=Depends(current_user)):
    a = await db.addresses.find_one({"id": aid, "user_id": user['id']})
    if not a:
        raise HTTPException(404, "Not found")
    await db.addresses.update_many({"user_id": user['id']}, {"$set": {"is_default": False}})
    await db.addresses.update_one({"id": aid}, {"$set": {"is_default": True}})
    return {"ok": True}


# ------------------- Lookbook (Shop the Look) -------------------
class LookbookIn(BaseModel):
    image: str
    caption: Optional[str] = ""
    product_ids: List[str] = Field(default_factory=list)
    active: bool = True


@api_router.get("/lookbook")
async def list_lookbook():
    items = await db.lookbook.find({"active": True}, {"_id": 0}).sort("created_at", -1).to_list(length=None)
    # enrich with product data
    for it in items:
        if it.get('product_ids'):
            it['products'] = await db.products.find({"id": {"$in": it['product_ids']}}, {"_id": 0}).to_list(length=None)
        else:
            it['products'] = []
    return items


@api_router.post("/lookbook")
async def create_lookbook(payload: LookbookIn, _=Depends(current_admin)):
    if not payload.image:
        raise HTTPException(400, "Image required")
    doc = payload.model_dump()
    doc['id'] = str(uuid.uuid4())
    doc['created_at'] = now_iso()
    await db.lookbook.insert_one(doc)
    doc.pop('_id', None)
    return doc


@api_router.delete("/lookbook/{lid}")
async def delete_lookbook(lid: str, _=Depends(current_admin)):
    await db.lookbook.delete_one({"id": lid})
    return {"ok": True}


# ------------------- Seed -------------------
@app.on_event("startup")
async def seed_data():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)

    # Admin seed
    admin = await db.users.find_one({"email": "admin@pipa.com"})
    if not admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Pipa Admin",
            "email": "admin@pipa.com",
            "password": hash_pw("Admin@123"),
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info("Seeded admin user")

    # Demo customer
    if not await db.users.find_one({"email": "demo@pipa.com"}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Demo Customer",
            "email": "demo@pipa.com",
            "password": hash_pw("Demo@123"),
            "role": "customer",
            "created_at": now_iso(),
        })

    # Categories
    if await db.categories.count_documents({}) == 0:
        cats = [
            {"name": "Earrings", "slug": "earrings", "image": "https://images.pexels.com/photos/5413313/pexels-photo-5413313.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "description": "Statement earrings & studs"},
            {"name": "Necklaces", "slug": "necklaces", "image": "https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "description": "Layered & pendant necklaces"},
            {"name": "Rings", "slug": "rings", "image": "https://images.pexels.com/photos/7248760/pexels-photo-7248760.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "description": "Handcrafted rings"},
            {"name": "Bangles", "slug": "bangles", "image": "https://images.pexels.com/photos/4004225/pexels-photo-4004225.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "description": "Bangles & cuffs"},
            {"name": "Bridal", "slug": "bridal", "image": "https://images.pexels.com/photos/33209522/pexels-photo-33209522.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "description": "Statement bridal pieces"},
        ]
        for c in cats:
            c['id'] = str(uuid.uuid4())
            c['created_at'] = now_iso()
        await db.categories.insert_many(cats)

    # Products
    if await db.products.count_documents({}) == 0:
        imgs = [
            "https://images.pexels.com/photos/4004225/pexels-photo-4004225.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "https://images.pexels.com/photos/7248760/pexels-photo-7248760.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "https://images.pexels.com/photos/5413313/pexels-photo-5413313.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "https://images.pexels.com/photos/16124761/pexels-photo-16124761.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "https://images.pexels.com/photos/33209522/pexels-photo-33209522.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "https://images.pexels.com/photos/9293538/pexels-photo-9293538.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        ]
        seed_products = [
            ("Meher Pearl Studs", "Hand-set freshwater pearl studs with antique gold finish.", 899, 1299, "earrings", "Brass + Pearl", 24, True, True, [imgs[2], imgs[0]]),
            ("Raya Chand Hoops", "Crescent-shape hoops with intricate filigree.", 1199, 1599, "earrings", "Brass", 18, True, False, [imgs[0], imgs[2]]),
            ("Sahana Layered Necklace", "Three-strand layered necklace with delicate coins.", 2499, 3299, "necklaces", "Brass", 12, True, True, [imgs[4], imgs[1]]),
            ("Tara Pendant Chain", "Minimal star pendant on a fine cable chain.", 1399, 0, "necklaces", "Silver", 30, False, True, [imgs[1], imgs[4]]),
            ("Anaya Statement Ring", "Bold cocktail ring with a single matte stone.", 999, 1499, "rings", "Brass", 22, True, False, [imgs[1], imgs[6]]),
            ("Ira Stack Ring Set", "Set of three stackable bands - mix and match.", 1099, 1599, "rings", "Silver", 16, False, True, [imgs[6], imgs[1]]),
            ("Noor Bangle Pair", "Pair of textured bangles in antique finish.", 1799, 2299, "bangles", "Brass", 14, True, False, [imgs[0], imgs[5]]),
            ("Zara Cuff", "Wide hand-hammered cuff bracelet.", 1599, 0, "bangles", "Brass", 10, False, True, [imgs[5], imgs[0]]),
            ("Devika Bridal Choker", "Heritage-inspired bridal choker with kundan work.", 5999, 7999, "bridal", "Gold Plated", 6, True, True, [imgs[5], imgs[7]]),
            ("Surya Maang Tikka", "Statement maang tikka with delicate detailing.", 1899, 2499, "bridal", "Gold Plated", 8, True, False, [imgs[7], imgs[5]]),
            ("Lila Drop Earrings", "Long drop earrings with mother-of-pearl accent.", 1299, 1699, "earrings", "Brass", 20, False, True, [imgs[2], imgs[6]]),
            ("Aditi Coin Necklace", "Vintage coin necklace with adjustable chain.", 1699, 2199, "necklaces", "Brass", 15, False, False, [imgs[4], imgs[7]]),
        ]
        docs = []
        for name, desc, price, cmp, cat, mat, stock, feat, best, im in seed_products:
            docs.append({
                "id": str(uuid.uuid4()),
                "name": name,
                "description": desc,
                "price": price,
                "compare_price": cmp if cmp > 0 else None,
                "category": cat,
                "material": mat,
                "stock": stock,
                "featured": feat,
                "bestseller": best,
                "images": im,
                "sku": f"PIPA-{name.upper().replace(' ', '')[:8]}",
                "created_at": now_iso(),
                "updated_at": now_iso(),
            })
        await db.products.insert_many(docs)

    # Banners
    if await db.banners.count_documents({}) == 0:
        await db.banners.insert_many([
            {"id": str(uuid.uuid4()), "title": "The Heirloom Edit", "subtitle": "Crafted by hand, worn for generations", "image": "https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "link": "/shop", "active": True, "created_at": now_iso()},
        ])

    # Coupons
    if await db.coupons.count_documents({}) == 0:
        await db.coupons.insert_many([
            {"id": str(uuid.uuid4()), "code": "WELCOME10", "discount_percent": 10, "min_order": 0, "active": True, "created_at": now_iso()},
            {"id": str(uuid.uuid4()), "code": "PIPA20", "discount_percent": 20, "min_order": 2000, "active": True, "created_at": now_iso()},
        ])

    # Lookbook
    if await db.lookbook.count_documents({}) == 0:
        sample_products = await db.products.find({}, {"_id": 0, "id": 1}).limit(8).to_list(length=None)
        sp_ids = [p['id'] for p in sample_products]
        look_imgs = [
            "https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600",
            "https://images.pexels.com/photos/9293538/pexels-photo-9293538.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600",
            "https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600",
            "https://images.pexels.com/photos/33209522/pexels-photo-33209522.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600",
        ]
        looks = []
        for i, im in enumerate(look_imgs):
            looks.append({
                "id": str(uuid.uuid4()),
                "image": im,
                "caption": ["Heirloom Glow", "Modern Muse", "Layered Story", "Bridal Reverie"][i],
                "product_ids": sp_ids[i*2:i*2+2] if i*2+1 < len(sp_ids) else sp_ids[:2],
                "active": True,
                "created_at": now_iso(),
            })
        await db.lookbook.insert_many(looks)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
