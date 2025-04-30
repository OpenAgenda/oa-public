#!/bin/bash

if [ $# -lt 1 ]; then
  echo 1>&2 "$0: not enough arguments -> required are ssl path"
  exit 2
elif [ $# -gt 1 ]; then
  echo 1>&2 "$0: too many arguments -> required are ssl path"
  exit 2
fi

mkdir -p $1/certs/private

if [ ! -f $1/certs/ca.crt ]; then
  openssl genrsa -aes256 -passout pass:xxxx -out $1/certs/private/ca.pass.key 4096 \
    && openssl rsa -passin pass:xxxx -in $1/certs/private/ca.pass.key -out $1/certs/private/ca.key \
    && rm $1/certs/private/ca.pass.key

  cat > "$1/certs/ca.ext" << EOF
basicConstraints=CA:TRUE
keyUsage = keyCertSign, cRLSign, digitalSignature
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid:always,issuer:always
EOF

  openssl req -x509 -days 1095 \
    -key "$1/certs/private/ca.key" \
    -out "$1/certs/ca.crt" \
    -subj "/C=FR/L=Courbevoie/O=OADEV/CN=auth.openagenda.com/emailAddress=support@openagenda.com" \
    -extensions v3_ca \
    -config <(cat /etc/ssl/openssl.cnf "$1/certs/ca.ext")
fi
