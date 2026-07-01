import uuid
import requests
from datetime import datetime, timezone

from config import log, RESEND_KEY, FROM_EMAIL


def now() -> str:
    return datetime.now(timezone.utc).isoformat()

def new_id() -> str:
    return str(uuid.uuid4())

def strip_id(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc

def send_email(to: str, subject: str, html: str) -> None:
    if not RESEND_KEY:
        log.info("[EMAIL DEV] to=%s subject=%s", to, subject)
        return
    try:
        r = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_KEY}", "Content-Type": "application/json"},
            json={"from": FROM_EMAIL, "to": [to], "subject": subject, "html": html},
            timeout=10,
        )
        if r.status_code >= 300:
            log.warning("Resend failed %s %s", r.status_code, r.text)
    except Exception as e:
        log.warning("Resend error: %s", e)

def order_email(order: dict, heading: str) -> str:
    rows = "".join(
        f"<tr>"
        f"<td style='padding:8px;border-bottom:1px solid #eee'>{it['name']} × {it['quantity']}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #eee;text-align:right'>₹{it['subtotal']:.0f}</td>"
        f"</tr>"
        for it in order.get("items", [])
    )
    a = order.get("address", {})
    return f"""
    <div style="font-family:Arial,sans-serif;background:#f9f9f9;padding:24px">
      <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #e5e5e5;padding:32px">
        <h1 style="font-size:24px;margin:0 0 4px">Pipa Jewellery</h1>
        <p style="text-transform:uppercase;font-size:12px;color:#888;margin:0 0 20px">{heading}</p>
        <p>Hi {order.get('user_name', '')},</p>
        <p>Order <strong>{order.get('order_no')}</strong> — <strong>{order.get('status')}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">{rows}</table>
        <p style="text-align:right;font-size:16px"><strong>Total: ₹{order.get('total', 0):.0f}</strong></p>
        <p style="font-size:12px;color:#888;margin-top:24px">
          Shipping to: {a.get('full_name')}, {a.get('line1')}, {a.get('city')}, {a.get('state')} {a.get('pincode')}
        </p>
      </div>
    </div>"""
