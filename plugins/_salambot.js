let handler = async (m, { conn }) => {
  let caption = `*Waalaikummussalam warahmatullahi wabarokatuh*


_📚 Baca yang dibawah ya!_
"Orang yang mengucapkan salam seperti ini maka ia mendapatkan 30 pahala, kemudian, orang yang dihadapan atau mendengarnya membalas dengan kalimat yang sama yaitu “Wa'alaikum salam warahmatullahi wabarakatuh” atau ditambah dengan yang lain (waridhwaana). Artinya selain daripada do'a selamat juga meminta pada Allah SWT"

> By Zephyr
`.trim();
  m.reply(caption);
};

handler.customPrefix = /^(assalamualaikum|Salom|salam|Assalamu'alaikum|ass)/i;
handler.command = new RegExp();
module.exports = handler;