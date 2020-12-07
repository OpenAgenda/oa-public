#!/usr/bin/env bash

set -e

THIS_DIR=$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)

"$THIS_DIR"/clean-repo.sh

RELEASE_ARGUMENTS=()

maybe_release_package() {
  if git describe --match "$1@*" HEAD >&/dev/null; then
    RELEASE_ARGUMENTS+=(--include "$1")
  fi
}

while read -r ident; do
  maybe_release_package "$ident"
done < <(yarn constraints query --json "workspace_ident(Cwd, Ident), \+ workspace_field(Cwd, 'private', 'true')" | jq -r .Ident)

if [[ ${#RELEASE_ARGUMENTS[@]} -eq 0 ]]; then
  exit 0
fi

yarn workspaces foreach \
  --verbose --topological --no-private "${RELEASE_ARGUMENTS[@]}" \
  npm publish --tolerate-republish
