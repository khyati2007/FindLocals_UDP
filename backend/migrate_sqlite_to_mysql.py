"""One-time migration of the local FindLocals SQLite data into configured MySQL."""
from pathlib import Path
import sqlite3
import time

import app


TABLE_COLUMNS = {
    "users": ("id", "name", "email", "phone", "password_hash", "password_salt", "role", "created_at"),
    "workers": ("id", "user_id", "name", "service", "area", "city", "rating", "reviews", "price", "experience", "languages", "available", "photo", "verified", "verification_status", "about", "is_demo"),
    "bookings": ("id", "customer_id", "worker_id", "customer_name", "phone", "date", "slot", "address", "description", "status", "created_at"),
    "reviews": ("id", "booking_id", "customer_id", "worker_id", "rating", "comment", "created_at"),
    "applications": ("id", "name", "service", "area", "city", "phone", "email", "experience", "about", "status", "created_at"),
    "categories": ("id", "name", "active"),
    "sessions": ("token_hash", "user_id", "expires_at"),
}


def main():
    source_path = Path(__file__).with_name("findlocals.db")
    if not source_path.is_file():
        raise SystemExit("The local SQLite database was not found; no migration was run.")
    if app.DB_DRIVER != "mysql":
        raise SystemExit("Set FINDLOCALS_DB_DRIVER=mysql in backend/.env before migrating.")

    source = sqlite3.connect(f"file:{source_path.as_posix()}?mode=ro", uri=True)
    source.row_factory = sqlite3.Row
    source_tables = {row[0] for row in source.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    app.init_db()

    with app.db_session() as target:
        existing_users = target.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"]
        if existing_users:
            raise SystemExit("MySQL already has user accounts. Migration stopped to avoid mixing databases.")

        copied = {}
        for table, columns in TABLE_COLUMNS.items():
            if table not in source_tables:
                copied[table] = 0
                continue
            rows = source.execute(f"SELECT {','.join(columns)} FROM {table}").fetchall()
            if rows:
                names = ",".join(f"`{name}`" for name in columns)
                placeholders = ",".join("?" for _ in columns)
                target.executemany(
                    f"INSERT IGNORE INTO `{table}` ({names}) VALUES ({placeholders})",
                    [tuple(row[name] for name in columns) for row in rows],
                )
            copied[table] = len(rows)

        if "bookings" in source_tables:
            bookings = source.execute("SELECT id,worker_id,status,created_at FROM bookings").fetchall()
            for booking in bookings:
                existing_payment = target.execute(
                    "SELECT id FROM payments WHERE booking_id=?", (booking["id"],)
                ).fetchone()
                if existing_payment:
                    continue
                worker = target.execute("SELECT price FROM workers WHERE id=?", (booking["worker_id"],)).fetchone()
                amount = worker["price"] if worker else 0
                status = "void" if booking["status"] in ("Cancelled", "Rejected") else "unpaid"
                timestamp = booking["created_at"] or int(time.time())
                target.execute(
                    "INSERT IGNORE INTO payments(booking_id,amount,method,status,created_at,updated_at) VALUES(?,?,?,?,?,?)",
                    (booking["id"], amount, "cash", status, timestamp, timestamp),
                )

    source.close()
    print("Migration completed into the configured MySQL database:")
    for table, count in copied.items():
        print(f"  {table}: {count} source rows")
    print("No payment gateway transactions were present in SQLite; legacy bookings are marked unpaid or void.")


if __name__ == "__main__":
    main()
