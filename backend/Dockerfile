# backend/Dockerfile
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia la carpeta de Prisma ANTES de ejecutar el comando generate
COPY prisma ./prisma

# Ahora sí, genera el cliente de Prisma
RUN npx prisma generate

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto que la aplicación usará
EXPOSE 3000

# Comando para ejecutar la aplicación (para producción es mejor "npm start")
CMD ["npm", "run", "dev"]