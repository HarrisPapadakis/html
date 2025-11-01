import os
import sqlite3
from datetime import datetime
from pathlib import Path
from io import BytesIO

from flask import Flask, request, redirect, url_for, render_template, flash, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image
import qrcode
from dotenv import load_dotenv

load_dotenv()  # για .env vars αν θέλεις

# --- Ρυθμίσεις ---
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
THUMB_DIR = UPLOAD_DIR / "thumbs"
DB_PATH = BASE_DIR / "data.db"

# Δημιουργία φακέλων αν δεν υπάρχουν
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
THUMB_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXT = {"png", "jpg", "jpeg", "gif", "heic", "webp"}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB ανά αρχείο (προσαρμόσιμο)

# Απλό token (προαιρετικά) - αν θες ιδιωτικότητα: χρησιμοποιείς το QR μόνο με το token
UPLOAD_TOKEN = os.getenv("UPLOAD_TOKEN", "")  # π.χ. "wedding2025"

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = str(UPLOAD_DIR)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
app.secret_key = os.getenv("FLASK_SECRET", "change_this_to_random")  # για flash messages

# --- Βοηθητικές συναρτήσεις ---
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_name TEXT,
            uploaded_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()

def save_metadata(filename, original_name):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO photos (filename, original_name, uploaded_at) VALUES (?, ?, ?)",
              (filename, original_name, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def make_thumbnail(image_path, thumb_path, size=(800,800)):
    with Image.open(image_path) as img:
        img.thumbnail(size)
        img.save(thumb_path, optimize=True, quality=75)

def generate_qr(url, output_path=BASE_DIR / "static" / "qr.png"):
    img = qrcode.make(url)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path)
    return str(output_path)

# --- Routes ---
@app.route("/")
def index():
    # Σύντομη σελίδα που μπορεί να δείχνει το QR και link
    upload_url = url_for("upload_form", _external=True)
    return render_template("upload.html", upload_url=upload_url, qr_path=url_for('static', filename='qr.png'))

@app.route("/upload", methods=["GET", "POST"])
def upload_form():
    # Προστασία με token (προαιρετική). Αν δεν θες, άφησέ το κενό.
    token = request.args.get("token", "")
    if UPLOAD_TOKEN and token != UPLOAD_TOKEN and request.method == "GET":
        # απαιτείται token στο URL: /upload?token=...
        return "Access denied. Missing/invalid token.", 403

    if request.method == "POST":
        # Έλεγχος token στο POST form (αν ενεργό)
        if UPLOAD_TOKEN and request.form.get("upload_token") != UPLOAD_TOKEN:
            flash("Invalid token", "error")
            return redirect(request.url)

        files = request.files.getlist("photos")
        if not files:
            flash("No files selected", "warning")
            return redirect(request.url)

        saved = 0
        for f in files:
            if f and allowed_file(f.filename):
                original = f.filename
                filename = secure_filename(f"{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}_{original}")
                dest = UPLOAD_DIR / filename
                # Αποθήκευση
                f.save(dest)
                # Δημιουργία thumbnail/resize για web (προαιρετικό)
                thumb_path = THUMB_DIR / filename
                try:
                    make_thumbnail(dest, thumb_path, size=(1600,1600))
                except Exception as exc:
                    # Αν το PIL αποτύχει, αγνοούμε το thumbnail
                    app.logger.exception("Thumbnail failed: %s", exc)
                save_metadata(filename, original)
                saved += 1
            else:
                flash(f"File not allowed: {f.filename}", "error")

        flash(f"Uploaded {saved} files", "success")
        return redirect(url_for("gallery"))

    # GET -> εμφανίζει τη φόρμα
    return render_template("upload.html", upload_url=url_for("upload_form"), qr_path=url_for('static', filename='qr.png'), token=UPLOAD_TOKEN)

@app.route("/gallery")
def gallery():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT filename, original_name, uploaded_at FROM photos ORDER BY uploaded_at DESC")
    rows = c.fetchall()
    conn.close()
    # Φτιάχνουμε list of dicts
    photos = []
    for fn, orig, uploaded_at in rows:
        photos.append({
            "thumb": url_for("uploaded_file", filename=f"thumbs/{fn}"),
            "full": url_for("uploaded_file", filename=fn),
            "original": orig,
            "uploaded_at": uploaded_at
        })
    return render_template("gallery.html", photos=photos)

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    # σε development: serve static files από upload folder
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# --- Εκκίνηση / αρχικοποίηση ---
if __name__ == "__main__":
    init_db()
    # Δημιουργία QR που οδηγεί στη σελίδα upload (προσαρμόζεις domain)
    # Αν έχεις token, πρόσθεσέ το ως παράμετρο: ?token=...
    public_upload_url = os.getenv("PUBLIC_UPLOAD_URL", "") or url_for("upload_form", _external=True)
    # Αν ο χρήστης θέλει token, φτιάχνει url με token:
    if UPLOAD_TOKEN:
        public_upload_url = f"{public_upload_url}?token={UPLOAD_TOKEN}"
    generate_qr(public_upload_url)
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
