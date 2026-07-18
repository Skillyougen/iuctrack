#!/bin/bash
set -e

# Render fournit le port via la variable PORT. On utilise 8080 en secours (local/test).
export PORT="${PORT:-8080}"

echo "==> Génération de la config Nginx sur le port $PORT"
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "==> Préparation de Laravel"
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Exécution des migrations"
php artisan migrate --force || echo "Migration échouée ou déjà à jour, on continue."

echo "==> Démarrage de Nginx + PHP-FPM via Supervisor"
exec supervisord -c /etc/supervisord.conf