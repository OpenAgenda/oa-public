# Hosted boundary plan — microsandbox

Plan for the `microsandbox` executor: the **hosted, multi-tenant hard boundary**
that runs untrusted, LLM-written JavaScript when the MCP server is exposed
publicly. Complements [`../README.md`](../README.md) → "Execution model" and
"Hébergé / multi-tenant". As of 2026-06, microsandbox is **v0.5.4 (beta)**.

## Where this fits

The MCP `execute` tool runs untrusted code in a pluggable
[`SandboxExecutor`](../src/sandbox/executor.js). Today:

- **`deno`** (local default) and **`node`** (local, under an `srt` wrapper or
  `OA_LOCAL_NO_SANDBOX`) cover local/bounded-trust use.
- **`microsandbox`** is **implemented** ([adapter](../src/sandbox/executors/microsandboxExecutor.js))
  — the hard boundary for the public surface; needs a KVM (Linux) /
  Apple-Silicon (macOS) host. The Phase-0 spike and Phase-1 adapter are **done**
  and verified on a real KVM host (see "As built" below); what remains before a
  public launch is the **policy layer** (Phase 2) and **ops** (Phase 3).

`config.js` **fails closed**: `OA_MCP_MODE=hosted` requires
`OA_EXECUTOR=microsandbox` + `OA_CODE_EGRESS_AUTHORITY=executor` and refuses
everything else, so no one can ship the public surface on a local guardrail.

In the two-axis model, **microsandbox is an engine that owns its egress**
(`egressAuthority=executor`): the µVM's host-enforced network policy is the
boundary. Our `config.allowNet` (the API host) maps straight onto its egress
allowlist.

## Verified capabilities (docs.microsandbox.dev, 2026-06)

microsandbox provides, out of the box, the controls this use case needs:

- **microVM isolation** (libkrun + KVM): each sandbox is a VM with its own
  kernel — not a shared-kernel container.
- **Host-enforced egress** ("every packet is checked against policy before it
  leaves" — enforced host-side, not in the guest). Default preset
  `NetworkPolicy.publicOnly()` already **blocks `169.254.169.254` (cloud
  metadata), RFC1918, loopback and link-local**.
- **Per-sandbox egress allowlist** (`defaultDeny`/`defaultAllow`, domain / suffix
  / CIDR / group rules, the `NetworkPolicy.builder()` or a plain
  `{defaultEgress, defaultIngress, rules}` object via `Rule.*` / `Destination.*`).
  ⚠️ The SDK surface is broad, but **what actually matches an HTTPS connection is
  narrower than the API suggests** — see "As built / egress findings": for our
  use the working policy is `defaultDeny` + `Rule.allowDns()` +
  `Rule.allowEgress(Destination.domainSuffix('.<parent>'))`.
- **SDK-enforced timeout** per exec (`execWith(cmd, b => b.stdinBytes(code).timeout(ms))`)
  plus a whole-µVM `maxDuration()`, and `cpus()` / `memory()` caps.
- **Execution model**: OCI image (`image('node')` / `denoland/deno`), run via
  `exec` / `execWith` with the program on stdin (`stdinBytes`), read
  `out.stdout()` / `out.code`. Ephemeral `await using` create→exec→destroy is the
  natural one-µVM-per-call pattern.
- **No daemon**: the runtime is embedded; sandboxes are child processes of our
  server. The host still needs KVM / Apple Silicon.

## Caveats (load-bearing)

1. **Beta (v0.5.x)** — explicit "expect breaking changes" warning. Pin the
   version; treat the API as movable.
2. **Egress matching is SNI-based, and the rule form is non-obvious** (corrects
   an earlier assumption — see "As built / egress findings"). `defaultDeny` is the
   boundary, but the _allow_ rule that actually matches an HTTPS connection is a
   **`domainSuffix('.<parent>')`** (a leading-dot parent suffix), **not** an exact
   `domain()` and **not** a `cidr()` — verified empirically, an exact-domain or
   CIDR-only allow blocks even the legitimate API call. So the boundary is a
   first-party domain suffix (`.openagenda.com`), with a hardcoded exfil IP denied
   because its SNI has no matching suffix rule. (DoH-on-443 / tunnelled DNS remain
   theoretical bypasses of any SNI/domain scheme; the µVM + first-party-only
   suffix keeps the blast radius first-party regardless.)
3. **No built-in auth** on the agent/sandbox interface — tenant authn is ours.
   Fine here: the runtime is embedded in our server process, not an exposed
   service.

## As built — verified on a real KVM host (Phase 0 + 1, done)

The adapter ([microsandboxExecutor.js](../src/sandbox/executors/microsandboxExecutor.js))
is implemented and exercised end-to-end on a Linux + `/dev/kvm` host (microsandbox
0.5.4). Findings that shaped it — several correcting earlier assumptions:

- **Embedded, self-installing.** No daemon. `isInstalled()/install()` fetched the
  libkrun runtime in ~1 s on first use; the runtime is a child process of our
  server.
- **Latency (measured, warm, 6 runs).** Full ephemeral cycle **~214 ms** total,
  broken down: **`create` ~158 ms (74 %)**, `exec` ~55 ms, `stop`+`removePersisted`
  ~1 ms (teardown is essentially free). So the cost is the µVM boot, and it is
  **largely image-independent** — `create` on `alpine` (~5 MB) is ~152 ms vs
  ~167 ms on a node image, only ~15 ms apart. A lighter image therefore buys
  almost nothing on latency (it helps the one-time cold pull + disk); the default
  is `node:24-alpine` (see image findings below).
- **Pooling — prototyped behind a flag (default off).** A pre-warmed **single-use**
  µVM pool (`OA_MICROSANDBOX_POOL_SIZE`, [microsandboxPool.js](../src/sandbox/executors/microsandboxPool.js))
  takes `create` off the hot path — one µVM per execution still, never reused.
  Measured through the executor (node:24-alpine), two regimes per size — _ready_
  (sequential, hits a warm spare) and _launched_ (a concurrent burst = pool size,
  consuming every spare at once):
  | config | latency |
  | --- | --- |
  | no pool — sequential | ~209 ms (min 198) |
  | no pool — concurrent×5 | wall 266 ms, ~262 ms/req |
  | pool=2 ready (seq) | med **74 ms** (max 203 — one miss) |
  | pool=2 launched (conc×2) | wall 80 ms |
  | pool=5 ready (seq) | med **72 ms** (clean, 0 miss) |
  | pool=5 launched (conc×5) | wall **76 ms**, ~69 ms/req |
  | pool=10 ready (seq) | med **71 ms** |
  | pool=10 launched (conc×10) | wall 106 ms, ~100 ms/req (~94 runs/s) |

  A warm **hit ≈ 70 ms** (median), stable across pool sizes (~3× vs ~209 ms — it's
  `exec`-only, `create` is off the hot path). A concurrent burst sized to the pool
  is near-perfect (5 runs in 76 ms wall); at 10 the wall stays low (high throughput)
  but per-request rises (~100 ms) as 10 guest `node`s start at once and contend for
  CPU — transient, not a wall-latency problem. **pool=2 misses even sequentially**
  (refill lags 6 close requests → one ~203 ms cold fallback): so **size the pool to
  peak concurrency + margin**; over-budget requests fall back to a fresh create
  (graceful, never fails). Default **off**: ~209 ms is already well below an LLM
  round-trip; it is a **hosted-under-load** optimization, opt-in per the config
  convention. Teardown is ~1 ms, so nothing to pool there. The security invariant is
  preserved (gated test: a pooled spare still enforces egress — api reachable,
  everything else blocked).

- **Resource footprint (measured, PSS, idle spares, cap 512 MiB).** An idle warm
  spare costs **~50 MiB real RAM** and **~0.17 % of one core**, scaling linearly:
  | pool | RAM (idle) | CPU (idle) |
  | --- | --- | --- |
  | 1 | ~50 MiB | ~0.2 % of a core |
  | 5 | ~250 MiB | ~0.9 % |
  | 10 | ~490 MiB | ~1.7 % (of **one** core) |

  Three findings that drive sizing:

  1. **The memory cap is lazy** — an idle spare is ~50 MiB whether `OA_SANDBOX_MEMORY_MB`
     is 256 or 1024. The cap is the guest's growth ceiling _while running_, not a
     reservation; a pool of 10 costs ~0.5 GiB at rest, not 10× the cap.
  2. **Image barely affects idle RAM** (~50 MiB node vs ~57 MiB alpine) — same as
     latency. An idle µVM is guest kernel + libkrun base; the `node` binary is only
     resident _during_ `exec`. So the lighter image saves neither RAM nor latency,
     only cold-pull + disk — not a reason to chase a smaller base.
  3. **Idle ≠ active (measured, pool of 5, cap 512 MiB).** The ~50 MiB is a
     _waiting_ spare. Running code costs more — and CPU is its own axis:
     | state | RAM/µVM | CPU/µVM |
     | --- | --- | --- |
     | idle (no exec) | ~51 MiB | ~0 % |
     | exec, node resident but waiting (e.g. an API fetch) | ~116 MiB | ~0 % |
     | exec, CPU-bound loop | ~116 MiB | **~100 % of one core** (`cpus(1)` cap honored) |
     | exec, allocating ~128 MB | ~246 MiB | ~0 % |

     So running `node` at all adds **~+65 MiB** (the resident runtime), the guest
     then grows **lazily** with what the code allocates up to `OA_SANDBOX_MEMORY_MB`,
     and CPU tracks actual work — **~1 core per actively-computing run, ~0 while
     waiting on I/O** (the common case for MCP code, which mostly awaits the API).
     Budget:
     `RAM ≈ idle_spares × ~51 MiB + active_runs × (~116 MiB + code allocation, ≤ cap)`;
     `CPU ≈ computing_runs × up to 1 core` (waiting runs ≈ 0). The real budget comes
     from concurrent _active_ runs, not from idle spares.

- **Genuine isolation confirmed.** The µVM reports its own kernel (`Linux
6.12.68`), distinct from the host — not a shared-kernel container.
- **Egress findings (the load-bearing correction).** Egress is filtered on the
  TLS **SNI**, and only one rule form matches reliably (all verified twice):
  | rule | result |
  | --- | --- |
  | `domain('api.openagenda.com')` (exact) | blocks **everything** |
  | `domainSuffix('api.openagenda.com')` (host) | blocks everything |
  | `cidr('<resolved-ip>/32')` + `allowDns` | blocks everything (SNI ≠ IP) |
  | `domainSuffix('.openagenda.com')` (parent) + `allowDns` | **api ✅, example.com ⛔** |

  So the policy is `defaultDeny` + `Rule.allowDns()` + `Rule.allowEgress(domainSuffix('.<parent>'))`,
  deriving the parent by dropping the leftmost label of the API host. `allowDns()`
  is mandatory (without it DNS resolution fails). This **supersedes** the earlier
  "use CIDR" plan — CIDR alone does not even admit the legitimate call.

- **Image: default `node:24-alpine`** (configurable via `OA_MICROSANDBOX_IMAGE`).
  Chosen because it's the **official** Node image, **pinnable**, minimal, has `node`
  **on PATH**, and is universally understood. Verified booting + running node on a
  real host. Two corrections to earlier assumptions:
  - The "Docker Hub gates `library/node`" finding was a **rate-limit artifact** of
    heavy spike-testing (`Not authorized` = the anonymous-pull limit, ~100/6 h/IP),
    **not** a permanent gate — `node:24-alpine` pulls fine, and microsandbox caches
    layers (`~/.microsandbox/layers`), so the image is pulled **once per version**,
    not per µVM, making the limit a non-issue. (Earlier this pushed the default to
    `cgr.dev/chainguard/node` — a residue, now corrected.)
  - Rejected alternatives: **chainguard/node** (free tier serves only `:latest` →
    can't be version-pinned); **gcr.io/distroless/nodejs\*** (`node` is **not on
    PATH** — `/nodejs/bin/node` — so `exec('node')` fails). If a host ever hits the
    Docker Hub limit, point at the un-rate-limited official mirror
    `public.ecr.aws/docker/library/node:24-alpine` (verified working).
  - **Default is a floating tag, NOT a digest pin** — deliberately. The µVM (not
    the image) is the security boundary and the guest is an ephemeral substrate for
    already-hostile code, so image-CVE exposure is contained and lower-stakes; and
    **without CI/Renovate a hard pin would silently rot** (stale + unpatched while
    looking locked-down), whereas a floating tag picks up upstream rebuilds on each
    fresh pull, maintenance-free. **In production with a refresh process, DO pin a
    digest** via `OA_MICROSANDBOX_IMAGE` — and use the **multi-arch image-index**
    digest (`docker buildx imagetools inspect node:24-alpine` → `oci.image.index`),
    not the amd64-only child shown on Docker Hub's _layers_ UI (that one breaks
    Apple Silicon).
- **Lifecycle.** `stop()` only halts the µVM — it stays **persisted** (next
  same-named `create()` → `SandboxAlreadyExists`). The adapter uses a **unique
  name per run** (`oa-mcp-exec-<uuid>`, supporting concurrency) and tears down with
  `stop()` + `removePersisted()` so one-shots don't accumulate.
- **Caps.** `.memory(MiB(memoryMb))` is a hard µVM RAM cap (no `--max-old-space-size`
  needed); a µVM needs real headroom, so set `OA_SANDBOX_MEMORY_MB` well above a
  bare-process value (spikes used 1024). Per-exec `.timeout(ms)` is the wall-clock
  kill (throws `ExecTimeoutError`, code `execTimeout`); `.maxDuration(s)` is a coarse
  whole-µVM lifetime backstop — a **constant** (`SANDBOX_LIFETIME_S`), NOT derived
  from the per-run timeout, so a warm pooled spare can wait without its lifetime
  being a few seconds. Timeout is detected by error **code** (+ a message fallback,
  since jest's VM-module realm breaks `instanceof` and the JS error-mapping).
- **Pool lifetime invariant (no buggy window).** A µVM's `maxDuration` clock ticks
  while a spare sits idle, so a stale spare could expire mid-run. The pool prevents
  this structurally: `acquire()` serves a spare only while its **remaining life
  still covers a full run + slack** (`maxAgeMs = SANDBOX_LIFETIME_S − timeout −
margin`); an older spare is destroyed and replaced by a fresh inline create.
  `bornAt` is stamped before `create()` resolves (conservative over-estimate of
  age). Under light traffic spares age out → acquire **degrades to a miss** (slower),
  never to a dead µVM — at any traffic level. Because `maxDuration` no longer depends
  on the per-run timeout, that timeout is dropped from a spare's reuse key (`sigKey`),
  so one warm spare serves any per-run timeout.
- **Tests.** Pure pieces (suffix derivation, policy shape, output cap) are unit
  tested in CI; the real-µVM behaviour (boot, egress allow/deny, timeout kill) is
  a KVM-gated, opt-in block (`OA_MSB_IT=1`) that self-skips elsewhere.

**Still open from the spike:** build-vs-buy — self-hosted microsandbox (a KVM host
to operate) vs managed equivalents that bundle isolation + egress + caps without a
KVM host (Vercel Sandbox, E2B, Daytona). The `SandboxExecutor` seam keeps the
choice open; microsandbox is a strong, working default.

## Plan

### Phase 0 — Spike ✅ done · Phase 1 — Adapter ✅ done

See "As built" above. The adapter maps onto the existing `SandboxExecutor`
contract with no change to the rest of the server.

### Phase 2 — Policy layer (still ours; the µVM is isolation, not policy)

- **Scoped per-caller OAuth token** injected — no ambient shared credential
  (depends on OAuth, below).
- **Rate-limit per token + concurrency cap + queue.**
- **Warm single-use µVM pool** — **prototyped** (`OA_MICROSANDBOX_POOL_SIZE`,
  default off; see "As built / Pooling"). `executor.dispose()` is wired to
  SIGTERM/SIGINT/stdin-close (index.js) so idle spares drain on shutdown. Phase 2:
  size the pool to measured peak concurrency, and (optional) drain gracefully
  letting in-flight runs finish rather than exiting immediately.
- **Audit log + kill-switch.**
- **Egress** is in place (`defaultDeny` + `allowDns` + parent `domainSuffix`,
  caveat 2); Phase 2 only tightens the _parent_ suffix to the API host if a future
  microsandbox release makes exact-host SNI matching work.
- **Pin the microsandbox version** (caveat 1).
- **Tenant authn** (caveat 3).

### Phase 3 — Ops / hosting

KVM host (or a managed platform), monitoring/autoscaling, wiring of `hosted`
mode, and the orchestrator under `srt` as defense-in-depth (the separate
orchestrator-egress scope from the README). No microsandbox daemon to operate —
the runtime is embedded.

## Sequencing / gating

microsandbox only matters once there is a **public** surface, which is
**downstream of**:

1. the **v3 write surface** (read-only today → lower stakes), and
2. **OAuth scoped per-caller tokens** (slice-auth) — mandatory for multi-tenant
   (no shared ambient key; this is the one case OAuth is mandatory per the
   README).

Until then the fail-closed gate keeps anyone from shipping `hosted` without the
hard boundary. microsandbox is **not the next chantier** — write surface + OAuth
come first.

## Sources

- microsandbox docs: networking, sdk/typescript/{networking,execution},
  sandboxes/lifecycle, networking/security-model, getting-started/introduction
  (docs.microsandbox.dev) · [GitHub](https://github.com/superradcompany/microsandbox)
  (v0.5.4, Apache-2.0, beta).
- Managed alternatives weighed in Phase 0: [Vercel Sandbox firewall](https://vercel.com/docs/sandbox/concepts/firewall),
  [E2B](https://e2b.dev/docs/sandbox/internet-access), [Daytona](https://www.daytona.io/docs/en/network-limits/).
