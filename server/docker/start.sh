#!/bin/sh

# Générer APP_KEY si absent
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Cache config
php artisan config:clear
php artisan config:cache
php artisan route:cache

# Migrations
php artisan migrate --force

# Storage link
php artisan storage:link

# Démarrer les services
exec supervisord -c /etc/supervisord.conf