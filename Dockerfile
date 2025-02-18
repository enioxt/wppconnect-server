# Usa uma versão mínima do Node.js
FROM node:18-alpine

# Instala os pacotes necessários para Puppeteer e Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    vips-dev \
    ffmpeg \
    su-exec  # Adiciona utilitário para rodar como usuário não-root

# Define as variáveis de ambiente do Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Muda para um diretório de trabalho no container
WORKDIR /app

# Copia os arquivos necessários antes da instalação das dependências
COPY package*.json ./

# Instala as dependências sem instalar pacotes desnecessários
RUN npm install --production --pure-lockfile

# Copia o restante do código para o container
COPY . .

# Muda para um usuário sem privilégios administrativos
USER node

# Define o comando padrão ao iniciar o container
CMD ["npm", "start"]

