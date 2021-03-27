#!/bin/bash

if [ "$1" -lt 1 ]; then
  rm /etc/nginx/conf.d/es.conf
fi

if [ "$2" -lt 1 ]; then
  rm /etc/nginx/conf.d/pma.conf
fi

if [ "$3" -lt 1 ]; then
  rm /etc/nginx/conf.d/mailcatcher.conf
fi

if [ "$4" -lt 1 ]; then
  rm /etc/nginx/conf.d/elastichq.conf
fi

if [ "$5" -lt 1 ]; then
  rm /etc/nginx/conf.d/api.conf
fi