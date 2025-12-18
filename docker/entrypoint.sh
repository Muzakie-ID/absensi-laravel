#!/bin/sh

# Exit on error
set -e

# Create storage directory structure if it doesn't exist
mkdir -p storage/app/public
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs

# Fix permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Create symbolic link for storage
php artisan storage:link || true

# Run migrations (optional, uncomment if needed)
# php artisan migrate --force

# Start PHP-FPM
exec "$@"
