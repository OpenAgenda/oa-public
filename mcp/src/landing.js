// Human-facing landing page for the MCP server root (`GET /`). The MCP protocol
// endpoint lives at `POST /mcp` (Streamable HTTP); serving it off the root frees
// the subdomain root for a page a browser visitor — or a dev pasting the URL —
// actually wants, instead of the bare 401/JSON-RPC challenge the protocol
// endpoint returns. Plain string template, no framework: this package ships no
// view layer and the page is static but for the injected endpoint URL.

import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';
import pkg from '../package.json' with { type: 'json' };

// One-click Claude Desktop bundle for the LOCAL (API-key) path — pinned to this
// server's version, whose release uploads the asset (see release.yml). The tag
// is scoped (@openagenda/mcp@x); encoded as GitHub serves it: @ → %40, the slash
// stays literal.
const MCPB_URL = `https://github.com/OpenAgenda/oa-public/releases/download/%40openagenda/mcp%40${pkg.version}/openagenda.mcpb`;

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

/**
 * Render the landing page.
 *
 * @param {object} oauth - the resolved OAuth config (config.oauth).
 * @param {string} oauth.resourceUrl - the MCP endpoint / OAuth resource (they
 *   coincide: the URL a client is configured with is bound as the token audience).
 * @returns {string} a complete HTML document.
 */
export function landingPage({ resourceUrl }) {
  const endpoint = escapeHtml(resourceUrl);
  const prm = escapeHtml(
    getOAuthProtectedResourceMetadataUrl(new URL(resourceUrl)),
  );
  // One-click "install" deep links. Cursor and LM Studio take a base64 config,
  // the VS Code ones a URL-encoded one; all carry just the remote endpoint
  // (every target runs the OAuth flow itself on first connect).
  const cursorInstall = escapeHtml(
    `cursor://anysphere.cursor-deeplink/mcp/install?name=openagenda&config=${Buffer.from(
      JSON.stringify({ url: resourceUrl }),
    ).toString('base64')}`,
  );
  const vscodeInstall = escapeHtml(
    `https://vscode.dev/redirect/mcp/install?name=openagenda&config=${encodeURIComponent(
      JSON.stringify({ type: 'http', url: resourceUrl }),
    )}`,
  );
  const vscodeInsidersInstall = escapeHtml(
    `https://insiders.vscode.dev/redirect/mcp/install?name=openagenda&config=${encodeURIComponent(
      JSON.stringify({ type: 'http', url: resourceUrl }),
    )}&quality=insiders`,
  );
  const lmStudioInstall = escapeHtml(
    `lmstudio://add_mcp?name=openagenda&config=${Buffer.from(
      JSON.stringify({ url: resourceUrl }),
    ).toString('base64')}`,
  );
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>OpenAgenda MCP</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 2rem;
    font: 16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    background: Canvas;
    color: CanvasText;
  }
  main { max-width: 42rem; width: 100%; }
  h1 { font-size: 1.6rem; margin: 0 0 .25rem; }
  .lede { margin: 0 0 1.75rem; opacity: .8; }
  h2 { font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; opacity: .6; margin: 1.75rem 0 .5rem; }
  pre {
    margin: 0;
    padding: .85rem 1rem;
    border-radius: .5rem;
    background: color-mix(in srgb, CanvasText 8%, Canvas);
    overflow-x: auto;
  }
  code { font: .9em ui-monospace, SFMono-Regular, Menlo, monospace; }
  p { margin: .5rem 0; }
  a { color: LinkText; }
  a.btn {
    display: inline-block;
    margin: .35rem 0;
    padding: .5rem .9rem;
    border-radius: .5rem;
    background: color-mix(in srgb, CanvasText 10%, Canvas);
    text-decoration: none;
    font-weight: 600;
  }
  footer { margin-top: 2rem; font-size: .85rem; opacity: .55; }
</style>
</head>
<body>
<main>
  <h1>OpenAgenda MCP</h1>
  <p class="lede">A Model Context Protocol server for the OpenAgenda API — run sandboxed code against your agendas, authenticated with your OpenAgenda account.</p>

  <h2>Claude Code</h2>
  <pre><code>claude mcp add --transport http openagenda ${endpoint}</code></pre>
  <p>Then run <code>/mcp</code> and authenticate in your browser.</p>

  <h2>Claude Desktop &amp; claude.ai</h2>
  <p>Settings → Connectors → <em>Add custom connector</em> → paste <code>${endpoint}</code>.</p>

  <h2>Cursor</h2>
  <p><a class="btn" href="${cursorInstall}">Add to Cursor</a></p>
  <pre><code>{
  "mcpServers": {
    "openagenda": { "url": "${endpoint}" }
  }
}</code></pre>
  <p>In <code>~/.cursor/mcp.json</code> (or your project's <code>.cursor/mcp.json</code>).</p>

  <h2>VS Code</h2>
  <p><a class="btn" href="${vscodeInstall}">Install in VS Code</a> <a class="btn" href="${vscodeInsidersInstall}">VS Code Insiders</a></p>
  <pre><code>code --add-mcp '{"name":"openagenda","type":"http","url":"${endpoint}"}'</code></pre>

  <h2>LM Studio</h2>
  <p><a class="btn" href="${lmStudioInstall}">Add to LM Studio</a></p>
  <p>Opens LM Studio and runs the OAuth flow in your browser on first connect.</p>

  <h2>Any other client</h2>
  <p>The protocol endpoint is <code>POST ${endpoint}</code> (Streamable HTTP), protected by OAuth 2.1 — your OpenAgenda account, browser consent on first connection. Discovery: <a href="${prm}">protected resource metadata</a>.</p>

  <h2>Self-host / local</h2>
  <p>The server is open source and on npm: <code>OA_API_KEY=… npx -y @openagenda/mcp</code> speaks MCP over stdio against the public API with your API key. Source, docs and threat model: <a href="https://github.com/OpenAgenda/oa-public">github.com/OpenAgenda/oa-public</a> · <a href="https://www.npmjs.com/package/@openagenda/mcp">npm</a>.</p>
  <p><strong>Claude Desktop, one-click</strong> — the local path, packaged: <a class="btn" href="${MCPB_URL}">Download openagenda.mcpb</a><br>Double-click it (or drag it into Settings); Desktop runs the npx server above and prompts for your API key. Prefer no key? Use the hosted connector above instead.</p>

  <footer><a href="https://openagenda.com">openagenda.com</a></footer>
</main>
</body>
</html>
`;
}
