const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const bot = require('./bot');
const readline = require('readline');
const chalk = require('chalk');
const usePairingCode = true; // Jika true, gunakan kode pairing

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./meonStoreSession');

    const socket = makeWASocket({
        auth: state,
        printQRInTerminal: !usePairingCode,
        logger: P({ level: 'fatal' }),
    });
    
    // Fungsi untuk membaca input dari terminal
const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

//Di dalam Fungsi
if (usePairingCode && !state.creds.registered) {
    const phoneNumber = await question(
      chalk.greenBright('Masukkan nomor WhatsApp Anda (contoh: 628xxx): ')
    );
    const code = await socket.requestPairingCode(phoneNumber.trim());
    console.log(chalk.yellowBright(`Kode pairing Anda adalah: ${code}`));
  }

    // Menyimpan kredensial
    socket.ev.on('creds.update', saveCreds);

    // Log jika berhasil terhubung
    socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== 401);
            console.log('Koneksi terputus, mencoba menyambungkan ulang...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Berhasil terhubung ke WhatsApp!');
        }
    });

    // Meneruskan socket ke bot.js
    bot(socket);
}

connectToWhatsApp();
