export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    // Simpan ke GitHub API
    await fetch('https://api.github.com/repos/username/sijagur-database/contents/riwayat_diagnosa.csv', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Tambah diagnosa baru",
        content: Buffer.from(csvBarisBaru).toString('base64'),
        sha: shaFileLama
      })
    });
    res.json({ status: 'ok' });
  }
}
