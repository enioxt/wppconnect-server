# Usa a imagem do Node.js baseada no Alpine Linux
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
    su-exec  # Adiciona ferramenta para mudar permissões

# Define variáveis para o Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Define diretório de trabalho no container
WORKDIR /app

# **Cria a pasta "tokens" e define permissões**
RUN mkdir -p /app/tokens && chown -R node:node /app

# Copia os arquivos necessários antes da instalação
COPY package*.json ./

# Instala dependências
RUN npm install --production --pure-lockfile

# Copia o restante do código
COPY . .

# Garante que o usuário "node" tenha acesso total à pasta
RUN chmod -R 777 /app/tokens

# Muda para usuário sem privilégios administrativos
USER node

# Define comando padrão ao iniciar o container
CMD ["npm", "start"]
