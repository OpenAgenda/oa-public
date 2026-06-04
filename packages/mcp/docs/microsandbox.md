# microsandbox executor — reference

Reference for the **`microsandbox`** [`SandboxExecutor`](../src/sandbox/executors/microsandboxExecutor.js):
the hosted, multi-tenant **hard boundary** that runs untrusted, LLM-written
JavaScript when the MCP server is exposed publicly. Read alongside the
[README](../README.md) → "Execution model" and "Hébergé / multi-tenant"; this doc
covers the engine's measured characteristics, egress model, and operational
knobs. Pinned against **microsandbox v0.5.4 (beta)**.

## Where it fits

The `execute` tool runs untrusted code through a pluggable
[`SandboxExecutor`](../src/sandbox/executor.js). `deno` (local default) and `node`
(local, under an `srt` wrapper or `OA_LOCAL_NO_SANDBOX`) cover bounded-trust
local use; **`microsandbox` is the hard boundary for the public surface** and
needs a KVM (Linux) / Apple-Silicon (macOS) host.

In the two-axis model it is an **engine that owns its egress**
(`egressAuthority=executor`): the µVM's host-enforced network policy _is_ the
boundary, and `config.allowNet` (the API host) maps straight onto its egress
allowlist. `config.js` **fails closed** — `OA_MCP_MODE=hosted` requires
`OA_EXECUTOR=microsandbox` + `OA_CODE_EGRESS_AUTHORITY=executor` and refuses
everything else, so the public surface can't ship on a local guardrail.

The adapter is **implemented and verified end-to-end on a real KVM host**
(Linux + `/dev/kvm`, microsandbox 0.5.4). What remains before a public launch is
the **policy layer** (per-caller OAuth token, rate-limit, audit) and **ops** —
not the engine itself.

## Isolation & egress model

microsandbox provides, out of the box, the controls this use case needs:

- **microVM isolation** (libkrun + KVM): each sandbox is a VM with its own kernel
  (verified: the guest reports `Linux 6.12.x`, distinct from the host) — not a
  shared-kernel container.
- **Host-enforced egress**: every packet is checked against policy host-side, not
  in the guest. The `NetworkPolicy.publicOnly()` preset already blocks
  `169.254.169.254` (cloud metadata), RFC1918, loopback and link-local.
- **No daemon**: the runtime is embedded; sandboxes are child processes of our
  server (self-installing — `isInstalled()/install()` fetched libkrun in ~1 s on
  first use). The host still needs KVM / Apple Silicon.

### Egress is filtered on the TLS SNI — pin the exact host

The match is on the **TLS SNI** (the requested hostname), not the resolved IP or
the certificate (TLS 1.3 encrypts it). The policy is `defaultDeny` +
`Rule.allowDns()` + one `Rule.allowEgress(Destination.domain(host))` per API host;
`allowDns()` is mandatory (resolution fails without it). Pin the **exact** host,
not a `domainSuffix` parent — the suffix would also admit sibling subdomains (a
possible internal/private-IP SSRF target). `cidr()` does not match (the check is
SNI, not IP). An exfil IP or any non-API host has no matching SNI, so no explicit
metadata/RFC1918/loopback deny is needed — `defaultDeny` already drops them.

## Measured characteristics

Latency (warm, 6 runs, node:24-alpine), full ephemeral cycle **~214 ms**:

| phase                                 | time    | share    |
| ------------------------------------- | ------- | -------- |
| `create` (µVM boot)                   | ~158 ms | **74 %** |
| `exec`                                | ~55 ms  | 26 %     |
| `stop` + `removePersisted` (teardown) | ~1 ms   | ~0 %     |

The cost is the µVM **boot**, and it is **largely image-independent** — `create`
on `alpine` (~5 MB) is ~152 ms vs ~167 ms on a node image, only ~15 ms apart. A
lighter image buys almost nothing on latency (it only helps the one-time cold
pull + disk).

### Pooling latencies

A pre-warmed **single-use** µVM pool takes `create` off the hot path (one µVM per
execution still, never reused). Two regimes per size — _ready_ (sequential, hits a
warm spare) and _launched_ (a concurrent burst = pool size):

| config                     | latency                               |
| -------------------------- | ------------------------------------- |
| no pool — sequential       | ~209 ms (min 198)                     |
| no pool — concurrent×5     | wall 266 ms, ~262 ms/req              |
| pool=2 ready (seq)         | med **74 ms** (max 203 — one miss)    |
| pool=2 launched (conc×2)   | wall 80 ms                            |
| pool=5 ready (seq)         | med **72 ms** (clean, 0 miss)         |
| pool=5 launched (conc×5)   | wall **76 ms**, ~69 ms/req            |
| pool=10 ready (seq)        | med **71 ms**                         |
| pool=10 launched (conc×10) | wall 106 ms, ~100 ms/req (~94 runs/s) |

A warm **hit ≈ 70 ms** (median, stable across sizes — it's `exec`-only). A burst
sized to the pool is near-perfect (5 runs in 76 ms wall); at 10 the wall stays low
(throughput) but per-request rises (~100 ms) as 10 guest `node`s start at once and
contend for CPU — transient, not a wall-latency problem.

### Resource footprint (PSS, idle spares, cap 512 MiB)

| pool | RAM (idle) | CPU (idle)               |
| ---- | ---------- | ------------------------ |
| 1    | ~50 MiB    | ~0.2 % of a core         |
| 5    | ~250 MiB   | ~0.9 %                   |
| 10   | ~490 MiB   | ~1.7 % (of **one** core) |

Three findings drive sizing:

1. **The memory cap is lazy** — an idle spare is ~50 MiB whether
   `OA_SANDBOX_MEMORY_MB` is 256 or 1024. The cap is the guest's growth ceiling
   _while running_, not a reservation; a pool of 10 costs ~0.5 GiB at rest, not
   10× the cap.
2. **Image barely affects idle RAM** (~50 MiB node vs ~57 MiB alpine). An idle µVM
   is guest kernel + libkrun base; the `node` binary is only resident _during_
   `exec`.
3. **Idle ≠ active** (pool of 5, cap 512 MiB):

   | state                                               | RAM/µVM  | CPU/µVM                                    |
   | --------------------------------------------------- | -------- | ------------------------------------------ |
   | idle (no exec)                                      | ~51 MiB  | ~0 %                                       |
   | exec, node resident but waiting (e.g. an API fetch) | ~116 MiB | ~0 %                                       |
   | exec, CPU-bound loop                                | ~116 MiB | **~100 % of one core** (`cpus(1)` honored) |
   | exec, allocating ~128 MB                            | ~246 MiB | ~0 %                                       |

   Running `node` at all adds **~+65 MiB** (the resident runtime); the guest then
   grows **lazily** with what the code allocates up to `OA_SANDBOX_MEMORY_MB`, and
   CPU tracks actual work — ~1 core per actively-computing run, ~0 while waiting on
   I/O (the common case for MCP code, which mostly awaits the API). Budget:
   `RAM ≈ idle_spares × ~51 MiB + active_runs × (~116 MiB + allocation, ≤ cap)`;
   `CPU ≈ computing_runs × up to 1 core`. The real budget comes from concurrent
   _active_ runs, not idle spares — which is exactly what the concurrency cap
   bounds: `OA_MAX_CONCURRENCY` (default 4) limits `active_runs`, so worst-case
   RAM is `idle_spares × ~51 MiB + OA_MAX_CONCURRENCY × (~116 MiB + allocation)`.
   See [concurrencyLimit.js](../src/sandbox/concurrencyLimit.js); it wraps the
   engine, so the bound holds for every executor and transport.

## Pooling & sizing

The warm single-use pool ([microsandboxPool.js](../src/sandbox/executors/microsandboxPool.js))
is enabled with `OA_MICROSANDBOX_POOL_SIZE` (**default off**). At ~209 ms a cold
run is already well below an LLM round-trip, so the pool is a **hosted-under-load**
optimization, opt-in per the config convention. Teardown is ~1 ms, so there is
nothing to pool there.

- **Size the pool to peak concurrency + margin.** `pool=2` misses even
  sequentially (refill lags ~6 close requests → one ~203 ms cold fallback);
  over-budget requests fall back to a fresh `create` (graceful, never fails).
- **The security invariant holds**: a pooled spare is single-use and still
  enforces egress (gated test: API reachable, everything else blocked).
- **Lifetime invariant (no buggy window).** A µVM's `maxDuration` clock ticks while
  a spare sits idle, so a stale spare could expire mid-run. The pool prevents this
  structurally: `acquire()` serves a spare only while its **remaining life still
  covers a full run + slack** (`maxAgeMs = SANDBOX_LIFETIME_S − timeout − margin`);
  an older spare is destroyed and replaced by a fresh inline `create`. `bornAt` is
  stamped before `create()` resolves (a conservative over-estimate of age), so a
  spare is retired slightly early, never too late. Under light traffic spares age
  out → acquire **degrades to a miss** (slower), never to a dead µVM, at any
  traffic level. Because `maxDuration` is a **constant** (not derived from the
  per-run timeout), that timeout is dropped from a spare's reuse key, so one warm
  spare serves any per-run timeout.
- `executor.dispose()` is wired to SIGTERM/SIGINT/stdin-close ([index.js](../src/index.js))
  so idle spares drain on shutdown.

## Image

Default **`node:24-alpine`** (configurable via `OA_MICROSANDBOX_IMAGE`): the
official Node image, pinnable, minimal, with `node` on PATH. microsandbox caches
layers (`~/.microsandbox/layers`), so the image is pulled **once per version**,
not per µVM.

- **Default is a floating tag, NOT a digest pin** — deliberately. The µVM (not the
  image) is the security boundary and the guest is an ephemeral substrate for
  already-hostile code, so image-CVE exposure is contained; and without
  CI/Renovate a hard pin would silently rot (stale + unpatched while looking
  locked-down), whereas a floating tag picks up upstream rebuilds on each fresh
  pull, maintenance-free. **In production with a refresh process, DO pin a digest**
  via `OA_MICROSANDBOX_IMAGE` — and use the **multi-arch image-index** digest
  (`docker buildx imagetools inspect node:24-alpine` → `oci.image.index`), not the
  amd64-only child shown on Docker Hub's _layers_ UI (that one breaks Apple
  Silicon).
- **Rejected alternatives**: `chainguard/node` (free tier serves only `:latest` →
  can't be version-pinned); `gcr.io/distroless/nodejs*` (`node` is not on PATH —
  `/nodejs/bin/node` — so `exec('node')` fails). If a host ever hits the Docker Hub
  anonymous-pull limit (~100/6 h/IP), point at the un-rate-limited official mirror
  `public.ecr.aws/docker/library/node:24-alpine` (verified working).

## Caps, timeout & lifecycle

- **Memory**: `.memory(MiB(memoryMb))` is a hard µVM RAM cap (no
  `--max-old-space-size` needed); a µVM needs real headroom, so set
  `OA_SANDBOX_MEMORY_MB` well above a bare-process value (spikes used 1024).
- **Timeout**: per-exec `.timeout(ms)` is the wall-clock kill (throws
  `ExecTimeoutError`, code `execTimeout`); `.maxDuration(s)` is a coarse whole-µVM
  lifetime backstop — a **constant** (`SANDBOX_LIFETIME_S`), NOT derived from the
  per-run timeout, so a warm pooled spare can wait without its lifetime being a few
  seconds. Timeout is detected by error **code** plus a message fallback (jest's
  VM-module realm breaks `instanceof`).
- **Lifecycle**: `stop()` only halts the µVM — it stays **persisted** (next
  same-named `create()` → `SandboxAlreadyExists`). The adapter uses a **unique name
  per run** (`oa-mcp-exec-<uuid>`, supporting concurrency) and tears down with
  `stop()` + `removePersisted()` so one-shots don't accumulate.

## Caveats (load-bearing)

1. **Beta (v0.5.x)** — explicit "expect breaking changes" warning. Pin the version;
   treat the API as movable.
2. **Egress matching is SNI-based** — see the SNI section above. `defaultDeny` is
   the boundary; the allow rule is an exact `domain(host)` (matched on the
   requested hostname, not the resolved IP or cert).
3. **No built-in auth** on the agent/sandbox interface — tenant authn is ours. Fine
   here: the runtime is embedded in our server process, not an exposed service.

## Tests

Pure pieces (policy shape, output cap, pool age-guard) are unit
tested in CI. The real-µVM behaviour (boot, egress allow/deny, timeout kill) is a
KVM-gated, opt-in block that self-skips elsewhere:

```sh
OA_MSB_IT=1 yarn workspace @openagenda/mcp test
```

## Sequencing

microsandbox only matters once there is a **public** surface, which is downstream
of (1) the **v3 write surface** and (2) **OAuth
scoped per-caller tokens** (no shared ambient key — the one case OAuth is
mandatory). Until then the fail-closed gate keeps anyone from shipping `hosted`
without the hard boundary. **microsandbox is not the next chantier** — write
surface + OAuth come first.

Build-vs-buy stays open: self-hosted microsandbox (a KVM host to operate) vs
managed equivalents that bundle isolation + egress + caps without a KVM host
([Vercel Sandbox](https://vercel.com/docs/sandbox/concepts/firewall),
[E2B](https://e2b.dev/docs/sandbox/internet-access),
[Daytona](https://www.daytona.io/docs/en/network-limits/)). The `SandboxExecutor`
seam keeps the choice open; microsandbox is a strong, working default.

## Sources

microsandbox docs (networking, sdk/typescript/{networking,execution},
sandboxes/lifecycle, networking/security-model) — docs.microsandbox.dev ·
[GitHub](https://github.com/superradcompany/microsandbox) (v0.5.4, Apache-2.0,
beta).
