require('dotenv').config();
// server.js
const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ImageProcessor = require('./imageProcessor');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const tokensDir = path.join(__dirname, 'tokens');
const tempDir = path.join(__dirname, 'temp');

// Criar pastas necessárias
[tokensDir, tempDir].forEach(dir => {
    try {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Pasta "${path.basename(dir)}" criada com sucesso!`);
    } catch (error) {
        console.error(`❌ Erro ao criar pasta ${path.basename(dir)}:`, error.message);
    }
});

let qrCode = '';
let sessionStatus = 'disconnected';
const imageProcessor = new ImageProcessor(550, 150); // Usando as mesmas dimensões do seu Python

async function startServer() {
    try {
        console.log('🚀 Iniciando WhatsApp bot...');

        const client = await create({
            session: 'autlog-session-' + Date.now(),
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
                console.log('📸 Novo QR Code gerado! Escaneie para conectar.');
            },
            statusFind: (status) => {
                sessionStatus = status;
                console.log('🔄 Status da sessão:', status);
            }
        });

        client.onMessage(async (message) => {
            try {
                if (message.isMedia || message.type === 'image') {
                    console.log('📷 Recebendo imagem...');
                    
                    // Download da imagem
                    const buffer = await client.decryptFile(message);
                    
                    // Processar imagem
                    const { buffer: processedBuffer, info } = await imageProcessor.processImage(
                        buffer,
                        message.filename || 'image.jpg'
                    );

                    // Salvar temporariamente para envio
                    const outputPath = path.join(tempDir, `processed_${Date.now()}.${info.format}`);
                    fs.writeFileSync(outputPath, processedBuffer);

                    // Enviar imagem processada
                    await client.sendImage(
                        message.from,
                        outputPath,
                        'imagem_processada.' + info.format,
                        `✨ Imagem redimensionada:\n` +
                        `Original: ${info.originalSize.width}x${info.originalSize.height}\n` +
                        `Nova: ${info.newSize.width}x${info.newSize.height}`
                    );

                    // Limpar arquivo temporário
                    fs.unlinkSync(outputPath);
                    
                    console.log('✅ Imagem processada e enviada com sucesso!');
                }
            } catch (error) {
                console.error('❌ Erro ao processar mensagem:', error);
                await client.sendText(message.from, 'Desculpe, houve um erro ao processar sua imagem. Por favor, tente novamente.');
            }
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        sessionStatus = 'error: ' + error.message;
    }
}

// Rotas existentes...
app.get('/qrcode', (req, res) => {
    if (qrCode) {
        res.json({ qr: qrCode });
    } else {
        res.status(404).json({ error: 'QR Code ainda não gerado.' });
    }
});

app.get('/', (req, res) => {
    // ... seu código HTML existente ...
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    startServer();
});
