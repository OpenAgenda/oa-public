#!/usr/bin/env bash

set -e

THIS_DIR=$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)

"$THIS_DIR"/clean-repo.sh

RELEASE_ARGUMENTS=()

maybe_release_package() {
  IDENT=$(jq -r .Ident <<<"$1")
  PACKAGE_CWD=$(jq -r .Cwd <<<"$1")

  if [[ -n $(git -C "$PACKAGE_CWD" --no-pager tag --list "$IDENT@*" --points-at HEAD) ]]; then
    RELEASE_ARGUMENTS+=(--include "$IDENT")
  fi
}

while read -r package; do
  maybe_release_package "$package"
done <<<$(yarn constraints query --json "workspace_ident(Cwd, Ident), \+ workspace_field(Cwd, 'private', 'true')")

if [[ ${#RELEASE_ARGUMENTS[@]} -eq 0 ]]; then
  exit 0
fi

yarn workspaces foreach \
  --topological-dev --interlaced --verbose --no-private "${RELEASE_ARGUMENTS[@]}" \
  npm publish --tolerate-republish
