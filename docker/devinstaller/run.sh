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
  -e "OA_PUBLIC_LOCKFILE=yarn.lock" \
  -e "HOME=/root" \
  --env-file "$env_file" \
  -w /root/oa \
  $image_name /root/oa/docker/devinstaller/command.sh "${DOMAIN}" "${API_DOMAIN}" "${PMA_HOST}" "${ELASTICHQ_DOMAIN}" "${MAILCATCHER_DOMAIN}"
