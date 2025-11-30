// Revised handler with correct extension handling, text-to-file, and /tofile tool
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const githubToken = process.env.GH_TOKEN || 'YOUR_TOKEN_HERE';
    const owner = 'Satriaop';
    const repo = 'Betabot-md2-jiro';
    const folder = 'plugins';

    // --- Detect if message has file or text ---
    let buffer, filename;

    if (m.quoted && m.quoted.mimetype) {
      // ---- CASE: Reply is file ----
      buffer = await m.quoted.download();
      let ext = m.quoted.mimetype.split('/')[1] || 'bin';
      if (ext === 'javascript') ext = 'js';
      filename = ${Date.now()}.${ext};
    } else if (command === 'tofile') {
      // ---- CASE: Text to file tool ----
      if (!args[0]) throw 'Masukkan teks yang mau dijadikan file!';
      const text = args.join(' ');
      filename = ${Date.now()}.txt;
      const tmpPath = path.join(__dirname, '../tmp/', filename);
      fs.writeFileSync(tmpPath, text);
      return conn.sendMessage(m.chat, { document: fs.readFileSync(tmpPath), fileName: filename, mimetype: 'text/plain' }, { quoted: m });
    } else {
      throw 'Reply file atau gunakan *tofile <teks>* untuk jadikan teks ke file.';
    }

    // --- Upload to GitHub ---
    const branch = 'main';
    const filePath = ${folder}/${filename};
    const content = buffer.toString('base64');

    const url = https://api.github.com/repos/${owner}/${repo}/contents/${filePath};

    await axios.put(url, {
      message: Upload file ${filename},
      content,
      branch
    }, {
      headers: {
        'Authorization': token ${githubToken},
        'Accept': 'application/vnd.github+json'
      }
    });

    const rawUrl = https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath};

    m.reply(✅ *Upload Berhasil!*

📄 **Nama:** ${filename}
📁 **Folder:** ${folder}
🌍 **Raw URL:**
\
${rawUrl}
);

  } catch (e) {
    m.reply('❌ *Error:* ' + e.message);
  }
};

handler.help = ['upload', 'tofile'];
handler.tags = ['tools'];
handler.command = ['upload', 'tofile'];

module.exports = handler;