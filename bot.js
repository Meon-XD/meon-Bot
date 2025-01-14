module.exports = (socket) => {
    const prefix = '!'; // Prefix untuk command bot

    // Listener untuk pesan masuk
    socket.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message.message) return;

        const from = message.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const messageType = Object.keys(message.message)[0];
        const text = message.message.conversation || message.message[messageType]?.text || '';

        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // Fitur bot
        switch (command) {
            case 'menu':
                await socket.sendMessage(from, {
                    text: `Halo! Berikut adalah fitur yang tersedia:\n
1. *!stok* - Mengecek stok produk
2. *!pesan [nama_produk] [jumlah]* - Membuat pesanan
3. *!status [id_pesanan]* - Mengecek status pesanan
4. *!bantuan* - Menampilkan panduan penggunaan`,
                });
                break;

            case 'stok':
                // Contoh daftar stok
                const stok = [
                    { nama: 'Produk A', stok: 10 },
                    { nama: 'Produk B', stok: 5 },
                    { nama: 'Produk C', stok: 0 },
                ];

                let stokMessage = 'Daftar Stok Produk:\n';
                stok.forEach((item) => {
                    stokMessage += `- ${item.nama}: ${item.stok > 0 ? item.stok : 'Habis'}\n`;
                });

                await socket.sendMessage(from, { text: stokMessage });
                break;

            case 'pesan':
                if (args.length < 2) {
                    await socket.sendMessage(from, {
                        text: 'Format salah! Gunakan: *!pesan [nama_produk] [jumlah]*',
                    });
                    return;
                }

                const [namaProduk, jumlah] = args;
                // Simpan pesanan ke database atau log
                console.log(`Pesanan: ${namaProduk} sebanyak ${jumlah} dari ${from}`);
                await socket.sendMessage(from, {
                    text: `Pesanan Anda untuk *${namaProduk}* sebanyak *${jumlah}* telah diterima!`,
                });
                break;

            case 'status':
                if (args.length < 1) {
                    await socket.sendMessage(from, {
                        text: 'Format salah! Gunakan: *!status [id_pesanan]*',
                    });
                    return;
                }

                const idPesanan = args[0];
                // Logika cek status pesanan
                await socket.sendMessage(from, {
                    text: `Status pesanan *${idPesanan}*: Sedang diproses.`,
                });
                break;

            case 'bantuan':
                await socket.sendMessage(from, {
                    text: 'Untuk bantuan, silakan hubungi admin di nomor ini.',
                });
                break;

            default:
                await socket.sendMessage(from, {
                    text: 'Maaf, perintah tidak dikenal. Ketik *!menu* untuk daftar perintah.',
                });
                break;
        }
    });
};
