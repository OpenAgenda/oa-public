// Builds the static Scalar API reference for the OpenAgenda v3 API.
//
// The OpenAPI contract in @openagenda/api-spec is the single source of truth.
// This script is the third consumer of that file (alongside the generated SDK
// and the MCP server): it never edits the contract, only renders it.
//
// Output, for cibul-node to serve at the base address of the API (see
// `assetBase` below), not for a static host:
//   dist/index.html  the page;
//   dist/docs.json   the environment it was built for, which cibul-node checks
//                    against its own before serving it;
//   dist/_docs/      what the page loads: the vendored Scalar runtime, the
//                    configuration (reference.js), the favicon and the fonts,
//                    named after their content so they cache for good, the
//                    scripts precompressed (.br, .gz).
// The page reads the contract the API publishes next to it (/v3/openapi.yaml),
// and contacts no CDN or third party at runtime.

import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

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
// The ESM build of the runtime: an entry that imports the rest from chunks/
// as the page needs it (the API client, the agent drawer, the code samples),
// about 0.1 MiB compressed at first load instead of 1 MiB for the classic
// bundle. Scalar names the chunks after their content already.
const runtimeEntryPath = join(scalarRoot, 'dist/browser/standalone.esm.js');
const runtimeChunksDir = join(scalarRoot, 'dist/browser/chunks');
// Favicon: the OpenAgenda colour picto, vendored into the package (kept
// self-contained, like the spec and the runtime) and copied into dist/.
const faviconPath = join(pkgRoot, 'oa-picto.svg');

// Brand fonts: Noto Sans (body) + Ubuntu Sans (headings), matching the
// OpenAgenda Next app (which loads the same two via next/font). Self-hosted
// from @fontsource — latin subset, variable weight axis, upright + italic — and
// vendored into dist/_docs/fonts/, so the page keeps the same zero-CDN posture as the
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

// Target environment for the playground. The doc is built PER environment: a
// single static bundle can't switch the OAuth authorization server at runtime
// (Scalar substitutes variables into request URLs only, never into the OAuth
// authorize/token endpoints), so everything below is baked from one env and
// stays internally consistent — API base, authorization server and resource all
// match. Defaults to production: another deployment sets OA_DOCS_ENV, and
// cibul-node serves no page built for an environment that is not its own.
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

// The reference is served at the base address of the API it documents: the API
// answers a browser there with this page (cibul-node, api-v3/lib/docs.js). Its
// files live under `_docs/` below that address, a path no API resource takes;
// they are referenced by absolute path, since the page address has no trailing
// slash and a relative path would resolve from the root of the host.
const docsUrl = apiServer;
const assetBase = `${new URL(docsUrl).pathname.replace(/\/$/, '')}/_docs/`;

rmSync(distDir, { recursive: true, force: true });
const filesDir = join(distDir, '_docs');
mkdirSync(join(filesDir, 'fonts'), { recursive: true });

// Writes a file of dist/_docs; a script is also written precompressed (.br,
// .gz), as the API serves it with no compression of its own.
const write = (path, content, { compress = false } = {}) => {
  writeFileSync(path, content);
  if (compress) {
    writeFileSync(
      `${path}.br`,
      brotliCompressSync(content, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
      }),
    );
    writeFileSync(`${path}.gz`, gzipSync(content, { level: 9 }));
  }
};

// Writes a file the page loads under a name that carries its content
// (`scalar.3f2a9c41d0.js`), so it is cached for good and a new build is a new
// address. Returns the address the page uses.
const emit = (name, content, options) => {
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 10);
  const ext = extname(name);
  const hashed = `${name.slice(0, -ext.length)}.${hash}${ext}`;
  write(join(filesDir, hashed), content, options);
  return `${assetBase}${hashed}`;
};

// The vendored source maps stay out: nothing serves them.
const withoutSourceMap = (code) =>
  code.toString().replace(/\n\/\/# sourceMappingURL=\S+\s*$/, '\n');

// The runtime: its chunks keep their names, which the entry imports them by
// (./chunks/…) and which already carry their content; the entry sits next to
// chunks/ under a name of ours.
mkdirSync(join(filesDir, 'chunks'));
const chunkNames = readdirSync(runtimeChunksDir).filter((n) =>
  n.endsWith('.js'));
for (const name of chunkNames) {
  write(
    join(filesDir, 'chunks', name),
    withoutSourceMap(readFileSync(join(runtimeChunksDir, name))),
    { compress: true },
  );
}
const runtimeUrl = emit(
  'scalar.js',
  withoutSourceMap(readFileSync(runtimeEntryPath)),
  { compress: true },
);

// The favicon and the brand fonts (see brandCss).
const faviconUrl = emit('oa-picto.svg', readFileSync(faviconPath));
const fontUrls = new Map(
  fonts.map((f) => [f.file, emit(`fonts/${f.file}`, readFileSync(f.src))]),
);

// Brand the reference with the OpenAgenda accent and the same fonts as the Next
// app: Noto Sans for body/UI (--scalar-font), Ubuntu Sans for headings. Both are
// self-hosted from dist/_docs/fonts/ — with `withDefaultFonts:false` this also stops
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
    src: url('${fontUrls.get(f.file)}') format('woff2-variations');
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

// The contract is read from the address the API publishes it at, on this
// origin: the download link of the page leads there, to the file itself, and
// the contract is cached apart from this configuration.
const specUrl = `${new URL(docsUrl).pathname.replace(/\/$/, '')}/openapi.yaml`;
const reference = `import { createApiReference } from ${JSON.stringify(runtimeUrl)};

createApiReference('#app', {
        url: ${JSON.stringify(specUrl)},
        theme: 'default',
        favicon: ${JSON.stringify(faviconUrl)},
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
        // party is unacceptable. The page is served by the API it documents,
        // so these calls are same-origin and need no CORS.
        proxyUrl: '',
        // One server: the env this bundle was built for. Avoids a selector that
        // could point "Test Request" at prod while the OAuth token is dev-bound
        // (the auth leg is baked, not switchable at runtime).
        servers: [{ url: ${JSON.stringify(apiServer)}, description: ${JSON.stringify(env.label)} }],
        // Persist the playground's auth (OAuth token / API key) to localStorage
        // so a page refresh doesn't drop it. Tradeoff: the token lives in the
        // localStorage of the API origin, readable by any script that origin
        // runs. Acceptable here: everything else the origin serves is JSON, this
        // page is its only HTML and runs only its own files (script-src 'self',
        // agent/telemetry/proxy off), the client is public + PKCE, and the token
        // is short-lived, read-only, with no refresh token (no offline_access).
        // The UX win (no re-auth per refresh) outweighs the residual risk.
        persistAuth: true,
        authentication: {
          // Which credential the page offers first. Left to the contract it
          // would be the first entry of the root security list (publicKey), and
          // a reader would have to go and find a key in their settings before
          // the first try. oauth2 signs them in with the account they already
          // have, in one click, and the flow is fully wired below. No backtick
          // in this comment: the whole config is a template literal.
          preferredSecurityScheme: 'oauth2',
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
                  // The one address the client registers: Scalar would otherwise
                  // take the address in the bar, and /v3/ is not /v3.
                  'x-scalar-redirect-uri': ${JSON.stringify(docsUrl)},
                  // OAuth 2.1 — the AS mandates PKCE (S256) for this public client.
                  'x-usePkce': 'SHA-256',
                  // Pre-tick every scope the oa-api-docs client may request
                  // (its scopes column in oauth_client, the ceiling the server
                  // enforces): the read surface and geocoding. One click gives
                  // a token every read operation accepts; writes stay out, the
                  // playground runs against real data.
                  selectedScopes: ['agendas:read', 'events:read', 'locations:read', 'me:read', 'geocoding:use'],
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
        // The download link leads to the published contract itself, not to a
        // copy Scalar would serialize again in the browser.
        documentDownloadType: 'direct',
        modelsSectionLabel: 'Schemas',
        mcp: {
          name: 'OpenAgenda',
          url: 'https://mcp.openagenda.com/mcp',
        }
      });
`;

const referenceUrl = emit('reference.js', reference, { compress: true });

// The page holds no script of its own: its configuration is reference.js, a
// module that imports the runtime, so the page runs under a policy that allows
// scripts from its own origin only (no inline script, no nonce). Without
// JavaScript, it points to the contract and the MCP server, which are what a
// crawler or an assistant reading the page can use.
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OpenAgenda API — Reference</title>
    <link rel="canonical" href="${docsUrl}" />
    <link rel="icon" type="image/svg+xml" href="${faviconUrl}" />
    <link rel="alternate" type="application/yaml" title="OpenAPI 3.1 contract" href="${specUrl}" />
    <link rel="modulepreload" href="${runtimeUrl}" />
    <style>
      body { margin: 0; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <noscript>
      <p>
        This reference needs JavaScript. The OpenAPI 3.1 contract it renders is
        at <a href="${specUrl}">${docsUrl}/openapi.yaml</a>, and AI assistants
        reach the API through the OpenAgenda MCP server,
        <a href="https://mcp.openagenda.com">mcp.openagenda.com</a>.
      </p>
    </noscript>
    <script type="module" src="${referenceUrl}"></script>
  </body>
</html>
`;

writeFileSync(join(distDir, 'index.html'), html);
writeFileSync(
  join(distDir, 'docs.json'),
  `${JSON.stringify({ docsUrl, apiServer, authorizeUrl, tokenUrl }, null, 2)}\n`,
);

console.log(
  `api-docs: built dist/ from ${specPath.replace(`${pkgRoot}/`, '')}, for ${docsUrl}`,
);
console.log('  dist/index.html   the page');
console.log('  dist/docs.json    the environment it was built for');
console.log(`  dist/_docs/       served under ${assetBase}:`);
console.log(`    chunks/ (${chunkNames.length} chunks of the runtime)`);
for (const url of [
  runtimeUrl,
  referenceUrl,
  faviconUrl,
  ...fontUrls.values(),
]) {
  console.log(`    ${url.slice(assetBase.length)}`);
}
