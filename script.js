const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs').promises;

// Mengambil token dan chat ID dari variabel lingkungan
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendMessageToTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        });
    } catch (error) {
        console.error('Failed to send message to Telegram:', error);
    }
}

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
    try {
        await page.goto(link, { waitUntil: 'networkidle2' });
        const html = await page.content();

        // Mengambil informasi dari HTML menggunakan regex
        const viewerDataMatch = html.match(/window\.viewer_data\s*=\s*(\{.*?\});/);
        const viewerData = viewerDataMatch ? JSON.parse(viewerDataMatch[1]) : null;

        if (viewerData && viewerData.api_response) {
            const apiResponse = viewerData.api_response;
            const fileName = apiResponse.name || 'Unknown';
            const fileId = apiResponse.id || 'Unknown';
            const fileSize = formatBandwidth(apiResponse.size) || 'Unknown';
            const views = apiResponse.views || 'Unknown';
            const downloads = apiResponse.downloads || 'Unknown';
            const bandwidthUsed = formatBandwidth(apiResponse.bandwidth_used) || 'Unknown';
            const dateUpload = apiResponse.date_upload || 'Unknown';
            const dateLastView = apiResponse.date_last_view || 'Unknown';

            const message = `
File Name: ${fileName}
File ID: ${fileId}
Size: ${fileSize}
Views: ${views}
Downloads: ${downloads}
Bandwidth Used: ${bandwidthUsed}
Date Uploaded: ${new Date(dateUpload).toLocaleString()}
Date Last Viewed: ${new Date(dateLastView).toLocaleString()}
`;

            await sendMessageToTelegram(message);
        } else {
            console.error('No viewer data found for link:', link);
        }
    } catch (error) {
        console.error('Error fetching link info:', error);
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        const data = await fs.readFile('links.txt', 'utf-8');
        const links = data.split('\n').filter(Boolean); // Membaca links dari file

        for (const link of links) {
            await fetchLinkInfo(link);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Delay 2 detik
        }
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main().catch(console.error);
