import requireScope from '../api-v3/lib/requireScope.js';

// requireScope is the v3 OAuth scope gate (O4a). It constrains scope-bearing
// credentials: OAuth tokens (req.oauth.scopes) and API keys carrying explicit
// permissions (req.apiKey.permissions). Unscoped callers — grandfathered keys
// (permissions=null), agenda keys, sessions — pass through.

// Drive the middleware against a fake req/res, capturing the next() arg and any
// header the middleware set (for the RFC 6750 WWW-Authenticate challenge).
function run(scope, req) {
  const headers = {};
  const res = {
    setHeader: (name, value) => {
      headers[name] = value;
    },
  };
  let nextArg;
  let called = false;
  requireScope(scope)(req, res, (arg) => {
    called = true;
    nextArg = arg;
  });
  if (!called) {
    throw new Error('middleware did not call next');
  }
  return { error: nextArg, headers };
}

describe('90 - api-v3 unit - requireScope', () => {
  describe('unscoped callers are never scope-gated', () => {
    it('passes a request with no credential descriptor (session / agenda key)', () => {
      const { error } = run('events:read', { headers: {} });
      expect(error).toBeUndefined();
    });

    it('passes a grandfathered API key (permissions = null = all scopes)', () => {
      const { error } = run('events:read', {
        apiKey: { oaKind: 'sk', permissions: null },
      });
      expect(error).toBeUndefined();
    });
  });

  describe('API keys with explicit permissions are scope-gated', () => {
    // permissions map {resource: [actions]} bridges to flat `resource:action`.
    it('passes when the permissions map covers the required scope', () => {
      const { error } = run('events:read', {
        apiKey: {
          permissions: { events: ['read', 'write'], agendas: ['read'] },
        },
      });
      expect(error).toBeUndefined();
    });

    it('rejects 403 insufficient_scope when the permissions map lacks it', () => {
      const { error, headers } = run('agendas:read', {
        apiKey: { permissions: { events: ['read'] } },
      });
      expect(error?.name).toBe('Forbidden');
      expect(error?.info?.code).toBe('insufficient_scope');
      expect(headers['WWW-Authenticate']).toMatch(/scope="agendas:read"/);
    });

    it('fails closed on an explicit empty permissions map ({} = granted none)', () => {
      const { error } = run('events:read', { apiKey: { permissions: {} } });
      expect(error?.name).toBe('Forbidden');
      expect(error?.info?.code).toBe('insufficient_scope');
    });
  });

  describe('OAuth callers must hold the required scope', () => {
    it('passes when the token carries the scope', () => {
      const { error } = run('events:read', {
        oauth: { scopes: ['events:read', 'agendas:read'], clientId: 'c1' },
      });
      expect(error).toBeUndefined();
    });

    it('rejects with 403 insufficient_scope when the scope is absent', () => {
      const { error, headers } = run('agendas:read', {
        oauth: { scopes: ['events:read'], clientId: 'c1' },
      });
      expect(error?.name).toBe('Forbidden');
      expect(error?.info?.code).toBe('insufficient_scope');
      expect(error?.info?.requiredScope).toBe('agendas:read');
      // RFC 6750 §3.1 challenge names the missing scope.
      expect(headers['WWW-Authenticate']).toMatch(/error="insufficient_scope"/);
      expect(headers['WWW-Authenticate']).toMatch(/scope="agendas:read"/);
    });

    it('fails closed when the token carries no scopes at all', () => {
      const { error } = run('events:read', { oauth: { scopes: [] } });
      expect(error?.name).toBe('Forbidden');
      expect(error?.info?.code).toBe('insufficient_scope');
    });

    it('fails closed when scopes is undefined', () => {
      const { error } = run('events:read', { oauth: { clientId: 'c1' } });
      expect(error?.name).toBe('Forbidden');
      expect(error?.info?.code).toBe('insufficient_scope');
    });

    it('does not set a WWW-Authenticate header on a pass', () => {
      const { headers } = run('events:read', {
        oauth: { scopes: ['events:read'] },
      });
      expect(headers['WWW-Authenticate']).toBeUndefined();
    });
  });
});
