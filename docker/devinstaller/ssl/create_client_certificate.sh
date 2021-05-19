#!/bin/bash

if [ $# -lt 2 ]; then
  echo 1>&2 "$0: not enough arguments -> required are name, then identifier"
  exit 2
elif [ $# -gt 2 ]; then
  echo 1>&2 "$0: too many arguments -> required are name, then identifier"
  exit 2
fi

mkdir -p clients/private

openssl genrsa -aes256 -passout pass:xxxx -out clients/private/$1.pass.key 4096 \
    && openssl rsa -passin pass:xxxx -in clients/private/$1.pass.key -out clients/private/$1.key \
    && rm clients/private/$1.pass.key

openssl req -new -key clients/private/$1.key -out $1.csr

openssl x509 -req -days 365 -in $1.csr -CA certs/ca.crt -CAkey certs/private/ca.key -set_serial $2 -out clients/$1.crt

rm $1.csr

openssl verify -verbose -CAfile certs/ca.crt clients/$1.crt

openssl pkcs12 -export -clcerts \
  -in clients/$1.crt \
  -inkey clients/private/$1.key \
  -out clients/$1.p12

echo "-> clients/$1.p12"
