# backend/Dockerfile (VERSIÓN DE RESET)

# --- Etapa 1: Instalación de Dependencias ---
# ¡CAMBIO CLAVE! Usamos la imagen estándar basada en Debian, no Alpine.
# Es más grande pero infinitamente más compatible.
FROM node:20 AS deps

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Instala TODAS las dependencias. Esto nos da acceso a la CLI de Prisma.
RUN npm install

# --- Etapa 2: Producción ---
FROM node:20 AS production

WORKDIR /usr/src/app

# Copia las dependencias y el cliente de Prisma ya generado desde la etapa anterior.
# Esto es más rápido y fiable que volver a instalar.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/package*.json ./
COPY --from=deps /usr/src/app/prisma ./prisma/

# Copia tu código fuente
COPY src ./src/

EXPOSE 3000

CMD ["node", "src/index.js"]