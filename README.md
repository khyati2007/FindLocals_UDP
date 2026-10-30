# Find Locals

Find Locals connects customers with nearby service professionals. The React/Vite interface includes public worker discovery, profiles, filters, customer and worker accounts, booking requests, worker verification, reviews, cash payment tracking, and an administrator dashboard. The Python API stores production data in MySQL. Demo profiles are labelled as samples and are not shown as verified. Customers can browse without an account; a customer account is required to submit a booking.

## Run locally

Requires Node.js, Python 3, and a running MySQL 8 or compatible MariaDB server. The local XAMPP MariaDB setup used here stores FindLocals in the `findlocals` database on `127.0.0.1:3306`.

1. The database, dedicated application user, and tables are already set up on this computer. The private connection settings are in ignored `backend/.env`; don’t commit or share that file. To recreate the database on a new local MariaDB install, copy `backend/.env.example` to `backend/.env`, set a private password, then run:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   notepad backend/.env
   C:\xampp\php\php.exe backend/setup_mysql.php
   python -m pip install -r backend/requirements.txt
   ```

2. Existing local account data has been migrated into MySQL once. If you are setting this up from a fresh checkout and still have the SQLite file, migrate it once; the migration stops if the target already has users:

   ```powershell
   python backend/migrate_sqlite_to_mysql.py
   ```

   Legacy bookings receive unpaid cash tracking records because SQLite did not store online payment transactions.

3. The administrator account has been created in MySQL. To create another administrator on a fresh setup, use:

   ```powershell
   cd backend
   python app.py --create-admin
   ```

   Then, in the same terminal, start the API:

   ```powershell
   python app.py
   ```

   If PowerShell says `Python was not found` and opens the Microsoft Store, Python is installed under your Windows local profile but is not on `PATH`. In this setup, run the API from the `backend` folder with:

   ```powershell
   & "$env:LOCALAPPDATA\Python\bin\python.exe" app.py
   ```

   Keep this terminal open. A healthy API responds at `http://127.0.0.1:8000/api/categories`.

4. In a second terminal opened at the project root, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev -- --host 127.0.0.1 --port 5174
   ```

   Open `http://localhost:5174`. Keep the MySQL and API terminals running. Admin accounts cannot be created through public registration.

The administrator area lists accounts, all registered workers, worker verification, applications, bookings, reviews, payment records, categories, and MySQL table row counts. The database table list is admin-only. Cash payments are recorded after a worker marks a completed job as received. Starting prices are estimates, not final quotes. No card, UPI, or online payment gateway is connected. Live deployment also requires a hosting provider, HTTPS, and production secrets; local MySQL is not publicly accessible by this project.

Run the API integration test from the project root. It uses an isolated temporary SQLite database and does not touch the configured MySQL database:

```powershell
python -m unittest discover -s backend -p test_app.py -v
```

The database design is documented in `FindLocals_Database_Design.docx`.

<!-- Local-only SQLite fallback remains available for isolated tests via FINDLOCALS_DB_DRIVER=sqlite. -->
