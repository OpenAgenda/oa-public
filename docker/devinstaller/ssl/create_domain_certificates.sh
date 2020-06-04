#!/bin/bash

if [ $# -lt 3 ]; then
  echo 1>&2 "$0: not enough arguments -> required are ssl path, domain, api domain"
  exit 2
elif [ $# -gt 3 ]; then
  echo 1>&2 "$0: too many arguments -> required are ssl path, domain, api domain"
  exit 2
fi

mkdir $1/domains

openssl req -x509 -nodes -days 1095 -newkey rsa:2048 \
  -out $1/domains/$2.crt \
  -keyout $1/domains/$2.key \
  -subj /C=FR/ST=/L=Courbevoie/O=OADEVCHOSE/OU=/CN=$2/emailAddress=support@openagenda.com

openssl req -new \
  -key $1/domains/$2.key \
  -out $1/domains/$2.csr \
  -subj /C=FR/ST=/L=Courbevoie/O=OADEVCHOSE/OU=/CN=$2/emailAddress=support@openagenda.com

openssl x509 -req -days 365 \
  -in $1/domains/$2.csr \
  -CA $1/certs/ca.crt \
  -CAkey $1/certs/private/ca.key \
  -set_serial 123 \
  -out $1/domains/$2.crt

rm $1/domains/$2.csr

openssl verify -verbose -CAfile $1/certs/ca.crt $1/domains/$2.crt

openssl req -x509 -nodes -days 1095 -newkey rsa:2048 \
  -out $1/domains/$3.crt \
  -keyout $1/domains/$3.key \
  -subj /C=FR/ST=/L=Courbevoie/O=OADEVCHOSE/OU=/CN=$3/emailAddress=support@openagenda.com

openssl req -new \
  -key $1/domains/$3.key \
  -out $1/domains/$3.csr \
  -subj /C=FR/ST=/L=Courbevoie/O=OADEVCHOSE/OU=/CN=$3/emailAddress=support@openagenda.com

openssl x509 -req -days 365 \
  -in $1/domains/$3.csr \
  -CA $1/certs/ca.crt \
  -CAkey $1/certs/private/ca.key \
  -set_serial 123 \
  -out $1/domains/$3.crt

rm $1/domains/$3.csr

openssl verify -verbose -CAfile $1/certs/ca.crt $1/domains/$3.crt
