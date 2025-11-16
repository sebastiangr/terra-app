# backend/Dockerfile (VERSIÓN FINAL Y EXPLÍCITA)

FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Instala todas las dependencias. Sabemos que la CLI funciona.
RUN npm install

# ¡¡LA SOLUCIÓN!! Forzamos la generación y luego hacemos el paso que falta.
# 1. Ejecutamos la generación de Prisma.
RUN npx prisma generate

# 2. Copiamos manualmente el schema.prisma al lugar donde el cliente lo busca.
# Esto soluciona el problema de que 'generate' no lo haga por sí solo.
RUN cp prisma/schema.prisma node_modules/.prisma/client/

# Copia el código fuente de tu aplicación.
COPY src ./src/

EXPOSE 3000

# Ahora el CMD debería encontrar un cliente totalmente funcional.
CMD ["node", "src/index.js"]