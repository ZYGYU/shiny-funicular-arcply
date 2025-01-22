import os
import subprocess
import time
import requests

# Path for video storage and archive file
VIDEO_DIR = "videos"  # Create a folder for videos
ARCHIVE_FILE = "archive.txt"  # This file will be in the root of your repository
LOCK_FILE = "lock/acpn.tiktok.lock"  # This folder will be created
LOG_FILE = "logs/download.log"  # This folder will be created

# Telegram channel IDs and bot token
NOTIF_CHANNEL_ID = os.getenv('NOTIF_CHANNEL_ID')  # Make sure to set this in GitHub Secrets
VIDEO_CHANNEL_ID = os.getenv('VIDEO_CHANNEL_ID')  # Make sure to set this in GitHub Secrets
BOT_TOKEN = os.getenv('BOT_TOKEN')  # Make sure to set this in GitHub Secrets

# Create directories if they do not exist
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(os.path.dirname(LOCK_FILE), exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

# Create files if they do not exist
open(ARCHIVE_FILE, 'a').close()  # Creates or opens the archive.txt file
open(LOG_FILE, 'a').close()  # Creates or opens the log file

# Check if lock file exists
if os.path.exists(LOCK_FILE):
    requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
        data={"chat_id": NOTIF_CHANNEL_ID, "text": "Proses unduhan TikTok sedang berjalan. Tidak dapat menjalankan proses lain."}
    )
    exit(1)

# Create lock file
open(LOCK_FILE, 'a').close()

# Remove lock file when the script exits
try:
    # Notify start of the process
    requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
        data={"chat_id": NOTIF_CHANNEL_ID, "text": "Proses pengunduhan TikTok dimulai."}
    )

    # Your TikTok links and downloading logic goes here...
    # Example: downloading a TikTok video using yt-dlp
    tiktok_links = []  # Populate this list with TikTok video links
    for link in tiktok_links:
        # Download video
        subprocess.run(["yt-dlp", link, "-o", f"{VIDEO_DIR}/%(title)s.%(ext)s"])
        
        # Log the download in archive.txt
        with open(ARCHIVE_FILE, 'a') as archive:
            archive.write(f"Downloaded: {link}\n")

    # Notify completion of the process
    requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
        data={"chat_id": NOTIF_CHANNEL_ID, "text": "Proses pengunduhan TikTok selesai."}
    )

finally:
    # Clean up lock file
    if os.path.exists(LOCK_FILE):
        os.remove(LOCK_FILE)
