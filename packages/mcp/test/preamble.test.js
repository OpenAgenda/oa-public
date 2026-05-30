import { buildScript } from '../src/sandbox/preamble.js';

// buildScript assembles the program that runs inside the sandbox: the `oa`
// client + the caller's body.
//
// NOTE on what these tests prove: the `oa.get` origin check is a MISUSE GUARD,
// not the exfiltration boundary (untrusted code can read __cfg.apiKey and call
// fetch directly — the sandbox EGRESS ALLOWLIST is the real boundary, exercised
// by scripts/smoke.mjs against a live sandbox, not here). These tests only
// assert the guard's own behavior: a cross-origin path is refused before fetch,
// and relative/smuggled paths resolve onto the API origin.
//
// We exercise the GENERATED code (not a re-implementation) by evaluating it
// with a fetch stub that records the URL it is asked to hit, via dynamic import
// of a data: URL (real ESM, same as the sandbox runs).

// Cache-bust the data: URL per invocation. Node caches ESM modules by URL for
// the whole process, so two tests producing byte-identical scripts would share
// one (already-evaluated) module — making results depend on test order. A unique
// trailing comment guarantees every run re-evaluates in isolation.
let nonce = 0;

async function runGenerated(userCode, opts = {}) {
  const { fetchImpl, baseUrl } = opts;
  // Distinguish "not provided" (default key) from an explicit null (no key):
  // `?? 'oa_pk_secret'` would turn a deliberate null back into the secret.
  const apiKey = 'apiKey' in opts ? opts.apiKey : 'oa_pk_secret';
  nonce += 1;
  const script = `${buildScript(userCode, {
    baseUrl: baseUrl ?? 'https://dapi.openagenda.com/v3',
    apiKey,
  })}\n//${nonce}`;

  const calls = [];
  const prevFetch = globalThis.fetch;
  const realLog = console.log;
  // Record every request the generated client makes, then defer to the test's
  // fetchImpl (or a default ok/empty envelope). `calls` is the source of truth
  // for "did a request happen" — no shared/global state across tests.
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), headers: init?.headers ?? {} });
    return (
      fetchImpl
      ?? (() => ({
        ok: true,
        status: 200,
        json: async () => ({ data: [], pagination: {} }),
      }))
    )(url, init);
  };
  const logs = [];
  console.log = (...a) => logs.push(a.join(' '));

  let error = null;
  try {
    await import(`data:text/javascript,${encodeURIComponent(script)}`);
  } catch (err) {
    error = err;
  } finally {
    console.log = realLog;
    globalThis.fetch = prevFetch;
  }
  return { calls, stdout: logs.join('\n'), error };
}

describe('buildScript — generated oa client', () => {
  it('resolves a normal path under the API base and sends the bearer token', async () => {
    const { calls, error } = await runGenerated(
      'return await oa.listEvents("123", { limit: 1 });',
    );
    expect(error).toBeNull();
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(
      'https://dapi.openagenda.com/v3/agendas/123/events?limit=1',
    );
    expect(calls[0].headers.Authorization).toBe('Bearer oa_pk_secret');
  });

  it('builds getEvent and getFacets URLs correctly', async () => {
    const ev = await runGenerated('return await oa.getEvent("ag", 42);');
    expect(ev.calls[0].url).toBe(
      'https://dapi.openagenda.com/v3/agendas/ag/events/42',
    );
    const fa = await runGenerated(
      'return await oa.getFacets("ag", { facets: "city" });',
    );
    expect(fa.calls[0].url).toBe(
      'https://dapi.openagenda.com/v3/agendas/ag/events/facets?facets=city',
    );
  });

  it('serialises the returned value as pretty JSON to stdout', async () => {
    const { stdout, error } = await runGenerated('return { a: 1, b: [2, 3] };');
    expect(error).toBeNull();
    expect(JSON.parse(stdout)).toEqual({ a: 1, b: [2, 3] });
  });

  it('throws on a non-ok API response (status surfaced)', async () => {
    const { error } = await runGenerated('return await oa.get("/boom");', {
      fetchImpl: () => ({
        ok: false,
        status: 404,
        json: async () => ({ message: 'nope' }),
      }),
    });
    expect(error?.message).toMatch(/OpenAgenda API 404/);
  });

  // The origin guard sorts every caller-supplied path into one of two safe
  // outcomes: a path resolving to a different origin is REFUSED before fetch;
  // anything else resolves onto the API origin. We assert each input lands in
  // the right bucket. (This is the guard's own behavior — NOT a proof that the
  // token can't leak; that is the egress allowlist's job, see the file header.)
  describe('origin guard', () => {
    // Refused: resolves to a different origin → throw, and NO request is made.
    // calls.length === 0 also proves the throw is BEFORE fetch (the default
    // stub returns ok, so a request would make oa.get resolve, not throw).
    it.each([
      ['absolute https URL', 'https://evil.example/steal'],
      ['uppercase scheme', 'HTTPS://evil.example/steal'],
      ['backslash authority', '\\\\evil.example/steal'],
      ['leading-whitespace absolute', '  https://evil.example/steal'],
      ['file: scheme', 'file:///etc/passwd'],
      ['data: scheme', 'data:text/plain,hi'],
    ])(
      'refuses a cross-origin path and makes no request: %s',
      async (_label, path) => {
        const { error, calls } = await runGenerated(
          `return await oa.get(${JSON.stringify(path)});`,
        );
        expect(error?.message).toMatch(/cross-origin/);
        expect(calls).toHaveLength(0);
      },
    );

    // Resolves onto the API origin: the leading-slash strip turns these into
    // plain path segments under the base, so the request stays on the API host.
    // (Reaching the API host is the *guard's* correct outcome; whether that path
    // is a valid endpoint is the API's concern, not the guard's.)
    it.each([
      ['protocol-relative authority', '//evil.example/steal'],
      ['@-userinfo metadata host', '@169.254.169.254/latest/meta-data/'],
      ['scheme without slashes', 'https:evil.example/steal'],
      ['scheme with one slash', 'https:/evil.example/steal'],
    ])('resolves onto the API origin: %s', async (_label, path) => {
      const { calls, error } = await runGenerated(
        `return await oa.get(${JSON.stringify(path)});`,
      );
      expect(error).toBeNull();
      expect(calls).toHaveLength(1);
      expect(new URL(calls[0].url).hostname).toBe('dapi.openagenda.com');
    });
  });

  describe('no API key', () => {
    it('omits the Authorization header when apiKey is null', async () => {
      const { calls } = await runGenerated('return await oa.get("/agendas");', {
        apiKey: null,
      });
      expect(calls[0].headers.Authorization).toBeUndefined();
    });
  });
});
