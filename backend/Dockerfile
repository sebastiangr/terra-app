# backend/Dockerfile
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Copia la carpeta de Prisma ANTES de ejecutar el comando generate
COPY prisma ./prisma/

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto que la aplicación usará
EXPOSE 3000

# Comando para ejecutar la aplicación (para producción es mejor "npm start")
CMD ["npm", "run", "dev"]