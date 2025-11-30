const axios = require('axios');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const githubToken = 'ISI_TOKEN_BARU_DISINI';

        if (!githubToken || !githubToken.startsWith('ghp_') && !githubToken.startsWith('github_')) {
            return m.reply(`❌ *Token GitHub tidak valid!*\nBuat token baru di: https://github.com/settings/tokens`);
        }

        const owner = 'Satriaop';
        const repo = 'Betabot-md2-jiro';
        const branch = 'main';

        let q = m.quoted ? m.quoted : m;

        // MIME jika ada
        let mime = (q.msg || q).mimetype || '';

        let media;
        let fileName;

        // ======================================
        // 1. Jika media/file
        // ======================================
        if (mime) {
            media = await q.download();
            let ext = mime.split('/')[1] || 'bin';
            fileName = q.fileName || `${Date.now()}.${ext}`;
        } else {
            // ======================================
            // 2. Jika reply teks
            // ======================================
            const text = q.text?.trim();
            if (!text) return m.reply(`❌ *Reply file atau teks!`);

            // Download dari URL
            if (/^https?:\/\//i.test(text)) {
                let r = await axios.get(text, { responseType: 'arraybuffer' });
                media = r.data;
                fileName = text.split('/').pop() || `${Date.now()}.bin`;
            }
            // Base64
            else if (/^[A-Za-z0-9+/=]+$/.test(text)) {
                media = Buffer.from(text, 'base64');
                fileName = `${Date.now()}.bin`;
            }
            // Plain text
            else {
                media = Buffer.from(text, 'utf-8');
                fileName = `${Date.now()}.txt`;
            }
        }

        // Folder tujuan
        let uploadFolder = args[0] ? args[0].replace(/\/+$/, '') : '';
        let filePath = uploadFolder ? `${uploadFolder}/${fileName}` : fileName;

        // ============================
        // VALIDASI TOKEN DULU → CEK USER
        // ============================
        try {
            await axios.get(`https://api.github.com/user`, {
                headers: { Authorization: `Bearer ${githubToken}` }
            });
        } catch (err) {
            return m.reply(`❌ *Token GitHub INVALID atau EXPIRED!*\nBuat token baru: https://github.com/settings/tokens`);
        }

        // ============================
        // Cek apakah file sudah ada
        // ============================
        let fileExists = false;
        let sha = null;

        try {
            let check = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
                { headers: { Authorization: `Bearer ${githubToken}` } }
            );

            if (check.data?.sha) {
                fileExists = true;
                sha = check.data.sha;
            }
        } catch { /* file belom ada */ }

        // ============================
        // Upload file
        // ============================
        let fileContent = Buffer.from(media).toString('base64');

        let uploadData = {
            message: fileExists ? `Replace ${fileName}` : `Upload ${fileName}`,
            content: fileContent,
            branch,
            sha: fileExists ? sha : undefined
        };

        let up = await axios.put(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            uploadData,
            {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!up.data?.content) {
            return m.reply(`❌ *Upload gagal! GitHub tidak mengembalikan response yang benar.*`);
        }

        let rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

        return conn.sendMessage(
            m.chat,
            {
                text: `✅ *Upload Berhasil!*

📄 **Nama:** ${fileName}
📁 **Folder:** ${uploadFolder || 'Root'}
🌍 **Raw URL:**
\`\`\`
${rawUrl}
\`\`\`
`
            },
            { quoted: m }
        );

    } catch (err) {
        console.log(err?.response?.data || err);
        return m.reply(
            `❌ *Error:* ${err.message}\n\n` +
            (err.response?.status === 401 ? "🔐 *Token tidak valid!* Periksa kembali token GitHub kamu." : "")
        );
    }
};

handler.command = /^(uploadgh|upgh)$/i;
handler.owner = true;
handler.tags = ['tools'];

module.exports = handler;