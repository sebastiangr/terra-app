# --- Etapa Única: Producción ---
# Usamos una imagen base limpia.
FROM node:20-alpine
WORKDIR /usr/src/app

# Copia los archivos de manifiesto
COPY package*.json ./

# Copia el schema de Prisma ANTES de instalar.
COPY prisma ./prisma/

# ¡CLAVE! Instalamos solo las dependencias de producción.
# Prisma CLI ahora está incluido aquí gracias al paso anterior.
# El script "postinstall" que añadimos antes se ejecutará aquí
# y generará el cliente correctamente.
RUN npm install --only=production

# Copia el código fuente de la aplicación.
COPY src ./src/

# EXPOSE no cambia.
EXPOSE 3000

# El CMD apunta al archivo de inicio.
CMD ["node", "src/index.js"]