FROM node:18-alpine

# Instala pacotes necessários para o Puppeteer e Sharp
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    vips-dev \
    fftw-dev

# Define variáveis para o Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copia os arquivos de dependência primeiro
COPY package*.json ./

# Instala as dependências
RUN npm install --production --pure-lockfile

# Copia o restante do código
COPY . .

CMD ["npm", "start"]
