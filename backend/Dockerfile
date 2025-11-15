# backend/Dockerfile
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Genera el cliente de Prisma (importante para que el contenedor lo tenga)
RUN npx prisma generate

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto que la aplicación usará
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev"]