#!/bin/bash
cd /home/root

php cibul-symfony/scripts/create_yamls.php /home/root/oa/.env
php cibulapi-symfony/scripts/create_yamls.php /home/root/oa/.env

cd oa

# create the certification authority and the self-signed certificates
./docker/devinstaller/ssl/create_oa_authority.sh /home/root/oa/docker/devinstaller/ssl
./docker/devinstaller/ssl/create_domain_certificates.sh /home/root/oa/docker/devinstaller/ssl "$1" "$2"

# install oa modules, build everything
yarn
yarn prepack

# remove the npm token
export NPM_TOKEN=""

cd packages/cibul-templates
yarn build:dev
