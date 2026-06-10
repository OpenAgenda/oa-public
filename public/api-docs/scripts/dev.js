// Dev loop: build the docs, serve dist/, and rebuild when the contract or the
// build script changes. Uses our build.js (so the served page matches what
// ships — playground config, vendored runtime, resource binding), unlike a raw
// `scalar reference` preview. No extra dependency: just child_process + fs.watch.
//
//   yarn workspace @openagenda/api-docs dev
// Honours OA_DOCS_V3_RESOURCE / OA_DOCS_OAUTH_CLIENT_ID like build.js does.

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { watch } from 'node:fs';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const buildScript = join(here, 'build.js');
const specPath = require.resolve('@openagenda/api-spec/openapi.yaml');

function build() {
  return new Promise((resolve, reject) => {
    spawn(process.execPath, [buildScript], {
      stdio: 'inherit',
      env: process.env,
    })
      .on('error', reject)
      .on('exit', (code) =>
        (code === 0
          ? resolve()
          : reject(new Error(`build.js exited with code ${code}`))));
  });
}

await build().catch((err) => {
  console.error(`api-docs: initial build failed — ${err.message}`);
  process.exit(1);
});

// Serve dist/ for the lifetime of the dev session.
const server = spawn(process.execPath, [join(here, 'serve.js')], {
  stdio: 'inherit',
  env: process.env,
});

// Debounced rebuild on contract / build-script edits. Refresh the browser to
// pick up the new dist/index.html.
let pending;
function scheduleRebuild(file) {
  clearTimeout(pending);
  pending = setTimeout(() => {
    console.log(`api-docs: ${file} changed — rebuilding…`);
    build().catch((err) =>
      console.error(`api-docs: rebuild failed — ${err.message}`));
  }, 150);
}

watch(specPath, () => scheduleRebuild('openapi.yaml'));
watch(buildScript, () => scheduleRebuild('build.js'));

const stop = () => {
  server.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
