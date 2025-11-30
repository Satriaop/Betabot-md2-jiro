const axios = require('axios');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const githubToken = 'ISI_TOKEN_GITHUB';
        const owner = 'Satriaop';
        const repo = 'Betabot-md2-jiro';
        const branch = 'main';

        let q = m.quoted ? m.quoted : m;

        // Ambil mime bila ada
        let mime = (q.msg || q).mimetype || '';

        let media;
        let fileName;

        // ============================
        // 1. JIKA FILE MEDIA (foto/zip/json/dll)
        // ============================
        if (mime && mime !== '') {

            media = await q.download();
            let fileExtension = mime.split('/')[1] || 'bin';
            fileName = q.fileName ? q.fileName : `${Date.now()}.${fileExtension}`;

        } 
        else {
            // ============================
            // 2. JIKA REPLY PESAN TEKS
            // ============================

            let text = q.text?.trim();

            if (!text) {
                return m.reply(`❌ *Silakan reply file atau teks berisi isi file!*`);
            }

            //-------------------------------------------------------
            // Jika teks adalah sebuah URL → download file
            //-------------------------------------------------------
            if (/^https?:\/\//i.test(text)) {
                let response = await axios.get(text, { responseType: 'arraybuffer' });
                media = response.data;

                // Coba ambil nama dari URL
                let urlParts = text.split('/');
                let guessName = urlParts[urlParts.length - 1];
                fileName = guessName || `${Date.now()}.bin`;
            } 
            //-------------------------------------------------------
            // Jika teks berupa BASE64
            //-------------------------------------------------------
            else if (/^[A-Za-z0-9+/=]+$/.test(text)) {
                media = Buffer.from(text, 'base64');
                fileName = `${Date.now()}.bin`;
            } 
            //-------------------------------------------------------
            // Default → anggap teks adalah isi file txt
            //-------------------------------------------------------
            else {
                media = Buffer.from(text, 'utf-8');
                fileName = `${Date.now()}.txt`;
            }
        }

        // Folder tujuan dari argumen
        let uploadFolder = args[0] ? args[0].replace(/\/+$/, '') : '';
        let filePath = uploadFolder ? `${uploadFolder}/${fileName}` : fileName;

        // Cek apakah file sudah ada
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
        } catch { /* file belum ada */ }

        // Upload ke GitHub
        let fileContent = Buffer.from(media).toString('base64');

        let uploadData = {
            message: fileExists ? `Replace file ${fileName}` : `Upload file ${fileName}`,
            content: fileContent,
            branch,
            sha: fileExists ? sha : undefined,
        };

        await axios.put(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            uploadData,
            {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Raw file final URL
        let rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

        await conn.sendMessage(m.chat, {
            text: `✅ *File berhasil diupload!*

📂 **Nama:** ${fileName}
📁 **Folder:** ${uploadFolder || 'Root (tanpa folder)'}

🌐 **Raw URL:** 
\`\`\`
${rawUrl}
\`\`\`
`
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        return m.reply(`❌ *Error:* ${e.message}`);
    }
};

handler.command = /^(uploadgh|upgh)$/i;
handler.tags = ['tools'];
handler.owner = true;

module.exports = handler;