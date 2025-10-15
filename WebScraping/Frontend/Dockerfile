# Multi-stage build para optimizar el tamaño de la imagen

# Stage 1: Build de la aplicación
FROM node:18-alpine AS builder

WORKDIR /app

# Declarar argumentos de build para las variables de entorno
ARG VITE_API_BASE_URL=http://18.117.79.180:3001
ARG VITE_VNC_URL=http://18.117.79.180:6080

# Convertir argumentos en variables de entorno para el build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_VNC_URL=$VITE_VNC_URL

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Stage 2: Servidor de producción
FROM nginx:alpine

# Crear directorio para configuración personalizada
RUN mkdir -p /etc/nginx/conf.d

# Copiar configuración personalizada desde el contexto de construcción
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos desde el stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto de Nginx
CMD ["nginx", "-g", "daemon off;"]
