const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

const tokensDir = path.join(__dirname, 'tokens');

// **Garante que a pasta "tokens" existe e tem permissões corretas**
try {
    if (!fs.existsSync(tokensDir)) {
        fs.mkdirSync(tokensDir, { recursive: true });
        console.log('Pasta "tokens" criada com sucesso!');
    } else {
        console.log('Pasta "tokens" já existe.');
    }
} catch (error) {
    console.error('Erro ao criar pasta tokens:', error.message);
}

let qrCode = '';
let sessionStatus = 'disconnected';

// Página inicial para mostrar status e QR Code
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>WhatsApp Bot Status</title>
        <meta http-equiv="refresh" content="30">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
          img { max-width: 300px; margin: 20px 0; }
          .error { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>WhatsApp Bot Status</h1>
        ${qrCode ? 
          `<img src="${qrCode}" alt="QR Code"/>` : 
          '<p>Aguardando QR Code...</p>'
        }
        <p class="${sessionStatus.includes('error') ? 'error' : ''}">Status: ${sessionStatus}</p>
      </body>
    </html>
  `);
});

async function startServer() {
  try {
    console.log('Iniciando WhatsApp bot...');

    const client = await create({
      session: 'autlog-session-' + Date.now(), // Garante que uma nova sessão seja criada
      puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
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
        console.log('Novo QR Code gerado!');
      },
      statusFind: (status) => {
        sessionStatus = status;
        console.log('Status da sessão:', status);

        // **Força reconexão se estiver desconectado**
        if (status === 'desconnected' || status === 'qrReadFail') {
          console.log('Sessão desconectada! Reiniciando...');
          startServer();
        }
      }
    });

    client.onMessage(async (message) => {
      console.log('Mensagem recebida:', message.body);
      if (message.isMedia || message.type === 'image') {
        console.log('Mensagem contém mídia.');
        // Seu código de processamento de mídia aqui
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    sessionStatus = 'error: ' + error.message;
  }
}

// Inicia o servidor na porta configurada
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startServer();
});
