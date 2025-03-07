let handler = async (m, { teks, conn, isOwner, isAdmin, args }) => {
  let ownerGroup = m.chat.split`-`[0] + "@s.whatsapp.net";
  
  if (m.quoted) {
    if (m.quoted.sender === ownerGroup || m.quoted.sender === conn.user.jid)
      return;

    let usr = m.quoted.sender;
    
    await conn.sendImageAsSticker(m.chat, "https://files.catbox.moe/ysjlnt.webp", m, {
      packname: "maaf kamu saya kick, dikarenakan sudah melampaui batas!",
      author: "",
    });

    await conn.groupParticipantsUpdate(m.chat, [usr], "remove");
    return;
  }

  if (!m.mentionedJid[0]) throw `*• Example :* .kick *[reply/tag user]*`;

  let users = m.mentionedJid.filter(
    (u) => !(u == ownerGroup || u.includes(conn.user.jid)),
  );
  
  for (let user of users) {
    if (user.endsWith("@s.whatsapp.net")) {
      await conn.sendImageAsSticker(m.chat, "https://files.catbox.moe/ysjlnt.webp", m, {
        packname: "maaf kamu saya kick, dikarenakan sudah melampaui batas!",
        author: "",
      });

      await conn.groupParticipantsUpdate(m.chat, [user], "remove");
    }
  }
};

handler.help = ["kick"].map((a) => a + " *[reply/tag user]*");
handler.tags = ["group"];
handler.command = ["kick","k","tendang"];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

module.exports = handler;