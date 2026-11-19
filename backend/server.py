from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import asyncio
import os
import logging
import bcrypt
import jwt
import stripe
from contextlib import suppress
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator, EmailStr
from typing_extensions import Annotated
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
DROP_PASS_HOURS = 24

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    id: PyObjectId = Field(alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        doc = dict(doc)
        doc["_id"] = str(doc["_id"])
        return cls(**doc)

    def to_mongo(self) -> dict:
        doc = self.model_dump(exclude={"id"})
        return doc


# ---------- Models ----------

class ProductVariant(BaseModel):
    color: str
    color_hex: str = "#181818"
    sizes: List[str] = Field(default_factory=lambda: ["S", "M", "L", "XL"])
    stock: dict = Field(default_factory=dict)


class Product(BaseDocument):
    slug: str
    name: str
    category: str
    price: float
    description: str = ""
    details: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    color_hexes: List[str] = Field(default_factory=list)
    sizes: List[str] = Field(default_factory=lambda: ["S", "M", "L", "XL"])
    collections: List[str] = Field(default_factory=list)
    sold_out: bool = False
    sort_order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    description: str = ""
    details: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    color_hexes: List[str] = Field(default_factory=list)
    sizes: List[str] = Field(default_factory=lambda: ["S", "M", "L", "XL"])
    collections: List[str] = Field(default_factory=list)
    sold_out: bool = False


class CartLine(BaseModel):
    product_id: str
    name: str
    price: float
    color: str
    size: str
    qty: int = Field(ge=1, le=10)
    image: str


class CheckoutRequest(BaseModel):
    items: List[CartLine]
    origin_url: str


class NewsletterRequest(BaseModel):
    email: EmailStr
    phone: str = ""
    tag: str = "general"


class SettingsUpdate(BaseModel):
    drop_mode: Optional[bool] = None
    drop_label: Optional[str] = None
    drop_at: Optional[str] = None
    drop_display_date: Optional[str] = None
    drop_password: Optional[str] = None
    announcement_text: Optional[str] = None
    shipping_fee: Optional[float] = None
    wild_images: Optional[List[str]] = None
    teasers: Optional[List[dict]] = None


class UnlockRequest(BaseModel):
    password: str


DEFAULT_SETTINGS = {
    "drop_mode": False,
    "drop_label": "DROP 01",
    "drop_at": "",
    "drop_display_date": "FRI 05 DEC / 7:00 PM EST",
    "drop_password": "MXXVI2026",
    "announcement_text": "DROP 01 — OUT NOW · JOIN THE LIST FOR DROP 02",
    "shipping_fee": None,
    "wild_images": ["", "", ""],
    "teasers": [
        {"number": "001", "label": "SOON", "image": "/brand/hoodie-01-flatlay.jpg"},
        {"number": "002", "label": "CLASSIFIED", "image": ""},
        {"number": "003", "label": "CLASSIFIED", "image": ""},
        {"number": "004", "label": "CLASSIFIED", "image": ""},
    ],
}


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str = "General"
    message: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ---------- Auth ----------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {"sub": user_id, "email": email, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _request_token(request: Request) -> Optional[str]:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    return token or None


async def admin_from_request(request: Request) -> Optional[dict]:
    """Return the admin user for this request, or None. Never raises."""
    token = _request_token(request)
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        return None
    if payload.get("type") != "access":
        return None
    user = await db.users.find_one({"email": payload.get("email")}, {"_id": 0, "password_hash": 0})
    if not user or user.get("role") != "admin":
        return None
    return user


async def get_current_admin(request: Request) -> dict:
    user = await admin_from_request(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def create_drop_pass() -> str:
    payload = {"type": "drop", "exp": datetime.now(timezone.utc) + timedelta(hours=DROP_PASS_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def has_drop_pass(request: Request) -> bool:
    token = request.cookies.get("drop_pass") or request.headers.get("X-Drop-Pass")
    if not token:
        return False
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM]).get("type") == "drop"
    except jwt.InvalidTokenError:
        return False


async def site_access(request: Request) -> Optional[str]:
    """Who may see the store while Drop Mode is live: 'admin', 'unlocked', or None."""
    if await admin_from_request(request):
        return "admin"
    if has_drop_pass(request):
        return "unlocked"
    return None


async def require_site_open(request: Request) -> None:
    """Block store data for the public while Drop Mode is live."""
    doc = await get_settings_doc()
    if drop_is_live(doc) and not await site_access(request):
        raise HTTPException(status_code=403, detail="Drop Mode is live")


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(os.environ.get("ADMIN_PASSWORD")),
            "name": "MORRO Admin", "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded: %s", admin_email)


@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), email, user.get("role", "admin"))
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=43200, path="/")
    return {"email": email, "name": user.get("name", ""), "role": user.get("role", "admin"), "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", secure=True, samesite="none")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_admin)):
    return user


# ---------- Products ----------

def product_public(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@api_router.get("/products")
async def list_products(
    category: Optional[str] = None,
    collection: Optional[str] = None,
    q: Optional[str] = None,
    include_all: bool = False,
    _open: None = Depends(require_site_open),
):
    query = {}
    if category:
        query["category"] = category
    if collection:
        query["collections"] = collection
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    cursor = db.products.find(query).sort("sort_order", 1)
    docs = await cursor.to_list(200)
    return [product_public(d) for d in docs]


@api_router.get("/products/{slug}")
async def get_product(slug: str, _open: None = Depends(require_site_open)):
    doc = await db.products.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_public(doc)


@api_router.post("/products")
async def create_product(p: ProductCreate, user: dict = Depends(get_current_admin)):
    slug = p.name.lower().replace(" ", "-").replace("'", "") + "-" + datetime.now(timezone.utc).strftime("%H%M%S")
    doc = p.model_dump()
    doc["slug"] = slug
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    count = await db.products.count_documents({})
    doc["sort_order"] = count + 1
    result = await db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return product_public(doc)


@api_router.put("/products/{product_id}")
async def update_product(product_id: str, p: ProductCreate, user: dict = Depends(get_current_admin)):
    from bson import ObjectId
    result = await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": p.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = await db.products.find_one({"_id": ObjectId(product_id)})
    return product_public(doc)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_admin)):
    from bson import ObjectId
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


# ---------- Newsletter / Contact ----------

@api_router.post("/newsletter")
async def subscribe(req: NewsletterRequest):
    email = req.email.lower().strip()
    existing = await db.newsletter.find_one({"email": email, "tag": req.tag})
    if existing:
        await db.newsletter.update_one({"_id": existing["_id"]}, {"$set": {"phone": req.phone, "updated_at": datetime.now(timezone.utc).isoformat()}})
    else:
        await db.newsletter.insert_one({"email": email, "phone": req.phone, "tag": req.tag, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"ok": True}


# ---------- Settings / Drop Mode ----------

async def get_settings_doc() -> dict:
    doc = await db.settings.find_one({"key": "site"})
    if not doc:
        doc = {"key": "site", **DEFAULT_SETTINGS}
        await db.settings.insert_one(doc)
    return doc


def drop_is_live(doc: dict) -> bool:
    """Drop Mode is live when switched on and the drop time (if set) hasn't passed."""
    if not doc.get("drop_mode"):
        return False
    drop_at = doc.get("drop_at")
    if drop_at:
        try:
            if datetime.fromisoformat(drop_at.replace("Z", "+00:00")) <= datetime.now(timezone.utc):
                return False
        except (ValueError, TypeError):
            pass
    return True


def settings_admin(doc: dict) -> dict:
    s = {k: v for k, v in doc.items() if k not in ("_id", "key")}
    s["drop_live"] = drop_is_live(doc)
    return s


@api_router.get("/settings")
async def get_settings(request: Request):
    doc = await get_settings_doc()
    public = {k: v for k, v in doc.items() if k not in ("_id", "key", "drop_password")}
    public["drop_mode"] = drop_is_live(doc)
    public["access"] = await site_access(request)
    return public


@api_router.get("/admin/settings")
async def get_admin_settings(user: dict = Depends(get_current_admin)):
    return settings_admin(await get_settings_doc())


@api_router.put("/settings")
async def update_settings(payload: SettingsUpdate, user: dict = Depends(get_current_admin)):
    update = payload.model_dump(exclude_unset=True)
    await get_settings_doc()
    if update:
        await db.settings.update_one({"key": "site"}, {"$set": update}, upsert=True)
    return settings_admin(await get_settings_doc())


@api_router.post("/drop-mode/unlock")
async def unlock_drop(req: UnlockRequest, response: Response):
    doc = await get_settings_doc()
    if not req.password or req.password != doc.get("drop_password"):
        raise HTTPException(status_code=401, detail="Wrong password")
    token = create_drop_pass()
    response.set_cookie(key="drop_pass", value=token, httponly=True, secure=True,
                        samesite="none", max_age=DROP_PASS_HOURS * 3600, path="/")
    return {"ok": True, "token": token}


@api_router.get("/newsletter")
async def list_subscribers(user: dict = Depends(get_current_admin)):
    docs = await db.newsletter.find({}).sort("created_at", -1).to_list(500)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


@api_router.post("/contact")
async def contact(req: ContactRequest):
    await db.contact_messages.insert_one({**req.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()})
    return {"ok": True}


# ---------- Orders / Stripe Checkout ----------

@api_router.post("/checkout")
async def create_checkout(req: CheckoutRequest, _open: None = Depends(require_site_open)):
    if not req.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    order_items = []
    line_items = []
    total_cents = 0
    for item in req.items:
        prod = await db.products.find_one({"slug": item.product_id})
        if not prod:
            from bson import ObjectId
            try:
                prod = await db.products.find_one({"_id": ObjectId(item.product_id)})
            except Exception:
                prod = None
        if not prod:
            raise HTTPException(status_code=400, detail=f"Product unavailable: {item.name}")
        unit_cents = int(round(prod["price"] * 100))
        total_cents += unit_cents * item.qty
        order_items.append({
            "product_id": str(prod["_id"]), "name": prod["name"], "price": prod["price"],
            "color": item.color, "size": item.size, "qty": item.qty, "image": item.image,
        })
        line_items.append({
            "price_data": {
                "currency": "usd",
                "unit_amount": unit_cents,
                "product_data": {"name": f"{prod['name']} — {item.color} / {item.size}"},
            },
            "quantity": item.qty,
        })
    settings_doc = await get_settings_doc()
    shipping_fee = settings_doc.get("shipping_fee")
    if shipping_fee:
        fee_cents = int(round(float(shipping_fee) * 100))
        total_cents += fee_cents
        order_doc_shipping = fee_cents / 100
        line_items.append({
            "price_data": {
                "currency": "usd",
                "unit_amount": fee_cents,
                "product_data": {"name": "Shipping"},
            },
            "quantity": 1,
        })
    else:
        order_doc_shipping = None
    order_doc = {
        "items": order_items, "amount": total_cents / 100, "currency": "usd",
        "shipping_fee": order_doc_shipping,
        "status": "initiated", "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.orders.insert_one(order_doc)
    order_id = str(result.inserted_id)
    try:
        session = stripe.checkout.Session.create(
            line_items=line_items,
            mode="payment",
            success_url=f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{req.origin_url}/payment/cancel",
            metadata={"order_id": order_id},
        )
    except stripe.error.StripeError as e:
        logger.error("Stripe error: %s", e)
        raise HTTPException(status_code=500, detail="Payment provider error")
    await db.orders.update_one({"_id": result.inserted_id}, {"$set": {"session_id": session.id}})
    return {"checkout_url": session.url, "session_id": session.id}


@api_router.get("/payments/status/{session_id}")
async def payment_status(session_id: str):
    order = await db.orders.find_one({"session_id": session_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await db.orders.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid",
                              "stripe_payment_intent_id": s.payment_intent,
                              "customer_email": (s.customer_details or {}).get("email"),
                              "updated_at": datetime.now(timezone.utc).isoformat()}},
                )
                order = await db.orders.find_one({"session_id": session_id})
        except stripe.error.StripeError:
            pass
    return {"session_id": session_id, "status": order["status"], "payment_status": order["payment_status"],
            "order_id": str(order["_id"])}


@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except (stripe.error.SignatureVerificationError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        await db.orders.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": obj.get("payment_status", "paid"),
                      "stripe_payment_intent_id": obj.get("payment_intent"),
                      "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
    elif t == "checkout.session.expired":
        await db.orders.update_one({"session_id": obj["id"]},
                                   {"$set": {"status": "expired", "payment_status": "expired"}})
    return {"status": "ok"}


@api_router.get("/orders")
async def list_orders(user: dict = Depends(get_current_admin)):
    docs = await db.orders.find({}).sort("created_at", -1).to_list(100)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


# ---------- Seed ----------


async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    doc = {
        "slug": "mxxvi-hoodie",
        "name": "“MXXVI” Hoodie",
        "category": "sweatshirts",
        "price": 75.0,
        "description": "Sun-faded black wash with distressed hood and cuffs. Oversized MXXVI chest print, circle M on the sleeve, kangaroo pocket. [Add fabric and weight from the maker.]",
        "details": ["Sun-faded black wash", "Distressed hood and cuffs", "Oversized MXXVI chest print", "Circle M at left sleeve", "Kangaroo pocket", "[Add fabric and weight from the maker.]"],
        "images": ["/brand/hoodie-01-flatlay.jpg", "/brand/hoodie-02-front.jpg", "/brand/hoodie-03-back.jpg", "/brand/hoodie-04-chest.jpg", "/brand/hoodie-05-sleeve.jpg"],
        "colors": ["Faded Black"],
        "color_hexes": ["#2B2B2B"],
        "sizes": ["S", "M", "L", "XL"],
        "collections": ["drop-1"],
        "sold_out": False,
        "sort_order": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.products.insert_one(doc)
    logger.info("Seeded MXXVI Hoodie")


@app.on_event("startup")
async def startup():
    app.state.seed_task = asyncio.create_task(seed_admin())
    app.state.product_task = asyncio.create_task(seed_products())
    try:
        await db.users.create_index("email", unique=True)
        await db.products.create_index("slug", unique=True)
    except Exception as e:
        logger.error("index creation: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    for task in (getattr(app.state, "seed_task", None), getattr(app.state, "product_task", None)):
        if task:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
