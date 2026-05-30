import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import { loadConfig } from '../src/config.js';

// Drives the REAL MCP server through a REAL client over an in-memory transport,
// with a MOCKED executor — so we test the tool wiring and result mapping with
// no sandbox binary (deno/srt), no network and no live API.

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

async function connect({ executor, config } = {}) {
  const server = createServer({
    config: config ?? loadConfig({ OA_API_KEY: 'oa_pk_test' }),
    executor: executor ?? makeExecutor(async () => okResult('null')),
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

    it('marks both tools read-only; execute is open-world, search_docs is not', async () => {
      ({ client } = await connect());
      const { tools } = await client.listTools();
      const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
      expect(byName.execute.annotations).toMatchObject({
        readOnlyHint: true,
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
      expect(textOf(r)).toContain('### getFacets');
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
      expect(received.limits).toEqual({ timeoutMs: 5000, memoryMb: 256 });
      expect(received.tls).toBeDefined();
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

    it('redacts any oa_pk_/oa_sk_ token shape, not just the configured key', async () => {
      ({ client } = await connect({
        executor: makeExecutor(async () => ({
          stdout: '',
          stderr: 'leaked oa_sk_OTHERSECRET123 in output',
          timedOut: false,
          exitCode: 1,
        })),
        config: loadConfig({ OA_API_KEY: 'oa_pk_test' }),
      }));
      const r = await client.callTool({
        name: 'execute',
        arguments: { code: 'noop' },
      });
      expect(textOf(r)).not.toContain('oa_sk_OTHERSECRET123');
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
