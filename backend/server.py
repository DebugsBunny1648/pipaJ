from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from database import mongo_client
from seed import seed
from routers import auth, products, catalog, customers, orders, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await seed()
    yield
    mongo_client.close()


app = FastAPI(title="Pipa Jewellery API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in [auth.router, products.router, catalog.router, customers.router, orders.router, admin.router]:
    app.include_router(r, prefix="/api")
