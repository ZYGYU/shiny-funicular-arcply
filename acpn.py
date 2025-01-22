import os
import subprocess
import time
import requests

# Paths for video storage and archive file
VIDEO_DIR = "/home/runner/work/tiktok_downloader/videos"
ARCHIVE_FILE = "archive.txt"
LOCK_FILE = "/home/runner/work/tiktok_downloader/logs/acpn.tiktok.lock"
LOG_FILE = "/home/runner/work/tiktok_downloader/logs/download.log"
COOKIES_FILE = "/home/runner/work/tiktok_downloader/cookies/cookies.txt"

# Telegram channel IDs and bot token
NOTIF_CHANNEL_ID = os.environ.get("NOTIF_CHANNEL_ID")  # Fetch from environment variables
VIDEO_CHANNEL_ID = os.environ.get("VIDEO_CHANNEL_ID")  # Fetch from environment variables
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")  # Fetch from environment variables

# List of TikTok links
TIKTOK_LINKS = [
    "https://www.tiktok.com/@susupulen",
    "https://www.tiktok.com/@sususegar.id",
    "https://www.tiktok.com/@donquixote.rosinante86",
    "https://www.tiktok.com/@deyk52",
    "https://www.tiktok.com/@hijabpulen",
    "https://www.tiktok.com/@favoritsusu",
    "https://www.tiktok.com/@gelotrends",
    "https://www.tiktok.com/@ini.loh3",
    "https://www.tiktok.com/@fypcewek1",
    "https://www.tiktok.com/@alvinfcwpj9",
    "https://www.tiktok.com/@shervara12",
    "https://www.tiktok.com/@quynhka704",
    "https://www.tiktok.com/@jakepapho.69",
    "https://www.tiktok.com/@gxgoidoe",
    "https://www.tiktok.com/@itstobrut",
    "https://www.tiktok.com/@bonjur12z",
    "https://www.tiktok.com/@kumpulantobrutt8",
    "https://www.tiktok.com/@fyp_favorite8",
    "https://www.tiktok.com/@thaomyaaaa",
    "https://www.tiktok.com/@awwmantapx69",
    "https://www.tiktok.com/@awwmantappx69",
    "https://www.tiktok.com/@angelakity",
    "https://www.tiktok.com/@pakrtsukatobrut",
    "https://www.tiktok.com/@body_manhwa",
    "https://www.tiktok.com/@geolgeol",
    "https://www.tiktok.com/@iinitokyolagieklusif",
    "https://www.tiktok.com/@shervara12",
    "https://www.tiktok.com/@ineedsomeonetotalk0"
]

# Create directories if they do not exist
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(os.path.dirname(LOCK_FILE), exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
os.makedirs(os.path.dirname(ARCHIVE_FILE), exist_ok=True)

# Create files if they do not exist
open(ARCHIVE_FILE, 'a').close()
open(LOG_FILE, 'a').close()

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

    # Read cookies from file
    with open(COOKIES_FILE, "r") as cookies_file:
        cookies_content = cookies_file.read()

    for TIKTOK_LINK in TIKTOK_LINKS:
        print(f"Mengunduh video dari: {TIKTOK_LINK}")
        with open(LOG_FILE, 'a') as log_file:
            log_file.write(f"Mengunduh video dari: {TIKTOK_LINK}\n")

        # Download video using yt-dlp with download-archive
        process = subprocess.Popen(
            ['yt-dlp', TIKTOK_LINK, '--cookies', COOKIES_FILE, '--trim-filenames', '100',
             '--download-archive', ARCHIVE_FILE,
             '-o', f"{VIDEO_DIR}/@%(uploader)s - %(id)s.%(ext)s"],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
        )

        for line in process.stdout:
            print(line, end='')  # Print the line to console
            with open(LOG_FILE, 'a') as log_file:
                log_file.write(line)

        # Upload video to Telegram
        print("Mulai mengunggah video ke Telegram...")
        with open(LOG_FILE, 'a') as log_file:
            log_file.write("Mulai mengunggah video ke Telegram...\n")

        for video_file in os.listdir(VIDEO_DIR):
            if video_file.endswith('.mp4'):
                original_name = video_file
                uploader, video_id = original_name.split(' - ')[0][1:], original_name.split(' - ')[1].split('.')[0]
                caption = f"@{uploader} - https://www.tiktok.com/@/video/{video_id}"

                # Notifikasi ke konsol bahwa file sedang diunggah
                print(f"File {original_name} sedang diunggah ke Telegram...")

                # Rename video file to temp_name1.mp4 (or temp_name2.mp4, etc.)
                temp_name = f"temp_name{TIKTOK_LINKS.index(TIKTOK_LINK) + 1}.mp4"
                os.rename(os.path.join(VIDEO_DIR, video_file), os.path.join(VIDEO_DIR, temp_name))

                # Upload video to Telegram
                with open(os.path.join(VIDEO_DIR, temp_name), 'rb') as video:
                    response = requests.post(
                        f"https://api.telegram.org/bot{BOT_TOKEN}/sendVideo",
                        data={"chat_id": VIDEO_CHANNEL_ID, "caption": caption, "parse_mode": "Markdown"},
                        files={"video": video}
                    )

                if response.ok:
                    # Notifikasi ke konsol bahwa file berhasil diunggah
                    print(f"File {temp_name} berhasil diunggah ke Telegram.")
                    with open(LOG_FILE, 'a') as log_file:
                        log_file.write(f"Upload berhasil. Menghapus {temp_name}...\n")
                    os.remove(os.path.join(VIDEO_DIR, temp_name))
                else:
                    # Notifikasi ke konsol bahwa file gagal diunggah
                    print(f"File {temp_name} gagal diunggah ke Telegram.")
                    with open(LOG_FILE, 'a') as log_file:
                        log_file.write(f"Upload gagal untuk {temp_name}.\n")
                    requests.post(
                        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                        data={"chat_id": NOTIF_CHANNEL_ID, "text": f"Upload gagal untuk file: {temp_name}."}
                    )

                # Menunggu sebelum unggahan berikutnya
                print("Menunggu selama 3 detik sebelum unggahan berikutnya...")
                time.sleep(3)

    # Send log file to Telegram
    with open(LOG_FILE, 'rb') as log_file:
        requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument",
            data={"chat_id": NOTIF_CHANNEL_ID, "caption": "Log pengunduhan TikTok"},
            files={"document": log_file}
        )

    # Notify end of the process
    requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
        data={"chat_id": NOTIF_CHANNEL_ID, "text": "Proses pengunggahan video TikTok selesai."}
    )
finally:
    # Clean up lock file
    if os.path.exists(LOCK_FILE):
        os.remove(LOCK_FILE)
