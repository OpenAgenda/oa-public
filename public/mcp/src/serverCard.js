// MCP Server Card (SEP-1649, draft): static, UNAUTHENTICATED server metadata
// served at /.well-known/mcp.json so registries and health-checkers (Smithery,
// Glama, …) can read the server's identity, capabilities, tool definitions and
// auth requirement without an OAuth flow — their probes have no human to send
// through a consent screen, so without this document an OAuth-protected server
// is opaque to them (and gets mislabeled "unhealthy"). Public by design: the
// tool definitions are the open-source ones, and every value is built from the
// same sources the live server uses — package version (like the handshake),
// tool defs (toolDefs.js), the configured resource URL — so the card cannot
// drift from what an authenticated client sees. The SEP is a draft (path and
// shape may still move); revisit on acceptance.

import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { LATEST_PROTOCOL_VERSION } from '@modelcontextprotocol/sdk/types.js';
import pkg from '../package.json' with { type: 'json' };
import { sandboxFacts } from './config.js';
import { SERVICE_NAME } from './serviceName.js';
import { searchDocsTool, executeTool } from './toolDefs.js';

// Deployment-independent identity. The icon is the brand asset on the public
// CDN (a single URL — the card schema has no multi-icon array; the registry
// server.json carries the SVG variant). PNG for universal client support.
const ICON_URL = 'https://cdn.openagenda.com/static/icon-512.png';
const DOCUMENTATION_URL = 'https://github.com/OpenAgenda/oa-public/tree/main/mcp#readme';

// The same inputSchema conversion the SDK applies to registerTool (its zod v3
// zod-json-schema-compat options), so the card's schema matches tools/list —
// asserted against a live server in test/serverCard.test.js. The card projects
// the SEP-1649 tool shape (a subset of the live Tool object).
const toInputSchema = (shape) =>
  zodToJsonSchema(z.object(shape), {
    strictUnions: true,
    pipeStrategy: 'input',
  });

const toolEntry = ({ name, config }) => ({
  name,
  title: config.title,
  description: config.description,
  inputSchema: toInputSchema(config.inputSchema),
  annotations: config.annotations,
});

/**
 * Build the server card for this deployment. HTTP transport only (the stdio
 * mode has no well-known endpoint; per the SEP it would expose the card as an
 * MCP resource instead — not implemented).
 *
 * @param {object} deps
 * @param {ReturnType<import('./config.js').loadConfig>} deps.config
 */
export function buildServerCard({ config }) {
  const { oauth } = config;
  if (!oauth) {
    throw new Error('buildServerCard requires OAuth config (transport=http)');
  }
  return {
    // No $schema: SEP-1649 is still a draft and its schema URL is unpublished
    // (404). `version` records the card format we target; re-add $schema once the
    // SEP is accepted and the schema is hosted.
    version: '1.0',
    protocolVersion: LATEST_PROTOCOL_VERSION,
    // Mirrors the initialize handshake (server.js): same name, same released
    // version — the card, the handshake and the npm listing tell one story.
    serverInfo: {
      name: SERVICE_NAME,
      title: 'OpenAgenda',
      version: pkg.version,
    },
    description: 'Search, analyze and manage events on OpenAgenda.',
    iconUrl: ICON_URL,
    documentationUrl: DOCUMENTATION_URL,
    // Same single source of truth as the protocol endpoint: the resource URL's
    // path (see httpServer.js → mcpPath).
    transport: {
      type: 'streamable-http',
      endpoint: new URL(oauth.resourceUrl).pathname,
    },
    // Mirrors what McpServer announces at initialize (registerTool flips the
    // tools capability on, with listChanged) — asserted against the real
    // handshake by test/serverCard.test.js.
    capabilities: { tools: { listChanged: true } },
    authentication: { required: true, schemes: ['oauth2'] },
    instructions:
      'Call search_docs to find the right OpenAgenda v3 operations, then '
      + 'execute to run JavaScript against the API through the provided `oa` client.',
    // STATIC tool list (not "dynamic"): the whole point is that a crawler can
    // read the tools without authenticating; the defs embed this instance's
    // real resource caps.
    tools: [
      searchDocsTool,
      executeTool(config.limits, sandboxFacts(config)),
    ].map(toolEntry),
    resources: [],
    prompts: [],
  };
}
