from fastapi import APIRouter, Depends, HTTPException

from database import db
from deps import get_user, hash_pw, check_pw, make_token
from models import UserSignup, UserLogin
from utils import new_id, now

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(body: UserSignup):
    if await db.users.find_one({"email": body.email.lower()}):
        raise HTTPException(400, "Email already registered")
    user = {
        "id": new_id(), "name": body.name.strip(), "email": body.email.lower(),
        "password": hash_pw(body.password), "role": "customer", "created_at": now(),
    }
    await db.users.insert_one(user)
    token = make_token(user["id"], user["role"])
    return {"token": token, "user": {k: v for k, v in user.items() if k not in ("password", "_id")}}


@router.post("/login")
async def login(body: UserLogin):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not check_pw(body.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(user["id"], user["role"])
    user.pop("password"); user.pop("_id", None)
    return {"token": token, "user": user}


@router.get("/me")
async def me(user=Depends(get_user)):
    return user
