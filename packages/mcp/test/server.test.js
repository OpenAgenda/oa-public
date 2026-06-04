import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { loadConfig } from '../src/config.js';

// Drives the REAL MCP server through a REAL client over an in-memory transport,
// with a MOCKED executor — so we test the tool wiring and result mapping with
// no sandbox binary (deno/node), no network and no live API.

function makeExecutor(impl) {
  return { name: 'mock', run: impl };
}

// A passing executor result mirrors a successful sandbox run.
const okResult = (stdout) => ({
  stdout,
  stderr: '',
  timedOut: false,
  exitCode: 0,
});

async function connect({
  executor,
  config,
  credential,
  rateLimiter,
  callerId,
} = {}) {
  const server = createServer({
    config: config ?? loadConfig({ OA_API_KEY: 'oa_pk_test' }),
    executor: executor ?? makeExecutor(async () => okResult('null')),
    ...credential !== undefined ? { credential } : {},
    ...rateLimiter !== undefined ? { rateLimiter, callerId } : {},
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '0.0.0' });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return { client, server };
}

const textOf = (r) => r.content.map((c) => c.text).join('\n');

describe('MCP server', () => {
  let client;
  afterEach(async () => {
    await client?.close();
    client = undefined;
  });

  describe('tool registration', () => {
    it('exposes exactly search_docs and execute', async () => {
      ({ client } = await connect());
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name).sort()).toEqual([
        'execute',
        'search_docs',
      ]);
    });

    it('marks search_docs read-only; execute is NOT (runs arbitrary code) and is open-world', async () => {
      ({ client } = await connect());
      const { tools } = await client.listTools();
      const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
      // execute runs arbitrary code — it must not claim read-only (it can mutate
      // once the v3 write surface lands), so clients keep gating it.
      expect(byName.execute.annotations).toMatchObject({
        readOnlyHint: false,
        openWorldHint: true,
      });
      expect(byName.search_docs.annotations).toMatchObject({
        readOnlyHint: true,
        openWorldHint: false,
      });
    });
  });

  describe('search_docs', () => {
    it('returns rendered operation docs for a query', async () => {
      ({ client } = await connect());
      const r = await client.callTool({
        name: 'search_docs',
        arguments: { query: 'how many events per city' },
      });
      expect(r.isError).toBeFalsy();
      expect(textOf(r)).toContain('### agendas.events.facets');
    });
  });

  describe('execute — result mapping', () => {
    it('passes the built script + policy (allowNet, limits, tls) to the executor', async () => {
      let received;
      ({ client } = await connect({
        executor: makeExecutor(async (req) => {
          received = req;
          return okResult('42');
        }),
        config: loadConfig({
          OA_API_KEY: 'oa_pk_test',
          OA_BASE_URL: 'https://dapi.openagenda.com/v3',
        }),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'return 42;' },
      });
      expect(textOf(r)).toBe('42');
      // The user code is wrapped, and the baked-in client + key are present.
      expect(received.code).toContain('return 42;');
      expect(received.code).toContain('oa_pk_test');
      // Policy is forwarded from config, not invented by the server.
      expect(received.allowNet).toEqual(['dapi.openagenda.com']);
      expect(received.egressAuthority).toBe('executor');
      expect(received.limits).toEqual({ timeoutMs: 5000, memoryMb: 256 });
      expect(received.tls).toBeDefined();
    });

    it('bakes the per-request credential (delegation), overriding config.apiKey', async () => {
      // The HTTP resource server passes the caller's OAuth token as `credential`;
      // it must be what reaches the sandbox, NOT the (absent) shared key.
      let received;
      ({ client } = await connect({
        credential: 'caller-oauth-token',
        config: loadConfig({ OA_API_KEY: 'oa_pk_shared' }),
        executor: makeExecutor(async (req) => {
          received = req;
          return okResult('1');
        }),
      }));
      await client.callTool({
        name: 'execute',
        arguments: { code: 'return 1;' },
      });
      expect(received.code).toContain('caller-oauth-token');
      expect(received.code).not.toContain('oa_pk_shared');
    });

    it('redacts the per-request credential from returned text', async () => {
      ({ client } = await connect({
        credential: 'caller-oauth-token',
        executor: makeExecutor(async () =>
          okResult('leaked caller-oauth-token here')),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'return 1;' },
      });
      expect(textOf(r)).toBe('leaked [redacted] here');
    });

    it('falls back to config.apiKey when no credential is given (stdio)', async () => {
      let received;
      ({ client } = await connect({
        config: loadConfig({ OA_API_KEY: 'oa_pk_stdio' }),
        executor: makeExecutor(async (req) => {
          received = req;
          return okResult('1');
        }),
      }));
      await client.callTool({
        name: 'execute',
        arguments: { code: 'return 1;' },
      });
      expect(received.code).toContain('oa_pk_stdio');
    });

    it('returns trimmed stdout on success', async () => {
      ({ client } = await connect({
        executor: makeExecutor(async () => okResult('  {"ok":true}\n')),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'return { ok: true };' },
      });
      expect(r.isError).toBeFalsy();
      expect(textOf(r)).toBe('{"ok":true}');
    });

    it('returns "null" when stdout is empty', async () => {
      ({ client } = await connect({
        executor: makeExecutor(async () => okResult('   ')),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'return;' },
      });
      expect(textOf(r)).toBe('null');
    });

    it('maps a timeout to an isError result mentioning the limit', async () => {
      ({ client } = await connect({
        executor: makeExecutor(async () => ({
          stdout: '',
          stderr: '',
          timedOut: true,
          exitCode: null,
        })),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'while(true){}' },
      });
      expect(r.isError).toBe(true);
      expect(textOf(r)).toMatch(/timed out after 5000 ms/);
    });

    it('maps a non-zero exit to an isError result carrying stderr', async () => {
      ({ client } = await connect({
        executor: makeExecutor(async () => ({
          stdout: '',
          stderr: 'ReferenceError: boom is not defined',
          timedOut: false,
          exitCode: 1,
        })),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'return boom;' },
      });
      expect(r.isError).toBe(true);
      expect(textOf(r)).toContain('exit 1');
      expect(textOf(r)).toContain('ReferenceError: boom');
    });

    it('falls back to stdout when a failed run produced no stderr', async () => {
      ({ client } = await connect({
        executor: makeExecutor(async () => ({
          stdout: 'partial output',
          stderr: '',
          timedOut: false,
          exitCode: 2,
        })),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'process.exit(2)' },
      });
      expect(r.isError).toBe(true);
      expect(textOf(r)).toContain('partial output');
    });

    it('maps an output-cap kill to its own isError result', async () => {
      ({ client } = await connect({
        executor: makeExecutor(async () => ({
          stdout: 'x'.repeat(10),
          stderr: '[killed: output exceeded 1 MiB]',
          timedOut: false,
          outputCapped: true,
          exitCode: null,
        })),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'while(true) console.log("x")' },
      });
      expect(r.isError).toBe(true);
      expect(textOf(r)).toMatch(/too much output/);
    });

    it.each(['EXEC_BUSY', 'EXEC_SHUTTING_DOWN'])(
      'maps a thrown %s from the executor to a retryable "at capacity" result (the run never started)',
      async (code) => {
        // The concurrency guard (concurrencyLimit.js) REJECTS instead of
        // returning an ExecResult when saturated/shutting down. That must surface
        // as a distinct retryable busy — not the generic "Execution failed:"
        // path — and must not echo the raw limiter message.
        ({ client } = await connect({
          executor: makeExecutor(async () => {
            throw Object.assign(new Error('saturated internal detail'), {
              code,
            });
          }),
        }));
        const r = await client.callTool({
          name: 'execute',
          arguments: { code: 'return 1;' },
        });
        expect(r.isError).toBe(true);
        expect(textOf(r)).toMatch(/at capacity/i);
        expect(textOf(r)).not.toContain('Execution failed');
        expect(textOf(r)).not.toContain('saturated internal detail');
      },
    );

    it('refuses an over-rate caller with a retryable result, before running anything', async () => {
      // A denying limiter must short-circuit the execute: no executor run, no
      // credential resolution — just a retryable "rate limit" message with a wait
      // hint (same back-off vocabulary as the concurrency "at capacity" path).
      let ran = false;
      ({ client } = await connect({
        executor: makeExecutor(async () => {
          ran = true;
          return okResult('1');
        }),
        rateLimiter: { check: () => ({ allowed: false, retryAfterMs: 2500 }) },
        callerId: 'user-1',
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'return 1;' },
      });
      expect(r.isError).toBe(true);
      expect(textOf(r)).toMatch(/rate limit/i);
      expect(textOf(r)).toMatch(/3s/); // ceil(2500 ms) → 3 s
      expect(ran).toBe(false); // the run never started
    });

    it('runs normally when the limiter admits the call', async () => {
      ({ client } = await connect({
        executor: makeExecutor(async () => okResult('42')),
        rateLimiter: { check: () => ({ allowed: true, retryAfterMs: 0 }) },
        callerId: 'user-1',
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'return 42;' },
      });
      expect(r.isError).toBeFalsy();
      expect(textOf(r)).toBe('42');
    });

    it('still enforces the limit when callerId is falsy (no empty-key bypass)', async () => {
      // A falsy callerId (e.g. an empty-string sub) must NOT skip the limiter —
      // the guard keys on a default bucket rather than bypassing.
      let ran = false;
      ({ client } = await connect({
        executor: makeExecutor(async () => {
          ran = true;
          return okResult('1');
        }),
        rateLimiter: { check: () => ({ allowed: false, retryAfterMs: 1000 }) },
        callerId: '',
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'return 1;' },
      });
      expect(r.isError).toBe(true);
      expect(textOf(r)).toMatch(/rate limit/i);
      expect(ran).toBe(false);
    });

    it('redacts the API key from returned error text', async () => {
      // The key is baked into the program, so a stack trace can echo it back.
      // It must never reach the client verbatim (shared key today; the caller's
      // own scoped token under OAuth later — redaction is valid in both models).
      ({ client } = await connect({
        executor: makeExecutor(async () => ({
          stdout: '',
          stderr:
            'Error at oa_pk_test: const __cfg = {"apiKey":"oa_pk_test"} ...',
          timedOut: false,
          exitCode: 1,
        })),
        config: loadConfig({ OA_API_KEY: 'oa_pk_test' }),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'throw new Error(oa)' },
      });
      expect(textOf(r)).not.toContain('oa_pk_test');
      expect(textOf(r)).toContain('[redacted]');
    });

    it('redacts the API key on the SUCCESS path (a return value can echo it)', async () => {
      // Untrusted code can `return __cfg.apiKey` (the key is baked into the
      // program); a successful result must not leak it any more than an error does.
      ({ client } = await connect({
        executor: makeExecutor(async () => ({
          stdout: 'oa_pk_test',
          stderr: '',
          timedOut: false,
          exitCode: 0,
        })),
        config: loadConfig({ OA_API_KEY: 'oa_pk_test' }),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'return __cfg.apiKey' },
      });
      expect(textOf(r)).not.toContain('oa_pk_test');
      expect(textOf(r)).toContain('[redacted]');
    });

    it('truncates very long error text with a note (no silent cut)', async () => {
      ({ client } = await connect({
        executor: makeExecutor(async () => ({
          stdout: '',
          stderr: 'E'.repeat(20000),
          timedOut: false,
          exitCode: 1,
        })),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'noop' },
      });
      const text = textOf(r);
      expect(text.length).toBeLessThan(20000);
      expect(text).toMatch(/more chars truncated/);
    });
  });
});
