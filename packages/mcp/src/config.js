// Configuration for the OpenAgenda MCP POC — everything from env.
//
//   OA_MCP_MODE       local | hosted              (default: local)
//   SANDBOX_BACKEND   deno | srt | microsandbox   (default: deno locally)
//   OA_BASE_URL       v3 base URL                 (default: production)
//   OA_API_KEY        Bearer key (oa_pk_… read)   (optional; published events are public)
//   OA_SANDBOX_TIMEOUT_MS / OA_SANDBOX_MEMORY_MB   hard resource caps
//
// The mode↔backend pairing is SECURITY-CRITICAL, not a free toggle (see README):
//   - local  → `deno` (dev engine) or `srt` (hardened local). Bounded trust only.
//   - hosted → `microsandbox` ONLY. The hard, multi-tenant boundary.
// We FAIL CLOSED: a hosted server refuses to boot on a non-microsandbox backend,
// so a stray env var can never downgrade the public surface to a guardrail.

const MODES = ['local', 'hosted'];
const BACKENDS = ['deno', 'srt', 'microsandbox'];

function int(raw, fallback) {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function loadConfig(env = process.env) {
  const mode = env.OA_MCP_MODE ?? 'local';
  if (!MODES.includes(mode)) {
    throw new Error(
      `OA_MCP_MODE must be one of ${MODES.join('|')} (got "${mode}")`,
    );
  }

  const backend = env.SANDBOX_BACKEND ?? (mode === 'hosted' ? 'microsandbox' : 'deno');
  if (!BACKENDS.includes(backend)) {
    throw new Error(
      `SANDBOX_BACKEND must be one of ${BACKENDS.join('|')} (got "${backend}")`,
    );
  }

  // FAIL CLOSED — the public, multi-tenant surface MUST use the hard boundary.
  // srt/deno are guardrails for bounded-trust local use; they are NOT a hard
  // boundary against untrusted code (kernel-shared / process-level).
  if (mode === 'hosted' && backend !== 'microsandbox') {
    throw new Error(
      'Refusing to start: OA_MCP_MODE=hosted requires SANDBOX_BACKEND=microsandbox '
        + `(got "${backend}"). See README → "Hébergé / multi-tenant".`,
    );
  }

  const baseUrl = env.OA_BASE_URL ?? 'https://api.openagenda.com/v3';
  const apiHost = new URL(baseUrl).hostname;

  return {
    mode,
    backend,
    baseUrl,
    apiHost,
    apiKey: env.OA_API_KEY ?? null,
    // Egress allowlist consumed by every backend's network policy: ONLY the API host.
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
