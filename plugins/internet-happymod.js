/*
Jangan Hapus Wm Bang 

*Happy Mod Search Plugins Esm*

Maaf Lama Up nya 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*
https://whatsapp.com/channel/0029VadfVP5ElagswfEltW0L/2186
*/

const axios = require('axios');
const cheerio = require('cheerio');

async function getMod(q) {
    try {
        const anu = `https://happymod.com/search.html?q=${q}`;
        const { data } = await axios.get(anu);
        const $ = cheerio.load(data);

        let result = [];

        $(".pdt-app-box").each((_, el) => {
            const title = $(el).find("h3").text().trim();
            const link = "https://happymod.com" + $(el).find('a').attr('href');
            const rate = $(el).find("span.a-search-num").text().trim();

            result.push({ title, link, rate });
        });

        return result;
    } catch (e) {
        console.error(e);
        return [];
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Mau Cari Aplikasi Apa? \n\n *Example :* .hmod Minecraft');
    
    // Ganti m.react dengan conn.sendMessage untuk mengirim reaksi
    await conn.sendMessage(m.chat, { text: '⌛' }, { quoted: m });

    try {
        const data = await getMod(text);

        if (data.length === 0) {
            await conn.sendMessage(m.chat, { text: '❌' }, { quoted: m });
            return m.reply('Gak Ketemu');
        }

        let teks = `*Happymod Search*\n\n`;

        for (let i = 0; i < Math.min(data.length, 15); i++) {
            teks += `*${i + 1}. ${data[i].title}*\n`;
            teks += `Rating : ${data[i].rate}\n`;
            teks += `Link : ${data[i].link}\n\n`;
        }

        await conn.sendMessage(m.chat, { image: { url: "https://i.postimg.cc/c6q7zRC8/1741529921037.png" }, caption: teks });

        await conn.sendMessage(m.chat, { text: '✅' }, { quoted: m });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { text: '❌' }, { quoted: m });
        m.reply('Error');
    }
};

handler.help = ['happymod'];
handler.command = ['happymod', 'hmod'];
handler.tags = ['internet'];

module.exports = handler;