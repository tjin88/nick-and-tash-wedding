"""
Download wedding photos from Cloudinary to local folders, separated by `location`.

- Folders are created dynamically based on location values in the DB
- Duplicate filenames are safely renamed to <filename>_<i>.<ext>

Requirements:
    pip install pymongo requests python-dotenv

Usage:
  python download_wedding_photos.py
"""

import os
import re
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()  # Reads from .env in the same directory

# ─── CONFIG ──────────────────────────────────────────────────────────────────

MONGO_URI = (
    f"mongodb+srv://{os.getenv('MONGO_USER')}:{os.getenv('MONGO_PASS')}@{os.getenv('MONGO_CLUSTER')}.mongodb.net/?retryWrites=true&w=majority"
)
MONGO_DB_NAME    = "db"
PHOTO_COLLECTION = "photos"

# The two location values stored in your Photo.location field
LOCATION_1 = "canada"      # adjust to match your DB values
LOCATION_2 = "australia"

# Local output folders
OUTPUT_DIR_1 = "./wedding_photos_canada"
OUTPUT_DIR_2 = "./wedding_photos_australia"

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def get_highest_quality_url(url: str) -> str:
    """
    Cloudinary URLs contain a transformation segment between /upload/ and the public ID.
    This strips any transformations so you get the original uploaded file.
    
    e.g. https://res.cloudinary.com/<cloud>/image/upload/w_800,q_80/v123/myphoto.jpg
      →  https://res.cloudinary.com/<cloud>/image/upload/v123/myphoto.jpg
    """
    # Remove any transformation parameters (everything between /upload/ and /v<digits> or the filename)
    cleaned = re.sub(r"(/upload/)([^/]+/)(?=v\d+/|[^v])", r"\1", url)
    return cleaned

def safe_filename(name: str) -> str:
    """Strip characters that are unsafe in filenames."""
    return re.sub(r'[\\/*?:"<>|]', "_", name)

# ─── MAIN ────────────────────────────────────────────────────────────────────

def download():
    print("=== Wedding Photo Downloader ===\n")

    # 1. Connect to MongoDB
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    collection = db[PHOTO_COLLECTION]

    photos = list(collection.find({}))
    print(f"Found {len(photos)} total photos.\n")

    # 2. Build location → output dir map
    dir_map = {
        LOCATION_1: OUTPUT_DIR_1,
        LOCATION_2: OUTPUT_DIR_2,
    }
    for d in dir_map.values():
        os.makedirs(d, exist_ok=True)

    # 3. Download each photo
    errors = []
    counts = {LOCATION_1: 0, LOCATION_2: 0, "skipped": 0}

    for i, photo in enumerate(photos, 1):
        # --- Adjust these field names to match your Photo schema ---
        url       = photo.get("url") or photo.get("imageUrl") or photo.get("secure_url")
        public_id = photo.get("publicId") or photo.get("public_id") or ""
        location  = photo.get("location", "").lower()
        # -----------------------------------------------------------

        output_dir = dir_map.get(location)
        if not output_dir:
            print(f"  [{i}] SKIP — unknown location '{location}' for doc {photo.get('_id')}")
            counts["skipped"] += 1
            continue

        if not url:
            print(f"  [{i}] SKIP — no URL found for doc {photo.get('_id')}")
            errors.append(photo.get("_id"))
            continue

        # Strip transformations for highest quality
        original_url = get_highest_quality_url(url)

        # Derive a filename: prefer the last segment of public_id, else the URL
        if public_id:
            base = safe_filename(public_id.split("/")[-1])
        else:
            base = safe_filename(original_url.split("/")[-1].split("?")[0])

        # Make sure it has an extension
        if "." not in base:
            base += ".jpg"

        out_path = os.path.join(output_dir, base)

        # Skip if already downloaded (resume-safe)
        if os.path.exists(out_path):
            print(f"  [{i}] Already exists, skipping: {base}")
            counts[location] = counts.get(location, 0) + 1
            continue

        try:
            resp = requests.get(original_url, timeout=30, stream=True)
            resp.raise_for_status()
            with open(out_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"  [{i}/{len(photos)}] ✓ [{location}] {base}")
            counts[location] = counts.get(location, 0) + 1
        except Exception as e:
            print(f"  [{i}] ✗ ERROR downloading {base}: {e}")
            errors.append(photo.get("_id"))

    client.close()

    # 4. Summary
    print("\n=== Done ===")
    print(f"  {LOCATION_1}: {counts.get(LOCATION_1, 0)} photos → {OUTPUT_DIR_1}")
    print(f"  {LOCATION_2}: {counts.get(LOCATION_2, 0)} photos → {OUTPUT_DIR_2}")
    if counts["skipped"]:
        print(f"  Skipped (unknown location): {counts['skipped']}")
    if errors:
        print(f"  ✗ {len(errors)} error(s) — see above for details.")
    else:
        print("\nAll photos downloaded! Just drag the two folders into Google Drive.")

if __name__ == "__main__":
    download()