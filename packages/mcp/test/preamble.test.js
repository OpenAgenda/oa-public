// Tests for buildScript — the program assembled and handed to the sandbox.
// We don't run a sandbox here; we load the assembled program into THIS process
// (via a data: URL ESM module) with a stubbed global fetch, then drive the
// `oa` client exactly as sandboxed code would. That exercises the real bundle
// (ky request building, baseUrl/auth config from preamble) without a network.

import { buildScript } from '../src/sandbox/preamble.js';

// Reuse buildScript's exact output (head + SDK bundle + SETUP), but swap the
// trailing console.log for an export so we can grab the `oa` client + schemas.
function sdkModuleFor(cfg) {
  const program = buildScript('return { oa, schemas };', cfg);
  const lines = program.split('\n');
  // Drop the last two lines (const __r = await __run(); console.log(...)).
  const body = lines.slice(0, -2).join('\n');
  return `${body}\nexport default await __run();\n`;
}

async function loadSdk(cfg) {
  const mod = sdkModuleFor(cfg);
  const url = `data:text/javascript;base64,${Buffer.from(mod).toString('base64')}`;
  return (await import(url)).default;
}

let savedFetch;
let calls;

function stubFetch(body = { data: [], pagination: { after: null } }) {
  calls = [];
  globalThis.fetch = async (input, init) => {
    const req = input instanceof Request ? input : new Request(input, init);
    calls.push({ url: req.url, auth: req.headers.get('authorization') });
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
}

beforeEach(() => {
  savedFetch = globalThis.fetch;
});
afterEach(() => {
  globalThis.fetch = savedFetch;
});

describe('buildScript / bundled SDK', () => {
  it('targets the configured base URL and injects the bearer key', async () => {
    stubFetch();
    const { oa } = await loadSdk({
      baseUrl: 'https://api.example.com/v3',
      apiKey: 'oa_pk_secret123',
    });
    const { error } = await oa.agendas.events.list({
      path: { agendaUid: 42 },
      query: { limit: 5 },
    });
    expect(error).toBeUndefined();
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(
      'https://api.example.com/v3/agendas/42/events?limit=5',
    );
    expect(calls[0].auth).toBe('Bearer oa_pk_secret123');
  });

  it('sends no Authorization header when no key is configured', async () => {
    // The API would answer 401 (no anonymous read) — but that is the server's
    // job; here we only assert the SDK sends no bearer when auth is unset.
    stubFetch();
    const { oa } = await loadSdk({
      baseUrl: 'https://api.example.com/v3',
      apiKey: null,
    });
    await oa.agendas.events.list({ path: { agendaUid: 7 } });
    expect(calls).toHaveLength(1);
    // No query → the client may emit a bare trailing "?"; tolerate it.
    expect(calls[0].url).toMatch(
      /^https:\/\/api\.example\.com\/v3\/agendas\/7\/events\??$/,
    );
    expect(calls[0].auth).toBeNull();
  });

  it('returns the { data, error } envelope and parses the body', async () => {
    stubFetch({ data: [{ uid: 1 }], pagination: { after: 'CUR' } });
    const { oa } = await loadSdk({
      baseUrl: 'https://api.example.com/v3',
      apiKey: 'k',
    });
    const { data, error } = await oa.agendas.events.list({
      path: { agendaUid: 1 },
    });
    expect(error).toBeUndefined();
    expect(data.data).toHaveLength(1);
    expect(data.pagination.after).toBe('CUR');
  });

  it('builds the single-event path from path params', async () => {
    stubFetch({ uid: 99 });
    const { oa } = await loadSdk({
      baseUrl: 'https://api.example.com/v3',
      apiKey: 'k',
    });
    await oa.agendas.events.get({ path: { agendaUid: 12, eventUid: 99 } });
    expect(calls[0].url).toBe(
      'https://api.example.com/v3/agendas/12/events/99',
    );
  });

  it('exposes zod schemas for payload validation', async () => {
    stubFetch();
    const { schemas } = await loadSdk({
      baseUrl: 'https://api.example.com/v3',
      apiKey: 'k',
    });
    expect(typeof schemas.zEvent.parse).toBe('function');
  });
});
