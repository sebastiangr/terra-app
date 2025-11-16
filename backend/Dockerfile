# backend/Dockerfile (MODO INVESTIGACIÓN)

FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# --- PRUEBA 1: ¿Existen los archivos antes de instalar? ---
RUN echo ">>> CONTENIDO ANTES DE NPM INSTALL:"
RUN ls -laR

RUN npm install

# --- PRUEBA 2: ¿Qué hay después de instalar? ---
RUN echo ">>> CONTENIDO DESPUÉS DE NPM INSTALL (Y POSTINSTALL):"
RUN ls -laR

# --- PRUEBA 3: Vamos a ver específicamente qué generó Prisma ---
RUN echo ">>> CONTENIDO DE NODE_MODULES/.PRISMA/CLIENT:"
RUN ls -la node_modules/.prisma/client || echo "Directorio .prisma/client NO ENCONTRADO"


COPY src ./src/

EXPOSE 3000

# Por ahora, no queremos que el contenedor crashee.
# Lo mantendremos vivo para poder entrar a investigar.
CMD ["tail", "-f", "/dev/null"]