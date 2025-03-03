const axios = require('axios');

let handler = async (m, { conn, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]; // Data pengguna
    let jumlah = args[0] ? parseInt(args[0]) : 1; // Jumlah yang ingin dibeli (default 1)

    // Validasi jumlah input
    if (isNaN(jumlah) || jumlah < 1) {
        return conn.reply(m.chat, `❌ Masukkan jumlah limit yang ingin dibeli dengan format:\n${usedPrefix}buylimit <jumlah>\n\n📌 Contoh: ${usedPrefix}buylimit 2`, m);
    }

    const hargaLimit = 2; // Harga 1 limit
    const totalHarga = jumlah * hargaLimit; // Total harga berdasarkan jumlah

    // Buat pembayaran QRIS
    try {
        let qrisResponse = await axios.get(`https://hafiza.apixd.my.id/api/orkut/createpayment?apikey=hafiza&amount=${totalHarga}&codeqr=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214501318136711360303UMI51440014ID.CO.QRIS.WWW0215ID20253689159010303UMI5204541153033605802ID5919SAT STORE OK20975566013MINAHASA TENG61059599562070703A0163048925`);
        let qrisData = qrisResponse.data;

        if (!qrisData || !qrisData.status || !qrisData.result.qrImageUrl) {
            return conn.reply(m.chat, '⚠️ Gagal membuat pembayaran QRIS. Silakan coba lagi nanti.', m);
        }

        let expirationTime = new Date(qrisData.result.expirationTime).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

        conn.sendMessage(m.chat, {
            image: { url: qrisData.result.qrImageUrl },
            caption: `✅ *Silakan lakukan pembayaran!*\n\n💰 Jumlah: ${totalHarga} Uang\n📌 Scan QR berikut untuk membayar.\n⏳ Expired: ${expirationTime}\n\nTunggu proses konfirmasi pembayaran...`
        }, { quoted: m });

        let lastDate = null; // Menyimpan waktu transaksi terakhir yang dicek

        // Cek status pembayaran secara berkala
        let interval = setInterval(async () => {
            try {
                let statusResponse = await axios.get(`https://hafiza.apixd.my.id/api/orkut/cekstatus?apikey=hafiza&merchant=OK2097556&keyorkut=907537717367414962097556OKCT4DFD1CB58971AF6FF0D2FCC6F1DF2CCD`);
                let statusData = statusResponse.data;

                let transactionDate = new Date(statusData.date);
                let currentTime = new Date();
                let timeDiff = Math.abs(currentTime - transactionDate) / 1000; // Selisih dalam detik

                // Jika jam berubah dan selisih waktu kurang dari 15 detik, transaksi dianggap berhasil
                if (lastDate !== statusData.date && timeDiff <= 15) {
                    clearInterval(interval); // Hentikan pengecekan lebih lanjut
                    lastDate = statusData.date; // Update waktu transaksi terakhir

                    user.limit += jumlah; // Tambah limit ke pengguna

                    conn.reply(m.chat, `🎉 *Pembayaran berhasil!*\n\n✅ Anda telah membeli ${jumlah} Limit!\n💰 Total Harga: ${totalHarga} Uang\n⭐ Total Limit Anda: ${user.limit}\n\n📌 *Detail Transaksi:*\n📅 Tanggal: ${statusData.date}\n💰 Jumlah: ${statusData.amount}\n🏦 Metode: ${statusData.brand_name}\n🔢 Referensi: ${statusData.issuer_reff}\n🛍️ Buyer Reff: ${statusData.buyer_reff}\n💳 Saldo Setelah Transaksi: ${statusData.balance}\n📌 Jenis QRIS: ${statusData.qris}`, m);
                }
            } catch (error) {
                console.error('Gagal mengecek status pembayaran:', error);
            }
        }, 10000); // Cek setiap 10 detik
    } catch (error) {
        console.error('Error saat membuat QRIS:', error);
        conn.reply(m.chat, '⚠️ Terjadi kesalahan dalam memproses pembayaran.', m);
    }
};

handler.help = ['buylimit <jumlah>'];
handler.tags = ['rpg'];
handler.command = /^(buylimit|belilimit)$/i; // Perintah untuk membeli limit
handler.register = true; // Hanya untuk pengguna yang terdaftar

module.exports = handler;