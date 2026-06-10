// Public entry point for @openagenda/api-client.
//
// Everything under ./generated is produced by Hey API from @openagenda/api-spec
// (run `yarn generate`); do not edit it by hand. This file is the curated, stable
// surface — import from the package root, not from generated paths.

// The SDK: the `OpenAgenda` instance class (with its nested resource classes
// Agendas/Events) and every request/response type.
export * from './generated';

// Client plumbing. `client` is the shared singleton — configure it once with
// `client.setConfig({ auth })` for simple, single-account use. `createClient`
// builds isolated instances (e.g. a per-tenant baseUrl/auth) to pass as
// `new OpenAgenda({ client })`.
export { client } from './generated/client.gen';
export type { CreateClientConfig } from './generated/client.gen';
export { createClient } from './generated/client';

// zod validators (all prefixed z…), as a namespace to keep the root surface clean.
export * as schemas from './generated/zod.gen';
