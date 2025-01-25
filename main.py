import os
import subprocess
import time
import requests

# Direktori untuk menyimpan video
VIDEO_DIR = os.getenv('VIDEO_DIR')
ARCHIVE_FILE = os.getenv('ARCHIVE_FILE', 'acpn.txt')
LOG_FILE = os.getenv('LOG_FILE', 'download.log')
NOTIF_CHANNEL_ID = os.getenv('NOTIF_CHANNEL_ID', '-1002471139847')  # ID channel notifikasi
VIDEO_CHANNEL_ID = os.getenv('VIDEO_CHANNEL_ID', '-1002357695125')  # ID channel video
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')  # Token bot Telegram
TT_COOKIES = os.getenv('TT_COOKIES', 'cookies.txt')

# Daftar link TikTok
TIKTOK_LINKS = [
    "https://www.tiktok.com/@iiiqish",
    "https://www.tiktok.com/@notstarlaaa",
    "https://www.tiktok.com/@urstarlaa0",
    "https://www.tiktok.com/@twingklingstarla",
    "https://www.tiktok.com/@iiiqish0",
    "https://www.tiktok.com/@ejahazel",
    "https://www.tiktok.com/@ejahazel11",
    "https://www.tiktok.com/@kkara000",
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
    "https://www.tiktok.com/@ineedsomeonetotalk0",
    "https://www.tiktok.com/@epongg303030",
    "https://www.tiktok.com/@luenaa.c"
]

# Membuat direktori dan file yang diperlukan
os.makedirs(VIDEO_DIR, exist_ok=True)
open(ARCHIVE_FILE, 'a').close()
open(LOG_FILE, 'a').close()

# Mengirim notifikasi ke Telegram
def send_telegram_message(chat_id, text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    response = requests.post(url, data={"chat_id": chat_id, "text": text})
    return response.ok

def send_telegram_document(chat_id, file_path, caption):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
    with open(file_path, 'rb') as document:
        response = requests.post(url, data={"chat_id": chat_id, "caption": caption}, files={"document": document})
    return response.ok

def send_telegram_video(chat_id, video_path, caption):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendVideo"
    with open(video_path, 'rb') as video:
        response = requests.post(url, data={"chat_id": chat_id, "caption": caption, "parse_mode": "Markdown"}, files={"video": video})
    return response.ok

# Notifikasi awal
send_telegram_message(NOTIF_CHANNEL_ID, "Proses pengunduhan TikTok dimulai.")

# Memulai pengunduhan video
for TIKTOK_LINK in TIKTOK_LINKS:
    with open(LOG_FILE, 'a') as log_file:
        log_file.write(f"Mengunduh video dari: {TIKTOK_LINK}\n")

    subprocess.run([
        'yt-dlp', TIKTOK_LINK, '--quiet', '--progress', '--progress-template "Downloading: %(filename)s"', '--trim-filenames', '100',
        '--download-archive', ARCHIVE_FILE,
        '--cookies', 'cookies.txt',
        '-o', f"{VIDEO_DIR}/@%(uploader)s - %(id)s.%(ext)s"
    ])

    for video_file in os.listdir(VIDEO_DIR):
        if video_file.endswith('.mp4'):
            original_name = video_file
            uploader, video_id = original_name.split(' - ')[0][1:], original_name.split(' - ')[1].split('.')[0]
            caption = f"#{uploader} - https://www.tiktok.com/@/video/{video_id}"

            # Mengunggah ke Telegram
            success = send_telegram_video(VIDEO_CHANNEL_ID, os.path.join(VIDEO_DIR, video_file), caption)
            if success:
                os.remove(os.path.join(VIDEO_DIR, video_file))
                with open(LOG_FILE, 'a') as log_file:
                    log_file.write(f"Video {video_file} berhasil diunggah ke Telegram.\n")
            else:
                # Fallback: Mengunggah ke Rclone jika Telegram gagal
                subprocess.run( rclone_command = [
                    'rclone', 'move', os.path.join(VIDEO_DIR, video_file),
                    'b2:Kodi-Media/Movies/', '-v', '--progress', '--config rclone.config'
                ])
                rclone_result = subprocess.run(rclone_command, capture_output=True, text=True)
                if rclone_result.returncode == 0:
                    with open(LOG_FILE, 'a') as log_file:
                        log_file.write(f"Video {video_file} berhasil diunggah ke Rclone.\n")
                else:
                    with open(LOG_FILE, 'a') as log_file:
                        log_file.write(f"Video {video_file} gagal diunggah ke Rclone.\n")

# Mengirim log ke Telegram
send_telegram_document(NOTIF_CHANNEL_ID, LOG_FILE, "Arsip pengunduhan TikTok")

# Notifikasi akhir
send_telegram_message(NOTIF_CHANNEL_ID, "Proses pengunggahan video TikTok selesai.")
