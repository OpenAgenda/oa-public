#!/bin/bash

if [ $1 -lt 1 ]
  rm /etc/nginx/conf.d/es.conf
fi

if [ $2 -lt 1 ]
  rm /etc/nginx/conf.d/pma.conf
fi
