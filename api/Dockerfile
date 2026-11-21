FROM php:8.4-cli-alpine

WORKDIR /app
COPY . /app

RUN mkdir -p /data /app/data && chown -R www-data:www-data /data /app/data

USER www-data
EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public", "public/index.php"]
