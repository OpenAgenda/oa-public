import { defineConfig } from '@hey-api/openapi-ts';

// Generates the OpenAgenda v3 client from the contract in @openagenda/api-spec.
// Output is COMMITTED (src/generated/) and regenerated via `yarn generate`.
// `yarn generate:check` regenerates and fails on any drift from the spec — wire
// it into CI to keep the committed output reproducible (not yet enforced in CI).
//
// ky client: chosen for direct SDK consumers — built-in retry, HTTPError, hooks
// and timeout, and it matches the repo's standard HTTP client. The generated
// code imports `ky` (pure-fetch under the hood); when the MCP runs it inside the
// sandbox, ky gets bundled into the injected program (separate MCP wiring step).
//
// No post-processing: generated code is left as Hey API emits it. It is not
// hand-written, so the repo's prettier/eslint rules don't apply — eslint in
// particular flags structural patterns it can't auto-fix (no-shadow,
// no-explicit-any in the codegen output). src/generated is eslint-ignored and
// prettier-ignored (repo convention, cf. packages/strapi's /types/generated),
// and committed verbatim so `yarn generate` stays reproducible.
export default defineConfig({
  input: '../api-spec/openapi.yaml',
  output: {
    path: 'src/generated',
  },
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/sdk',
      // Single instance class `OpenAgenda` whose nested methods are derived from
      // the dotted operationIds (agendas.events.list → oa.agendas.events.list).
      // paramsStructure stays the default 'grouped' ({ path, query }): safer than
      // 'flat' as the API grows (no path/query/body/reserved-key collisions).
      operations: {
        strategy: 'single',
        containerName: 'OpenAgenda',
        methods: 'instance',
      },
    },
    '@hey-api/client-ky',
    // zod validators for payloads. KNOWN LIMITATION: the plugin renders a
    // multipart `format: binary` body field as `z.string()` (e.g.
    // `zAgendasUploadsCreateBody.file`), whereas the typescript plugin correctly
    // types it `Blob | File` in types.gen.ts. There is no option to map binary →
    // `z.instanceof(Blob)` in this plugin version, and we do NOT hand-patch the
    // generated output (it must stay reproducible under `yarn generate:check`).
    // Consequence: do NOT validate an upload's multipart body with the generated
    // zod schema — it would reject a valid Blob/File. The SDK method signature
    // (types.gen.ts, `Blob | File`) is authoritative for the multipart body, and
    // the server validates the bytes itself (multer + content-type detection);
    // there is nothing meaningful to assert about binary content in zod anyway.
    'zod',
  ],
});
