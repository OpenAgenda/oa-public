#!/usr/bin/env bash

set -e

THIS_DIR=$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_DIR="$THIS_DIR/../.."

"$THIS_DIR"/clean-repo.sh

maybe_release_package() {
  IDENT=$(jq -r .Ident <<<"$1")
  PACKAGE_CWD=$(jq -r .Cwd <<<"$1")

  if [[ -n $(git -C "$PACKAGE_CWD" --no-pager tag --list "$IDENT@*" --points-at HEAD) ]]; then
    npm publish --tolerate-republish "$REPO_DIR/artifacts/$(echo "$IDENT" | tr / -).tgz"
  fi
}

while read -r package; do
  maybe_release_package "$package"
done <<<$(yarn constraints query --json "workspace_ident(Cwd, Ident), \+ workspace_field(Cwd, 'private', 'true')")

rm -rf "$REPO_DIR/artifacts"
