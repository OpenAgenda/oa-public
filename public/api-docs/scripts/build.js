// Builds the static Scalar API reference for the OpenAgenda v3 API.
//
// The OpenAPI contract in @openagenda/api-spec is the single source of truth.
// This script is the third consumer of that file (alongside the generated SDK
// and the MCP server): it never edits the contract, only renders it.
//
// Output: a self-contained dist/ — index.html references a vendored copy of
// Scalar's standalone bundle and inlines the spec, so it renders from a static
// host (and even from file://) with no CDN or network dependency at runtime.

import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const distDir = join(pkgRoot, 'dist');

// Resolve inputs from the workspace rather than hard-coded paths.
const specPath = require.resolve('@openagenda/api-spec/openapi.yaml');
// @scalar/api-reference exposes neither its package.json nor the standalone
// build via its exports map, so derive the package root from the main entry
// (.../dist/index.js) and reach the vendored bundle from there.
const scalarMain = require.resolve('@scalar/api-reference');
const scalarRoot = dirname(dirname(scalarMain));
const standalonePath = join(scalarRoot, 'dist/browser/standalone.js');
// Favicon: the OpenAgenda colour picto, vendored into the package (kept
// self-contained, like the spec and the runtime) and copied into dist/.
const faviconPath = join(pkgRoot, 'oa-picto.svg');

// Brand fonts: Noto Sans (body) + Ubuntu Sans (headings), matching the
// OpenAgenda Next app (which loads the same two via next/font). Self-hosted
// from @fontsource — latin subset, variable weight axis, upright + italic — and
// vendored into dist/fonts/, so the page keeps the same zero-CDN posture as the
// vendored Scalar runtime (next/font self-hosts these the same way).
const fonts = [
  {
    pkg: '@fontsource-variable/ubuntu-sans',
    family: 'Ubuntu Sans Variable',
    weight: '100 800',
  },
  {
    pkg: '@fontsource-variable/noto-sans',
    family: 'Noto Sans Variable',
    weight: '100 900',
  },
].flatMap(({ pkg, family, weight }) =>
  [
    ['normal', 'wght-normal'],
    ['italic', 'wght-italic'],
  ].map(([style, axis]) => {
    const file = `${pkg.split('/')[1]}-latin-${axis}.woff2`;
    const src = join(
      dirname(require.resolve(`${pkg}/package.json`)),
      'files',
      file,
    );
    return { src, file, family, weight, style };
  }));

const spec = readFileSync(specPath, 'utf8');

// Target environment for the playground. The doc is built PER environment: a
// single static bundle can't switch the OAuth authorization server at runtime
// (Scalar substitutes variables into request URLs only, never into the OAuth
// authorize/token endpoints), so everything below is baked from one env and
// stays internally consistent — API base, authorization server and resource all
// match. Defaults to production; CI sets OA_DOCS_ENV=dev for the staging build.
const ENVIRONMENTS = {
  prod: {
    label: 'Production',
    apiServer: 'https://api.openagenda.com/v3',
    authorizeUrl: 'https://openagenda.com/api/auth/oauth2/authorize',
    tokenUrl: 'https://openagenda.com/api/auth/oauth2/token',
    resource: 'https://api.openagenda.com/v3',
  },
  dev: {
    label: 'Development',
    apiServer: 'https://dapi.openagenda.com/v3',
    authorizeUrl: 'https://d.openagenda.com/api/auth/oauth2/authorize',
    tokenUrl: 'https://d.openagenda.com/api/auth/oauth2/token',
    resource: 'https://dapi.openagenda.com/v3',
  },
};
const envName = process.env.OA_DOCS_ENV || 'prod';
const env = ENVIRONMENTS[envName];
if (!env) {
  // Fail loud rather than silently building a prod-bound bundle for a typo'd
  // env — that would point the dev docs' OAuth + Test-Request at production.
  throw new Error(
    `OA_DOCS_ENV="${envName}" must be one of: ${Object.keys(ENVIRONMENTS).join(', ')}`,
  );
}

// Public OAuth client the playground drives the authorization-code + PKCE flow
// with. It must be registered on the target authorization server with this exact
// client_id, no secret, `require_pkce`, and a redirect URI matching the docs
// origin, then added to NEXT_VERIFIED_OAUTH_CLIENT_IDS so the consent screen
// drops the "unverified app" warning.
const oauthClientId = process.env.OA_DOCS_OAUTH_CLIENT_ID || 'oa-api-docs';

// Per-env endpoints, each overridable one-off. authorizeUrl/tokenUrl drive the
// OAuth flow; apiServer is the single server "Test Request" hits; v3Resource is
// the RFC 8707 resource indicator carried on both OAuth legs so the AS issues a
// JWS `aud=v3` the resource server verifies offline (not a stray opaque token).
const apiServer = process.env.OA_DOCS_API_SERVER || env.apiServer;
const authorizeUrl = process.env.OA_DOCS_OAUTH_AUTHORIZE_URL || env.authorizeUrl;
const tokenUrl = process.env.OA_DOCS_OAUTH_TOKEN_URL || env.tokenUrl;
const v3Resource = process.env.OA_DOCS_V3_RESOURCE || env.resource;

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

// Vendor the Scalar runtime, a downloadable copy of the contract, and the favicon.
copyFileSync(standalonePath, join(distDir, 'standalone.js'));
copyFileSync(specPath, join(distDir, 'openapi.yaml'));
copyFileSync(faviconPath, join(distDir, 'oa-picto.svg'));

// Vendor the brand fonts alongside, served from dist/fonts/ (see brandCss).
const fontDir = join(distDir, 'fonts');
mkdirSync(fontDir, { recursive: true });
for (const f of fonts) copyFileSync(f.src, join(fontDir, f.file));

// Brand the reference with the OpenAgenda accent and the same fonts as the Next
// app: Noto Sans for body/UI (--scalar-font), Ubuntu Sans for headings. Both are
// self-hosted from dist/fonts/ — with `withDefaultFonts:false` this also stops
// Scalar's bundle from fetching Inter/JetBrains Mono from fonts.scalar.com at
// runtime (the whole point of vendoring the JS was zero CDN egress). Code stays
// on a system monospace stack (neither brand font is monospaced).
const fontFaceCss = fonts
  .map(
    (f) => `
  @font-face {
    font-family: '${f.family}';
    font-style: ${f.style};
    font-weight: ${f.weight};
    font-display: swap;
    src: url('./fonts/${f.file}') format('woff2-variations');
  }`,
  )
  .join('\n');

const brandCss = `${fontFaceCss}
  :root {
    --scalar-font: 'Noto Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --scalar-font-code: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Ubuntu Sans Variable', var(--scalar-font);
  }
  .light-mode {
    --scalar-color-accent: #1D77CE;
    --scalar-color-accent-hover: #1A6BB9;
  }
  .dark-mode {
    --scalar-color-accent: #4A9EE8;
    --scalar-color-accent-hover: #6BB2EF;
  }
`;

// Inline the spec as a JS string literal — avoids a runtime fetch (keeps the
// page openable from file://) and side-steps YAML parsing in the browser by
// letting Scalar parse the raw document.
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OpenAgenda API — Reference</title>
    <link rel="icon" type="image/svg+xml" href="./oa-picto.svg" />
    <style>
      body { margin: 0; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script src="./standalone.js"></script>
    <script>
      Scalar.createApiReference('#app', {
        content: ${JSON.stringify(spec)},
        theme: 'default',
        favicon: './oa-picto.svg',
        // Don't pull Inter/JetBrains Mono from fonts.scalar.com at runtime; use
        // the system stack from brandCss (keeps the page zero-CDN, like the JS).
        withDefaultFonts: false,
        customCss: ${JSON.stringify(brandCss)},
        metaData: {
          title: 'OpenAgenda API — Reference',
          description: 'Interactive reference for the OpenAgenda v3 API — agendas, events and locations.',
          ogTitle: 'OpenAgenda API — Reference',
          ogDescription: 'Interactive reference for the OpenAgenda v3 API — agendas, events and locations.',
          twitterCard: 'summary_large_image',
        },
        // Public docs: no usage telemetry, no built-in dev tools panel.
        telemetry: false,
        showDeveloperTools: 'never',
        // Disable the built-in AI agent/chat. Beyond being out of scope, on load
        // it calls api.scalar.com/vector/registry (curated docs + embeddings) —
        // a runtime egress we vendored the bundle specifically to avoid.
        agent: { disabled: true },
        // Send "Test Request" calls straight to the API — never through
        // Scalar's hosted CORS proxy. The v3 API is authenticated; routing a
        // request (and its Authorization header / OAuth token) through a third
        // party is unacceptable. This requires the API to send its own CORS
        // headers for the docs origin (see the api-docs README).
        proxyUrl: '',
        // One server: the env this bundle was built for. Avoids a selector that
        // could point "Test Request" at prod while the OAuth token is dev-bound
        // (the auth leg is baked, not switchable at runtime).
        servers: [{ url: ${JSON.stringify(apiServer)}, description: ${JSON.stringify(env.label)} }],
        // Persist the playground's auth (OAuth token / API key) to localStorage
        // so a page refresh doesn't drop it. Tradeoff: the token lives in
        // localStorage on a public origin. Acceptable here — the origin is a
        // static, zero-egress bundle (agent/telemetry/proxy all off, minimal XSS
        // surface), the client is public + PKCE, and the scopes are read-only
        // with a short-lived token. The UX win (no re-auth per refresh)
        // outweighs the residual risk on this surface.
        persistAuth: true,
        authentication: {
          // bearerAuth (a publishable oa_pk_ key) stays the zero-friction
          // default; oauth2 is fully wired below for the interactive flow.
          securitySchemes: {
            oauth2: {
              flows: {
                authorizationCode: {
                  // Per-env OAuth endpoints (baked at build, see OA_DOCS_ENV) —
                  // override the contract's production URLs for a dev build.
                  authorizationUrl: ${JSON.stringify(authorizeUrl)},
                  tokenUrl: ${JSON.stringify(tokenUrl)},
                  refreshUrl: ${JSON.stringify(tokenUrl)},
                  'x-scalar-client-id': ${JSON.stringify(oauthClientId)},
                  // OAuth 2.1 — the AS mandates PKCE (S256) for this public client.
                  'x-usePkce': 'SHA-256',
                  // Pre-tick the read scopes the current (read-only) surface uses.
                  selectedScopes: ['agendas:read', 'events:read', 'locations:read', 'me:read'],
                  // RFC 8707 — carry the resource indicator on both legs so the
                  // issued token is a JWS bound to aud=v3 (offline-verified),
                  // not an unbound opaque token the API rejects as a stray key.
                  'x-scalar-security-query': { resource: ${JSON.stringify(v3Resource)} },
                  'x-scalar-security-body': { resource: ${JSON.stringify(v3Resource)} },
                },
              },
            },
          },
        },
        // No defaultHttpClient: pinning one (e.g. js/fetch) suppresses the
        // example-first view and would imply the wrong client anyway — the TS
        // SDK uses ky, which httpsnippet can't render. The SDK is featured via
        // x-scalar-sdk-installation; the per-operation snippet panel stays on
        // Scalar's neutral default for ad-hoc HTTP.
        // No hiddenClients either: this Scalar build's default snippet menu is
        // already sane (shell, js, node, python, php, go, ruby, rust, dart, f#)
        // with no exotic noise, so a denylist would hide nothing and only rot as
        // Scalar's defaults shift.
        // One downloadable format — the YAML contract we already vendor.
        documentDownloadType: 'yaml',
        modelsSectionLabel: 'Schemas',
        mcp: {
          name: 'OpenAgenda',
          url: 'https://mcp.openagenda.com/mcp',
        }
      });
    </script>
  </body>
</html>
`;

writeFileSync(join(distDir, 'index.html'), html);

const bytes = Buffer.byteLength(html);
console.log(
  `api-docs: built dist/ from ${specPath.replace(`${pkgRoot}/`, '')}`,
);
console.log(`  dist/index.html      ${(bytes / 1024).toFixed(1)} KiB`);
console.log('  dist/standalone.js   (vendored Scalar runtime)');
console.log('  dist/openapi.yaml    (downloadable contract)');
