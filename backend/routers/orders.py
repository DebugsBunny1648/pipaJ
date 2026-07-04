import hashlib
import hmac

from fastapi import APIRouter, Depends, HTTPException, Request

from config import RZP_KEY_ID, RZP_KEY_SECRET, RZP_WEBHOOK_SEC, rzp, log, VALID_STATUSES
from database import db
from deps import get_user, get_admin
from models import OrderCreate, RazorpayVerify
from utils import new_id, now, strip_id, send_email, order_email

router = APIRouter(tags=["orders"])

# ── Razorpay helpers ──────────────────────────────────────────────────────────

@router.get("/payments/razorpay/key")
async def rzp_key():
    return {"key": RZP_KEY_ID, "key_id": RZP_KEY_ID}


@router.post("/payments/razorpay/verify")
async def rzp_verify(body: RazorpayVerify, user=Depends(get_user)):
    sig = hmac.new(RZP_KEY_SECRET.encode(), f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode(), hashlib.sha256).hexdigest()
    if sig != body.razorpay_signature:
        raise HTTPException(400, "Invalid signature")
    order = await db.orders.find_one({"razorpay_order_id": body.razorpay_order_id}, {"_id": 0})
    if not order: raise HTTPException(404, "Order not found")
    await db.orders.update_one({"id": order["id"]}, {"$set": {"payment_status": "paid", "razorpay_payment_id": body.razorpay_payment_id}})
    return {"ok": True}


@router.post("/payments/razorpay/webhook")
async def rzp_webhook(request: Request):
    body_bytes = await request.body()
    sig = request.headers.get("x-razorpay-signature", "")
    expected = hmac.new(RZP_WEBHOOK_SEC.encode(), body_bytes, hashlib.sha256).hexdigest()
    if sig != expected:
        raise HTTPException(400, "Invalid webhook signature")
    data = await request.json()
    if data.get("event") == "payment.captured":
        pid = data["payload"]["payment"]["entity"]["id"]
        await db.orders.update_one({"razorpay_payment_id": pid}, {"$set": {"payment_status": "paid"}})
    return {"ok": True}

# ── Orders ────────────────────────────────────────────────────────────────────

@router.post("/orders")
async def create_order(body: OrderCreate, user=Depends(get_user)):
    if not body.items: raise HTTPException(400, "Cart is empty")

    pids = [ci.product_id for ci in body.items]
    products = {p["id"]: p for p in await db.products.find({"id": {"$in": pids}}, {"_id": 0}).to_list(None)}

    items, subtotal = [], 0.0
    for ci in body.items:
        p = products.get(ci.product_id)
        if not p: raise HTTPException(400, f"Product {ci.product_id} not found")
        if p.get("stock", 0) < ci.quantity:
            raise HTTPException(400, f"Insufficient stock for {p['name']}")
        line_total = p["price"] * ci.quantity
        subtotal += line_total
        items.append({"product_id": ci.product_id, "name": p["name"], "price": p["price"],
                       "quantity": ci.quantity, "total": line_total, "image": p.get("images", [""])[0]})

    # Apply coupon
    discount = 0.0
    coupon_code = (body.coupon_code or "").strip().upper()
    if coupon_code:
        c = await db.coupons.find_one({"code": coupon_code, "active": True}, {"_id": 0})
        if c and subtotal >= c.get("min_order", 0):
            discount = round(subtotal * c["discount_percent"] / 100, 2)

    total = subtotal - discount
    oid = new_id()

    rzp_order = None
    if body.payment_method == "razorpay" and rzp:
        rzp_order = rzp.order.create({"amount": int(total * 100), "currency": "INR", "receipt": oid})

    doc = {
        "id": oid, "order_no": f"PIPA-{oid[:8].upper()}",
        "user_id": user["id"], "user_name": user["name"], "user_email": user["email"],
        "items": items, "address": body.address.model_dump(),
        "subtotal": subtotal, "discount": discount, "total": total,
        "coupon_code": coupon_code or None,
        "payment_method": body.payment_method, "payment_status": "pending",
        "status": "pending", "notes": body.notes or "",
        "razorpay_order_id": rzp_order["id"] if rzp_order else None,
        "created_at": now(), "updated_at": now(),
    }
    await db.orders.insert_one(doc)

    # Decrement stock
    for ci in body.items:
        await db.products.update_one({"id": ci.product_id}, {"$inc": {"stock": -ci.quantity}})

    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": []}})

    try:
        await send_email(user["email"], f"Order #{oid[:8].upper()} Confirmed", order_email(doc, "Order Confirmed"))
    except Exception as e:
        log.warning("Email send failed: %s", e)

    resp = strip_id(doc)
    if rzp_order: resp["razorpay_order_id"] = rzp_order["id"]; resp["razorpay_key"] = RZP_KEY_ID
    return resp


@router.get("/orders/mine")
async def my_orders(user=Depends(get_user)):
    return await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(None)


@router.get("/orders/{oid}")
async def get_order(oid: str, user=Depends(get_user)):
    q = {"id": oid}
    if user.get("role") != "admin": q["user_id"] = user["id"]
    o = await db.orders.find_one(q, {"_id": 0})
    if not o: raise HTTPException(404, "Order not found")
    return o


@router.get("/orders")
async def list_orders(_=Depends(get_admin)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(None)


@router.put("/orders/{oid}/status")
async def update_order_status(oid: str, body: dict, _=Depends(get_admin)):
    status = body.get("status")
    if status not in VALID_STATUSES:
        raise HTTPException(400, f"Valid statuses: {VALID_STATUSES}")
    r = await db.orders.update_one({"id": oid}, {"$set": {"status": status, "updated_at": now()}})
    if not r.matched_count: raise HTTPException(404, "Order not found")
    return {"ok": True, "status": status}
