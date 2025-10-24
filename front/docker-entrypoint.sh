#!/bin/sh
# Script para inyectar variables de entorno en runtime

# Reemplazar la variable API_URL en el archivo index.html
if [ -n "$API_URL" ]; then
  echo "Configurando API_URL: $API_URL"
  sed -i "s|PLACEHOLDER_API_URL|$API_URL|g" /usr/share/nginx/html/index.html
else
  echo "API_URL no configurada, usando localhost como default"
  sed -i "s|PLACEHOLDER_API_URL|http://localhost:4000/api/v1|g" /usr/share/nginx/html/index.html
fi

# Reemplazar la variable SOCKET_URL en el archivo index.html
if [ -n "$SOCKET_URL" ]; then
  echo "Configurando SOCKET_URL: $SOCKET_URL"
  sed -i "s|PLACEHOLDER_SOCKET_URL|$SOCKET_URL|g" /usr/share/nginx/html/index.html
else
  echo "SOCKET_URL no configurada, usando localhost como default"
  sed -i "s|PLACEHOLDER_SOCKET_URL|http://localhost:4000|g" /usr/share/nginx/html/index.html
fi

# Iniciar nginx
echo "Iniciando nginx..."
nginx -g "daemon off;"

