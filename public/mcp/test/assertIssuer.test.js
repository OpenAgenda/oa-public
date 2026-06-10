import { assertIssuer } from '../src/auth/assertIssuer.js';

// Unit-tests the boot-time issuer self-check (src/auth/assertIssuer.js) with an
// injected fetch — no network, no AS. Asserts: matching issuer is silent; a
// reachable AS advertising a different issuer throws (fail fast); an unreachable
// AS only warns (boot proceeds); and the two RFC 8414 metadata URL forms are
// tried in order. Hand-rolled stubs (no jest.fn) to match this package's tests.

const ISSUER = 'https://d.test/api/auth';
const SUFFIXED = 'https://d.test/api/auth/.well-known/oauth-authorization-server';
const INSERTED = 'https://d.test/.well-known/oauth-authorization-server/api/auth';

const okJson = (body) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

// Returns { fetchImpl, urls } where urls records every requested URL in order,
// and `impl(url)` produces the Response (or throws) for each call.
function stubFetch(impl) {
  const urls = [];
  return {
    urls,
    fetchImpl: async (url) => {
      urls.push(url);
      return impl(url);
    },
  };
}

// Captures warn() messages.
function makeWarn() {
  const messages = [];
  return { messages, warn: (msg) => messages.push(msg) };
}

describe('assertIssuer', () => {
  it('resolves silently when the AS advertises the configured issuer', async () => {
    const { warn, messages } = makeWarn();
    const { fetchImpl, urls } = stubFetch(() => okJson({ issuer: ISSUER }));

    await expect(
      assertIssuer({ issuer: ISSUER, warn, fetchImpl }),
    ).resolves.toBeUndefined();

    expect(messages).toEqual([]);
    // First candidate (path-suffixed form) answers, so only one fetch.
    expect(urls).toEqual([SUFFIXED]);
  });

  it('throws a precise mismatch error when the AS advertises a different issuer', async () => {
    const { warn, messages } = makeWarn();
    // The AS advertises the bare origin — the classic footgun the check guards.
    const { fetchImpl } = stubFetch(() => okJson({ issuer: 'https://d.test' }));

    await expect(
      assertIssuer({ issuer: ISSUER, warn, fetchImpl }),
    ).rejects.toThrow(/OA_OAUTH_ISSUER mismatch/);
    expect(messages).toEqual([]);
  });

  it('warns (does not throw) when the AS is unreachable', async () => {
    const { warn, messages } = makeWarn();
    const { fetchImpl, urls } = stubFetch(() => {
      throw new Error('ECONNREFUSED');
    });

    await expect(
      assertIssuer({ issuer: ISSUER, warn, fetchImpl }),
    ).resolves.toBeUndefined();

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatch(/self-check skipped/);
    // Both URL forms were attempted before giving up.
    expect(urls).toEqual([SUFFIXED, INSERTED]);
  });

  it('falls back to the origin path-inserted form when the suffixed one 404s', async () => {
    const { warn, messages } = makeWarn();
    const { fetchImpl, urls } = stubFetch((url) =>
      (url === INSERTED
        ? okJson({ issuer: ISSUER })
        : new Response('not found', { status: 404 })));

    await expect(
      assertIssuer({ issuer: ISSUER, warn, fetchImpl }),
    ).resolves.toBeUndefined();

    expect(messages).toEqual([]);
    expect(urls).toEqual([SUFFIXED, INSERTED]);
  });

  it('warns when the metadata body is not JSON', async () => {
    const { warn, messages } = makeWarn();
    const { fetchImpl } = stubFetch(
      () => new Response('<html>oops</html>', { status: 200 }),
    );

    await expect(
      assertIssuer({ issuer: ISSUER, warn, fetchImpl }),
    ).resolves.toBeUndefined();
    expect(messages).toHaveLength(1);
  });

  it('tries only the suffixed form for a bare-origin issuer (no path to insert)', async () => {
    const { warn } = makeWarn();
    const { fetchImpl, urls } = stubFetch(() =>
      okJson({ issuer: 'https://d.test' }));

    await expect(
      assertIssuer({ issuer: 'https://d.test', warn, fetchImpl }),
    ).resolves.toBeUndefined();
    expect(urls).toEqual([
      'https://d.test/.well-known/oauth-authorization-server',
    ]);
  });
});
