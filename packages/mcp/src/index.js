#!/usr/bin/env node
// Entry point: wire config → executor → MCP server → stdio transport.

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { createExecutor } from './sandbox/executor.js';
import { createServer } from './server.js';

async function main() {
  const config = loadConfig(); // throws (fail-closed) on an unsafe mode/backend pairing
  const executor = createExecutor(config);
  const server = createServer({ config, executor });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stdio transport OWNS stdout (it's the MCP channel) — all logs go to stderr.
  process.stderr.write(
    `[openagenda-mcp] ready (mode=${config.mode}, backend=${executor.name}, base=${config.baseUrl})\n`,
  );
}

main().catch((err) => {
  process.stderr.write(`[openagenda-mcp] fatal: ${err?.message ?? err}\n`);
  process.exit(1);
});
