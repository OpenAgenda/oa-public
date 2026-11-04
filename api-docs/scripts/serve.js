// Minimal server for previewing the built docs locally:
//   yarn build && yarn preview
// Not used in production: cibul-node serves dist/ at the base address of the
// API (api-v3/lib/docs.js). This server mirrors that layout.

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const filesDir = join(distDir, '_docs');
const specPath = createRequire(import.meta.url).resolve(
  '@openagenda/api-spec/openapi.yaml',
);
const port = Number(process.env.PORT) || 4321;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

if (!existsSync(join(distDir, 'index.html'))) {
  console.error('api-docs: dist/ is empty — run `yarn build` first.');
  process.exit(1);
}

createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch {
    // Malformed percent-encoding (e.g. `/%`) — decodeURIComponent throws.
    res.writeHead(400).end('Bad request');
    return;
  }
  // The layout the API serves: the files under `…/_docs/`, the contract at
  // `…/openapi.yaml`, the page at any other address (the API base, /v3 in
  // production).
  const at = urlPath.indexOf('/_docs/');
  let filePath = join(distDir, 'index.html');
  if (at !== -1) {
    filePath = join(filesDir, normalize(urlPath.slice(at + '/_docs/'.length)));
    if (!filePath.startsWith(`${filesDir}/`)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
  } else if (urlPath.endsWith('/openapi.yaml')) {
    filePath = specPath;
  }
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404).end('Not found');
    return;
  }
  res.writeHead(200, {
    'content-type': types[extname(filePath)] || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(res);
}).listen(port, () => {
  console.log(`api-docs: serving dist/ at http://localhost:${port}/v3`);
});
