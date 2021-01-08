#!/bin/bash

ctx=$(readlink -f "$(dirname "$0")/../..")
env_file="$ctx/.env"
image_name="oa_devinstaller"
container_name="oa_devinstaller"

set -a
#shellcheck source=../../.env
source "$env_file"
set +a

docker build -t $image_name "$ctx/docker/devinstaller" || exit

docker run \
  --name $container_name \
  -it \
  --rm \
  -u "${DOCKER_USER:-}" \
  -v "$ctx:/root/oa" \
  -v "${SF_PROJECT_PATH}:/root/cibul-symfony" \
  -v "${SF_API_PROJECT_PATH}:/root/cibulapi-symfony" \
  -v "${SF_PROJECT_PATH}/php.ini:/usr/local/etc/php/php.ini" \
  --env-file "$env_file" \
  -w /root/oa \
  $image_name /root/oa/docker/devinstaller/command.sh "${SITE_DOMAIN}" "${API_DOMAIN}" "${PMA_HOST}" "${ELASTICHQ_DOMAIN}"
