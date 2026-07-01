from fastapi import APIRouter, Depends, HTTPException

from database import db
from deps import get_user
from models import CartItem, ReviewIn, AddressIn
from utils import new_id, now, strip_id

router = APIRouter(tags=["customers"])

# ── Wishlist ──────────────────────────────────────────────────────────────────

@router.get("/wishlist")
async def get_wishlist(user=Depends(get_user)):
    w = await db.wishlists.find_one({"user_id": user["id"]}, {"_id": 0}) or {"product_ids": []}
    pids = w.get("product_ids") or []
    if not pids: return {"items": []}
    items = await db.products.find({"id": {"$in": pids}}, {"_id": 0}).to_list(None)
    return {"items": items}


@router.post("/wishlist/toggle")
async def toggle_wishlist(body: dict, user=Depends(get_user)):
    pid = body.get("product_id")
    if not pid: raise HTTPException(400, "product_id required")
    w = await db.wishlists.find_one({"user_id": user["id"]})
    pids = w.get("product_ids", []) if w else []
    if pid in pids:
        pids.remove(pid); in_wl = False
    else:
        pids.append(pid); in_wl = True
    await db.wishlists.update_one({"user_id": user["id"]}, {"$set": {"product_ids": pids}}, upsert=True)
    return {"in_wishlist": in_wl}

# ── Cart ──────────────────────────────────────────────────────────────────────

@router.get("/cart")
async def get_cart(user=Depends(get_user)):
    cart = await db.carts.find_one({"user_id": user["id"]}, {"_id": 0}) or {"items": []}
    cart_items = cart.get("items", [])
    if not cart_items: return {"items": []}
    pids = [ci["product_id"] for ci in cart_items]
    products = {p["id"]: p for p in await db.products.find({"id": {"$in": pids}}, {"_id": 0}).to_list(None)}
    return {"items": [{"product": products[ci["product_id"]], "quantity": ci["quantity"]}
                      for ci in cart_items if ci["product_id"] in products]}


@router.post("/cart/add")
async def add_to_cart(item: CartItem, user=Depends(get_user)):
    if not await db.products.find_one({"id": item.product_id}):
        raise HTTPException(404, "Product not found")
    cart = await db.carts.find_one({"user_id": user["id"]})
    items = cart.get("items", []) if cart else []
    for it in items:
        if it["product_id"] == item.product_id:
            it["quantity"] += item.quantity
            break
    else:
        items.append(item.model_dump())
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": items}}, upsert=True)
    return {"ok": True}


@router.post("/cart/update")
async def update_cart(item: CartItem, user=Depends(get_user)):
    cart = await db.carts.find_one({"user_id": user["id"]}) or {"items": []}
    items = [it for it in cart["items"] if it["product_id"] != item.product_id]
    if item.quantity > 0: items.append(item.model_dump())
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": items}}, upsert=True)
    return {"ok": True}


@router.post("/cart/clear")
async def clear_cart(user=Depends(get_user)):
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": []}}, upsert=True)
    return {"ok": True}

# ── Reviews ───────────────────────────────────────────────────────────────────

@router.get("/products/{pid}/reviews")
async def list_reviews(pid: str):
    reviews = await db.reviews.find({"product_id": pid}, {"_id": 0}).sort("created_at", -1).to_list(None)
    if not reviews: return {"reviews": [], "avg": 0, "count": 0}
    return {"reviews": reviews,
            "avg": round(sum(r["rating"] for r in reviews) / len(reviews), 1),
            "count": len(reviews)}


@router.post("/products/{pid}/reviews")
async def create_review(pid: str, body: ReviewIn, user=Depends(get_user)):
    if not await db.products.find_one({"id": pid}): raise HTTPException(404, "Product not found")
    if await db.reviews.find_one({"product_id": pid, "user_id": user["id"]}):
        raise HTTPException(400, "Already reviewed")
    doc = {"id": new_id(), "product_id": pid, "user_id": user["id"],
           "user_name": user["name"], "rating": body.rating,
           "comment": body.comment.strip(), "created_at": now()}
    await db.reviews.insert_one(doc)
    return strip_id(doc)


@router.delete("/reviews/{rid}")
async def delete_review(rid: str, user=Depends(get_user)):
    r = await db.reviews.find_one({"id": rid})
    if not r: raise HTTPException(404, "Not found")
    if r["user_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(403, "Not allowed")
    await db.reviews.delete_one({"id": rid})
    return {"ok": True}

# ── Addresses ─────────────────────────────────────────────────────────────────

@router.get("/addresses")
async def list_addresses(user=Depends(get_user)):
    return await db.addresses.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(None)


@router.post("/addresses")
async def create_address(body: AddressIn, user=Depends(get_user)):
    doc = body.model_dump()
    doc["id"] = new_id(); doc["user_id"] = user["id"]; doc["created_at"] = now()
    if doc["is_default"]:
        await db.addresses.update_many({"user_id": user["id"]}, {"$set": {"is_default": False}})
    elif await db.addresses.count_documents({"user_id": user["id"]}) == 0:
        doc["is_default"] = True
    await db.addresses.insert_one(doc)
    return strip_id(doc)


@router.delete("/addresses/{aid}")
async def delete_address(aid: str, user=Depends(get_user)):
    r = await db.addresses.delete_one({"id": aid, "user_id": user["id"]})
    if not r.deleted_count: raise HTTPException(404, "Not found")
    return {"ok": True}


@router.post("/addresses/{aid}/default")
async def set_default_address(aid: str, user=Depends(get_user)):
    if not await db.addresses.find_one({"id": aid, "user_id": user["id"]}):
        raise HTTPException(404, "Not found")
    await db.addresses.update_many({"user_id": user["id"]}, {"$set": {"is_default": False}})
    await db.addresses.update_one({"id": aid}, {"$set": {"is_default": True}})
    return {"ok": True}
