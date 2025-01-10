const puppeteer = require('puppeteer');
const axios = require('axios');

// Mengambil token dan chat ID dari variabel lingkungan
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendMessageToTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message
    });
}

// Fungsi untuk mengonversi bandwidth
function formatBandwidth(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log10(bytes) / 3);
    return (bytes / Math.pow(1000, i)).toFixed(2) + ' ' + sizes[i];
}

async function fetchLinkInfo(link) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    console.log(`Opening link: ${link}`);
    await page.goto(link, { waitUntil: 'networkidle2' });

    const html = await page.content();
    await browser.close();

    // Mengambil informasi dari HTML menggunakan regex
    const fileNameMatch = html.match(/<meta property="og:title" content="(.*?)"/);
    const viewsMatch = html.match(/"views":(\d+)/);
    const downloadsMatch = html.match(/"downloads":(\d+)/);
    const bandwidthUsedMatch = html.match(/"bandwidth_used":(\d+)/);

    const fileName = fileNameMatch ? fileNameMatch[1] : 'Unknown';
    const views = viewsMatch ? viewsMatch[1] : 'Unknown';
    const downloads = downloadsMatch ? downloadsMatch[1] : 'Unknown';
    const bandwidthUsed = bandwidthUsedMatch ? formatBandwidth(parseInt(bandwidthUsedMatch[1])) : 'Unknown';

    const message = `
File Name: ${fileName}
Views: ${views}
Downloads: ${downloads}
Bandwidth Used: ${bandwidthUsed}
`;

    // Kirim pesan ke Telegram
    await sendMessageToTelegram(message);
}

async function main() {
    const fs = require('fs');
    const links = fs.readFileSync('links.txt', 'utf-8').split('\n').filter(Boolean); // Membaca links dari file

    for (const link of links) {
        await fetchLinkInfo(link);
    }
}

main().catch(console.error);
