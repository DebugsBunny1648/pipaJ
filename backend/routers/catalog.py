from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from database import db
from deps import get_admin
from models import CouponIn, LookbookIn
from utils import new_id, now, strip_id

router = APIRouter(tags=["catalog"])

# ── Coupons ───────────────────────────────────────────────────────────────────

@router.get("/coupons")
async def list_coupons(_=Depends(get_admin)):
    return await db.coupons.find({}, {"_id": 0}).to_list(None)


@router.post("/coupons")
async def create_coupon(body: CouponIn, _=Depends(get_admin)):
    code = body.code.upper()
    if await db.coupons.find_one({"code": code}):
        raise HTTPException(400, "Coupon code already exists")
    doc = body.model_dump(); doc["code"] = code; doc["id"] = new_id(); doc["created_at"] = now()
    await db.coupons.insert_one(doc)
    return strip_id(doc)


@router.delete("/coupons/{cid}")
async def delete_coupon(cid: str, _=Depends(get_admin)):
    await db.coupons.delete_one({"id": cid})
    return {"ok": True}


@router.post("/coupons/validate")
async def validate_coupon(body: dict):
    code = (body.get("code") or "").upper().strip()
    subtotal = float(body.get("subtotal") or 0)
    if not code: raise HTTPException(400, "code required")
    c = await db.coupons.find_one({"code": code, "active": True}, {"_id": 0})
    if not c: raise HTTPException(404, "Invalid or inactive coupon")
    expiry = c.get("expiry_date")
    if expiry and date.fromisoformat(expiry) < date.today():
        raise HTTPException(400, "Coupon has expired")
    if subtotal < c.get("min_order", 0):
        raise HTTPException(400, f"Minimum order ₹{c['min_order']} required")
    return {
        "code": c["code"],
        "discount_percent": c["discount_percent"],
        "discount_amount": round(subtotal * c["discount_percent"] / 100, 2),
    }

# ── Lookbook ──────────────────────────────────────────────────────────────────

@router.get("/lookbook")
async def list_lookbook():
    items = await db.lookbook.find({"active": True}, {"_id": 0}).sort("created_at", -1).to_list(None)
    all_pids = list({pid for it in items for pid in it.get("product_ids", [])})
    if all_pids:
        prods = {p["id"]: p for p in await db.products.find({"id": {"$in": all_pids}}, {"_id": 0}).to_list(None)}
        for it in items:
            it["products"] = [prods[pid] for pid in it.get("product_ids", []) if pid in prods]
    return items


@router.post("/lookbook")
async def create_lookbook(body: LookbookIn, _=Depends(get_admin)):
    if not body.image: raise HTTPException(400, "Image required")
    doc = body.model_dump(); doc["id"] = new_id(); doc["created_at"] = now()
    await db.lookbook.insert_one(doc)
    return strip_id(doc)


@router.delete("/lookbook/{lid}")
async def delete_lookbook(lid: str, _=Depends(get_admin)):
    await db.lookbook.delete_one({"id": lid})
    return {"ok": True}
