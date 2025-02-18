// imageProcessor.js
const sharp = require('sharp');
const path = require('path');

const SUPPORTED_FORMATS = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff'
]);

class ImageProcessor {
    constructor(maxWidth = 550, maxHeight = 150) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
    }

    async processImage(inputBuffer, originalFilename) {
        try {
            // Obter informações da imagem
            const metadata = await sharp(inputBuffer).metadata();
            
            // Calcular novas dimensões mantendo a proporção
            const ratio = Math.min(
                this.maxWidth / metadata.width,
                this.maxHeight / metadata.height
            );
            const newWidth = Math.floor(metadata.width * ratio);
            const newHeight = Math.floor(metadata.height * ratio);

            // Determinar formato de saída
            const originalFormat = path.extname(originalFilename).toLowerCase();
            const outputFormat = SUPPORTED_FORMATS.has(originalFormat) 
                ? originalFormat.replace('.', '')
                : 'png';

            // Processar imagem
            const processedBuffer = await sharp(inputBuffer)
                .resize(newWidth, newHeight, {
                    fit: 'inside',
                    withoutEnlargement: true,
                    kernel: 'lanczos3'
                })
                .toFormat(outputFormat, {
                    quality: 95,
                    force: true
                })
                .toBuffer();

            // Retornar resultado
            return {
                buffer: processedBuffer,
                info: {
                    format: outputFormat,
                    originalSize: {
                        width: metadata.width,
                        height: metadata.height
                    },
                    newSize: {
                        width: newWidth,
                        height: newHeight
                    }
                }
            };
        } catch (error) {
            console.error('❌ Erro no processamento da imagem:', error);
            throw error;
        }
    }
}

module.exports = ImageProcessor;
