#!/bin/sh
set -e

cd /var/www/html

# Env
php artisan config:clear
php artisan config:cache
php artisan route:cache

# Migrations
php artisan migrate --force

# Storage
php artisan storage:link 2>/dev/null || true

# Démarrer PHP-FPM en arrière-plan
php-fpm -D

# Démarrer nginx au premier plan
nginx -g "daemon off;"