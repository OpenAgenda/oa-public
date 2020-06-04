#!/bin/bash

if [ $# -lt 1 ]; then
  echo 1>&2 "$0: not enough arguments -> required are ssl path"
  exit 2
elif [ $# -gt 1 ]; then
  echo 1>&2 "$0: too many arguments -> required are ssl path"
  exit 2
fi

mkdir $1/certs
mkdir $1/certs/private

openssl genrsa -aes256 -passout pass:xxxx -out $1/certs/private/ca.pass.key 4096 \
  && openssl rsa -passin pass:xxxx -in $1/certs/private/ca.pass.key -out $1/certs/private/ca.key \
  && rm $1/certs/private/ca.pass.key

openssl req -new -x509 -days 1095 \
  -key $1/certs/private/ca.key \
  -out $1/certs/ca.crt \
  -subj /C=FR/ST=/L=Courbevoie/O=OADEV/OU=/CN=auth.openagenda.com/emailAddress=support@openagenda.com
