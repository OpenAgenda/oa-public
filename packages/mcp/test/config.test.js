import { loadConfig } from '../src/config.js';

// Pure unit tests for loadConfig — the security-critical bit is the FAIL-CLOSED
// gate (hosted mode must refuse any backend other than microsandbox).

describe('loadConfig', () => {
  describe('defaults (local)', () => {
    const cfg = loadConfig({});

    it('defaults to local mode + deno backend', () => {
      expect(cfg.mode).toBe('local');
      expect(cfg.backend).toBe('deno');
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

  describe('validation', () => {
    it('rejects an unknown mode', () => {
      expect(() => loadConfig({ OA_MCP_MODE: 'prod' })).toThrow(/OA_MCP_MODE/);
    });

    it('rejects an unknown backend', () => {
      expect(() => loadConfig({ SANDBOX_BACKEND: 'docker' })).toThrow(
        /SANDBOX_BACKEND/,
      );
    });
  });

  describe('fail-closed backend gating', () => {
    it('hosted mode defaults to microsandbox', () => {
      expect(loadConfig({ OA_MCP_MODE: 'hosted' }).backend).toBe(
        'microsandbox',
      );
    });

    it('hosted + microsandbox is allowed', () => {
      const cfg = loadConfig({
        OA_MCP_MODE: 'hosted',
        SANDBOX_BACKEND: 'microsandbox',
      });
      expect(cfg.backend).toBe('microsandbox');
    });

    it.each(['deno', 'srt'])(
      'hosted REFUSES the weak backend %s',
      (backend) => {
        expect(() =>
          loadConfig({ OA_MCP_MODE: 'hosted', SANDBOX_BACKEND: backend })).toThrow(/hosted requires SANDBOX_BACKEND=microsandbox/);
      },
    );

    it.each(['deno', 'srt'])('local allows %s', (backend) => {
      expect(loadConfig({ SANDBOX_BACKEND: backend }).backend).toBe(backend);
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
  });
});
