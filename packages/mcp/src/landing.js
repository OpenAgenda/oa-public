// Human-facing landing page for the MCP server root (`GET /`). The MCP protocol
// endpoint lives at `POST /mcp` (Streamable HTTP); serving it off the root frees
// the subdomain root for a page a browser visitor — or a dev pasting the URL —
// actually wants, instead of the bare 401/JSON-RPC challenge the protocol
// endpoint returns. Plain string template, no framework: this package ships no
// view layer and the page is static but for the injected endpoint URL.

import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';

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
  footer { margin-top: 2rem; font-size: .85rem; opacity: .55; }
</style>
</head>
<body>
<main>
  <h1>OpenAgenda MCP</h1>
  <p class="lede">A Model Context Protocol server for the OpenAgenda API — run sandboxed code against your agendas, authenticated with your OpenAgenda account.</p>

  <h2>Add it to Claude Code</h2>
  <pre><code>claude mcp add --transport http openagenda ${endpoint}</code></pre>
  <p>Then run <code>/mcp</code> and authenticate in your browser.</p>

  <h2>Endpoint</h2>
  <p>The protocol endpoint is <code>POST ${endpoint}</code> (Streamable HTTP), protected by OAuth 2.1. Discovery: <a href="${prm}">protected resource metadata</a>.</p>

  <footer><a href="https://openagenda.com">openagenda.com</a></footer>
</main>
</body>
</html>
`;
}
