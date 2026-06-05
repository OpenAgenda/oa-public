import { loadConfig } from '../src/config.js';

// Pure unit tests for loadConfig — the security-critical bit is the FAIL-CLOSED
// validity matrix over the two axes (executor × code-egress authority). See
// README → "Execution model".

describe('loadConfig', () => {
  describe('defaults (local)', () => {
    const cfg = loadConfig({});

    it('defaults to local mode, deno executor, executor-owned egress', () => {
      expect(cfg.mode).toBe('local');
      expect(cfg.executor).toBe('deno');
      expect(cfg.egressAuthority).toBe('executor');
    });

    it('defaults to the production base URL and derives the API host', () => {
      expect(cfg.baseUrl).toBe('https://api.openagenda.com/v3');
      expect(cfg.apiHost).toBe('api.openagenda.com');
    });

    it('allowlists ONLY the API host for egress', () => {
      expect(cfg.allowNet).toEqual(['api.openagenda.com']);
    });

    it('has no API key and TLS trust off by default (prod-neutral)', () => {
      expect(cfg.apiKey).toBeNull();
      expect(cfg.tls).toEqual({ useSystemCa: false, extraCaCerts: null });
    });

    it('applies the default resource caps', () => {
      expect(cfg.limits).toEqual({ timeoutMs: 5000, memoryMb: 256 });
    });
  });

  describe('axis validation', () => {
    it('rejects an unknown mode', () => {
      expect(() => loadConfig({ OA_MCP_MODE: 'prod' })).toThrow(/OA_MCP_MODE/);
    });

    it('rejects an unknown executor', () => {
      expect(() => loadConfig({ OA_EXECUTOR: 'docker' })).toThrow(
        /OA_EXECUTOR/,
      );
    });

    it('rejects an unknown egress authority', () => {
      expect(() => loadConfig({ OA_CODE_EGRESS_AUTHORITY: 'maybe' })).toThrow(
        /OA_CODE_EGRESS_AUTHORITY/,
      );
    });
  });

  describe('valid combinations', () => {
    it('deno + executor (the local default)', () => {
      const cfg = loadConfig({ OA_EXECUTOR: 'deno' });
      expect(cfg.executor).toBe('deno');
      expect(cfg.egressAuthority).toBe('executor');
    });

    it('node + wrapper (hardened local under srt)', () => {
      const cfg = loadConfig({
        OA_EXECUTOR: 'node',
        OA_CODE_EGRESS_AUTHORITY: 'wrapper',
      });
      expect(cfg.executor).toBe('node');
      expect(cfg.egressAuthority).toBe('wrapper');
    });

    it('deno + wrapper (deno runs permissive, wrapper owns egress)', () => {
      const cfg = loadConfig({
        OA_EXECUTOR: 'deno',
        OA_CODE_EGRESS_AUTHORITY: 'wrapper',
      });
      expect(cfg.egressAuthority).toBe('wrapper');
    });

    it('node + none with an explicit no-sandbox ack', () => {
      const cfg = loadConfig({
        OA_EXECUTOR: 'node',
        OA_CODE_EGRESS_AUTHORITY: 'none',
        OA_LOCAL_NO_SANDBOX: '1',
      });
      expect(cfg.egressAuthority).toBe('none');
      expect(cfg.localNoSandbox).toBe(true);
    });
  });

  describe('OA_LOCAL_NO_SANDBOX shorthand', () => {
    it('alone resolves to the node + none personal path', () => {
      const cfg = loadConfig({ OA_LOCAL_NO_SANDBOX: '1' });
      expect(cfg.executor).toBe('node');
      expect(cfg.egressAuthority).toBe('none');
    });

    it('does not override an explicit executor (deno stays deno)', () => {
      const cfg = loadConfig({
        OA_LOCAL_NO_SANDBOX: '1',
        OA_EXECUTOR: 'deno',
      });
      expect(cfg.executor).toBe('deno'); // explicit wins per axis
    });

    it('an explicit egress=executor still wins (deno keeps its boundary)', () => {
      const cfg = loadConfig({
        OA_LOCAL_NO_SANDBOX: '1',
        OA_EXECUTOR: 'deno',
        OA_CODE_EGRESS_AUTHORITY: 'executor',
      });
      expect(cfg.egressAuthority).toBe('executor');
    });

    it('is inert in hosted mode (defaults stay microsandbox + executor)', () => {
      const cfg = loadConfig({
        OA_MCP_MODE: 'hosted',
        OA_LOCAL_NO_SANDBOX: '1',
      });
      expect(cfg.executor).toBe('microsandbox');
      expect(cfg.egressAuthority).toBe('executor');
    });
  });

  describe('fail-closed matrix', () => {
    it('refuses node + executor (Node has no network permission)', () => {
      expect(() => loadConfig({ OA_EXECUTOR: 'node' })).toThrow(
        /node cannot own egress/,
      );
    });

    it('refuses egress=none without the trusted-local ack', () => {
      expect(() =>
        loadConfig({
          OA_EXECUTOR: 'deno',
          OA_CODE_EGRESS_AUTHORITY: 'none',
        })).toThrow(/disables every network boundary/);
    });

    it('refuses egress=none even with the ack when not local', () => {
      // hosted is caught by the broader hosted gate first, but the intent holds:
      // none is never acceptable outside explicit local trust.
      expect(() =>
        loadConfig({
          OA_MCP_MODE: 'hosted',
          OA_CODE_EGRESS_AUTHORITY: 'none',
          OA_LOCAL_NO_SANDBOX: '1',
        })).toThrow();
    });

    it('refuses microsandbox + wrapper (µVM already owns the boundary)', () => {
      expect(() =>
        loadConfig({
          OA_EXECUTOR: 'microsandbox',
          OA_CODE_EGRESS_AUTHORITY: 'wrapper',
        })).toThrow(/must not run under an egress wrapper/);
    });

    it('refuses microsandbox + none even with the local no-sandbox ack', () => {
      // Would boot but fail every execute (the executor asserts egress=executor);
      // reject it centrally at startup instead of per-call.
      expect(() =>
        loadConfig({
          OA_EXECUTOR: 'microsandbox',
          OA_CODE_EGRESS_AUTHORITY: 'none',
          OA_LOCAL_NO_SANDBOX: '1',
        })).toThrow(/microsandbox requires OA_CODE_EGRESS_AUTHORITY=executor/);
    });
  });

  describe('fail-closed hosted gate', () => {
    it('hosted defaults to microsandbox + executor', () => {
      const cfg = loadConfig({ OA_MCP_MODE: 'hosted' });
      expect(cfg.executor).toBe('microsandbox');
      expect(cfg.egressAuthority).toBe('executor');
    });

    it('hosted + microsandbox + executor is allowed', () => {
      const cfg = loadConfig({
        OA_MCP_MODE: 'hosted',
        OA_EXECUTOR: 'microsandbox',
        OA_CODE_EGRESS_AUTHORITY: 'executor',
      });
      expect(cfg.executor).toBe('microsandbox');
    });

    it.each(['node', 'deno'])(
      'hosted REFUSES the weak executor %s',
      (executor) => {
        expect(() =>
          loadConfig({ OA_MCP_MODE: 'hosted', OA_EXECUTOR: executor })).toThrow(/hosted requires OA_EXECUTOR=microsandbox/);
      },
    );

    it('hosted REFUSES microsandbox with a non-executor egress authority', () => {
      expect(() =>
        loadConfig({
          OA_MCP_MODE: 'hosted',
          OA_EXECUTOR: 'microsandbox',
          OA_CODE_EGRESS_AUTHORITY: 'wrapper',
        })).toThrow(/hosted requires OA_EXECUTOR=microsandbox/);
    });
  });

  describe('TLS trust (dev only)', () => {
    it('OA_USE_SYSTEM_CA="1" turns it on', () => {
      expect(loadConfig({ OA_USE_SYSTEM_CA: '1' }).tls.useSystemCa).toBe(true);
    });

    it('OA_USE_SYSTEM_CA="true" turns it on', () => {
      expect(loadConfig({ OA_USE_SYSTEM_CA: 'true' }).tls.useSystemCa).toBe(
        true,
      );
    });

    it('any other value leaves it off', () => {
      expect(loadConfig({ OA_USE_SYSTEM_CA: 'yes' }).tls.useSystemCa).toBe(
        false,
      );
    });

    it('passes OA_EXTRA_CA_CERTS through as a path', () => {
      expect(
        loadConfig({ OA_EXTRA_CA_CERTS: '/etc/ca.pem' }).tls.extraCaCerts,
      ).toBe('/etc/ca.pem');
    });
  });

  describe('resource caps', () => {
    it('parses positive integer overrides', () => {
      const cfg = loadConfig({
        OA_SANDBOX_TIMEOUT_MS: '1500',
        OA_SANDBOX_MEMORY_MB: '128',
      });
      expect(cfg.limits).toEqual({ timeoutMs: 1500, memoryMb: 128 });
    });

    it.each(['0', '-5', 'abc', ''])(
      'falls back to the default for the invalid value %p',
      (raw) => {
        expect(
          loadConfig({ OA_SANDBOX_TIMEOUT_MS: raw }).limits.timeoutMs,
        ).toBe(5000);
      },
    );
  });

  describe('concurrency guardrail', () => {
    it('defaults to 4 concurrent runs, a ×10 queue and a 30s wait', () => {
      const cfg = loadConfig({});
      expect(cfg.maxConcurrency).toBe(4);
      expect(cfg.execMaxQueue).toBe(40);
      expect(cfg.execQueueTimeoutMs).toBe(30000);
    });

    it('derives the overflow queue default from the concurrency override', () => {
      const cfg = loadConfig({
        OA_MAX_CONCURRENCY: '8',
        OA_EXEC_QUEUE_TIMEOUT_MS: '5000',
      });
      expect(cfg.maxConcurrency).toBe(8);
      expect(cfg.execMaxQueue).toBe(80); // ×10 default
      expect(cfg.execQueueTimeoutMs).toBe(5000);
    });

    it('lets OA_EXEC_MAX_QUEUE override the queue independently of the cap', () => {
      const cfg = loadConfig({
        OA_MAX_CONCURRENCY: '8',
        OA_EXEC_MAX_QUEUE: '50',
      });
      expect(cfg.maxConcurrency).toBe(8);
      expect(cfg.execMaxQueue).toBe(50); // explicit, not the ×10 default
    });

    it('falls back to the ×10 default for an invalid OA_EXEC_MAX_QUEUE', () => {
      const cfg = loadConfig({
        OA_MAX_CONCURRENCY: '3',
        OA_EXEC_MAX_QUEUE: '0',
      });
      expect(cfg.execMaxQueue).toBe(30);
    });

    it.each(['0', '-5', 'abc', ''])(
      'floors an invalid OA_MAX_CONCURRENCY %p back to the default (never disables the cap)',
      (raw) => {
        expect(loadConfig({ OA_MAX_CONCURRENCY: raw }).maxConcurrency).toBe(4);
      },
    );
  });

  describe('rate-limit guardrail', () => {
    it('defaults to 60 calls/min with a burst of 20', () => {
      const cfg = loadConfig({});
      expect(cfg.rateLimit).toEqual({ perMin: 60, burst: 20 });
    });

    it('honours explicit OA_RATE_LIMIT_PER_MIN / OA_RATE_LIMIT_BURST', () => {
      const cfg = loadConfig({
        OA_RATE_LIMIT_PER_MIN: '120',
        OA_RATE_LIMIT_BURST: '5',
      });
      expect(cfg.rateLimit).toEqual({ perMin: 120, burst: 5 });
    });

    it.each(['0', '-5', 'abc', ''])(
      'floors an invalid value %p back to the defaults (never disables the limit)',
      (raw) => {
        const cfg = loadConfig({
          OA_RATE_LIMIT_PER_MIN: raw,
          OA_RATE_LIMIT_BURST: raw,
        });
        expect(cfg.rateLimit).toEqual({ perMin: 60, burst: 20 });
      },
    );
  });

  describe('logging', () => {
    it('has no InsightOps token by default', () => {
      expect(loadConfig({}).logging).toEqual({ insightOpsToken: null });
    });

    it('reads OA_INSIGHT_OPS_TOKEN', () => {
      const cfg = loadConfig({ OA_INSIGHT_OPS_TOKEN: 'tok-mcp' });
      expect(cfg.logging).toEqual({ insightOpsToken: 'tok-mcp' });
    });
  });

  describe('maintenance kill (OA_EXECUTE_DISABLED)', () => {
    it('is off by default', () => {
      expect(loadConfig({}).executeDisabled).toBe(false);
    });

    it('is on only for the exact flag "1"', () => {
      expect(loadConfig({ OA_EXECUTE_DISABLED: '1' }).executeDisabled).toBe(
        true,
      );
      expect(loadConfig({ OA_EXECUTE_DISABLED: 'true' }).executeDisabled).toBe(
        false,
      );
      expect(loadConfig({ OA_EXECUTE_DISABLED: '0' }).executeDisabled).toBe(
        false,
      );
    });
  });

  describe('custom base URL', () => {
    it('derives the host + egress allowlist from OA_BASE_URL (dev)', () => {
      const cfg = loadConfig({ OA_BASE_URL: 'https://dapi.openagenda.com/v3' });
      expect(cfg.apiHost).toBe('dapi.openagenda.com');
      expect(cfg.allowNet).toEqual(['dapi.openagenda.com']);
    });

    it('rejects a malformed base URL', () => {
      expect(() => loadConfig({ OA_BASE_URL: 'not a url' })).toThrow(
        /OA_BASE_URL/,
      );
    });
  });

  describe('transport', () => {
    it('defaults to stdio with no OAuth config', () => {
      const cfg = loadConfig({});
      expect(cfg.transport).toBe('stdio');
      expect(cfg.oauth).toBeNull();
    });

    it('rejects an unknown transport', () => {
      expect(() => loadConfig({ OA_MCP_TRANSPORT: 'grpc' })).toThrow(
        /OA_MCP_TRANSPORT/,
      );
    });

    // FAIL-CLOSED: http without an authorization server would expose an
    // unauthenticated MCP endpoint.
    it('refuses http without an issuer', () => {
      expect(() => loadConfig({ OA_MCP_TRANSPORT: 'http' })).toThrow(
        /OA_OAUTH_ISSUER/,
      );
    });

    it('refuses http without a resource URL', () => {
      expect(() =>
        loadConfig({
          OA_MCP_TRANSPORT: 'http',
          OA_OAUTH_ISSUER: 'https://auth.test',
        })).toThrow(/OA_MCP_RESOURCE_URL/);
    });

    it('rejects a malformed issuer / resource URL', () => {
      expect(() =>
        loadConfig({
          OA_MCP_TRANSPORT: 'http',
          OA_OAUTH_ISSUER: 'nope',
          OA_MCP_RESOURCE_URL: 'https://dmcp.test',
        })).toThrow(/OA_OAUTH_ISSUER must be a valid URL/);
    });

    // FAIL-CLOSED: token-exchange (O2.5) is the only delegation model; without
    // its secret the server can't mint the aud=api token v3 trusts.
    it('refuses http without the token-exchange secret', () => {
      expect(() =>
        loadConfig({
          OA_MCP_TRANSPORT: 'http',
          OA_OAUTH_ISSUER: 'https://auth.test',
          OA_MCP_RESOURCE_URL: 'https://dmcp.test',
        })).toThrow(/OA_MCP_EXCHANGE_SECRET/);
    });

    it('defaults the JWKS URL to <issuer>/jwks and parses scopes', () => {
      const cfg = loadConfig({
        OA_MCP_TRANSPORT: 'http',
        OA_OAUTH_ISSUER: 'https://auth.test/api/auth',
        OA_MCP_RESOURCE_URL: 'https://dmcp.test',
        OA_MCP_EXCHANGE_SECRET: 'test-exchange-secret',
        OA_MCP_REQUIRED_SCOPES: 'events:read, openid',
      });
      expect(cfg.transport).toBe('http');
      expect(cfg.httpPort).toBe(8904);
      expect(cfg.oauth.jwksUrl).toBe('https://auth.test/api/auth/jwks');
      expect(cfg.oauth.requiredScopes).toEqual(['events:read', 'openid']);
    });

    it('defaults the exchange endpoint to <issuer>/oauth2/token-exchange', () => {
      const cfg = loadConfig({
        OA_MCP_TRANSPORT: 'http',
        OA_OAUTH_ISSUER: 'https://auth.test/api/auth',
        OA_MCP_RESOURCE_URL: 'https://dmcp.test',
        OA_MCP_EXCHANGE_SECRET: 'test-exchange-secret',
      });
      expect(cfg.oauth.exchange).toEqual({
        url: 'https://auth.test/api/auth/oauth2/token-exchange',
        clientId: 'mcp',
        secret: 'test-exchange-secret',
      });
    });

    it('honours an explicit JWKS URL and HTTP port', () => {
      const cfg = loadConfig({
        OA_MCP_TRANSPORT: 'http',
        OA_OAUTH_ISSUER: 'https://auth.test',
        OA_MCP_RESOURCE_URL: 'https://dmcp.test',
        OA_MCP_EXCHANGE_SECRET: 'test-exchange-secret',
        OA_OAUTH_JWKS_URL: 'https://auth.test/custom-jwks',
        OA_MCP_HTTP_PORT: '9999',
      });
      expect(cfg.oauth.jwksUrl).toBe('https://auth.test/custom-jwks');
      expect(cfg.httpPort).toBe(9999);
    });
  });

  describe('sandbox runtime (OA_SANDBOX_RUNTIME / OA_LLRT_BIN)', () => {
    it('defaults to the node runtime, no llrt binary', () => {
      const cfg = loadConfig({});
      expect(cfg.sandboxRuntime).toBe('node');
      expect(cfg.llrtBin).toBeNull();
    });

    it('accepts llrt in the µVM with an image that bakes llrt; llrtBin optional', () => {
      const cfg = loadConfig({
        OA_EXECUTOR: 'microsandbox',
        OA_CODE_EGRESS_AUTHORITY: 'executor',
        OA_SANDBOX_RUNTIME: 'llrt',
        OA_MICROSANDBOX_IMAGE: 'oa-mcp-llrt:test', // non-default → llrt assumed on PATH
      });
      expect(cfg.sandboxRuntime).toBe('llrt');
      expect(cfg.llrtBin).toBeNull();
    });

    it('carries OA_LLRT_BIN when set (the loose-binary bind-mount path)', () => {
      const cfg = loadConfig({
        OA_EXECUTOR: 'microsandbox',
        OA_CODE_EGRESS_AUTHORITY: 'executor',
        OA_SANDBOX_RUNTIME: 'llrt',
        OA_LLRT_BIN: process.execPath, // an existing file — the path is validated
      });
      expect(cfg.llrtBin).toBe(process.execPath);
    });

    it('FAILS CLOSED: llrt with the default node image and no OA_LLRT_BIN (no llrt in the µVM)', () => {
      expect(() =>
        loadConfig({
          OA_EXECUTOR: 'microsandbox',
          OA_CODE_EGRESS_AUTHORITY: 'executor',
          OA_SANDBOX_RUNTIME: 'llrt',
        })).toThrow(/needs an llrt binary/);
    });

    it('FAILS CLOSED: OA_LLRT_BIN points at a path that does not exist', () => {
      expect(() =>
        loadConfig({
          OA_EXECUTOR: 'microsandbox',
          OA_CODE_EGRESS_AUTHORITY: 'executor',
          OA_SANDBOX_RUNTIME: 'llrt',
          OA_LLRT_BIN: '/nonexistent/llrt-xyz',
        })).toThrow(/OA_LLRT_BIN does not exist/);
    });

    it('rejects an unknown runtime', () => {
      expect(() => loadConfig({ OA_SANDBOX_RUNTIME: 'bun' })).toThrow(
        /OA_SANDBOX_RUNTIME/,
      );
    });

    it('FAILS CLOSED: llrt without microsandbox (it is the in-µVM runtime, not a host engine)', () => {
      expect(() =>
        loadConfig({ OA_EXECUTOR: 'deno', OA_SANDBOX_RUNTIME: 'llrt' })).toThrow(/requires OA_EXECUTOR=microsandbox/);
    });
  });
});
