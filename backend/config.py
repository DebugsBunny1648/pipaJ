import logging
import os
from pathlib import Path

import razorpay
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME   = os.environ["DB_NAME"]

JWT_SECRET = os.environ.get("JWT_SECRET", "pipa-secret-change-me")
JWT_ALGO   = "HS256"
JWT_HOURS  = 24 * 7

RZP_KEY_ID      = os.environ.get("RAZORPAY_KEY_ID", "")
RZP_KEY_SECRET  = os.environ.get("RAZORPAY_KEY_SECRET", "")
RZP_WEBHOOK_SEC = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")
rzp = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET)) if RZP_KEY_ID and RZP_KEY_SECRET else None

RESEND_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "Pipa Jewellery <onboarding@resend.dev>")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

VALID_STATUSES = {"pending", "confirmed", "shipped", "delivered", "cancelled"}
