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
            const scriptContent = $("script").eq(1).html();

            if (!scriptContent) {
                console.error(`Script content not found for link: ${link}`);
                continue; // Lewati ke tautan berikutnya
            }

            let apiResponse;
            try {
                apiResponse = JSON.parse(scriptContent);
            } catch (error) {
                console.error(`Failed to parse JSON for link: ${link}. Error: ${error.message}`);
                continue; // Lewati ke tautan berikutnya
            }

            const { id, name, size, views, downloads, bandwidth_used, date_last_view, date_upload } = apiResponse.api_response;

            const message = `
File ID: ${id}
File Name: ${name}
Size: ${formatBandwidth(size)}
Views: ${views}
Downloads: ${downloads}
Bandwidth Used: ${formatBandwidth(bandwidth_used)}
Date Last Viewed: ${date_last_view}
Date Uploaded: ${date_upload}
            `;
            await sendTelegramMessage(message);
            await page.waitForTimeout(2000); // Menunggu 2 detik setelah membuka setiap link
        }
    }

    await browser.close();
})();
