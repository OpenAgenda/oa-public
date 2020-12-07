#!/usr/bin/env bash

set -e

if [[ -n $(git status --porcelain) ]]; then
  echo 'This command must be executed on a clean repository'
  exit 1
fi
