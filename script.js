const fs = require('fs');
const { exec } = require('child_process');
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

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    let report = 'Laporan Kunjungan Link:\n\n';

    for (const link of links) {
      console.log(`Mengunjungi: ${link}`);
      await page.goto(link, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 5000)); // Tunggu beberapa detik

      // Menggunakan curl untuk mendapatkan informasi file
      exec(`curl -s ${link}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing curl: ${error.message}`);
          return;
        }

        // Memparsing data dari output curl
        try {
          const responseData = JSON.parse(stdout); // Mengasumsikan server mengembalikan JSON
          const views = responseData.api_response ? responseData.api_response.views : 0;
          const downloads = responseData.api_response ? responseData.api_response.downloads : 0;
          const bandwidthUsed = responseData.api_response ? responseData.api_response.bandwidthUsed : 0;
          const fileName = responseData.api_response ? responseData.api_response.fileName : 'Unknown';

          report += `Link: ${link}\n`;
          report += `File Name: ${fileName}\n`;
          report += `Views: ${views}\n`;
          report += `Downloads: ${downloads}\n`;
          report += `Bandwidth Used: ${bandwidthUsed}\n\n`;
        } catch (parseError) {
          console.error(`Gagal memparse JSON dari ${link}, tipe konten: ${typeof stdout}`);
        }
      });
    }

    await browser.close();

    // Simpan laporan ke file setelah semua curl selesai
    fs.writeFileSync('report.txt', report);
    console.log('Laporan berhasil disimpan ke report.txt.');
  } catch (err) {
    console.error(err);
  }
})();
