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

    let report = 'Laporan Kunjungan Link:\n\n';

    for (const link of links) {
      console.log(`Mengunjungi: ${link}`);

      // Gunakan curl untuk mendapatkan informasi
      exec(`curl -s ${link}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }

        // Proses hasil dari curl
        try {
          const data = JSON.parse(stdout); // Gantilah ini jika output bukan JSON
          report += `Link: ${link}\n`;
          report += `Total Views: ${data.views}\n`; // Ubah sesuai dengan struktur data yang sebenarnya
          report += `Total Downloads: ${data.downloads}\n`; // Ubah sesuai dengan struktur data yang sebenarnya
          report += `Bandwidth Used: ${data.bandwidth_used}\n`; // Ubah sesuai dengan struktur data yang sebenarnya
          report += `Nama File: ${data.name}\n\n`; // Ubah sesuai dengan struktur data yang sebenarnya
        } catch (parseError) {
          console.error(`Gagal memparse JSON dari ${link}, tipe konten: ${typeof stdout}`);
        }
      });
    }

    // Tunggu sampai semua proses selesai sebelum menyimpan laporan
    setTimeout(() => {
      fs.writeFileSync('report.txt', report);
      console.log('Laporan berhasil disimpan ke report.txt.');
    }, 5000); // Sesuaikan waktu tunggu jika perlu

  } catch (err) {
    console.error('Terjadi kesalahan:', err.message);
    process.exit(1);
  }
})();
