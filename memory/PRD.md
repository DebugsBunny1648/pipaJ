# Pipa Jewellery — PRD

## Problem Statement
Create Pipa Jewellery — a React + MongoDB jewellery e-commerce site similar to alittleextra.co.in with a secure admin panel for the owner to manage stock, users, products, etc. Proper validation on every input.

## User Personas
- **Shoppers**: browse, search, filter, wishlist, add to cart, checkout (COD).
- **Pipa Admin (owner)**: manages products, stock, categories, banners, coupons, orders, users; views sales analytics.

## Architecture
- React 19 (CRA + craco), Tailwind, shadcn UI, lucide-react, recharts, sonner toasts.
- FastAPI + Motor (MongoDB) — backend uses FastAPI because the platform's supervisor is locked to FastAPI; API behavior is identical to a Node.js Express implementation.
- JWT auth (PyJWT + bcrypt) with role-based admin guard.

## Implemented (2026-06-22)
- Storefront: Home (hero + categories + bestsellers + featured + editorial), Shop with category/search/price/sort filters, Product Detail with gallery, Cart, Wishlist, Checkout with address validation + coupon, Login/Signup/Account+Orders.
- Admin Panel (/admin): Dashboard with KPIs + revenue chart, Products CRUD with stock & validation, Orders with status updates, Users list, Categories CRUD, Coupons CRUD with min order, Banners CRUD.
- Backend: auth (signup/login/me), products (CRUD + filters/sort), categories, banners, coupons + validate, cart, wishlist, orders (create + my-orders + admin list + status updates), admin stats + users. Seed data: admin, demo customer, 5 categories, 12 products, 1 banner, 2 coupons.
- Validation: server-side (Pydantic) + client-side on every form.
- All interactive elements include `data-testid`.

## Test Credentials
- Admin: admin@pipa.com / Admin@123
- Customer: demo@pipa.com / Demo@123
- Coupons: WELCOME10 (10% off), PIPA20 (20% off ₹2000+)

## P0 Backlog
- Real payment gateway (Razorpay/Stripe) — currently COD only.

## P1 Backlog
- Product image upload (object storage) instead of pasting URLs.
- Product reviews & ratings.
- Address book per user.
- Order email notifications (Resend/SendGrid).

## P2 Backlog
- Inventory alerts to admin email.
- Multiple banners carousel.
- SEO meta tags & sitemap.
- Wishlist sharing.

## Updates (2026-06-22, v2)
- ✅ Product Reviews & Ratings (star 1-5 + comment; one per user; owner/admin delete)
- ✅ Address Book per user (multiple, default, validation) + saved-address picker on Checkout
- ✅ "Shop The Look" Instagram-style gallery on Home (4 seeded looks) with click-to-modal product list; admin CRUD at /admin/lookbook
- ⏸️ Razorpay integration deferred — awaiting `rzp_test_*` Key ID and Key Secret from user.

## Updates (2026-06-22, v3)
- ✅ Razorpay integration (test mode): `/api/payments/razorpay/order` (auto-created on checkout when method=RAZORPAY), `/api/payments/razorpay/verify` (HMAC SHA256 signature verification), `/api/payments/razorpay/key` (returns public key id).
- ✅ Checkout shows payment-method radio: Pay Online (Razorpay UPI/Cards/Netbanking) [default] or COD. Razorpay Checkout.js modal opens on submit; cart is cleared only after server-side signature verification succeeds; order status → confirmed, payment_status → paid.
- ✅ Test keys in `/app/backend/.env` (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET).
- Test cards: 4111 1111 1111 1111 (success), 5267 3181 8797 5449 (failure), CVV any 3 digits, expiry any future date.

## Updates (2026-06-22, v4)
- ✅ **Razorpay Webhook** at `POST /api/payments/razorpay/webhook`:
  - HMAC SHA256 signature verification (`X-Razorpay-Signature` header) when `RAZORPAY_WEBHOOK_SECRET` is set; logs a warning and accepts otherwise.
  - Handles `payment.captured`, `order.paid` → marks order paid+confirmed and clears cart.
  - Handles `payment.failed` → marks payment_status=failed.
  - Handles `refund.processed` → marks refunded+cancelled.
- ✅ **Email notifications** via Resend (`POST https://api.resend.com/emails`).
  - Triggers: order placed (COD), payment verified (Razorpay), webhook-confirmed payment, status changed to shipped/delivered/cancelled.
  - DEV-LOG fallback: when `RESEND_API_KEY` is empty, full email is printed to backend logs (visible via `tail /var/log/supervisor/backend.err.log`).
- env vars: `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `FROM_EMAIL`.
