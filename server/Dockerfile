FROM php:8.4-fpm-alpine

# --- Dépendances système + extensions PHP ---
RUN apk add --no-cache \
        nginx \
        supervisor \
        bash \
        curl \
        git \
        gettext \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        postgresql-dev \
        oniguruma-dev \
        icu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        zip \
        bcmath \
        exif \
        gd \
        intl \
        opcache

# --- Composer ---
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# --- Copier le code de l'application ---
COPY . .

# --- Installer les dépendances PHP (sans les paquets de dev) ---
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# --- Permissions Laravel ---
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# --- Config Nginx + Supervisor ---
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]