from config import log
from database import db
from deps import hash_pw
from utils import now, new_id


async def seed():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)

    if not await db.users.find_one({"email": "admin@pipa.com"}):
        await db.users.insert_one({
            "id": new_id(), "name": "Pipa Admin", "email": "admin@pipa.com",
            "password": hash_pw("Admin@123"), "role": "admin", "created_at": now(),
        })
        log.info("Seeded admin: admin@pipa.com / Admin@123")

    if not await db.users.find_one({"email": "demo@pipa.com"}):
        await db.users.insert_one({
            "id": new_id(), "name": "Demo Customer", "email": "demo@pipa.com",
            "password": hash_pw("Demo@123"), "role": "customer", "created_at": now(),
        })

    if await db.categories.count_documents({}) == 0:
        cats = [
            ("Earrings",  "earrings",  "https://images.pexels.com/photos/5413313/pexels-photo-5413313.jpeg?auto=compress&cs=tinysrgb&w=800"),
            ("Necklaces", "necklaces", "https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?auto=compress&cs=tinysrgb&w=800"),
            ("Rings",     "rings",     "https://images.pexels.com/photos/7248760/pexels-photo-7248760.jpeg?auto=compress&cs=tinysrgb&w=800"),
            ("Bangles",   "bangles",   "https://images.pexels.com/photos/4004225/pexels-photo-4004225.jpeg?auto=compress&cs=tinysrgb&w=800"),
            ("Bridal",    "bridal",    "https://images.pexels.com/photos/33209522/pexels-photo-33209522.jpeg?auto=compress&cs=tinysrgb&w=800"),
        ]
        await db.categories.insert_many([
            {"id": new_id(), "name": n, "slug": s, "image": img,
             "description": f"{n} collection", "created_at": now()}
            for n, s, img in cats
        ])

    if await db.products.count_documents({}) == 0:
        imgs = [
            "https://images.pexels.com/photos/4004225/pexels-photo-4004225.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/7248760/pexels-photo-7248760.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/5413313/pexels-photo-5413313.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/33209522/pexels-photo-33209522.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/9293538/pexels-photo-9293538.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg?auto=compress&cs=tinysrgb&w=800",
        ]
        products = [
            ("Meher Pearl Studs",       "Hand-set freshwater pearl studs with antique gold finish.",    899,  1299, "earrings",  "Brass + Pearl", 24, True,  True,  [imgs[2], imgs[0]]),
            ("Raya Chand Hoops",        "Crescent-shape hoops with intricate filigree.",               1199, 1599, "earrings",  "Brass",         18, True,  False, [imgs[0], imgs[2]]),
            ("Sahana Layered Necklace", "Three-strand layered necklace with delicate coins.",          2499, 3299, "necklaces", "Brass",         12, True,  True,  [imgs[3], imgs[1]]),
            ("Tara Pendant Chain",      "Minimal star pendant on a fine cable chain.",                 1399, None, "necklaces", "Silver",        30, False, True,  [imgs[1], imgs[3]]),
            ("Anaya Statement Ring",    "Bold cocktail ring with a single matte stone.",                999, 1499, "rings",     "Brass",         22, True,  False, [imgs[1], imgs[5]]),
            ("Ira Stack Ring Set",      "Set of three stackable bands — mix and match.",               1099, 1599, "rings",     "Silver",        16, False, True,  [imgs[5], imgs[1]]),
            ("Noor Bangle Pair",        "Pair of textured bangles in antique finish.",                 1799, 2299, "bangles",   "Brass",         14, True,  False, [imgs[0], imgs[4]]),
            ("Zara Cuff",               "Wide hand-hammered cuff bracelet.",                           1599, None, "bangles",   "Brass",         10, False, True,  [imgs[4], imgs[0]]),
            ("Devika Bridal Choker",    "Heritage-inspired bridal choker with kundan work.",           5999, 7999, "bridal",    "Gold Plated",    6, True,  True,  [imgs[4], imgs[6]]),
            ("Surya Maang Tikka",       "Statement maang tikka with delicate detailing.",              1899, 2499, "bridal",    "Gold Plated",    8, True,  False, [imgs[6], imgs[4]]),
            ("Lila Drop Earrings",      "Long drop earrings with mother-of-pearl accent.",             1299, 1699, "earrings",  "Brass",         20, False, True,  [imgs[2], imgs[5]]),
            ("Aditi Coin Necklace",     "Vintage coin necklace with adjustable chain.",                1699, 2199, "necklaces", "Brass",         15, False, False, [imgs[3], imgs[6]]),
        ]
        await db.products.insert_many([
            {"id": new_id(), "name": n, "description": desc, "price": price,
             "compare_price": cmp, "category": cat, "material": mat, "stock": stock,
             "featured": feat, "bestseller": best, "images": im,
             "sku": f"PIPA-{n.upper().replace(' ', '')[:8]}",
             "created_at": now(), "updated_at": now()}
            for n, desc, price, cmp, cat, mat, stock, feat, best, im in products
        ])

    if await db.banners.count_documents({}) == 0:
        await db.banners.insert_one({
            "id": new_id(), "title": "The Heirloom Edit",
            "subtitle": "Crafted by hand, worn for generations",
            "image": "https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "link": "/shop", "active": True, "created_at": now(),
        })

    if await db.coupons.count_documents({}) == 0:
        await db.coupons.insert_many([
            {"id": new_id(), "code": "WELCOME10", "discount_percent": 10, "min_order": 0,    "active": True, "created_at": now()},
            {"id": new_id(), "code": "PIPA20",    "discount_percent": 20, "min_order": 2000, "active": True, "created_at": now()},
        ])

    if await db.lookbook.count_documents({}) == 0:
        pids = [p["id"] for p in await db.products.find({}, {"_id": 0, "id": 1}).limit(8).to_list(None)]
        look_imgs = [
            "https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/9293538/pexels-photo-9293538.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/33209522/pexels-photo-33209522.jpeg?auto=compress&cs=tinysrgb&w=800",
        ]
        captions = ["Heirloom Glow", "Modern Muse", "Layered Story", "Bridal Reverie"]
        await db.lookbook.insert_many([
            {"id": new_id(), "image": img, "caption": cap,
             "product_ids": pids[i * 2: i * 2 + 2] or pids[:2],
             "active": True, "created_at": now()}
            for i, (img, cap) in enumerate(zip(look_imgs, captions))
        ])
