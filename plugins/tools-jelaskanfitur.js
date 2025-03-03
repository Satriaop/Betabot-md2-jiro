const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} jelaskan fitur ai`;
    conn.beta = conn.beta ? conn.beta : {};
    if (!conn.beta[m.sender]) {
        conn.beta[m.sender] = {
            pesan: []
        };
        conn.beta[m.sender].timeout = setTimeout(() => {
            delete conn.beta[m.sender];
        }, 300000);

        m.reply(`Halo \`${m.name}\`👋, Saya akan menjelaskan dan membantu anda!`);
    } else {
        clearTimeout(conn.beta[m.sender].timeout);
        conn.beta[m.sender].timeout = setTimeout(() => {
            delete conn.beta[m.sender];
        }, 300000);
    }

    let name = conn.getName(m.sender);
    const previousMessages = conn.beta[m.sender].pesan;
  
/** - Ubah prompt ini sesuaikan dengan keinginan mu 
    - Usahakan berikan logic yang masuk akal dan mudah di pahami!
**/
    const messages = [
        { role: "system", content: "Kamu adalah Zephyr Ai Sebuah Ai Yang diciptakan oleh Jiro,bantu menjelaskan fitur dalam bot setiap orang dengan ramah:),berikan emoticon di setiap jawaban" },
        { role: "assistant", content: `Kamu adalah Zephyr Ai,ai bot yang diciptakan oleh Jiro untuk membantu menjelaskan fitur di dalam bot dan jelaskan dengan detail dan jelaskan cara pemakaian nya dan jelaskan secara detail dan jawab semua permintaan dari user,jawab setiap pertanyaan dengan ramah dan sertai emoticon dan ikon yang di buat untuk memperbagus tampilan teks yang unik contoh |•~√÷×¶∆£€¢¥^°={}\%©®™℅[]@#$_&-+()/*"':;!?,><` },
        ...previousMessages.map((msg, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg })),
        { role: "user", content: text }
    ];
    try {
        const aiBeta = async function(message) {
            return new Promise(async (resolve, reject) => {
                try {
                    const params = {
                        message: message,
                        apikey: lann
                    };
                    const { data } = await axios.post('https://api.betabotz.eu.org/api/search/openai-custom', params);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        };

        let res = await aiBeta(messages);
        if (res && res.result) {
            await m.reply(res.result);
            conn.beta[m.sender].pesan = messages.map(msg => msg.content);
        } else {
            throw "Kesalahan dalam mengambil data";
        }
    } catch (e) {
        throw eror
    }
};

handler.command = handler.help = ['jelaskan','detailfitur','jelasfitur'];
handler.tags = ['tools'];
handler.premium = false
module.exports = handler;