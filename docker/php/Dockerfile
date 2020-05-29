FROM php:5.5.30-fpm

RUN apt-get update
RUN apt-get update && apt-get install -y libfreetype6-dev libjpeg62-turbo-dev libmcrypt-dev libpng-dev libcurl3-dev libjpeg-dev gettext ssh git
RUN docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/
RUN docker-php-ext-install -j$(nproc) curl iconv mcrypt mbstring gettext mysql pdo pdo_mysql mysqli
