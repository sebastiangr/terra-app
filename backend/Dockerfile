# backend/Dockerfile
FROM node:18-alpine 
# Usamos Alpine que es super ligero

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]