"""
One-time import script: loads data.json products into MongoDB.

Usage (from the backend/ directory):
    python import_data.py
    python import_data.py --replace   # drop existing products first

The script maps dm2buy product fields → Pipa product schema.
"""

import asyncio
import json
import re
import sys
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME   = os.environ["DB_NAME"]

DATA_FILE = Path(__file__).parent.parent / "data.json"


def infer_category(title: str, description: str) -> str:
    text = (title + " " + description).lower()
    if any(w in text for w in ["earring", "jhumka", "stud", "hoop", "drop ear"]):
        return "earrings"
    if any(w in text for w in ["necklace", "pendant", "choker", "chain", "maang"]):
        return "necklaces"
    if any(w in text for w in ["bangle", "kangan"]):
        return "bangles"
    if any(w in text for w in ["ring", "band"]):
        return "rings"
    if any(w in text for w in ["anklet"]):
        return "anklets"
    if any(w in text for w in ["bracelet", "hand chain", "charm chain", "wrist"]):
        return "bracelets"
    if any(w in text for w in ["bookmark", "keychain", "charm", "scooty", "hair clip", "hair"]):
        return "accessories"
    if any(w in text for w in ["set", "bridal", "navratri", "kashmiri"]):
        return "sets"
    return "earrings"


def map_product(item: dict, now_str: str) -> dict:
    pid       = item["_id"]
    name      = item.get("title", "").strip()
    desc      = item.get("description", "").strip()
    mrp       = float(item.get("mrp", 0))
    price     = float(item.get("discountedPrice", mrp))
    stock     = int(item.get("stock", 0))
    images    = [u for u in item.get("images", []) if u]
    slug      = item.get("slug", "")
    status    = item.get("status", "active")
    has_var   = item.get("hasVariants", False)
    variants  = item.get("variants") or []
    var_opts  = item.get("variantOptions") or {}
    attrs     = item.get("attributes") or []
    lifetime  = int(item.get("lifetimeSold", 0))

    compare_price = mrp if mrp > price else None

    sku = re.sub(r"[^A-Za-z0-9_-]", "-", slug)[:50] if slug else f"PIPA-{pid[:8].upper()}"

    doc = {
        "id":            pid,
        "name":          name,
        "description":   desc,
        "price":         price,
        "compare_price": compare_price,
        "category":      infer_category(name, desc),
        "material":      "Gold Plated",
        "stock":         stock,
        "images":        images[:10],
        "featured":      lifetime > 0,
        "bestseller":    lifetime > 2,
        "sku":           sku,
        "slug":          slug,
        "status":        status,
        "has_variants":  has_var,
        "variants":      variants,
        "variant_options": var_opts,
        "attributes":    attrs,
        "created_at":    item.get("createdAt", now_str),
        "updated_at":    item.get("updatedAt", now_str),
    }
    return doc


async def main(replace: bool = False):
    if not DATA_FILE.exists():
        print(f"ERROR: {DATA_FILE} not found")
        sys.exit(1)

    raw = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    items = raw.get("data", raw) if isinstance(raw, dict) else raw
    print(f"Found {len(items)} products in data.json")

    client = AsyncIOMotorClient(MONGO_URL)
    db     = client[DB_NAME]

    if replace:
        await db.products.delete_many({})
        print("Cleared existing products collection")

    from datetime import datetime
    now_str = datetime.utcnow().isoformat() + "Z"

    inserted = skipped = errors = 0
    for item in items:
        if not item.get("_id") or not item.get("title"):
            errors += 1
            continue
        doc = map_product(item, now_str)
        existing = await db.products.find_one({"id": doc["id"]})
        if existing:
            skipped += 1
            continue
        try:
            await db.products.insert_one(doc)
            inserted += 1
        except Exception as e:
            print(f"  SKIP {doc['name']!r}: {e}")
            errors += 1

    client.close()
    print(f"\nDone  inserted={inserted}  skipped={skipped}  errors={errors}")
    print(f"Total products in DB after import: {inserted + skipped}")


if __name__ == "__main__":
    replace = "--replace" in sys.argv
    asyncio.run(main(replace))
