"""Find Locals API backed by MySQL, with SQLite available for isolated tests."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import hashlib
import json
import secrets
import sqlite3
import sys
import time
import getpass
import os
from contextlib import contextmanager
from decimal import Decimal

LOCAL_DEPS = Path(__file__).with_name(".runtime-deps")
MYSQL_VENDOR = Path(__file__).with_name("mysql_vendor")
if MYSQL_VENDOR.is_dir():
    sys.path.insert(0, str(MYSQL_VENDOR))
if LOCAL_DEPS.is_dir():
    sys.path.insert(1 if MYSQL_VENDOR.is_dir() else 0, str(LOCAL_DEPS))

LOCAL_ENV = Path(__file__).with_name(".env")
if LOCAL_ENV.is_file():
    for line in LOCAL_ENV.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

DB_DRIVER = os.environ.get("FINDLOCALS_DB_DRIVER", "mysql").strip().lower()
DB = Path(os.environ.get("FINDLOCALS_DB", Path(__file__).with_name("findlocals.db")))
MYSQL_CONFIG = {
    "host": os.environ.get("FINDLOCALS_MYSQL_HOST", "127.0.0.1"),
    "port": int(os.environ.get("FINDLOCALS_MYSQL_PORT", "3306")),
    "user": os.environ.get("FINDLOCALS_MYSQL_USER", "findlocals_app"),
    "password": os.environ.get("FINDLOCALS_MYSQL_PASSWORD", ""),
    "database": os.environ.get("FINDLOCALS_MYSQL_DATABASE", "findlocals"),
    "charset": "utf8mb4",
    "autocommit": False,
}
COOKIE = "findlocals_session"
SESSION_DAYS = 14
COOKIE_SECURE = os.environ.get("FINDLOCALS_COOKIE_SECURE", "0").lower() in ("1", "true", "yes")
PBKDF2_ROUNDS = 310_000
SAMPLE_WORKERS = [
    (1, "Ramesh Patel", "Plumber", "Navrangpura", "Ahmedabad", 0, 399, 8, "Gujarati · Hindi", "Available today", "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=85", "Reliable plumbing repairs, installations and emergency leak fixes."),
    (2, "Farhan Sheikh", "Electrician", "Bodakdev", "Ahmedabad", 0, 499, 6, "Hindi · English", "Available today", "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=85", "Certified home electrician for wiring, lighting, fans and troubleshooting."),
    (3, "Sunita Desai", "Home cleaning", "Satellite", "Ahmedabad", 0, 299, 5, "Gujarati · English", "Available tomorrow", "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=85", "Home cleaning with flexible kitchen, bathroom and move-in options."),
    (4, "Aarav Shah", "Painting", "Thaltej", "Ahmedabad", 0, 699, 10, "Gujarati · Hindi", "Available this week", "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=85", "Interior refreshes, careful prep and clean finishes for homes."),
    (5, "Imran Khan", "AC repair", "Vastrapur", "Ahmedabad", 0, 549, 7, "Hindi · English", "Available today", "https://images.unsplash.com/photo-1631545806609-3c7c6e3a92aa?auto=format&fit=crop&w=800&q=85", "AC servicing, installation and repair for split and window units."),
    (6, "Kiran Parmar", "Carpenter", "Maninagar", "Ahmedabad", 0, 449, 9, "Gujarati · Hindi", "Available tomorrow", "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=85", "Furniture repair, custom shelves and precise fittings."),
]


class HybridRow(dict):
    """Dict row which also supports SQLite-style positional access."""
    def __getitem__(self, key):
        if isinstance(key, int):
            return tuple(self.values())[key]
        return super().__getitem__(key)


class MySQLResult:
    def __init__(self, cursor):
        self.cursor = cursor
        self.lastrowid = cursor.lastrowid
        self.rowcount = cursor.rowcount

    def fetchone(self):
        row = self.cursor.fetchone()
        self.cursor.close()
        return HybridRow(row) if row is not None else None

    def fetchall(self):
        try:
            return [HybridRow(row) for row in self.cursor.fetchall()]
        finally:
            self.cursor.close()


class MySQLDatabase:
    def __init__(self, connection):
        self.connection = connection

    @staticmethod
    def _sql(query):
        return query.replace("?", "%s")

    def execute(self, query, params=()):
        cursor = self.connection.cursor()
        cursor.execute(self._sql(query), params)
        if cursor.description is None:
            result = MySQLResult(cursor)
            cursor.close()
            return result
        return MySQLResult(cursor)

    def executemany(self, query, values):
        cursor = self.connection.cursor()
        cursor.executemany(self._sql(query), values)
        result = MySQLResult(cursor)
        cursor.close()
        return result

    def executescript(self, script):
        for statement in script.split(";"):
            statement = statement.strip()
            if statement:
                self.execute(statement)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.connection.rollback() if exc_type else self.connection.commit()
        return False

    def close(self):
        self.connection.close()


def db_connect():
    if DB_DRIVER == "sqlite":
        db = sqlite3.connect(DB, timeout=10)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        return db
    if DB_DRIVER != "mysql":
        raise RuntimeError("FINDLOCALS_DB_DRIVER must be 'mysql' or 'sqlite'.")
    try:
        import pymysql
        from pymysql.cursors import DictCursor
    except ImportError as exc:
        raise RuntimeError("PyMySQL is required. Run: python -m pip install -r backend/requirements.txt") from exc
    connection = pymysql.connect(**MYSQL_CONFIG, cursorclass=DictCursor, connect_timeout=5)
    return MySQLDatabase(connection)


@contextmanager
def db_session():
    db = db_connect()
    try:
        with db:
            yield db
    finally:
        db.close()


def init_db():
    with db_session() as db:
        if DB_DRIVER == "mysql":
            schema = """
          CREATE TABLE IF NOT EXISTS users (
            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL,
            email VARCHAR(320) NOT NULL UNIQUE, phone VARCHAR(80) NOT NULL DEFAULT '',
            password_hash CHAR(64) NOT NULL, password_salt CHAR(32) NOT NULL,
            role VARCHAR(16) NOT NULL CHECK(role IN ('customer','worker','admin')), created_at BIGINT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          CREATE TABLE IF NOT EXISTS workers (
            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNIQUE,
            name VARCHAR(255) NOT NULL, service VARCHAR(160) NOT NULL, area VARCHAR(160) NOT NULL, city VARCHAR(160) NOT NULL,
            rating DECIMAL(4,2) NOT NULL DEFAULT 0, reviews INT NOT NULL DEFAULT 0,
            price INT NOT NULL, experience INT NOT NULL DEFAULT 0, languages VARCHAR(500) NOT NULL DEFAULT '',
            available VARCHAR(255) NOT NULL DEFAULT 'Availability not set', photo TEXT NOT NULL,
            verified TINYINT NOT NULL DEFAULT 0, verification_status VARCHAR(24) NOT NULL DEFAULT 'pending',
            about TEXT NOT NULL, is_demo TINYINT NOT NULL DEFAULT 0,
            CONSTRAINT workers_user_fk FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          CREATE TABLE IF NOT EXISTS bookings (
            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, customer_id BIGINT NULL, worker_id BIGINT NOT NULL,
            customer_name VARCHAR(255) NOT NULL, phone VARCHAR(80) NOT NULL, date VARCHAR(10) NOT NULL,
            slot VARCHAR(120) NOT NULL, address TEXT NOT NULL, description TEXT NOT NULL,
            status VARCHAR(24) NOT NULL DEFAULT 'Requested', created_at BIGINT NOT NULL,
            INDEX bookings_customer_idx(customer_id, created_at), INDEX bookings_worker_idx(worker_id, created_at),
            CONSTRAINT bookings_customer_fk FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE SET NULL,
            CONSTRAINT bookings_worker_fk FOREIGN KEY(worker_id) REFERENCES workers(id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          CREATE TABLE IF NOT EXISTS reviews (
            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, booking_id BIGINT NOT NULL UNIQUE,
            customer_id BIGINT NOT NULL, worker_id BIGINT NOT NULL,
            rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT NOT NULL, created_at BIGINT NOT NULL,
            CONSTRAINT reviews_booking_fk FOREIGN KEY(booking_id) REFERENCES bookings(id),
            CONSTRAINT reviews_customer_fk FOREIGN KEY(customer_id) REFERENCES users(id),
            CONSTRAINT reviews_worker_fk FOREIGN KEY(worker_id) REFERENCES workers(id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          CREATE TABLE IF NOT EXISTS payments (
            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, booking_id BIGINT NOT NULL UNIQUE,
            amount INT NOT NULL DEFAULT 0, currency CHAR(3) NOT NULL DEFAULT 'INR',
            method VARCHAR(30) NOT NULL DEFAULT 'cash', status VARCHAR(24) NOT NULL DEFAULT 'unpaid',
            provider_reference VARCHAR(255) NOT NULL DEFAULT '', created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL,
            CONSTRAINT payments_booking_fk FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          CREATE TABLE IF NOT EXISTS applications (
            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL,
            service VARCHAR(160) NOT NULL, area VARCHAR(160) NOT NULL, city VARCHAR(160) NOT NULL DEFAULT 'Ahmedabad',
            phone VARCHAR(80) NOT NULL, email VARCHAR(320) NOT NULL DEFAULT '', experience INT NOT NULL DEFAULT 0,
            about TEXT NOT NULL, status VARCHAR(24) NOT NULL DEFAULT 'Reviewing', created_at BIGINT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          CREATE TABLE IF NOT EXISTS categories (
            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL UNIQUE,
            active TINYINT NOT NULL DEFAULT 1
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          CREATE TABLE IF NOT EXISTS sessions (
            token_hash CHAR(64) NOT NULL PRIMARY KEY, user_id BIGINT NOT NULL, expires_at BIGINT NOT NULL,
            INDEX sessions_user_idx(user_id),
            CONSTRAINT sessions_user_fk FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        else:
            schema = """
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('customer','worker','admin')),
            created_at INTEGER NOT NULL
          );
          CREATE TABLE IF NOT EXISTS workers (
            id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL, service TEXT NOT NULL, area TEXT NOT NULL, city TEXT NOT NULL,
            rating REAL NOT NULL DEFAULT 0, reviews INTEGER NOT NULL DEFAULT 0,
            price INTEGER NOT NULL, experience INTEGER NOT NULL DEFAULT 0, languages TEXT NOT NULL DEFAULT '',
            available TEXT NOT NULL DEFAULT 'Availability not set', photo TEXT NOT NULL DEFAULT '',
            verified INTEGER NOT NULL DEFAULT 0, verification_status TEXT NOT NULL DEFAULT 'pending',
            about TEXT NOT NULL DEFAULT '', is_demo INTEGER NOT NULL DEFAULT 0
          );
          CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES users(id), worker_id INTEGER NOT NULL REFERENCES workers(id),
            customer_name TEXT NOT NULL, phone TEXT NOT NULL, date TEXT NOT NULL, slot TEXT NOT NULL,
            address TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Requested',
            created_at INTEGER NOT NULL
          );
          CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY, booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id),
            customer_id INTEGER NOT NULL REFERENCES users(id), worker_id INTEGER NOT NULL REFERENCES workers(id),
            rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL
          );
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY, booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
            amount INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'INR',
            method TEXT NOT NULL DEFAULT 'cash', status TEXT NOT NULL DEFAULT 'unpaid',
            provider_reference TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
          );
          CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL, service TEXT NOT NULL, area TEXT NOT NULL,
            city TEXT NOT NULL DEFAULT 'Ahmedabad', phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '',
            experience INTEGER NOT NULL DEFAULT 0, about TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'Reviewing', created_at INTEGER NOT NULL
          );
          CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, active INTEGER NOT NULL DEFAULT 1);
          CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL
          );
          CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings(customer_id, created_at DESC);
          CREATE INDEX IF NOT EXISTS bookings_worker_idx ON bookings(worker_id, created_at DESC);
        """
        db.executescript(schema)
        ignore = "INSERT IGNORE" if DB_DRIVER == "mysql" else "INSERT OR IGNORE"
        if db.execute("SELECT COUNT(*) FROM workers WHERE is_demo=1").fetchone()[0] == 0:
            db.executemany(f"""{ignore} INTO workers
              (id,name,service,area,city,rating,reviews,price,experience,languages,available,photo,verified,verification_status,about,is_demo)
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?,0,'sample',?,1)""",
              [(i,n,s,a,c,r,0,p,e,l,av,ph,about) for i,n,s,a,c,r,p,e,l,av,ph,about in SAMPLE_WORKERS])
        for name in ("Plumber", "Electrician", "Home cleaning", "Painting", "AC repair", "Carpenter", "Moving help"):
            db.execute(f"{ignore} INTO categories(name) VALUES(?)", (name,))


def password_record(password, salt=None):
    salt = salt or secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), PBKDF2_ROUNDS).hex()
    return salt, hashed


def clean_user(row):
    return {"id": row["id"], "name": row["name"], "email": row["email"], "phone": row["phone"], "role": row["role"]}


class Handler(BaseHTTPRequestHandler):
    server_version = "FindLocals/1.0"

    def send_json(self, status, value, cookie=None):
        body = json.dumps(value, ensure_ascii=False, default=lambda item: float(item) if isinstance(item, Decimal) else str(item)).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(body)

    def body(self):
        size = int(self.headers.get("Content-Length", "0"))
        if size > 1_000_000:
            raise ValueError("Request is too large")
        value = json.loads(self.rfile.read(size) or b"{}")
        if not isinstance(value, dict):
            raise ValueError("Expected a JSON object")
        return value

    def current_user(self, db):
        raw = ""
        for part in self.headers.get("Cookie", "").split(";"):
            key, _, value = part.strip().partition("=")
            if key == COOKIE:
                raw = value
                break
        if not raw:
            return None
        digest = hashlib.sha256(raw.encode()).hexdigest()
        row = db.execute("""SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id
          WHERE s.token_hash=? AND s.expires_at>?""", (digest, int(time.time()))).fetchone()
        return row

    def require_user(self, db, roles=None):
        user = self.current_user(db)
        if not user:
            self.send_json(401, {"error": "Please sign in to continue."})
            return None
        if roles and user["role"] not in roles:
            self.send_json(403, {"error": "You do not have permission to do that."})
            return None
        return user

    def do_GET(self):
        path = urlparse(self.path).path
        with db_session() as db:
            if path == "/api/data" or path == "/api/workers":
                rows = db.execute("""SELECT id,name,service,area,city,rating,reviews,price,experience,languages,
                  available,photo,verified,verification_status,about,is_demo FROM workers
                  WHERE verification_status IN ('approved','sample') ORDER BY verified DESC,rating DESC,name""").fetchall()
                self.send_json(200, {"workers": [dict(r) | {"verified": bool(r["verified"]), "demo": bool(r["is_demo"]), "jobs": 0} for r in rows]})
            elif path == "/api/me":
                user = self.current_user(db)
                self.send_json(200, {"user": clean_user(user) if user else None})
            elif path == "/api/profile":
                user = self.require_user(db, ["customer", "worker"])
                if user:
                    self.send_json(200, {"user": clean_user(user)})
            elif path == "/api/bookings":
                user = self.require_user(db)
                if user:
                    if user["role"] == "admin":
                        rows = db.execute("""SELECT b.*,w.name AS worker,w.service,p.amount AS payment_amount,
                          p.method AS payment_method,p.status AS payment_status,
                          EXISTS(SELECT 1 FROM reviews r WHERE r.booking_id=b.id) AS reviewed
                          FROM bookings b JOIN workers w ON w.id=b.worker_id LEFT JOIN payments p ON p.booking_id=b.id ORDER BY b.created_at DESC""").fetchall()
                    elif user["role"] == "worker":
                        rows = db.execute("""SELECT b.*,w.name AS worker,w.service,p.amount AS payment_amount,
                          p.method AS payment_method,p.status AS payment_status,
                          EXISTS(SELECT 1 FROM reviews r WHERE r.booking_id=b.id) AS reviewed
                          FROM bookings b JOIN workers w ON w.id=b.worker_id LEFT JOIN payments p ON p.booking_id=b.id WHERE w.user_id=? ORDER BY b.created_at DESC""", (user["id"],)).fetchall()
                    else:
                        rows = db.execute("""SELECT b.*,w.name AS worker,w.service,p.amount AS payment_amount,
                          p.method AS payment_method,p.status AS payment_status,
                          EXISTS(SELECT 1 FROM reviews r WHERE r.booking_id=b.id) AS reviewed
                          FROM bookings b JOIN workers w ON w.id=b.worker_id LEFT JOIN payments p ON p.booking_id=b.id WHERE b.customer_id=? ORDER BY b.created_at DESC""", (user["id"],)).fetchall()
                    self.send_json(200, {"bookings": [dict(r) for r in rows]})
            elif path == "/api/worker/profile":
                user = self.require_user(db, ["worker"])
                if user:
                    row = db.execute("SELECT * FROM workers WHERE user_id=?", (user["id"],)).fetchone()
                    self.send_json(200, {"profile": dict(row) if row else None})
            elif path == "/api/admin/workers":
                user = self.require_user(db, ["admin"])
                if user:
                    rows = db.execute("""SELECT w.*,u.email,u.phone FROM workers w LEFT JOIN users u ON u.id=w.user_id
                      ORDER BY w.is_demo,w.verification_status,w.name""").fetchall()
                    self.send_json(200, {"workers": [dict(r) for r in rows]})
            elif path == "/api/worker/reviews":
                user = self.require_user(db, ["worker"])
                if user:
                    rows = db.execute("""SELECT r.*,u.name AS customer FROM reviews r JOIN workers w ON w.id=r.worker_id JOIN users u ON u.id=r.customer_id WHERE w.user_id=? ORDER BY r.created_at DESC""", (user["id"],)).fetchall()
                    self.send_json(200, {"reviews": [dict(r) for r in rows]})
            elif path == "/api/admin/summary":
                user = self.require_user(db, ["admin"])
                if user:
                    summary = {"users": db.execute("SELECT COUNT(*) FROM users WHERE role='customer'").fetchone()[0],
                      "workers": db.execute("SELECT COUNT(*) FROM workers WHERE is_demo=0").fetchone()[0],
                      "pending": db.execute("SELECT COUNT(*) FROM workers WHERE verification_status='pending'").fetchone()[0],
                      "bookings": db.execute("SELECT COUNT(*) FROM bookings").fetchone()[0]}
                    self.send_json(200, summary)
            elif path == "/api/admin/applications":
                user = self.require_user(db, ["admin"])
                if user:
                    rows = db.execute("SELECT * FROM applications ORDER BY created_at DESC").fetchall()
                    self.send_json(200, {"applications": [dict(r) for r in rows]})
            elif path == "/api/categories":
                rows = db.execute("SELECT id,name FROM categories WHERE active=1 ORDER BY name").fetchall()
                self.send_json(200, {"categories": [dict(r) for r in rows]})
            elif path == "/api/admin/categories":
                user = self.require_user(db, ["admin"])
                if user:
                    rows = db.execute("SELECT id,name,active FROM categories ORDER BY name").fetchall()
                    self.send_json(200, {"categories": [dict(r) for r in rows]})
            elif path == "/api/admin/users":
                user = self.require_user(db, ["admin"])
                if user:
                    rows = db.execute("SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC").fetchall()
                    self.send_json(200, {"users": [dict(r) for r in rows]})
            elif path == "/api/admin/reviews":
                user = self.require_user(db, ["admin"])
                if user:
                    rows = db.execute("""SELECT r.*,u.name AS customer,w.name AS worker FROM reviews r JOIN users u ON u.id=r.customer_id JOIN workers w ON w.id=r.worker_id ORDER BY r.created_at DESC""").fetchall()
                    self.send_json(200, {"reviews": [dict(r) for r in rows]})
            elif path == "/api/admin/payments":
                user = self.require_user(db, ["admin"])
                if user:
                    rows = db.execute("""SELECT p.*,b.status AS booking_status,b.date AS service_date,
                      b.customer_name,b.phone,w.name AS worker,w.service,u.email AS customer_email
                      FROM payments p JOIN bookings b ON b.id=p.booking_id
                      JOIN workers w ON w.id=b.worker_id LEFT JOIN users u ON u.id=b.customer_id
                      ORDER BY p.created_at DESC""").fetchall()
                    self.send_json(200, {"payments": [dict(r) for r in rows]})
            elif path == "/api/admin/database/tables":
                user = self.require_user(db, ["admin"])
                if user:
                    descriptions = {
                        "users": "Customer, worker, and administrator accounts",
                        "workers": "Worker service profiles and verification state",
                        "bookings": "Customer service requests and job status",
                        "payments": "Payment tracking linked to bookings",
                        "reviews": "Customer ratings and feedback",
                        "applications": "Worker applications awaiting administrator review",
                        "categories": "Service categories and visibility",
                        "sessions": "Hashed login sessions and expiry",
                    }
                    tables = []
                    for table_name, description in descriptions.items():
                        count = db.execute(f"SELECT COUNT(*) AS total FROM {table_name}").fetchone()["total"]
                        tables.append({"name": table_name, "description": description, "rows": count})
                    self.send_json(200, {"tables": tables})
            else:
                self.send_json(404, {"error": "Not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            payload = self.body()
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"error": "Please check the submitted details."})
            return
        with db_session() as db:
            try:
                if path == "/api/register":
                    name, email, password = (str(payload.get(k, "")).strip() for k in ("name", "email", "password"))
                    phone = str(payload.get("phone", "")).strip()
                    role = payload.get("role", "customer")
                    if not name or "@" not in email or len(password) < 8 or role not in ("customer", "worker"):
                        self.send_json(400, {"error": "Enter a name, valid email and password with at least 8 characters."}); return
                    service = str(payload.get("service", "")).strip(); area = str(payload.get("area", "")).strip()
                    if role == "worker" and (not service or not area):
                        self.send_json(400, {"error": "Worker accounts need a service and neighborhood."}); return
                    salt, hashed = password_record(password)
                    cursor = db.execute("INSERT INTO users(name,email,phone,password_hash,password_salt,role,created_at) VALUES(?,?,?,?,?,?,?)", (name,email.lower(),phone,hashed,salt,role,int(time.time())))
                    user_id = cursor.lastrowid
                    if role == "worker":
                        db.execute("INSERT INTO workers(user_id,name,service,area,city,price,experience,photo,verification_status,verified,about) VALUES(?,?,?,?,?,?,?,?,?,?,?)", (user_id,name,service,area,str(payload.get("city", "Ahmedabad")),max(0,int(payload.get("price",0))),max(0,int(payload.get("experience",0))),"", "pending",0,str(payload.get("about", ""))))
                    row = db.execute("SELECT * FROM users WHERE id=?",(user_id,)).fetchone()
                    token=secrets.token_urlsafe(32); digest=hashlib.sha256(token.encode()).hexdigest(); expires=int(time.time())+SESSION_DAYS*86400
                    db.execute("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)",(digest,user_id,expires))
                    secure="; Secure" if COOKIE_SECURE else ""
                    cookie=f"{COOKIE}={token}; HttpOnly; SameSite=Lax; Path=/; Max-Age={SESSION_DAYS*86400}{secure}"
                    self.send_json(201,{"user":clean_user(row)},cookie); return
                elif path == "/api/login":
                    email=str(payload.get("email"," ")).strip().lower(); password=str(payload.get("password",""))
                    row=db.execute("SELECT * FROM users WHERE email=?",(email,)).fetchone()
                    if not row or not secrets.compare_digest(password_record(password,row["password_salt"])[1],row["password_hash"]):
                        self.send_json(401,{"error":"Email or password did not match."}); return
                    token=secrets.token_urlsafe(32); digest=hashlib.sha256(token.encode()).hexdigest(); expires=int(time.time())+SESSION_DAYS*86400
                    db.execute("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)",(digest,row["id"],expires))
                    secure="; Secure" if COOKIE_SECURE else ""
                    cookie=f"{COOKIE}={token}; HttpOnly; SameSite=Lax; Path=/; Max-Age={SESSION_DAYS*86400}{secure}"
                    self.send_json(200,{"user":clean_user(row)},cookie); return
                elif path == "/api/logout":
                    user=self.current_user(db)
                    if user:
                        token=next((p.strip().partition("=")[2] for p in self.headers.get("Cookie","").split(";") if p.strip().startswith(COOKIE+"=")),"")
                        db.execute("DELETE FROM sessions WHERE token_hash=?",(hashlib.sha256(token.encode()).hexdigest(),))
                    secure="; Secure" if COOKIE_SECURE else ""
                    self.send_json(200,{"ok":True},f"{COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0{secure}"); return
                elif path == "/api/bookings":
                    user=self.require_user(db,["customer"])
                    if not user:return
                    worker_id=int(payload.get("worker_id",0)); worker=db.execute("SELECT * FROM workers WHERE id=? AND verification_status IN ('approved','sample')",(worker_id,)).fetchone()
                    name=str(payload.get("customer_name",user["name"] if user else "")).strip(); phone=str(payload.get("phone"," ")).strip()
                    date=str(payload.get("date","")); slot=str(payload.get("slot","")); address=str(payload.get("address"," ")).strip(); description=str(payload.get("description"," ")).strip()
                    if not worker or not name or len(phone)<7 or not date or not slot or not address:
                        self.send_json(400,{"error":"Complete your name, phone, service date, time and address."}); return
                    cur=db.execute("""INSERT INTO bookings(customer_id,worker_id,customer_name,phone,date,slot,address,description,status,created_at)
                      VALUES(?,?,?,?,?,?,?,?,?,?)""",(user["id"] if user else None,worker_id,name,phone,date,slot,address,description,"Requested",int(time.time())))
                    now = int(time.time())
                    db.execute("INSERT INTO payments(booking_id,amount,method,status,created_at,updated_at) VALUES(?,?,?,?,?,?)",
                      (cur.lastrowid, int(worker["price"]), "cash", "unpaid", now, now))
                    self.send_json(201,{"booking":{"id":cur.lastrowid,"worker":worker["name"],"service":worker["service"],"date":date,"slot":slot,"status":"Requested"}}); return
                elif path == "/api/applications":
                    name=str(payload.get("name"," ")).strip(); service=str(payload.get("service"," ")).strip(); area=str(payload.get("area"," ")).strip(); phone=str(payload.get("phone"," ")).strip()
                    if not all((name,service,area,phone)):
                        self.send_json(400,{"error":"Complete your name, service, neighborhood and phone number."}); return
                    cur=db.execute("INSERT INTO applications(name,service,area,city,phone,email,experience,about,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",(name,service,area,str(payload.get("city","Ahmedabad")),phone,str(payload.get("email","")),int(payload.get("experience",0)),str(payload.get("about","")),"Reviewing",int(time.time())))
                    self.send_json(201,{"application_id":cur.lastrowid,"status":"Reviewing"}); return
                elif path == "/api/worker/profile":
                    user=self.require_user(db,["worker"])
                    if not user:return
                    service=str(payload.get("service"," ")).strip(); area=str(payload.get("area"," ")).strip()
                    if not service or not area:
                        self.send_json(400,{"error":"Service and neighborhood are required."}); return
                    city=str(payload.get("city","Ahmedabad")); experience=max(0,int(payload.get("experience",0))); about=str(payload.get("about",""))
                    db.execute("""UPDATE workers SET service=?,area=?,city=?,price=?,experience=?,languages=?,available=?,about=?,
                      verified=CASE WHEN service<>? OR area<>? OR city<>? OR experience<>? OR about<>? THEN 0 ELSE verified END,
                      verification_status=CASE WHEN service<>? OR area<>? OR city<>? OR experience<>? OR about<>? THEN 'pending' ELSE verification_status END
                      WHERE user_id=?""",(service,area,city,max(0,int(payload.get("price",0))),experience,str(payload.get("languages","")),str(payload.get("available","Availability not set")),about,service,area,city,experience,about,service,area,city,experience,about,user["id"]))
                    row=db.execute("SELECT * FROM workers WHERE user_id=?",(user["id"],)).fetchone()
                    self.send_json(200,{"profile":dict(row)}); return
                elif path == "/api/profile":
                    user=self.require_user(db,["customer","worker"])
                    if not user:return
                    name=str(payload.get("name"," ")).strip(); phone=str(payload.get("phone"," ")).strip()
                    if not name:
                        self.send_json(400,{"error":"Name cannot be empty."}); return
                    db.execute("UPDATE users SET name=?,phone=? WHERE id=?",(name,phone,user["id"]))
                    if user["role"] == "worker":
                        db.execute("UPDATE workers SET name=? WHERE user_id=?",(name,user["id"]))
                    row=db.execute("SELECT * FROM users WHERE id=?",(user["id"],)).fetchone()
                    self.send_json(200,{"user":clean_user(row)}); return
                elif path.startswith("/api/bookings/"):
                    booking_id=int(path.rsplit("/",1)[-1]); user=self.require_user(db,["customer"])
                    if not user: return
                    booking=db.execute("SELECT * FROM bookings WHERE id=? AND customer_id=?",(booking_id,user["id"])).fetchone()
                    if not booking:
                        self.send_json(404,{"error":"Booking not found."}); return
                    action=payload.get("action")
                    if action == "cancel" and booking["status"] == "Requested":
                        db.execute("UPDATE bookings SET status='Cancelled' WHERE id=?",(booking_id,))
                        db.execute("UPDATE payments SET status='void',updated_at=? WHERE booking_id=? AND status='unpaid'",(int(time.time()),booking_id))
                        self.send_json(200,{"status":"Cancelled"}); return
                    if action == "review" and booking["status"] == "Completed":
                        rating=int(payload.get("rating",0)); comment=str(payload.get("comment"," ")).strip()
                        if rating not in range(1,6):
                            self.send_json(400,{"error":"Choose a rating from 1 to 5."}); return
                        db.execute("INSERT INTO reviews(booking_id,customer_id,worker_id,rating,comment,created_at) VALUES(?,?,?,?,?,?)",(booking_id,user["id"],booking["worker_id"],rating,comment,int(time.time())))
                        db.execute("UPDATE workers SET reviews=(SELECT COUNT(*) FROM reviews WHERE worker_id=?),rating=(SELECT AVG(rating) FROM reviews WHERE worker_id=?) WHERE id=?",(booking["worker_id"],booking["worker_id"],booking["worker_id"]))
                        self.send_json(201,{"ok":True}); return
                    self.send_json(400,{"error":"That action is not available for this booking."}); return
                elif path.startswith("/api/worker/bookings/"):
                    booking_id=int(path.rsplit("/",1)[-1]); user=self.require_user(db,["worker"])
                    if not user:return
                    booking=db.execute("SELECT b.* FROM bookings b JOIN workers w ON w.id=b.worker_id WHERE b.id=? AND w.user_id=?",(booking_id,user["id"])).fetchone()
                    if not booking:
                        self.send_json(404,{"error":"Booking not found."}); return
                    action=payload.get("action"); allowed={"accept":("Requested","Accepted"),"reject":("Requested","Rejected"),"start":("Accepted","In progress"),"complete":("In progress","Completed")}
                    if action == "payment_received":
                        if booking["status"] != "Completed":
                            self.send_json(400,{"error":"Payment can be recorded after the job is completed."}); return
                        if db.execute("UPDATE payments SET status='paid',updated_at=? WHERE booking_id=? AND method='cash' AND status='unpaid'",(int(time.time()),booking_id)).rowcount == 0:
                            self.send_json(400,{"error":"This booking has no cash payment to record."}); return
                        self.send_json(200,{"status":"paid"}); return
                    if action not in allowed or booking["status"] != allowed[action][0]:
                        self.send_json(400,{"error":"That status change is not available."}); return
                    db.execute("UPDATE bookings SET status=? WHERE id=?",(allowed[action][1],booking_id)); self.send_json(200,{"status":allowed[action][1]}); return
                elif path.startswith("/api/admin/applications/"):
                    user=self.require_user(db,["admin"])
                    if not user:return
                    app_id=int(path.rsplit("/",1)[-1]); action=payload.get("action")
                    row=db.execute("SELECT * FROM applications WHERE id=?",(app_id,)).fetchone()
                    if not row:
                        self.send_json(404,{"error":"Application not found."}); return
                    if action not in ("approve","reject"):
                        self.send_json(400,{"error":"Choose approve or reject."}); return
                    status="Approved" if action=="approve" else "Rejected"
                    db.execute("UPDATE applications SET status=? WHERE id=?",(status,app_id))
                    if action=="approve":
                        cur=db.execute("INSERT INTO workers(name,service,area,city,price,experience,photo,verified,verification_status,about) VALUES(?,?,?,?,?,?,?,?,?,?)",(row["name"],row["service"],row["area"],row["city"],0,row["experience"],"",1,"approved",row["about"]))
                    self.send_json(200,{"status":status}); return
                elif path == "/api/admin/categories":
                    user=self.require_user(db,["admin"])
                    if not user:return
                    name=str(payload.get("name"," ")).strip()
                    if not name:
                        self.send_json(400,{"error":"Enter a category name."}); return
                    cur=db.execute("INSERT INTO categories(name) VALUES(?)",(name,)); self.send_json(201,{"id":cur.lastrowid,"name":name}); return
                elif path.startswith("/api/admin/categories/"):
                    user=self.require_user(db,["admin"])
                    if not user:return
                    category_id=int(path.rsplit("/",1)[-1]); active=0 if payload.get("active") is False else 1
                    db.execute("UPDATE categories SET active=? WHERE id=?",(active,category_id)); self.send_json(200,{"active":bool(active)}); return
                elif path.startswith("/api/admin/workers/"):
                    user=self.require_user(db,["admin"])
                    if not user:return
                    worker_id=int(path.rsplit("/",1)[-1]); action=payload.get("action")
                    if action not in ("approve","reject"):
                        self.send_json(400,{"error":"Choose approve or reject."}); return
                    status="approved" if action=="approve" else "rejected"
                    if db.execute("UPDATE workers SET verification_status=?,verified=? WHERE id=? AND is_demo=0",(status,1 if action=="approve" else 0,worker_id)).rowcount == 0:
                        self.send_json(404,{"error":"Worker application not found."}); return
                    self.send_json(200,{"status":status}); return
                elif path.startswith("/api/admin/bookings/"):
                    user=self.require_user(db,["admin"])
                    if not user:return
                    booking_id=int(path.rsplit("/",1)[-1]); status=str(payload.get("status",""))
                    if status not in ("Requested","Accepted","Rejected","In progress","Completed","Cancelled"):
                        self.send_json(400,{"error":"Invalid booking status."}); return
                    db.execute("UPDATE bookings SET status=? WHERE id=?",(status,booking_id))
                    if status in ("Cancelled","Rejected"):
                        db.execute("UPDATE payments SET status='void',updated_at=? WHERE booking_id=? AND status='unpaid'",(int(time.time()),booking_id))
                    self.send_json(200,{"status":status}); return
                elif path.startswith("/api/admin/payments/"):
                    user=self.require_user(db,["admin"])
                    if not user:return
                    payment_id=int(path.rsplit("/",1)[-1]); status=str(payload.get("status",""))
                    if status not in ("paid","refunded","failed"):
                        self.send_json(400,{"error":"Choose a valid payment status."}); return
                    if db.execute("UPDATE payments SET status=?,updated_at=? WHERE id=?",(status,int(time.time()),payment_id)).rowcount == 0:
                        self.send_json(404,{"error":"Payment not found."}); return
                    self.send_json(200,{"status":status}); return
                elif path.startswith("/api/admin/reviews/"):
                    user=self.require_user(db,["admin"])
                    if not user:return
                    review_id=int(path.rsplit("/",1)[-1]); review=db.execute("SELECT worker_id FROM reviews WHERE id=?",(review_id,)).fetchone()
                    if not review:
                        self.send_json(404,{"error":"Review not found."}); return
                    db.execute("DELETE FROM reviews WHERE id=?",(review_id,))
                    db.execute("UPDATE workers SET reviews=(SELECT COUNT(*) FROM reviews WHERE worker_id=?),rating=COALESCE((SELECT AVG(rating) FROM reviews WHERE worker_id=?),0) WHERE id=?",(review["worker_id"],review["worker_id"],review["worker_id"]))
                    self.send_json(200,{"ok":True}); return
                else:
                    self.send_json(404,{"error":"Not found"})
            except Exception as exc:
                integrity_error = isinstance(exc, sqlite3.IntegrityError)
                if DB_DRIVER == "mysql":
                    try:
                        import pymysql
                        integrity_error = integrity_error or isinstance(exc, pymysql.err.IntegrityError)
                    except ImportError:
                        pass
                if integrity_error:
                    self.send_json(409,{"error":"That email or record already exists."})
                    return
                if isinstance(exc, (ValueError, TypeError)):
                    self.send_json(400,{"error":"One or more fields are invalid."})
                    return
                raise

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args))


def create_admin():
    name=input("Admin name: ").strip(); email=input("Admin email: ").strip().lower(); password=getpass.getpass("Admin password (8+ chars): ")
    if len(password)<8 or "@" not in email or not name:
        raise SystemExit("Enter a name, valid email, and password with at least 8 characters.")
    salt,hashed=password_record(password)
    with db_session() as db:
        db.execute("INSERT INTO users(name,email,password_hash,password_salt,role,created_at) VALUES(?,?,?,?,?,?)",(name,email,hashed,salt,"admin",int(time.time())))
    print("Admin account created. Sign in through the Find Locals website.")


if __name__ == "__main__":
    init_db()
    if len(sys.argv)>1 and sys.argv[1]=="--create-admin":
        create_admin()
    else:
        print("Find Locals API running at http://127.0.0.1:8000")
        ThreadingHTTPServer(("127.0.0.1",8000),Handler).serve_forever()
