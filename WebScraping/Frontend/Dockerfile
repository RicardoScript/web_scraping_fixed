# ------------------- Etapa única (solo Nginx) -------------------
FROM nginx:alpine

# Crear directorio para la configuración personalizada
RUN mkdir -p /etc/nginx/conf.d

# Copiar la configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar el build local (ya hecho en tu máquina)
COPY dist/ /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
