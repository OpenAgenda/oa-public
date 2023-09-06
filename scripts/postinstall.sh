#!/usr/bin/env bash

# Don't (re)install husky in oa
if [[ -z $OA_PUBLIC_LOCKFILE ]]; then
  husky install
fi
