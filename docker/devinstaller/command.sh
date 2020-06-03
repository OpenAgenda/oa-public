#!/bin/bash
cd /home/root

php cibul-symfony/scripts/create_yamls.php /home/root/oa/.env
php cibulapi-symfony/scripts/create_yamls.php /home/root/oa/.env

cd oa

# add the npm token
echo "" >> .yarnrc.yml
echo "npmRegistries:" >> .yarnrc.yml
echo "  //registry.npmjs.org:" >> .yarnrc.yml
echo "    npmAuthToken: \"$1\"" >> .yarnrc.yml

# install oa modules, build everything
yarn
yarn prepack

cd packages/cibul-templates
yarn build:dev

# remove the npm token
cd /home/root/oa
head -n -4 .yarnrc.yml | tee .yarnrc.yml
