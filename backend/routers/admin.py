from fastapi import APIRouter, Depends

from database import db
from deps import get_admin
from utils import strip_id

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(_=Depends(get_admin)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(None)
    return users


@router.get("/stats")
async def dashboard_stats(_=Depends(get_admin)):
    orders = await db.orders.find({}, {"total": 1, "status": 1, "_id": 0}).to_list(None)
    total_sales   = sum(o["total"] for o in orders)
    total_orders  = len(orders)
    by_status     = {}
    for o in orders:
        by_status[o["status"]] = by_status.get(o["status"], 0) + 1

    total_products  = await db.products.count_documents({})
    total_customers = await db.users.count_documents({"role": "customer"})

    return {
        "total_sales":     round(total_sales, 2),
        "total_orders":    total_orders,
        "total_products":  total_products,
        "total_customers": total_customers,
        "orders_by_status": by_status,
    }
