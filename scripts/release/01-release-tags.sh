#!/usr/bin/env bash

set -e

THIS_DIR=$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_DIR="$THIS_DIR/../.."
PUBLIC_DIR=$(readlink -f "$REPO_DIR/public")
NL=$'\n'

"$THIS_DIR"/clean-repo.sh

MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')

if [[ $(git rev-parse --abbrev-ref HEAD) == "$MAIN_BRANCH" ]]; then
  YARN_CHANGESET_BASE_REFS=$(git --no-pager log -1 --format="%H" --tags --abbrev=0)
else
  YARN_CHANGESET_BASE_REFS=""
fi

# Ask for dependency bumps
YARN_CHANGESET_BASE_REFS=$YARN_CHANGESET_BASE_REFS yarn version check -i

echo

# Bump the packages, and store which ones have been bumped (and thus need to be re-released)
echo 'Applying versions...'
RELEASE_DETAILS=$(YARN_CHANGESET_BASE_REFS=$YARN_CHANGESET_BASE_REFS yarn version apply --all --json)

RELEASE_SIZE=$(wc -l <<<"$RELEASE_DETAILS")
PUBLIC_RELEASE_SIZE=0

if [[ -z $RELEASE_DETAILS || $RELEASE_SIZE -eq 0 ]]; then
  echo "No package to release"
  exit 1
fi

COMMIT_MESSAGE=""
PUBLIC_COMMIT_MESSAGE=""

UPDATE_ARGUMENTS=()

while read -r line; do
  IDENT=$(jq -r .ident <<<"$line")
  VERSION=$(jq -r .newVersion <<<"$line")
  PACKAGE_CWD=$(jq -r .cwd <<<"$line")
  MODULE_WORKTREE=$(git -C "$PACKAGE_CWD" rev-parse --show-toplevel)

  # Is a public package
  if [[ "$MODULE_WORKTREE" == "$PUBLIC_DIR" ]]; then
    RELEASE_SIZE=$((RELEASE_SIZE - 1))
    PUBLIC_RELEASE_SIZE=$((PUBLIC_RELEASE_SIZE + 1))

    PUBLIC_COMMIT_MESSAGE="$PUBLIC_COMMIT_MESSAGE- $IDENT@$VERSION$NL"
  else
    COMMIT_MESSAGE="$COMMIT_MESSAGE- $IDENT@$VERSION$NL"
  fi

  UPDATE_ARGUMENTS+=(--include "$IDENT")
done <<<"$RELEASE_DETAILS"

echo "Prepacking packages..."

NODE_ENV=production yarn workspaces foreach \
  --topological-dev --interlaced --verbose "${UPDATE_ARGUMENTS[@]}" \
  pack --dry-run

# Commit public if needed
if [[ -n $(git -C "$PUBLIC_DIR" status --porcelain) ]]; then
  git -C "$PUBLIC_DIR" add "$PUBLIC_DIR"

  if [[ $PUBLIC_RELEASE_SIZE -eq 0 ]]; then
    PUBLIC_COMMIT_MESSAGE="chore: publish private package(s)"
  elif [[ $PUBLIC_RELEASE_SIZE -eq 1 ]]; then
    PUBLIC_COMMIT_MESSAGE="chore: publish one new package$NL$NL$PUBLIC_COMMIT_MESSAGE"
  else
    PUBLIC_COMMIT_MESSAGE="chore: publish $PUBLIC_RELEASE_SIZE new packages$NL$NL$PUBLIC_COMMIT_MESSAGE"
  fi

  DISABLE_AUTO_COMMIT=1 git -C "$PUBLIC_DIR" commit -m "$PUBLIC_COMMIT_MESSAGE" --no-verify
fi

# Commit private repo
if [[ $RELEASE_SIZE -eq 0 ]]; then
  COMMIT_MESSAGE="chore: publish public package(s)"
elif [[ $RELEASE_SIZE -eq 1 ]]; then
  COMMIT_MESSAGE="chore: publish one new package$NL$NL$COMMIT_MESSAGE"
else
  COMMIT_MESSAGE="chore: publish $RELEASE_SIZE new packages$NL$NL$COMMIT_MESSAGE"
fi

git add "$REPO_DIR"
git commit -m "$COMMIT_MESSAGE" --no-verify

# Create each package tag
while read -r line; do
  IDENT=$(jq -r .ident <<<"$line")
  VERSION=$(jq -r .newVersion <<<"$line")
  PACKAGE_CWD=$(jq -r .cwd <<<"$line")
  TAG="$IDENT@$VERSION"

  if [[ -n $(git -C "$PACKAGE_CWD" tag -l "$TAG") ]]; then
    git -C "$PACKAGE_CWD" tag --delete "$TAG"
  fi

  git -C "$PACKAGE_CWD" tag -a "$TAG" -m "$IDENT"
done <<<"$RELEASE_DETAILS"

# Global tag for private repo
BASE_TAG=$(date +%Y-%m-%d)
for TAG_SUFFIX in '' {a..z}; do
  TAG="$BASE_TAG$TAG_SUFFIX"

  if [[ -n $(git tag -l "$TAG") ]]; then
    if git merge-base --is-ancestor tags/"$TAG" HEAD; then
      continue
    else
      git tag --delete "$TAG"
    fi
  fi

  git tag -a "$TAG" -m "$TAG"
  break
done

# Global tag for public repo
if [[ $PUBLIC_RELEASE_SIZE -ne 0 ]]; then
  git -C "$PUBLIC_DIR" tag -a "$TAG" -m "$TAG"
fi

cat <<<"$(printf "\nPublic commit: %s" "$PUBLIC_COMMIT_MESSAGE")"
cat <<<"$(printf "\nPrivate commit: %s" "$COMMIT_MESSAGE")"
