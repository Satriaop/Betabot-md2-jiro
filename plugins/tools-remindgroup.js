let handler = async (m, { conn, args, text }) => {
    if (!args[0]) throw `❌ Silakan masukkan ID grup, durasi waktu, dan pesan!\n\nContoh:\n*.remindgroup <id_group> 1d Jangan lupa rapat besok!*`;

    // Ambil ID grup, durasi, dan pesan
    let groupId = args[0];
    let duration = args[1];
    let message = text.slice(groupId.length + duration.length + 2).trim();

    if (!duration || !message) throw `❌ Format salah!\n\nGunakan format:\n*.remindgroup <id_group> <waktu> <pesan>*`;

    // Validasi durasi
    let timeMultiplier = {
        m: 60000, // Menit ke milidetik
        h: 3600000, // Jam ke milidetik
        d: 86400000, // Hari ke milidetik
        y: 31536000000 // Tahun ke milidetik
    };
    let unit = duration.slice(-1).toLowerCase(); // Ambil satuan waktu
    let time = parseInt(duration.slice(0, -1)); // Ambil nilai angka durasi

    if (!timeMultiplier[unit] || isNaN(time)) throw `❌ Format waktu tidak valid!\n\nGunakan format:\n1m (menit), 1h (jam), 1d (hari), atau 1y (tahun).`;

    let timer = time * timeMultiplier[unit]; // Hitung durasi dalam milidetik

    if (timer < 10000) throw `❌ Durasi waktu terlalu pendek! Minimal 10 detik.`;

    let sendAt = Date.now() + timer; // Waktu pengiriman pesan

    // Konfirmasi ke user
    m.reply(`✅ *Pengingat berhasil dibuat!*\n\n📂 *Grup:* ${groupId}\n🕒 *Durasi:* ${time} ${unit}\n📄 *Pesan:*\n"${message}"\n📅 *Akan dikirim pada:* ${new Date(sendAt).toLocaleString('id')}`);

    // Tunggu hingga waktu yang ditentukan, lalu kirim pesan ke grup
    setTimeout(async () => {
        try {
            let groupMeta = await conn.groupMetadata(groupId);
            let participants = groupMeta.participants.map(v => v.id); // Ambil seluruh anggota grup
            let reminderMessage = `⏰ *Pengingat Grup*\n\n📄 *Pesan:*\n${message}`;

            await conn.sendMessage(groupId, {
                text: reminderMessage,
                mentions: participants
            });
        } catch (e) {
            console.error(`Gagal mengirim pengingat ke grup ${groupId}:`, e);
        }
    }, timer);
};

handler.command = /^(remindgroup|pengingatgroup|ingatkangroup)$/i;
handler.tags = ['tools'];
handler.help = ['remindgroup <id_group> <waktu> <pesan>'];
handler.group = false; // Tidak harus dalam grup
handler.private = false; // Bisa digunakan di grup atau personal

module.exports = handler;