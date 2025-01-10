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
        
        // Menunggu selama 2 detik setelah membuka setiap link
        await new Promise(resolve => setTimeout(resolve, 2000)); // Menggunakan Promise untuk menunggu
    }

    await browser.close();
})();
