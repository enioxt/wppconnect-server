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

// **Remove sessões antigas e cria pasta para nova sessão**
try {
    if (fs.existsSync(tokensDir)) {
        fs.rmSync(tokensDir, { recursive: true, force: true }); // Remove sessão antiga
        console.log('🗑 Sessão antiga removida.');
    }
    fs.mkdirSync(tokensDir, { recursive: true });
    console.log('📁 Pasta "tokens" criada com sucesso!');
} catch (error) {
    console.error('❌ Erro ao criar pasta tokens:', error.message);
}

let qrCode = '';
let sessionStatus = 'disconnected';

// **Rota para obter o QR Code em formato Base64**
app.get('/qrcode', (req, res) => {
    if (qrCode) {
        res.json({ qr: qrCode });
    } else {
        res.status(404).json({ error: 'QR Code ainda não gerado.' });
    }
});

// **Página inicial para mostrar status e QR Code**
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
        <script>
          async function fetchQRCode() {
              try {
                  const response = await fetch('/qrcode');
                  const data = await response.json();
                  if (data.qr) {
                      document.getElementById('qrImage').src = 'data:image/png;base64,' + data.qr;
                  } else {
                      document.getElementById('qrImage').src = '';
                  }
              } catch (error) {
                  console.error('Erro ao buscar QR Code:', error);
              }
          }
          setInterval(fetchQRCode, 5000); // Atualiza a cada 5 segundos
        </script>
      </head>
      <body onload="fetchQRCode()">
        <h1>WhatsApp Bot Status</h1>
        <p>Aguardando QR Code...</p>
        <img id="qrImage" alt="QR Code não disponível"/>
        <p class="${sessionStatus.includes('error') ? 'error' : ''}">Status: ${sessionStatus}</p>
      </body>
    </html>
  `);
});

// **Função para iniciar o bot**
async function startServer() {
    try {
        console.log('🚀 Iniciando WhatsApp bot...');

        const client = await create({
            session: 'autlog-session-' + Date.now(), // **Força uma nova sessão**
            puppeteer: {
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
                headless: true, // Manter headless no servidor, mas pode mudar para false para debug local
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
                console.log('📸 Novo QR Code gerado! Escaneie para conectar.');
            },
            statusFind: (status) => {
                sessionStatus = status;
                console.log('🔄 Status da sessão:', status);

                // **Reinicia o bot se estiver desconectado**
                if (status === 'desconnected' || status === 'qrReadFail') {
                    console.log('⚠️ Sessão desconectada! Reiniciando...');
                    startServer();
                }
            }
        });

        client.onMessage(async (message) => {
            console.log('📩 Mensagem recebida:', message.body);
            if (message.isMedia || message.type === 'image') {
                console.log('📷 Mensagem contém mídia.');
                // Aqui vai o código para processar imagens...
            }
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        sessionStatus = 'error: ' + error.message;
    }
}

// **Inicia o servidor na porta configurada**
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    startServer();
});
