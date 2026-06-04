# @openagenda/mcp — POC

A **proof-of-concept MCP server** exposing the OpenAgenda **v3 read-only** API to
LLM clients via the **code-mode** pattern: two tools — `search_docs` (find the
right operation) and `execute` (run code against the API) — instead of one tool
per endpoint. It validates the sandbox harness on the safe read surface, ahead
of the v3 write/admin/moderation surface that the full MCP will need.

> ⚠️ **Read-only, local POC.** Not the hosted, multi-tenant server. See
> [Hébergé / multi-tenant](#hébergé--multi-tenant) before exposing anything publicly.

## Architecture

```
openapi.yaml ─▶ (docs index) ─▶ search_docs ┐
                                             ├─▶ MCP server (stdio) ─▶ SandboxExecutor ─▶ runtime
client writes JS ───────────────▶ execute ──┘                          (pluggable)
```

One narrow interface, [`SandboxExecutor`](src/sandbox/executor.js), selected by
config. ~95 % of the server is shared; only the adapter that runs the code
differs — so the **same codebase** ships a broadly-compatible local mode and a
hard multi-tenant boundary, without duplication.

| Engine (`OA_EXECUTOR`) | Runtime isolation                                          | Owns egress?              | Use                         |
| ---------------------- | ---------------------------------------------------------- | ------------------------- | --------------------------- |
| `deno`                 | deny-by-default perms + wall-clock kill + heap cap         | ✅ scoped `--allow-net`   | **local default**           |
| `node`                 | heap cap + wall-clock kill (no fs/net boundary of its own) | ❌ needs an outer wrapper | local hardened, under `srt` |
| `microsandbox`         | hardware-isolated micro-VM (own kernel)                    | ✅ (the µVM)              | **hosted / multi-tenant**   |

The **engine** is one axis; **who owns network egress** (`OA_CODE_EGRESS_AUTHORITY`)
is the other. `srt` is **not** an engine — it is the reference _wrapper_. Both
axes, the validity matrix and the fail-closed rules are in [Execution
model](#execution-model--engines-vs-isolation-wrappers) below.

## Execution model — engines vs isolation wrappers

Two orthogonal axes:

- **Execution engine** — what actually runs the submitted JS: `node` · `deno` ·
  `microsandbox`.
- **Code-egress authority** — _who_ decides where that code may reach on the
  network. There is exactly **one** authority and it must be unambiguous:
  - `executor` — the engine enforces it (deno `--allow-net=<host>`; the µVM).
  - `wrapper` — an **outer isolation layer** owns it. srt is _one
    implementation_ — Docker `--network`, gVisor or a custom proxy are others.
  - `none` — nobody enforces egress. Trusted-only.

**`srt` is a wrapper, not an engine.** It jails a process _and its whole
descendant tree_ (namespaces + seccomp + an egress proxy), so a bare engine
launched under it inherits the boundary. That is why it lives on the egress
axis, not the engine axis — `srt -- node server.js`, chosen by **whoever
deploys**, independently of the engine.

> The **MCP server itself always runs on Node.js** (you launch it with `node`).
> `OA_EXECUTOR` controls only the runtime the `execute` tool uses for _submitted_
> code — so `OA_EXECUTOR=deno` does not mean you launch the server with deno.

### Two egress scopes — do not conflate them

`OA_CODE_EGRESS_AUTHORITY` governs the **executed code** only. The
**orchestrator's** own egress is a _separate_ scope: you may run the whole MCP
process under srt as defense-in-depth while the code runs in microsandbox. That
is **not** `microsandbox + wrapper` — there the wrapper bounds _our_ process
(allowlisting only the microsandbox control endpoint), not the code's µVM. The
code-egress matrix below is about scope 1; scope 2 is a pure deployment choice.

### One authority — the validity matrix (code egress)

| engine + authority          | verdict                                                                                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deno` + `executor`         | ✅ deno scopes `--allow-net=<apiHost>` — self-contained                                                                                                                                                                                           |
| `node` + `wrapper`          | ✅ the wrapper owns egress; node honors its proxy (`NODE_USE_ENV_PROXY=1`)                                                                                                                                                                        |
| `deno` + `wrapper`          | ✅ deno runs **permissive** — it must _not_ also scope `--allow-net`, or it blocks the wrapper's proxy (macOS)                                                                                                                                    |
| `microsandbox` + `executor` | ✅ the µVM owns its egress                                                                                                                                                                                                                        |
| `node` + `executor`         | ❌ **refused by policy** — this project does not treat Node's process-level permission model as a hard egress boundary for hostile public code (and Node 24 has no network permission at all). Use a wrapper or microsandbox for a real boundary. |
| any + `none`                | ⚠️ accepted **only** with `OA_MCP_MODE=local` + an explicit `OA_LOCAL_NO_SANDBOX=1` ack — never a silent default                                                                                                                                  |
| `microsandbox` + `wrapper`  | ❌ unsupported — srt's seccomp denies the KVM/device primitives a µVM needs, and it is redundant (the µVM is already the hard boundary)                                                                                                           |
| `hosted` + anything else    | ❌ fail-closed — hosted requires `microsandbox` + `executor`                                                                                                                                                                                      |

### The wrapper is a deployment contract the app cannot verify

With `wrapper`, the boundary is a **promise the deployer makes** — the app
cannot prove srt is configured correctly. So rather than trust it, the app makes
a bad config **loud and drift-proof**:

- **Fails closed** on the ❌ rows above (refuses to boot — not a warning).
- **Emits the policy** so the deployer wraps with the app's _own_ derived
  allowlist, never a hand-copied one: `openagenda-mcp print-egress-policy`
  (`--format=srt|json`, plus a `policySha256` fingerprint).
- **Prints a boot banner** when `authority=wrapper`: "this process does not
  enforce egress itself; the wrapper must allow exactly `<apiHost>`."

### Recommended deployments

- **Local dev** → `deno` + `executor`. Self-enforcing, only needs deno; the
  default.
- **Local personal (no sandbox)** → `OA_LOCAL_NO_SANDBOX=1 node src/index.js`. One
  flag resolves to `node` + `none` (zero install). Fine for driving the tool
  yourself, but it has **no fs/network boundary** — a prompt-injected script can
  read local files and exfiltrate. Local + explicitly acknowledged only.
- **Local hardened** → `node` + `wrapper`, run under `srt` (below). Adds
  OS-level fs/proc isolation.
- **Hosted / public** → `microsandbox` + `executor` for the code; **and,
  independently**, the orchestrator under srt (allowlisting only the microsandbox
  control endpoint). Two layers, two scopes — never microsandbox-under-srt.

This model governs the **network boundary** only. Resource caps (timeout, heap)
stay the engine's + orchestrator's job; rate-limit, concurrency and audit stay
the orchestrator's — all independent of the axes above.

### Running under `srt` (the `wrapper` authority)

Emit the exact policy — don't hand-write it, so it can't drift from
`OA_BASE_URL` (and so it doesn't fall into the read footgun below):

```sh
openagenda-mcp print-egress-policy --format=srt > srt-settings.json
```

That file is a complete [srt](https://github.com/anthropic-experimental/sandbox-runtime)
settings object:

```json
{
  "network": { "allowedDomains": ["api.openagenda.com"], "deniedDomains": [] },
  "filesystem": {
    "denyRead": ["~"],
    "allowRead": [".", "/home/you/.nvm/versions/node/vXX"],
    "allowWrite": [],
    "denyWrite": []
  }
}
```

Three boundaries, and **the read one is not optional**:

- **Network** — allow-only; only the API host is reachable.
- **Write** — allow-only; nothing is writable.
- **Read** — srt allows reads **everywhere by default** (deny-then-allow). An
  empty `denyRead` would leave `~/.ssh`, `.env`, cloud creds, etc. readable — and
  code-mode **returns the executed value to the caller**, so
  `return readFileSync('~/.ssh/id_rsa')` exfiltrates via the result channel,
  bypassing the network allowlist entirely. So the emitted policy **denies the
  home dir and re-allows only the workspace (`.`) and the runtime install root**
  (system paths like `/usr` stay readable).

> The `allowRead` runtime path is **machine-specific** (your node/deno install
> location) — regenerate the policy on each host. If you run the **deno** engine
> under srt, also re-allow deno's cache dir (`DENO_DIR`, default `~/.cache/deno`),
> which lives under the denied home.

Then launch the MCP under srt with that policy:

```sh
OA_EXECUTOR=node OA_CODE_EGRESS_AUTHORITY=wrapper \
  srt --settings srt-settings.json -- node packages/mcp/src/index.js
```

srt jails the process **and the engine it spawns**, so it is the single
authority for both egress and reads; node honors srt's proxy via
`NODE_USE_ENV_PROXY=1` (set by the engine). The same wrapping hardens the
orchestrator in a hosted deployment — there the allowlist is the microsandbox
control endpoint instead.

## Quickstart (local)

**Prereqs:** Node ≥ 24, plus [`deno`](https://deno.com) on PATH for the default
local engine. No deno? Add `OA_LOCAL_NO_SANDBOX=1` for the zero-install `node`
path (no fs/network boundary — see [Recommended deployments](#recommended-deployments)).
For the hardened `node` + `srt` setup, see [Running under srt](#running-under-srt-the-wrapper-authority).

```sh
yarn install
# The API needs a credential (no anonymous read): a read-only publishable key (oa_pk_…) today, OAuth later.
export OA_API_KEY=oa_pk_xxx
export OA_BASE_URL=https://dapi.openagenda.com/v3   # dev; defaults to production
node packages/mcp/src/index.js                      # speaks MCP over stdio (deno engine)
```

Register it with an MCP client (e.g. Claude Desktop / Claude Code):

```json
{
  "mcpServers": {
    "openagenda": {
      "command": "node",
      "args": ["/abs/path/to/packages/mcp/src/index.js"],
      "env": { "OA_API_KEY": "oa_pk_xxx" }
    }
  }
}
```

Then ask, e.g. _"how many upcoming events per city in agenda X?"_ — the model
calls `search_docs`, writes a script using `oa.agendas.events.facets(...)`, and `execute`
runs it in the sandbox.

### Config (env)

| Var                         | Default                                  | Meaning                                                                                                          |
| --------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `OA_MCP_MODE`               | `local`                                  | `local` \| `hosted` (drives defaults + fail-closed gating)                                                       |
| `OA_EXECUTOR`               | `deno` (local) / `microsandbox` (hosted) | engine: `node` \| `deno` \| `microsandbox` (see Execution model)                                                 |
| `OA_CODE_EGRESS_AUTHORITY`  | `executor`                               | who owns code egress: `executor` \| `wrapper` \| `none`                                                          |
| `OA_LOCAL_NO_SANDBOX`       | _off_                                    | one-flag unsafe local node path (`node` + `none`); also the `egress=none` ack                                    |
| `OA_BASE_URL`               | `https://api.openagenda.com/v3`          | v3 base URL                                                                                                      |
| `OA_API_KEY`                | _none_                                   | Bearer key (`oa_pk_…` read-only) — auth credential (key today, OAuth later)                                      |
| `OA_SANDBOX_TIMEOUT_MS`     | `5000`                                   | hard wall-clock kill                                                                                             |
| `OA_SANDBOX_MEMORY_MB`      | `256`                                    | V8 heap cap (node/deno) / hard µVM RAM cap (microsandbox — needs more headroom)                                  |
| `OA_MICROSANDBOX_IMAGE`     | `node:24-alpine`                         | OCI image for the µVM (microsandbox; official Node Alpine, `node` on PATH; pin a digest in prod — see config.js) |
| `OA_MICROSANDBOX_POOL_SIZE` | `0` (off)                                | warm single-use µVM spares (microsandbox; throughput optim, holds RAM — see docs/microsandbox.md)                |
| `OA_USE_SYSTEM_CA`          | _off_                                    | **dev only**: trust the OS cert store (Node bundles its own)                                                     |
| `OA_EXTRA_CA_CERTS`         | _none_                                   | **dev only**: path to an extra PEM CA bundle                                                                     |

> **Dev TLS.** `dapi.openagenda.com` serves a **private CA** (`O=OADEV`), unknown
> to Node's bundled roots → `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Set
> `OA_USE_SYSTEM_CA=1` (the dev CA is in your system store) or
> `OA_EXTRA_CA_CERTS=docker/devinstaller/ssl/certs/ca.crt`. **Production
> (`api.openagenda.com`) needs neither** — leave them off.

---

## Hébergé / multi-tenant

**The precautions to take before this runs as a public server** — i.e. when
**anyone on the internet** can submit code that executes on **your** infra. The
local setups (`deno`, or `node` under `srt`) are guardrails for bounded trust;
they are **NOT** a hard boundary against untrusted code. `config.js` **fails
closed**: `OA_MCP_MODE=hosted` requires `OA_EXECUTOR=microsandbox` with
`OA_CODE_EGRESS_AUTHORITY=executor`, and refuses everything else.

> **The microsandbox reference** (measured latency/footprint, the SNI egress
> model, image rationale, pool sizing and lifetime invariant) lives in
> [docs/microsandbox.md](docs/microsandbox.md). The engine itself is
> **implemented** (boot, host-enforced egress, hard caps), validated on a real KVM
> host; what remains before going public is the policy layer (per-caller OAuth
> token, rate-limit, audit) and ops. Run the µVM integration tests on a
> virtualization host with `OA_MSB_IT=1 yarn workspace @openagenda/mcp test`.

> **The egress allowlist is the exfiltration boundary — not the `oa` client.**
> The executed code is untrusted and shares scope with the `oa` client: it can
> read the baked-in key and call `fetch` directly — the `oa` client is no
> boundary at all. What actually keeps the key from leaving is the sandbox's
> **network egress allowlist** (deno `--allow-net`, srt `allowedDomains`), scoped
> to the API host. Harden that; the client is not a security boundary.

Each item maps to a concrete threat:

- **Arbitrary code / sandbox escape** → run every execution in an **ephemeral,
  hardware-isolated micro-VM** (microsandbox; [gVisor `--runtime=runsc`](https://gvisor.dev/)
  as a battle-tested fallback). One VM **per call**, destroyed after — never
  reused across callers. A shared-kernel container or `srt`/`deno` is **not**
  enough here.
- **Infinite loops / hangs** → **hard wall-clock kill** at the VM level (not a
  `setTimeout` inside the code — untrusted code ignores that).
- **Too-heavy processing** → **RAM + CPU + PID caps** (cgroups inside the VM).
  Note `srt` has **no** resource limits — another reason a wrapper like srt
  can't be the hosted boundary.
- **Dubious fetches / SSRF / exfiltration** → **default-deny egress with an
  allowlist of the API host only**, AND block the cloud **metadata endpoint
  `169.254.169.254`**, RFC1918 ranges and localhost. (The classic SSRF →
  cloud-credential theft.)
- **Abuse / self-DoS** → **rate-limit per token + a concurrency cap** on
  simultaneous sandboxes, with a queue. Otherwise anyone spins up thousands of
  VMs and takes your host down.
- **Privilege escalation via the API itself** → **no ambient authority**: inject
  the **caller's scoped OAuth token** into the executed code; the API enforces
  scopes server-side, so a successful run can never exceed the caller's own
  permissions. The server holds no shared secret the code can reach. This is the
  one case where OAuth is **mandatory** (see Auth below) — a shared key here lets
  any caller use, or exfiltrate, an authority valid for everyone.
- **Audit & forensics** → log every execution (caller, code, duration, outcome)
  and keep a kill-switch.
- **Supply-chain / maturity** → microsandbox is young (beta) — **pin the version**,
  review upgrades, and keep gVisor as the known fallback for the boundary.

> The sandbox is the **isolation**; it is not the whole **policy**. Egress
> allowlist, resource caps and the scoped-token model are yours to configure on
> top — they don't come for free with any engine.

### Auth: key or OAuth, orthogonal to transport

Auth method, transport and tenancy are **independent** axes — don't conflate
"hosted" with "OAuth":

- **API key** (current POC): least friction. Fine for **local** use (you run it
  with your own key) **and** for a server **a structure hosts for its own
  trusted callers** behind its own perimeter (single-tenant, private). A shared
  key is a legitimate operator choice there.
- **OAuth 2.1** (scoped per caller, planned, on `slice-auth`): **mandatory** for
  the **public + multi-tenant** case — the only configuration where a shared
  ambient secret is a real hole (any caller could use or exfiltrate it).

The right guard is therefore **not** "block the HTTP transport" but: default to
safe and require an **explicit operator opt-in** (e.g. `OA_MCP_TRUST=…`) to boot
HTTP with a shared key, so a shared key is never exposed publicly by accident.

> The POC's `OA_API_KEY` is a **shared, transitional** credential, pre-OAuth.
> The server redacts it from any error text it returns, but **do not expose this
> server publicly with a shared key** — wire OAuth first for that.

### Beyond read-only (mutations & moderation)

When the API gains write/admin/moderation, code-mode hides individual dangerous
actions inside a script — bad for approval/audit. Plan for a **hybrid**: keep
`execute` for reads/composition, and add a few **explicit, `destructiveHint`-
annotated tools gated by human approval** for the sensitive operations (delete
agenda, moderate/reject, remove member).

## Design decisions

- **Two tools, one round-trip.** Code-mode exposes `search_docs` + `execute`, not
  a third `describe_operation` (which would add an LLM↔MCP round-trip per call) —
  `search_docs` returns the signature, typed params, response shape and a runnable
  example in one shot, with detail **modulated by rank** (top hits render in full,
  the long tail compactly), so the payload stays bounded as the catalogue grows to
  dozens of operations. This mirrors the Stainless "SDK Code Mode" shape.
- **`search_docs` ranks with MiniSearch (lexical BM25), not embeddings.** For a
  tiny (dozens-of-ops), keyword-heavy catalogue queried in natural language,
  lexical search is the right tool and the industry default (Anthropic ships
  BM25 + regex for tool search out of the box; embeddings are their escape hatch
  for hundreds-to-thousands of tools). MiniSearch is the only candidate that meets
  every constraint with nothing to spare: **pure ESM, zero deps, no native binary,
  synchronous, deterministic BM25+**, with fuzzy + prefix + field boost. Notes on
  the alternatives weighed:
  - **Orama** (the only credible upgrade) adds vector/hybrid, but its offline
    in-process embedder needs a TensorFlow.js **native** backend, its core API is
    `T | Promise<T>` (async leaks into every call site), and it carries more churn.
    Revisit only if funded multilingual semantic search becomes a requirement —
    and even then via bring-your-own precomputed vectors, not `tfjs-node`.
  - **Semantic / embeddings** underperform here: the discriminating tokens are
    identifiers, param names and enum values, exactly where dense vectors dilute
    specificity vs BM25 — and multilingual stemming is moot because the indexed
    corpus is the **English** API contract, so an NL query in any language is a
    synonym/expansion problem (handled by a small curated `SYNONYMS` map + fuzzy),
    not a stemming one.
- **Fuzzy is gated to long terms** (`> 6` chars). A blanket fuzzy distance turns
  short words into false hits (`show`→`how`, `events`→`event`), surfacing the wrong
  operation; prefix matching covers partial words, fuzzy is reserved for typos in
  longer tokens.
- **Examples live as `x-codeSamples` in the OpenAPI contract** (co-located with
  each operation, also consumable by Scalar), with an auto-derived skeleton as
  fallback — so a single source serves the MCP and future reference docs.

## What this POC deliberately does NOT do

- The `microsandbox` engine (hosted µVM boundary) **is implemented** and verified
  on a real KVM host, but the surrounding hosted **policy layer is not** — no
  per-caller OAuth token, rate-limit, concurrency cap or audit log yet (the
  fail-closed gate keeps `hosted` from shipping without them). See
  [docs/microsandbox.md](docs/microsandbox.md).
- No OAuth / scopes — uses a single shared Bearer key from env (read-only,
  transitional). The key is redacted from returned error text, but it is still a
  shared ambient credential: see Auth above.
- No HTTP transport — stdio only.
- No rate-limiting, no audit log, no metadata/RFC1918 egress blocking, no
  per-call process isolation (one runaway is killed via process-group SIGKILL +
  a 1 MiB output cap, not a VM boundary).

**Do not deploy this as a public server as-is.**
