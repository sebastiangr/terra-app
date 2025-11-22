# Etapa 1: Construcción (Build)
FROM node:22-alpine as build-stage

WORKDIR /app

# Copiamos package.json primero para aprovechar el caché de Docker
COPY package*.json ./
RUN npm install

# Copiamos el código y construimos
COPY . .
RUN npm run build

# Etapa 2: Producción (Serving)
FROM caddy:2-alpine as production-stage

# Copiamos los archivos compilados (dist) al servidor web
COPY --from=build-stage /app/dist /usr/share/caddy

# Caddy necesita saber qué servir. Usamos un comando inline simple.
# Esto sirve la carpeta en el puerto 80 interno.
CMD ["caddy", "file-server", "--root", "/usr/share/caddy", "--listen", ":80"]