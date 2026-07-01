from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from database import db
from deps import get_admin
from models import ProductIn, CategoryIn, BannerIn
from utils import new_id, now, strip_id

router = APIRouter(tags=["products"])

SORT_MAP = {
    "newest":     [("created_at", -1)],
    "price_asc":  [("price", 1)],
    "price_desc": [("price", -1)],
    "name":       [("name", 1)],
}

# ── Products ──────────────────────────────────────────────────────────────────

@router.get("/products")
async def list_products(
    category: Optional[str] = None, search: Optional[str] = None,
    min_price: Optional[float] = None, max_price: Optional[float] = None,
    featured: Optional[bool] = None, bestseller: Optional[bool] = None,
    sort: str = "newest", limit: int = 50,
):
    q: dict = {}
    if category:               q["category"] = category
    if featured is not None:   q["featured"] = featured
    if bestseller is not None: q["bestseller"] = bestseller
    if search:
        q["$or"] = [{"name": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}}]
    if min_price is not None or max_price is not None:
        pf: dict = {}
        if min_price is not None: pf["$gte"] = min_price
        if max_price is not None: pf["$lte"] = max_price
        q["price"] = pf
    return await db.products.find(q, {"_id": 0}).sort(
        SORT_MAP.get(sort, SORT_MAP["newest"])
    ).limit(min(limit, 200)).to_list(None)


@router.get("/products/{pid}")
async def get_product(pid: str):
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p: raise HTTPException(404, "Product not found")
    return p


@router.post("/products")
async def create_product(body: ProductIn, _=Depends(get_admin)):
    doc = body.model_dump()
    doc["id"] = new_id(); doc["created_at"] = doc["updated_at"] = now()
    if not doc.get("sku"): doc["sku"] = f"PIPA-{doc['id'][:8].upper()}"
    await db.products.insert_one(doc)
    return strip_id(doc)


@router.put("/products/{pid}")
async def update_product(pid: str, body: ProductIn, _=Depends(get_admin)):
    doc = body.model_dump(); doc["updated_at"] = now()
    r = await db.products.update_one({"id": pid}, {"$set": doc})
    if not r.matched_count: raise HTTPException(404, "Product not found")
    return await db.products.find_one({"id": pid}, {"_id": 0})


@router.delete("/products/{pid}")
async def delete_product(pid: str, _=Depends(get_admin)):
    r = await db.products.delete_one({"id": pid})
    if not r.deleted_count: raise HTTPException(404, "Product not found")
    return {"ok": True}

# ── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories")
async def list_categories():
    return await db.categories.find({}, {"_id": 0}).sort("name", 1).to_list(None)


@router.post("/categories")
async def create_category(body: CategoryIn, _=Depends(get_admin)):
    if await db.categories.find_one({"slug": body.slug}):
        raise HTTPException(400, "Slug already exists")
    doc = body.model_dump(); doc["id"] = new_id(); doc["created_at"] = now()
    await db.categories.insert_one(doc)
    return strip_id(doc)


@router.put("/categories/{cid}")
async def update_category(cid: str, body: CategoryIn, _=Depends(get_admin)):
    r = await db.categories.update_one({"id": cid}, {"$set": body.model_dump()})
    if not r.matched_count: raise HTTPException(404, "Category not found")
    return await db.categories.find_one({"id": cid}, {"_id": 0})


@router.delete("/categories/{cid}")
async def delete_category(cid: str, _=Depends(get_admin)):
    r = await db.categories.delete_one({"id": cid})
    if not r.deleted_count: raise HTTPException(404, "Not found")
    return {"ok": True}

# ── Banners ───────────────────────────────────────────────────────────────────

@router.get("/banners")
async def list_banners():
    return await db.banners.find({}, {"_id": 0}).to_list(None)


@router.post("/banners")
async def create_banner(body: BannerIn, _=Depends(get_admin)):
    doc = body.model_dump(); doc["id"] = new_id(); doc["created_at"] = now()
    await db.banners.insert_one(doc)
    return strip_id(doc)


@router.delete("/banners/{bid}")
async def delete_banner(bid: str, _=Depends(get_admin)):
    await db.banners.delete_one({"id": bid})
    return {"ok": True}
