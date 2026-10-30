from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from pathlib import Path


OUT = Path(__file__).resolve().parents[1] / "FindLocals_Database_Design.docx"
NAVY = "152538"
ORANGE = "E97832"
PALE = "F2F5F8"

TABLES = [
    ("users", "Stores customer, worker, and administrator login accounts.", [
        ("id", "BIGINT", "Primary Key, Auto Increment", "Unique account identifier.", "1"),
        ("name", "VARCHAR(255)", "Not Null", "Account holder display name.", "Sonal Patel"),
        ("email", "VARCHAR(320)", "Not Null, Unique", "Email used for sign-in.", "sonal@example.test"),
        ("phone", "VARCHAR(80)", "Not Null, Default empty", "Contact number; kept as text to preserve country code.", "+91 98765 43210"),
        ("password_hash", "CHAR(64)", "Not Null", "PBKDF2 password hash; raw password is never stored.", "[salted hash]"),
        ("password_salt", "CHAR(32)", "Not Null", "Per-account random password salt.", "[random salt]"),
        ("role", "VARCHAR(16)", "Not Null, CHECK customer/worker/admin", "Authorization role enforced by the API.", "customer"),
        ("created_at", "BIGINT", "Not Null", "Account creation time as Unix seconds.", "1792454400"),
    ]),
    ("workers", "Stores worker service profiles, public listing details, and verification state.", [
        ("id", "BIGINT", "Primary Key, Auto Increment", "Unique worker profile identifier.", "7"),
        ("user_id", "BIGINT", "Unique, Foreign Key users.id, ON DELETE CASCADE", "Linked login account; null for sample profiles and legacy applications.", "7"),
        ("name", "VARCHAR(255)", "Not Null", "Worker name shown on the profile.", "Ravi Shah"),
        ("service", "VARCHAR(160)", "Not Null", "Main service offered.", "Plumber"),
        ("area", "VARCHAR(160)", "Not Null", "Neighborhood served.", "Navrangpura"),
        ("city", "VARCHAR(160)", "Not Null", "City served.", "Ahmedabad"),
        ("rating", "DECIMAL(4,2)", "Not Null, Default 0", "Average from submitted booking reviews.", "4.5"),
        ("reviews", "INT", "Not Null, Default 0", "Count of submitted reviews.", "2"),
        ("price", "INT", "Not Null", "Indicative starting price in INR.", "450"),
        ("experience", "INT", "Not Null, Default 0", "Years of experience.", "5"),
        ("languages", "VARCHAR(500)", "Not Null, Default empty", "Languages spoken by the worker.", "Gujarati, Hindi"),
        ("available", "VARCHAR(255)", "Not Null, Default Availability not set", "Worker-provided availability text.", "Available weekdays"),
        ("photo", "TEXT", "Not Null", "Profile image URL or local reference.", "/media/worker-7.jpg"),
        ("verified", "TINYINT", "Not Null, Default 0", "Boolean flag; 1 only after administrator approval.", "0"),
        ("verification_status", "VARCHAR(24)", "Not Null, Default pending", "Workflow state such as pending, approved, rejected, or sample.", "pending"),
        ("about", "TEXT", "Not Null", "Worker-entered service description.", "Tap repair and pipe fitting."),
        ("is_demo", "TINYINT", "Not Null, Default 0", "Marks sample listings that are not real worker accounts.", "0"),
    ]),
    ("bookings", "Stores customer service requests and their job lifecycle status.", [
        ("id", "BIGINT", "Primary Key, Auto Increment", "Unique booking identifier.", "25"),
        ("customer_id", "BIGINT", "Foreign Key users.id, Nullable", "Customer account; null for a guest request.", "12"),
        ("worker_id", "BIGINT", "Not Null, Foreign Key workers.id", "Worker assigned to the request.", "7"),
        ("customer_name", "VARCHAR(255)", "Not Null", "Name supplied for this service request.", "Sonal Patel"),
        ("phone", "VARCHAR(80)", "Not Null", "Contact phone for the booking.", "+91 98765 43210"),
        ("date", "VARCHAR(10)", "Not Null", "Requested service date in ISO format.", "2026-10-28"),
        ("slot", "VARCHAR(120)", "Not Null", "Requested time window.", "Morning 9 AM-12 PM"),
        ("address", "TEXT", "Not Null", "Service location provided by customer.", "Navrangpura, Ahmedabad"),
        ("description", "TEXT", "Not Null", "Customer description of the requested work.", "Repair a leaking kitchen tap."),
        ("status", "VARCHAR(24)", "Not Null, Default Requested", "Job lifecycle state; transitions are role-checked by the API.", "Requested"),
        ("created_at", "BIGINT", "Not Null", "Request creation time as Unix seconds.", "1792454400"),
    ]),
    ("payments", "Tracks the payment record attached to each booking. Current implementation records cash payments; online gateway charging is not configured.", [
        ("id", "BIGINT", "Primary Key, Auto Increment", "Unique payment record identifier.", "25"),
        ("booking_id", "BIGINT", "Not Null, Unique, Foreign Key bookings.id, ON DELETE CASCADE", "One payment record per booking.", "25"),
        ("amount", "INT", "Not Null, Default 0", "Indicative starting price in whole INR; not a final quote.", "450"),
        ("currency", "CHAR(3)", "Not Null, Default INR", "Three-letter currency code.", "INR"),
        ("method", "VARCHAR(30)", "Not Null, Default cash", "Recorded payment method.", "cash"),
        ("status", "VARCHAR(24)", "Not Null, Default unpaid", "Payment tracking status such as unpaid, paid, refunded, failed, or void.", "unpaid"),
        ("provider_reference", "VARCHAR(255)", "Not Null, Default empty", "External gateway reference; unused until a provider is integrated.", ""),
        ("created_at", "BIGINT", "Not Null", "Payment record creation time as Unix seconds.", "1792454400"),
        ("updated_at", "BIGINT", "Not Null", "Last payment status update time as Unix seconds.", "1792454400"),
    ]),
    ("reviews", "Stores customer ratings and feedback after completed bookings.", [
        ("id", "BIGINT", "Primary Key, Auto Increment", "Unique review identifier.", "4"),
        ("booking_id", "BIGINT", "Not Null, Unique, Foreign Key bookings.id", "Completed booking being reviewed; unique prevents duplicate reviews.", "25"),
        ("customer_id", "BIGINT", "Not Null, Foreign Key users.id", "Customer who submitted the review.", "12"),
        ("worker_id", "BIGINT", "Not Null, Foreign Key workers.id", "Worker who received the review.", "7"),
        ("rating", "INT", "Not Null, CHECK 1 through 5", "Star rating.", "5"),
        ("comment", "TEXT", "Not Null", "Customer-authored feedback; not automatically translated.", "Arrived on time and fixed the tap."),
        ("created_at", "BIGINT", "Not Null", "Review creation time as Unix seconds.", "1792454400"),
    ]),
    ("applications", "Stores standalone worker applications submitted for administrator review.", [
        ("id", "BIGINT", "Primary Key, Auto Increment", "Unique application identifier.", "3"),
        ("name", "VARCHAR(255)", "Not Null", "Applicant name.", "Ravi Shah"),
        ("service", "VARCHAR(160)", "Not Null", "Service offered.", "Plumber"),
        ("area", "VARCHAR(160)", "Not Null", "Neighborhood served.", "Navrangpura"),
        ("city", "VARCHAR(160)", "Not Null, Default Ahmedabad", "City served.", "Ahmedabad"),
        ("phone", "VARCHAR(80)", "Not Null", "Applicant contact number.", "+91 98765 43210"),
        ("email", "VARCHAR(320)", "Not Null, Default empty", "Applicant email when provided.", "ravi@example.test"),
        ("experience", "INT", "Not Null, Default 0", "Years of experience.", "5"),
        ("about", "TEXT", "Not Null", "Applicant service description.", "Tap repair and pipe fitting."),
        ("status", "VARCHAR(24)", "Not Null, Default Reviewing", "Application review state.", "Reviewing"),
        ("created_at", "BIGINT", "Not Null", "Application submission time as Unix seconds.", "1792454400"),
    ]),
    ("categories", "Stores service categories that administrators can add or deactivate.", [
        ("id", "BIGINT", "Primary Key, Auto Increment", "Unique category identifier.", "1"),
        ("name", "VARCHAR(160)", "Not Null, Unique", "Category label used in the directory.", "Plumber"),
        ("active", "TINYINT", "Not Null, Default 1", "Boolean visibility flag; inactive categories are omitted from public categories.", "1"),
    ]),
    ("sessions", "Stores hashed session tokens and expiration timestamps for signed-in accounts.", [
        ("token_hash", "CHAR(64)", "Primary Key", "SHA-256 hash of the random session token; raw token is held in an HttpOnly cookie.", "[hashed token]"),
        ("user_id", "BIGINT", "Not Null, Foreign Key users.id, ON DELETE CASCADE", "Account that owns the session.", "12"),
        ("expires_at", "BIGINT", "Not Null", "Session expiry time as Unix seconds.", "1793664000"),
    ]),
]


def shade(cell, color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), color)
    tc_pr.append(shd)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    repeat = OxmlElement("w:tblHeader")
    repeat.set(qn("w:val"), "true")
    tr_pr.append(repeat)


def set_cell_text(cell, value, bold=False, color=None, size=8):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run(str(value))
    run.bold = bold
    run.font.name = "Aptos"
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def main():
    doc = Document()
    section = doc.sections[0]
    section.orientation = WD_ORIENT.LANDSCAPE
    section.page_width, section.page_height = section.page_height, section.page_width
    section.left_margin = Inches(0.55)
    section.right_margin = Inches(0.55)
    section.top_margin = Inches(0.55)
    section.bottom_margin = Inches(0.55)

    styles = doc.styles
    styles["Normal"].font.name = "Aptos"
    styles["Normal"].font.size = Pt(10)
    styles["Normal"].font.color.rgb = RGBColor.from_string(NAVY)
    styles["Title"].font.name = "Aptos Display"
    styles["Title"].font.size = Pt(30)
    styles["Title"].font.bold = True
    styles["Title"].font.color.rgb = RGBColor.from_string(NAVY)
    styles["Heading 1"].font.name = "Aptos Display"
    styles["Heading 1"].font.size = Pt(20)
    styles["Heading 1"].font.color.rgb = RGBColor.from_string(NAVY)

    title = doc.add_paragraph(style="Title")
    title.add_run("FindLocals Database Design")
    subtitle = doc.add_paragraph()
    subtitle.paragraph_format.space_after = Pt(8)
    sr = subtitle.add_run("Relational data model for the local services marketplace")
    sr.font.size = Pt(13)
    sr.font.color.rgb = RGBColor.from_string(ORANGE)
    doc.add_paragraph(
        "This document describes the MySQL database used by FindLocals to store accounts, worker listings, service requests, payment tracking, reviews, and administration data. Create the findlocals database first; the API creates these tables at startup. User passwords and session tokens are stored as hashes. Example values are illustrative."
    )
    doc.add_heading("Database overview", level=1)
    overview = [
        "users has one-to-many relationships with worker profiles and bookings.",
        "workers receive bookings; each worker may have many reviews.",
        "bookings connect a customer to a worker and have one payment record.",
        "reviews reference a completed booking, its customer, and its worker.",
        "sessions belong to users and are deleted when the user is deleted.",
        "categories and standalone applications are maintained by administrators.",
    ]
    for item in overview:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(3)
        p.add_run(item)
    note = doc.add_paragraph()
    note.paragraph_format.space_before = Pt(7)
    run = note.add_run("Payment scope: ")
    run.bold = True
    note.add_run("the current application records cash payment status and an indicative starting amount. It does not process card, UPI, or online gateway transactions.")

    for table_name, description, columns in TABLES:
        doc.add_page_break()
        h = doc.add_heading(table_name, level=1)
        h.paragraph_format.space_after = Pt(3)
        p = doc.add_paragraph(description)
        p.paragraph_format.space_after = Pt(8)
        tbl = doc.add_table(rows=1, cols=6)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        tbl.style = "Table Grid"
        widths = [0.48, 1.28, 1.10, 2.05, 3.15, 2.00]
        headers = ["Sr. No.", "Column Name", "Data Type", "Key Constraint", "Description", "Sample"]
        for cell, text, width in zip(tbl.rows[0].cells, headers, widths):
            cell.width = Inches(width)
            set_cell_text(cell, text, bold=True, color="FFFFFF", size=8)
            shade(cell, NAVY)
        set_repeat_table_header(tbl.rows[0])
        for serial, column in enumerate(columns, start=1):
            row = tbl.add_row()
            row.height = None
            for idx, (cell, text, width) in enumerate(zip(row.cells, [serial, *column], widths)):
                cell.width = Inches(width)
                set_cell_text(cell, text, bold=(idx == 1), size=7.4)
                if serial % 2 == 0:
                    shade(cell, PALE)
        for row in tbl.rows:
            for cell, width in zip(row.cells, widths):
                cell.width = Inches(width)

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = footer.add_run("FindLocals Database Design  |  ")
    run.font.size = Pt(8)
    run.font.color.rgb = RGBColor.from_string("65758B")
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    footer._p.append(fld)

    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
