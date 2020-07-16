#!/bin/bash
cd /root || exit 1

php /root/cibul-symfony/scripts/create_yamls.php /root/oa/.env
php /root/cibulapi-symfony/scripts/create_yamls.php /root/oa/.env

cd oa || exit 1

# create the certification authority and the self-signed certificates
./docker/devinstaller/ssl/create_oa_authority.sh /root/oa/docker/devinstaller/ssl

for ((i = 1; i <= $#; i++ )); do
  ./docker/devinstaller/ssl/create_domain_certificates.sh /root/oa/docker/devinstaller/ssl "${!i}"
done

# install oa modules
yarn

# remove the npm token
export NPM_TOKEN=""

# build everything
yarn prepack
cd packages/cibul-templates || exit 1
yarn build:dev
