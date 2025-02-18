# Usa Node.js baseado no Alpine Linux
FROM node:18-alpine

# Instala pacotes necessários
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

# **Cria a pasta "tokens" e garante permissões**
RUN mkdir -p /app/src/tokens && chmod -R 777 /app/src/tokens && chown -R node:node /app/src/tokens

# Copia os arquivos do projeto antes da instalação
COPY package*.json ./

# Instala dependências
RUN npm install --production --pure-lockfile

# Copia o restante do código
COPY . .

# Garante permissões da pasta de trabalho inteira
RUN chmod -R 777 /app

# Muda para usuário sem privilégios administrativos
USER node

# Define comando padrão ao iniciar o container
CMD ["npm", "start"]
