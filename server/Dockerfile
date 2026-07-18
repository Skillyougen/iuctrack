FROM php:8.2-fpm-alpine

# Extensions PHP nécessaires
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    zip \
    unzip \
    git \
    nodejs \
    npm \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql pgsql opcache \
    && apk add --no-cache libpng-dev && docker-php-ext-install gd \
    && apk add --no-cache oniguruma-dev && docker-php-ext-install mbstring \
    && apk add --no-cache libzip-dev && docker-php-ext-install zip

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier les fichiers
COPY . .

# Installer les dépendances
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Config nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Config supervisor
COPY docker/supervisord.conf /etc/supervisord.conf

# Script de démarrage
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]