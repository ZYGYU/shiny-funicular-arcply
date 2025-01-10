const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  try {
    const filePath = './links.txt';
    if (!fs.existsSync(filePath)) {
      console.error('File links.txt tidak ditemukan.');
      process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const links = fileContent
      .split('\n')
      .map(link => link.trim())
      .filter(link => link && link.startsWith('https://pixeldrain.com/u/'));

    if (links.length === 0) {
      console.error('Tidak ada link yang valid di file links.txt.');
      process.exit(1);
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    let report = 'Laporan Kunjungan Link:\n\n';

    for (const link of links) {
      console.log(`Mengunjungi: ${link}`);
      try {
        const response = await page.goto(link, { waitUntil: 'networkidle2' });
        const contentType = response.headers()['content-type'];

        if (!contentType.includes('application/json')) {
          console.error(`Response dari ${link} bukan JSON, tipe konten: ${contentType}`);
          continue;
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

        const info = await page.evaluate(() => {
          const views = window.viewer_data.api_response.views;
          const downloads = window.viewer_data.api_response.downloads;
          const bandwidthUsed = window.viewer_data.api_response.bandwidth_used;
          const fileName = window.viewer_data.api_response.name;
          return { views, downloads, bandwidthUsed, fileName };
        });

        report += `Link: ${link}\n`;
        report += `Nama File: ${info.fileName}\n`;
        report += `Total Views: ${info.views}\n`;
        report += `Total Downloads: ${info.downloads}\n`;
        report += `Bandwidth Used: ${info.bandwidthUsed}\n\n`;

        console.log('Informasi berhasil diambil.');
      } catch (err) {
        console.error(`Gagal mengunjungi link: ${link}, Error: ${err.message}`);
      }
    }

    // Menyimpan laporan ke file
    fs.writeFileSync('report.txt', report);
    console.log('Laporan berhasil disimpan ke report.txt.');

    await browser.close();
  } catch (err) {
    console.error('Terjadi kesalahan:', err.message);
    process.exit(1);
  }
})();
