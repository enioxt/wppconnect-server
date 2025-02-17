const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

let qrCode = '';
let sessionStatus = 'disconnected';

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>WhatsApp Bot QR Code</title>
        <meta http-equiv="refresh" content="30">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
          img { max-width: 300px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>WhatsApp Bot Status</h1>
        ${qrCode ? 
          `<img src="${qrCode}" alt="QR Code"/>` : 
          '<p>Aguardando QR Code...</p>'
        }
        <p>Status: ${sessionStatus}</p>
      </body>
    </html>
  `);
});

async function startServer() {
  try {
    const client = await create({
      session: 'autlog-session',
      puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      },
      catchQR: (base64Qr) => {
        qrCode = base64Qr;
        console.log('Novo QR Code gerado');
      },
      statusFind: (status) => {
        sessionStatus = status;
        console.log('Status:', status);
      }
    });

    client.onMessage(async (message) => {
      if (message.isMedia || message.type === 'image') {
        // seu código de processamento de imagem aqui
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    sessionStatus = 'error: ' + error.message;
  }
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startServer();
});
