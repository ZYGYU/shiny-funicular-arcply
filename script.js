const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    // Baca file links.txt
    const links = fs.readFileSync('links.txt', 'utf-8').split('\n').filter(Boolean);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (const link of links) {
        console.log(`Opening link: ${link}`);
        await page.goto(link, { waitUntil: 'networkidle2' });
        // Tambahkan delay jika perlu
        await page.waitForTimeout(2000); // Menunggu 2 detik setelah membuka setiap link
    }

    await browser.close();
})();
