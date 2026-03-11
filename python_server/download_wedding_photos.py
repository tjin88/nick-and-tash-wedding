"""
Download wedding photos from Cloudinary to local folders, separated by `location`.
- Folders are created dynamically based on location values in the DB
- Duplicate filenames are safely renamed to <filename>_<i>.<ext>

Requirements:
- Folders are created dynamically based on location values in the DB
  pip install pymongo requests python-dotenv

Usage:
  python download_wedding_photos.py  (must be in the same dir as .env)
"""

import os
import re
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# ─── CONFIG ──────────────────────────────────────────────────────────
MONGO_URI = f"mongodb+srv://{os.getenv('MONGO_USER')}:{os.getenv('MONGO_PASS')}@{os.getenv('MONGO_CLUSTER')}.mongodb.net/?retryWrites=true&w=majority"
MONGO_DB_NAME    = "db"
PHOTO_COLLECTION = "photos"

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def get_highest_quality_url(url: str) -> str:
    """Strip Cloudinary transformation params to get the original file."""
    return re.sub(r"(/upload/)([^/]+/)(?=v\d+/|[^v])", r"\1", url)

def safe_filename(name: str) -> str:
    """Strip characters unsafe in filenames."""
    return re.sub(r'[\\/*?:"<>|]', "_", name)

def location_to_dir(location: str) -> str:
    """Convert a location string to a local folder path."""
    slug = safe_filename(location.lower().replace(" ", "_"))
    return f"./wedding_photos_{slug}"

def unique_path(folder: str, filename: str) -> str:
    """
    Return a unique file path in the folder.
    If <filename> already exists, returns <stem>_<i>.<ext>.
    """
    dest = os.path.join(folder, filename)
    if not os.path.exists(dest):
        return dest

    stem, ext = os.path.splitext(filename)
    i = 1
    while True:
        candidate = os.path.join(folder, f"{stem}_{i}{ext}")
        if not os.path.exists(candidate):
            return candidate
        i += 1

# ─── MAIN ────────────────────────────────────────────────────────────────────

def download():
    print("=== Wedding Photo Downloader ===\n")

    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    collection = db[PHOTO_COLLECTION]

    photos = list(collection.find({}))
    print(f"Found {len(photos)} total photos.\n")

    errors = []
    counts = {}  # location → success count

    for i, photo in enumerate(photos, 1):
        # --- Adjust field names to match your Photo schema if needed ---
        url       = photo.get("url") or photo.get("imageUrl") or photo.get("secure_url")
        public_id = photo.get("publicId") or photo.get("public_id") or ""
        location  = photo.get("location", "unknown")
        # ----------------------------------------------------------------

        # Dynamically create folder for any new location
        output_dir = location_to_dir(location)
        os.makedirs(output_dir, exist_ok=True)

        if not url:
            print(f"  [{i}] ✗ SKIP — no URL found for doc {photo.get('_id')}")
            errors.append(photo.get("_id"))
            continue

        original_url = get_highest_quality_url(url)

        # Derive base filename from public_id or URL
        if public_id:
            base = safe_filename(public_id.split("/")[-1])
        else:
            base = safe_filename(original_url.split("/")[-1].split("?")[0])

        if "." not in base:
            base += ".jpg"

        # Get a unique path — renames duplicates to <stem>_<i>.<ext>
        out_path = unique_path(output_dir, base)
        display_name = os.path.basename(out_path)

        try:
            resp = requests.get(original_url, timeout=30, stream=True)
            resp.raise_for_status()
            with open(out_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)
            counts[location] = counts.get(location, 0) + 1
            dupe_note = " (renamed duplicate)" if display_name != base else ""
            print(f"  [{i}/{len(photos)}] ✓ [{location}] {display_name}{dupe_note}")
        except Exception as e:
            print(f"  [{i}] ✗ ERROR downloading {display_name}: {e}")
            errors.append(photo.get("_id"))

    client.close()

    print("\n=== Done ===")
    for loc, count in sorted(counts.items()):
        print(f"  {loc}: {count} photos → {location_to_dir(loc)}")
    if errors:
        print(f"\n  ✗ {len(errors)} error(s) — see above for details.")
    else:
        print("\nAll photos downloaded! Drag the folders into Google Drive.")

if __name__ == "__main__":
    download()