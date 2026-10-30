"""Local integration tests for account, booking, worker and admin permissions."""
import http.cookiejar
import json
from pathlib import Path
import tempfile
import threading
import time
import unittest
from urllib.error import HTTPError
from urllib.request import HTTPCookieProcessor, Request, build_opener

import app


class FindLocalsApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory(dir=Path(__file__).parent)
        self.original_db = app.DB
        self.original_driver = app.DB_DRIVER
        app.DB_DRIVER = "sqlite"
        app.DB = Path(self.temp_dir.name) / "test.sqlite3"
        app.init_db()
        salt, hashed = app.password_record("test-admin-password")
        with app.db_session() as db:
            db.execute(
                "INSERT INTO users(name,email,password_hash,password_salt,role,created_at) VALUES(?,?,?,?,?,?)",
                ("Local Admin", "admin@test.invalid", hashed, salt, "admin", int(time.time())),
            )
        self.server = app.ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f"http://127.0.0.1:{self.server.server_port}"
        self.clients = {}

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        app.DB = self.original_db
        app.DB_DRIVER = self.original_driver
        self.temp_dir.cleanup()

    def request(self, path, method="GET", payload=None, client="guest"):
        opener = self.clients.setdefault(
            client,
            build_opener(HTTPCookieProcessor(http.cookiejar.CookieJar())),
        )
        data = json.dumps(payload).encode() if payload is not None else None
        req = Request(
            self.base + path,
            data=data,
            method=method,
            headers={"Content-Type": "application/json"},
        )
        try:
            with opener.open(req) as response:
                return response.status, json.loads(response.read())
        except HTTPError as error:
            return error.code, json.loads(error.read())

    def test_marketplace_accounts_and_role_permissions(self):
        status, public = self.request("/api/workers")
        self.assertEqual(status, 200)
        self.assertTrue(public["workers"])
        self.assertTrue(all(worker["demo"] for worker in public["workers"]))
        self.assertTrue(all(not worker["verified"] for worker in public["workers"]))

        status, denied = self.request("/api/admin/summary")
        self.assertEqual(status, 401)
        self.assertIn("error", denied)
        status, denied = self.request("/api/admin/payments")
        self.assertEqual(status, 401)
        status, denied = self.request("/api/admin/database/tables")
        self.assertEqual(status, 401)

        status, denied = self.request(
            "/api/register",
            "POST",
            {"name": "Intruder", "email": "intruder@test.invalid", "password": "long-enough-password", "role": "admin"},
        )
        self.assertEqual(status, 400)

        status, worker_auth = self.request(
            "/api/register",
            "POST",
            {"name": "Test Worker", "email": "worker@test.invalid", "password": "worker-password", "phone": "9876543210", "role": "worker", "service": "Plumber", "area": "Navrangpura", "price": "450", "experience": "5"},
            "worker",
        )
        self.assertEqual(status, 201)
        self.assertEqual(worker_auth["user"]["role"], "worker")
        status, profile = self.request("/api/worker/profile", client="worker")
        self.assertEqual(status, 200)
        self.assertEqual(profile["profile"]["verification_status"], "pending")
        self.assertNotIn(worker_auth["user"]["id"], [w.get("user_id") for w in public["workers"]])
        status, denied = self.request("/api/bookings", "POST", {"worker_id": public["workers"][0]["id"], "customer_name": "Guest", "phone": "9876543210", "date": "2027-01-12", "slot": "Morning", "address": "Test Street"})
        self.assertEqual(status, 401)
        status, denied = self.request("/api/bookings", "POST", {"worker_id": public["workers"][0]["id"], "customer_name": "Worker", "phone": "9876543210", "date": "2027-01-12", "slot": "Morning", "address": "Test Street"}, "worker")
        self.assertEqual(status, 403)

        status, admin_auth = self.request(
            "/api/login",
            "POST",
            {"email": "admin@test.invalid", "password": "test-admin-password"},
            "admin",
        )
        self.assertEqual(status, 200)
        self.assertEqual(admin_auth["user"]["role"], "admin")
        status, table_catalog = self.request("/api/admin/database/tables", client="admin")
        self.assertEqual(status, 200)
        self.assertIn("payments", [table["name"] for table in table_catalog["tables"]])
        self.assertEqual(len(table_catalog["tables"]), 8)
        status, pending = self.request("/api/admin/workers", client="admin")
        worker = next(w for w in pending["workers"] if w["user_id"] == worker_auth["user"]["id"])
        status, _ = self.request(f"/api/admin/workers/{worker['id']}", "POST", {"action": "approve"}, "admin")
        self.assertEqual(status, 200)

        status, listings = self.request("/api/workers")
        approved = next(w for w in listings["workers"] if w["id"] == worker["id"])
        self.assertTrue(approved["verified"])

        status, customer_auth = self.request(
            "/api/register",
            "POST",
            {"name": "Test Customer", "email": "customer@test.invalid", "password": "customer-password", "phone": "9123456789", "role": "customer"},
            "customer",
        )
        self.assertEqual(status, 201)
        status, denied = self.request("/api/admin/payments", client="customer")
        self.assertEqual(status, 403)
        status, denied = self.request("/api/admin/database/tables", client="customer")
        self.assertEqual(status, 403)
        status, booking = self.request(
            "/api/bookings",
            "POST",
            {"worker_id": worker["id"], "customer_name": "Test Customer", "phone": "9123456789", "date": "2027-01-12", "slot": "Morning", "address": "Test Street", "description": "Fix a tap"},
            "customer",
        )
        self.assertEqual(status, 201)
        booking_id = booking["booking"]["id"]
        status, own_bookings = self.request("/api/bookings", client="customer")
        self.assertEqual(own_bookings["bookings"][0]["payment_status"], "unpaid")
        self.assertEqual(own_bookings["bookings"][0]["payment_method"], "cash")
        status, _ = self.request(f"/api/worker/bookings/{booking_id}", "POST", {"action": "accept"}, "worker")
        self.assertEqual(status, 200)
        status, _ = self.request(f"/api/worker/bookings/{booking_id}", "POST", {"action": "start"}, "worker")
        self.assertEqual(status, 200)
        status, _ = self.request(f"/api/worker/bookings/{booking_id}", "POST", {"action": "complete"}, "worker")
        self.assertEqual(status, 200)
        status, payment = self.request(f"/api/worker/bookings/{booking_id}", "POST", {"action": "payment_received"}, "worker")
        self.assertEqual(status, 200)
        self.assertEqual(payment["status"], "paid")
        status, customer_bookings = self.request("/api/bookings", client="customer")
        self.assertEqual(customer_bookings["bookings"][0]["status"], "Completed")
        self.assertEqual(customer_bookings["bookings"][0]["payment_status"], "paid")
        status, _ = self.request(f"/api/bookings/{booking_id}", "POST", {"action": "review", "rating": 5, "comment": "Great work"}, "customer")
        self.assertEqual(status, 201)
        status, reviews = self.request("/api/admin/reviews", client="admin")
        self.assertEqual(status, 200)
        self.assertEqual(len(reviews["reviews"]), 1)
        status, payments = self.request("/api/admin/payments", client="admin")
        self.assertEqual(status, 200)
        self.assertEqual(len(payments["payments"]), 1)
        self.assertEqual(payments["payments"][0]["status"], "paid")
        payment_id = payments["payments"][0]["id"]
        status, refunded = self.request(f"/api/admin/payments/{payment_id}", "POST", {"status": "refunded"}, "admin")
        self.assertEqual(status, 200)
        self.assertEqual(refunded["status"], "refunded")


if __name__ == "__main__":
    unittest.main()
