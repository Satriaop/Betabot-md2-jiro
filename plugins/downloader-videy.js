const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Masukan URL!\n\ncontoh:\n${usedPrefix + command} https://videy.co/v?id=QtZ8jT1X1`;    
    try {
        if (!text.match(/videy/gi)) throw `URL Tidak Ditemukan!`;        
        m.reply(wait);      
        let res = await axios.get(`https://api.tioo.eu.org/download/videy?url=${text}`)
        let data = res.data.result
        await conn.sendFile(m.chat, data, 'videy.mp4', "*DONE*", m);      
    } catch (e) {
        console.log(e);
        throw e
    }
};
handler.help = ['videy'];
handler.command = /^(videy|videydl)$/i
handler.tags = ['downloader'];
handler.limit = true;

module.exports = handler;