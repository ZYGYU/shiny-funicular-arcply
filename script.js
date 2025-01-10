const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

(async () => {
    // Baca file links.txt
    const links = fs.readFileSync('links.txt', 'utf-8').split('\n').filter(Boolean);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (const link of links) {
        console.log(`Opening link: ${link}`);
        await page.goto(link, { waitUntil: 'networkidle2' });

        // Tunggu beberapa saat jika perlu
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mengambil informasi menggunakan Axios dan Cheerio
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);

        // Mengambil data yang diperlukan
        const fileName = $('meta[property="og:title"]').attr('content');
        const views = JSON.parse($('#body').data('viewer_data')).api_response.views;
        const downloads = JSON.parse($('#body').data('viewer_data')).api_response.downloads;
        const bandwidthUsed = JSON.parse($('#body').data('viewer_data')).api_response.bandwidth_used;

        console.log(`File Name: ${fileName}`);
        console.log(`Views: ${views}`);
        console.log(`Downloads: ${downloads}`);
        console.log(`Bandwidth Used: ${bandwidthUsed}`);
    }

    await browser.close();
})();
