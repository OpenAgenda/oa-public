// The server card (SEP-1649 draft) is UNAUTHENTICATED metadata whose whole
// value is being trustworthy: it must say exactly what the live server says.
// So beyond shape checks, the anti-drift tests below compare the card against a
// REAL server over an in-memory transport — same tool names, same descriptions,
// same input schemas, same handshake identity.

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { buildServerCard } from '../src/serverCard.js';
import { createServer } from '../src/server.js';
import { loadConfig } from '../src/config.js';
import pkg from '../package.json' with { type: 'json' };

const httpEnv = {
  OA_MCP_TRANSPORT: 'http',
  OA_EXECUTOR: 'deno', // bounded egress — http requires it (config-only; executor unused here)
  OA_OAUTH_ISSUER: 'https://as.test/api/auth',
  OA_MCP_RESOURCE_URL: 'https://dmcp.test/mcp',
  OA_MCP_EXCHANGE_SECRET: 's3cr3t',
};

const config = loadConfig(httpEnv);
const card = buildServerCard({ config });

describe('buildServerCard', () => {
  it('identifies the deployment: endpoint from the resource URL, released version', () => {
    expect(card.transport).toEqual({
      type: 'streamable-http',
      endpoint: '/mcp',
    });
    expect(card.serverInfo.version).toBe(pkg.version);
    expect(card.version).toBe('1.0');
    // No $schema while SEP-1649's schema URL is unpublished (would 404).
    expect(card.$schema).toBeUndefined();
  });

  it('declares OAuth as required (the signal crawlers need instead of a bare 401)', () => {
    expect(card.authentication).toEqual({
      required: true,
      schemes: ['oauth2'],
    });
  });

  it('lists the tools STATICALLY with object input schemas', () => {
    expect(card.tools.map((t) => t.name)).toEqual(['search_docs', 'execute']);
    for (const tool of card.tools) {
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.description).toBeTruthy();
    }
  });

  it('embeds the instance resource caps in the execute description', () => {
    const execute = card.tools.find((t) => t.name === 'execute');
    expect(execute.description).toContain(`${config.limits.timeoutMs} ms`);
    expect(execute.description).toContain(`${config.limits.memoryMb} MiB`);
  });

  it('refuses to build without OAuth config (stdio has no well-known)', () => {
    expect(() =>
      buildServerCard({ config: loadConfig({ OA_API_KEY: 'k' }) })).toThrow(/OAuth/);
  });

  describe('anti-drift against the live server', () => {
    let client;
    let cleanup;

    beforeAll(async () => {
      const server = createServer({
        config,
        executor: {
          name: 'mock',
          run: async () => ({
            stdout: 'null',
            stderr: '',
            timedOut: false,
            exitCode: 0,
          }),
        },
      });
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      client = new Client({ name: 'test', version: '0.0.0' });
      await Promise.all([
        server.connect(serverTransport),
        client.connect(clientTransport),
      ]);
      cleanup = () => Promise.all([client.close(), server.close()]);
    });

    afterAll(() => cleanup());

    it('matches the handshake identity (serverInfo name + version)', () => {
      const live = client.getServerVersion();
      expect(card.serverInfo.name).toBe(live.name);
      expect(card.serverInfo.version).toBe(live.version);
    });

    it('matches the announced capabilities for tools', () => {
      const live = client.getServerCapabilities();
      expect(card.capabilities.tools).toEqual(live.tools);
    });

    it('matches tools/list: names, titles, descriptions, schemas, annotations', async () => {
      const { tools: live } = await client.listTools();
      const liveByName = Object.fromEntries(live.map((t) => [t.name, t]));
      expect(Object.keys(liveByName).sort()).toEqual(
        card.tools.map((t) => t.name).sort(),
      );
      for (const tool of card.tools) {
        const match = liveByName[tool.name];
        expect(tool.title).toBe(match.title);
        expect(tool.description).toBe(match.description);
        expect(tool.inputSchema).toEqual(match.inputSchema);
        expect(tool.annotations).toEqual(match.annotations);
      }
    });
  });
});
