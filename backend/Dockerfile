FROM node:20-slim

# Prisma needs OpenSSL. Only this one package is installed, with retries, to keep the download small.
RUN apt-get -o Acquire::Retries=5 update -y \
    && apt-get -o Acquire::Retries=5 install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Install dependencies first so Docker can cache this layer.
COPY package.json ./
COPY prisma ./prisma
RUN npm install --include=dev --fetch-retries=5 --fetch-retry-mintimeout=20000 && npm cache clean --force

COPY src ./src

USER node
EXPOSE 3000

# Create/update tables, seed the catalog (idempotent), then start the API.
CMD ["sh", "-c", "node_modules/.bin/prisma db push --skip-generate && node prisma/seed.js && node src/server.js"]
