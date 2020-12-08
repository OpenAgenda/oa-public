#!/usr/bin/env bash

set -e

THIS_DIR=$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)

"$THIS_DIR"/clean-repo.sh
"$THIS_DIR"/01-release-tags.sh
"$THIS_DIR"/02-release-builds.sh
