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

| Backend (`SANDBOX_BACKEND`) | Isolation                                                                                                                                           | Use                                          | Status                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| `srt`                       | OS-level fs deny + network allowlist ([Anthropic sandbox-runtime](https://github.com/anthropic-experimental/sandbox-runtime)), runs **Node** inside | **local** (runs everywhere, Intel mac incl.) | implemented¹                                                 |
| `deno`                      | deno deny-by-default perms + wall-clock kill + heap cap                                                                                             | dev / local trusted, no srt                  | implemented²                                                 |
| `microsandbox`              | hardware-isolated micro-VM                                                                                                                          | **hosted / multi-tenant**                    | **stub** — see [sketch](src/sandbox/microsandboxExecutor.js) |

¹ requires `srt` on PATH — **no deno needed**, the runtime is Node. srt is not a
transparent interceptor: it blocks raw sockets and routes egress through a proxy
(`HTTP_PROXY`/`HTTPS_PROXY`); Node honors it via `NODE_USE_ENV_PROXY=1` (Node ≥ 24),
which the adapter sets. srt's `allowedDomains` is the single egress authority.
² requires `deno` on PATH; deno's own `--allow-net=<host>` is the (transparent) egress boundary.

## Quickstart (local)

**Prereqs:** Node ≥ 24. For the recommended local backend, [`srt`](https://github.com/anthropic-experimental/sandbox-runtime)
on PATH (runs Node inside — no deno needed). For the `deno` backend instead,
[`deno`](https://deno.com) on PATH.

```sh
yarn install
# The API needs a credential (no anonymous read): a read-only publishable key (oa_pk_…) today, OAuth later.
export OA_API_KEY=oa_pk_xxx
export OA_BASE_URL=https://dapi.openagenda.com/v3   # dev; defaults to production
node packages/mcp/src/index.js                      # speaks MCP over stdio
```

Register it with an MCP client (e.g. Claude Desktop / Claude Code):

```json
{
  "mcpServers": {
    "openagenda": {
      "command": "node",
      "args": ["/abs/path/to/packages/mcp/src/index.js"],
      "env": { "OA_API_KEY": "oa_pk_xxx", "SANDBOX_BACKEND": "srt" }
    }
  }
}
```

Then ask, e.g. _"how many upcoming events per city in agenda X?"_ — the model
calls `search_docs`, writes a script using `oa.agendas.events.facets(...)`, and `execute`
runs it in the sandbox.

### Config (env)

| Var                     | Default                                  | Meaning                                                                     |
| ----------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| `OA_MCP_MODE`           | `local`                                  | `local` \| `hosted` (gates the backend, fail-closed)                        |
| `SANDBOX_BACKEND`       | `deno` (local) / `microsandbox` (hosted) | execution backend                                                           |
| `OA_BASE_URL`           | `https://api.openagenda.com/v3`          | v3 base URL                                                                 |
| `OA_API_KEY`            | _none_                                   | Bearer key (`oa_pk_…` read-only) — auth credential (key today, OAuth later) |
| `OA_SANDBOX_TIMEOUT_MS` | `5000`                                   | hard wall-clock kill                                                        |
| `OA_SANDBOX_MEMORY_MB`  | `256`                                    | V8 heap cap                                                                 |
| `OA_USE_SYSTEM_CA`      | _off_                                    | **dev only**: trust the OS cert store (Node bundles its own)                |
| `OA_EXTRA_CA_CERTS`     | _none_                                   | **dev only**: path to an extra PEM CA bundle                                |

> **Dev TLS.** `dapi.openagenda.com` serves a **private CA** (`O=OADEV`), unknown
> to Node's bundled roots → `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Set
> `OA_USE_SYSTEM_CA=1` (the dev CA is in your system store) or
> `OA_EXTRA_CA_CERTS=docker/devinstaller/ssl/certs/ca.crt`. **Production
> (`api.openagenda.com`) needs neither** — leave them off.

---

## Hébergé / multi-tenant

**The precautions to take before this runs as a public server** — i.e. when
**anyone on the internet** can submit code that executes on **your** infra. The
local backends (`deno`, `srt`) are guardrails for bounded trust; they are **NOT**
a hard boundary against untrusted code. `config.js` **fails closed**:
`OA_MCP_MODE=hosted` refuses any backend other than `microsandbox`.

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
  Note `srt` has **no** resource limits — another reason it can't be the hosted
  backend.
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
> top — they don't come for free with any backend.

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

## What this POC deliberately does NOT do

- No `microsandbox` implementation (stub) — hosted boundary is out of scope.
- No OAuth / scopes — uses a single shared Bearer key from env (read-only,
  transitional). The key is redacted from returned error text, but it is still a
  shared ambient credential: see Auth above.
- No HTTP transport — stdio only.
- No rate-limiting, no audit log, no metadata/RFC1918 egress blocking, no
  per-call process isolation (one runaway is killed via process-group SIGKILL +
  a 1 MiB output cap, not a VM boundary).

**Do not deploy this as a public server as-is.**
