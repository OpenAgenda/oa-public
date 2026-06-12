// Configuration for the OpenAgenda MCP server — everything from env.
//
//   OA_MCP_MODE              local | hosted                  (default: local)
//   OA_EXECUTOR              node | deno | microsandbox       (engine that runs the code;
//                                                              local default: node — Node's
//                                                              permission sandbox, no egress bound;
//                                                              deno = the scoped-egress upgrade)
//   OA_CODE_EGRESS_AUTHORITY executor | wrapper | none        (who owns the network boundary)
//   OA_LOCAL_NO_SANDBOX      1                                (bare node: disable the permission
//                                                              sandbox too; also the explicit
//                                                              egress=none ack for other engines)
//   OA_BASE_URL              v3 base URL                      (default: production)
//   OA_API_KEY               any OpenAgenda API key (Bearer)   (no anonymous read; least-privilege key advised)
//   OA_SANDBOX_TIMEOUT_MS / OA_SANDBOX_MEMORY_MB              hard resource caps
//   OA_MAX_CONCURRENCY       max simultaneous executes        (default: 4; the host-RAM guardrail)
//   OA_EXEC_MAX_QUEUE        max executes waiting for a slot   (default: OA_MAX_CONCURRENCY × 10)
//   OA_EXEC_QUEUE_TIMEOUT_MS max wait for a free slot         (default: 30000; then a retryable busy)
//   OA_RATE_LIMIT_PER_MIN    sustained execute calls/min per caller (default: 60; transport=http)
//   OA_RATE_LIMIT_BURST      execute-call burst per caller    (default: 20; token-bucket size)
//   OA_MAX_CONCURRENCY_PER_CALLER  simultaneous executes per caller (default: 2; transport=http;
//                                                              fairness cap — raise ≥ OA_MAX_CONCURRENCY + OA_EXEC_MAX_QUEUE to effectively disable)
//   OA_MICROSANDBOX_IMAGE    OCI image for the µVM runtime    (default: node:24-alpine)
//   OA_SANDBOX_RUNTIME       node | llrt                      (JS runtime INSIDE the µVM; default node)
//   OA_LLRT_BIN              host path to a static llrt binary (optional; bind-mounted for local iteration —
//                                                              unset when the image bakes llrt on PATH)
//   OA_MICROSANDBOX_POOL_SIZE  warm single-use µVM spares     (default: 0 = off; throughput optim)
//   OA_MCP_TRANSPORT         stdio | http                     (default: stdio)
//   OA_MCP_HTTP_PORT         listen port (transport=http)     (default: 8904)
//   OA_OAUTH_ISSUER          authorization server issuer      (required for transport=http)
//   OA_OAUTH_JWKS_URL        AS JWKS endpoint                 (default: <issuer>/jwks)
//   OA_MCP_RESOURCE_URL      this server's resource id (aud)  (required for transport=http)
//   OA_MCP_REQUIRED_SCOPES   space/comma list a token must hold (default: none)
//   OA_MCP_EXCHANGE_SECRET   shared secret for RFC 8693 exchange (REQUIRED for transport=http)
//   OA_OAUTH_EXCHANGE_URL    AS token-exchange endpoint       (default: <issuer>/oauth2/token-exchange)
//   OA_INSIGHT_OPS_TOKEN     InsightOps log token             (prod: ships logs + audit there; absent → stderr)
//   OA_EXECUTE_DISABLED      1                                (maintenance: refuse execute; search_docs stays up)
//   OTEL_EXPORTER_OTLP_ENDPOINT          OTLP base endpoint    (hosted: enables OTel metrics+traces+logs → Alloy; absent → off)
//   OTEL_EXPORTER_OTLP_{METRICS,TRACES,LOGS}_ENDPOINT  per-signal override (any one also enables telemetry)
//   OTEL_SERVICE_INSTANCE_ID / HOSTNAME  service.instance.id on every signal
//   OTEL_METRIC_EXPORT_INTERVAL  metric export cadence in ms (default: 15000; = rate() resolution)
//
// TWO ORTHOGONAL AXES (see README → "Execution model"):
//   - executor: WHAT runs the JS (node / deno / a microsandbox µVM).
//   - code-egress authority: WHO decides where that code may reach on the
//     network. There is exactly ONE authority — `executor` (the engine enforces
//     it: deno --allow-net / the µVM), `wrapper` (an outer sandbox like srt owns
//     it), or `none` (nobody — trusted-only).
//
// This is SECURITY-CRITICAL and we FAIL CLOSED: incoherent or unsafe pairings
// refuse to boot rather than silently degrading the boundary (see the matrix
// below). `srt` is NOT a value here — it is an outer *wrapper*, applied at launch
// (`srt -- node server.js`), selected with OA_CODE_EGRESS_AUTHORITY=wrapper.

import { existsSync, readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

const MODES = ['local', 'hosted'];
const EXECUTORS = ['node', 'deno', 'microsandbox'];
// JS runtime that runs the program INSIDE a microsandbox µVM. `node` is the
// default (broad compatibility); `llrt` is a QuickJS-based lightweight runtime
// (~½ the per-run RAM, ~3× faster warm start) — the SDK bundle (ky+zod, fetch)
// runs on it unchanged, and the µVM keeps owning egress regardless. Only
// meaningful for the microsandbox executor (node/deno run on the host directly).
const SANDBOX_RUNTIMES = ['node', 'llrt'];
const EGRESS = ['executor', 'wrapper', 'none'];
const TRANSPORTS = ['stdio', 'http'];

export const DEFAULT_HTTP_PORT = 8904;

export const DEFAULT_BASE_URL = 'https://api.openagenda.com/v3';

// Default OCI image for the microsandbox µVM runtime: the official Node Alpine
// image — minimal, `node` on PATH, anonymous pull. microsandbox caches layers
// (~/.microsandbox/layers), so it pulls once per host/version, not per µVM.
//
// Deliberately a FLOATING tag, NOT a digest pin. The µVM (not the image) is the
// security boundary, and the guest is an ephemeral substrate interpreting code
// that is already assumed hostile — so image-CVE exposure is contained and
// lower-stakes than for a normal service. WITHOUT CI/Renovate to bump it, a hard
// digest pin would silently ROT (stale + unpatched while looking "locked down"),
// whereas a floating tag picks up upstream security rebuilds on each fresh pull,
// maintenance-free. Reproducibility of a throwaway guest is low value here.
//
// PRODUCTION with a refresh process: DO pin a digest (supply-chain + reproducibility).
// Resolve the MULTI-ARCH index digest — not a platform manifest, so it works on
// x86_64 AND arm64/Apple Silicon:
//   docker buildx imagetools inspect node:24-alpine   # → Digest: sha256:… (oci.image.index)
// then OA_MICROSANDBOX_IMAGE=node:24-alpine@sha256:…  (the amd64 child digest shown
// on Docker Hub's "layers" UI would break Apple Silicon — use the index digest).
// If a host hits the Docker Hub anon rate-limit, use the un-rate-limited official
// mirror public.ecr.aws/docker/library/node:24-alpine. (Avoid chainguard/node —
// `:latest`-only free tier, unpinnable — and distroless — `node` not on PATH.)
export const DEFAULT_MICROSANDBOX_IMAGE = 'node:24-alpine';

/** Derive the API host from the base URL (the egress allowlist is just this host). */
export function apiHostFromBaseUrl(baseUrl) {
  try {
    return new URL(baseUrl).hostname;
  } catch {
    throw new Error(`OA_BASE_URL must be a valid URL (got "${baseUrl}")`);
  }
}

/** The egress allowlist for a given env — the API host only. Used by the server and the CLI. */
export function allowNetFromEnv(env = process.env) {
  return [apiHostFromBaseUrl(env.OA_BASE_URL ?? DEFAULT_BASE_URL)];
}

/**
 * The executed code's ACTUAL isolation, derived from a resolved config — the
 * single source the tool description (toolDefs.js) uses so the card and
 * tools/list never overstate the boundary. `egressBounded`: an authority other
 * than `none` confines the network (deno --allow-net, the µVM, or an outer
 * wrapper). `fsBounded`: every engine confines the filesystem EXCEPT bare node
 * (node without the permission sandbox).
 * @param {Pick<ReturnType<typeof loadConfig>, 'executor'|'egressAuthority'|'nodePermission'>} config
 */
export function sandboxFacts({ executor, egressAuthority, nodePermission }) {
  return {
    egressBounded: egressAuthority !== 'none',
    fsBounded: executor !== 'node' || nodePermission,
  };
}

function int(raw, fallback) {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function oneOf(value, allowed, varName) {
  if (!allowed.includes(value)) {
    throw new Error(
      `${varName} must be one of ${allowed.join('|')} (got "${value}")`,
    );
  }
  return value;
}

// The fail-closed validity matrix. Throws on every refused pairing with a
// message that says how to fix it. Order matters: the broad hosted gate first,
// then the specific impossible/unsupported/unsafe combos. See README for the table.
function validateCombo({
  mode,
  executor,
  egressAuthority,
  localNoSandbox,
  transport,
}) {
  // The http transport is network-facing (a standalone OAuth resource server,
  // reachable by any authenticated caller, minting a per-caller aud=api token
  // into the sandbox). An UNBOUNDED-egress default is fail-OPEN there: a
  // prompt-injected script could exfiltrate that token to any host. The
  // node-first local default (node+none) is fine for the stdio personal model
  // but must NOT silently carry over to http — require a bounded executor
  // (deno/microsandbox/wrapper) or the explicit OA_LOCAL_NO_SANDBOX ack. Checked
  // first so the network-facing footgun fails closed before the looser local
  // allowances below. (Production hosted is already forced to microsandbox; this
  // guards the self-hosted operator who runs http but forgets OA_MCP_MODE.)
  if (transport === 'http' && egressAuthority === 'none' && !localNoSandbox) {
    throw new Error(
      'Refusing to start: OA_MCP_TRANSPORT=http with code egress=none is fail-open — a '
        + "network-facing server would let executed code exfiltrate the caller's token to "
        + 'any host. Bound egress with OA_EXECUTOR=deno (or microsandbox for the public '
        + 'surface), run under an egress wrapper (OA_CODE_EGRESS_AUTHORITY=wrapper), or — for '
        + 'a trusted single-tenant box only — acknowledge explicitly with OA_LOCAL_NO_SANDBOX=1.',
    );
  }

  // Hosted is the public, multi-tenant surface: the ONLY safe pairing is the
  // hardware-isolated µVM owning its own egress. Anything else is refused.
  if (
    mode === 'hosted'
    && !(executor === 'microsandbox' && egressAuthority === 'executor')
  ) {
    throw new Error(
      'Refusing to start: OA_MCP_MODE=hosted requires OA_EXECUTOR=microsandbox with '
        + 'OA_CODE_EGRESS_AUTHORITY=executor (the hard multi-tenant boundary). Got '
        + `executor="${executor}", egress="${egressAuthority}". See README → "Execution model".`,
    );
  }

  // node is refused as its own egress authority BY POLICY: Node's permission
  // model cannot scope egress (Node 24 has no network permission at all; Node
  // 25's --allow-net is all-or-nothing, not host-scoped). Use a real boundary.
  if (executor === 'node' && egressAuthority === 'executor') {
    throw new Error(
      "OA_EXECUTOR=node cannot own egress: Node's permission model cannot scope the network "
        + "(24 doesn't cover it; 25's --allow-net is all-or-nothing). Run it under an outer "
        + 'sandbox (OA_CODE_EGRESS_AUTHORITY=wrapper, e.g. `srt -- node server.js`), use '
        + 'OA_EXECUTOR=deno, or accept the unbounded-egress local default (egress=none).',
    );
  }

  // A µVM already owns the hard boundary; wrapping it in a process-level sandbox
  // (srt) both breaks it (seccomp denies the KVM/device primitives) and is
  // redundant. Hardening the orchestrator under srt is a SEPARATE scope.
  if (executor === 'microsandbox' && egressAuthority === 'wrapper') {
    throw new Error(
      'OA_EXECUTOR=microsandbox must not run under an egress wrapper: the µVM already owns '
        + 'the boundary, and a process-level sandbox blocks the virtualization it needs. Use '
        + 'OA_CODE_EGRESS_AUTHORITY=executor. (To harden the orchestrator itself, launch the '
        + 'whole MCP under srt — that is a separate scope, not this setting.)',
    );
  }

  // A µVM owns its egress unconditionally; pairing it with `none` would boot fine
  // but then fail EVERY execute at run time (the executor asserts egress=executor).
  // Reject it centrally so the incoherence surfaces at startup, not per-call.
  if (executor === 'microsandbox' && egressAuthority === 'none') {
    throw new Error(
      'OA_EXECUTOR=microsandbox requires OA_CODE_EGRESS_AUTHORITY=executor: the µVM owns its '
        + 'egress and refuses to run without it (egress=none would start but fail every execute).',
    );
  }

  // `none` disables every network boundary on the executed code. Acceptable in
  // LOCAL mode only, and only when something still bounds the process: the node
  // engine (which self-applies Node's permission sandbox — fs/subprocess denied
  // — unless OA_LOCAL_NO_SANDBOX opts out of that too; see nodeExecutor.js), or
  // any engine with the explicit OA_LOCAL_NO_SANDBOX=1 acknowledgement. Never a
  // silent default elsewhere.
  if (
    egressAuthority === 'none'
    && !(mode === 'local' && (executor === 'node' || localNoSandbox))
  ) {
    throw new Error(
      'OA_CODE_EGRESS_AUTHORITY=none disables every network boundary on the executed code. '
        + 'Allowed only with OA_MCP_MODE=local, and only for the node engine (whose permission '
        + 'sandbox still bounds fs/subprocess) or with OA_LOCAL_NO_SANDBOX=1 (explicit acknowledgement).',
    );
  }
}

/** Parse a space/comma-separated scope list into a deduped array (empty → []). */
function parseScopes(raw) {
  if (!raw) return [];
  return [...new Set(raw.split(/[\s,]+/).filter(Boolean))];
}

// The resource scopes the contract actually uses: every `oauth2` security
// requirement across the spec's operations, plus the document-level default.
// Derived (not hand-maintained) so the PRM and the DCR client track the
// contract — before this, `me:read` shipped in the spec while the hand-kept
// list here silently omitted it, and /me/agendas was unreachable over OAuth
// (`insufficient_scope` with no way for the client to even request the scope).
// Deliberate consequence: the MCP advertises what its BUNDLED
// @openagenda/api-spec version declares, so bumping that dependency is the act
// that publishes new scopes — only do it once the production AS issues them,
// or DCR clients will request a scope the AS rejects as out-of-scope (the same
// failure mode the `offline_access` note below describes).
let cachedSpecScopes = null;
function specScopes() {
  if (cachedSpecScopes) return cachedSpecScopes;
  const specUrl = import.meta.resolve('@openagenda/api-spec/openapi.yaml');
  const spec = parseYaml(readFileSync(new URL(specUrl), 'utf8'));
  const securities = [
    ...spec.security ?? [],
    ...Object.values(spec.paths ?? {})
      .flatMap((path) => Object.values(path))
      .flatMap((op) => op?.security ?? []),
  ];
  cachedSpecScopes = [
    ...new Set(securities.flatMap((req) => req.oauth2 ?? [])),
  ].sort();
  return cachedSpecScopes;
}

// Resolve and validate the OAuth resource-server config for the HTTP transport.
// FAIL CLOSED: transport=http with no issuer/resource would expose an
// unauthenticated MCP endpoint, so refuse to boot rather than degrade. Returns
// null for the stdio transport (no OAuth — local/key model).
function loadOAuth(transport, env) {
  if (transport !== 'http') return null;

  const issuer = env.OA_OAUTH_ISSUER;
  const resourceUrl = env.OA_MCP_RESOURCE_URL;
  const exchangeSecret = env.OA_MCP_EXCHANGE_SECRET;
  if (!issuer) {
    throw new Error(
      'OA_MCP_TRANSPORT=http requires OA_OAUTH_ISSUER (the authorization server '
        + 'issuer, e.g. https://d.openagenda.com/api/auth) — refusing to expose an '
        + 'unauthenticated MCP server.',
    );
  }
  if (!resourceUrl) {
    throw new Error(
      "OA_MCP_TRANSPORT=http requires OA_MCP_RESOURCE_URL (this server's OAuth "
        + 'resource identifier / audience, e.g. https://dmcp.openagenda.com/mcp) so '
        + 'issued tokens can be audience-bound (RFC 8707) and verified locally.',
    );
  }
  // Reject malformed URLs early (issuer + resource are load-bearing for JWKS
  // fetch and audience checks); the JWKS endpoint defaults to <issuer>/jwks.
  for (const [name, value] of [
    ['OA_OAUTH_ISSUER', issuer],
    ['OA_MCP_RESOURCE_URL', resourceUrl],
  ]) {
    try {
      // eslint-disable-next-line no-new
      new URL(value);
    } catch {
      throw new Error(`${name} must be a valid URL (got "${value}")`);
    }
  }
  // Token-exchange (O2.5) is the SINGLE delegation model — FAIL CLOSED without
  // its secret. The AS tightens v3 to `aud=api`, so a server that can't exchange
  // would have every v3 call rejected; refuse to boot rather than serve a broken
  // (or token-leaking B2) path. Pair with the node container's OA_MCP_EXCHANGE_SECRET.
  if (!exchangeSecret) {
    throw new Error(
      'OA_MCP_TRANSPORT=http requires OA_MCP_EXCHANGE_SECRET (the shared secret '
        + 'for RFC 8693 token-exchange — same value as the auth service). Without '
        + 'it the server cannot mint the aud=api token v3 trusts, so every call '
        + 'would fail. Generate one with `openssl rand -hex 32`.',
    );
  }

  return {
    issuer,
    resourceUrl,
    jwksUrl: env.OA_OAUTH_JWKS_URL ?? `${issuer.replace(/\/$/, '')}/jwks`,
    requiredScopes: parseScopes(env.OA_MCP_REQUIRED_SCOPES),
    // O2.5 token-exchange (RFC 8693) — the SINGLE delegation model (no B2). Every
    // request swaps the caller's `aud=mcp` token for a short `aud=api` token at
    // the AS BEFORE the sandbox, so the full consented grant never reaches
    // executed (untrusted) code. Always present for http (secret enforced above).
    // The MCP authenticates as a confidential client (client_secret_basic); its
    // `client_id` (default `mcp`) must match a registry entry on the AS side.
    exchange: {
      url:
        env.OA_OAUTH_EXCHANGE_URL
        ?? `${issuer.replace(/\/$/, '')}/oauth2/token-exchange`,
      clientId: env.OA_MCP_EXCHANGE_CLIENT_ID ?? 'mcp',
      secret: exchangeSecret,
    },
    // Advertised in the PRM. MCP clients (Claude, etc.) register dynamically
    // with exactly these scopes, so the list doubles as the DCR scope set:
    //   - the resource scopes are DERIVED from the contract (see specScopes),
    //     so a scope that ships with a new endpoint (e.g. `me:read` with
    //     /me/agendas) reaches the PRM without a hand-maintained list here.
    //   - `openid` identifies the user; `offline_access` is NOT a resource
    //     scope, but required here so the DCR client is registered with it —
    //     otherwise the client requests `offline_access` at /authorize (to
    //     obtain a refresh token, hence its `refresh_token` grant) and the AS
    //     rejects it as out-of-scope.
    scopesSupported: ['openid', 'offline_access', ...specScopes()],
  };
}

export function loadConfig(env = process.env) {
  const mode = oneOf(env.OA_MCP_MODE ?? 'local', MODES, 'OA_MCP_MODE');

  const localNoSandbox = env.OA_LOCAL_NO_SANDBOX === '1' || env.OA_LOCAL_NO_SANDBOX === 'true';

  // Defaults are derived from the mode: local → node (zero-install — the engine
  // self-applies Node's permission sandbox, fs/subprocess denied, but has NO
  // egress boundary, see nodeExecutor.js; index.js banners it at boot), hosted →
  // microsandbox (hard µVM). deno (scoped egress) is the recommended local
  // hardening, one OA_EXECUTOR=deno away. OA_LOCAL_NO_SANDBOX no longer shifts
  // the executor default (node already IS the default); it now means "bare node"
  // — it disables the permission sandbox (nodePermission below) and remains the
  // explicit egress=none acknowledgement for non-node engines.
  const executor = oneOf(
    env.OA_EXECUTOR ?? (mode === 'hosted' ? 'microsandbox' : 'node'),
    EXECUTORS,
    'OA_EXECUTOR',
  );
  // Default egress follows the engine: deno/microsandbox own it (`executor`);
  // node cannot (no host-scoped network permission), so its default is `none` —
  // validateCombo allows that pairing for the local node engine specifically.
  const egressAuthority = oneOf(
    env.OA_CODE_EGRESS_AUTHORITY ?? (executor === 'node' ? 'none' : 'executor'),
    EGRESS,
    'OA_CODE_EGRESS_AUTHORITY',
  );

  // Resolved BEFORE validateCombo: the network-facing http transport tightens
  // the egress matrix (a silent unbounded-egress default is fail-open there).
  const transport = oneOf(
    env.OA_MCP_TRANSPORT ?? 'stdio',
    TRANSPORTS,
    'OA_MCP_TRANSPORT',
  );
  // Resolve OAuth BEFORE the safety matrix so an operator gets the more
  // fundamental "your http config is incomplete" error (missing issuer/resource/
  // secret) before the egress-posture one. Returns null for stdio.
  const oauth = loadOAuth(transport, env);

  validateCombo({ mode, executor, egressAuthority, localNoSandbox, transport });

  // JS runtime inside the µVM (microsandbox only). `llrt` swaps node for a
  // lightweight QuickJS-based runtime (~½ the RAM, ~3× faster warm start); the SDK
  // bundle runs on it unchanged and the µVM still owns egress. Two ways to provide
  // the binary: bake it into the image (the prod path — OA_MICROSANDBOX_IMAGE points
  // at an image with `llrt` on PATH, see llrt.Dockerfile) and leave OA_LLRT_BIN
  // unset; or, for local iteration, set OA_LLRT_BIN to a host path to a static llrt
  // binary, which the executor bind-mounts read-only. FAIL CLOSED on the one thing
  // that can't work: llrt without the µVM (it's the in-µVM runtime, not a host engine).
  const sandboxRuntime = oneOf(
    env.OA_SANDBOX_RUNTIME ?? 'node',
    SANDBOX_RUNTIMES,
    'OA_SANDBOX_RUNTIME',
  );
  const llrtBin = env.OA_LLRT_BIN ?? null;
  const microsandboxImage = env.OA_MICROSANDBOX_IMAGE ?? DEFAULT_MICROSANDBOX_IMAGE;
  if (sandboxRuntime === 'llrt') {
    // FAIL CLOSED on llrt misconfig that would boot fine but break EVERY execute.
    if (executor !== 'microsandbox') {
      throw new Error(
        'OA_SANDBOX_RUNTIME=llrt requires OA_EXECUTOR=microsandbox: llrt is the JS '
          + `runtime INSIDE the µVM, not a host engine (got executor="${executor}").`,
      );
    }
    // llrt must actually be PRESENT in the µVM: either baked into a custom image
    // (OA_MICROSANDBOX_IMAGE on PATH) or bind-mounted from the host (OA_LLRT_BIN).
    // The default image is node-only — with neither, every execute fails
    // `llrt: not found`. Catch it at boot, not per-request.
    if (!llrtBin && microsandboxImage === DEFAULT_MICROSANDBOX_IMAGE) {
      throw new Error(
        'OA_SANDBOX_RUNTIME=llrt needs an llrt binary in the µVM: set '
          + 'OA_MICROSANDBOX_IMAGE to an image with llrt on PATH (see llrt.Dockerfile), '
          + 'or OA_LLRT_BIN to a host path to a static llrt binary.',
      );
    }
    // A bind-mounted binary that doesn't exist fails opaquely at µVM start on the
    // first request; surface the bad path at boot instead.
    if (llrtBin && !existsSync(llrtBin)) {
      throw new Error(
        `OA_LLRT_BIN does not exist: "${llrtBin}". Point it at a static llrt binary.`,
      );
    }
  }

  const baseUrl = env.OA_BASE_URL ?? DEFAULT_BASE_URL;
  const apiHost = apiHostFromBaseUrl(baseUrl);

  // Simultaneous-run cap, used to size both the active limit and the derived
  // overflow queue below. int() floors it at >0, so it can never disable the cap.
  const maxConcurrency = int(env.OA_MAX_CONCURRENCY, 4);

  return {
    mode,
    executor,
    egressAuthority,
    localNoSandbox,
    // The node engine self-applies Node's permission model to the child
    // (--permission: fs/subprocess/workers/addons denied — egress stays
    // UNbounded, see nodeExecutor.js). OA_LOCAL_NO_SANDBOX is the explicit
    // opt-out (bare node). Meaningless for the other engines.
    nodePermission: executor === 'node' && !localNoSandbox,
    transport,
    httpPort: int(env.OA_MCP_HTTP_PORT, DEFAULT_HTTP_PORT),
    // OAuth resource-server config (transport=http only; null for stdio).
    oauth,
    baseUrl,
    apiHost,
    apiKey: env.OA_API_KEY ?? null,
    // OCI image the microsandbox executor boots the µVM from (ignored by node/deno).
    microsandboxImage,
    // JS runtime inside the µVM: 'node' (default) or 'llrt'. `llrtBin` is the host
    // path to the static llrt binary, bind-mounted read-only (microsandbox only).
    sandboxRuntime,
    llrtBin,
    // Warm single-use µVM spares to pre-boot (microsandbox only; 0 = off). A
    // throughput optimization for the hosted surface — takes the ~74%-of-latency
    // create step off the hot path, at the cost of each spare's RAM. See
    // docs/microsandbox.md → "Pooling & sizing".
    microsandboxPoolSize: int(env.OA_MICROSANDBOX_POOL_SIZE, 0),
    // Egress allowlist consumed by the executor (when it owns egress) and by the
    // emitted wrapper policy (when the wrapper does): ONLY the API host.
    allowNet: [apiHost],
    limits: {
      timeoutMs: int(env.OA_SANDBOX_TIMEOUT_MS, 5000),
      memoryMb: int(env.OA_SANDBOX_MEMORY_MB, 256),
    },
    // Concurrency guardrail (concurrencyLimit.js wraps the executor): cap the
    // number of simultaneous runs so a burst can't spawn unbounded sandboxes and
    // OOM the host (≈116 MiB per µVM run). Default 4 → ≈460 MiB worst-case µVM.
    // The overflow queue DEFAULT is derived (×10) so it auto-scales with the cap
    // and stays zero-config — a queued run only holds its code string (~KB), so
    // it isn't a memory bound. It's still overridable (OA_EXEC_MAX_QUEUE) for
    // operators who want to tune backpressure independently of the cap: fail fast
    // at high concurrency, or buffer a bigger burst at low concurrency.
    maxConcurrency,
    execMaxQueue: int(env.OA_EXEC_MAX_QUEUE, maxConcurrency * 10),
    execQueueTimeoutMs: int(env.OA_EXEC_QUEUE_TIMEOUT_MS, 30000),
    // Per-caller sustained-rate guardrail (rateLimiter.js, transport=http only):
    // a token bucket keyed on the OAuth `sub` so one caller can't monopolise the
    // shared execution budget over time. `burst` is the bucket size (a natural
    // burst of calls in one agent step); `perMin` the refill (sustained rate).
    // int() floors both at >0 — the limit can't be silently disabled.
    rateLimit: {
      perMin: int(env.OA_RATE_LIMIT_PER_MIN, 60),
      burst: int(env.OA_RATE_LIMIT_BURST, 20),
    },
    // Per-caller concurrency cap (callerConcurrency.js, transport=http only): the
    // max runs ONE caller may hold in the execute pipeline at once (running OR
    // waiting in the global queue), so a single tenant can't grab every global
    // slot (maxConcurrency) and starve the rest — a fairness guard on top of the
    // global resource-safety cap. Default 2 lets an agent run a little in parallel
    // while leaving slots for others. int() floors it at >0 (never a lockout). To
    // effectively disable it, raise it past what one caller could ever hold in the
    // global pipeline (≥ maxConcurrency + execMaxQueue); at = maxConcurrency a lone
    // caller still gets a caller_busy instead of queuing once it holds that many.
    maxConcurrencyPerCaller: int(env.OA_MAX_CONCURRENCY_PER_CALLER, 2),
    // Observability — TWO independent channels, by role:
    //  - LOGS/audit (here): structured operational logs + a per-tool audit trail
    //    via @openagenda/logs (see log.js). `insightOpsToken` (OA_INSIGHT_OPS_TOKEN)
    //    adds the InsightOps sink (prod); stderr is gated separately by the standard
    //    `DEBUG=openagenda-mcp*` env var (the dev lever) — not by config.
    //  - TELEMETRY (below, see telemetry.js): our own OTel metrics + traces + logs
    //    pushed over OTLP to the host Alloy → Mimir/Tempo/Loki. Distinct system from
    //    the InsightOps audit log on purpose (logs go to BOTH); HOST resource metrics
    //    (CPU/RAM/KVM) stay a node_exporter scrape.
    logging: {
      insightOpsToken: env.OA_INSIGHT_OPS_TOKEN ?? null,
    },
    // OTel telemetry (metrics + traces + logs), enabled only in HOSTED mode AND when
    // an OTLP endpoint is configured (else fully off — see telemetry.js). The mode
    // gate matters because OTEL_EXPORTER_OTLP_ENDPOINT is a standard, frequently-
    // inherited env var: a local/stdio run that happens to inherit it must NOT
    // silently start a pipeline (background timers + egress) — stdio is "off" by
    // contract. Any signal endpoint (base or per-signal) flips it on; each exporter
    // reads OTEL_EXPORTER_OTLP_* itself, we only gate enablement and carry the
    // instance label. `enabled` also drives @openagenda/logs's OTel transport (log.js).
    telemetry: {
      enabled:
        mode === 'hosted'
        && Boolean(
          env.OTEL_EXPORTER_OTLP_ENDPOINT
            || env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
            || env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
            || env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
        ),
      serviceInstance: env.OTEL_SERVICE_INSTANCE_ID ?? env.HOSTNAME ?? null,
    },
    // Maintenance kill: refuse `execute` (search_docs stays served). Read once at
    // boot, so flipping it takes a process restart (not a code change, and not a
    // hot toggle — an already-connected stdio session keeps its old value).
    // Per-caller banning is deliberately NOT a local denylist: that belongs at the
    // AS (grant revocation).
    executeDisabled: env.OA_EXECUTE_DISABLED === '1',
    // TLS trust for the sandboxed runtime. OFF by default → neutral in
    // production (api.openagenda.com has a public CA). DEV-only: dapi serves a
    // private CA (O=OADEV), unknown to Node's bundled roots — set one of these.
    tls: {
      useSystemCa:
        env.OA_USE_SYSTEM_CA === '1' || env.OA_USE_SYSTEM_CA === 'true',
      extraCaCerts: env.OA_EXTRA_CA_CERTS ?? null, // path to a PEM CA bundle
    },
  };
}
