const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi untuk mengonversi bandwidth
function formatBandwidth(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log10(bytes) / 3);
    return (bytes / Math.pow(1000, i)).toFixed(2) + ' ' + sizes[i];
}

// Fungsi untuk mengirim pesan ke Telegram
async function sendTelegramMessage(message) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    await axios.post(url, {
        chat_id: chatId,
        text: message,
    });
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const links = require('fs').readFileSync('links.txt', 'utf-8').split('\n');

    for (const link of links) {
        if (link.trim()) {
            console.log(`Opening link: ${link}`);
            await page.goto(link, { waitUntil: 'domcontentloaded' });

            const html = await page.content();
            const $ = cheerio.load(html);
            const id = JSON.parse($("script").eq(1).html()).api_response.id;
            const name = JSON.parse($("script").eq(1).html()).api_response.name;
            const size = JSON.parse($("script").eq(1).html()).api_response.size;
            const views = JSON.parse($("script").eq(1).html()).api_response.views;
            const downloads = JSON.parse($("script").eq(1).html()).api_response.downloads;
            const bandwidth_used = JSON.parse($("script").eq(1).html()).api_response.bandwidth_used;
            const date_last_view = JSON.parse($("script").eq(1).html()).api_response.date_last_view;
            const date_upload = JSON.parse($("script").eq(1).html()).api_response.date_upload;

            const message = `
File ID: ${id}
File Name: ${name}
Size: ${formatBandwidth(size)}
Views: ${views}
Downloads: ${downloads}
Bandwidth Used: ${formatBandwidth(bandwidth_used)}
Last Viewed: ${date_last_view}
Date Uploaded: ${date_upload}
            `;
            await sendTelegramMessage(message);
            await page.waitForTimeout(2000); // Menunggu 2 detik setelah membuka setiap link
        }
    }

    await browser.close();
})();
