// Configuration for the OpenAgenda MCP POC — everything from env.
//
//   OA_MCP_MODE              local | hosted                  (default: local)
//   OA_EXECUTOR              node | deno | microsandbox       (engine that runs the code)
//   OA_CODE_EGRESS_AUTHORITY executor | wrapper | none        (who owns the network boundary)
//   OA_LOCAL_NO_SANDBOX      1                                (one-flag unsafe local node path;
//                                                              also the explicit egress=none ack)
//   OA_BASE_URL              v3 base URL                      (default: production)
//   OA_API_KEY               Bearer key (oa_pk_… read)        (no anonymous read; OAuth later)
//   OA_SANDBOX_TIMEOUT_MS / OA_SANDBOX_MEMORY_MB              hard resource caps
//   OA_MICROSANDBOX_IMAGE    OCI image for the µVM runtime    (default: node:24-alpine)
//   OA_MICROSANDBOX_POOL_SIZE  warm single-use µVM spares     (default: 0 = off; throughput optim)
//   OA_MCP_TRANSPORT         stdio | http                     (default: stdio)
//   OA_MCP_HTTP_PORT         listen port (transport=http)     (default: 8904)
//   OA_OAUTH_ISSUER          authorization server issuer      (required for transport=http)
//   OA_OAUTH_JWKS_URL        AS JWKS endpoint                 (default: <issuer>/jwks)
//   OA_MCP_RESOURCE_URL      this server's resource id (aud)  (required for transport=http)
//   OA_MCP_REQUIRED_SCOPES   space/comma list a token must hold (default: none)
//   OA_MCP_EXCHANGE_SECRET   shared secret for RFC 8693 exchange (REQUIRED for transport=http)
//   OA_OAUTH_EXCHANGE_URL    AS token-exchange endpoint       (default: <issuer>/oauth2/token-exchange)
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

const MODES = ['local', 'hosted'];
const EXECUTORS = ['node', 'deno', 'microsandbox'];
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
function validateCombo({ mode, executor, egressAuthority, localNoSandbox }) {
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

  // node is refused as its own egress authority BY POLICY: this project does not
  // treat Node's process-level permission model as a hard egress boundary (and on
  // Node 24 there is no network permission at all). Use a real boundary instead.
  if (executor === 'node' && egressAuthority === 'executor') {
    throw new Error(
      "OA_EXECUTOR=node cannot own egress: this project does not treat Node's permission "
        + 'model as a hard network boundary (and Node 24 has none anyway). Run it under an '
        + 'outer sandbox (OA_CODE_EGRESS_AUTHORITY=wrapper, e.g. `srt -- node server.js`), or '
        + '— for trusted local use only, with NO boundary — OA_LOCAL_NO_SANDBOX=1.',
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

  // `none` disables every network boundary on the executed code. Only ever
  // acceptable for explicit, local, trusted use — never a silent default.
  if (egressAuthority === 'none' && !(mode === 'local' && localNoSandbox)) {
    throw new Error(
      'OA_CODE_EGRESS_AUTHORITY=none disables every network boundary on the executed code. '
        + 'Allowed only with OA_MCP_MODE=local AND OA_LOCAL_NO_SANDBOX=1 (explicit acknowledgement).',
    );
  }
}

/** Parse a space/comma-separated scope list into a deduped array (empty → []). */
function parseScopes(raw) {
  if (!raw) return [];
  return [...new Set(raw.split(/[\s,]+/).filter(Boolean))];
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
    //   - `openid` + the v3 read vocabulary: the resource scopes an OAuth token
    //     may carry while O2 is read-only.
    //   - `offline_access`: NOT a resource scope, but required here so the DCR
    //     client is registered with it — otherwise the client requests
    //     `offline_access` at /authorize (to obtain a refresh token, hence its
    //     `refresh_token` grant) and the AS rejects it as out-of-scope.
    scopesSupported: [
      'openid',
      'offline_access',
      'events:read',
      'agendas:read',
      'locations:read',
      'members:read',
    ],
  };
}

export function loadConfig(env = process.env) {
  const mode = oneOf(env.OA_MCP_MODE ?? 'local', MODES, 'OA_MCP_MODE');

  const localNoSandbox = env.OA_LOCAL_NO_SANDBOX === '1' || env.OA_LOCAL_NO_SANDBOX === 'true';

  // OA_LOCAL_NO_SANDBOX is the one-flag personal shorthand AND the explicit
  // acknowledgement that egress=none has no boundary. When set (local), it
  // shifts the per-axis DEFAULTS to the zero-install node path (node + none) so
  // `OA_LOCAL_NO_SANDBOX=1 node src/index.js` just works; explicit OA_EXECUTOR /
  // OA_CODE_EGRESS_AUTHORITY still win per axis (never silently overridden).
  const unsafeLocal = mode === 'local' && localNoSandbox;

  // Defaults are derived from the mode so an operator who sets nothing is safe:
  // local → deno (self-contained boundary), hosted → microsandbox (hard µVM).
  // The no-sandbox flag shifts the local default to the zero-install node path.
  const localDefaultExecutor = unsafeLocal ? 'node' : 'deno';
  const executor = oneOf(
    env.OA_EXECUTOR
      ?? (mode === 'hosted' ? 'microsandbox' : localDefaultExecutor),
    EXECUTORS,
    'OA_EXECUTOR',
  );
  // Default: the engine owns egress (valid for both default executors), unless
  // the no-sandbox flag asked for the boundary-less path.
  const egressAuthority = oneOf(
    env.OA_CODE_EGRESS_AUTHORITY ?? (unsafeLocal ? 'none' : 'executor'),
    EGRESS,
    'OA_CODE_EGRESS_AUTHORITY',
  );

  validateCombo({ mode, executor, egressAuthority, localNoSandbox });

  // Transport is orthogonal to the executor/egress matrix above: stdio (local,
  // API-key model) or http (standalone OAuth resource server). The executor
  // boundary is governed by validateCombo regardless of transport.
  const transport = oneOf(
    env.OA_MCP_TRANSPORT ?? 'stdio',
    TRANSPORTS,
    'OA_MCP_TRANSPORT',
  );
  const oauth = loadOAuth(transport, env);

  const baseUrl = env.OA_BASE_URL ?? DEFAULT_BASE_URL;
  const apiHost = apiHostFromBaseUrl(baseUrl);

  return {
    mode,
    executor,
    egressAuthority,
    localNoSandbox,
    transport,
    httpPort: int(env.OA_MCP_HTTP_PORT, DEFAULT_HTTP_PORT),
    // OAuth resource-server config (transport=http only; null for stdio).
    oauth,
    baseUrl,
    apiHost,
    apiKey: env.OA_API_KEY ?? null,
    // OCI image the microsandbox executor boots the µVM from (ignored by node/deno).
    microsandboxImage: env.OA_MICROSANDBOX_IMAGE ?? DEFAULT_MICROSANDBOX_IMAGE,
    // Warm single-use µVM spares to pre-boot (microsandbox only; 0 = off). A
    // throughput optimization for the hosted surface — takes the ~74%-of-latency
    // create step off the hot path, at the cost of each spare's RAM. See
    // docs/microsandbox-plan.md → "As built / Pooling".
    microsandboxPoolSize: int(env.OA_MICROSANDBOX_POOL_SIZE, 0),
    // Egress allowlist consumed by the executor (when it owns egress) and by the
    // emitted wrapper policy (when the wrapper does): ONLY the API host.
    allowNet: [apiHost],
    limits: {
      timeoutMs: int(env.OA_SANDBOX_TIMEOUT_MS, 5000),
      memoryMb: int(env.OA_SANDBOX_MEMORY_MB, 256),
    },
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
