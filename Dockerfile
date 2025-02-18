# Usa Node.js baseado no Alpine para menor tamanho
FROM node:18-alpine

# Instala pacotes necessários para Puppeteer e manipulação de imagens
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    vips-dev \
    ffmpeg \
    su-exec

# Define variáveis para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Define diretório de trabalho no container
WORKDIR /app

# Copia arquivos do projeto para o container
COPY package*.json ./

# Instala dependências
RUN npm install --production --pure-lockfile

# Copia o restante do código
COPY . .

# Permissões para diretórios temporários
RUN mkdir -p /app/temp /app/tokens && chmod -R 777 /app/temp /app/tokens

# Muda para usuário sem privilégios administrativos
USER node

# Define comando padrão ao iniciar o container
CMD ["npm", "start"]
