// Cleaned UPGH-only handler
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // ⚙️ Konfigurasi GitHub
    const githubToken = process.env.GH_TOKEN || 'YOUR_TOKEN_HERE';
    const owner = 'Satriaop';
    const repo = 'Betabot-md2-jiro';
    const branch = 'main';
    
    // Opsional: Pengecekan Token GitHub
    if (githubToken === 'YOUR_TOKEN_HERE' && !process.env.GH_TOKEN) {
        // Lanjutkan jika Anda yakin token diatur di environment
    }

    // ==== HANYA MENERIMA FILE QUOTED ====
    let q = m.quoted ? m.quoted : m;
    
    // 🔥 PERBAIKAN SINTAKSIS UTAMA (Menggunakan '||' di dua tempat)
    // Baris ini mengatasi ParseError: Unexpected token
    let mime = (q.msg  q).mimetype  ''; 
    
    if (!mime) {
      return m.reply(❌ *Silakan reply file yang ingin diupload!*
        
📌 Contoh:
${usedPrefix + command} plugins);
    }

    // Download file
    let media = await q.download();

    // 🔍 Penentuan Nama File Asli dan Ekstensi
    // 1. Ambil nama file asli
    let originalFilename = (q.msg  q).fileName  (q.msg || q).caption;
    
    // 2. Deteksi ekstensi yang benar
    let ext = path.extname(originalFilename || '').toLowerCase();
    let mimeExt = mime.split('/')[1] || 'bin';
    
    // Penanganan ekstensi khusus
    if (mimeExt === 'javascript') mimeExt = 'js';
    if (mimeExt === 'plain') mimeExt = 'txt';
    if (mimeExt === 'octet-stream') mimeExt = 'bin';

    if (!ext || ext === '.') {
        ext = '.' + mimeExt.split(';')[0];
    }

    // 3. Tentukan nama file akhir yang bersih
    let baseName = originalFilename ? originalFilename.replace(new RegExp(${path.extname(originalFilename)}$), '') : ${Date.now()};
    // Pastikan nama file dasar bersih dari karakter non-standar
    let cleanedBaseName = baseName.replace(/[^a-zA-Z0-9._-]/g, '');
    let filename = (cleanedBaseName || ${Date.now()}) + ext;

    // Folder dari argumen
    let folder = args[0] ? args[0].replace(/\/$/, '') : '';
    let filePath = folder ? ${folder}/${filename} : filename;

    // Check if file exists (get SHA) untuk UPDATE
    let sha = undefined;
    try {
      const check = await axios.get(https://api.github.com/repos/${owner}/${repo}/contents/${filePath}, {
        headers: { Authorization: token ${githubToken} }
      });
      if (check.data && check.data.sha) sha = check.data.sha;
    } catch (error) {
        if (error.response && error.response.status !== 404) throw error;
    }

    // Upload to GitHub
    const uploadURL = https://api.github.com/repos/${owner}/${repo}/contents/${filePath};
    const content = Buffer.from(media).toString('base64');

    await axios.put(uploadURL, {
      message: sha ? Replace ${filename} : Upload ${filename},
      content,
      branch,
      sha
    }, {
      headers: {
        'Authorization': token ${githubToken},
        'Accept': 'application/vnd.github+json'
      }
    });

    const rawUrl = https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath};

    m.reply(✅ **Upload Berhasil!**

📄 **Nama:** ${filename}
📁 **Folder:** ${folder || 'Root'}
🌍 **Raw URL:**
\\\
${rawUrl}
\\\``);

  } catch (e) {
    console.error('GitHub Upload Error:', e);
    m.reply(❌ *Error:* Gagal mengunggah ke GitHub.\n\nDetail Error: ${e.message});
  }
};

handler.help = ['upgh'];
handler.tags = ['tools'];
handler.command = ['upgh', 'uploadgh'];
handler.owner = true;

module.exports = handler;