# OpenAgenda MCP — µVM runtime image: llrt baked into a distroless base.
#
# This is the JS runtime that runs INSIDE the microsandbox µVM when
# OA_SANDBOX_RUNTIME=llrt (see src/sandbox/executors/microsandboxExecutor.js).
# We BUILD AND OWN this image rather than pulling a third party's: the rootfs is
# the substrate the untrusted, LLM-written code runs on, so its supply chain is
# security-critical. Recipe verified to boot + run our SDK bundle in microsandbox.
#
# Design (see docs/microsandbox.md → "The llrt runtime image"):
#   - Base gcr.io/distroless/cc:nonroot — glibc + libstdc++, no shell / no package
#     manager (minimal attack surface), and it already ships ca-certificates for
#     public TLS. RAM is unaffected by the rootfs (the µVM floor is VMM+kernel-bound
#     — measured), so `cc` over `static` costs nothing and buys glibc + CA trust
#     (harmless even though the linux llrt build is static).
#   - llrt-LINUX-<arch>-NO-SDK (the CLI build, NOT the `container` build): NO-SDK
#     drops the bundled AWS SDK (smaller, smaller JS surface to untrusted code);
#     `fetch` is unaffected (core llrt). CRITICAL — we use the `linux` build, not
#     `container`: the container/Lambda build wraps every console.log in a structured
#     log line (`<ts>\tn/a\tINFO\t…`), which would corrupt our stdout RESULT channel
#     (the preamble console.log's the result; the server reads stdout verbatim). The
#     linux/CLI build emits PLAIN stdout, matching node's contract. (Verified.)
#   - No /tmp in the image: microsandbox mounts a tmpfs at /tmp, where the per-request
#     program is written via sb.fs().write — so the read-only rootfs is fine.
#   - The per-request program is NOT baked here (it carries the caller's scoped
#     token) — only the runtime is. The dev OADEV private CA is mounted at runtime
#     and trusted via LLRT_EXTRA_CA_CERTS; prod uses public CAs (webpki / the base
#     bundle), no mount.
#
# Reproducible: base pinned by MULTI-ARCH INDEX digest, llrt pinned by sha256.
# Refresh the pins with scripts/refresh-llrt-image.sh (mirrors the upstream
# distroless/Renovate cadence config.js warns a static pin needs to avoid rot).
#
# Build (multi-arch, push to YOUR registry — do not depend on a hub image):
#   docker buildx build -f packages/mcp/llrt.Dockerfile \
#     --platform linux/amd64,linux/arm64 \
#     -t <registry>/oa-mcp-llrt:v0.8.1-beta --push packages/mcp
# Then seed the µVM host: `msb pull <registry>/oa-mcp-llrt@sha256:…` and set
#   OA_MICROSANDBOX_IMAGE=<registry>/oa-mcp-llrt@sha256:…  OA_SANDBOX_RUNTIME=llrt
# (no OA_LLRT_BIN — llrt is on PATH in the image).

# syntax=docker/dockerfile:1

ARG LLRT_VERSION=v0.8.1-beta
# sha256 of llrt-linux-<arch>-no-sdk.zip (refresh-llrt-image.sh keeps these current).
ARG LLRT_SHA256_AMD64=3425ab6ae041d123ec9f89756ed8562975b4e2acd715f83900803c08f12a16b1
ARG LLRT_SHA256_ARM64=0c68affe61db85a5e7c58d9cde6dc66774306dcc18d26ad221a524bfd6e23921
# gcr.io/distroless/cc:nonroot MULTI-ARCH INDEX digest (NOT a per-platform manifest,
# so a single FROM resolves the right child for amd64 AND arm64).
ARG DISTROLESS_DIGEST=sha256:e1fd250ce83d94603e9887ec991156a6c26905a6b0001039b7a43699018c0733

# Fetch + checksum-verify the llrt binary in a throwaway stage (the final distroless
# image has no curl/unzip). `ADD --checksum` can't switch URL+hash per arch in one
# line, so we resolve TARGETARCH here and verify the downloaded zip explicitly.
FROM debian:12-slim AS fetch
ARG LLRT_VERSION LLRT_SHA256_AMD64 LLRT_SHA256_ARM64
ARG TARGETARCH
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl unzip \
 && rm -rf /var/lib/apt/lists/* \
 && case "$TARGETARCH" in \
      amd64) asset=x64;   sha="$LLRT_SHA256_AMD64" ;; \
      arm64) asset=arm64; sha="$LLRT_SHA256_ARM64" ;; \
      *) echo "unsupported TARGETARCH=$TARGETARCH" >&2; exit 1 ;; \
    esac \
 && curl -fsSL -o /tmp/llrt.zip \
      "https://github.com/awslabs/llrt/releases/download/${LLRT_VERSION}/llrt-linux-${asset}-no-sdk.zip" \
 && echo "${sha}  /tmp/llrt.zip" | sha256sum -c - \
 && unzip -o /tmp/llrt.zip -d /tmp/llrt-extract \
 && install -m 0555 /tmp/llrt-extract/llrt /llrt

FROM gcr.io/distroless/cc:nonroot@${DISTROLESS_DIGEST}
COPY --from=fetch /llrt /usr/bin/llrt
# llrt bundles webpki roots; distroless/cc also ships ca-certificates (public TLS).
# The dev OADEV private CA is bind-mounted + LLRT_EXTRA_CA_CERTS at runtime.
CMD ["llrt"]
