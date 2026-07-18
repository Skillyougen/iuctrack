cat > docker/start.sh << 'EOF'
#!/bin/sh
set -e

cd /var/www/html

php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan migrate --force
php artisan storage:link 2>/dev/null || true

php-fpm -D

nginx -g "daemon off;"
EOF
chmod +x docker/start.sh