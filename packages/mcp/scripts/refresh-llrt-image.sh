#!/usr/bin/env bash
# Refresh the pinned values in ../llrt.Dockerfile: the llrt version, the per-arch
# llrt-linux-<arch>-no-sdk sha256 checksums (the CLI build = plain stdout; NOT the
# `container` build, which corrupts the result channel), and the distroless/cc:nonroot
# MULTI-ARCH INDEX digest. This is the refresh cadence config.js warns a hard pin
# needs to avoid silent rot (stale + unpatched while looking "locked down") — run
# it from CI on a schedule, or before cutting a new µVM image.
#
# Usage: scripts/refresh-llrt-image.sh [llrt-version]
#   no arg  → latest llrt release; otherwise pin to the given tag (e.g. v0.8.1-beta)
#
# Requires: curl, sha256sum, docker buildx (for the index-digest resolve).
set -euo pipefail

DOCKERFILE="$(cd "$(dirname "$0")/.." && pwd)/llrt.Dockerfile"
RELEASES=https://github.com/awslabs/llrt/releases

ver="${1:-}"
if [ -z "$ver" ]; then
  # Follow the /latest redirect to read the resolved tag.
  ver=$(curl -fsSL -o /dev/null -w '%{url_effective}' "$RELEASES/latest" | sed 's#.*/tag/##')
fi
echo "llrt version : $ver"

sha_for() { # <asset-arch> → sha256 of llrt-linux-<arch>-no-sdk.zip (CLI build = plain stdout)
  curl -fsSL "$RELEASES/download/$ver/llrt-linux-$1-no-sdk.zip" | sha256sum | cut -d' ' -f1
}
echo "checksums    : computing (downloads both arch binaries)…"
amd64=$(sha_for x64)
arm64=$(sha_for arm64)
echo "  amd64      : $amd64"
echo "  arm64      : $arm64"

echo "base digest  : resolving gcr.io/distroless/cc:nonroot index…"
# The first top-level `Digest:` line is the multi-arch INDEX digest (child
# manifests appear as indented `Name: …@sha256:…`, so `^Digest:` matches only it).
digest=$(docker buildx imagetools inspect gcr.io/distroless/cc:nonroot \
  | awk '/^Digest:/{print $2; exit}')
echo "  $digest"
case "$digest" in
  sha256:*) ;;
  *) echo "could not resolve index digest" >&2; exit 1 ;;
esac

# In-place edit via temp file + mv — portable (GNU `sed -i` and BSD/macOS `sed -i ''`
# disagree on the backup-suffix arg; plain stdout sed is the same everywhere).
tmp=$(mktemp)
sed \
  -e "s#^ARG LLRT_VERSION=.*#ARG LLRT_VERSION=${ver}#" \
  -e "s#^ARG LLRT_SHA256_AMD64=.*#ARG LLRT_SHA256_AMD64=${amd64}#" \
  -e "s#^ARG LLRT_SHA256_ARM64=.*#ARG LLRT_SHA256_ARM64=${arm64}#" \
  -e "s#^ARG DISTROLESS_DIGEST=.*#ARG DISTROLESS_DIGEST=${digest}#" \
  "$DOCKERFILE" >"$tmp"
mv "$tmp" "$DOCKERFILE"

echo "updated      : $DOCKERFILE"
echo "review the diff, then rebuild + push the image (see the Dockerfile header)."
