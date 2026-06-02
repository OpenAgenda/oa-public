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
});
