const fs = require('fs');
const { exec } = require('child_process');

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
      console.log(`Mengambil informasi dari: ${link}`);
      try {
        // Menggunakan curl untuk mendapatkan informasi
        exec(`curl -s ${link}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Gagal mengambil informasi: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
          }

          // Memproses respons dari curl
          const response = JSON.parse(stdout); // Asumsikan responsnya dalam format JSON
          const views = response.api_response.views;
          const downloads = response.api_response.downloads;
          const bandwidthUsed = response.api_response.bandwidth_used;
          const fileName = response.api_response.name;

          report += `Link: ${link}\n`;
          report += `Nama File: ${fileName}\n`;
          report += `Total Views: ${views}\n`;
          report += `Total Downloads: ${downloads}\n`;
          report += `Bandwidth Used: ${bandwidthUsed}\n\n`;

          console.log('Informasi berhasil diambil.');
        });
      } catch (err) {
        console.error(`Gagal mengunjungi link: ${link}, Error: ${err.message}`);
      }
    }

    // Catatan: Anda mungkin ingin menulis report setelah semua informasi diambil
    // fs.writeFileSync('report.txt', report);
  } catch (err) {
    console.error('Terjadi kesalahan:', err.message);
    process.exit(1);
  }
})();
